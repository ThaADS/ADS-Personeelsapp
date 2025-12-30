/**
 * UWV Alert Service
 *
 * Handles automatic alerts for the 6-week UWV notification threshold.
 * Dutch law (Wet Verbetering Poortwachter) requires employers to report
 * sick employees to UWV within 42 days (6 weeks) of the first sick day.
 *
 * Alert schedule:
 * - 7 days before deadline: Warning to HR/manager
 * - 3 days before deadline: Urgent reminder
 * - 1 day before deadline: Final alert
 * - Past deadline: Escalation to admin
 *
 * UWV Reporting Requirements:
 * - Within 6 weeks: Notify UWV via digital portal
 * - Week 6: First consultation with bedrijfsarts (company doctor)
 * - Week 8: Plan van Aanpak (action plan) must be in place
 */

import { prisma } from '@/lib/db/prisma';
import { sendEmail } from '@/lib/services/email-service';

interface AlertResult {
  success: boolean;
  totalCases: number;
  emailsSent: number;
  errors: string[];
}

interface SickLeaveAlert {
  id: string;
  employeeId: string;
  employeeName: string | null;
  employeeEmail: string;
  tenantId: string;
  tenantName: string;
  startDate: Date;
  daysUntilDeadline: number;
  uwvDeadline: Date;
  uwvReported: boolean;
  alertLevel: 'warning' | 'urgent' | 'critical' | 'overdue';
}

/**
 * Calculate the UWV deadline (42 days / 6 weeks from start date)
 */
function calculateUwvDeadline(startDate: Date): Date {
  const deadline = new Date(startDate);
  deadline.setDate(deadline.getDate() + 42);
  return deadline;
}

/**
 * Calculate days between two dates
 */
function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round((date2.getTime() - date1.getTime()) / oneDay);
}

/**
 * Get alert level based on days until deadline
 */
