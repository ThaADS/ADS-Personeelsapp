'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function SickLeavePage() {
  const { data: session } = useSession();
  
  // Session will be used for user-specific sick leave data
  console.log('Sick leave session:', session?.user?.id);
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // User info will be used when implementing sick leave functionality
  // const currentUserId = session?.user?.id;
  // const userName = session?.user?.name || 'Gebruiker';

  const sickLeaveRecords = [
    {
      id: 1,
      startDate: '2025-01-15',
      endDate: '2025-01-17',
      days: 3,
      status: 'Hersteld',
      reason: 'Griep'
    },
    {
      id: 2,
      startDate: '2025-01-28',
      endDate: null,
      days: 2,
      status: 'Ziek',
      reason: 'Rugklachten'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Ziekmeldingen</h1>
        <p className="text-black font-medium">Beheer je ziekmeldingen en herstelregistraties</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              Overzicht
            </button>
            <button
              onClick={() => setSelectedTab('report')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'report'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              Ziekmelding
            </button>
            <button
              onClick={() => setSelectedTab('recovery')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'recovery'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              Herstelmelding
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-2">Dit Jaar</h3>
              <div className="text-3xl font-bold text-red-600">8</div>
              <p className="text-sm text-gray-500">Ziektedagen</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-2">Gemiddeld</h3>
              <div className="text-3xl font-bold text-blue-600">2.1</div>
              <p className="text-sm text-gray-500">Dagen per melding</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-2">Laatste</h3>
              <div className="text-3xl font-bold text-green-600">28</div>
              <p className="text-sm text-gray-500">Dagen geleden</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-black mb-2">Status</h3>
              <div className="text-3xl font-bold text-green-600">✓</div>
              <p className="text-sm text-gray-500">Gezond</p>
            </div>
          </div>

          {/* Recent Records */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-black mb-4">Recente Ziekmeldingen</h3>
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Periode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dagen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reden
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sickLeaveRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.startDate} {record.endDate ? `- ${record.endDate}` : '- Lopend'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.status === 'Hersteld' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {selectedTab === 'report' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-black mb-4">Nieuwe Ziekmelding</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Belangrijk</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Meld je ziek zo snel mogelijk, bij voorkeur voor 09:00 uur. Neem contact op met je leidinggevende.</p>
                  </div>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Startdatum ziekte</label>
                <input
                  type="date"
                  aria-label="Startdatum van ziekte selecteren"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Verwachte duur</label>
                <select aria-label="Verwachte duur van ziekte selecteren" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option>1 dag</option>
                  <option>2-3 dagen</option>
                  <option>1 week</option>
                  <option>Onbekend</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reden (optioneel)</label>
                <textarea
                  rows={3}
                  aria-label="Optionele reden of omschrijving van klachten"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Korte omschrijving van de klachten..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  aria-label="Ik heb mijn leidinggevende geïnformeerd"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Ik heb mijn leidinggevende geïnformeerd
                </label>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Ziekmelding Indienen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Tab */}
      {selectedTab === 'recovery' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-black mb-4">Herstelmelding</h3>
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Welkom terug!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Meld je herstel zo snel mogelijk om je werkhervatting te registreren.</p>
                  </div>
                </div>
              </div>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Hersteldatum</label>
                <input
                  type="date"
                  aria-label="Hersteldatum selecteren"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Werkhervatting</label>
                <select aria-label="Type werkhervatting selecteren" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option>Volledig hersteld</option>
                  <option>Gedeeltelijk hersteld</option>
                  <option>Met beperkingen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Opmerkingen</label>
                <textarea
                  rows={3}
                  aria-label="Eventuele opmerkingen over herstel"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Eventuele opmerkingen over je herstel..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Herstelmelding Indienen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
