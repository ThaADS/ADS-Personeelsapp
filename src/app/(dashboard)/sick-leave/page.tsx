'use client';

import { useState, useEffect, useCallback } from 'react';

interface SickLeaveRecord {
  id: string;
  type: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  totalDays: number;
  submittedAt: string;
  status: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function SickLeavePage() {
  const [records, setRecords] = useState<SickLeaveRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: '',
  });

  // Fetch sick leave records from API
  const fetchRecords = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sick-leaves?page=${page}&limit=10`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij ophalen ziekmeldingen");
      }
      const data = await response.json();
      setRecords(data.items || []);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        reason: formData.reason || undefined,
      };

      const response = await fetch("/api/sick-leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij indienen ziekmelding");
      }

      // Refresh list and reset form
      await fetchRecords();
      setFormData({
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        reason: '',
      });
      setSelectedTab('overview');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij indienen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'Goedgekeurd';
      case 'pending':
        return 'In behandeling';
      case 'rejected':
        return 'Afgekeurd';
      default:
        return status;
    }
  };

  // Calculate statistics
  const totalDays = records.reduce((sum, r) => sum + r.totalDays, 0);
  const avgDays = records.length > 0 ? (totalDays / records.length).toFixed(1) : '0';
  const pendingCount = records.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Ziekmeldingen</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beheer je ziekmeldingen en herstelregistraties</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="flex overflow-x-auto border-b border-white/20 dark:border-purple-500/20">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'overview'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Overzicht
          </button>
          <button
            onClick={() => setSelectedTab('report')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'report'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Ziekmelding
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Totaal</h3>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalDays}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ziektedagen</p>
            </div>
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Gemiddeld</h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{avgDays}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Dagen per melding</p>
            </div>
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Meldingen</h3>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{records.length}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Totaal aantal</p>
            </div>
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-6">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">In behandeling</h3>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingCount}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Wachtende meldingen</p>
            </div>
          </div>

          {/* Recent Records */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recente Ziekmeldingen</h3>

              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Laden...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p>Geen ziekmeldingen gevonden.</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow-lg ring-1 ring-white/20 dark:ring-purple-500/20 md:rounded-lg">
                  <table className="min-w-full divide-y divide-white/20 dark:divide-purple-500/20">
                    <thead className="bg-purple-100/80 dark:bg-white/5">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                          Periode
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                          Dagen
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                          Reden
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                          Ingediend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/70 dark:bg-white/5 divide-y divide-purple-200/50 dark:divide-purple-500/20">
                      {records.map((record) => (
                        <tr key={record.id} className="hover:bg-purple-500/5 dark:hover:bg-purple-500/10 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(record.startDate).toLocaleDateString('nl-NL')} - {new Date(record.endDate).toLocaleDateString('nl-NL')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {record.totalDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {record.reason || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(record.submittedAt).toLocaleDateString('nl-NL')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Pagina {pagination.page} van {pagination.pages} ({pagination.total} resultaten)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchRecords(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Vorige
                    </button>
                    <button
                      onClick={() => fetchRecords(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Volgende
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {selectedTab === 'report' && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Nieuwe Ziekmelding</h3>
            <div className="backdrop-blur-sm bg-yellow-500/10 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Belangrijk</h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                    <p>Meld je ziek zo snel mogelijk, bij voorkeur voor 09:00 uur. Neem contact op met je leidinggevende.</p>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Startdatum ziekte</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verwachte einddatum (optioneel)</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reden (optioneel)</label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="Korte omschrijving van de klachten..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 font-medium min-h-[44px] transition-all duration-200"
                >
                  {isSubmitting ? 'Bezig met indienen...' : 'Ziekmelding Indienen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
