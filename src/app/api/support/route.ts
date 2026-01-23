import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { createLogger } from '@/lib/logger';
import {
  successResponse,
  errorResponse,
  internalErrorResponse,
  ErrorCodes,
} from '@/lib/api/response';

const logger = createLogger('Support');

interface ChatMessage {
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
}

interface SupportRequest {
  question: string;
  chatHistory: ChatMessage[];
  userEmail?: string;
  userName?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session for additional context
    const session = await auth();

    const body: SupportRequest = await request.json();
    const { question, chatHistory, userEmail, userName } = body;

    if (!question || !chatHistory || chatHistory.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Vraag en chatgeschiedenis zijn verplicht'
      );
    }

    // Format chat history for email
    const formattedHistory = chatHistory
      .map((msg) => {
        const time = new Date(msg.timestamp).toLocaleString('nl-NL');
        const sender = msg.type === 'user' ? 'Gebruiker' : 'FAQ Bot';
        return `[${time}] ${sender}: ${msg.content}`;
      })
      .join('\n\n');

    // User info from session or provided data
    const user = session?.user;
    const finalUserName = userName || user?.name || 'Onbekend';
    const finalUserEmail = userEmail || user?.email || 'Niet opgegeven';
    const userRole = user?.role || 'Onbekend';
    const tenantId = user?.tenantId || 'Niet beschikbaar';

    // Compose email content
    const emailSubject = `[Support] FAQ Chatbot - ${question.slice(0, 50)}${question.length > 50 ? '...' : ''}`;

    const emailBody = `
================================================================================
                     ADSPersoneelapp - Support Aanvraag
================================================================================

GEBRUIKERSINFORMATIE
--------------------
Naam:       ${finalUserName}
E-mail:     ${finalUserEmail}
Rol:        ${userRole}
Tenant ID:  ${tenantId}
Tijdstip:   ${new Date().toLocaleString('nl-NL')}

VRAAG
-----
${question}

CHATGESCHIEDENIS
----------------
${formattedHistory}

================================================================================
Dit bericht is automatisch gegenereerd via de FAQ Chatbot.
De gebruiker kon geen antwoord vinden op de bovenstaande vraag.
================================================================================
`;

    // In production, you would use a proper email service here
    // For now, we'll use the native fetch to send via a mail service
    // or log to console in development

    const supportEmail = 'support@adspersoneelapp.nl';

    // Check if we have email configuration
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // Send via Resend API
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ADSPersoneelapp <noreply@adspersoneelapp.nl>',
          to: [supportEmail],
          reply_to: finalUserEmail !== 'Niet opgegeven' ? finalUserEmail : undefined,
          subject: emailSubject,
          text: emailBody,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json();
        logger.error('Resend API error', undefined, { errorData });
        throw new Error('Failed to send email via Resend');
      }

      logger.info('Support email sent successfully via Resend');
    } else {
      // Log email content in development mode (using structured logger)
      logger.debug('Support email (no Resend API key configured)', {
        to: supportEmail,
        subject: emailSubject,
        questionPreview: question.slice(0, 100),
      });
    }

    // Create audit log entry if needed
    // await createAuditLog('SUPPORT_REQUEST', { question, userId: session?.user?.id });

    return successResponse(
      { emailSent: !!resendApiKey },
      { message: 'Uw vraag is verzonden naar onze support afdeling. We nemen zo spoedig mogelijk contact met u op.' }
    );

  } catch (error) {
    logger.error('Error sending support request', error instanceof Error ? error : undefined);
    return internalErrorResponse(
      'Er is een fout opgetreden bij het verzenden van uw vraag. Probeer het later opnieuw of neem direct contact op met support@adspersoneelapp.nl'
    );
  }
}
