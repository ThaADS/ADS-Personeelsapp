import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('🔍 Testing auth for:', email);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isSuperuser: true,
        emailVerified: true,
      },
    });

    console.log('👤 User found:', user ? 'Yes' : 'No');
    
    if (!user || !user.password) {
      return NextResponse.json({
        success: false,
        error: 'User not found or no password'
      });
    }

    // Verify password
    const isValidPassword = await compare(password, user.password);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Get user tenants
    const tenantUsers = await prisma.tenantUser.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: {
        tenant: {
          select: { id: true, slug: true, name: true },
        },
      },
    });

    console.log('🏢 User tenants:', tenantUsers.length);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperuser: user.isSuperuser,
      },
      tenants: tenantUsers.map(tu => tu.tenant),
      message: 'Authentication test successful'
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Authentication test failed'
      },
      { status: 500 }
    );
  }
}