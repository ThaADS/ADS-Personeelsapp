import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTenantContext } from "@/lib/auth/tenant-access";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const context = await getTenantContext();
    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59`);

    // Get all vacation requests for the current year
    const vacations = await prisma.vacations.findMany({
      where: {
        tenant_id: context.tenantId,
        employee_id: context.userId,
        start_date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    // Calculate used days (approved vacations)
    const used = vacations
      .filter((v) => v.status === "APPROVED")
      .reduce((sum, v) => sum + Number(v.total_days), 0);

    // Calculate pending days
    const pending = vacations
      .filter((v) => v.status === "PENDING")
      .reduce((sum, v) => sum + Number(v.total_days), 0);

    // Get user's total vacation days (default to 25 if not set)
    // In a real app, this would come from the user's contract/settings
    const total = 25; // Default vacation days per year in NL

    const remaining = Math.max(0, total - used - pending);

    return NextResponse.json({
      total,
      used,
      pending,
      remaining,
    });
  } catch (error) {
    console.error("Error fetching vacation balance:", error);
    return NextResponse.json(
      { error: "Fout bij ophalen verlof saldo" },
      { status: 500 }
    );
  }
}
