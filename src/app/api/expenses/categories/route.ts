/**
 * Expense Categories API
 *
 * GET - List available expense categories
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-expense-categories");

// Default Dutch expense categories
const DEFAULT_CATEGORIES = [
  { name: 'Reiskosten', code: 'REIS', is_mileage: false, requires_receipt: true },
  { name: 'Kilometervergoeding', code: 'KM', is_mileage: true, requires_receipt: false },
  { name: 'Maaltijden', code: 'MLTD', is_mileage: false, requires_receipt: true },
  { name: 'Kantoorbenodigdheden', code: 'KANT', is_mileage: false, requires_receipt: true },
  { name: 'Telefoon & Internet', code: 'TEL', is_mileage: false, requires_receipt: true },
  { name: 'Opleiding & Training', code: 'OPL', is_mileage: false, requires_receipt: true },
  { name: 'Representatie', code: 'REP', is_mileage: false, requires_receipt: true },
  { name: 'Overig', code: 'OVR', is_mileage: false, requires_receipt: true },
];

async function ensureDefaultCategories() {
  const existingCount = await prisma.expenseCategory.count({
    where: { tenant_id: null },
  });

  if (existingCount === 0) {
    await prisma.expenseCategory.createMany({
      data: DEFAULT_CATEGORIES.map((cat) => ({
        ...cat,
        tenant_id: null,
      })),
    });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId as string;

    // Ensure default categories exist
    await ensureDefaultCategories();

    // Get categories (system defaults + tenant-specific)
    const categories = await prisma.expenseCategory.findMany({
      where: {
        OR: [{ tenant_id: tenantId }, { tenant_id: null }],
        is_active: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      categories: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        isMileage: cat.is_mileage,
        requiresReceipt: cat.requires_receipt,
        maxAmount: cat.max_amount ? Number(cat.max_amount) : null,
        isSystemDefault: cat.tenant_id === null,
      })),
    });
  } catch (error) {
    logger.error("Failed to fetch expense categories", error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
