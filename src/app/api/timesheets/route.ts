import { NextRequest } from "next/server";
import { getTenantContext, createAuditLog, addTenantFilter } from "@/lib/auth/tenant-access";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  internalErrorResponse,
  unauthorizedResponse,
  validationErrorResponse,
  ErrorCodes,
} from "@/lib/api/response";

// Validation schema for creating/updating timesheets
const timesheetSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  description: z.string().optional(),
  breakDuration: z.number().min(0).max(480).optional(), // max 8 hours break
  startLat: z.number().optional(),
  startLng: z.number().optional(),
  endLat: z.number().optional(),
  endLng: z.number().optional(),
});

// GET - Fetch timesheets for current user
export async function GET(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context) {
      return unauthorizedResponse();
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const status = url.searchParams.get('status') || undefined;
    const userId = url.searchParams.get('userId') || undefined;

    // Build where clause
    let where: Record<string, unknown> = {};

    // Tenant filtering
    if (context.tenantId) {
      where = addTenantFilter(where, context.tenantId);
    }

    // Status filtering
    if (status) {
      where.status = status;
    }

    // User filtering - regular users can only see their own timesheets
    if (context.userRole === 'USER') {
      where.userId = context.userId;
    } else if (userId) {
      // Managers/Admins can filter by specific user
      where.userId = userId;
    }

    // Get timesheets with pagination
    const [timesheets, total] = await Promise.all([
      prisma.timesheet.findMany({
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
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.timesheet.count({ where }),
    ]);

    // Format response
    const items = timesheets.map((t) => ({
      id: t.id,
      date: t.date.toISOString().split('T')[0],
      startTime: t.startTime.toISOString().substring(11, 16),
      endTime: t.endTime.toISOString().substring(11, 16),
      description: t.description,
      status: t.status,
      breakDuration: t.break_minutes || 0,
      startLat: t.location_start ? (t.location_start as { lat: number }).lat : null,
      startLng: t.location_start ? (t.location_start as { lng: number }).lng : null,
      endLat: t.location_end ? (t.location_end as { lat: number }).lat : null,
      endLng: t.location_end ? (t.location_end as { lng: number }).lng : null,
      userId: t.userId,
      userName: t.user?.name || t.user?.email || 'Onbekend',
      createdAt: t.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: t.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    return successResponse({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    return internalErrorResponse();
  }
}

// POST - Create a new timesheet
export async function POST(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context) {
      return unauthorizedResponse();
    }

    if (!context.tenantId) {
      return errorResponse(ErrorCodes.VALIDATION_ERROR, "Geen tenant context");
    }

    const body = await request.json();
    const validatedData = timesheetSchema.parse(body);

    // Create date objects
    const dateStr = validatedData.date;
    const date = new Date(dateStr + 'T00:00:00.000Z');
    const startTime = new Date(`${dateStr}T${validatedData.startTime}:00.000Z`);
    const endTime = new Date(`${dateStr}T${validatedData.endTime}:00.000Z`);

    // Handle end time crossing midnight
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    // Create timesheet
    const locationStart = validatedData.startLat && validatedData.startLng
      ? { lat: validatedData.startLat, lng: validatedData.startLng }
      : undefined;
    const locationEnd = validatedData.endLat && validatedData.endLng
      ? { lat: validatedData.endLat, lng: validatedData.endLng }
      : undefined;

    const timesheet = await prisma.timesheet.create({
      data: {
        tenantId: context.tenantId,
        userId: context.userId,
        date,
        startTime,
        endTime,
        description: validatedData.description || null,
        break_minutes: validatedData.breakDuration || null,
        location_start: locationStart,
        location_end: locationEnd,
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
      'TIMESHEET_CREATE',
      'Timesheet',
      timesheet.id,
      null,
      {
        date: dateStr,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        description: validatedData.description,
      }
    );

    return successResponse({
      id: timesheet.id, // Top-level id for QuickClockIn component
      timesheet: {
        id: timesheet.id,
        date: timesheet.date.toISOString().split('T')[0],
        startTime: timesheet.startTime.toISOString().substring(11, 16),
        endTime: timesheet.endTime.toISOString().substring(11, 16),
        description: timesheet.description,
        status: timesheet.status,
        breakDuration: timesheet.break_minutes || 0,
        userName: timesheet.user?.name || timesheet.user?.email || 'Onbekend',
        createdAt: timesheet.createdAt?.toISOString() || new Date().toISOString(),
      },
    }, { message: "Urenregistratie succesvol aangemaakt", status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((issue) => {
        errors[issue.path.join('.')] = issue.message;
      });
      return validationErrorResponse(errors);
    }

    console.error("Error creating timesheet:", error);
    return internalErrorResponse();
  }
}
