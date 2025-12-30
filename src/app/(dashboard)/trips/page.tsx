"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface Trip {
  id: string;
  vehicleId: string;
  registration: string;
  driverName: string | null;
  employeeId: string | null;
  departureTime: string;
  arrivalTime: string;
  distanceKm: number;
  durationMinutes: number;
  departureAddress: string;
  arrivalAddress: string;
  isPrivate: boolean;
  isCommute: boolean;
  isManual: boolean;
  isCorrection: boolean;
  timesheetId: string | null;
  syncedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [includePrivate, setIncludePrivate] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (includePrivate) params.set("includePrivate", "true");

      const res = await fetch(`/api/routevision/trips?${params}`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data.trips || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, dateFrom, dateTo, includePrivate]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    return `${hours}u ${mins}m`;
  };

  const formatDateTime = (dateStr: string): { date: string; time: string } => {
    try {
      const date = new Date(dateStr);
      return {
        date: format(date, "d MMM yyyy", { locale: nl }),
        time: format(date, "HH:mm", { locale: nl }),
      };
    } catch {
      return { date: "-", time: "-" };
    }
  };

  // Calculate totals
  const totalKm = trips.reduce((sum, t) => sum + Number(t.distanceKm), 0);
  const totalDuration = trips.reduce((sum, t) => sum + t.durationMinutes, 0);
  const matchedTrips = trips.filter((t) => t.timesheetId).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              </div>
              Ritten
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overzicht van alle gesynchroniseerde ritten uit RouteVision
            </p>
          </div>
          <a
            href="/settings/routevision"
            className="px-4 py-2 rounded-lg border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Instellingen
          </a>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aantal ritten</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{pagination.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Totaal kilometers</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{totalKm.toFixed(1)} km</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Totale reistijd</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatDuration(totalDuration)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-500/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gekoppeld</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {matchedTrips}/{trips.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-500/20 p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Van
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tot
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includePrivate"
                checked={includePrivate}
                onChange={(e) => setIncludePrivate(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="includePrivate" className="text-sm text-gray-700 dark:text-gray-300">
                Privéritten tonen
              </label>
            </div>
            <button
              onClick={loadTrips}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Zoeken
            </button>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-purple-500/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Laden...</p>
            </div>
          ) : trips.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mt-4">Geen ritten gevonden</p>
              <a
                href="/settings/routevision"
                className="mt-4 inline-block text-purple-600 dark:text-purple-400 hover:underline"
              >
                RouteVision configureren →
              </a>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Datum/Tijd
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Kenteken
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Afstand
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Duur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acties
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-purple-500/10">
                    {trips.map((trip) => {
                      const departure = formatDateTime(trip.departureTime);
                      return (
                        <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {departure.date}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {departure.time}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                              {trip.registration}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900 dark:text-white truncate max-w-xs" title={trip.departureAddress}>
                              {trip.departureAddress}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                              </svg>
                              <span className="truncate max-w-xs" title={trip.arrivalAddress}>
                                {trip.arrivalAddress}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {Number(trip.distanceKm).toFixed(1)} km
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {formatDuration(trip.durationMinutes)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {trip.isPrivate && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                  Privé
                                </span>
                              )}
                              {trip.isCommute && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                  Woon-werk
                                </span>
                              )}
                              {!trip.isPrivate && !trip.isCommute && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                                  Zakelijk
                                </span>
                              )}
                              {trip.timesheetId && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" title="Gekoppeld aan tijdregistratie">
                                  <svg className="w-3 h-3 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedTrip(trip)}
                              className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                              title="Details bekijken"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-gray-100 dark:divide-purple-500/10">
                {trips.map((trip) => {
                  const departure = formatDateTime(trip.departureTime);
                  return (
                    <div
                      key={trip.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-white/5"
                      onClick={() => setSelectedTrip(trip)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {trip.registration}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {departure.date} {departure.time}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <div className="truncate">{trip.departureAddress}</div>
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          <span className="truncate">{trip.arrivalAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2 text-sm">
                          <span className="text-gray-900 dark:text-white font-medium">
                            {Number(trip.distanceKm).toFixed(1)} km
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {formatDuration(trip.durationMinutes)}
                          </span>
                        </div>
                        {trip.isPrivate ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            Privé
                          </span>
                        ) : trip.isCommute ? (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            Woon-werk
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                            Zakelijk
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-4 py-3 border-t border-gray-100 dark:border-purple-500/10 flex items-center justify-between">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pagina {pagination.page} van {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 rounded-lg border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                    >
                      Vorige
                    </button>
                    <button
                      onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 rounded-lg border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                    >
                      Volgende
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Trip Detail Modal */}
        {selectedTrip && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setSelectedTrip(null)}
              />
              <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-500/20">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">
                      Rit Details
                    </h3>
                    <button
                      onClick={() => setSelectedTrip(null)}
                      className="text-white/80 hover:text-white"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="px-6 py-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Kenteken</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                      {selectedTrip.registration}
                    </span>
                  </div>
                  {selectedTrip.driverName && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Bestuurder</span>
                      <span className="text-gray-900 dark:text-white">{selectedTrip.driverName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Vertrek</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDateTime(selectedTrip.departureTime).date} {formatDateTime(selectedTrip.departureTime).time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Aankomst</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDateTime(selectedTrip.arrivalTime).date} {formatDateTime(selectedTrip.arrivalTime).time}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-purple-500/20 pt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vertreklocatie</p>
                    <p className="text-gray-900 dark:text-white">{selectedTrip.departureAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Aankomstlocatie</p>
                    <p className="text-gray-900 dark:text-white">{selectedTrip.arrivalAddress}</p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-purple-500/20 pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Afstand</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {Number(selectedTrip.distanceKm).toFixed(1)} km
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Reistijd</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatDuration(selectedTrip.durationMinutes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedTrip.isPrivate && (
                      <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        Privérit
                      </span>
                    )}
                    {selectedTrip.isCommute && (
                      <span className="px-3 py-1 text-sm rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                        Woon-werk verkeer
                      </span>
                    )}
                    {selectedTrip.isManual && (
                      <span className="px-3 py-1 text-sm rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        Handmatig ingevoerd
                      </span>
                    )}
                    {selectedTrip.isCorrection && (
                      <span className="px-3 py-1 text-sm rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400">
                        Correctie
                      </span>
                    )}
                    {!selectedTrip.isPrivate && !selectedTrip.isCommute && (
                      <span className="px-3 py-1 text-sm rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">
                        Zakelijke rit
                      </span>
                    )}
                  </div>
                  {selectedTrip.timesheetId ? (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="font-medium">Gekoppeld aan tijdregistratie</span>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        Deze rit is automatisch gekoppeld aan een tijdregistratie van de medewerker.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">Niet gekoppeld</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Deze rit is nog niet gekoppeld aan een tijdregistratie.
                      </p>
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-slate-700/50 px-6 py-4">
                  <button
                    onClick={() => setSelectedTrip(null)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
