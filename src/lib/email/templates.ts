/**
 * Email Templates
 *
 * Strakke HTML email templates in de stijl van de ADSPersoneelapp website.
 * Gradient paars/violet thema met moderne styling.
 */

// Base email wrapper met branding
export function getEmailWrapper(content: string, preheader: string = ''): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ADSPersoneelapp</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0f172a;
      color: #ffffff;
    }

    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%);
    }

    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
      padding: 32px 40px;
      text-align: center;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 18px;
      color: #ffffff;
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      color: #ffffff;
    }

    .content {
      padding: 48px 40px;
      background: rgba(255,255,255,0.05);
    }

    .content h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 16px 0;
    }

    .content p {
      font-size: 16px;
      line-height: 1.6;
      color: #e2e8f0;
      margin: 0 0 24px 0;
    }

    .button-container {
      text-align: center;
      margin: 32px 0;
    }

    .button {
      display: inline-block;
      padding: 16px 32px;
      background: linear-gradient(135deg, #7c3aed 0%, #c026d3 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);
    }

    .button:hover {
      opacity: 0.9;
    }

    .info-box {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }

    .info-box-header {
      font-weight: 600;
      color: #c4b5fd;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      color: #a5b4fc;
      font-size: 14px;
    }

    .info-value {
      color: #ffffff;
      font-weight: 500;
      font-size: 14px;
    }

    .warning-box {
      background: rgba(251, 191, 36, 0.15);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 24px 0;
    }

    .warning-box p {
      color: #fcd34d;
      font-size: 14px;
      margin: 0;
    }

    .success-box {
      background: rgba(34, 197, 94, 0.15);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      padding: 16px 20px;
      margin: 24px 0;
    }

    .success-box p {
      color: #86efac;
      font-size: 14px;
      margin: 0;
    }

    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      margin: 32px 0;
    }

    .footer {
      padding: 32px 40px;
      text-align: center;
      background: rgba(0,0,0,0.2);
    }

    .footer p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 8px 0;
    }

    .footer a {
      color: #a5b4fc;
      text-decoration: none;
    }

    .footer-links {
      margin-top: 16px;
    }

    .footer-links a {
      color: #94a3b8;
      text-decoration: none;
      margin: 0 12px;
      font-size: 12px;
    }

    .code-box {
      background: rgba(0,0,0,0.3);
      border-radius: 8px;
      padding: 16px 24px;
      text-align: center;
      margin: 24px 0;
    }

    .code {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #c4b5fd;
    }

    @media only screen and (max-width: 600px) {
      .content {
        padding: 32px 24px;
      }
      .header {
        padding: 24px;
      }
      .footer {
        padding: 24px;
      }
      .content h1 {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <!-- Preheader text (hidden) -->
  <div style="display:none;font-size:1px;color:#0f172a;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <div class="email-container" style="border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <!-- Header -->
          <div class="header">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}" class="logo">
              <div class="logo-icon">A</div>
              <span class="logo-text">ADSPersoneelapp</span>
            </a>
          </div>

          <!-- Content -->
          <div class="content">
            ${content}
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>Deze email is verzonden door ADSPersoneelapp</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}">
                ${process.env.NEXT_PUBLIC_APP_URL || 'ads-personeelsapp.nl'}
              </a>
            </p>
            <div class="footer-links">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}/marketing/security">Privacy</a>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}/marketing/faq">Help</a>
              <a href="mailto:support@ads-personeelsapp.nl">Contact</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Password Reset Email Template
 */
