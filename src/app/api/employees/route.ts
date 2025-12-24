/**
 * API route voor werknemers beheer
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, requirePermission } from "@/lib/auth/tenant-access";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Fetch employees (TenantUsers with User data)
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
    const formattedEmployees = filteredEmployees.map((emp) => ({
      id: emp.id,
      tenantId: emp.tenantId,
      userId: emp.userId,
      role: emp.role,
      isActive: emp.isActive,
      // User details
      name: emp.user.name,
      email: emp.user.email,
      image: emp.user.image,
      phone: emp.user.phone,
      department: emp.user.department,
      position: emp.user.position,
      employeeId: emp.user.employeeId,
      startDate: emp.user.startDate?.toISOString() || null,
      contractType: emp.user.contractType,
      workHoursPerWeek: emp.user.workHoursPerWeek,
      createdAt: emp.user.createdAt?.toISOString(),
    }));

    return NextResponse.json({
      employees: formattedEmployees,
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
    });
  } catch (error) {
    console.error("Error in employees GET:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
