/**
 * Dashboard Stats API
 *
 * Provides comprehensive KPI metrics for the dashboard:
 * - Basic stats: hours, approvals, pending items
 * - Extended stats: team metrics, sick leave, leave balance alerts
 * - Manager-specific metrics: pending approvals, team health
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

interface DashboardStats {
  // Basic stats (existing)
  pendingTimesheets: number;
  approvedThisWeek: number;
  totalHoursThisMonth: number;
  upcomingVacations: number;

  // Extended stats (new)
  activeSickLeaves: number;
  expiringLeaveWarnings: number;
  pendingVacationRequests: number;
  overtimeHoursThisMonth: number;

  // Manager-specific (for managers/admins)
  teamMemberCount?: number;
  teamPendingApprovals?: number;
  teamSickLeaveCount?: number;
  uwvAlertCount?: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const tenantId = session.user.tenantId;
    const userRole = session.user.role;

    // Get date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    // Fetch basic user stats in parallel
    const [
      pendingTimesheets,
      approvedThisWeek,
      hoursThisMonth,
      upcomingVacations,
      activeSickLeaves,
      expiringLeaveBalances,
      pendingVacationRequests,
      overtimeData
    ] = await Promise.all([
      // Pending timesheets for user
      prisma.timesheet.count({
        where: {
          userId,
          tenantId,
          status: 'PENDING'
        }
      }),

      // Approved timesheets this week
      prisma.timesheet.count({
        where: {
          userId,
          tenantId,
          status: 'APPROVED',
          approvedAt: {
            gte: startOfWeek
          }
        }
      }),

      // Total hours this month
      prisma.timesheet.aggregate({
        where: {
          userId,
          tenantId,
          startTime: {
            gte: startOfMonth
          },
          endTime: {
            not: null
          }
        },
        _sum: {
          totalHours: true
        }
      }),

      // Upcoming approved vacations
      prisma.vacation.count({
        where: {
          userId,
          tenantId,
          status: 'APPROVED',
          startDate: {
            gte: now
          }
        }
      }),

      // Active sick leaves for user
      prisma.sickLeave.count({
        where: {
          userId,
          tenantId,
          endDate: null // Still ongoing
        }
      }),

      // Expiring leave balances (within 3 months)
      prisma.leaveBalance.count({
        where: {
          userId,
          tenantId,
          year: now.getFullYear(),
          OR: [
            {
              statutory_expiry: {
                lte: threeMonthsFromNow,
                gte: now
              },
              statutory_days: {
                gt: 0
              }
            },
            {
              extra_expiry: {
                lte: threeMonthsFromNow,
                gte: now
              },
              extra_days: {
                gt: 0
              }
            },
            {
              compensation_expiry: {
                lte: threeMonthsFromNow,
                gte: now
              },
              compensation_hours: {
                gt: 0
              }
            }
          ]
        }
      }),

      // Pending vacation requests
      prisma.vacation.count({
        where: {
          userId,
          tenantId,
          status: 'PENDING'
        }
      }),

      // Calculate overtime (assuming 8h/day standard)
      prisma.timesheet.findMany({
        where: {
          userId,
          tenantId,
          startTime: {
            gte: startOfMonth
          },
          endTime: {
            not: null
          }
        },
        select: {
          totalHours: true
        }
      })
    ]);

    // Calculate overtime hours (hours > 8 per day considered overtime)
    const overtimeHours = overtimeData.reduce((acc, ts) => {
      const hours = ts.totalHours || 0;
      return acc + Math.max(0, hours - 8);
    }, 0);

    const stats: DashboardStats = {
      pendingTimesheets,
      approvedThisWeek,
      totalHoursThisMonth: Math.round((hoursThisMonth._sum.totalHours || 0) * 10) / 10,
      upcomingVacations,
      activeSickLeaves,
      expiringLeaveWarnings: expiringLeaveBalances,
      pendingVacationRequests,
      overtimeHoursThisMonth: Math.round(overtimeHours * 10) / 10
    };

    // Add manager-specific stats if user is MANAGER, TENANT_ADMIN, or SUPERUSER
    if (['MANAGER', 'TENANT_ADMIN', 'SUPERUSER'].includes(userRole || '')) {
      const fortyTwoDaysAgo = new Date();
      fortyTwoDaysAgo.setDate(fortyTwoDaysAgo.getDate() - 42);

      const [
        teamMembers,
        teamPendingVacations,
        teamPendingTimesheets,
        teamSickLeaves,
        uwvAlerts
      ] = await Promise.all([
        // Team member count
        prisma.tenantUser.count({
          where: {
            tenantId,
            isActive: true
          }
        }),

        // Pending vacation requests for team
        prisma.vacation.count({
          where: {
            tenantId,
            status: 'PENDING'
          }
        }),

        // Pending timesheets for team
        prisma.timesheet.count({
          where: {
            tenantId,
            status: 'PENDING'
          }
        }),

        // Active sick leaves in team
        prisma.sickLeave.count({
          where: {
            tenantId,
            endDate: null
          }
        }),

        // UWV alert count (sick leaves >= 35 days, approaching 42-day deadline)
        prisma.sickLeave.count({
          where: {
            tenantId,
            endDate: null,
            reportedToUwv: false,
            startDate: {
              lte: fortyTwoDaysAgo
            }
          }
        })
      ]);

      stats.teamMemberCount = teamMembers;
      stats.teamPendingApprovals = teamPendingVacations + teamPendingTimesheets;
      stats.teamSickLeaveCount = teamSickLeaves;
      stats.uwvAlertCount = uwvAlerts;
    }

    return NextResponse.json(stats);

  } catch (error) {
    console.error('[Dashboard Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
