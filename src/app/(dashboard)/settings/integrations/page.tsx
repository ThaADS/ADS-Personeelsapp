'use client';

import { useEffect, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface ProviderFeatures {
  syncEmployees: boolean;
  syncHours: boolean;
  syncLeave: boolean;
  pushHours: boolean;
}

interface ProviderConfig {
  displayName: string;
  syncEnabled: boolean;
  syncEmployees: boolean;
  syncHours: boolean;
  syncLeave: boolean;
  syncInterval: number;
  lastSync: string | null;
  lastSyncError: string | null;
  connectionStatus: 'unconfigured' | 'connected' | 'error';
  isActive: boolean;
}

interface Provider {
  type: string;
  name: string;
  description: string;
  logo: string;
  requiredFields: string[];
  features: ProviderFeatures;
  comingSoon?: boolean;
  configured: boolean;
  config: ProviderConfig | null;
}

interface ConfigModalProps {
  provider: Provider;
  onClose: () => void;
  onSave: () => void;
}

function ConfigModal({ provider, onClose, onSave }: ConfigModalProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState({
    displayName: provider.config?.displayName || provider.name,
    syncEmployees: provider.config?.syncEmployees ?? true,
    syncHours: provider.config?.syncHours ?? true,
    syncLeave: provider.config?.syncLeave ?? true,
    syncEnabled: provider.config?.syncEnabled ?? false,
    syncInterval: provider.config?.syncInterval ?? 1440,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fieldLabels: Record<string, string> = {
    apiToken: 'API Token',
    domain: 'Domein (bijv. bedrijf.nmbrs.nl)',
    companyId: 'Bedrijfs-ID',
    clientId: 'Client ID',
    clientSecret: 'Client Secret',
    environment: 'Omgeving',
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/integrations/payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerType: provider.type,
          credentials,
          ...settings,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Configuratie opslaan mislukt');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // First save the config
      await handleSave();

      // Then test
      const response = await fetch(`/api/integrations/payroll/${provider.type}/test`, {
        method: 'POST',
      });

      const result = await response.json();
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Verbindingstest mislukt',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {provider.name} configureren
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {provider.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Inloggegevens</h3>
            {provider.requiredFields.map((field) => (
              <div key={field}>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {fieldLabels[field] || field}
                </label>
                {field === 'environment' ? (
                  <select
                    value={credentials[field] || 'production'}
                    onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="production">Productie</option>
                    <option value="sandbox">Sandbox (test)</option>
                  </select>
                ) : (
                  <input
                    type={field.toLowerCase().includes('token') || field.toLowerCase().includes('secret') ? 'password' : 'text'}
                    value={credentials[field] || ''}
                    onChange={(e) => setCredentials({ ...credentials, [field]: e.target.value })}
                    placeholder={`Voer ${fieldLabels[field]?.toLowerCase() || field} in`}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Sync Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Synchronisatie instellingen</h3>

            <div className="space-y-3">
              {provider.features.syncEmployees && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.syncEmployees}
                    onChange={(e) => setSettings({ ...settings, syncEmployees: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Medewerkers synchroniseren</span>
                </label>
              )}
              {provider.features.syncHours && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.syncHours}
                    onChange={(e) => setSettings({ ...settings, syncHours: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Uren synchroniseren</span>
                </label>
              )}
              {provider.features.syncLeave && (
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.syncLeave}
                    onChange={(e) => setSettings({ ...settings, syncLeave: e.target.checked })}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Verlof synchroniseren</span>
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Synchronisatie interval
              </label>
              <select
                value={settings.syncInterval}
                onChange={(e) => setSettings({ ...settings, syncInterval: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={60}>Elk uur</option>
                <option value={360}>Elke 6 uur</option>
                <option value={720}>Elke 12 uur</option>
                <option value={1440}>Dagelijks</option>
                <option value={10080}>Wekelijks</option>
              </select>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.syncEnabled}
                onChange={(e) => setSettings({ ...settings, syncEnabled: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Automatische synchronisatie inschakelen</span>
            </label>
          </div>

          {/* Test Result */}
          {testResult && (
            <div
              className={`p-4 rounded-lg ${
                testResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    testResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {testResult.message}
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleTest}
            disabled={isTesting || isLoading}
            className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {isTesting ? 'Testen...' : 'Test verbinding'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Opslaan...' : 'Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsSettingsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null);

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/integrations/payroll');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSync = async (providerType: string) => {
    setSyncingProvider(providerType);
    try {
      await fetch(`/api/integrations/payroll/${providerType}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: 'employees' }),
      });
      await fetchProviders();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncingProvider(null);
    }
  };

  const formatLastSync = (date: string | null) => {
    if (!date) return 'Nooit';
    return new Date(date).toLocaleString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Integraties</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verbind met externe salarisadministratie systemen
          </p>
        </div>
      </div>

      {/* Payroll Providers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Salarisadministratie</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.type}
                className={`bg-white dark:bg-slate-800 rounded-xl p-6 border transition-all ${
                  provider.comingSoon
                    ? 'border-gray-200 dark:border-slate-700 opacity-60'
                    : provider.config?.connectionStatus === 'connected'
                    ? 'border-green-200 dark:border-green-800'
                    : provider.config?.connectionStatus === 'error'
                    ? 'border-red-200 dark:border-red-800'
                    : 'border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{provider.name}</h3>
                      {provider.comingSoon && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Binnenkort beschikbaar
                        </span>
                      )}
                    </div>
                  </div>

                  {provider.config && (
                    <div className="flex items-center gap-1">
                      {provider.config.connectionStatus === 'connected' ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircleIcon className="w-4 h-4" />
                          Verbonden
                        </span>
                      ) : provider.config.connectionStatus === 'error' ? (
                        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                          <ExclamationCircleIcon className="w-4 h-4" />
                          Fout
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {provider.description}
                </p>

                {provider.config && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    <span>Laatste sync: {formatLastSync(provider.config.lastSync)}</span>
                    {provider.config.lastSyncError && (
                      <p className="text-red-500 mt-1 truncate" title={provider.config.lastSyncError}>
                        {provider.config.lastSyncError}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {!provider.comingSoon && (
                    <>
                      <button
                        onClick={() => setSelectedProvider(provider)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Configureren
                      </button>

                      {provider.config?.connectionStatus === 'connected' && (
                        <button
                          onClick={() => handleSync(provider.type)}
                          disabled={syncingProvider === provider.type}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <ArrowPathIcon className={`w-4 h-4 ${syncingProvider === provider.type ? 'animate-spin' : ''}`} />
                          {syncingProvider === provider.type ? 'Synchroniseren...' : 'Sync nu'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Config Modal */}
      {selectedProvider && (
        <ConfigModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onSave={() => {
            setSelectedProvider(null);
            fetchProviders();
          }}
        />
      )}
    </div>
  );
}
