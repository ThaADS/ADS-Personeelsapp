import { NextRequest, NextResponse } from 'next/server';
import { getTenantContext } from '@/lib/auth/tenant-access';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const body = await request.json();
  const where = context.isSuperuser ? { id: params.id } : { id: params.id, tenantId: context.tenantId };
  const item = await prisma.emailTemplate.update({ where, data: { name: body.name, subject: body.subject, html: body.html } });
  return NextResponse.json({ item });
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const context = await getTenantContext();
  if (!context) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });
  const where = context.isSuperuser ? { id: params.id } : { id: params.id, tenantId: context.tenantId };
  await prisma.emailTemplate.delete({ where });
  return NextResponse.json({ ok: true });
}

