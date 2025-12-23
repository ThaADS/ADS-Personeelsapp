import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/tenant-access";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'APPROVED';

    const context = await requirePermission('timesheet:approve');
    const prisma = new (await import('@prisma/client')).PrismaClient();

    const rows = await prisma.timesheet.findMany({
      where: { tenantId: context.tenantId, status },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { date: 'desc' },
      take: 2000, // safety cap
    });

    const header = [
      'id','userEmail','userName','date','startTime','endTime','breakMinutes','hours','status','description'
    ];
    const csv = [header.join(',')].concat(
      rows.map((t) => {
        const hours = (t.endTime.getTime() - t.startTime.getTime()) / (1000*60*60) - (t.breakDuration || 0)/60;
        const vals = [
          t.id,
          t.user?.email || '',
          t.user?.name || '',
          t.date.toISOString().split('T')[0],
          t.startTime.toISOString(),
          t.endTime.toISOString(),
          String(t.breakDuration || 0),
          hours.toFixed(2),
          t.status,
          (t.description || '').replace(/\n|\r|,/g,' '),
        ];
        return vals.map(v => `"${v}"`).join(',');
      })
    ).join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="timesheets_${status.toLowerCase()}.csv"`,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

