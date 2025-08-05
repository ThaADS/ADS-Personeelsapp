'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState('general');
  
  // Admin permissions will be checked when implementing settings actions
  // const isAdmin = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'SUPERUSER';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Instellingen</h1>
        <p className="text-gray-600">Beheer systeem instellingen en configuratie</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Algemeen
            </button>
            <button
              onClick={() => setSelectedTab('company')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'company'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bedrijfsgegevens
            </button>
            <button
              onClick={() => setSelectedTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notificaties
            </button>
            <button
              onClick={() => setSelectedTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Beveiliging
            </button>
          </nav>
        </div>
      </div>

      {/* General Tab */}
      {selectedTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Systeem Instellingen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tijdzone</label>
                  <select aria-label="Tijdzone selecteren" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Europe/Amsterdam</option>
                    <option>Europe/Brussels</option>
                    <option>Europe/Berlin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taal</label>
                  <select aria-label="Taal selecteren" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>Nederlands</option>
                    <option>English</option>
                    <option>Deutsch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Datumformaat</label>
                  <select aria-label="Datumformaat selecteren" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option>DD-MM-YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Automatische updates inschakelen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Automatische updates inschakelen
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Werkuren Instellingen</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Standaard werkweek</label>
                  <input
                    type="number"
                    defaultValue="40"
                    aria-label="Standaard werkweek in uren"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vakantiedagen per jaar</label>
                  <input
                    type="number"
                    defaultValue="25"
                    aria-label="Vakantiedagen per jaar"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Werkdag start</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    aria-label="Werkdag starttijd"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Werkdag einde</label>
                  <input
                    type="time"
                    defaultValue="17:00"
                    aria-label="Werkdag eindtijd"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {selectedTab === 'company' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bedrijfsinformatie</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Bedrijfsnaam</label>
                <input
                  type="text"
                  defaultValue="CKW Personeelszaken"
                  aria-label="Bedrijfsnaam"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">KvK nummer</label>
                <input
                  type="text"
                  defaultValue="12345678"
                  aria-label="KvK nummer"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">BTW nummer</label>
                <input
                  type="text"
                  defaultValue="NL123456789B01"
                  aria-label="BTW nummer"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Adres</label>
                <input
                  type="text"
                  defaultValue="Hoofdstraat 123, 1000 AB Amsterdam"
                  aria-label="Bedrijfsadres"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefoon</label>
                  <input
                    type="tel"
                    defaultValue="+31 20 1234567"
                    aria-label="Bedrijfstelefoon"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">E-mail</label>
                  <input
                    type="email"
                    defaultValue="info@ckw.nl"
                    aria-label="Bedrijfs e-mailadres"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {selectedTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notificatie Instellingen</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">E-mail Notificaties</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Nieuwe vakantieaanvragen</span>
                      <p className="text-sm text-gray-500">Stuur e-mail bij nieuwe aanvragen</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Hoofdletters vereist voor wachtwoorden"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Ziekmeldingen</span>
                      <p className="text-sm text-gray-500">Stuur e-mail bij nieuwe ziekmeldingen</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Hoofdletters vereist voor wachtwoorden"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Tijdregistratie herinneringen</span>
                      <p className="text-sm text-gray-500">Dagelijkse herinneringen voor medewerkers</p>
                    </div>
                    <input
                      type="checkbox"
                      aria-label="Tijdregistratie herinneringen e-mail notificaties ontvangen"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-base font-medium text-gray-900 mb-3">Systeem Meldingen</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Systeem updates</span>
                      <p className="text-sm text-gray-500">Meldingen over systeem updates</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Hoofdletters vereist voor wachtwoorden"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">Backup status</span>
                      <p className="text-sm text-gray-500">Meldingen over backup status</p>
                    </div>
                    <input
                      type="checkbox"
                      aria-label="Tijdregistratie herinneringen e-mail notificaties ontvangen"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {selectedTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Wachtwoord Beleid</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Minimale wachtwoord lengte</label>
                  <input
                    type="number"
                    defaultValue="8"
                    min="6"
                    max="20"
                    aria-label="Minimale wachtwoord lengte instellen"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Hoofdletters vereist voor wachtwoorden"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Hoofdletters vereist
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Hoofdletters vereist voor wachtwoorden"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Cijfers vereist
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      aria-label="Speciale tekens vereist voor wachtwoorden"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Speciale tekens vereist
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Wachtwoord verloopt na (dagen)</label>
                  <input
                    type="number"
                    defaultValue="90"
                    aria-label="Wachtwoord verloopt na aantal dagen"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sessie Instellingen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Sessie timeout (minuten)</label>
                  <input
                    type="number"
                    defaultValue="30"
                    aria-label="Sessie timeout in minuten"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Automatisch uitloggen bij inactiviteit"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Automatisch uitloggen bij inactiviteit
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    aria-label="Twee-factor authenticatie vereist"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Twee-factor authenticatie vereist
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Instellingen Opslaan
        </button>
      </div>
    </div>
  );
}
