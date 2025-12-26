/**
 * Leave Expiration Reminder Service
 *
 * Handles automatic reminders for expiring leave balances.
 * Dutch labor law requires employers to inform employees about expiring leave.
 *
 * Leave types and expiration rules:
 * - Statutory leave (wettelijk verlof): Expires July 1st of the following year
 * - Extra leave (bovenwettelijk verlof): Typically expires after 5 years
 * - Compensation hours (tijd-voor-tijd): Usually expires end of year
 *
 * Schedule:
 * - Weekly check on Monday 09:00
 * - Warnings at: 3 months, 1 month, 2 weeks before expiration
 */

import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/services/email-service';

interface ReminderResult {
  success: boolean;
  totalUsers: number;
  emailsSent: number;
  errors: string[];
}

interface ExpiringLeaveInfo {
  userId: string;
  userName: string | null;
  userEmail: string;
  tenantId: string;
  tenantName: string;
  expiringItems: {
    type: 'statutory' | 'extra' | 'compensation';
    typeName: string;
    remainingDays: number;
    expiryDate: Date;
    daysUntilExpiry: number;
    urgencyLevel: 'warning' | 'urgent' | 'critical';
  }[];
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
}

/**
 * Get urgency level based on days until expiry
 */
function getUrgencyLevel(daysUntilExpiry: number): 'warning' | 'urgent' | 'critical' {
  if (daysUntilExpiry <= 14) return 'critical';
  if (daysUntilExpiry <= 30) return 'urgent';
  return 'warning';
}

/**
 * Get readable name for leave type in Dutch
 */
function getLeaveTypeName(type: 'statutory' | 'extra' | 'compensation'): string {
  switch (type) {
    case 'statutory':
      return 'Wettelijk verlof';
    case 'extra':
      return 'Bovenwettelijk verlof';
    case 'compensation':
      return 'Tijd-voor-tijd uren';
  }
}

/**
 * Format date in Dutch locale
 */
