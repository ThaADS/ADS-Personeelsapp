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
          <div className="h-8 bg-purple-200/50 dark:bg-purple-500/20 rounded-xl w-1/4 mb-4"></div>
          <div className="h-4 bg-purple-200/50 dark:bg-purple-500/20 rounded-xl w-1/2 mb-6"></div>
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-6">
            <div className="space-y-4">
              <div className="h-4 bg-purple-200/50 dark:bg-purple-500/20 rounded-xl w-3/4"></div>
              <div className="h-4 bg-purple-200/50 dark:bg-purple-500/20 rounded-xl w-1/2"></div>
              <div className="h-4 bg-purple-200/50 dark:bg-purple-500/20 rounded-xl w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Mijn Profiel</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beheer je persoonlijke gegevens en instellingen</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="backdrop-blur-sm bg-green-500/10 dark:bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 rounded-2xl p-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-300 rounded-2xl p-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="flex overflow-x-auto border-b border-white/20 dark:border-purple-500/20">
          <button
            onClick={() => setSelectedTab('personal')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'personal'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Persoonlijke Gegevens
          </button>
          <button
            onClick={() => setSelectedTab('work')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'work'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Werkgegevens
          </button>
          <button
            onClick={() => setSelectedTab('settings')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'settings'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Instellingen
          </button>
        </div>
      </div>

      {/* Personal Tab */}
      {selectedTab === 'personal' && profileData && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Persoonlijke Informatie</h3>
              <div className="flex gap-2">
                {isEditing && (
                  <button
                    onClick={handleCancel}
                    className="backdrop-blur-sm bg-white/50 dark:bg-white/5 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-200 dark:border-purple-500/30 hover:bg-gray-100 dark:hover:bg-purple-500/10 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] transition-colors"
                  >
                    Annuleren
                  </button>
                )}
                <button
                  onClick={handleEditToggle}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 min-h-[44px] transition-all duration-200"
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
                  className={`mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    !isEditing
                      ? 'backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white'
                      : 'backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
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
                  className={`mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    !isEditing
                      ? 'backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white'
                      : 'backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
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
                  className={`mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    !isEditing
                      ? 'backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white'
                      : 'backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
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
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
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
                  className={`mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    !isEditing
                      ? 'backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white'
                      : 'backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
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
                  className={`mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    !isEditing
                      ? 'backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white'
                      : 'backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
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
                  className={`mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                    !isEditing
                      ? 'backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white'
                      : 'backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Tab */}
      {selectedTab === 'work' && profileData && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
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
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Afdeling</label>
                <input
                  type="text"
                  value={profileData.department || '-'}
                  disabled
                  aria-label="Afdeling (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Functie</label>
                <input
                  type="text"
                  value={profileData.position || '-'}
                  disabled
                  aria-label="Functie (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Startdatum</label>
                <input
                  type="text"
                  value={formatDate(profileData.startDate)}
                  disabled
                  aria-label="Startdatum in dienst (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contract</label>
                <input
                  type="text"
                  value={profileData.contractType || '-'}
                  disabled
                  aria-label="Contract type (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Werkuren per week</label>
                <input
                  type="text"
                  value={profileData.workHoursPerWeek ? `${profileData.workHoursPerWeek} uur` : '-'}
                  disabled
                  aria-label="Werkuren per week (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rol</label>
                <input
                  type="text"
                  value={profileData.tenantRole || '-'}
                  disabled
                  aria-label="Rol (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account aangemaakt</label>
                <input
                  type="text"
                  value={formatDate(profileData.createdAt)}
                  disabled
                  aria-label="Account aanmaakdatum (alleen lezen)"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/20 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedTab === 'settings' && profileData && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Wachtwoord Wijzigen</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Huidig wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Huidig wachtwoord"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nieuw wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Nieuw wachtwoord"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bevestig nieuw wachtwoord</label>
                  <input
                    type="password"
                    aria-label="Bevestig nieuw wachtwoord"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] transition-all duration-200"
                  >
                    Wachtwoord Wijzigen
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notificatie Instellingen</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">E-mail notificaties</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ontvang updates via e-mail</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={profileData.notifications?.emailEnabled ?? true}
                    aria-label="E-mail notificaties ontvangen"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Vakantie herinneringen</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Herinneringen voor vakantieaanvragen</p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Vakantie herinneringen ontvangen"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Tijdregistratie meldingen</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dagelijkse herinneringen voor tijdregistratie</p>
                  </div>
                  <input
                    type="checkbox"
                    aria-label="Tijdregistratie meldingen ontvangen"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
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
