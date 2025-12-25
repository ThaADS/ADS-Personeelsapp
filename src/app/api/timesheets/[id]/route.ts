import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, createAuditLog } from "@/lib/auth/tenant-access";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schema for updating timesheets (clock out)
const updateTimesheetSchema = z.object({
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)").optional(),
  description: z.string().optional(),
  breakDuration: z.number().min(0).max(480).optional(),
  endLat: z.number().optional(),
  endLng: z.number().optional(),
});

// GET - Fetch a specific timesheet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext();
    const { id } = await params;

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const timesheet = await prisma.timesheet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!timesheet) {
      return NextResponse.json({ error: "Timesheet niet gevonden" }, { status: 404 });
    }

    // Check authorization: user can only see their own, managers can see all in tenant
    if (context.userRole === "USER" && timesheet.userId !== context.userId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
    }

    // Check tenant isolation
    if (context.tenantId && timesheet.tenantId !== context.tenantId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
    }

    return NextResponse.json({
      id: timesheet.id,
      date: timesheet.date.toISOString().split("T")[0],
      startTime: timesheet.startTime.toISOString().substring(11, 16),
      endTime: timesheet.endTime.toISOString().substring(11, 16),
      description: timesheet.description,
      status: timesheet.status,
      breakDuration: timesheet.break_minutes || 0,
      startLat: timesheet.location_start ? (timesheet.location_start as { lat: number }).lat : null,
      startLng: timesheet.location_start ? (timesheet.location_start as { lng: number }).lng : null,
      endLat: timesheet.location_end ? (timesheet.location_end as { lat: number }).lat : null,
      endLng: timesheet.location_end ? (timesheet.location_end as { lng: number }).lng : null,
      userId: timesheet.userId,
      userName: timesheet.user?.name || timesheet.user?.email || "Onbekend",
      createdAt: timesheet.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: timesheet.updatedAt?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH - Update a timesheet (clock out)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext();
    const { id } = await params;

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Find existing timesheet
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: { id },
    });

    if (!existingTimesheet) {
      return NextResponse.json({ error: "Timesheet niet gevonden" }, { status: 404 });
    }

    // Authorization: only owner can update their own timesheet (for clock out)
    if (existingTimesheet.userId !== context.userId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
    }

    // Check tenant isolation
    if (context.tenantId && existingTimesheet.tenantId !== context.tenantId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateTimesheetSchema.parse(body);

    // Build update data
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Update end time if provided
    if (validatedData.endTime) {
      const dateStr = existingTimesheet.date.toISOString().split("T")[0];
      const endTime = new Date(`${dateStr}T${validatedData.endTime}:00.000Z`);

      // Handle end time crossing midnight
      if (endTime <= existingTimesheet.startTime) {
        endTime.setDate(endTime.getDate() + 1);
      }

      updateData.endTime = endTime;
    }

    // Update description if provided
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    // Update break duration if provided
    if (validatedData.breakDuration !== undefined) {
      updateData.break_minutes = validatedData.breakDuration;
    }

    // Update end location if provided
    if (validatedData.endLat !== undefined && validatedData.endLng !== undefined) {
      updateData.location_end = {
        lat: validatedData.endLat,
        lng: validatedData.endLng,
      };
    }

    // Update the timesheet
    const updatedTimesheet = await prisma.timesheet.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog(
      "TIMESHEET_UPDATE",
      "Timesheet",
      updatedTimesheet.id,
      {
        endTime: existingTimesheet.endTime.toISOString().substring(11, 16),
        break_minutes: existingTimesheet.break_minutes,
      },
      {
        endTime: validatedData.endTime,
        breakDuration: validatedData.breakDuration,
        endLat: validatedData.endLat,
        endLng: validatedData.endLng,
      }
    );

    return NextResponse.json({
      success: true,
      id: updatedTimesheet.id,
      timesheet: {
        id: updatedTimesheet.id,
        date: updatedTimesheet.date.toISOString().split("T")[0],
        startTime: updatedTimesheet.startTime.toISOString().substring(11, 16),
        endTime: updatedTimesheet.endTime.toISOString().substring(11, 16),
        description: updatedTimesheet.description,
        status: updatedTimesheet.status,
        breakDuration: updatedTimesheet.break_minutes || 0,
        startLat: updatedTimesheet.location_start
          ? (updatedTimesheet.location_start as { lat: number }).lat
          : null,
        startLng: updatedTimesheet.location_start
          ? (updatedTimesheet.location_start as { lng: number }).lng
          : null,
        endLat: updatedTimesheet.location_end
          ? (updatedTimesheet.location_end as { lat: number }).lat
          : null,
        endLng: updatedTimesheet.location_end
          ? (updatedTimesheet.location_end as { lng: number }).lng
          : null,
        userName: updatedTimesheet.user?.name || updatedTimesheet.user?.email || "Onbekend",
        createdAt: updatedTimesheet.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: updatedTimesheet.updatedAt?.toISOString() || new Date().toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatiefout", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating timesheet:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Delete a timesheet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const context = await getTenantContext();
    const { id } = await params;

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Find existing timesheet
    const existingTimesheet = await prisma.timesheet.findUnique({
      where: { id },
    });

    if (!existingTimesheet) {
      return NextResponse.json({ error: "Timesheet niet gevonden" }, { status: 404 });
    }

    // Authorization: only owner or admin/manager can delete
    const canDelete =
      existingTimesheet.userId === context.userId ||
      context.userRole === "TENANT_ADMIN" ||
      context.userRole === "MANAGER";

    if (!canDelete) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
    }

    // Check tenant isolation
    if (context.tenantId && existingTimesheet.tenantId !== context.tenantId) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 403 });
    }

    // Only allow deleting PENDING timesheets
    if (existingTimesheet.status !== "PENDING") {
      return NextResponse.json(
        { error: "Alleen PENDING timesheets kunnen worden verwijderd" },
        { status: 400 }
      );
    }

    // Delete the timesheet
    await prisma.timesheet.delete({
      where: { id },
    });

    // Create audit log
    await createAuditLog(
      "TIMESHEET_DELETE",
      "Timesheet",
      id,
      {
        date: existingTimesheet.date.toISOString().split("T")[0],
        startTime: existingTimesheet.startTime.toISOString().substring(11, 16),
        endTime: existingTimesheet.endTime.toISOString().substring(11, 16),
      },
      null
    );

    return NextResponse.json({ success: true, message: "Timesheet verwijderd" });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
