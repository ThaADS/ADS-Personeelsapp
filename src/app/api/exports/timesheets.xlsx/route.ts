import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/tenant-access";
import { Workbook } from 'exceljs';

export async function GET(request: NextRequest) {
  try {
    const context = await requirePermission('timesheet:approve');
    const prisma = new (await import('@prisma/client')).PrismaClient();

    const rows = await prisma.timesheet.findMany({
      where: { tenantId: context.tenantId },
      include: { user: { select: { email: true, name: true } } },
      orderBy: { date: 'desc' },
      take: 2000,
    });

    const data = rows.map((t) => ({
      id: t.id,
      userEmail: t.user?.email || '',
      userName: t.user?.name || '',
      date: t.date.toISOString().split('T')[0],
      startTime: t.startTime.toISOString(),
      endTime: t.endTime.toISOString(),
      breakMinutes: t.break_minutes || 0,
      hours: ((t.endTime.getTime() - t.startTime.getTime()) / (1000*60*60) - (t.break_minutes || 0)/60).toFixed(2),
      status: t.status,
      description: t.description || '',
    }));

    // Create Excel workbook using ExcelJS
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Timesheets');
    
    // Add headers
    worksheet.addRow([
      'ID', 'User Email', 'User Name', 'Date', 'Start Time', 'End Time', 
      'Break Minutes', 'Hours', 'Status', 'Description'
    ]);
    
    // Add data rows
    data.forEach(row => {
      worksheet.addRow([
        row.id, row.userEmail, row.userName, row.date, row.startTime, 
        row.endTime, row.breakMinutes, row.hours, row.status, row.description
      ]);
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="timesheets.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