export function getPasswordResetEmail(data: {
  userName: string;
  resetUrl: string;
  expiresIn: string;
  ipAddress?: string;
  userAgent?: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Wachtwoord resetten - ADSPersoneelapp';

  const content = `
    <h1>Wachtwoord resetten</h1>
    <p>Hallo ${data.userName},</p>
    <p>
      We hebben een verzoek ontvangen om het wachtwoord van je ADSPersoneelapp account te resetten.
      Klik op de onderstaande knop om een nieuw wachtwoord in te stellen.
    </p>

    <div class="button-container">
      <a href="${data.resetUrl}" class="button">Wachtwoord resetten</a>
    </div>

    <div class="warning-box">
      <p>
        <strong>Let op:</strong> Deze link is ${data.expiresIn} geldig.
        Na deze tijd moet je een nieuwe reset aanvragen.
      </p>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #94a3b8;">
      Als je dit verzoek niet hebt gedaan, kun je deze email negeren.
      Je wachtwoord blijft ongewijzigd.
    </p>

    ${data.ipAddress ? `
    <div class="info-box">
      <div class="info-box-header">Verzoek details</div>
      <div class="info-row">
        <span class="info-label">IP-adres</span>
        <span class="info-value">${data.ipAddress}</span>
      </div>
      ${data.userAgent ? `
      <div class="info-row">
        <span class="info-label">Browser</span>
        <span class="info-value">${data.userAgent}</span>
      </div>
      ` : ''}
    </div>
    ` : ''}

    <p style="font-size: 13px; color: #64748b;">
      Werkt de knop niet? Kopieer en plak deze link in je browser:<br>
      <a href="${data.resetUrl}" style="color: #a5b4fc; word-break: break-all;">${data.resetUrl}</a>
    </p>
  `;

  const text = `
Wachtwoord resetten - ADSPersoneelapp

Hallo ${data.userName},

We hebben een verzoek ontvangen om het wachtwoord van je ADSPersoneelapp account te resetten.

Klik op de volgende link om een nieuw wachtwoord in te stellen:
${data.resetUrl}

Let op: Deze link is ${data.expiresIn} geldig. Na deze tijd moet je een nieuwe reset aanvragen.

Als je dit verzoek niet hebt gedaan, kun je deze email negeren. Je wachtwoord blijft ongewijzigd.

---
ADSPersoneelapp
${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}
`;

  return {
    subject,
    html: getEmailWrapper(content, 'Reset je wachtwoord voor ADSPersoneelapp'),
    text,
  };
}

/**
 * Password Changed Confirmation Email
 */
export function getPasswordChangedEmail(data: {
  userName: string;
  changedAt: string;
  ipAddress?: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Wachtwoord gewijzigd - ADSPersoneelapp';

  const content = `
    <h1>Wachtwoord gewijzigd</h1>
    <p>Hallo ${data.userName},</p>

    <div class="success-box">
      <p>Je wachtwoord is succesvol gewijzigd.</p>
    </div>

    <p>
      Je kunt nu inloggen met je nieuwe wachtwoord. Als je deze wijziging niet zelf hebt gedaan,
      neem dan onmiddellijk contact met ons op.
    </p>

    <div class="info-box">
      <div class="info-box-header">Wijzigingsdetails</div>
      <div class="info-row">
        <span class="info-label">Datum en tijd</span>
        <span class="info-value">${data.changedAt}</span>
      </div>
      ${data.ipAddress ? `
      <div class="info-row">
        <span class="info-label">IP-adres</span>
        <span class="info-value">${data.ipAddress}</span>
      </div>
      ` : ''}
    </div>

    <div class="button-container">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}/login" class="button">Inloggen</a>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #94a3b8;">
      Heb je je wachtwoord niet gewijzigd? Neem direct contact op met
      <a href="mailto:support@ads-personeelsapp.nl" style="color: #a5b4fc;">support@ads-personeelsapp.nl</a>
    </p>
  `;

  const text = `
Wachtwoord gewijzigd - ADSPersoneelapp

Hallo ${data.userName},

Je wachtwoord is succesvol gewijzigd op ${data.changedAt}.

Je kunt nu inloggen met je nieuwe wachtwoord.

Als je deze wijziging niet zelf hebt gedaan, neem dan onmiddellijk contact met ons op via support@ads-personeelsapp.nl.

---
ADSPersoneelapp
${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}
`;

  return {
    subject,
    html: getEmailWrapper(content, 'Je wachtwoord is succesvol gewijzigd'),
    text,
  };
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmail(data: {
  userName: string;
  tenantName: string;
  loginUrl: string;
  temporaryPassword?: string;
}): { subject: string; html: string; text: string } {
  const subject = `Welkom bij ${data.tenantName} - ADSPersoneelapp`;

  const content = `
    <h1>Welkom bij ADSPersoneelapp! 🎉</h1>
    <p>Hallo ${data.userName},</p>
    <p>
      Je account voor <strong>${data.tenantName}</strong> is succesvol aangemaakt.
      Je kunt nu inloggen en beginnen met het registreren van je werkuren.
    </p>

    ${data.temporaryPassword ? `
    <div class="info-box">
      <div class="info-box-header">Je tijdelijke inloggegevens</div>
      <div class="info-row">
        <span class="info-label">Wachtwoord</span>
        <span class="info-value" style="font-family: monospace;">${data.temporaryPassword}</span>
      </div>
    </div>

    <div class="warning-box">
      <p>
        <strong>Belangrijk:</strong> Wijzig je wachtwoord direct na je eerste login voor je veiligheid.
      </p>
    </div>
    ` : ''}

    <div class="button-container">
      <a href="${data.loginUrl}" class="button">Nu inloggen</a>
    </div>

    <div class="divider"></div>

    <h2 style="font-size: 18px; color: #ffffff; margin-bottom: 16px;">Wat kun je allemaal doen?</h2>

    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <span style="color: #c4b5fd; font-size: 20px; margin-right: 12px;">⏱️</span>
          <span style="color: #e2e8f0;">Werkuren registreren met GPS-verificatie</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <span style="color: #c4b5fd; font-size: 20px; margin-right: 12px;">🏖️</span>
          <span style="color: #e2e8f0;">Verlof aanvragen en je saldo bekijken</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
          <span style="color: #c4b5fd; font-size: 20px; margin-right: 12px;">🏥</span>
          <span style="color: #e2e8f0;">Ziekmeldingen doorgeven</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <span style="color: #c4b5fd; font-size: 20px; margin-right: 12px;">📊</span>
          <span style="color: #e2e8f0;">Je uren en statistieken inzien</span>
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; color: #94a3b8;">
      Vragen? Neem contact op met je manager of mail naar
      <a href="mailto:support@ads-personeelsapp.nl" style="color: #a5b4fc;">support@ads-personeelsapp.nl</a>
    </p>
  `;

  const text = `
Welkom bij ADSPersoneelapp!

Hallo ${data.userName},

Je account voor ${data.tenantName} is succesvol aangemaakt.

${data.temporaryPassword ? `Je tijdelijke wachtwoord: ${data.temporaryPassword}

Belangrijk: Wijzig je wachtwoord direct na je eerste login voor je veiligheid.

` : ''}Log in via: ${data.loginUrl}

Wat kun je allemaal doen?
- Werkuren registreren met GPS-verificatie
- Verlof aanvragen en je saldo bekijken
- Ziekmeldingen doorgeven
- Je uren en statistieken inzien

Vragen? Neem contact op met je manager of mail naar support@ads-personeelsapp.nl

---
ADSPersoneelapp
${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}
`;

  return {
    subject,
    html: getEmailWrapper(content, `Welkom bij ${data.tenantName}! Je account is klaar voor gebruik.`),
    text,
  };
}

/**
 * Two-Factor Authentication Code Email
 */
export function get2FACodeEmail(data: {
  userName: string;
  code: string;
  expiresIn: string;
}): { subject: string; html: string; text: string } {
  const subject = 'Je verificatiecode - ADSPersoneelapp';

  const content = `
    <h1>Verificatiecode</h1>
    <p>Hallo ${data.userName},</p>
    <p>
      Gebruik onderstaande code om je identiteit te verifiëren en in te loggen bij ADSPersoneelapp.
    </p>

    <div class="code-box">
      <span class="code">${data.code}</span>
    </div>

    <div class="warning-box">
      <p>
        Deze code is ${data.expiresIn} geldig. Deel deze code met niemand.
      </p>
    </div>

    <div class="divider"></div>

    <p style="font-size: 14px; color: #94a3b8;">
      Als je niet geprobeerd hebt in te loggen, kan iemand anders toegang proberen te krijgen tot je account.
      Neem in dat geval direct contact met ons op.
    </p>
  `;

  const text = `
Je verificatiecode - ADSPersoneelapp

Hallo ${data.userName},

Gebruik onderstaande code om je identiteit te verifiëren:

${data.code}

Deze code is ${data.expiresIn} geldig. Deel deze code met niemand.

Als je niet geprobeerd hebt in te loggen, neem dan direct contact met ons op.

---
ADSPersoneelapp
${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}
`;

  return {
    subject,
    html: getEmailWrapper(content, `Je verificatiecode: ${data.code}`),
    text,
  };
}

/**
 * Timesheet Reminder Email
 */
export function getTimesheetReminderEmail(data: {
  userName: string;
  weekNumber: number;
  pendingDays: number;
  dashboardUrl: string;
  isEscalation?: boolean;
}): { subject: string; html: string; text: string } {
  const subject = data.isEscalation
    ? `Urgente herinnering: Weekstaat week ${data.weekNumber} nog niet ingeleverd`
    : `Herinnering: Vergeet je weekstaat niet (week ${data.weekNumber})`;

  const content = `
    <h1>${data.isEscalation ? '⚠️ Urgente herinnering' : '📋 Weekstaat herinnering'}</h1>
    <p>Hallo ${data.userName},</p>

    ${data.isEscalation ? `
    <div class="warning-box">
      <p>
        <strong>Je weekstaat van week ${data.weekNumber} is nog niet ingeleverd.</strong>
        Lever deze zo snel mogelijk in om vertraging in de salarisverwerking te voorkomen.
      </p>
    </div>
    ` : `
    <p>
      Het is weer vrijdag! Vergeet niet om je weekstaat van week ${data.weekNumber} in te leveren.
    </p>
    `}

    <div class="info-box">
      <div class="info-box-header">Status</div>
      <div class="info-row">
        <span class="info-label">Week</span>
        <span class="info-value">${data.weekNumber}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Openstaande dagen</span>
        <span class="info-value">${data.pendingDays} ${data.pendingDays === 1 ? 'dag' : 'dagen'}</span>
      </div>
    </div>

    <div class="button-container">
      <a href="${data.dashboardUrl}" class="button">Weekstaat invullen</a>
    </div>

    <p style="font-size: 14px; color: #94a3b8;">
      ${data.isEscalation
        ? 'Je manager is ook op de hoogte gesteld van deze herinnering.'
        : 'Heb je al alles ingevuld? Dan kun je deze email negeren.'}
    </p>
  `;

  const text = `
${data.isEscalation ? 'URGENTE HERINNERING' : 'Weekstaat herinnering'} - ADSPersoneelapp

Hallo ${data.userName},

${data.isEscalation
  ? `Je weekstaat van week ${data.weekNumber} is nog niet ingeleverd. Lever deze zo snel mogelijk in om vertraging in de salarisverwerking te voorkomen.`
  : `Het is weer vrijdag! Vergeet niet om je weekstaat van week ${data.weekNumber} in te leveren.`}

Status:
- Week: ${data.weekNumber}
- Openstaande dagen: ${data.pendingDays}

Vul je weekstaat in via: ${data.dashboardUrl}

${data.isEscalation ? 'Je manager is ook op de hoogte gesteld.' : ''}

---
ADSPersoneelapp
${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}
`;

  return {
    subject,
    html: getEmailWrapper(content, data.isEscalation
      ? `Urgente herinnering: Je weekstaat week ${data.weekNumber} mist nog`
      : `Herinnering om je weekstaat week ${data.weekNumber} in te vullen`),
    text,
  };
}

/**
 * Manager Escalation Email (when employee doesn't submit timesheet)
 */
export function getManagerEscalationEmail(data: {
  managerName: string;
  employees: Array<{ name: string; email: string; pendingDays: number }>;
  weekNumber: number;
  dashboardUrl: string;
}): { subject: string; html: string; text: string } {
  const subject = `⚠️ ${data.employees.length} medewerker(s) met ontbrekende weekstaat (week ${data.weekNumber})`;

  const employeeRows = data.employees.map(emp => `
    <div class="info-row">
      <span class="info-label">${emp.name}</span>
      <span class="info-value">${emp.pendingDays} ${emp.pendingDays === 1 ? 'dag' : 'dagen'} ontbreekt</span>
    </div>
  `).join('');

  const content = `
    <h1>⚠️ Ontbrekende weekstaten</h1>
    <p>Hallo ${data.managerName},</p>
    <p>
      De volgende medewerkers in je team hebben hun weekstaat van week ${data.weekNumber} nog niet (volledig) ingevuld:
    </p>

    <div class="info-box">
      <div class="info-box-header">Ontbrekende weekstaten</div>
      ${employeeRows}
    </div>

    <p>
      Deze medewerkers hebben ook een herinnering ontvangen. Indien nodig kun je contact met hen opnemen.
    </p>

    <div class="button-container">
      <a href="${data.dashboardUrl}" class="button">Naar dashboard</a>
    </div>
  `;

  const employeeList = data.employees.map(emp => `- ${emp.name}: ${emp.pendingDays} dagen ontbreekt`).join('\n');

  const text = `
Ontbrekende weekstaten - ADSPersoneelapp

Hallo ${data.managerName},

De volgende medewerkers hebben hun weekstaat van week ${data.weekNumber} nog niet (volledig) ingevuld:

${employeeList}

Deze medewerkers hebben ook een herinnering ontvangen.

Ga naar het dashboard: ${data.dashboardUrl}

---
ADSPersoneelapp
${process.env.NEXT_PUBLIC_APP_URL || 'https://ads-personeelsapp.nl'}
`;

  return {
    subject,
    html: getEmailWrapper(content, `${data.employees.length} medewerkers missen weekstaat week ${data.weekNumber}`),
    text,
  };
}
