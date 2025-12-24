/**
 * API route voor ziekteverlof
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, createAuditLog, addTenantFilter } from "@/lib/auth/tenant-access";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const sickLeaveSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }).optional(),
  reason: z.string().optional(),
});

/**
 * GET /api/sick-leaves
 * Haalt ziekteverlof aanvragen op
 */
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status") || undefined;

    // Build where clause
    let where: Record<string, unknown> = {};

    // Tenant filtering
    if (context.tenantId) {
      where = addTenantFilter(where, context.tenantId);
    }

    // Only SICK_LEAVE type
    where.type = 'SICK_LEAVE';

    // Status filtering
    if (status) {
      where.status = status.toUpperCase();
    }

    // User filtering - regular users can only see their own requests
    if (context.userRole === 'USER') {
      where.userId = context.userId;
    }

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    // Transform to response format
    const items = requests.map(req => ({
      id: req.id,
      type: 'sick-leave',
      employeeId: req.userId,
      employeeName: req.user?.name || req.user?.email || 'Onbekend',
      startDate: req.startDate.toISOString().split('T')[0],
      endDate: req.endDate.toISOString().split('T')[0],
      reason: req.description || '',
      totalDays: req.totalDays,
      submittedAt: req.createdAt.toISOString(),
      status: req.status.toLowerCase(),
      reviewedBy: req.reviewedBy,
      reviewedAt: req.reviewedAt?.toISOString(),
      reviewNotes: req.reviewNotes,
    }));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in sick-leaves GET:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * POST /api/sick-leaves
 * Maakt een nieuwe ziekteverlof aanvraag aan
 */
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    if (!context.tenantId) {
      return NextResponse.json({ error: "Geen tenant context" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = sickLeaveSchema.parse(body);

    // Validate dates
    const startDate = new Date(validatedData.startDate);
    const endDate = validatedData.endDate ? new Date(validatedData.endDate) : new Date(validatedData.startDate);

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "Einddatum moet na startdatum liggen" },
        { status: 400 }
      );
    }

    // Calculate total days
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        type: 'SICK_LEAVE',
        startDate,
        endDate,
        totalDays: diffDays,
        description: validatedData.reason || null,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog(
      'SICK_LEAVE_REQUEST',
      'LeaveRequest',
      leaveRequest.id,
      null,
      {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate || validatedData.startDate,
        reason: validatedData.reason,
        totalDays: diffDays,
      }
    );

    // Check if UWV reporting is required (>4 days)
    const uwvReportingRequired = diffDays > 4;

    return NextResponse.json({
      success: true,
      request: {
        id: leaveRequest.id,
        type: 'sick-leave',
        employeeId: leaveRequest.userId,
        employeeName: leaveRequest.user?.name || leaveRequest.user?.email || 'Onbekend',
        startDate: leaveRequest.startDate.toISOString().split('T')[0],
        endDate: leaveRequest.endDate.toISOString().split('T')[0],
        reason: leaveRequest.description,
        totalDays: leaveRequest.totalDays,
        status: leaveRequest.status.toLowerCase(),
        submittedAt: leaveRequest.createdAt.toISOString(),
        uwvReportingRequired,
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatiefout", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error in sick-leaves POST:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
