/**
 * Email Service
 * Handles email notifications using SMTP
 */

import nodemailer from 'nodemailer';
import { createLogger } from "@/lib/logger";

const logger = createLogger("email-service");

// Interface voor email configuratie
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// Interface voor email template data
export interface EmailTemplateData {
  [key: string]: string | number | boolean | null | undefined;
}

// Email configuratie (in productie zou dit uit environment variables komen)
const emailConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
  from: process.env.EMAIL_FROM || 'ADSPersoneelapp <noreply@example.com>',
};

// Maak een transporter voor het versturen van emails
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: emailConfig.auth,
});

/**
 * Vervangt placeholders in een template met de gegeven data
 * @param template Het email template
 * @param data De data om in te vullen
 * @returns Het ingevulde template
 */
function renderTemplate(template: string, data: EmailTemplateData): string {
  return template.replace(/{{([^{}]+)}}/g, (match, key) => {
    const value = data[key.trim()];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Verstuurt een email
 * @param to Email adres van de ontvanger
 * @param subject Onderwerp van de email
 * @param html HTML inhoud van de email
 * @param text Platte tekst inhoud van de email (fallback)
 * @returns Promise met het resultaat van het versturen
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags als er geen text is opgegeven
      html,
    });

    logger.info("Email verstuurd", { messageId: info.messageId, to });
    return true;
  } catch (error) {
    logger.error("Fout bij versturen email", error, { to, subject });
    return false;
  }
}

/**
 * Verstuurt een notificatie voor een nieuwe goedkeuringsaanvraag
 * @param to Email adres van de ontvanger
 * @param data Data voor het template
 * @returns Promise met het resultaat van het versturen
 */
export async function sendApprovalNotification(
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  const subject = `Nieuwe goedkeuringsaanvraag: ${data.type}`;
  
  const html = renderTemplate(`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Nieuwe goedkeuringsaanvraag</h2>
      <p>Beste {{recipientName}},</p>
      <p>Er is een nieuwe {{type}} aanvraag ingediend die uw goedkeuring vereist.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Type:</strong> {{type}}</p>
        <p><strong>Werknemer:</strong> {{employeeName}}</p>
        <p><strong>Datum:</strong> {{date}}</p>
        <p><strong>Ingediend op:</strong> {{submittedAt}}</p>
        {{#description}}
        <p><strong>Omschrijving:</strong> {{description}}</p>
        {{/description}}
      </div>
      
      <p>U kunt deze aanvraag bekijken en goedkeuren via het <a href="{{approvalUrl}}" style="color: #3498db;">ADSPersoneelapp portaal</a>.</p>
      
      <p>Met vriendelijke groet,<br>ADSPersoneelapp</p>
    </div>
  `, data);

  return sendEmail(to, subject, html);
}

/**
 * Verstuurt een notificatie voor een goedgekeurde of afgekeurde aanvraag
 * @param to Email adres van de ontvanger
 * @param data Data voor het template
 * @returns Promise met het resultaat van het versturen
 */
export async function sendStatusUpdateNotification(
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  const status = data.status === 'approved' ? 'goedgekeurd' : 'afgekeurd';
  const subject = `Uw aanvraag is ${status}: ${data.type}`;
  
  const html = renderTemplate(`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Aanvraag ${status}</h2>
      <p>Beste {{recipientName}},</p>
      <p>Uw {{type}} aanvraag is ${status}.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Type:</strong> {{type}}</p>
        <p><strong>Datum:</strong> {{date}}</p>
        <p><strong>Status:</strong> <span style="color: {{status === 'approved' ? '#27ae60' : '#e74c3c'}};">${status}</span></p>
        {{#comment}}
        <p><strong>Opmerking:</strong> {{comment}}</p>
        {{/comment}}
      </div>
      
      <p>U kunt al uw aanvragen bekijken via het <a href="{{portalUrl}}" style="color: #3498db;">ADSPersoneelapp portaal</a>.</p>
      
      <p>Met vriendelijke groet,<br>ADSPersoneelapp</p>
    </div>
  `, data);

  return sendEmail(to, subject, html);
}

/**
 * Verstuurt een herinnering voor een openstaande goedkeuringsaanvraag
 * @param to Email adres van de ontvanger
 * @param data Data voor het template
 * @returns Promise met het resultaat van het versturen
 */
export async function sendReminderNotification(
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  const subject = `Herinnering: Openstaande goedkeuringsaanvragen`;

  const html = renderTemplate(`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Herinnering: Openstaande goedkeuringsaanvragen</h2>
      <p>Beste {{recipientName}},</p>
      <p>Dit is een herinnering dat er {{pendingCount}} openstaande aanvragen zijn die uw goedkeuring vereisen.</p>

      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Aantal openstaande aanvragen:</strong> {{pendingCount}}</p>
        <p><strong>Oudste aanvraag:</strong> {{oldestDate}}</p>
      </div>

      <p>U kunt deze aanvragen bekijken en goedkeuren via het <a href="{{approvalUrl}}" style="color: #3498db;">ADSPersoneelapp portaal</a>.</p>

      <p>Met vriendelijke groet,<br>ADSPersoneelapp</p>
    </div>
  `, data);

  return sendEmail(to, subject, html);
}

/**
 * Verstuurt een wachtwoord reset email
 * @param to Email adres van de ontvanger
 * @param data Data voor het template (resetUrl, userName, expiresIn)
 * @returns Promise met het resultaat van het versturen
 */
export async function sendPasswordResetEmail(
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  const subject = 'Wachtwoord Reset - ADSPersoneelapp';

  const html = renderTemplate(`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Wachtwoord Reset Aangevraagd</h2>
      <p>Beste {{userName}},</p>
      <p>U heeft een wachtwoord reset aangevraagd voor uw ADSPersoneelapp account.</p>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <a href="{{resetUrl}}" style="display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Wachtwoord Resetten
        </a>
      </div>

      <p style="color: #7f8c8d; font-size: 14px;">
        Deze link is {{expiresIn}} geldig. Als u geen wachtwoord reset heeft aangevraagd,
        kunt u deze email negeren.
      </p>

      <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
        Als de knop niet werkt, kopieer en plak deze link in uw browser:<br>
        <a href="{{resetUrl}}" style="color: #3498db; word-break: break-all;">{{resetUrl}}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

      <p>Met vriendelijke groet,<br>ADSPersoneelapp</p>
    </div>
  `, data);

  return sendEmail(to, subject, html);
}

/**
 * Verstuurt een bevestiging dat het wachtwoord is gewijzigd
 * @param to Email adres van de ontvanger
 * @param data Data voor het template (userName)
 * @returns Promise met het resultaat van het versturen
 */
export async function sendPasswordChangedEmail(
  to: string,
  data: EmailTemplateData
): Promise<boolean> {
  const subject = 'Wachtwoord Gewijzigd - ADSPersoneelapp';

  const html = renderTemplate(`
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c3e50;">Wachtwoord Succesvol Gewijzigd</h2>
      <p>Beste {{userName}},</p>
      <p>Uw wachtwoord voor ADSPersoneelapp is succesvol gewijzigd.</p>

      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb;">
        <p style="color: #155724; margin: 0;">
          <strong>✓</strong> Uw wachtwoord is bijgewerkt op {{changedAt}}.
        </p>
      </div>

      <p style="color: #856404; background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba;">
        <strong>Let op:</strong> Als u deze wijziging niet heeft aangevraagd, neem dan
        direct contact op met uw beheerder.
      </p>

      <p>Met vriendelijke groet,<br>ADSPersoneelapp</p>
    </div>
  `, data);

  return sendEmail(to, subject, html);
}
