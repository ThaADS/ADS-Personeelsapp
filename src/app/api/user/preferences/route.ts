import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Input validation schema
const preferencesSchema = z.object({
  emailEnabled: z.boolean().optional(),
  categories: z.record(z.unknown()).optional(),
});

export async function GET() {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  try {
    const pref = await prisma.notificationPreference.findUnique({ where: { userId: context.userId } });
    return NextResponse.json({ emailEnabled: pref?.emailEnabled ?? true, categories: pref?.categories ?? {} });
  } catch {
    return NextResponse.json({ emailEnabled: true, categories: {} });
  }
}

export async function POST(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = preferencesSchema.parse(body);
    const { emailEnabled, categories } = validatedData;
    
    await prisma.notificationPreference.upsert({
      where: { userId: context.userId },
      update: { emailEnabled: emailEnabled ?? true, categories: categories ?? {} },
      create: { userId: context.userId, emailEnabled: emailEnabled ?? true, categories: categories ?? {} },
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

