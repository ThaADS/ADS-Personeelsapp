'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';

interface ProfileData {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  locale: string | null;
  globalRole: string | null;
  tenantRole: string;
  isActive: boolean;
  tenant: { id: string; name: string; slug: string } | null;
  notifications: { emailEnabled: boolean; categories: string[] | null };
  // Contact info (editable)
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  // Work info (read-only)
  employeeId: string | null;
  department: string | null;
  position: string | null;
  startDate: string | null;
  contractType: string | null;
  workHoursPerWeek: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editedData, setEditedData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Fout bij ophalen profiel');
      }
      const data = await response.json();
      setProfileData(data);
      setEditedData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session, fetchProfile]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fout bij opslaan profiel');
      }

      const result = await response.json();
      if (result.success) {
        setSuccessMessage('Profiel succesvol opgeslagen');
        setIsEditing(false);
        fetchProfile(); // Refresh data
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditedData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || '',
        postalCode: profileData.postalCode || '',
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-6"></div>
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mijn Profiel</h1>
        <p className="text-gray-600 dark:text-gray-300 font-medium">Beheer je persoonlijke gegevens en instellingen</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('personal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'personal'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300'
              }`}
            >
              Persoonlijke Gegevens
            </button>
            <button
              onClick={() => setSelectedTab('work')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'work'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300'
              }`}
            >
              Werkgegevens
            </button>
            <button
              onClick={() => setSelectedTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'settings'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300'
              }`}
            >
              Instellingen
            </button>
          </nav>
        </div>
      </div>

      {/* Personal Tab */}
      {selectedTab === 'personal' && profileData && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Persoonlijke Informatie</h3>
              <div className="flex gap-2">
                {isEditing && (
                  <button
                    onClick={handleCancel}
                    className="bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Annuleren
                  </button>
                )}
                <button
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Opslaan...' : isEditing ? 'Opslaan' : 'Bewerken'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Naam</label>
                <input
                  type="text"
                  value={editedData.name}
                  disabled={!isEditing}
                  onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                  placeholder="Voer uw naam in"
                  title="Naam"
                  className={`mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    !isEditing ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                <input
                  type="email"
                  value={editedData.email}
                  disabled={!isEditing}
                  onChange={(e) => setEditedData({...editedData, email: e.target.value})}
                  aria-label="E-mailadres wijzigen"
                  className={`mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    !isEditing ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefoon</label>
                <input
                  type="tel"
                  value={editedData.phone}
                  disabled={!isEditing}
                  onChange={(e) => setEditedData({...editedData, phone: e.target.value})}
                  placeholder="+31 6 12345678"
                  aria-label="Telefoonnummer wijzigen"
                  className={`mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    !isEditing ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organisatie</label>
                <input
                  type="text"
                  value={profileData.tenant?.name || '-'}
                  disabled
                  aria-label="Organisatie (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres</label>
                <input
                  type="text"
                  value={editedData.address}
                  disabled={!isEditing}
                  onChange={(e) => setEditedData({...editedData, address: e.target.value})}
                  placeholder="Voer uw adres in"
                  title="Adres"
                  className={`mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    !isEditing ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stad</label>
                <input
                  type="text"
                  value={editedData.city}
                  disabled={!isEditing}
                  onChange={(e) => setEditedData({...editedData, city: e.target.value})}
                  placeholder="Voer uw stad in"
                  title="Stad"
                  className={`mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    !isEditing ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Postcode</label>
                <input
                  type="text"
                  value={editedData.postalCode}
                  disabled={!isEditing}
                  onChange={(e) => setEditedData({...editedData, postalCode: e.target.value})}
                  placeholder="1234 AB"
                  title="Postcode"
                  className={`mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${
                    !isEditing ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Tab */}
      {selectedTab === 'work' && profileData && (
        <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Werkgegevens</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Deze gegevens worden beheerd door uw werkgever.</p>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Personeelsnummer</label>
                <input
                  type="text"
                  value={profileData.employeeId || '-'}
                  disabled
                  aria-label="Personeelsnummer (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Afdeling</label>
                <input
                  type="text"
                  value={profileData.department || '-'}
                  disabled
                  aria-label="Afdeling (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Functie</label>
                <input
                  type="text"
                  value={profileData.position || '-'}
                  disabled
                  aria-label="Functie (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Startdatum</label>
                <input
                  type="text"
                  value={formatDate(profileData.startDate)}
                  disabled
                  aria-label="Startdatum in dienst (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract</label>
                <input
                  type="text"
                  value={profileData.contractType || '-'}
                  disabled
                  aria-label="Contract type (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Werkuren per week</label>
                <input
                  type="text"
                  value={profileData.workHoursPerWeek ? `${profileData.workHoursPerWeek} uur` : '-'}
                  disabled
                  aria-label="Werkuren per week (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                <input
                  type="text"
                  value={profileData.tenantRole || '-'}
                  disabled
                  aria-label="Rol (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account aangemaakt</label>
                <input
                  type="text"
                  value={formatDate(profileData.createdAt)}
                  disabled
                  aria-label="Account aanmaakdatum (alleen lezen)"
                  className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 bg-gray-50 dark:bg-slate-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && profileData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Wachtwoord Wijzigen</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Huidig wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Huidig wachtwoord"
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nieuw wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Nieuw wachtwoord"
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bevestig nieuw wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Bevestig nieuw wachtwoord"
                    className="mt-1 block w-full border border-gray-300 dark:border-slate-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 dark:text-white"
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

          <div className="bg-white dark:bg-slate-800 shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notificatie Instellingen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">E-mail notificaties</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ontvang updates via e-mail</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={profileData.notifications?.emailEnabled ?? true}
                    aria-label="E-mail notificaties ontvangen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Vakantie herinneringen</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Herinneringen voor vakantieaanvragen</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Vakantie herinneringen ontvangen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tijdregistratie meldingen</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dagelijkse herinneringen voor tijdregistratie</p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Tijdregistratie meldingen ontvangen"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700"
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
