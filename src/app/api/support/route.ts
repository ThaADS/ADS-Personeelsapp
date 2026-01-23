import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

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
      return NextResponse.json(
        { error: 'Vraag en chatgeschiedenis zijn verplicht' },
        { status: 400 }
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
        console.error('Resend API error:', errorData);
        throw new Error('Failed to send email via Resend');
      }

      console.log('Support email sent successfully via Resend');
    } else {
      // Fallback: Log to console (for development or when no email service is configured)
      console.log('='.repeat(80));
      console.log('SUPPORT EMAIL (would be sent to:', supportEmail, ')');
      console.log('='.repeat(80));
      console.log('Subject:', emailSubject);
      console.log('Body:', emailBody);
      console.log('='.repeat(80));

      // You can also try to use nodemailer or other SMTP service if configured
      // For now, we'll consider this a success in development
    }

    // Create audit log entry if needed
    // await createAuditLog('SUPPORT_REQUEST', { question, userId: session?.user?.id });

    return NextResponse.json({
      success: true,
      message: 'Uw vraag is verzonden naar onze support afdeling. We nemen zo spoedig mogelijk contact met u op.',
      emailSent: !!resendApiKey,
    });

  } catch (error) {
    console.error('Error sending support request:', error);
    return NextResponse.json(
      {
        error: 'Er is een fout opgetreden bij het verzenden van uw vraag. Probeer het later opnieuw of neem direct contact op met support@adspersoneelapp.nl',
        success: false,
      },
      { status: 500 }
    );
  }
}
