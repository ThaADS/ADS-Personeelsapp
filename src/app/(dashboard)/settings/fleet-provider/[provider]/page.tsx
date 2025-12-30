'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FLEET_PROVIDERS, FleetProviderType, FleetProviderInfo } from '@/lib/services/fleet-providers/types';

interface ProviderConfig {
  id: string;
  provider_type: string;
  credentials: {
    email?: string;
    apiKey?: string;
    accountId?: string;
  };
  sync_enabled: boolean;
  connection_status: string;
  last_sync: string | null;
  vehicle_count: number;
}

interface VehicleMapping {
  id: string;
  provider_vehicle_id: string;
  registration: string;
  vehicle_name: string | null;
  employee_id: string | null;
  employee_name: string | null;
  is_active: boolean;
}

interface Employee {
  id: string;
  name: string;
}

export default function FleetProviderSettingsPage({ params }: { params: Promise<{ provider: string }> }) {
  const resolvedParams = use(params);
  const providerType = resolvedParams.provider as FleetProviderType;
  const providerInfo = FLEET_PROVIDERS[providerType];

  const { data: session } = useSession();
  const router = useRouter();

  const [config, setConfig] = useState<ProviderConfig | null>(null);
  const [vehicles, setVehicles] = useState<VehicleMapping[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Form state based on auth type
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [accountId, setAccountId] = useState('');
  const [syncEnabled, setSyncEnabled] = useState(false);

  const isAdmin = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'SUPERUSER';

  useEffect(() => {
    if (!providerInfo) {
      router.push('/settings');
      return;
    }
    loadData();
  }, [providerType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configRes, vehiclesRes, employeesRes] = await Promise.all([
        fetch(`/api/fleet-provider/${providerType}/config`),
        fetch(`/api/fleet-provider/${providerType}/vehicles`),
        fetch('/api/employees?active=true'),
      ]);

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data);
        if (data.credentials?.email) setEmail(data.credentials.email);
        if (data.credentials?.apiKey) setApiKey('••••••••'); // Masked
        if (data.credentials?.accountId) setAccountId(data.credentials.accountId);
        setSyncEnabled(data.sync_enabled || false);
      }

      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data);
      }

      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);

      const credentials: Record<string, string> = {};
      if (providerInfo.authType === 'credentials') {
        credentials.email = email;
        if (password) credentials.password = password;
      } else if (providerInfo.authType === 'api_key') {
        if (apiKey && !apiKey.startsWith('••')) credentials.apiKey = apiKey;
        if (apiSecret) credentials.apiSecret = apiSecret;
      }
      if (accountId) credentials.accountId = accountId;

      const res = await fetch(`/api/fleet-provider/${providerType}/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.success
          ? `Verbinding geslaagd! ${data.vehicleCount || 0} voertuigen gevonden.`
          : data.error || 'Verbinding mislukt',
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Fout bij testen verbinding',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);

      const credentials: Record<string, string> = {};
      if (providerInfo.authType === 'credentials') {
        credentials.email = email;
        if (password) credentials.password = password;
      } else if (providerInfo.authType === 'api_key') {
        if (apiKey && !apiKey.startsWith('••')) credentials.apiKey = apiKey;
        if (apiSecret) credentials.apiSecret = apiSecret;
      }
      if (accountId) credentials.accountId = accountId;

      const res = await fetch(`/api/fleet-provider/${providerType}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials,
          sync_enabled: syncEnabled,
        }),
      });

      if (res.ok) {
        await loadData();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch(`/api/fleet-provider/${providerType}/sync`, {
        method: 'POST',
      });

      if (res.ok) {
        await loadData();
      }
    } finally {
      setSyncing(false);
    }
  };

  const handleVehicleMapping = async (vehicleId: string, employeeId: string | null) => {
    try {
      await fetch(`/api/fleet-provider/${providerType}/vehicles/${vehicleId}/mapping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: employeeId }),
      });
      await loadData();
    } catch (error) {
      console.error('Failed to update mapping:', error);
    }
  };

  if (!providerInfo) {
    return null;
  }

  const getProviderGradient = (provider: FleetProviderType): string => {
    const gradients: Record<FleetProviderType, string> = {
      routevision: 'from-blue-500 to-cyan-500',
      fleetgo: 'from-green-500 to-emerald-500',
      samsara: 'from-indigo-500 to-purple-500',
      webfleet: 'from-red-500 to-orange-500',
      trackjack: 'from-amber-500 to-yellow-500',
      verizon: 'from-rose-500 to-pink-500',
    };
    return gradients[provider] || 'from-purple-500 to-pink-500';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'connected':
        return 'Verbonden';
      case 'error':
        return 'Fout';
      default:
        return 'Niet geconfigureerd';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getProviderGradient(providerType)} flex items-center justify-center shadow-lg`}>
            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {providerInfo.displayName}
              </h1>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(config?.connection_status || 'unconfigured')}`}>
                {getStatusText(config?.connection_status || 'unconfigured')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {providerInfo.description}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <>
          {/* Configuration */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configuratie</h3>

              <div className="space-y-4">
                {/* Credentials based on auth type */}
                {providerInfo.authType === 'credentials' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        E-mailadres
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={`${providerInfo.displayName} account e-mail`}
                        disabled={!isAdmin}
                        className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Wachtwoord
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={config ? '••••••••' : 'Voer wachtwoord in'}
                        disabled={!isAdmin}
                        className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-60"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Laat leeg om bestaand wachtwoord te behouden
                      </p>
                    </div>
                  </>
                )}

                {providerInfo.authType === 'api_key' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Voer API key in"
                        disabled={!isAdmin}
                        className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-60"
                      />
                    </div>
                    {(providerType === 'verizon') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          API Secret / Client Secret
                        </label>
                        <input
                          type="password"
                          value={apiSecret}
                          onChange={(e) => setApiSecret(e.target.value)}
                          placeholder="Voer secret in"
                          disabled={!isAdmin}
                          className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-60"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Account ID for some providers */}
                {(providerType === 'webfleet') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account ID
                    </label>
                    <input
                      type="text"
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      placeholder="Uw Webfleet account ID"
                      disabled={!isAdmin}
                      className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-60"
                    />
                  </div>
                )}

                {/* Sync toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Automatische synchronisatie
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Dagelijks ritten ophalen (om 06:00)
                    </p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={syncEnabled}
                      onChange={(e) => setSyncEnabled(e.target.checked)}
                      disabled={!isAdmin}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-purple-500/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-disabled:opacity-60"></div>
                  </label>
                </div>

                {/* Test result */}
                {testResult && (
                  <div className={`p-4 rounded-xl ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30'}`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span className={`text-sm font-medium ${testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {testResult.message}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {isAdmin && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={handleTestConnection}
                      disabled={testing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors disabled:opacity-60 min-h-[44px]"
                    >
                      {testing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      Test Verbinding
                    </button>
                    <button
                      onClick={handleSaveConfig}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-colors disabled:opacity-60 min-h-[44px]"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Opslaan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sync Status */}
          {config?.connection_status === 'connected' && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Synchronisatie</h3>
                  {isAdmin && (
                    <button
                      onClick={handleSync}
                      disabled={syncing}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors disabled:opacity-60 min-h-[44px]"
                    >
                      {syncing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      Nu Synchroniseren
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Laatste sync</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {config.last_sync
                        ? new Date(config.last_sync).toLocaleString('nl-NL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Nog niet gesynchroniseerd'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Voertuigen</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {vehicles.length}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gekoppeld</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                      {vehicles.filter(v => v.employee_id).length} / {vehicles.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Mappings */}
          {config?.connection_status === 'connected' && vehicles.length > 0 && (
            <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Voertuig-Medewerker Koppelingen
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Koppel voertuigen aan medewerkers voor automatische ritregistratie
                </p>

                <div className="space-y-3">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {vehicle.registration}
                          </p>
                          {vehicle.vehicle_name && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {vehicle.vehicle_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <select
                        value={vehicle.employee_id || ''}
                        onChange={(e) => handleVehicleMapping(vehicle.id, e.target.value || null)}
                        disabled={!isAdmin}
                        className="rounded-lg shadow-sm p-2 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors disabled:opacity-60"
                      >
                        <option value="">-- Geen medewerker --</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Features</h3>
              <div className="flex flex-wrap gap-2">
                {providerInfo.features.map((feature) => (
                  <span
                    key={feature}
                    className="px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              <a
                href={providerInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
              >
                Meer informatie op {providerInfo.website}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* FAQ - How Fleet Tracking Works */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Hoe werkt Fleet Tracking?
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    Fleet Provider per Bedrijf
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    <strong>Eén fleet provider per tenant/bedrijf.</strong> Uw bedrijf kiest één fleet tracking provider
                    (bijv. RouteVision, FleetGO, Samsara). Deze instelling geldt voor alle medewerkers binnen uw organisatie.
                    De configuratie vindt u hier bij Instellingen → Fleet Provider.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    Voertuigen worden Gesynchroniseerd
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Na het configureren van uw provider worden <strong>alle voertuigen automatisch opgehaald</strong> uit
                    uw fleet systeem. Dit gebeurt dagelijks automatisch (indien ingeschakeld) of handmatig via de
                    &quot;Nu Synchroniseren&quot; knop hierboven.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                    Voertuig-Medewerker Koppeling
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    <strong>Voertuigen worden gekoppeld aan individuele medewerkers.</strong> Dit kan op twee manieren:
                  </p>
                  <ul className="text-sm text-purple-700 dark:text-purple-400 mt-2 ml-4 list-disc space-y-1">
                    <li><strong>Hier in het overzicht</strong> bij &quot;Voertuig-Medewerker Koppelingen&quot; hierboven</li>
                    <li><strong>Bij onboarding</strong> van een nieuwe medewerker (stap 4: Voertuigen)</li>
                    <li><strong>In het medewerkerprofiel</strong> onder Werknemers → [Medewerker] → Bewerken → Voertuigen tab</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                    Automatische Ritregistratie
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Zodra een voertuig aan een medewerker is gekoppeld, worden <strong>ritten automatisch
                    geïmporteerd</strong> naar de urenstaat van die medewerker. De ritten verschijnen onder
                    Dashboard → Ritten en kunnen worden goedgekeurd als uren.
                  </p>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Samenvatting:</strong> Fleet provider = per bedrijf | Voertuigkoppeling = per medewerker |
                    Ritten = automatisch naar gekoppelde medewerker
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
