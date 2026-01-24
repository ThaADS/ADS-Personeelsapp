/**
 * Dashboard Export API
 *
 * Exports dashboard data as CSV:
 * - Timesheets for a given period
 * - Leave data
 * - Team overview (for managers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-dashboard-export");

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;
    const userRole = session.user.role as string;

    const searchParams = request.nextUrl.searchParams;
    const exportType = searchParams.get('type') || 'timesheets';
    const startDateParam = searchParams.get('start');
    const endDateParam = searchParams.get('end');

    // Default to current month
    const now = new Date();
    const startDate = startDateParam ? new Date(startDateParam) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = endDateParam ? new Date(endDateParam) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let csvContent = '';
    let filename = '';

    if (exportType === 'timesheets') {
      // Export timesheets
      const timesheets = await prisma.timesheet.findMany({
        where: {
          userId,
          tenantId,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      // CSV Header
      csvContent = 'Datum,Start,Einde,Totaal Uren,Pauze (min),Status,Notities\n';

      // CSV Rows
      timesheets.forEach((ts) => {
        const date = new Date(ts.startTime).toLocaleDateString('nl-NL');
        const startTime = new Date(ts.startTime).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
        const endTime = ts.endTime
          ? new Date(ts.endTime).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
          : '-';
        const totalHours = Number(ts.total_hours) || 0;
        const breakMinutes = ts.break_minutes || 0;
        const status = ts.status;
        const notes = (ts.description || '').replace(/"/g, '""'); // Escape quotes

        csvContent += `"${date}","${startTime}","${endTime}",${totalHours.toFixed(2)},${breakMinutes},"${status}","${notes}"\n`;
      });

      filename = `urenregistratie_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
    } else if (exportType === 'leave') {
      // Export leave data
      const employee = await prisma.employees.findFirst({
        where: {
          user_id: userId,
          tenant_id: tenantId,
        },
        select: { id: true },
      });

      if (!employee) {
        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
      }

      const [vacations, sickLeaves, leaveBalance] = await Promise.all([
        prisma.vacations.findMany({
          where: {
            employee_id: employee.id,
            tenant_id: tenantId,
          },
          orderBy: {
            start_date: 'desc',
          },
        }),
        prisma.sick_leaves.findMany({
          where: {
            employee_id: employee.id,
            tenant_id: tenantId,
          },
          orderBy: {
            start_date: 'desc',
          },
        }),
        prisma.leaveBalance.findFirst({
          where: {
            employee_id: employee.id,
            tenant_id: tenantId,
            year: now.getFullYear(),
          },
        }),
      ]);

      // Leave Balance summary
      csvContent = 'VERLOFSALDO\n';
      csvContent += 'Type,Totaal,Opgenomen,Resterend\n';
      if (leaveBalance) {
        const statutoryTotal = Number(leaveBalance.statutory_days) || 0;
        const statutoryUsed = Number(leaveBalance.statutory_used) || 0;
        csvContent += `"Wettelijk",${statutoryTotal.toFixed(1)},${statutoryUsed.toFixed(1)},${(statutoryTotal - statutoryUsed).toFixed(1)}\n`;

        const extraTotal = Number(leaveBalance.extra_days) || 0;
        const extraUsed = Number(leaveBalance.extra_used) || 0;
        csvContent += `"Bovenwettelijk",${extraTotal.toFixed(1)},${extraUsed.toFixed(1)},${(extraTotal - extraUsed).toFixed(1)}\n`;

        const compHours = Number(leaveBalance.compensation_hours) || 0;
        csvContent += `"Compensatie-uren",${compHours.toFixed(1)},-,${compHours.toFixed(1)}\n`;
      }

      // Vacation history
      csvContent += '\nVERLOFGESCHIEDENIS\n';
      csvContent += 'Type,Start,Einde,Dagen,Status,Reden\n';
      vacations.forEach((v) => {
        const start = new Date(v.start_date).toLocaleDateString('nl-NL');
        const end = new Date(v.end_date).toLocaleDateString('nl-NL');
        const days = Math.ceil(
          (new Date(v.end_date).getTime() - new Date(v.start_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const reason = (v.description || '').replace(/"/g, '""');
        csvContent += `"${v.type}","${start}","${end}",${days},"${v.status}","${reason}"\n`;
      });

      // Sick leave history
      csvContent += '\nZIEKMELDINGEN\n';
      csvContent += 'Start,Einde,Dagen,UWV Gemeld,Notities\n';
      sickLeaves.forEach((s) => {
        const start = new Date(s.start_date).toLocaleDateString('nl-NL');
        const end = s.end_date ? new Date(s.end_date).toLocaleDateString('nl-NL') : 'Lopend';
        const endDateObj = s.end_date ? new Date(s.end_date) : new Date();
        const days = Math.ceil((endDateObj.getTime() - new Date(s.start_date).getTime()) / (1000 * 60 * 60 * 24));
        const uwvReported = s.uwv_reported ? 'Ja' : 'Nee';
        const notes = (s.reason || '').replace(/"/g, '""');
        csvContent += `"${start}","${end}",${days},"${uwvReported}","${notes}"\n`;
      });

      filename = `verlofoverzicht_${now.toISOString().split('T')[0]}.csv`;
    } else if (exportType === 'team' && ['MANAGER', 'TENANT_ADMIN', 'SUPERUSER'].includes(userRole || '')) {
      // Export team overview (managers only)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const teamMembers = await prisma.employees.findMany({
        where: {
          tenant_id: tenantId,
          OR: [{ end_date: null }, { end_date: { gte: now } }],
        },
        select: {
          id: true,
          user_id: true,
          users: {
            select: {
              name: true,
              email: true,
              department: true,
            },
          },
        },
      });

      csvContent = 'TEAM OVERZICHT\n';
      csvContent += 'Naam,Email,Afdeling,Uren Deze Maand,Openstaand,Goedgekeurd,Afgewezen\n';

      for (const member of teamMembers) {
        if (!member.user_id) continue;

        const [totalHours, pending, approved, rejected] = await Promise.all([
          prisma.timesheet.aggregate({
            where: {
              userId: member.user_id,
              tenantId,
              startTime: { gte: startOfMonth },
              endTime: { not: undefined },
            },
            _sum: { total_hours: true },
          }),
          prisma.timesheet.count({
            where: {
              userId: member.user_id,
              tenantId,
              status: 'PENDING',
              startTime: { gte: startOfMonth },
            },
          }),
          prisma.timesheet.count({
            where: {
              userId: member.user_id,
              tenantId,
              status: 'APPROVED',
              startTime: { gte: startOfMonth },
            },
          }),
          prisma.timesheet.count({
            where: {
              userId: member.user_id,
              tenantId,
              status: 'REJECTED',
              startTime: { gte: startOfMonth },
            },
          }),
        ]);

        const name = member.users?.name || 'Onbekend';
        const email = member.users?.email || '-';
        const dept = (member.users?.department || '-').replace(/"/g, '""');
        const hours = Number(totalHours._sum.total_hours) || 0;

        csvContent += `"${name}","${email}","${dept}",${hours.toFixed(2)},${pending},${approved},${rejected}\n`;
      }

      filename = `team_overzicht_${now.toISOString().split('T')[0]}.csv`;
    } else {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
    }

    // Add BOM for Excel compatibility with UTF-8
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const buffer = await blob.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error("Failed to export data", error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
