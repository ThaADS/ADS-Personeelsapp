import { NextRequest, NextResponse } from "next/server";
import { withPermission, createAuditLog, requirePermission } from "@/lib/auth/tenant-access";
import { tenantDb } from "@/lib/db/tenant-db";
import { z } from "zod";

const approvalActionSchema = z.object({
  ids: z.array(z.string()),
  action: z.enum(['approve', 'reject']),
  comment: z.string().optional(),
});

// GET handler - return approvals list
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'PENDING';
    const type = url.searchParams.get('type') || '';

    // Get pending timesheets that need approval directly from prisma
    const context = await requirePermission('timesheet:approve');
    const prisma = new (await import('@prisma/client')).PrismaClient();
    
    const timesheets = await prisma.timesheet.findMany({
      where: {
        tenantId: context.tenantId,
        status: status,
        ...(type === 'timesheet' && {}), // All timesheets
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform to approval format
    const approvals = timesheets.map(timesheet => ({
      id: timesheet.id,
      type: 'timesheet',
      employee: {
        name: timesheet.user.name || timesheet.user.email,
        email: timesheet.user.email,
      },
      status: timesheet.status,
      createdAt: timesheet.createdAt.toISOString(),
      details: {
        date: timesheet.date.toISOString().split('T')[0],
        startTime: timesheet.startTime.toISOString(),
        endTime: timesheet.endTime.toISOString(),
        description: timesheet.description,
        hours: Math.round(
          (timesheet.endTime.getTime() - timesheet.startTime.getTime()) / (1000 * 60 * 60) * 100
        ) / 100,
      },
    }));

    return NextResponse.json({
      approvals,
      total: approvals.length,
    });
  } catch (error) {
    console.error('Error in approvals GET:', error);
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST handler - approve/reject items
export async function POST(request: NextRequest) {
  try {
    return await withPermission('timesheet:approve', async (context) => {
      const body = await request.json();
      const validatedData = approvalActionSchema.parse(body);
      const { ids, action, comment } = validatedData;

      const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
      const processedIds: string[] = [];

      // Process each timesheet
      for (const id of ids) {
        try {
          // Verify the timesheet exists and user has access
          const timesheet = await tenantDb.timesheet.findUnique({
            where: { id },
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          });

          if (!timesheet) {
            console.warn(`Timesheet ${id} not found`);
            continue;
          }

          // Update the timesheet status
          await tenantDb.timesheet.update({
            where: { id },
            data: { status: newStatus },
          });

          // Create audit log
          await createAuditLog(
            `TIMESHEET_${action.toUpperCase()}`,
            'Timesheet',
            id,
            { status: timesheet.status },
            { status: newStatus, comment }
          );

          processedIds.push(id);
        } catch (error) {
          console.error(`Error processing timesheet ${id}:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        message: `${processedIds.length} items ${action === 'approve' ? 'goedgekeurd' : 'afgekeurd'}`,
        processedIds,
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in approvals POST:', error);
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ error: "Onvoldoende rechten" }, { status: 403 });
    }
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
