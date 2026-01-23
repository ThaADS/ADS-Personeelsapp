/**
 * API route voor werknemers beheer
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { maskSensitiveData, getAllowedFieldsForRole } from "@/lib/security/data-masking";
import { logSensitiveDataAccess } from "@/lib/security/sensitive-data-audit";
import { checkRateLimit, rateLimitedResponse } from "@/lib/security/rate-limiter";
import {
  validateCreateEmployee,
  createValidationErrorResponse,
  type CreateEmployeeInput,
} from "@/lib/validation/employee-schemas";

/**
 * GET /api/employees
 * Haalt alle werknemers op binnen de huidige tenant
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting check - sensitive type: 30 req/min
    const rateLimitResult = await checkRateLimit(request, 'sensitive');
    if (!rateLimitResult.success) {
      return rateLimitedResponse(rateLimitResult);
    }

    const context = await getTenantContext();

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    if (!context.tenantId) {
      return NextResponse.json({ error: "Geen tenant geselecteerd" }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const role = searchParams.get('role') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      tenantId: context.tenantId,
      isActive: true,
    };

    if (role) {
      whereClause.role = role;
    }

    // Fetch employees (TenantUsers with User data and employee record)
    const employees = await prisma.tenantUser.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            department: true,
            position: true,
            employeeId: true,
            startDate: true,
            contractType: true,
            workHoursPerWeek: true,
            createdAt: true,
            // Additional personal details
            dateOfBirth: true,
            gender: true,
            nationality: true,
            maritalStatus: true,
            // Address
            address: true,
            city: true,
            postalCode: true,
            // Employee record
            employees: {
              select: {
                id: true,
                employee_number: true,
                position: true,
                contract_type: true,
                hours_per_week: true,
                start_date: true,
                end_date: true,
                phone_number: true,
                emergency_contact: true,
                emergency_phone: true,
                emergency_relationship: true,
                hourly_rate: true,
                manager_id: true,
                cost_center: true,
                skills: true,
                certifications: true,
                education_level: true,
                languages: true,
                remote_work_allowed: true,
                work_location: true,
                notes: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Apply search and department filter in memory (since these are on the User model)
    let filteredEmployees = employees;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEmployees = filteredEmployees.filter((emp) =>
        emp.user.name?.toLowerCase().includes(searchLower) ||
        emp.user.email?.toLowerCase().includes(searchLower) ||
        emp.user.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    if (department) {
      filteredEmployees = filteredEmployees.filter((emp) =>
        emp.user.department === department
      );
    }

    // Get total count for pagination
    const totalCount = await prisma.tenantUser.count({
      where: {
        tenantId: context.tenantId,
        isActive: true,
      },
    });

    // Get unique departments for filter dropdown
    const allEmployees = await prisma.tenantUser.findMany({
      where: {
        tenantId: context.tenantId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            department: true,
          },
        },
      },
    });

    const departments = [...new Set(
      allEmployees
        .map((emp) => emp.user.department)
        .filter((dept): dept is string => dept !== null && dept !== '')
    )].sort();

    // Transform to response format
    const formattedEmployees = filteredEmployees.map((emp) => {
      const employeeRecord = emp.user.employees;
      return {
        id: emp.id,
        tenantId: emp.tenantId,
        userId: emp.userId,
        role: emp.role,
        isActive: emp.isActive,
        // User details
        name: emp.user.name,
        email: emp.user.email,
        image: emp.user.image,
        phone: emp.user.phone || employeeRecord?.phone_number || null,
        department: emp.user.department,
        position: emp.user.position || employeeRecord?.position || null,
        employeeId: emp.user.employeeId || employeeRecord?.employee_number || null,
        startDate: emp.user.startDate?.toISOString() || employeeRecord?.start_date?.toISOString() || null,
        contractType: emp.user.contractType || employeeRecord?.contract_type || null,
        workHoursPerWeek: emp.user.workHoursPerWeek,
        createdAt: emp.user.createdAt?.toISOString(),
        // Additional personal details
        dateOfBirth: emp.user.dateOfBirth?.toISOString() || null,
        gender: emp.user.gender,
        nationality: emp.user.nationality,
        maritalStatus: emp.user.maritalStatus,
        // Address
        address: emp.user.address,
        city: emp.user.city,
        postalCode: emp.user.postalCode,
        // Emergency contact (from employee record)
        emergencyContact: employeeRecord?.emergency_contact || null,
        emergencyPhone: employeeRecord?.emergency_phone || null,
        emergencyRelationship: employeeRecord?.emergency_relationship || null,
        // Employment details (from employee record)
        hoursPerWeek: employeeRecord?.hours_per_week ? Number(employeeRecord.hours_per_week) : null,
        costCenter: employeeRecord?.cost_center || null,
        endDate: employeeRecord?.end_date?.toISOString() || null,
        // Skills and qualifications
        skills: employeeRecord?.skills || [],
        certifications: employeeRecord?.certifications || [],
        educationLevel: employeeRecord?.education_level || null,
        languages: employeeRecord?.languages || [],
        // Work preferences
        remoteWorkAllowed: employeeRecord?.remote_work_allowed ?? false,
        workLocation: employeeRecord?.work_location || null,
        // Notes
        notes: employeeRecord?.notes || null,
      };
    });

    // Pas data masking toe op basis van user role
    const allowedFields = getAllowedFieldsForRole(context.userRole);
    const maskedEmployees = formattedEmployees.map(emp =>
      maskSensitiveData(emp, { allowedFields })
    );

    // Log sensitive data access voor elke employee (async, non-blocking)
    // We loggen alleen als er daadwerkelijk sensitive data is opgehaald
    if (formattedEmployees.length > 0) {
      logSensitiveDataAccess({
        userId: context.userId,
        tenantId: context.tenantId,
        userRole: context.userRole,
        action: 'VIEW',
        resourceType: 'EmployeeList',
        resourceId: `bulk_${formattedEmployees.length}_records`,
        dataAccessed: { employees: formattedEmployees.slice(0, 1) }, // Log sample voor detectie
        unmaskedFields: allowedFields,
      }).catch(() => {/* Silent fail for audit logging */});
    }

    return NextResponse.json({
      employees: maskedEmployees,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
      filters: {
        departments,
        roles: ['USER', 'MANAGER', 'TENANT_ADMIN'],
      },
      _meta: {
        dataMasked: true,
        allowedSensitiveFields: allowedFields,
      },
    });
  } catch (error) {
    console.error("Error in employees GET:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * POST /api/employees
 * Maakt een nieuwe werknemer aan met volledige onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Controleer of gebruiker rechten heeft
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "MANAGER") {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }

    const body = await request.json();

    // Valideer input met Zod schema
    const validationResult = validateCreateEmployee(body);
    if (!validationResult.success) {
      return NextResponse.json(
        createValidationErrorResponse(validationResult.error),
        { status: 400 }
      );
    }

    const validatedData: CreateEmployeeInput = validationResult.data;

    // Check of email al bestaat
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit e-mailadres" },
        { status: 400 }
      );
    }

    // Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Maak user aan met gevalideerde data
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        password: hashedPassword,
        phone: validatedData.phone || null,
        department: validatedData.department || null,
        position: validatedData.position || null,
        employeeId: validatedData.employeeId || null,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        contractType: validatedData.contractType || null,
        workHoursPerWeek: validatedData.hoursPerWeek ? Number(validatedData.hoursPerWeek) : null,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        gender: validatedData.gender || null,
        nationality: validatedData.nationality || null,
        maritalStatus: validatedData.maritalStatus || null,
        address: validatedData.address || null,
        city: validatedData.city || null,
        postalCode: validatedData.postalCode || null,
        bankAccountNumber: validatedData.bankAccountNumber || null,
        bankAccountName: validatedData.bankAccountName || null,
        bsnNumber: validatedData.bsnNumber || null,
        role: validatedData.role || "USER",
      },
    });

    // Maak TenantUser koppeling
    await prisma.tenantUser.create({
      data: {
        tenantId: context.tenantId,
        userId: user.id,
        role: validatedData.role || "USER",
        isActive: true,
      },
    });

    // Maak employees record voor extra velden met gevalideerde data
    const employeeRecord = await prisma.employees.create({
      data: {
        user_id: user.id,
        tenant_id: context.tenantId,
        employee_number: validatedData.employeeId || null,
        position: validatedData.position || null,
        contract_type: validatedData.contractType || 'FULLTIME',
        hours_per_week: validatedData.hoursPerWeek ? Number(validatedData.hoursPerWeek) : 40,
        start_date: validatedData.startDate ? new Date(validatedData.startDate) : new Date(),
        phone_number: validatedData.phone || null,
        emergency_contact: validatedData.emergencyContact || null,
        emergency_phone: validatedData.emergencyPhone || null,
        emergency_relationship: validatedData.emergencyRelationship || null,
        hourly_rate: validatedData.hourlyRate ? Number(validatedData.hourlyRate) : null,
        cost_center: validatedData.costCenter || null,
        skills: validatedData.skills || [],
        certifications: validatedData.certifications || [],
        education_level: validatedData.educationLevel || null,
        languages: validatedData.languages || [],
        remote_work_allowed: validatedData.remoteWorkAllowed ?? false,
        work_location: validatedData.workLocation || null,
      },
    });

    // Koppel voertuigen als meegegeven
    if (validatedData.vehicleIds && validatedData.vehicleIds.length > 0) {
      await prisma.vehicleMapping.updateMany({
        where: {
          tenant_id: context.tenantId,
          id: { in: validatedData.vehicleIds },
        },
        data: {
          employee_id: employeeRecord.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      employeeId: employeeRecord.id,
    });
  } catch (error) {
    console.error("Error in employees POST:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
