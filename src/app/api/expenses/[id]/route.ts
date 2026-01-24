/**
 * Individual Expense API
 *
 * GET - Get expense details
 * PUT - Update expense
 * DELETE - Delete expense (draft only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-expenses-id");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId as string;
    const { id } = await params;

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            code: true,
            is_mileage: true,
            requires_receipt: true,
          },
        },
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Declaratie niet gevonden' }, { status: 404 });
    }

    return NextResponse.json({
      expense: {
        id: expense.id,
        date: expense.date,
        category: expense.category,
        amount: Number(expense.amount),
        currency: expense.currency,
        description: expense.description,
        merchant: expense.merchant,
        isMileage: expense.is_mileage,
        distanceKm: expense.distance_km ? Number(expense.distance_km) : null,
        ratePerKm: expense.rate_per_km ? Number(expense.rate_per_km) : null,
        fromLocation: expense.from_location,
        toLocation: expense.to_location,
        receiptUrl: expense.receipt_url,
        receiptFilename: expense.receipt_filename,
        projectCode: expense.project_code,
        costCenter: expense.cost_center,
        status: expense.status,
        submittedAt: expense.submitted_at,
        reviewedAt: expense.reviewed_at,
        rejectionReason: expense.rejection_reason,
        paidAt: expense.paid_at,
        paymentReference: expense.payment_reference,
        createdAt: expense.created_at,
        updatedAt: expense.updated_at,
      },
    });
  } catch (error) {
    logger.error("GET error", error);
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;
    const { id } = await params;

    const body = await request.json();

    // Get employee
    const employee = await prisma.employees.findFirst({
      where: { user_id: userId, tenant_id: tenantId },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get existing expense
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        employee_id: employee.id,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Declaratie niet gevonden' }, { status: 404 });
    }

    // Only allow editing DRAFT or REJECTED expenses
    if (!['DRAFT', 'REJECTED'].includes(expense.status)) {
      return NextResponse.json(
        { error: 'Alleen concepten en afgewezen declaraties kunnen worden bewerkt' },
        { status: 400 }
      );
    }

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

    // Calculate amount for mileage claims
    let finalAmount = amount;
    if (isMileage && distanceKm) {
      const rate = ratePerKm || 0.23;
      finalAmount = distanceKm * rate;
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        category_id: categoryId,
        date: date ? new Date(date) : undefined,
        amount: finalAmount,
        description,
        merchant,
        is_mileage: isMileage,
        distance_km: distanceKm,
        rate_per_km: ratePerKm || (isMileage ? 0.23 : null),
        from_location: fromLocation,
        to_location: toLocation,
        receipt_url: receiptUrl,
        receipt_filename: receiptFilename,
        project_code: projectCode,
        cost_center: costCenter,
        status: submitNow ? 'SUBMITTED' : expense.status === 'REJECTED' ? 'SUBMITTED' : 'DRAFT',
        submitted_at: submitNow || expense.status === 'REJECTED' ? new Date() : expense.submitted_at,
        rejection_reason: submitNow ? null : expense.rejection_reason,
        updated_at: new Date(),
      },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      expense: {
        id: updated.id,
        date: updated.date,
        category: updated.category,
        amount: Number(updated.amount),
        status: updated.status,
      },
    });
  } catch (error) {
    logger.error("PUT error", error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    const tenantId = session.user.tenantId as string;
    const { id } = await params;

    // Get employee
    const employee = await prisma.employees.findFirst({
      where: { user_id: userId, tenant_id: tenantId },
      select: { id: true },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Get existing expense
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        employee_id: employee.id,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Declaratie niet gevonden' }, { status: 404 });
    }

    // Only allow deleting DRAFT expenses
    if (expense.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Alleen concepten kunnen worden verwijderd' },
        { status: 400 }
      );
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("DELETE error", error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
