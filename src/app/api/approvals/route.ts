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
    const type = url.searchParams.get('type') || 'all';
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    // Try get permission; if not authenticated, return empty list (dev-friendly)
    let context: Awaited<ReturnType<typeof requirePermission>> | null = null;
    try {
      context = await requirePermission('timesheet:approve');
    } catch (err) {
      if (err instanceof Error && err.message.includes('Authentication required')) {
        return NextResponse.json({
          items: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }
      // If explicitly permission denied, surface 403
      if (err instanceof Error && err.message.includes('Permission denied')) {
        return NextResponse.json({ error: 'Onvoldoende rechten' }, { status: 403 });
      }
      throw err;
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    type Item = {
      id: string;
      type: 'timesheet' | 'vacation' | 'tijd-voor-tijd' | 'sick-leave';
      employeeId: string;
      employeeName: string;
      submittedAt: string;
      status: string;
      date?: string;
      startTime?: string;
      endTime?: string;
      description?: string;
      breakDuration?: number;
      startDate?: string;
      endDate?: string;
      totalDays?: number;
      reason?: string;
    };

    const outItems: Item[] = [];

    const includeUser = {
      select: { id: true, name: true, email: true },
    } as const;

    // Timesheets
    if (type === 'all' || type === 'timesheet') {
      const whereTs = { tenantId: context!.tenantId, status } as const;
      const [countTs, listTs] = await Promise.all([
        prisma.timesheet.count({ where: whereTs }),
        prisma.timesheet.findMany({
          where: whereTs,
          include: { user: includeUser },
          orderBy: { createdAt: 'desc' },
          skip: type === 'timesheet' ? (page - 1) * limit : 0,
          take: type === 'timesheet' ? limit : 100, // cap to keep it light in 'all'
        }),
      ]);
      outItems.push(
        ...listTs.map((t) => ({
          id: t.id,
          type: 'timesheet' as const,
          employeeId: t.userId,
          employeeName: t.user?.name || t.user?.email || 'Onbekend',
          submittedAt: t.createdAt.toISOString(),
          status: t.status,
          date: t.date.toISOString().split('T')[0],
          startTime: t.startTime.toISOString(),
          endTime: t.endTime.toISOString(),
          description: t.description || undefined,
          breakDuration: t.breakDuration || 0,
        } satisfies Item))
      );
      if (type === 'timesheet') {
        return NextResponse.json({
          items: outItems,
          pagination: { page, limit, total: countTs, pages: Math.ceil(countTs / limit) || 0 },
        });
      }
    }

    // Vacations (from audit log)
    if (type === 'all' || type === 'vacation') {
      const logs = await prisma.auditLog.findMany({
        where: { tenantId: context!.tenantId, action: { in: ['VACATION_REQUEST', 'TIJD_VOOR_TIJD_REQUEST'] } },
        include: { user: includeUser },
        orderBy: { createdAt: 'desc' },
        skip: type === 'vacation' ? (page - 1) * limit : 0,
        take: type === 'vacation' ? limit : 100,
      });
      const filtered = logs.filter((l) => (l as unknown as { newValues?: { status?: string } }).newValues?.status === status);
      total += (type === 'vacation' ? filtered.length : logs.length);
      outItems.push(
        ...filtered.map((l) => {
          const nv = (l as unknown as { newValues?: Record<string, unknown> }).newValues || {};
          return {
            id: l.id,
            type: (l.action === 'VACATION_REQUEST' ? 'vacation' : 'tijd-voor-tijd') as 'vacation' | 'tijd-voor-tijd',
            employeeId: l.userId!,
            employeeName: l.user?.name || l.user?.email || 'Onbekend',
            submittedAt: l.createdAt.toISOString(),
            status: (nv.status as string) || 'PENDING',
            startDate: nv.startDate as string | undefined,
            endDate: nv.endDate as string | undefined,
            description: nv.description as string | undefined,
            totalDays: nv.totalDays as number | undefined,
          } satisfies Item;
        })
      );
      if (type === 'vacation') {
        return NextResponse.json({
          items: outItems,
          pagination: { page, limit, total: outItems.length, pages: Math.ceil(outItems.length / limit) || 0 },
        });
      }
    }

    // Sick leaves (from audit log)
    if (type === 'all' || type === 'sickleave') {
      const logs = await prisma.auditLog.findMany({
        where: { tenantId: context!.tenantId, action: 'SICK_LEAVE_REQUEST' },
        include: { user: includeUser },
        orderBy: { createdAt: 'desc' },
        skip: type === 'sickleave' ? (page - 1) * limit : 0,
        take: type === 'sickleave' ? limit : 100,
      });
      const filtered = logs.filter((l) => (l as unknown as { newValues?: { status?: string } }).newValues?.status === status);
      total += (type === 'sickleave' ? filtered.length : logs.length);
      outItems.push(
        ...filtered.map((l) => {
          const nv = (l as unknown as { newValues?: Record<string, unknown> }).newValues || {};
          return {
            id: l.id,
            type: 'sick-leave' as const,
            employeeId: l.userId!,
            employeeName: l.user?.name || l.user?.email || 'Onbekend',
            submittedAt: l.createdAt.toISOString(),
            status: (nv.status as string) || 'PENDING',
            startDate: nv.startDate as string | undefined,
            endDate: nv.endDate as string | undefined,
            reason: nv.reason as string | undefined,
          } satisfies Item;
        })
      );
      if (type === 'sickleave') {
        return NextResponse.json({
          items: outItems,
          pagination: { page, limit, total: outItems.length, pages: Math.ceil(outItems.length / limit) || 0 },
        });
      }
    }

    // For 'all', sort by submittedAt and paginate
    outItems.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    const start = (page - 1) * limit;
    const paged = outItems.slice(start, start + limit);
    return NextResponse.json({
      items: paged,
      pagination: { page, limit, total: outItems.length, pages: Math.ceil(outItems.length / limit) || 0 },
    });
  } catch (error) {
    console.error('Error in approvals GET:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST handler - approve/reject items
export async function POST(request: NextRequest) {
  try {
    return await withPermission('timesheet:approve', async () => {
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
        { error: "Validation failed", details: error.issues },
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
