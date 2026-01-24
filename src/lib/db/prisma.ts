import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Prisma Client singleton with optimized connection pooling
 *
 * Configuration for scalability:
 * - Connection pooling is handled via DATABASE_URL query params
 * - Add ?connection_limit=10&pool_timeout=20 to DATABASE_URL for production
 * - Vercel/Serverless: Use Prisma Accelerate or PgBouncer for connection pooling
 *
 * Logging levels:
 * - Development: warnings and errors for debugging
 * - Production: errors only to reduce log volume
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { level: 'warn', emit: 'stdout' },
            { level: 'error', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
    // Datasource configuration can be overridden via env vars
    // For connection pooling in production, configure via DATABASE_URL:
    // postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
  });

// Prevent multiple instances in development (hot reloading)
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown handlers for proper connection cleanup
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

export default prisma;

/**
 * Health check helper for database connectivity
 * Use in health check endpoints and monitoring
 */
export async function checkDatabaseHealth(): Promise<{
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'up',
      latency: Date.now() - startTime,
    };
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

