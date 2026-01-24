/**
 * Expenses API
 *
 * GET - List expenses for user or team (managers)
 * POST - Create new expense
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

// Dutch expense categories (seeded on first request if not exist)
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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;
    const userRole = session.user.role as string;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const view = searchParams.get('view'); // 'my' or 'team' (managers only)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get employee ID
    const employee = await prisma.employees.findFirst({
      where: { user_id: userId, tenant_id: tenantId },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Build where clause
    const where: Record<string, unknown> = {
      tenant_id: tenantId,
    };

    // View filter (managers can see team expenses)
    if (view === 'team' && ['MANAGER', 'TENANT_ADMIN', 'SUPERUSER'].includes(userRole)) {
      // Show all expenses for approval
      where.status = { in: ['SUBMITTED', 'APPROVED', 'REJECTED'] };
    } else {
      // Show only user's expenses
      where.employee_id = employee.id;
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              code: true,
              is_mileage: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    // Get employee names if viewing team expenses
    let employeeNames: Record<string, string> = {};
    if (view === 'team') {
      const employeeIds = [...new Set(expenses.map((e) => e.employee_id))];
      const employees = await prisma.employees.findMany({
        where: { id: { in: employeeIds } },
        select: { id: true, users: { select: { name: true } } },
      });
      employeeNames = Object.fromEntries(
        employees.map((e) => [e.id, e.users?.name || 'Onbekend'])
      );
    }

    return NextResponse.json({
      expenses: expenses.map((exp) => ({
        id: exp.id,
        date: exp.date,
        category: exp.category,
        amount: Number(exp.amount),
        currency: exp.currency,
        description: exp.description,
        merchant: exp.merchant,
        isMileage: exp.is_mileage,
        distanceKm: exp.distance_km ? Number(exp.distance_km) : null,
        ratePerKm: exp.rate_per_km ? Number(exp.rate_per_km) : null,
        fromLocation: exp.from_location,
        toLocation: exp.to_location,
        receiptUrl: exp.receipt_url,
        status: exp.status,
        submittedAt: exp.submitted_at,
        reviewedAt: exp.reviewed_at,
        rejectionReason: exp.rejection_reason,
        paidAt: exp.paid_at,
        employeeName: employeeNames[exp.employee_id] || null,
        createdAt: exp.created_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Expenses API] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;

    // Ensure default categories exist
    await ensureDefaultCategories();

    const body = await request.json();
    const {
      categoryId,
      date,
      amount,
      description,
      merchant,
      isMileage,
      distanceKm,
      ratePerKm,
      fromLocation,
      toLocation,
      receiptUrl,
      receiptFilename,
      projectCode,
      costCenter,
      submitNow,
    } = body;

    // Validate required fields
    if (!categoryId || !date || !description) {
      return NextResponse.json(
        { error: 'Categorie, datum en beschrijving zijn verplicht' },
        { status: 400 }
      );
    }

    // Get employee ID
    const employee = await prisma.employees.findFirst({
      where: { user_id: userId, tenant_id: tenantId },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Validate category
    const category = await prisma.expenseCategory.findFirst({
      where: {
        id: categoryId,
        OR: [{ tenant_id: tenantId }, { tenant_id: null }],
        is_active: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Ongeldige categorie' }, { status: 400 });
    }

    // Calculate amount for mileage claims
    let finalAmount = amount;
    if (isMileage && distanceKm) {
      const rate = ratePerKm || 0.23; // Dutch standard rate
      finalAmount = distanceKm * rate;
    }

    // Create expense
    const expense = await prisma.expense.create({
      data: {
        tenant_id: tenantId,
        employee_id: employee.id,
        category_id: categoryId,
        date: new Date(date),
        amount: finalAmount,
        description,
        merchant,
        is_mileage: isMileage || false,
        distance_km: distanceKm,
        rate_per_km: ratePerKm || (isMileage ? 0.23 : null),
        from_location: fromLocation,
        to_location: toLocation,
        receipt_url: receiptUrl,
        receipt_filename: receiptFilename,
        project_code: projectCode,
        cost_center: costCenter,
        status: submitNow ? 'SUBMITTED' : 'DRAFT',
        submitted_at: submitNow ? new Date() : null,
      },
      include: {
        category: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json({
      expense: {
        id: expense.id,
        date: expense.date,
        category: expense.category,
        amount: Number(expense.amount),
        description: expense.description,
        status: expense.status,
        createdAt: expense.created_at,
      },
    });
  } catch (error) {
    console.error('[Expenses API] POST error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}
