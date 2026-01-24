/**
 * Dashboard Stats API
 *
 * Provides comprehensive KPI metrics for the dashboard:
 * - Basic stats: hours, approvals, pending items
 * - Extended stats: team metrics, sick leave, leave balance alerts
 * - Manager-specific metrics: pending approvals, team health
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-dashboard-stats");

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
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;
    const userRole = session.user.role as string;

    // Get date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    // Get employee ID for current user
    const employee = await prisma.employees.findFirst({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
      select: { id: true },
    });

    const employeeId = employee?.id;

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
          approved_at: {
            gte: startOfWeek
          }
        }
      }),

      // Total hours this month (only completed timesheets with endTime set)
      prisma.timesheet.aggregate({
        where: {
          userId,
          tenantId,
          startTime: {
            gte: startOfMonth
          },
          endTime: {
            not: undefined
          }
        },
        _sum: {
          total_hours: true
        }
      }),

      // Upcoming approved vacations
      employeeId ? prisma.vacations.count({
        where: {
          employee_id: employeeId,
          tenant_id: tenantId,
          status: 'APPROVED',
          start_date: {
            gte: now
          }
        }
      }) : Promise.resolve(0),

      // Active sick leaves for user
      employeeId ? prisma.sick_leaves.count({
        where: {
          employee_id: employeeId,
          tenant_id: tenantId,
          end_date: null // Still ongoing
        }
      }) : Promise.resolve(0),

      // Expiring leave balances (within 3 months)
      employeeId ? prisma.leaveBalance.count({
        where: {
          employee_id: employeeId,
          tenant_id: tenantId,
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
      }) : Promise.resolve(0),

      // Pending vacation requests
      employeeId ? prisma.vacations.count({
        where: {
          employee_id: employeeId,
          tenant_id: tenantId,
          status: 'PENDING'
        }
      }) : Promise.resolve(0),

      // Calculate overtime (assuming 8h/day standard)
      prisma.timesheet.findMany({
        where: {
          userId,
          tenantId,
          startTime: {
            gte: startOfMonth
          },
          endTime: {
            not: undefined
          }
        },
        select: {
          total_hours: true
        }
      })
    ]);

    // Calculate overtime hours (hours > 8 per day considered overtime)
    const overtimeHours = overtimeData.reduce((acc, ts) => {
      const hours = Number(ts.total_hours) || 0;
      return acc + Math.max(0, hours - 8);
    }, 0);

    const stats: DashboardStats = {
      pendingTimesheets,
      approvedThisWeek,
      totalHoursThisMonth: Math.round((Number(hoursThisMonth._sum.total_hours) || 0) * 10) / 10,
      upcomingVacations,
      activeSickLeaves,
      expiringLeaveWarnings: expiringLeaveBalances,
      pendingVacationRequests,
      overtimeHoursThisMonth: Math.round(overtimeHours * 10) / 10
    };

    // Add manager-specific stats if user is MANAGER, TENANT_ADMIN, or SUPERUSER
    if (['MANAGER', 'TENANT_ADMIN', 'SUPERUSER'].includes(userRole || '')) {
      const thirtyFiveDaysAgo = new Date();
      thirtyFiveDaysAgo.setDate(thirtyFiveDaysAgo.getDate() - 35);

      const [
        teamMembers,
        teamPendingVacations,
        teamPendingTimesheets,
        teamSickLeaves,
        uwvAlerts
      ] = await Promise.all([
        // Team member count (active employees: no end_date or end_date in future)
        prisma.employees.count({
          where: {
            tenant_id: tenantId,
            OR: [
              { end_date: null },
              { end_date: { gte: now } }
            ]
          }
        }),

        // Pending vacation requests for team
        prisma.vacations.count({
          where: {
            tenant_id: tenantId,
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
        prisma.sick_leaves.count({
          where: {
            tenant_id: tenantId,
            end_date: null
          }
        }),

        // UWV alert count (sick leaves >= 35 days, approaching 42-day deadline)
        prisma.sick_leaves.count({
          where: {
            tenant_id: tenantId,
            end_date: null,
            uwv_reported: false,
            start_date: {
              lte: thirtyFiveDaysAgo
            }
          }
        })
      ]);

      stats.teamMemberCount = teamMembers;
      stats.teamPendingApprovals = teamPendingVacations + teamPendingTimesheets;
      stats.teamSickLeaveCount = teamSickLeaves;
      stats.uwvAlertCount = uwvAlerts;
    }

    // Add cache headers for performance (cache for 30 seconds, stale-while-revalidate for 60s)
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    logger.error("Failed to fetch dashboard stats", error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
