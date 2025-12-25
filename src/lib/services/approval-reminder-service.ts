/**
 * Approval Reminder Service
 *
 * Handles automatic reminders for pending approval requests.
 * Notifies managers when they have unprocessed:
 * - Vacation requests
 * - Sick leave reports
 * - Timesheet submissions
 * - Time-for-time (TVT) requests
 *
 * Schedule:
 * - Daily at 09:00: Reminder for items pending > 24 hours
 * - Weekly on Monday: Summary of all pending items
 */

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/services/email-service';

interface ReminderResult {
  success: boolean;
  totalManagers: number;
  emailsSent: number;
  errors: string[];
}

interface PendingApproval {
  type: 'vacation' | 'timesheet' | 'sick_leave';
  typeName: string;
  count: number;
  oldestDate: Date;
  items: {
    id: string;
    employeeName: string | null;
    employeeEmail: string;
    submittedAt: Date;
    description?: string;
    startDate?: Date;
    endDate?: Date;
  }[];
}

interface ManagerPendingApprovals {
  managerId: string;
  managerName: string | null;
  managerEmail: string;
  tenantId: string;
  tenantName: string;
  pendingApprovals: PendingApproval[];
  totalPending: number;
  oldestPending: Date;
}

/**
 * Format date in Dutch locale
 */
