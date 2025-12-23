import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const where = context.isSuperuser ? {} : { tenantId: context.tenantId };
  const list = await prisma.emailTemplate.findMany({ where, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ items: list });
}

export async function POST(request: NextRequest) {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  if (!context.isSuperuser && !context.tenantId) return NextResponse.json({ error: 'Geen tenant context' }, { status: 400 });
  const body = await request.json();
  const item = await prisma.emailTemplate.create({
    data: {
      tenantId: context.isSuperuser ? null : context.tenantId,
      name: body.name,
      subject: body.subject,
      html: body.html,
    },
  });
  return NextResponse.json({ item });
}

