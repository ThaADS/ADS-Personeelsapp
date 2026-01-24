/**
 * API route voor vakantie en tijd-voor-tijd
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, createAuditLog, addTenantFilter } from "@/lib/auth/tenant-access";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-vacations");

const vacationSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  description: z.string().optional(),
  type: z.enum(['VACATION', 'TIME_FOR_TIME']),
});

/**
 * GET /api/vacations
 * Haalt vakantie en tijd-voor-tijd aanvragen op
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
    const type = url.searchParams.get("type") || undefined;

    // Build where clause
    let where: Record<string, unknown> = {};

    // Tenant filtering
    if (context.tenantId) {
      where = addTenantFilter(where, context.tenantId);
    }

    // Type filtering - only VACATION and TIME_FOR_TIME
    if (type) {
      where.type = type === 'vacation' ? 'VACATION' : 'TIME_FOR_TIME';
    } else {
      where.type = { in: ['VACATION', 'TIME_FOR_TIME'] };
    }

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
      type: req.type === 'VACATION' ? 'vacation' : 'tijd-voor-tijd',
      employeeId: req.userId,
      employeeName: req.user?.name || req.user?.email || 'Onbekend',
      startDate: req.startDate.toISOString().split('T')[0],
      endDate: req.endDate.toISOString().split('T')[0],
      description: req.description || '',
      totalDays: req.totalDays,
      submittedAt: req.createdAt?.toISOString() || new Date().toISOString(),
      status: (req.status || 'pending').toLowerCase(),
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
    logger.error("Error in vacations GET", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * POST /api/vacations
 * Maakt een nieuwe vakantie of tijd-voor-tijd aanvraag aan
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
    const validatedData = vacationSchema.parse(body);

    // Calculate total days
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);

    if (endDate < startDate) {
      return NextResponse.json(
        { error: "Einddatum moet na startdatum liggen" },
        { status: 400 }
      );
    }

    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create leave request
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        type: validatedData.type,
        startDate,
        endDate,
        totalDays: diffDays,
        description: validatedData.description || null,
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
      validatedData.type === 'VACATION' ? 'VACATION_REQUEST' : 'TIME_FOR_TIME_REQUEST',
      'LeaveRequest',
      leaveRequest.id,
      null,
      {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        description: validatedData.description,
        totalDays: diffDays,
      }
    );

    return NextResponse.json({
      success: true,
      request: {
        id: leaveRequest.id,
        type: leaveRequest.type === 'VACATION' ? 'vacation' : 'tijd-voor-tijd',
        employeeId: leaveRequest.userId,
        employeeName: leaveRequest.user?.name || leaveRequest.user?.email || 'Onbekend',
        startDate: leaveRequest.startDate.toISOString().split('T')[0],
        endDate: leaveRequest.endDate.toISOString().split('T')[0],
        description: leaveRequest.description,
        totalDays: leaveRequest.totalDays,
        status: (leaveRequest.status || 'pending').toLowerCase(),
        submittedAt: leaveRequest.createdAt?.toISOString() || new Date().toISOString(),
      },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatiefout", details: error.issues },
        { status: 400 }
      );
    }

    logger.error("Error in vacations POST", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
