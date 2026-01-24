/**
 * Dashboard Analytics API
 *
 * Provides time-series data for charts and visualizations:
 * - Weekly hours breakdown (last 12 weeks)
 * - Monthly trends (last 6 months)
 * - Leave usage by type
 * - Team productivity (for managers)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

interface WeeklyData {
  week: string;
  weekLabel: string;
  hours: number;
  overtime: number;
}

interface MonthlyData {
  month: string;
  monthLabel: string;
  hours: number;
  vacationDays: number;
  sickDays: number;
}

interface LeaveBreakdown {
  type: string;
  days: number;
  color: string;
}

interface TeamMemberStats {
  name: string;
  hours: number;
  approvalRate: number;
}

interface AnalyticsResponse {
  weeklyHours: WeeklyData[];
  monthlyTrends: MonthlyData[];
  leaveBreakdown: LeaveBreakdown[];
  teamStats?: TeamMemberStats[];
  period: {
    start: string;
    end: string;
  };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;
    const userRole = session.user.role as string;

    const now = new Date();

    // Calculate date ranges
    const twelveWeeksAgo = new Date(now);
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84); // 12 weeks

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get employee ID
    const employee = await prisma.employees.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
      select: { id: true },
    });

    const employeeId = employee?.id;

    // Fetch data in parallel
    const [timesheets, vacations, sickLeaves, leaveBalance] = await Promise.all([
      // All timesheets in the last 12 weeks
      prisma.timesheet.findMany({
        where: {
          userId,
          tenantId,
          startTime: {
            gte: twelveWeeksAgo,
          },
          endTime: {
            not: undefined,
          },
        },
        select: {
          startTime: true,
          total_hours: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      }),

      // Vacations in the last 6 months
      employeeId
        ? prisma.vacations.findMany({
            where: {
              employee_id: employeeId,
              tenant_id: tenantId,
              status: 'APPROVED',
              start_date: {
                gte: sixMonthsAgo,
              },
            },
            select: {
              start_date: true,
              end_date: true,
              type: true,
            },
          })
        : Promise.resolve([]),

      // Sick leaves in the last 6 months
      employeeId
        ? prisma.sick_leaves.findMany({
            where: {
              employee_id: employeeId,
              tenant_id: tenantId,
              start_date: {
                gte: sixMonthsAgo,
              },
            },
            select: {
              start_date: true,
              end_date: true,
            },
          })
        : Promise.resolve([]),

      // Current leave balance
      employeeId
        ? prisma.leaveBalance.findFirst({
            where: {
              employee_id: employeeId,
              tenant_id: tenantId,
              year: now.getFullYear(),
            },
            select: {
              statutory_days: true,
              extra_days: true,
              compensation_hours: true,
              statutory_used: true,
              extra_used: true,
            },
          })
        : Promise.resolve(null),
    ]);

    // Process weekly hours
    const weeklyHours: WeeklyData[] = [];
    const dutchMonths = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - i * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekTimesheets = timesheets.filter((ts) => {
        const date = new Date(ts.startTime);
        return date >= weekStart && date < weekEnd;
      });

      const totalHours = weekTimesheets.reduce((sum, ts) => sum + (Number(ts.total_hours) || 0), 0);
      const overtime = weekTimesheets.reduce((sum, ts) => {
        const hours = Number(ts.total_hours) || 0;
        return sum + Math.max(0, hours - 8);
      }, 0);

      const weekLabel = `${weekStart.getDate()} ${dutchMonths[weekStart.getMonth()]}`;

      weeklyHours.push({
        week: weekStart.toISOString().split('T')[0],
        weekLabel,
        hours: Math.round(totalHours * 10) / 10,
        overtime: Math.round(overtime * 10) / 10,
      });
    }

    // Process monthly trends
    const monthlyTrends: MonthlyData[] = [];
    const dutchMonthsFull = [
      'Januari',
      'Februari',
      'Maart',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Augustus',
      'September',
      'Oktober',
      'November',
      'December',
    ];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthTimesheets = timesheets.filter((ts) => {
        const date = new Date(ts.startTime);
        return date >= monthStart && date <= monthEnd;
      });

      const monthVacations = vacations.filter((v) => {
        const startDate = new Date(v.start_date);
        return startDate >= monthStart && startDate <= monthEnd;
      });

      const monthSickLeaves = sickLeaves.filter((s) => {
        const startDate = new Date(s.start_date);
        return startDate >= monthStart && startDate <= monthEnd;
      });

      const totalHours = monthTimesheets.reduce((sum, ts) => sum + (Number(ts.total_hours) || 0), 0);

      // Calculate vacation days
      const vacationDays = monthVacations.reduce((sum, v) => {
        const start = new Date(v.start_date);
        const end = new Date(v.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }, 0);

      // Calculate sick days
      const sickDays = monthSickLeaves.reduce((sum, s) => {
        const start = new Date(s.start_date);
        const end = s.end_date ? new Date(s.end_date) : new Date();
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return sum + days;
      }, 0);

      monthlyTrends.push({
        month: monthStart.toISOString().split('T')[0].slice(0, 7),
        monthLabel: dutchMonthsFull[monthStart.getMonth()].slice(0, 3),
        hours: Math.round(totalHours * 10) / 10,
        vacationDays,
        sickDays,
      });
    }

    // Leave breakdown for pie chart
    const leaveBreakdown: LeaveBreakdown[] = [];
    if (leaveBalance) {
      const remainingStatutory = (Number(leaveBalance.statutory_days) || 0) - (Number(leaveBalance.statutory_used) || 0);
      const remainingExtra = (Number(leaveBalance.extra_days) || 0) - (Number(leaveBalance.extra_used) || 0);
      const compensationHours = Number(leaveBalance.compensation_hours) || 0;

      if (remainingStatutory > 0) {
        leaveBreakdown.push({
          type: 'Wettelijk verlof',
          days: Math.round(remainingStatutory * 10) / 10,
          color: '#8b5cf6',
        });
      }
      if (remainingExtra > 0) {
        leaveBreakdown.push({
          type: 'Bovenwettelijk',
          days: Math.round(remainingExtra * 10) / 10,
          color: '#ec4899',
        });
      }
      if (compensationHours > 0) {
        leaveBreakdown.push({
          type: 'Comp. uren',
          days: Math.round((compensationHours / 8) * 10) / 10, // Convert hours to days
          color: '#06b6d4',
        });
      }
      // Add used days
      const usedTotal = (Number(leaveBalance.statutory_used) || 0) + (Number(leaveBalance.extra_used) || 0);
      if (usedTotal > 0) {
        leaveBreakdown.push({
          type: 'Opgenomen',
          days: Math.round(usedTotal * 10) / 10,
          color: '#94a3b8',
        });
      }
    }

    const response: AnalyticsResponse = {
      weeklyHours,
      monthlyTrends,
      leaveBreakdown,
      period: {
        start: twelveWeeksAgo.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0],
      },
    };

    // Add team stats for managers
    if (['MANAGER', 'TENANT_ADMIN', 'SUPERUSER'].includes(userRole || '')) {
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
            },
          },
        },
        take: 10, // Limit to top 10
      });

      const teamStatsPromises = teamMembers.map(async (member) => {
        if (!member.user_id) return null;

        const [monthTimesheets, approvedCount, totalCount] = await Promise.all([
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
              status: 'APPROVED',
              startTime: { gte: startOfMonth },
            },
          }),
          prisma.timesheet.count({
            where: {
              userId: member.user_id,
              tenantId,
              startTime: { gte: startOfMonth },
            },
          }),
        ]);

        const approvalRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100;

        return {
          name: member.users?.name || 'Onbekend',
          hours: Math.round((Number(monthTimesheets._sum.total_hours) || 0) * 10) / 10,
          approvalRate,
        };
      });

      const teamStatsResults = await Promise.all(teamStatsPromises);
      response.teamStats = teamStatsResults
        .filter((s): s is TeamMemberStats => s !== null)
        .sort((a, b) => b.hours - a.hours);
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('[Dashboard Analytics] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
