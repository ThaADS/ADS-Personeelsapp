import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: {
      status: 'up' | 'down';
      latency?: number;
      error?: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

/**
 * Health Check Endpoint
 * GET /api/health - Returns application health status
 *
 * Used for:
 * - Load balancer health checks
 * - Container orchestration liveness/readiness probes
 * - Monitoring and alerting systems
 */
export async function GET(): Promise<NextResponse<HealthStatus>> {
  const startTime = Date.now();
  let dbStatus: 'up' | 'down' = 'down';
  let dbLatency: number | undefined;
  let dbError: string | undefined;

  // Check database connectivity
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    dbStatus = 'up';
  } catch (error) {
    dbError = error instanceof Error ? error.message : 'Unknown database error';
  }

  // Check memory usage
  const memoryUsage = process.memoryUsage();
  const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
  const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
  const memoryPercentage = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

  let memoryStatus: 'ok' | 'warning' | 'critical' = 'ok';
  if (memoryPercentage > 90) {
    memoryStatus = 'critical';
  } else if (memoryPercentage > 75) {
    memoryStatus = 'warning';
  }

  // Determine overall status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  if (dbStatus === 'down') {
    overallStatus = 'unhealthy';
  } else if (memoryStatus === 'critical') {
    overallStatus = 'degraded';
  } else if (memoryStatus === 'warning') {
    overallStatus = 'degraded';
  }

  const healthStatus: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor(process.uptime()),
    checks: {
      database: {
        status: dbStatus,
        latency: dbLatency,
        ...(dbError && { error: dbError }),
      },
      memory: {
        status: memoryStatus,
        used: memoryUsedMB,
        total: memoryTotalMB,
        percentage: memoryPercentage,
      },
    },
  };

  // Return appropriate status code based on health
  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(healthStatus, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    },
  });
}

/**
 * Liveness probe for Kubernetes/container orchestration
 * HEAD /api/health - Simple liveness check
 */
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 });
}
