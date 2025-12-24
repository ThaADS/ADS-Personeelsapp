/**
 * API route voor gebruikersprofiel
 */
import { NextRequest, NextResponse } from "next/server";
import { getTenantContext, createAuditLog } from "@/lib/auth/tenant-access";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters bevatten").optional(),
  email: z.string().email("Ongeldig e-mailadres").optional(),
  locale: z.enum(['nl', 'en', 'de', 'pl']).optional(),
  image: z.string().url("Ongeldige URL").optional().nullable(),
  // Extended contact fields - user can edit
  phone: z.string().max(50, "Telefoonnummer te lang").optional().nullable(),
  address: z.string().max(500, "Adres te lang").optional().nullable(),
  city: z.string().max(100, "Plaats te lang").optional().nullable(),
  postalCode: z.string().max(20, "Postcode te lang").optional().nullable(),
});

/**
 * GET /api/user/profile
 * Haalt het profiel van de huidige gebruiker op
 */
export async function GET() {
  try {
    const context = await getTenantContext();

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        locale: true,
        role: true,
        // Extended contact fields
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        // Work info (read-only for users)
        employeeId: true,
        department: true,
        position: true,
        startDate: true,
        contractType: true,
        workHoursPerWeek: true,
        createdAt: true,
        updatedAt: true,
        tenantUsers: {
          where: context.tenantId ? { tenantId: context.tenantId } : undefined,
          select: {
            role: true,
            isActive: true,
            tenant: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        notificationPreference: {
          select: {
            email_vacation_approved: true,
            email_vacation_rejected: true,
            email_sick_leave_uwv: true,
            email_timesheet_reminder: true,
            email_approval_pending: true,
            email_leave_expiring: true,
            in_app_all: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }

    // Transform to response format
    const currentTenantUser = user.tenantUsers[0];

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      locale: user.locale,
      globalRole: user.role,
      tenantRole: currentTenantUser?.role || 'USER',
      isActive: currentTenantUser?.isActive ?? true,
      tenant: currentTenantUser?.tenant || null,
      notifications: user.notificationPreference || null,
      // Contact info
      phone: user.phone,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode,
      // Work info (read-only)
      employeeId: user.employeeId,
      department: user.department,
      position: user.position,
      startDate: user.startDate?.toISOString() || null,
      contractType: user.contractType,
      workHoursPerWeek: user.workHoursPerWeek,
      createdAt: user.createdAt?.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
    });
  } catch (error) {
    console.error("Error in profile GET:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * PUT /api/user/profile
 * Werkt het profiel van de huidige gebruiker bij
 */
export async function PUT(request: NextRequest) {
  try {
    const context = await getTenantContext();

    if (!context) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: context.userId },
      select: {
        name: true,
        email: true,
        locale: true,
        image: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }

    // Check if email is being changed and if it's already in use
    if (validatedData.email && validatedData.email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: "E-mailadres is al in gebruik" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: context.userId },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.locale && { locale: validatedData.locale }),
        ...(validatedData.image !== undefined && { image: validatedData.image }),
        // Contact fields - allow null to clear value
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.address !== undefined && { address: validatedData.address }),
        ...(validatedData.city !== undefined && { city: validatedData.city }),
        ...(validatedData.postalCode !== undefined && { postalCode: validatedData.postalCode }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        locale: true,
        role: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await createAuditLog(
      'UPDATE_PROFILE',
      'User',
      context.userId,
      {
        name: currentUser.name,
        email: currentUser.email,
        locale: currentUser.locale,
        image: currentUser.image,
        phone: currentUser.phone,
        address: currentUser.address,
        city: currentUser.city,
        postalCode: currentUser.postalCode,
      },
      {
        name: updatedUser.name,
        email: updatedUser.email,
        locale: updatedUser.locale,
        image: updatedUser.image,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
      }
    );

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        locale: updatedUser.locale,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        updatedAt: updatedUser.updatedAt?.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validatiefout", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error in profile PUT:", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}
