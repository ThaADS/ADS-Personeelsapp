'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function VacationPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // User info will be used when implementing vacation functionality
  // const currentUserId = session?.user?.id;
  // const userName = session?.user?.name || 'Gebruiker';

  const vacationRequests = [
    {
      id: 1,
      startDate: '2025-02-15',
      endDate: '2025-02-19',
      days: 5,
      status: 'Goedgekeurd',
      type: 'Vakantie'
    },
    {
      id: 2,
      startDate: '2025-03-10',
      endDate: '2025-03-12',
      days: 3,
      status: 'In behandeling',
      type: 'Verlof'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vakantie & Verlof</h1>
        <p className="text-gray-600">Beheer je vakantiedagen en verlofaanvragen</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overzicht
            </button>
            <button
              onClick={() => setSelectedTab('request')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'request'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Nieuwe Aanvraag
            </button>
            <button
              onClick={() => setSelectedTab('balance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'balance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Saldo
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recente Aanvragen</h3>
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
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vacationRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.startDate} - {request.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.days}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'Goedgekeurd' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
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

      {/* Request Tab */}
      {selectedTab === 'request' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nieuwe Vakantieaanvraag</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Startdatum</label>
                  <input
                    type="date"
                    aria-label="Startdatum van vakantie selecteren"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Einddatum</label>
                  <input
                    type="date"
                    aria-label="Einddatum van vakantie selecteren"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select aria-label="Type verlof selecteren" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                  <option>Vakantie</option>
                  <option>Verlof</option>
                  <option>Compensatieverlof</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Opmerking</label>
                <textarea
                  rows={3}
                  aria-label="Optionele opmerking bij vakantieaanvraag"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optionele opmerking..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Aanvraag Indienen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Balance Tab */}
      {selectedTab === 'balance' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Vakantiedagen</h3>
            <div className="text-3xl font-bold text-blue-600">23</div>
            <p className="text-sm text-gray-500">Beschikbaar dit jaar</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gebruikt</h3>
            <div className="text-3xl font-bold text-green-600">12</div>
            <p className="text-sm text-gray-500">Dagen opgenomen</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gepland</h3>
            <div className="text-3xl font-bold text-orange-600">5</div>
            <p className="text-sm text-gray-500">Goedgekeurde aanvragen</p>
          </div>
        </div>
      )}
    </div>
  );
}
