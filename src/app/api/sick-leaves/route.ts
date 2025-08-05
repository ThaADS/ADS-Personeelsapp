/**
 * API route voor ziekteverlof
 */
import { NextRequest, NextResponse } from "next/server";
import { withTenantAccess, createAuditLog } from "@/lib/auth/tenant-access";
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
  reason: z.string().min(1, "Reason is required"),
  medicalNote: z.boolean().default(false),
  uwvReported: z.boolean().default(false),
  expectedReturnDate: z.string().optional(),
});

/**
 * GET /api/sick-leaves
 * Haalt ziekteverlof aanvragen op
 */
export async function GET(request: NextRequest) {
  try {
    return await withTenantAccess(async (context) => {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const status = url.searchParams.get("status") || undefined;

      // Using audit logs to track sick leave requests
      const skip = (page - 1) * limit;
      
      const where: any = {
        tenantId: context.tenantId,
        action: 'SICK_LEAVE_REQUEST',
      };

      if (status) {
        where.newValues = {
          path: ['status'],
          equals: status,
        };
      }

      const [sickLeaveLogs, total] = await Promise.all([
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

      // Transform audit logs to sick leave format
      const sickLeaves = sickLeaveLogs.map(log => ({
        id: log.id,
        type: 'sick-leave',
        employeeId: log.userId,
        employeeName: log.user?.name || log.user?.email || 'Unknown',
        startDate: log.newValues?.startDate || '',
        endDate: log.newValues?.endDate || null,
        reason: log.newValues?.reason || '',
        medicalNote: log.newValues?.medicalNote || false,
        uwvReported: log.newValues?.uwvReported || false,
        expectedReturnDate: log.newValues?.expectedReturnDate || null,
        submittedAt: log.createdAt.toISOString(),
        status: log.newValues?.status || 'pending',
      }));

      return NextResponse.json({
        items: sickLeaves,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    });
  } catch (error) {
    console.error("Error in sick-leaves GET:", error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * POST /api/sick-leaves
 * Maakt een nieuwe ziekteverlof aanvraag aan
 */
export async function POST(request: NextRequest) {
  try {
    return await withTenantAccess(async (context) => {
      const body = await request.json();
      const validatedData = sickLeaveSchema.parse(body);

      // Validate dates
      const startDate = new Date(validatedData.startDate);
      const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
      
      if (endDate && endDate < startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }

      const sickLeaveData = {
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        reason: validatedData.reason,
        medicalNote: validatedData.medicalNote,
        uwvReported: validatedData.uwvReported,
        expectedReturnDate: validatedData.expectedReturnDate,
        status: 'pending',
      };

      // Create audit log entry for the sick leave request
      await createAuditLog(
        'SICK_LEAVE_REQUEST',
        'SickLeave',
        undefined,
        undefined,
        sickLeaveData
      );

      // Check if UWV reporting is required (>4 days)
      let uwvReportingRequired = false;
      if (endDate) {
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        uwvReportingRequired = diffDays > 4;
      }

      return NextResponse.json({
        id: `sl-${Date.now()}`,
        type: 'sick-leave',
        employeeId: context.userId,
        ...sickLeaveData,
        submittedAt: new Date().toISOString(),
        uwvReportingRequired,
      }, { status: 201 });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in sick-leaves POST:", error);
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
