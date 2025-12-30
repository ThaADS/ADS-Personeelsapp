import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { prisma } from '@/lib/db/prisma';
import { z } from 'zod';

// Input validation schema matching the actual Prisma model
const preferencesSchema = z.object({
  email_vacation_approved: z.boolean().optional(),
  email_vacation_rejected: z.boolean().optional(),
  email_sick_leave_uwv: z.boolean().optional(),
  email_timesheet_reminder: z.boolean().optional(),
  email_approval_pending: z.boolean().optional(),
  email_leave_expiring: z.boolean().optional(),
  in_app_all: z.boolean().optional(),
});

export async function GET() {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  try {
    const pref = await prisma.notificationPreference.findUnique({ where: { userId: context.userId } });
    return NextResponse.json({
      email_vacation_approved: pref?.email_vacation_approved ?? true,
      email_vacation_rejected: pref?.email_vacation_rejected ?? true,
      email_sick_leave_uwv: pref?.email_sick_leave_uwv ?? true,
      email_timesheet_reminder: pref?.email_timesheet_reminder ?? true,
      email_approval_pending: pref?.email_approval_pending ?? true,
      email_leave_expiring: pref?.email_leave_expiring ?? true,
      in_app_all: pref?.in_app_all ?? true,
    });
  } catch {
    return NextResponse.json({
      email_vacation_approved: true,
      email_vacation_rejected: true,
      email_sick_leave_uwv: true,
      email_timesheet_reminder: true,
      email_approval_pending: true,
      email_leave_expiring: true,
      in_app_all: true,
    });
  }
}

export async function POST(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });

  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = preferencesSchema.parse(body);

    await prisma.notificationPreference.upsert({
      where: { userId: context.userId },
      update: validatedData,
      create: { userId: context.userId, ...validatedData },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 });
  }
}