function getAlertLevel(daysUntilDeadline: number): 'warning' | 'urgent' | 'critical' | 'overdue' {
  if (daysUntilDeadline < 0) return 'overdue';
  if (daysUntilDeadline <= 1) return 'critical';
  if (daysUntilDeadline <= 3) return 'urgent';
  return 'warning';
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
 * Find sick leaves approaching UWV deadline
 */
async function findSickLeavesNearingUwvDeadline(): Promise<SickLeaveAlert[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate date ranges
  // We want sick leaves that started between 35-49 days ago (7 days before to 7 days after deadline)
  const warningThreshold = new Date(today);
  warningThreshold.setDate(today.getDate() - 35); // 42-7 = 35 days ago

  const pastDeadlineThreshold = new Date(today);
  pastDeadlineThreshold.setDate(today.getDate() - 49); // 42+7 = 49 days ago

  const sickLeaves = await prisma.sick_leaves.findMany({
    where: {
      status: 'ACTIVE',
      uwv_reported: false,
      start_date: {
        gte: pastDeadlineThreshold,
        lte: warningThreshold,
      },
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

  const alerts: SickLeaveAlert[] = [];

  for (const sickLeave of sickLeaves) {
    const uwvDeadline = calculateUwvDeadline(sickLeave.start_date);
    const daysUntilDeadline = daysBetween(today, uwvDeadline);

    // Only include if within alert window (-7 to +7 days)
    if (daysUntilDeadline <= 7 && daysUntilDeadline >= -7) {
      alerts.push({
        id: sickLeave.id,
        employeeId: sickLeave.employees.users.id,
        employeeName: sickLeave.employees.users.name,
        employeeEmail: sickLeave.employees.users.email,
        tenantId: sickLeave.employees.tenants.id,
        tenantName: sickLeave.employees.tenants.name,
        startDate: sickLeave.start_date,
        daysUntilDeadline,
        uwvDeadline,
        uwvReported: sickLeave.uwv_reported || false,
        alertLevel: getAlertLevel(daysUntilDeadline),
      });
    }
  }

  // Sort by urgency (most urgent first)
  return alerts.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline);
}

/**
 * Check if user wants UWV notifications
 */
async function shouldSendUwvAlert(userId: string): Promise<boolean> {
  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!preferences) return true;
  return preferences.email_sick_leave_uwv ?? true;
}

/**
 * Get alert colors for email
 */
function getAlertColors(level: 'warning' | 'urgent' | 'critical' | 'overdue'): {
  bg: string;
  border: string;
  text: string;
  headerColor: string;
} {
  switch (level) {
    case 'overdue':
      return { bg: '#dc3545', border: '#dc3545', text: '#ffffff', headerColor: '#dc3545' };
    case 'critical':
      return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', headerColor: '#dc3545' };
    case 'urgent':
      return { bg: '#fff3cd', border: '#ffeeba', text: '#856404', headerColor: '#ffc107' };
    case 'warning':
      return { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', headerColor: '#17a2b8' };
  }
}

/**
 * Send UWV alert email to manager/HR
 */
async function sendUwvAlertEmail(
  recipientEmail: string,
  recipientName: string | null,
  alerts: SickLeaveAlert[]
): Promise<boolean> {
  const portalUrl = process.env.NEXTAUTH_URL || 'https://adspersoneelsapp.vercel.app';
  const mostUrgent = alerts[0];

  let subject: string;
  if (mostUrgent.alertLevel === 'overdue') {
    subject = `🚨 URGENT: UWV meldingsdeadline overschreden voor ${alerts.length} medewerker(s)`;
  } else if (mostUrgent.alertLevel === 'critical') {
    subject = `⚠️ ACTIE VEREIST: UWV deadline morgen voor ${alerts.length} medewerker(s)`;
  } else if (mostUrgent.alertLevel === 'urgent') {
    subject = `📋 UWV deadline nadert voor ${alerts.length} medewerker(s)`;
  } else {
    subject = `📅 Herinnering: UWV melding vereist binnen 7 dagen`;
  }

  const alertsHtml = alerts
    .map((alert) => {
      const colors = getAlertColors(alert.alertLevel);
      const statusText =
        alert.daysUntilDeadline < 0
          ? `<strong style="color: #dc3545;">⚠️ ${Math.abs(alert.daysUntilDeadline)} dagen te laat!</strong>`
          : alert.daysUntilDeadline === 0
            ? '<strong style="color: #dc3545;">Vandaag!</strong>'
            : alert.daysUntilDeadline === 1
              ? '<strong style="color: #ffc107;">Morgen</strong>'
              : `nog ${alert.daysUntilDeadline} dagen`;

      return `
        <div style="background-color: ${colors.bg}; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid ${colors.headerColor};">
          <p style="color: ${colors.text}; margin: 0 0 10px 0; font-weight: bold;">
            ${alert.employeeName || 'Onbekend'}
          </p>
          <p style="color: ${colors.text}; margin: 0;">
            Eerste ziektedag: ${formatDateNL(alert.startDate)}<br>
            UWV deadline: ${formatDateNL(alert.uwvDeadline)}<br>
            Status: ${statusText}
          </p>
        </div>
      `;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">UWV Meldingsdeadline Alert</h2>
      <p>Beste ${recipientName || 'Manager'},</p>

      <p>Volgens de Wet Verbetering Poortwachter moet ziekte van werknemers binnen
         <strong>6 weken (42 dagen)</strong> worden gemeld bij het UWV.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">📋 Te melden bij UWV:</h3>
        ${alertsHtml}
      </div>

      <div style="background-color: #e7f3fe; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #b6d4fe;">
        <h4 style="color: #0c5460; margin-top: 0;">📌 Actie vereist:</h4>
        <ol style="color: #0c5460; margin-bottom: 0;">
          <li>Maak de ziekmelding via het UWV werkgeversportaal</li>
          <li>Plan een afspraak met de bedrijfsarts (week 6)</li>
          <li>Stel het Plan van Aanpak op (week 8)</li>
        </ol>
      </div>

      <p>
        <a href="${portalUrl}/sick-leave" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">
          Bekijk Ziekmeldingen
        </a>
        <a href="https://www.uwv.nl/werkgevers/ziek/ziek-melden/index.aspx" style="display: inline-block; background-color: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;" target="_blank">
          Naar UWV Portal
        </a>
      </p>

      <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
        Dit is een automatische herinnering vanuit ADSPersoneelapp om te helpen
        bij het naleven van de wettelijke verplichtingen.
      </p>

      <p>Met vriendelijke groet,<br>ADSPersoneelapp</p>
    </div>
  `;

  return sendEmail(recipientEmail, subject, html);
}

/**
 * Process UWV deadline alerts
 */
export async function processUwvAlerts(): Promise<AlertResult> {
  const result: AlertResult = {
    success: true,
    totalCases: 0,
    emailsSent: 0,
    errors: [],
  };

  try {
    const alerts = await findSickLeavesNearingUwvDeadline();
    result.totalCases = alerts.length;

    if (alerts.length === 0) {
      return result;
    }

    // Group alerts by tenant
    const tenantAlerts = new Map<string, { tenantName: string; alerts: SickLeaveAlert[] }>();

    for (const alert of alerts) {
      const existing = tenantAlerts.get(alert.tenantId);
      if (existing) {
        existing.alerts.push(alert);
      } else {
        tenantAlerts.set(alert.tenantId, {
          tenantName: alert.tenantName,
          alerts: [alert],
        });
      }
    }

    // Get managers and admins for each tenant
    for (const [tenantId, tenantData] of tenantAlerts) {
      const managersAndAdmins = await prisma.tenantUser.findMany({
        where: {
          tenantId,
          role: { in: ['MANAGER', 'TENANT_ADMIN'] },
          isActive: true,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });

      for (const recipient of managersAndAdmins) {
        try {
          const shouldSend = await shouldSendUwvAlert(recipient.user.id);
          if (!shouldSend) continue;

          const sent = await sendUwvAlertEmail(
            recipient.user.email,
            recipient.user.name,
            tenantData.alerts
          );

          if (sent) {
            result.emailsSent++;

            // Log the alert
            await prisma.auditLog.create({
              data: {
                action: 'UWV_ALERT_SENT',
                userId: recipient.user.id,
                tenantId,
                newValues: {
                  alertCount: tenantData.alerts.length,
                  alerts: tenantData.alerts.map((a) => ({
                    employeeName: a.employeeName,
                    daysUntilDeadline: a.daysUntilDeadline,
                    alertLevel: a.alertLevel,
                  })),
                },
                ipAddress: 'system',
              },
            });
          }
        } catch (error) {
          result.errors.push(`Failed to send to ${recipient.user.email}: ${error}`);
        }
      }

      // Create in-app notifications for urgent/critical/overdue alerts
      for (const alert of tenantData.alerts.filter(
        (a) => a.alertLevel !== 'warning'
      )) {
        await prisma.notifications.create({
          data: {
            tenant_id: tenantId,
            user_id: alert.employeeId,
            type: 'SICK_LEAVE_UWV_DEADLINE',
            title:
              alert.alertLevel === 'overdue'
                ? 'UWV deadline overschreden'
                : 'UWV deadline nadert',
            message: `De UWV meldingsdeadline voor ${alert.employeeName} is ${alert.daysUntilDeadline < 0 ? `${Math.abs(alert.daysUntilDeadline)} dagen geleden verstreken` : alert.daysUntilDeadline === 0 ? 'vandaag' : `over ${alert.daysUntilDeadline} dagen`}.`,
            action_url: '/sick-leave',
          },
        });
      }
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`Process error: ${error}`);
  }

  return result;
}

/**
 * Mark a sick leave as reported to UWV
 */
export async function markAsReportedToUwv(sickLeaveId: string): Promise<boolean> {
  try {
    await prisma.sick_leaves.update({
      where: { id: sickLeaveId },
      data: {
        uwv_reported: true,
        uwv_reported_at: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error('Failed to mark sick leave as reported:', error);
    return false;
  }
}
