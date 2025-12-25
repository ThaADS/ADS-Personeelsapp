"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import { QuickClockIn, VacationBalance } from '@/components/dashboard';

interface DashboardStats {
  // Basic stats
  pendingTimesheets: number;
  approvedThisWeek: number;
  totalHoursThisMonth: number;
  upcomingVacations: number;

  // Extended stats
  activeSickLeaves: number;
  expiringLeaveWarnings: number;
  pendingVacationRequests: number;
  overtimeHoursThisMonth: number;

  // Manager-specific
  teamMemberCount?: number;
  teamPendingApprovals?: number;
  teamSickLeaveCount?: number;
  uwvAlertCount?: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingTimesheets: 0,
    approvedThisWeek: 0,
    totalHoursThisMonth: 0,
    upcomingVacations: 0,
    activeSickLeaves: 0,
    expiringLeaveWarnings: 0,
    pendingVacationRequests: 0,
    overtimeHoursThisMonth: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Registreer uren',
      description: 'Voeg nieuwe tijdregistratie toe',
      href: '/timesheet',
      icon: ClockIcon,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
    },
    {
      title: 'Vraag verlof aan',
      description: 'Dien een verlofaanvraag in',
      href: '/vacation',
      icon: CalendarIcon,
      color: 'bg-gradient-to-br from-green-500 to-emerald-600'
    },
    {
      title: 'Ziekmelding',
      description: 'Meld je ziek',
      href: '/sick-leave',
      icon: UserGroupIcon,
      color: 'bg-gradient-to-br from-orange-500 to-amber-600'
    },
    {
      title: 'Mijn profiel',
      description: 'Bekijk en bewerk je profiel',
      href: '/profile',
      icon: UserGroupIcon,
      color: 'bg-gradient-to-br from-purple-500 to-pink-600'
    }
  ];

  // Build stat cards - include extended KPIs
  const baseStatCards = [
    {
      name: 'Uren deze maand',
      value: stats.totalHoursThisMonth,
      suffix: 'u',
      icon: ClockIcon,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      trend: ''
    },
    {
      name: 'Overuren',
      value: stats.overtimeHoursThisMonth,
      suffix: 'u',
      icon: ArrowTrendingUpIcon,
      color: 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
      trend: ''
    },
    {
      name: 'Goedgekeurd deze week',
      value: stats.approvedThisWeek,
      suffix: '',
      icon: CheckCircleIcon,
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      trend: ''
    },
    {
      name: 'Wacht op goedkeuring',
      value: stats.pendingTimesheets,
      suffix: '',
      icon: DocumentCheckIcon,
      color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      trend: ''
    }
  ];

  // Additional row of cards
  const extendedStatCards = [
    {
      name: 'Aankomend verlof',
      value: stats.upcomingVacations,
      suffix: '',
      icon: CalendarIcon,
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      trend: ''
    },
    {
      name: 'Verlofaanvragen',
      value: stats.pendingVacationRequests,
      suffix: '',
      icon: CalendarIcon,
      color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30',
      trend: ''
    },
    {
      name: 'Actieve ziekmeldingen',
      value: stats.activeSickLeaves,
      suffix: '',
      icon: HeartIcon,
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      trend: '',
      highlight: stats.activeSickLeaves > 0
    },
    {
      name: 'Verlof verloopt',
      value: stats.expiringLeaveWarnings,
      suffix: '',
      icon: ExclamationTriangleIcon,
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      trend: '',
      highlight: stats.expiringLeaveWarnings > 0
    }
  ];

  // Manager-specific cards (only shown if user has manager stats)
  const managerStatCards = stats.teamMemberCount !== undefined ? [
    {
      name: 'Teamleden',
      value: stats.teamMemberCount,
      suffix: '',
      icon: UserGroupIcon,
      color: 'text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30',
      trend: ''
    },
    {
      name: 'Team goedkeuringen',
      value: stats.teamPendingApprovals || 0,
      suffix: '',
      icon: DocumentCheckIcon,
      color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      trend: '',
      highlight: (stats.teamPendingApprovals || 0) > 0
    },
    {
      name: 'Team ziek',
      value: stats.teamSickLeaveCount || 0,
      suffix: '',
      icon: HeartIcon,
      color: 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30',
      trend: ''
    },
    {
      name: 'UWV alerts',
      value: stats.uwvAlertCount || 0,
      suffix: '',
      icon: ExclamationTriangleIcon,
      color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      trend: '',
      highlight: (stats.uwvAlertCount || 0) > 0
    }
  ] : [];

  const statCards = baseStatCards;

  return (
    <div className="space-y-6 md:space-y-8 pb-20 md:pb-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welkom terug!</h1>
        <p className="text-violet-100 text-sm md:text-base">
          Hier is je overzicht voor vandaag
        </p>
      </div>

      {/* Mobile: Quick Clock In + Vacation Balance side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <QuickClockIn />
        <VacationBalance />
      </div>

      {/* Stats Grid - Basic KPIs */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Mijn statistieken</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                {stat.trend && (
                  <span className="text-xs md:text-sm font-medium text-green-600 dark:text-green-400 flex items-center">
                    <ArrowTrendingUpIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoading ? '...' : stat.value}
                {stat.suffix}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Extended Stats - Verlof & Ziekte */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Verlof & gezondheid</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {extendedStatCards.map((stat, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 md:p-6 hover:shadow-md transition-shadow ${
                stat.highlight
                  ? 'border-amber-300 dark:border-amber-600 ring-1 ring-amber-200 dark:ring-amber-700'
                  : 'border-gray-100 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                {stat.highlight && (
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">
                    Let op
                  </span>
                )}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {isLoading ? '...' : stat.value}
                {stat.suffix}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Manager Stats - Only shown for managers/admins */}
      {managerStatCards.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">Team overzicht</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {managerStatCards.map((stat, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-4 md:p-6 hover:shadow-md transition-shadow ${
                  stat.highlight
                    ? 'border-red-300 dark:border-red-600 ring-1 ring-red-200 dark:ring-red-700'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div className={`p-2 md:p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  {stat.highlight && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      Actie vereist
                    </span>
                  )}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {isLoading ? '...' : stat.value}
                  {stat.suffix}
                </div>
                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">Snelle acties</h2>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 hover:shadow-lg transition-all duration-300 overflow-hidden min-h-[120px] md:min-h-[160px]"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

              <div className="relative">
                <div className={`inline-flex p-2 md:p-3 rounded-xl ${action.color} mb-3 md:mb-4`}>
                  <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white mb-1 md:mb-2">
                  {action.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden md:block">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Recente activiteit</h2>
          <Link
            href="/timesheet"
            className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium min-h-[44px] flex items-center"
          >
            Bekijk alles →
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center justify-center py-8 md:py-12 text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <BellIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
              <p className="text-sm md:text-base">Geen recente activiteit</p>
              <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 mt-1">
                Start met het registreren van je uren
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
