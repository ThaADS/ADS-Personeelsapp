'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function ProfilePage() {
  const { data: session } = useSession();
  
  // Session will be used for profile data when implementing backend integration
  console.log('Profile session:', session?.user?.name);
  
  // User session data will be used when implementing profile display
  // const userName = session?.user?.name || 'Gebruiker';
  // const userEmail = session?.user?.email || '';
  const [selectedTab, setSelectedTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ckw.nl',
    phone: '+31 6 12345678',
    address: 'Hoofdstraat 123',
    city: 'Amsterdam',
    postalCode: '1000 AB',
    department: 'IT',
    position: 'System Administrator',
    employeeId: 'ADS001',
    startDate: '2020-01-15',
    contractType: 'Vast dienstverband',
    workHours: '40 uur per week'
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black">Mijn Profiel</h1>
        <p className="text-black font-medium">Beheer je persoonlijke gegevens en instellingen</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'personal'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              Persoonlijke Gegevens
            </button>
            <button
              onClick={() => setSelectedTab('work')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'work'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              Werkgegevens
            </button>
            <button
              onClick={() => setSelectedTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300'
              }`}
            >
              Instellingen
            </button>
          </nav>
        </div>
      </div>

      {/* Personal Tab */}
      {selectedTab === 'personal' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-black">Persoonlijke Informatie</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isEditing ? 'Opslaan' : 'Bewerken'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Voornaam</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  placeholder="Voer uw voornaam in"
                  title="Voornaam"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Achternaam</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  placeholder="Voer uw achternaam in"
                  title="Achternaam"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  aria-label="E-mailadres wijzigen"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Telefoon</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  aria-label="Telefoonnummer wijzigen"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Adres</label>
                <input
                  type="text"
                  value={profileData.address}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                  placeholder="Voer uw adres in"
                  title="Adres"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Stad</label>
                <input
                  type="text"
                  value={profileData.city}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                  placeholder="Voer uw stad in"
                  title="Stad"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Postcode</label>
                <input
                  type="text"
                  value={profileData.postalCode}
                  disabled={!isEditing}
                  onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                  placeholder="Voer uw postcode in"
                  title="Postcode"
                  className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    !isEditing ? 'bg-gray-50' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Tab */}
      {selectedTab === 'work' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-black mb-6">Werkgegevens</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Personeelsnummer</label>
                <input
                  type="text"
                  value={profileData.employeeId}
                  disabled
                  aria-label="Personeelsnummer (alleen lezen)"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Afdeling</label>
                <input
                  type="text"
                  value={profileData.department}
                  disabled
                  aria-label="Afdeling (alleen lezen)"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Functie</label>
                <input
                  type="text"
                  value={profileData.position}
                  disabled
                  aria-label="Functie (alleen lezen)"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Startdatum</label>
                <input
                  type="text"
                  value={profileData.startDate}
                  disabled
                  aria-label="Startdatum in dienst (alleen lezen)"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contract</label>
                <input
                  type="text"
                  value={profileData.contractType}
                  disabled
                  aria-label="Contract type (alleen lezen)"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Werkuren</label>
                <input
                  type="text"
                  value={profileData.workHours}
                  disabled
                  aria-label="Werkuren per week (alleen lezen)"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-black mb-4">Wachtwoord Wijzigen</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Huidig wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Huidig wachtwoord"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nieuw wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Nieuw wachtwoord"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bevestig nieuw wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Bevestig nieuw wachtwoord"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Wachtwoord Wijzigen
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-black mb-4">Notificatie Instellingen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">E-mail notificaties</h4>
                    <p className="text-sm text-gray-500">Ontvang updates via e-mail</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="E-mail notificaties ontvangen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Vakantie herinneringen</h4>
                    <p className="text-sm text-gray-500">Herinneringen voor vakantieaanvragen</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="E-mail notificaties ontvangen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Tijdregistratie meldingen</h4>
                    <p className="text-sm text-gray-500">Dagelijkse herinneringen voor tijdregistratie</p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Tijdregistratie meldingen ontvangen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
