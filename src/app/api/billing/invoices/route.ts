import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { stripe } from "@/lib/stripe/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.tenantId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get tenant with Stripe customer ID
    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
      select: {
        id: true,
        stripeCustomerId: true,
      },
    });

    if (!tenant?.stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const stripeInvoices = await stripe.invoices.list({
      customer: tenant.stripeCustomerId,
      limit: 24,
      status: "paid",
    });

    // Also fetch open invoices
    const openInvoices = await stripe.invoices.list({
      customer: tenant.stripeCustomerId,
      limit: 10,
      status: "open",
    });

    // Combine and sort by date
    const allInvoices = [...stripeInvoices.data, ...openInvoices.data]
      .sort((a, b) => b.created - a.created)
      .map((invoice) => ({
        id: invoice.id,
        number: invoice.number,
        status: invoice.status,
        amount: invoice.amount_due,
        currency: invoice.currency,
        created: invoice.created,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
      }));

    return NextResponse.json({ invoices: allInvoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
