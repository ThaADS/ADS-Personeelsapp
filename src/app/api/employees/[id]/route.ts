/**
 * API route voor individuele werknemer beheer
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { prisma } from "@/lib/db/prisma";
import { maskApiResponse, getAllowedFieldsForRole } from "@/lib/security/data-masking";

/**
 * GET /api/employees/[id]
 * Haalt een specifieke werknemer op met al zijn details inclusief voertuig koppelingen
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { id } = await params;

    // Haal TenantUser op met alle gerelateerde data
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        id,
        tenantId: context.tenantId,
      },
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
            dateOfBirth: true,
            gender: true,
            nationality: true,
            maritalStatus: true,
            address: true,
            city: true,
            postalCode: true,
            bankAccountNumber: true,
            bankAccountName: true,
            bsnNumber: true,
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
                department_id: true,
              },
            },
          },
        },
      },
    });

    if (!tenantUser) {
      return NextResponse.json({ error: "Werknemer niet gevonden" }, { status: 404 });
    }

    // Haal voertuig koppelingen op voor deze employee
    const employeeRecord = tenantUser.user.employees;
    let vehicleMappings: {
      id: string;
      provider_type: string;
      provider_vehicle_id: string;
      registration: string;
      vehicle_name: string | null;
      is_active: boolean;
    }[] = [];

    if (employeeRecord) {
      vehicleMappings = await prisma.vehicleMapping.findMany({
        where: {
          tenant_id: context.tenantId,
          employee_id: employeeRecord.id,
        },
        select: {
          id: true,
          provider_type: true,
          provider_vehicle_id: true,
          registration: true,
          vehicle_name: true,
          is_active: true,
        },
      });
    }

    // Transformeer naar response formaat
    const employee = {
      id: tenantUser.id,
      tenantId: tenantUser.tenantId,
      userId: tenantUser.userId,
      role: tenantUser.role,
      isActive: tenantUser.isActive,
      // User details
      name: tenantUser.user.name,
      email: tenantUser.user.email,
      image: tenantUser.user.image,
      phone: tenantUser.user.phone || employeeRecord?.phone_number || null,
      department: tenantUser.user.department,
      position: tenantUser.user.position || employeeRecord?.position || null,
      employeeId: tenantUser.user.employeeId || employeeRecord?.employee_number || null,
      startDate: tenantUser.user.startDate?.toISOString() || employeeRecord?.start_date?.toISOString() || null,
      contractType: tenantUser.user.contractType || employeeRecord?.contract_type || null,
      workHoursPerWeek: tenantUser.user.workHoursPerWeek,
      // Personal details
      dateOfBirth: tenantUser.user.dateOfBirth?.toISOString() || null,
      gender: tenantUser.user.gender,
      nationality: tenantUser.user.nationality,
      maritalStatus: tenantUser.user.maritalStatus,
      // Address
      address: tenantUser.user.address,
      city: tenantUser.user.city,
      postalCode: tenantUser.user.postalCode,
      // Bank details
      bankAccountNumber: tenantUser.user.bankAccountNumber,
      bankAccountName: tenantUser.user.bankAccountName,
      bsnNumber: tenantUser.user.bsnNumber,
      // Employee record fields
      employeeRecordId: employeeRecord?.id || null,
      departmentId: employeeRecord?.department_id || null,
      hoursPerWeek: employeeRecord?.hours_per_week ? Number(employeeRecord.hours_per_week) : null,
      endDate: employeeRecord?.end_date?.toISOString() || null,
      hourlyRate: employeeRecord?.hourly_rate ? Number(employeeRecord.hourly_rate) : null,
      managerId: employeeRecord?.manager_id || null,
      costCenter: employeeRecord?.cost_center || null,
      // Emergency contact
      emergencyContact: employeeRecord?.emergency_contact || null,
      emergencyPhone: employeeRecord?.emergency_phone || null,
      emergencyRelationship: employeeRecord?.emergency_relationship || null,
      // Skills
      skills: employeeRecord?.skills || [],
      certifications: employeeRecord?.certifications || [],
      educationLevel: employeeRecord?.education_level || null,
      languages: employeeRecord?.languages || [],
      // Work preferences
      remoteWorkAllowed: employeeRecord?.remote_work_allowed ?? false,
      workLocation: employeeRecord?.work_location || null,
      // Notes
      notes: employeeRecord?.notes || null,
      // Fleet tracking
      vehicleMappings,
    };

    // Check of unmasked data is aangevraagd via query param
    const requestUnmasked = request.nextUrl.searchParams.get('unmasked') === 'true';

    // Pas data masking toe op basis van user role
    const { data: maskedEmployee, masked } = maskApiResponse(
      employee,
      context.userRole,
      { requestUnmasked }
    );

    return NextResponse.json({
      employee: maskedEmployee,
      _meta: {
        dataMasked: masked,
        allowedSensitiveFields: getAllowedFieldsForRole(context.userRole),
      }
    });
  } catch (error) {
    console.error("Error in employee GET:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * PUT /api/employees/[id]
 * Werkt een specifieke werknemer bij inclusief voertuig koppelingen
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Controleer of gebruiker rechten heeft
    if (context.userRole !== "TENANT_ADMIN" && context.userRole !== "MANAGER") {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // Haal bestaande TenantUser op
    const tenantUser = await prisma.tenantUser.findFirst({
      where: {
        id,
        tenantId: context.tenantId,
      },
      include: {
        user: {
          include: {
            employees: true,
          },
        },
      },
    });

    if (!tenantUser) {
      return NextResponse.json({ error: "Werknemer niet gevonden" }, { status: 404 });
    }

    // Update User gegevens
    await prisma.user.update({
      where: { id: tenantUser.userId },
      data: {
        name: body.name,
        phone: body.phone,
        department: body.department,
        position: body.position,
        employeeId: body.employeeId,
        startDate: body.startDate ? new Date(body.startDate) : null,
        contractType: body.contractType,
        workHoursPerWeek: body.workHoursPerWeek ? parseFloat(body.workHoursPerWeek) : null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        gender: body.gender,
        nationality: body.nationality,
        maritalStatus: body.maritalStatus,
        address: body.address,
        city: body.city,
        postalCode: body.postalCode,
        bankAccountNumber: body.bankAccountNumber,
        bankAccountName: body.bankAccountName,
        bsnNumber: body.bsnNumber,
      },
    });

    // Update TenantUser role/status
    await prisma.tenantUser.update({
      where: { id },
      data: {
        role: body.role,
        isActive: body.isActive,
      },
    });

    // Update of maak employees record
    if (tenantUser.user.employees) {
      // Update bestaand record
      await prisma.employees.update({
        where: { id: tenantUser.user.employees.id },
        data: {
          employee_number: body.employeeId,
          position: body.position,
          contract_type: body.contractType as 'FULLTIME' | 'PARTTIME' | 'FLEX' | 'TEMPORARY' | 'INTERN' | null,
          hours_per_week: body.hoursPerWeek ? body.hoursPerWeek : null,
          start_date: body.startDate ? new Date(body.startDate) : new Date(),
          end_date: body.endDate ? new Date(body.endDate) : null,
          phone_number: body.phone,
          emergency_contact: body.emergencyContact,
          emergency_phone: body.emergencyPhone,
          emergency_relationship: body.emergencyRelationship,
          hourly_rate: body.hourlyRate ? body.hourlyRate : null,
          manager_id: body.managerId,
          cost_center: body.costCenter,
          skills: body.skills || [],
          certifications: body.certifications || [],
          education_level: body.educationLevel,
          languages: body.languages || [],
          remote_work_allowed: body.remoteWorkAllowed ?? false,
          work_location: body.workLocation,
          notes: body.notes,
          department_id: body.departmentId,
        },
      });
    } else {
      // Maak nieuw employees record
      await prisma.employees.create({
        data: {
          user_id: tenantUser.userId,
          tenant_id: context.tenantId,
          employee_number: body.employeeId,
          position: body.position,
          contract_type: (body.contractType as 'FULLTIME' | 'PARTTIME' | 'FLEX' | 'TEMPORARY' | 'INTERN') || 'FULLTIME',
          hours_per_week: body.hoursPerWeek ? body.hoursPerWeek : 40,
          start_date: body.startDate ? new Date(body.startDate) : new Date(),
          end_date: body.endDate ? new Date(body.endDate) : null,
          phone_number: body.phone,
          emergency_contact: body.emergencyContact,
          emergency_phone: body.emergencyPhone,
          emergency_relationship: body.emergencyRelationship,
          hourly_rate: body.hourlyRate ? body.hourlyRate : null,
          manager_id: body.managerId,
          cost_center: body.costCenter,
          skills: body.skills || [],
          certifications: body.certifications || [],
          education_level: body.educationLevel,
          languages: body.languages || [],
          remote_work_allowed: body.remoteWorkAllowed ?? false,
          work_location: body.workLocation,
          notes: body.notes,
          department_id: body.departmentId,
        },
      });
    }

    // Update voertuig koppelingen als meegegeven
    if (body.vehicleIds !== undefined) {
      // Haal het employees record opnieuw op
      const employeeRecord = await prisma.employees.findUnique({
        where: { user_id: tenantUser.userId },
      });

      if (employeeRecord) {
        // Verwijder bestaande koppelingen voor deze employee
        await prisma.vehicleMapping.updateMany({
          where: {
            tenant_id: context.tenantId,
            employee_id: employeeRecord.id,
          },
          data: {
            employee_id: null,
          },
        });

        // Maak nieuwe koppelingen
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
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in employee PUT:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
