'use client';

import { useEffect, useState } from 'react';
import { BarChart, LineChart, PieChart } from '@/components/charts';
import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface WeeklyData {
  week: string;
  weekLabel: string;
  hours: number;
  overtime: number;
}

interface MonthlyData {
  month: string;
  monthLabel: string;
  hours: number;
  vacationDays: number;
  sickDays: number;
}

interface LeaveBreakdown {
  type: string;
  days: number;
  color: string;
}

interface TeamMemberStats {
  name: string;
  hours: number;
  approvalRate: number;
}

interface AnalyticsData {
  weeklyHours: WeeklyData[];
  monthlyTrends: MonthlyData[];
  leaveBreakdown: LeaveBreakdown[];
  teamStats?: TeamMemberStats[];
  period: {
    start: string;
    end: string;
  };
}

export function DashboardAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'leave'>('weekly');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/dashboard/analytics');
        if (!response.ok) throw new Error('Failed to fetch analytics');
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError('Kon analytics niet laden');
        console.error('Analytics fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExport = async (type: 'timesheets' | 'leave' | 'team') => {
    setExporting(true);
    try {
      const response = await fetch(`/api/dashboard/export?type=${type}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || `export_${type}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
          <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 p-6">
        <p className="text-gray-500 dark:text-gray-400">{error || 'Geen data beschikbaar'}</p>
      </div>
    );
  }

  const tabs = [
    { id: 'weekly' as const, label: 'Wekelijks', icon: ChartBarIcon },
    { id: 'monthly' as const, label: 'Maandelijks', icon: CalendarDaysIcon },
    { id: 'leave' as const, label: 'Verlof', icon: CalendarDaysIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Analytics Card */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 p-6">
        {/* Header with tabs and export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Inzichten & Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {data.period.start} t/m {data.period.end}
            </p>
          </div>

          {/* Export dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {exporting ? 'Exporteren...' : 'Exporteer CSV'}
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExport('timesheets')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 rounded-t-lg"
                >
                  Urenregistratie
                </button>
                <button
                  onClick={() => handleExport('leave')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600"
                >
                  Verlofoverzicht
                </button>
                {data.teamStats && (
                  <button
                    onClick={() => handleExport('team')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 rounded-b-lg"
                  >
                    Team overzicht
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700/50 rounded-lg mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart content */}
        <div className="min-h-[250px] pl-10">
          {activeTab === 'weekly' && (
            <BarChart
              data={data.weeklyHours.map((w) => ({
                label: w.weekLabel,
                value: w.hours,
                secondaryValue: w.overtime,
              }))}
              height={250}
              showSecondary={true}
              primaryLabel="Uren"
              secondaryLabel="Overuren"
            />
          )}

          {activeTab === 'monthly' && (
            <LineChart
              data={data.monthlyTrends.map((m) => ({
                label: m.monthLabel,
                value: m.hours,
                secondaryValue: m.vacationDays,
                tertiaryValue: m.sickDays,
              }))}
              height={250}
              primaryLabel="Uren"
              secondaryLabel="Verlofdagen"
              tertiaryLabel="Ziektedagen"
            />
          )}

          {activeTab === 'leave' && (
            <div className="flex justify-center">
              <PieChart
                data={data.leaveBreakdown.map((l) => ({
                  label: l.type,
                  value: l.days,
                  color: l.color,
                }))}
                size={200}
              />
            </div>
          )}
        </div>
      </div>

      {/* Team Stats (for managers) */}
      {data.teamStats && data.teamStats.length > 0 && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserGroupIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Team Prestaties</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-600">
                  <th className="text-left py-3 px-2 font-medium text-gray-600 dark:text-gray-400">Medewerker</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400">Uren deze maand</th>
                  <th className="text-right py-3 px-2 font-medium text-gray-600 dark:text-gray-400">Goedkeuringsratio</th>
                </tr>
              </thead>
              <tbody>
                {data.teamStats.map((member, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-slate-700 last:border-0"
                  >
                    <td className="py-3 px-2 text-gray-900 dark:text-white">{member.name}</td>
                    <td className="py-3 px-2 text-right text-gray-900 dark:text-white font-medium">
                      {member.hours}u
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.approvalRate >= 80
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : member.approvalRate >= 50
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {member.approvalRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
