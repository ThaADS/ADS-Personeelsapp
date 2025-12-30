"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TimesheetCard, StatusBadge, GPSIndicator } from "@/components/mobile";
import { DateRangeFilter, StatusFilter } from "@/components/filters";

interface TimesheetEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  description: string | null;
  status: string;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Filters {
  startDate: Date;
  endDate: Date;
  status: string;
}

export default function TimesheetPage() {
  const router = useRouter();
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end, status: "all" };
  });
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    breakDuration: 30,
    description: "",
  });
  const [startCoord, setStartCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [endCoord, setEndCoord] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<"start" | "end" | null>(null);

  // Fetch timesheets from API
  const fetchTimesheets = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          startDate: filters.startDate.toISOString(),
          endDate: filters.endDate.toISOString(),
        });
        if (filters.status !== "all") {
          params.set("status", filters.status);
        }

        const response = await fetch(`/api/timesheets?${params}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Fout bij ophalen tijdregistraties");
        }
        const data = await response.json();
        setTimesheets(data.items || []);
        setPagination(data.pagination || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  // Functie om het formulier te verwerken
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        breakDuration: Number(formData.breakDuration),
        description: formData.description || undefined,
        startLat: startCoord?.lat,
        startLng: startCoord?.lng,
        endLat: endCoord?.lat,
        endLng: endCoord?.lng,
      };

      const response = await fetch("/api/timesheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fout bij opslaan tijdregistratie");
      }

      await fetchTimesheets();

      setFormData({
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
        breakDuration: 30,
        description: "",
      });
      setStartCoord(null);
      setEndCoord(null);
      setShowNewEntryForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout bij opslaan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const captureLocation = (type: "start" | "end") => {
    if (!navigator.geolocation) {
      alert("Geolocatie wordt niet ondersteund door deze browser.");
      return;
    }
    setGpsLoading(type);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (type === "start") setStartCoord(coord);
        else setEndCoord(coord);
        setGpsLoading(null);
      },
      (err) => {
        alert("Kon locatie niet bepalen: " + err.message);
        setGpsLoading(null);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const calculateWorkTime = (entry: TimesheetEntry) => {
    const startTime = new Date(`${entry.date}T${entry.startTime}`);
    const endTime = new Date(`${entry.date}T${entry.endTime}`);

    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const totalMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60) - (entry.breakDuration || 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes };
  };

  const handleDetailsClick = (id: string) => {
    router.push(`/timesheet/${id}`);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Paginatitel */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Tijdregistratie
          </h1>
          <div className="flex items-center gap-2">
            {/* Filter toggle - mobile only */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden inline-flex items-center px-3 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 backdrop-blur-sm bg-white/50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 min-h-[44px] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </button>
            <button
              onClick={() => setShowNewEntryForm(!showNewEntryForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 min-h-[44px] transition-all duration-200"
            >
              {showNewEntryForm ? "Annuleren" : "Nieuwe registratie"}
            </button>
          </div>
        </div>
      </div>

      {/* Filters - collapsible on mobile, always visible on desktop */}
      <div className={`${showFilters ? "block" : "hidden"} md:block`}>
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filters</h3>
          <DateRangeFilter
            onChange={(start, end) => {
              setFilters((prev) => ({ ...prev, startDate: start, endDate: end }));
            }}
          />
          <StatusFilter
            value={filters.status}
            onChange={(status) => {
              setFilters((prev) => ({ ...prev, status }));
            }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Formulier voor nieuwe tijdregistratie */}
      {showNewEntryForm && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Nieuwe tijdregistratie
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Datum
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Starttijd
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white min-h-[44px]"
                />
                {/* Improved GPS Button - 44px+ touch target */}
                <button
                  type="button"
                  onClick={() => captureLocation("start")}
                  disabled={gpsLoading === "start"}
                  className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 transition-all shadow-lg min-h-[44px] disabled:opacity-50"
                >
                  {gpsLoading === "start" ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  Startlocatie vastleggen
                </button>
                {startCoord && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Locatie vastgelegd: {startCoord.lat.toFixed(5)}, {startCoord.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Eindtijd
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white min-h-[44px]"
                />
                {/* Improved GPS Button - 44px+ touch target */}
                <button
                  type="button"
                  onClick={() => captureLocation("end")}
                  disabled={gpsLoading === "end"}
                  className="mt-2 w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 transition-all shadow-lg min-h-[44px] disabled:opacity-50"
                >
                  {gpsLoading === "end" ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                  Eindlocatie vastleggen
                </button>
                {endCoord && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Locatie vastgelegd: {endCoord.lat.toFixed(5)}, {endCoord.lng.toFixed(5)}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pauze (minuten)
                </label>
                <input
                  type="number"
                  name="breakDuration"
                  id="breakDuration"
                  min="0"
                  max="120"
                  value={formData.breakDuration}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white min-h-[44px]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Omschrijving werkzaamheden
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 focus:ring-purple-500 focus:border-purple-500 block w-full shadow-sm sm:text-sm rounded-lg backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white p-3"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 min-h-[44px] transition-all"
              >
                {isSubmitting ? "Bezig met opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GPS Info Banner */}
      <div className="backdrop-blur-sm bg-blue-500/10 dark:bg-blue-500/10 shadow-lg rounded-2xl border border-blue-500/20 p-4 md:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">GPS-verificatie</h3>
            <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
              <p>
                Tijdregistraties kunnen worden geverifieerd met GPS-gegevens. Klik op
                &quot;Locatie vastleggen&quot; bij het registreren van uw werktijden.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tijdregistraties */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="px-4 py-5 sm:px-6 border-b border-white/20 dark:border-purple-500/20">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recente tijdregistraties</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Laden...</p>
          </div>
        ) : timesheets.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p>Geen tijdregistraties gevonden.</p>
            <p className="text-sm mt-2">
              Klik op &quot;Nieuwe registratie&quot; om uw eerste registratie toe te voegen.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-3">
              {timesheets.map((entry) => (
                <TimesheetCard key={entry.id} entry={entry} onDetailsClick={handleDetailsClick} />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-white/20 dark:divide-purple-500/20">
                <thead className="bg-purple-100/80 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Datum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Tijd
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Omschrijving
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      GPS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/70 dark:bg-white/5 divide-y divide-purple-200/50 dark:divide-purple-500/20">
                  {timesheets.map((entry) => {
                    const { hours, minutes } = calculateWorkTime(entry);
                    const hasGpsData = entry.startLat !== null || entry.endLat !== null;

                    return (
                      <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-white/10">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(entry.date).toLocaleDateString("nl-NL")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {hours}u {minutes}m
                          </span>
                          <br />
                          <span className="text-xs">
                            {entry.startTime}-{entry.endTime}, {entry.breakDuration}m pauze
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {entry.description || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={entry.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <GPSIndicator hasData={hasGpsData} showLabel={false} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/timesheet/${entry.id}`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-white/20 dark:border-purple-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Pagina {pagination.page} van {pagination.pages} ({pagination.total} resultaten)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTimesheets(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 border border-purple-500/30 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 min-h-[44px] transition-colors"
                >
                  Vorige
                </button>
                <button
                  onClick={() => fetchTimesheets(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-purple-500/30 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 min-h-[44px] transition-colors"
                >
                  Volgende
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
