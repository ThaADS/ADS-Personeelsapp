import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/tenant-access";

export async function GET(request: NextRequest) {
  try {
    const context = await requirePermission('timesheet:approve');
    const prisma = new (await import('@prisma/client')).PrismaClient();
    const PDFDocument = (await import('pdfkit')).default;

    const rows = await prisma.timesheet.findMany({
      where: { tenantId: context.tenantId },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { date: 'desc' },
      take: 500,
    });

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (d) => chunks.push(d));

    doc.fontSize(16).text('Timesheets Export', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Tenant: ${context.tenantId}`);
    doc.moveDown();

    rows.forEach((t) => {
      const hours = ((t.endTime.getTime() - t.startTime.getTime()) / (1000*60*60) - (t.breakDuration || 0)/60).toFixed(2);
      doc.fontSize(11).text(`${t.user?.name || t.user?.email || ''} — ${t.date.toISOString().split('T')[0]}`);
      doc.fontSize(9).fillColor('#000').text(`Start: ${t.startTime.toISOString()}  Eind: ${t.endTime.toISOString()}  Pauze: ${t.breakDuration || 0}m  Uren: ${hours}  Status: ${t.status}`);
      if (t.description) doc.text(`Omschrijving: ${t.description}`);
      doc.moveDown(0.6);
    });

    doc.end();
    await new Promise((resolve) => doc.on('end', resolve));
    const pdf = Buffer.concat(chunks);

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="timesheets.pdf"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

