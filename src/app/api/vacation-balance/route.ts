import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getTenantContext } from "@/lib/auth/tenant-access";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-vacation-balance");

export async function GET() {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const currentYear = new Date().getFullYear();

    // First, find the employee record for this user
    const employee = await prisma.employees.findUnique({
      where: {
        user_id: context.userId,
      },
    });

    if (!employee) {
      // User doesn't have an employee record yet - return default values
      return NextResponse.json({
        total: 25,
        used: 0,
        pending: 0,
        remaining: 25,
        statutory: { total: 20, used: 0, remaining: 20 },
        extra: { total: 5, used: 0, remaining: 5 },
      }, {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      });
    }

    // Get leave balance from the leave_balances table
    const leaveBalance = await prisma.leaveBalance.findFirst({
      where: {
        tenant_id: context.tenantId,
        employee_id: employee.id,
        year: currentYear,
      },
    });

    // Get pending vacation requests for this year
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59`);

    const pendingVacations = await prisma.vacations.findMany({
      where: {
        tenant_id: context.tenantId,
        employee_id: employee.id,
        status: "PENDING",
        start_date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    const pending = pendingVacations.reduce((sum, v) => sum + Number(v.total_days), 0);

    if (leaveBalance) {
      // Calculate from leave balance record
      const statutoryTotal = Number(leaveBalance.statutory_days || 20);
      const statutoryUsed = Number(leaveBalance.statutory_used || 0);
      const extraTotal = Number(leaveBalance.extra_days || 5);
      const extraUsed = Number(leaveBalance.extra_used || 0);

      const total = statutoryTotal + extraTotal;
      const used = statutoryUsed + extraUsed;
      const remaining = Math.max(0, total - used - pending);

      return NextResponse.json({
        total,
        used,
        pending,
        remaining,
        statutory: {
          total: statutoryTotal,
          used: statutoryUsed,
          remaining: Math.max(0, statutoryTotal - statutoryUsed),
          expiry: leaveBalance.statutory_expiry,
        },
        extra: {
          total: extraTotal,
          used: extraUsed,
          remaining: Math.max(0, extraTotal - extraUsed),
          expiry: leaveBalance.extra_expiry,
        },
      }, {
        headers: {
          'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
        },
      });
    }

    // No leave balance record - calculate from vacations directly
    const approvedVacations = await prisma.vacations.findMany({
      where: {
        tenant_id: context.tenantId,
        employee_id: employee.id,
        status: "APPROVED",
        start_date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    const used = approvedVacations.reduce((sum, v) => sum + Number(v.total_days), 0);
    const total = 25; // Default: 20 statutory + 5 extra
    const remaining = Math.max(0, total - used - pending);

    return NextResponse.json({
      total,
      used,
      pending,
      remaining,
      statutory: { total: 20, used: 0, remaining: 20 },
      extra: { total: 5, used: 0, remaining: 5 },
    }, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    logger.error("Error fetching vacation balance", error);
    return NextResponse.json(
      { error: "Fout bij ophalen verlof saldo" },
      { status: 500 }
    );
  }
}
