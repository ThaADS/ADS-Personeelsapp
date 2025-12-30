import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: context.userId }, select: { locale: true } });
  return NextResponse.json({ locale: user?.locale || 'nl' });
}

export async function POST(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const locale = body.locale as string | undefined;
  if (!locale || !['nl','pl','en','de'].includes(locale)) {
    return NextResponse.json({ error: 'Ongeldige taal' }, { status: 400 });
  }
  await prisma.user.update({ where: { id: context.userId }, data: { locale } });
  return NextResponse.json({ ok: true });
}

