"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { nl } from "date-fns/locale";

interface TripStats {
  todayTrips: number;
  todayKm: number;
  monthlyKm: number;
  configuredTenants: boolean;
}

interface RecentTrip {
  id: string;
  registration: string;
  departureAddress: string;
  arrivalAddress: string;
  distanceKm: number;
  departureTime: string;
}

export default function TripsWidget() {
  const [stats, setStats] = useState<TripStats | null>(null);
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load trips from today
        const today = new Date();
        const todayStr = today.toISOString().split("T")[0];

        const res = await fetch(
          `/api/routevision/trips?dateFrom=${todayStr}&limit=5`
        );

        if (!res.ok) {
          // RouteVision not configured or no access
          setStats(null);
          return;
        }

        const data = await res.json();
        const trips = data.trips || [];

        // Calculate stats
        const todayTrips = trips.length;
        const todayKm = trips.reduce(
          (sum: number, t: RecentTrip) => sum + Number(t.distanceKm),
          0
        );

        // Get monthly stats (approximate from first 100 trips this month)
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthRes = await fetch(
          `/api/routevision/trips?dateFrom=${monthStart.toISOString().split("T")[0]}&limit=100`
        );

        let monthlyKm = todayKm;
        if (monthRes.ok) {
          const monthData = await monthRes.json();
          monthlyKm = (monthData.trips || []).reduce(
            (sum: number, t: RecentTrip) => sum + Number(t.distanceKm),
            0
          );
        }

        setStats({
          todayTrips,
          todayKm,
          monthlyKm,
          configuredTenants: true,
        });

        setRecentTrips(trips.slice(0, 3));
      } catch (error) {
        console.error("Error loading trips widget:", error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Don't render if RouteVision is not configured
  if (!loading && !stats) {
    return null;
  }

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Ritten vandaag
          </h3>
        </div>
        <Link
          href="/trips"
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          Bekijk alles →
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-purple-50 dark:bg-purple-500/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.todayTrips || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Ritten</p>
            </div>
            <div className="bg-green-50 dark:bg-green-500/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.todayKm?.toFixed(1) || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Km vandaag</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.monthlyKm?.toFixed(0) || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Km maand</p>
            </div>
          </div>

          {/* Recent Trips */}
          {recentTrips.length > 0 ? (
            <div className="space-y-2">
              {recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                        {trip.registration}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(trip.departureTime), "HH:mm", { locale: nl })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      {trip.departureAddress} → {trip.arrivalAddress}
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {Number(trip.distanceKm).toFixed(1)} km
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <svg
                className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
              <p className="text-sm">Nog geen ritten vandaag</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
