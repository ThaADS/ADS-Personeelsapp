import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();
    
    return NextResponse.json({
      success: true,
      users: userCount,
      tenants: tenantCount,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}