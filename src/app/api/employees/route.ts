/**
 * API route voor werknemers beheer
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { maskSensitiveData, getAllowedFieldsForRole } from "@/lib/security/data-masking";

/**
 * GET /api/employees
 * Haalt alle werknemers op binnen de huidige tenant
 */
export async function GET(request: NextRequest) {
  try {
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

    // Validatie
    if (!body.email || !body.name || !body.password) {
      return NextResponse.json(
        { error: "E-mail, naam en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    // Check of email al bestaat
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Er bestaat al een account met dit e-mailadres" },
        { status: 400 }
      );
    }

    // Hash het wachtwoord
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Maak user aan
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword,
        phone: body.phone || null,
        department: body.department || null,
        position: body.position || null,
        employeeId: body.employeeId || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        contractType: body.contractType || null,
        workHoursPerWeek: body.hoursPerWeek ? parseFloat(body.hoursPerWeek) : null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender || null,
        nationality: body.nationality || null,
        maritalStatus: body.maritalStatus || null,
        address: body.address || null,
        city: body.city || null,
        postalCode: body.postalCode || null,
        bankAccountNumber: body.bankAccountNumber || null,
        bankAccountName: body.bankAccountName || null,
        bsnNumber: body.bsnNumber || null,
        role: body.role || "USER",
      },
    });

    // Maak TenantUser koppeling
    await prisma.tenantUser.create({
      data: {
        tenantId: context.tenantId,
        userId: user.id,
        role: body.role || "USER",
        isActive: true,
      },
    });

    // Maak employees record voor extra velden
    const employeeRecord = await prisma.employees.create({
      data: {
        user_id: user.id,
        tenant_id: context.tenantId,
        employee_number: body.employeeId || null,
        position: body.position || null,
        contract_type: (body.contractType as 'FULLTIME' | 'PARTTIME' | 'FLEX' | 'TEMPORARY' | 'INTERN') || 'FULLTIME',
        hours_per_week: body.hoursPerWeek ? parseFloat(body.hoursPerWeek) : 40,
        start_date: body.startDate ? new Date(body.startDate) : new Date(),
        phone_number: body.phone || null,
        emergency_contact: body.emergencyContact || null,
        emergency_phone: body.emergencyPhone || null,
        emergency_relationship: body.emergencyRelationship || null,
        hourly_rate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        cost_center: body.costCenter || null,
        skills: body.skills || [],
        certifications: body.certifications || [],
        education_level: body.educationLevel || null,
        languages: body.languages || [],
        remote_work_allowed: body.remoteWorkAllowed ?? false,
        work_location: body.workLocation || null,
      },
    });

    // Koppel voertuigen als meegegeven
    if (body.vehicleIds && body.vehicleIds.length > 0) {
      await prisma.vehicleMapping.updateMany({
        where: {
          tenant_id: context.tenantId,
          id: { in: body.vehicleIds },
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
