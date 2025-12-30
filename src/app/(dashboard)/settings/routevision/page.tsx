"use client";

import { useState, useEffect, useCallback } from "react";

interface RouteVisionConfig {
  configured: boolean;
  api_email: string | null;
  sync_enabled: boolean;
  sync_interval: number;
  last_sync: string | null;
}

interface Vehicle {
  id: string;
  registration: string;
  name: string | null;
  brand: string | null;
  model: string | null;
  isActive: boolean;
  mapping: {
    id: string;
    employeeId: string | null;
    employeeName: string | null;
    isActive: boolean;
  } | null;
}

interface Employee {
  id: string;
  name: string;
  employeeNumber: string | null;
}

export default function RouteVisionSettingsPage() {
  const [config, setConfig] = useState<RouteVisionConfig | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncInterval, setSyncInterval] = useState(60);

  // Load config and employees
  useEffect(() => {
    Promise.all([
      fetch("/api/routevision/config").then((r) => r.json()),
      fetch("/api/employees").then((r) => r.json()),
    ])
      .then(([configData, employeesData]) => {
        setConfig(configData);
        if (configData.api_email) {
          setEmail(configData.api_email);
        }
        setSyncEnabled(configData.sync_enabled || false);
        setSyncInterval(configData.sync_interval || 60);

        // Handle employees response
        const empList = Array.isArray(employeesData)
          ? employeesData
          : employeesData.employees || [];
        setEmployees(
          empList.map((e: { id: string; users?: { name: string }; employee_number?: string }) => ({
            id: e.id,
            name: e.users?.name || "Onbekend",
            employeeNumber: e.employee_number || null,
          }))
        );
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Load vehicles when config is available
  const loadVehicles = useCallback(async () => {
    if (!config?.configured) return;

    try {
      const res = await fetch("/api/routevision/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
      }
    } catch (error) {
      console.error("Error loading vehicles:", error);
    }
  }, [config?.configured]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Test connection
  const handleTestConnection = async () => {
    if (!email || !password) {
      setTestResult({ success: false, message: "Vul email en wachtwoord in" });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/routevision/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.message });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Test mislukt",
      });
    } finally {
      setTesting(false);
    }
  };

  // Save configuration
  const handleSave = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/routevision/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_email: email,
          api_password: password || undefined,
          sync_enabled: syncEnabled,
          sync_interval: syncInterval,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setPassword(""); // Clear password after save
        loadVehicles();
      }
    } catch (error) {
      console.error("Error saving config:", error);
    } finally {
      setSaving(false);
    }
  };

  // Manual sync
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch("/api/routevision/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daysBack: 7 }),
      });

      const data = await res.json();

      if (data.success) {
        setSyncResult({
          success: true,
          message: `${data.synced} ritten gesynchroniseerd${data.skipped ? `, ${data.skipped} overgeslagen` : ""}`,
        });
      } else {
        setSyncResult({
          success: false,
          message: data.error || "Synchronisatie mislukt",
        });
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "Synchronisatie mislukt",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Update vehicle mapping
  const handleVehicleMapping = async (vehicleId: string, registration: string, employeeId: string | null) => {
    try {
      await fetch("/api/routevision/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          registration,
          employeeId,
        }),
      });
      loadVehicles();
    } catch (error) {
      console.error("Error updating mapping:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-purple-500/20 p-6">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              RouteVision Integratie
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Beheer de koppeling met RouteVision voor automatische rittenregistratie
            </p>
          </div>
          <a
            href="/settings"
            className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Terug naar instellingen
          </a>
        </div>

        {/* Configuration Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-purple-500/20 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            API Configuratie
          </h2>

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uw@email.nl"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wachtwoord {config?.configured && <span className="text-gray-500">(laat leeg om te behouden)</span>}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={config?.configured ? "••••••••" : "Wachtwoord"}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Sync Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="syncEnabled"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="syncEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                  Automatisch synchroniseren
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sync interval (minuten)
                </label>
                <select
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value={30}>30 minuten</option>
                  <option value={60}>1 uur</option>
                  <option value={120}>2 uur</option>
                  <option value={240}>4 uur</option>
                  <option value={1440}>Dagelijks</option>
                </select>
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div
                className={`p-3 rounded-lg ${
                  testResult.success
                    ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400"
                }`}
              >
                {testResult.message}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="px-4 py-2 rounded-lg border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 disabled:opacity-50 flex items-center gap-2"
              >
                {testing ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Testen...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Test verbinding
                  </>
                )}
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Opslaan...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Opslaan
                  </>
                )}
              </button>
            </div>

            {/* Last Sync Info */}
            {config?.last_sync && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Laatste synchronisatie:{" "}
                {new Date(config.last_sync).toLocaleString("nl-NL", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Sync Card */}
        {config?.configured && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-purple-500/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Handmatige Synchronisatie
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Synchroniseer ritten van de afgelopen 7 dagen handmatig.
            </p>

            {syncResult && (
              <div
                className={`p-3 rounded-lg mb-4 ${
                  syncResult.success
                    ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400"
                }`}
              >
                {syncResult.message}
              </div>
            )}

            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {syncing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Synchroniseren...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Nu synchroniseren
                </>
              )}
            </button>
          </div>
        )}

        {/* Vehicles Card */}
        {config?.configured && vehicles.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-purple-500/20 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              Voertuigen ({vehicles.length})
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Koppel voertuigen aan medewerkers voor automatische ritregistratie.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-purple-500/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Kenteken
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Voertuig
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                      Medewerker
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.id}
                      className="border-b border-gray-100 dark:border-purple-500/10 last:border-0"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                          {vehicle.registration}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {vehicle.name || `${vehicle.brand || ""} ${vehicle.model || ""}`.trim() || "-"}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={vehicle.mapping?.employeeId || ""}
                          onChange={(e) =>
                            handleVehicleMapping(
                              vehicle.id,
                              vehicle.registration,
                              e.target.value || null
                            )
                          }
                          className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">-- Geen koppeling --</option>
                          {employees.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name} {emp.employeeNumber ? `(${emp.employeeNumber})` : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Quick Link to Trips */}
        {config?.configured && (
          <div className="flex justify-center">
            <a
              href="/trips"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 flex items-center gap-2 shadow-lg shadow-purple-500/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Bekijk alle ritten
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