function formatDateNL(date: Date): string {
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Calculate days ago
 */
function daysAgo(date: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get pending approvals for all managers
 */
async function getPendingApprovalsForManagers(): Promise<ManagerPendingApprovals[]> {
  const result: ManagerPendingApprovals[] = [];

  // Get all active managers
  const managers = await prisma.tenantUser.findMany({
    where: {
      role: { in: ['MANAGER', 'TENANT_ADMIN'] },
      isActive: true,
      user: { isActive: true },
      tenant: { isActive: true },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      tenant: { select: { id: true, name: true } },
    },
  });

  for (const manager of managers) {
    const pendingApprovals: PendingApproval[] = [];

    // Get pending vacations
    const pendingVacations = await prisma.vacations.findMany({
      where: {
        tenant_id: manager.tenantId,
        status: 'PENDING',
      },
      include: {
        employees: {
          include: {
            users: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    if (pendingVacations.length > 0) {
      const oldestDate = pendingVacations[0].created_at || new Date();
      pendingApprovals.push({
        type: 'vacation',
        typeName: 'Verlofaanvragen',
        count: pendingVacations.length,
        oldestDate,
        items: pendingVacations.map((v) => ({
          id: v.id,
          employeeName: v.employees.users.name,
          employeeEmail: v.employees.users.email,
          submittedAt: v.created_at || new Date(),
          description: v.description || undefined,
          startDate: v.start_date,
          endDate: v.end_date,
        })),
      });
    }

    // Get pending timesheets
    const pendingTimesheets = await prisma.timesheet.findMany({
      where: {
        tenantId: manager.tenantId,
        status: 'PENDING',
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (pendingTimesheets.length > 0) {
      const oldestDate = pendingTimesheets[0].createdAt || new Date();
      pendingApprovals.push({
        type: 'timesheet',
        typeName: 'Urenregistraties',
        count: pendingTimesheets.length,
        oldestDate,
        items: pendingTimesheets.map((t) => ({
          id: t.id,
          employeeName: t.user.name,
          employeeEmail: t.user.email,
          submittedAt: t.createdAt || new Date(),
          description: t.description || undefined,
          startDate: t.date,
        })),
      });
    }

    // Get active sick leaves that need attention (no end date set)
    const activeSickLeaves = await prisma.sick_leaves.findMany({
      where: {
        tenant_id: manager.tenantId,
        status: 'ACTIVE',
        end_date: null,
      },
      include: {
        employees: {
          include: {
            users: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    // Only include sick leaves that have been active for more than 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const oldSickLeaves = activeSickLeaves.filter(
      (sl) => sl.start_date <= threeDaysAgo
    );

    if (oldSickLeaves.length > 0) {
      const oldestDate = oldSickLeaves[0].created_at || new Date();
      pendingApprovals.push({
        type: 'sick_leave',
        typeName: 'Actieve ziekmeldingen',
        count: oldSickLeaves.length,
        oldestDate,
        items: oldSickLeaves.map((sl) => ({
          id: sl.id,
          employeeName: sl.employees.users.name,
          employeeEmail: sl.employees.users.email,
          submittedAt: sl.created_at || new Date(),
          description: sl.reason || undefined,
          startDate: sl.start_date,
        })),
      });
    }

    if (pendingApprovals.length > 0) {
      const totalPending = pendingApprovals.reduce((sum, pa) => sum + pa.count, 0);
      const oldestPending = pendingApprovals.reduce(
        (oldest, pa) => (pa.oldestDate < oldest ? pa.oldestDate : oldest),
        pendingApprovals[0].oldestDate
      );

      result.push({
        managerId: manager.user.id,
        managerName: manager.user.name,
        managerEmail: manager.user.email,
        tenantId: manager.tenantId,
        tenantName: manager.tenant.name,
        pendingApprovals,
        totalPending,
        oldestPending,
      });
    }
  }

  return result;
}

/**
 * Check if manager wants approval notifications
 */
async function shouldSendApprovalReminder(userId: string): Promise<boolean> {
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preferences) return true;
  return preferences.email_approval_pending ?? true;
}

/**
 * Get urgency level based on oldest pending item
 */
function getUrgencyLevel(daysOld: number): 'normal' | 'warning' | 'urgent' {
  if (daysOld >= 7) return 'urgent';
  if (daysOld >= 3) return 'warning';
  return 'normal';
}

/**
 * Send approval reminder email
 */
async function sendApprovalReminderEmail(manager: ManagerPendingApprovals): Promise<boolean> {
  const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';
  const oldestDays = daysAgo(manager.oldestPending);
  const urgency = getUrgencyLevel(oldestDays);

  let subject: string;
  if (urgency === 'urgent') {
    subject = `🚨 Urgent: ${manager.totalPending} openstaande goedkeuringen wachten al ${oldestDays} dagen`;
  } else if (urgency === 'warning') {
    subject = `⚠️ Herinnering: ${manager.totalPending} openstaande goedkeuringen`;
  } else {
    subject = `📋 Overzicht: ${manager.totalPending} aanvragen wachten op uw goedkeuring`;
  }

  const approvalSections = manager.pendingApprovals
    .map((pa) => {
      const itemsList = pa.items
        .slice(0, 5) // Show max 5 items per category
        .map((item) => {
          const days = daysAgo(item.submittedAt);
          const daysText = days === 0 ? 'vandaag' : days === 1 ? 'gisteren' : `${days} dagen geleden`;
          const dateRange = item.startDate && item.endDate
            ? ` (${formatDateNL(item.startDate)} - ${formatDateNL(item.endDate)})`
            : item.startDate
              ? ` (${formatDateNL(item.startDate)})`
              : '';
          return `<li>${item.employeeName || item.employeeEmail}${dateRange} - ingediend ${daysText}</li>`;
        })
        .join('');

      const moreText = pa.count > 5 ? `<li><em>...en ${pa.count - 5} meer</em></li>` : '';

      const urgencyColor =
        pa.type === 'timesheet'
          ? '#3498db'
          : pa.type === 'vacation'
            ? '#27ae60'
            : '#e74c3c';

      return `
        <div style="margin-bottom: 20px;">
          <h3 style="color: ${urgencyColor}; margin-bottom: 10px;">
            ${pa.typeName} (${pa.count})
          </h3>
          <ul style="margin: 0; padding-left: 20px;">
            ${itemsList}
            ${moreText}
          </ul>
        </div>
      `;
    })
    .join('');

  const urgencyBanner =
    urgency === 'urgent'
      ? `
        <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f5c6cb;">
          <p style="color: #721c24; margin: 0;">
            <strong>⚠️ Let op:</strong> Sommige aanvragen wachten al meer dan een week op goedkeuring.
            Snelle afhandeling wordt gewaardeerd door uw medewerkers.
          </p>
        </div>
      `
      : urgency === 'warning'
        ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba;">
          <p style="color: #856404; margin: 0;">
            <strong>📅 Herinnering:</strong> Enkele aanvragen wachten al enkele dagen op goedkeuring.
          </p>
        </div>
      `
        : '';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Openstaande Goedkeuringen</h2>
      <p>Beste ${manager.managerName || 'Manager'},</p>
      <p>Er zijn ${manager.totalPending} aanvragen die wachten op uw goedkeuring:</p>

      ${urgencyBanner}

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        ${approvalSections}
      </div>

      <p>
        <a href="${portalUrl}/approvals" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Bekijk Alle Aanvragen
        </a>
      </p>

      <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        U ontvangt deze herinnering omdat er openstaande goedkeuringsaanvragen zijn.
        U kunt deze meldingen uitschakelen in uw profielinstellingen.
      </p>

      <p>Met vriendelijke groet,<br>ADS Personeelsapp</p>
    </div>
  `;

  return sendEmail(manager.managerEmail, subject, html);
}

/**
 * Process approval reminders
 */
export async function processApprovalReminders(): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    totalManagers: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const managersWithPending = await getPendingApprovalsForManagers();
    result.totalManagers = managersWithPending.length;

    for (const manager of managersWithPending) {
      try {
        const shouldSend = await shouldSendApprovalReminder(manager.managerId);
        if (!shouldSend) continue;

        const sent = await sendApprovalReminderEmail(manager);
        if (sent) {
          result.emailsSent++;

          // Log the reminder
          await prisma.auditLog.create({
            data: {
              action: 'APPROVAL_REMINDER_SENT',
              userId: manager.managerId,
              tenantId: manager.tenantId,
              details: JSON.stringify({
                totalPending: manager.totalPending,
                categories: manager.pendingApprovals.map((pa) => ({
                  type: pa.type,
                  count: pa.count,
                })),
                oldestDays: daysAgo(manager.oldestPending),
              }),
              ipAddress: 'system',
            },
          });

          // Create in-app notification for urgent items
          const oldestDays = daysAgo(manager.oldestPending);
          if (oldestDays >= 3) {
            await prisma.notifications.create({
              data: {
                tenant_id: manager.tenantId,
                user_id: manager.managerId,
                type: 'APPROVAL_PENDING',
                title: 'Openstaande goedkeuringen',
                message: `U heeft ${manager.totalPending} aanvragen wachten op goedkeuring. De oudste is ${oldestDays} dagen oud.`,
                action_url: '/approvals',
              },
            });
          }
        }
      } catch (error) {
        result.errors.push(`Failed to send to ${manager.managerEmail}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}
