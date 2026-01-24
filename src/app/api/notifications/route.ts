/**
 * API route voor email notificaties
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-notifications");
import { 
  sendApprovalNotification, 
  sendStatusUpdateNotification, 
  sendReminderNotification,
  EmailTemplateData
} from "@/lib/services/email-service";

/**
 * POST /api/notifications/approval
 * Verstuurt een notificatie voor een nieuwe goedkeuringsaanvraag
 */
export async function POST(request: NextRequest) {
  try {
    // Sessie controleren
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Request body ophalen
    const body = await request.json();
    const { type, recipientEmail, data } = body;

    if (!recipientEmail || !type || !data) {
      return NextResponse.json({ 
        error: "Ontbrekende velden: recipientEmail, type en data zijn verplicht" 
      }, { status: 400 });
    }

    let success = false;

    // Juiste type notificatie versturen
    switch (type) {
      case 'approval':
        success = await sendApprovalNotification(recipientEmail, data as EmailTemplateData);
        break;
      case 'status-update':
        success = await sendStatusUpdateNotification(recipientEmail, data as EmailTemplateData);
        break;
      case 'reminder':
        success = await sendReminderNotification(recipientEmail, data as EmailTemplateData);
        break;
      default:
        return NextResponse.json({ error: "Ongeldig notificatie type" }, { status: 400 });
    }

    if (success) {
      return NextResponse.json({ success: true, message: "Notificatie verstuurd" });
    } else {
      return NextResponse.json({ error: "Fout bij versturen notificatie" }, { status: 500 });
    }
  } catch (error) {
    logger.error("Error in notifications POST", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
