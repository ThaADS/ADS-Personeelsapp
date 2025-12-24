"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

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

export default function TimesheetPage() {
  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    breakDuration: 30,
    description: "",
  });
  const [startCoord, setStartCoord] = useState<{lat:number;lng:number}|null>(null);
  const [endCoord, setEndCoord] = useState<{lat:number;lng:number}|null>(null);

  // Fetch timesheets from API
  const fetchTimesheets = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/timesheets?page=${page}&limit=10`);
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
  }, []);

  useEffect(() => {
    fetchTimesheets();
  }, [fetchTimesheets]);

  // Functie om de status kleur te bepalen
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Functie om de status in het Nederlands weer te geven
  const getStatusText = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "Goedgekeurd";
      case "PENDING":
        return "In behandeling";
      case "REJECTED":
        return "Afgekeurd";
      default:
        return status;
    }
  };

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

      // Refresh the list
      await fetchTimesheets();

      // Reset formulier en sluit het
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

  // Functie om formuliergegevens bij te werken
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const captureLocation = (type: 'start'|'end') => {
    if (!navigator.geolocation) {
      alert('Geolocatie wordt niet ondersteund door deze browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (type === 'start') setStartCoord(coord); else setEndCoord(coord);
    }, (err) => {
      alert('Kon locatie niet bepalen: ' + err.message);
    }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
  };

  // Bereken werktijd
  const calculateWorkTime = (entry: TimesheetEntry) => {
    const startTime = new Date(`${entry.date}T${entry.startTime}`);
    const endTime = new Date(`${entry.date}T${entry.endTime}`);

    // Handle crossing midnight
    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60) - (entry.breakDuration || 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes };
  };

  return (
    <div className="space-y-6">
      {/* Paginatitel */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Tijdregistratie</h1>
          <button
            onClick={() => setShowNewEntryForm(!showNewEntryForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showNewEntryForm ? "Annuleren" : "Nieuwe registratie"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Formulier voor nieuwe tijdregistratie */}
      {showNewEntryForm && (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-black mb-4">
            Nieuwe tijdregistratie
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Datum
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Starttijd
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <button type="button" onClick={() => captureLocation('start')} className="mt-2 inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">Gebruik mijn locatie (start)</button>
                {startCoord && (
                  <p className="text-xs text-gray-500 mt-1">Startlocatie: {startCoord.lat.toFixed(5)}, {startCoord.lng.toFixed(5)}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Eindtijd
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                <button type="button" onClick={() => captureLocation('end')} className="mt-2 inline-flex items-center px-3 py-1 rounded bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">Gebruik mijn locatie (einde)</button>
                {endCoord && (
                  <p className="text-xs text-gray-500 mt-1">Eindlocatie: {endCoord.lat.toFixed(5)}, {endCoord.lng.toFixed(5)}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="breakDuration"
                  className="block text-sm font-medium text-gray-700"
                >
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
                  className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Omschrijving werkzaamheden
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? "Bezig met opslaan..." : "Opslaan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RouteVision integratie informatie */}
      <div className="bg-blue-50 shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-blue-600"
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
            <h3 className="text-sm font-medium text-blue-800">
              GPS-verificatie
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Tijdregistraties kunnen worden geverifieerd met GPS-gegevens.
                Klik op &quot;Gebruik mijn locatie&quot; bij het registreren van uw werktijden.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tijdregistratie tabel */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-black">
            Recente tijdregistraties
          </h2>
        </div>
        <div className="border-t border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Laden...</p>
            </div>
          ) : timesheets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>Geen tijdregistraties gevonden.</p>
              <p className="text-sm mt-2">Klik op &quot;Nieuwe registratie&quot; om uw eerste registratie toe te voegen.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Datum
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Tijd
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Omschrijving
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            GPS Verificatie
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Acties
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timesheets.map((entry) => {
                          const { hours, minutes } = calculateWorkTime(entry);
                          const hasGpsData = entry.startLat !== null || entry.endLat !== null;

                          return (
                            <tr key={entry.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(entry.date).toLocaleDateString("nl-NL")}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {`${hours}u ${minutes}m (${entry.startTime}-${entry.endTime}, ${entry.breakDuration}m pauze)`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {entry.description || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                    entry.status
                                  )}`}
                                >
                                  {getStatusText(entry.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {hasGpsData ? (
                                  <span className="text-green-500 flex items-center">
                                    <svg
                                      className="h-5 w-5 mr-1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Beschikbaar
                                  </span>
                                ) : (
                                  <span className="text-gray-400 flex items-center">
                                    <svg
                                      className="h-5 w-5 mr-1"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Niet beschikbaar
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link
                                  href={`/timesheet/${entry.id}`}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
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
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Pagina {pagination.page} van {pagination.pages} ({pagination.total} resultaten)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTimesheets(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Vorige
                </button>
                <button
                  onClick={() => fetchTimesheets(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
