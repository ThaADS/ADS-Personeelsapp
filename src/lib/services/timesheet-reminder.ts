/**
 * Timesheet Reminder Service
 *
 * Handles automatic reminders for incomplete timesheets.
 * Sends email notifications to users who haven't submitted their weekly timesheets.
 *
 * Schedule:
 * - Friday 15:00: Primary reminder "Don't forget to submit your timesheet"
 * - Monday 09:00: Escalation "Your timesheet from last week is still pending"
 */

import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/services/email-service';

interface ReminderResult {
  success: boolean;
  totalUsers: number;
  emailsSent: number;
  errors: string[];
}

interface UserWithIncompleteTimesheet {
  id: string;
  name: string | null;
  email: string;
  tenantId: string;
  tenantName: string;
  missingDays: number;
  weekStart: Date;
  weekEnd: Date;
}

/**
 * Get the start and end of a week (Monday to Sunday)
 */
function getWeekBounds(date: Date = new Date()): { start: Date; end: Date } {
  const current = new Date(date);
  const dayOfWeek = current.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(current);
  monday.setDate(current.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

/**
 * Get the previous week bounds
 */
function getPreviousWeekBounds(): { start: Date; end: Date } {
  const today = new Date();
  const previousWeek = new Date(today);
  previousWeek.setDate(today.getDate() - 7);
  return getWeekBounds(previousWeek);
}

/**
 * Find users with incomplete timesheets for a given week
 */
async function findUsersWithIncompleteTimesheets(
  weekStart: Date,
  weekEnd: Date,
  minWorkDays: number = 5
): Promise<UserWithIncompleteTimesheet[]> {
  // Get all active users with their tenant info
  const activeUsers = await prisma.tenantUser.findMany({
    where: {
      isActive: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      tenant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  const usersWithIncomplete: UserWithIncompleteTimesheet[] = [];

  for (const tenantUser of activeUsers) {
    // Count approved/submitted timesheets for this user in the week
    const timesheetCount = await prisma.timesheet.count({
      where: {
        userId: tenantUser.userId,
        tenantId: tenantUser.tenantId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
    });

    // If user has fewer than expected workdays, they have incomplete timesheets
    if (timesheetCount < minWorkDays) {
      usersWithIncomplete.push({
        id: tenantUser.userId,
        name: tenantUser.user.name,
        email: tenantUser.user.email,
        tenantId: tenantUser.tenantId,
        tenantName: tenantUser.tenant.name,
        missingDays: minWorkDays - timesheetCount,
        weekStart,
        weekEnd,
      });
    }
  }

  return usersWithIncomplete;
}

/**
 * Check user notification preferences
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function shouldSendReminder(userId: string, _tenantId: string): Promise<boolean> {
  const preferences = await prisma.notificationPreference.findFirst({
    where: {
      userId,
    },
  });

  // Default to true if no preference set
  if (!preferences) return true;

  return preferences.email_timesheet_reminder ?? true;
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
 * Send Friday reminder email
 */
async function sendFridayReminder(user: UserWithIncompleteTimesheet): Promise<boolean> {
  const subject = 'Herinnering: Vergeet je weekstaat niet in te leveren';
  const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Herinnering: Weekstaat Inleveren</h2>
      <p>Beste ${user.name || 'Collega'},</p>
      <p>Dit is een vriendelijke herinnering om je weekstaat in te leveren voor deze week.</p>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #ffeeba;">
        <p style="color: #856404; margin: 0;">
          <strong>Let op:</strong> Je hebt nog ${user.missingDays} ${user.missingDays === 1 ? 'dag' : 'dagen'} niet ingevuld deze week.
        </p>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Week:</strong> ${formatDateNL(user.weekStart)} t/m ${formatDateNL(user.weekEnd)}</p>
        <p><strong>Organisatie:</strong> ${user.tenantName}</p>
      </div>

      <p>
        <a href="${portalUrl}/timesheet" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Weekstaat Invullen
        </a>
      </p>

      <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        Je ontvangt deze herinnering omdat je weekstaat nog niet compleet is.
        Je kunt deze meldingen uitschakelen in je profielinstellingen.
      </p>

      <p>Met vriendelijke groet,<br>ADS Personeelsapp</p>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Send Monday escalation email
 */
async function sendMondayEscalation(user: UserWithIncompleteTimesheet): Promise<boolean> {
  const subject = 'Actie vereist: Je weekstaat van vorige week is nog niet ingeleverd';
  const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e74c3c;">Actie Vereist: Weekstaat Nog Niet Ingeleverd</h2>
      <p>Beste ${user.name || 'Collega'},</p>
      <p>Je weekstaat van vorige week is nog niet volledig ingevuld. Lever deze zo snel mogelijk in.</p>

      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #f5c6cb;">
        <p style="color: #721c24; margin: 0;">
          <strong>Belangrijk:</strong> Je hebt nog ${user.missingDays} ${user.missingDays === 1 ? 'dag' : 'dagen'} niet ingevuld.
        </p>
      </div>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Week:</strong> ${formatDateNL(user.weekStart)} t/m ${formatDateNL(user.weekEnd)}</p>
        <p><strong>Organisatie:</strong> ${user.tenantName}</p>
      </div>

      <p>
        <a href="${portalUrl}/timesheet" style="display: inline-block; background-color: #e74c3c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Nu Invullen
        </a>
      </p>

      <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        Neem contact op met je manager als je vragen hebt over je urenregistratie.
      </p>

      <p>Met vriendelijke groet,<br>ADS Personeelsapp</p>
    </div>
  `;

  return sendEmail(user.email, subject, html);
}

/**
 * Process Friday reminders (current week incomplete)
 */
export async function processFridayReminders(): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    totalUsers: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const { start, end } = getWeekBounds();
    const users = await findUsersWithIncompleteTimesheets(start, end);
    result.totalUsers = users.length;

    for (const user of users) {
      try {
        const shouldSend = await shouldSendReminder(user.id, user.tenantId);
        if (!shouldSend) continue;

        const sent = await sendFridayReminder(user);
        if (sent) {
          result.emailsSent++;

          // Log the reminder
          await prisma.auditLog.create({
            data: {
              action: 'TIMESHEET_REMINDER_SENT',
              userId: user.id,
              newValues: {
                type: 'friday_reminder',
                weekStart: start.toISOString(),
                weekEnd: end.toISOString(),
                missingDays: user.missingDays,
              },
              ipAddress: 'system',
            },
          });
        }
      } catch (error) {
        result.errors.push(`Failed to send to ${user.email}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}

/**
 * Process Monday escalations (previous week incomplete)
 */
export async function processMondayEscalations(): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    totalUsers: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const { start, end } = getPreviousWeekBounds();
    const users = await findUsersWithIncompleteTimesheets(start, end);
    result.totalUsers = users.length;

    for (const user of users) {
      try {
        const shouldSend = await shouldSendReminder(user.id, user.tenantId);
        if (!shouldSend) continue;

        const sent = await sendMondayEscalation(user);
        if (sent) {
          result.emailsSent++;

          // Log the reminder
          await prisma.auditLog.create({
            data: {
              action: 'TIMESHEET_ESCALATION_SENT',
              userId: user.id,
              newValues: {
                type: 'monday_escalation',
                weekStart: start.toISOString(),
                weekEnd: end.toISOString(),
                missingDays: user.missingDays,
              },
              ipAddress: 'system',
            },
          });
        }
      } catch (error) {
        result.errors.push(`Failed to send to ${user.email}: ${error}`);
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}

/**
 * Notify managers about team members with incomplete timesheets
 */
export async function notifyManagersAboutIncompleteTimesheets(): Promise<ReminderResult> {
  const result: ReminderResult = {
    success: true,
    totalUsers: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const { start, end } = getPreviousWeekBounds();

    // Get all managers
    const managers = await prisma.tenantUser.findMany({
      where: {
        role: 'MANAGER',
        isActive: true,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tenant: { select: { id: true, name: true } },
      },
    });

    for (const manager of managers) {
      try {
        // Find incomplete timesheets for this manager's team
        const incompleteUsers = await findUsersWithIncompleteTimesheets(start, end);
        const teamIncomplete = incompleteUsers.filter(u => u.tenantId === manager.tenantId);

        if (teamIncomplete.length === 0) continue;

        const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';
        const subject = `Manager Alert: ${teamIncomplete.length} medewerker(s) met onvolledige weekstaat`;

        const userList = teamIncomplete
          .map(u => `<li>${u.name || u.email} - ${u.missingDays} dag(en) ontbrekend</li>`)
          .join('');

        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #e74c3c;">Manager Alert: Onvolledige Weekstaten</h2>
            <p>Beste ${manager.user.name || 'Manager'},</p>
            <p>De volgende medewerkers hebben hun weekstaat van vorige week nog niet volledig ingevuld:</p>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                ${userList}
              </ul>
            </div>

            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Week:</strong> ${formatDateNL(start)} t/m ${formatDateNL(end)}</p>
            </div>

            <p>
              <a href="${portalUrl}/approvals" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Bekijk Overzicht
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
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}
