/**
 * Expense Approval API
 *
 * POST - Approve or reject expense
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';

export async function POST(
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
    const userRole = session.user.role as string;

    // Only managers can approve
    if (!['MANAGER', 'TENANT_ADMIN', 'SUPERUSER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Geen toestemming om declaraties goed te keuren' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action, rejectionReason } = body as {
      action: 'approve' | 'reject';
      rejectionReason?: string;
    };

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 });
    }

    if (action === 'reject' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Reden voor afwijzing is verplicht' },
        { status: 400 }
      );
    }

    // Get expense
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        tenant_id: tenantId,
        status: 'SUBMITTED',
      },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Declaratie niet gevonden of niet in behandeling' },
        { status: 404 }
      );
    }

    // Update expense
    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewed_by: userId,
        reviewed_at: new Date(),
        rejection_reason: action === 'reject' ? rejectionReason : null,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      expense: {
        id: updated.id,
        status: updated.status,
        reviewedAt: updated.reviewed_at,
      },
    });
  } catch (error) {
    console.error('[Expense Approve API] Error:', error);
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
}
