'use client';

import { useEffect, useState } from 'react';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  ClockIcon, 
  CurrencyEuroIcon,
  ChartBarIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';

interface PlatformStats {
  overview: {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    freemiumTenants: number;
    totalUsers: number;
    activeUsers: number;
    totalTimesheets: number;
    recentTimesheets: number;
    paidTenants: number;
    mrr: number;
  };
  activity: {
    recentTenants: Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      plan: string;
      activeUsers: number;
      createdAt: string;
    }>;
    topTenants: Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      activeUsers: number;
      recentActivity: number;
    }>;
  };
  systemHealth: {
    dbConnections: string;
    lastBackup: string;
    uptime: number;
  };
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  change?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 text-white p-1 rounded ${colorClasses[color]}`} />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {change && (
                <dd className="text-sm text-gray-600">{change}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-lg shadow h-24"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">{error || 'Unknown error occurred'}</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Platform Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the ADS Personeelsapp admin panel
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link 
            href="/admin/tenants"
            className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Manage Tenants
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={stats.overview.totalTenants}
          icon={BuildingOfficeIcon}
          color="blue"
        />
        <StatCard
          title="Active Tenants"
          value={stats.overview.activeTenants}
          icon={BuildingOfficeIcon}
          color="green"
        />
        <StatCard
          title="Trial Tenants"
          value={stats.overview.trialTenants}
          icon={ClockIcon}
          color="yellow"
        />
        <StatCard
          title="Total Users"
          value={stats.overview.totalUsers}
          icon={UsersIcon}
          color="blue"
        />
        <StatCard
          title="Active Users"
          value={stats.overview.activeUsers}
          icon={UsersIcon}
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`€${stats.overview.mrr.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
          icon={CurrencyEuroIcon}
          color="green"
        />
        <StatCard
          title="Total Timesheets"
          value={stats.overview.totalTimesheets.toLocaleString()}
          icon={ChartBarIcon}
          color="blue"
        />
        <StatCard
          title="Recent Activity"
          value={stats.overview.recentTimesheets}
          icon={ChartBarIcon}
          change="Last 30 days"
          color="blue"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Tenants */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Tenants</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats.activity.recentTenants.map((tenant) => (
                  <li key={tenant.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tenant.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tenant.slug} • {tenant.activeUsers} users
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          tenant.status === 'TRIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {tenant.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <Link
                href="/admin/tenants"
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                View all tenants
              </Link>
            </div>
          </div>
        </div>

        {/* Top Active Tenants */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Most Active Tenants</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats.activity.topTenants.map((tenant) => (
                  <li key={tenant.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {tenant.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tenant.activeUsers} users • {tenant.recentActivity} timesheets
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="text-sm font-medium text-blue-600">
                          {tenant.recentActivity}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
        </div>
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Database Status</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">{stats.systemHealth.dbConnections}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Backup</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(stats.systemHealth.lastBackup).toLocaleString('nl-NL')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">System Uptime</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatUptime(stats.systemHealth.uptime)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
