/**
 * API route voor vakantie en tijd-voor-tijd
 */
import { NextRequest, NextResponse } from "next/server";
import { withTenantAccess, createAuditLog } from "@/lib/auth/tenant-access";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const vacationSchema = z.object({
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  description: z.string().min(1, "Description is required"),
  type: z.enum(['vacation', 'tijd-voor-tijd']),
});

/**
 * GET /api/vacations
 * Haalt vakantie en tijd-voor-tijd aanvragen op
 */
export async function GET(request: NextRequest) {
  try {
    return await withTenantAccess(async (context) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const status = url.searchParams.get("status") || undefined;
      const type = url.searchParams.get("type") || undefined;

      // For now, using audit logs to track vacation requests
      // In a full implementation, you'd have a dedicated Vacation model
      const skip = (page - 1) * limit;
      
      const where: Record<string, unknown> = {
        tenantId: context.tenantId,
        action: { in: ['VACATION_REQUEST', 'TIJD_VOOR_TIJD_REQUEST'] },
      };

      if (status) {
        (where as Record<string, unknown>).newValues = {
          path: ['status'],
          equals: status,
        };
      }

      if (type) {
        (where as Record<string, unknown>).action = type === 'vacation' ? 'VACATION_REQUEST' : 'TIJD_VOOR_TIJD_REQUEST';
      }

      const [vacationLogs, total] = await Promise.all([
        prisma.auditLog.findMany({
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
        prisma.auditLog.count({ where }),
      ]);

      // Transform audit logs to vacation format
      const vacations = vacationLogs.map(log => ({
        id: log.id,
        type: log.action === 'VACATION_REQUEST' ? 'vacation' : 'tijd-voor-tijd',
        employeeId: log.userId,
        employeeName: log.user?.name || log.user?.email || 'Unknown',
        startDate: log.newValues?.startDate || '',
        endDate: log.newValues?.endDate || '',
        description: log.newValues?.description || '',
        totalDays: log.newValues?.totalDays || 0,
        submittedAt: log.createdAt.toISOString(),
        status: log.newValues?.status || 'pending',
      }));

      return NextResponse.json({
        items: vacations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    });
  } catch (error) {
    console.error("Error in vacations GET:", error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * POST /api/vacations
 * Maakt een nieuwe vakantie of tijd-voor-tijd aanvraag aan
 */
export async function POST(request: NextRequest) {
  try {
    return await withTenantAccess(async (context) => {
      const body = await request.json();
      const validatedData = vacationSchema.parse(body);

      // Calculate total days
      const startDate = new Date(validatedData.startDate);
      const endDate = new Date(validatedData.endDate);
      
      if (endDate < startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }

      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const vacationData = {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        description: validatedData.description,
        totalDays: diffDays,
        status: 'pending',
        type: validatedData.type,
      };

      // Create audit log entry for the vacation request
      await createAuditLog(
        validatedData.type === 'vacation' ? 'VACATION_REQUEST' : 'TIJD_VOOR_TIJD_REQUEST',
        'Vacation',
        undefined,
        undefined,
        vacationData
      );

      return NextResponse.json({
        id: `vac-${Date.now()}`,
        type: validatedData.type,
        employeeId: context.userId,
        ...vacationData,
        submittedAt: new Date().toISOString(),
      }, { status: 201 });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in vacations POST:", error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