function formatDateNL(date: Date): string {
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Find users with expiring leave balances
 */
async function findUsersWithExpiringLeave(): Promise<ExpiringLeaveInfo[]> {
  const today = new Date();
  const threeMonthsFromNow = new Date(today);
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  // Get all leave balances with expiring leave within 3 months
  const leaveBalances = await prisma.leaveBalance.findMany({
    where: {
      OR: [
        {
          statutory_expiry: {
            gte: today,
            lte: threeMonthsFromNow,
          },
          statutory_days: {
            gt: 0,
          },
        },
        {
          extra_expiry: {
            gte: today,
            lte: threeMonthsFromNow,
          },
          extra_days: {
            gt: 0,
          },
        },
        {
          compensation_expiry: {
            gte: today,
            lte: threeMonthsFromNow,
          },
          compensation_hours: {
            gt: 0,
          },
        },
      ],
    },
    include: {
      employees: {
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tenants: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const usersWithExpiring: ExpiringLeaveInfo[] = [];

  for (const balance of leaveBalances) {
    const user = balance.employees.users;
    const tenant = balance.employees.tenants;
    const expiringItems: ExpiringLeaveInfo['expiringItems'] = [];

    // Check statutory leave
    if (balance.statutory_expiry && balance.statutory_days) {
      const remaining = Number(balance.statutory_days) - Number(balance.statutory_used || 0);
      if (remaining > 0 && balance.statutory_expiry >= today && balance.statutory_expiry <= threeMonthsFromNow) {
        const daysUntilExpiry = daysBetween(today, balance.statutory_expiry);
        expiringItems.push({
          type: 'statutory',
          typeName: getLeaveTypeName('statutory'),
          remainingDays: remaining,
          expiryDate: balance.statutory_expiry,
          daysUntilExpiry,
          urgencyLevel: getUrgencyLevel(daysUntilExpiry),
        });
      }
    }

    // Check extra leave
    if (balance.extra_expiry && balance.extra_days) {
      const remaining = Number(balance.extra_days) - Number(balance.extra_used || 0);
      if (remaining > 0 && balance.extra_expiry >= today && balance.extra_expiry <= threeMonthsFromNow) {
        const daysUntilExpiry = daysBetween(today, balance.extra_expiry);
        expiringItems.push({
          type: 'extra',
          typeName: getLeaveTypeName('extra'),
          remainingDays: remaining,
          expiryDate: balance.extra_expiry,
          daysUntilExpiry,
          urgencyLevel: getUrgencyLevel(daysUntilExpiry),
        });
      }
    }

    // Check compensation hours
    if (balance.compensation_expiry && balance.compensation_hours) {
      const remaining = Number(balance.compensation_hours) - Number(balance.compensation_used || 0);
      if (remaining > 0 && balance.compensation_expiry >= today && balance.compensation_expiry <= threeMonthsFromNow) {
        const daysUntilExpiry = daysBetween(today, balance.compensation_expiry);
        expiringItems.push({
          type: 'compensation',
          typeName: getLeaveTypeName('compensation'),
          remainingDays: remaining,
          expiryDate: balance.compensation_expiry,
          daysUntilExpiry,
          urgencyLevel: getUrgencyLevel(daysUntilExpiry),
        });
      }
    }

    if (expiringItems.length > 0) {
      usersWithExpiring.push({
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        tenantId: tenant.id,
        tenantName: tenant.name,
        expiringItems,
      });
    }
  }

  return usersWithExpiring;
}

/**
 * Check if user wants to receive leave expiry notifications
 */
async function shouldSendLeaveExpiryReminder(userId: string): Promise<boolean> {
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Default to true if no preference set
  if (!preferences) return true;

  return preferences.email_leave_expiring ?? true;
}

/**
 * Get urgency color for email styling
 */
function getUrgencyColor(level: 'warning' | 'urgent' | 'critical'): { bg: string; border: string; text: string } {
  switch (level) {
    case 'critical':
      return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' };
    case 'urgent':
      return { bg: '#fff3cd', border: '#ffeeba', text: '#856404' };
    case 'warning':
      return { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' };
  }
}

/**
 * Send leave expiry warning email
 */
async function sendLeaveExpiryEmail(info: ExpiringLeaveInfo): Promise<boolean> {
  const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';
  const mostUrgent = info.expiringItems.reduce((a, b) =>
    a.daysUntilExpiry < b.daysUntilExpiry ? a : b
  );

  let subject: string;
  if (mostUrgent.urgencyLevel === 'critical') {
    subject = '🚨 Urgent: Je verlof verloopt binnenkort!';
  } else if (mostUrgent.urgencyLevel === 'urgent') {
    subject = '⚠️ Let op: Je verlof verloopt binnenkort';
  } else {
    subject = '📅 Herinnering: Verlof dat binnenkort verloopt';
  }

  const itemsHtml = info.expiringItems
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    .map((item) => {
      const colors = getUrgencyColor(item.urgencyLevel);
      const unit = item.type === 'compensation' ? 'uren' : 'dagen';
      return `
        <div style="background-color: ${colors.bg}; padding: 15px; border-radius: 5px; margin: 10px 0; border: 1px solid ${colors.border};">
          <p style="color: ${colors.text}; margin: 0 0 10px 0; font-weight: bold;">
            ${item.typeName}
          </p>
          <p style="color: ${colors.text}; margin: 0;">
            <strong>${item.remainingDays} ${unit}</strong> nog beschikbaar<br>
            Verloopt op: <strong>${formatDateNL(item.expiryDate)}</strong><br>
            (nog ${item.daysUntilExpiry} dagen)
          </p>
        </div>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Verlof dat binnenkort verloopt</h2>
      <p>Beste ${info.userName || 'Collega'},</p>
      <p>Dit is een herinnering dat je nog verlofdagen hebt die binnenkort verlopen.
         Verlof dat niet op tijd wordt opgenomen vervalt automatisch.</p>

      ${itemsHtml}

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>💡 Tip:</strong> Plan nu je verlof om te voorkomen dat je dagen verliest!</p>
      </div>

      <p>
        <a href="${portalUrl}/vacation" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Verlof Aanvragen
        </a>
      </p>

      <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        Je ontvangt deze herinnering omdat je nog verlofdagen hebt die binnenkort verlopen.
        Je kunt deze meldingen uitschakelen in je profielinstellingen.
      </p>

      <p>Met vriendelijke groet,<br>ADS Personeelsapp</p>
    </div>
  `;

  return sendEmail(info.userEmail, subject, html);
}

/**
 * Process leave expiration reminders
 */
export async function processLeaveExpirationReminders(): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    totalUsers: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const usersWithExpiring = await findUsersWithExpiringLeave();
    result.totalUsers = usersWithExpiring.length;

    for (const userInfo of usersWithExpiring) {
      try {
        const shouldSend = await shouldSendLeaveExpiryReminder(userInfo.userId);
        if (!shouldSend) continue;

        const sent = await sendLeaveExpiryEmail(userInfo);
        if (sent) {
          result.emailsSent++;

          // Log the reminder
          await prisma.auditLog.create({
            data: {
              action: 'LEAVE_EXPIRY_REMINDER_SENT',
              userId: userInfo.userId,
              tenantId: userInfo.tenantId,
              details: JSON.stringify({
                expiringItems: userInfo.expiringItems.map((item) => ({
                  type: item.type,
                  remainingDays: item.remainingDays,
                  expiryDate: item.expiryDate.toISOString(),
                  daysUntilExpiry: item.daysUntilExpiry,
                  urgencyLevel: item.urgencyLevel,
                })),
              }),
              ipAddress: 'system',
            },
          });

          // Create in-app notification
          for (const item of userInfo.expiringItems) {
            if (item.urgencyLevel === 'critical' || item.urgencyLevel === 'urgent') {
              await prisma.notifications.create({
                data: {
                  tenant_id: userInfo.tenantId,
                  user_id: userInfo.userId,
                  type: 'LEAVE_EXPIRING',
                  title: `${item.typeName} verloopt binnenkort`,
                  message: `Je hebt nog ${item.remainingDays} ${item.type === 'compensation' ? 'uren' : 'dagen'} die verlopen op ${formatDateNL(item.expiryDate)}.`,
                  action_url: '/vacation',
                },
              });
            }
          }
        }
      } catch (error) {
        result.errors.push(`Failed to send to ${userInfo.userEmail}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}

/**
 * Notify managers about team members with expiring leave
 */
export async function notifyManagersAboutExpiringLeave(): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    totalUsers: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const usersWithExpiring = await findUsersWithExpiringLeave();

    // Group by tenant and filter for urgent/critical only
    const tenantMap = new Map<string, { tenantName: string; users: ExpiringLeaveInfo[] }>();

    for (const userInfo of usersWithExpiring) {
      const urgentItems = userInfo.expiringItems.filter(
        (item) => item.urgencyLevel === 'critical' || item.urgencyLevel === 'urgent'
      );

      if (urgentItems.length > 0) {
        const existing = tenantMap.get(userInfo.tenantId);
        if (existing) {
          existing.users.push({ ...userInfo, expiringItems: urgentItems });
        } else {
          tenantMap.set(userInfo.tenantId, {
            tenantName: userInfo.tenantName,
            users: [{ ...userInfo, expiringItems: urgentItems }],
          });
        }
      }
    }

    // Get managers for each tenant
    for (const [tenantId, tenantData] of tenantMap) {
      const managers = await prisma.tenantUser.findMany({
        where: {
          tenantId,
          role: 'MANAGER',
          isActive: true,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      for (const manager of managers) {
        try {
          const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';
          const subject = `Manager Alert: ${tenantData.users.length} medewerker(s) met verlopend verlof`;

          const userList = tenantData.users
            .map((u) => {
              const items = u.expiringItems
                .map((item) => `${item.remainingDays} ${item.type === 'compensation' ? 'uren' : 'dagen'} ${item.typeName.toLowerCase()}`)
                .join(', ');
              return `<li>${u.userName || u.userEmail}: ${items}</li>`;
            })
            .join('');

          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #e74c3c;">Manager Alert: Verlopend Verlof</h2>
              <p>Beste ${manager.user.name || 'Manager'},</p>
              <p>De volgende medewerkers hebben verlof dat binnenkort verloopt:</p>

              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px;">
                  ${userList}
                </ul>
              </div>

              <p>
                <a href="${portalUrl}/employees" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                  Bekijk Team Overzicht
                </a>
              </p>

              <p>Met vriendelijke groet,<br>ADS Personeelsapp</p>
            </div>
          `;

          const sent = await sendEmail(manager.user.email, subject, html);
          if (sent) {
            result.emailsSent++;
            result.totalUsers++;
          }
        } catch (error) {
          result.errors.push(`Failed to notify manager ${manager.user.email}: ${error}`);
        }
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}
