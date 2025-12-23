/**
 * API route voor audit logging
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { v4 as uuidv4 } from "uuid";
import { AuditLogEntry, AuditCategory } from "@/lib/services/audit-service";

// In-memory audit log voor demo doeleinden
// In productie zou dit naar de database gaan
const auditLogs: AuditLogEntry[] = [];

/**
 * POST /api/audit/log
 * Logt een audit event
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
    const { userId, action, category, details } = body;

    if (!userId || !action || !category) {
      return NextResponse.json({ 
        error: "Ontbrekende velden: userId, action en category zijn verplicht" 
      }, { status: 400 });
    }

    // Valideer de categorie
    const validCategories: AuditCategory[] = [
      'authentication',
      'data_access',
      'data_modification',
      'approval',
      'export',
      'admin',
      'compliance',
      'system'
    ];

    if (!validCategories.includes(category as AuditCategory)) {
      return NextResponse.json({ 
        error: "Ongeldige categorie" 
      }, { status: 400 });
    }

    // IP adres en user agent ophalen
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Audit log entry aanmaken
    const auditEntry: AuditLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      userId,
      userName: body.userName || session.user?.name || 'unknown',
      action,
      category: category as AuditCategory,
      details: details || {},
      ipAddress: ipAddress.toString(),
      userAgent
    };

    // In productie: opslaan in database
    // Voor nu: opslaan in memory array
    auditLogs.push(auditEntry);
    
    // In een echte implementatie zou dit naar de database gaan
    // await prisma.auditLog.create({
    //   data: auditEntry
    // });

    return NextResponse.json(auditEntry);
  } catch (error) {
    console.error("Error in audit log POST:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
