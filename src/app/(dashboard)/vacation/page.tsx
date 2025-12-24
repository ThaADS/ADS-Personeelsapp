'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VacationCard, StatusBadge } from '@/components/mobile';
import { StatusFilter } from '@/components/filters';
import { VacationBalance } from '@/components/dashboard';

interface VacationRequest {
  id: string;
  type: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  description: string;
  totalDays: number;
  submittedAt: string;
  status: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function VacationPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'VACATION',
    description: '',
  });

  // Fetch vacation requests from API
  const fetchRequests = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/vacations?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij ophalen aanvragen");
      }
      const data = await response.json();
      setRequests(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/vacations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij indienen aanvraag");
      }

      await fetchRequests();
      setFormData({
        startDate: '',
        endDate: '',
        type: 'VACATION',
        description: '',
      });
      setSelectedTab('overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij indienen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailsClick = (id: string) => {
    router.push(`/vacation/${id}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'VACATION':
        return '🏖️';
      case 'TIME_FOR_TIME':
        return '⏰';
      case 'SPECIAL':
        return '📋';
      default:
        return '📅';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'VACATION':
        return 'Vakantie';
      case 'TIME_FOR_TIME':
        return 'Tijd-voor-tijd';
      case 'SPECIAL':
        return 'Bijzonder verlof';
      default:
        return type;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overzicht' },
    { id: 'request', label: 'Aanvragen' },
    { id: 'balance', label: 'Saldo' },
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Vakantie & Verlof</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beheer je vakantiedagen en verlofaanvragen</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs - Mobile Friendly */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
                selectedTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter op status</h3>
            <StatusFilter
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          {/* Requests List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recente Aanvragen</h3>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Laden...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-3">🏖️</span>
                <p>Geen aanvragen gevonden.</p>
                <p className="text-sm mt-2">Klik op &quot;Aanvragen&quot; om vakantie aan te vragen.</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden p-4 space-y-3">
                  {requests.map((request) => (
                    <VacationCard
                      key={request.id}
                      request={{
                        ...request,
                        description: request.description || null,
                      }}
                      onDetailsClick={handleDetailsClick}
                    />
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Periode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Dagen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Ingediend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {requests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xl mr-2">{getTypeIcon(request.type)}</span>
                            <span className="text-sm text-gray-900 dark:text-white">{getTypeText(request.type)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(request.startDate).toLocaleDateString('nl-NL')} - {new Date(request.endDate).toLocaleDateString('nl-NL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {request.totalDays}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={request.status} size="sm" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(request.submittedAt || request.createdAt).toLocaleDateString('nl-NL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Pagina {pagination.page} van {pagination.pages} ({pagination.total} resultaten)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchRequests(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 min-h-[44px]"
                    >
                      Vorige
                    </button>
                    <button
                      onClick={() => fetchRequests(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 min-h-[44px]"
                    >
                      Volgende
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Request Tab */}
      {selectedTab === 'request' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Nieuwe Vakantieaanvraag</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Startdatum
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Einddatum
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type verlof
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
              >
                <option value="VACATION">🏖️ Vakantie</option>
                <option value="TIME_FOR_TIME">⏰ Tijd-voor-tijd</option>
                <option value="SPECIAL">📋 Bijzonder verlof</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Opmerking (optioneel)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Optionele toelichting..."
                className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium min-h-[44px]"
              >
                {isSubmitting ? 'Bezig met indienen...' : 'Aanvraag Indienen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Balance Tab */}
      {selectedTab === 'balance' && (
        <div className="max-w-md mx-auto">
          <VacationBalance />
        </div>
      )}
    </div>
  );
}
