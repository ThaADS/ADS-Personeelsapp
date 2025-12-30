'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/providers/LocaleProvider';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session } = useSession();
  
  // Session will be used for admin permissions check
  console.log('Settings session:', session?.user?.role);
  const [selectedTab, setSelectedTab] = useState('general');
  const { locale, setLocale } = useLocale();
  const [emailPref, setEmailPref] = useState<boolean>(true);
  const [savingPref, setSavingPref] = useState(false);
  const [savingLocale, setSavingLocale] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/user/preferences');
        if (res.ok) {
          const data = await res.json();
          setEmailPref(Boolean(data.emailEnabled));
        }
      } catch {
        // ignore
      }
    };
    load();
  }, []);
  
  // Admin permissions will be checked when implementing settings actions
  // const isAdmin = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'SUPERUSER';

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Instellingen</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Beheer systeem instellingen en configuratie</p>
      </div>

      {/* Tabs */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="flex overflow-x-auto border-b border-white/20 dark:border-purple-500/20">
          <button
            onClick={() => setSelectedTab('general')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'general'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Algemeen
          </button>
          <button
            onClick={() => setSelectedTab('company')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'company'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Bedrijfsgegevens
          </button>
          <button
            onClick={() => setSelectedTab('notifications')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'notifications'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Notificaties
          </button>
          <button
            onClick={() => setSelectedTab('security')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'security'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Beveiliging
          </button>
          <button
            onClick={() => setSelectedTab('integrations')}
            className={`flex-1 min-w-0 py-3 px-4 text-sm font-medium text-center whitespace-nowrap min-h-[44px] transition-colors ${
              selectedTab === 'integrations'
                ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
            }`}
          >
            Integraties
          </button>
        </div>
      </div>

      {/* General Tab */}
      {selectedTab === 'general' && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Systeem Instellingen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tijdzone</label>
                  <select aria-label="Tijdzone selecteren" className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                    <option>Europe/Amsterdam</option>
                    <option>Europe/Brussels</option>
                    <option>Europe/Berlin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Voorkeurstaal</label>
                  <div className="flex items-center gap-2">
                    <select value={locale} onChange={(e)=> setLocale(e.target.value as 'nl'|'pl'|'en'|'de')} aria-label="Taal selecteren" className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                      <option value="nl">Nederlands</option>
                      <option value="pl">Polski</option>
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                    <button
                      type="button"
                      disabled={savingLocale}
                      onClick={async ()=>{
                        setSavingLocale(true);
                        try {
                          await fetch('/api/user/locale', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ locale }) });
                        } finally { setSavingLocale(false); }
                      }}
                      className="mt-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] transition-all duration-200"
                    >Opslaan</button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">De interface herlaadt automatisch met de gekozen taal.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Datumformaat</label>
                  <select aria-label="Datumformaat selecteren" className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors">
                    <option>DD-MM-YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="flex items-center p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Automatische updates inschakelen"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                  />
                  <label className="ml-3 block text-sm text-gray-900 dark:text-white">
                    Automatische updates inschakelen
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Werkuren Instellingen</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Standaard werkweek</label>
                  <input
                    type="number"
                    defaultValue="40"
                    aria-label="Standaard werkweek in uren"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vakantiedagen per jaar</label>
                  <input
                    type="number"
                    defaultValue="25"
                    aria-label="Vakantiedagen per jaar"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Werkdag start</label>
                  <input
                    type="time"
                    defaultValue="09:00"
                    aria-label="Werkdag starttijd"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Werkdag einde</label>
                  <input
                    type="time"
                    defaultValue="17:00"
                    aria-label="Werkdag eindtijd"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Tab */}
      {selectedTab === 'company' && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bedrijfsinformatie</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrijfsnaam</label>
                <input
                  type="text"
                  defaultValue="ADSPersoneelapp"
                  aria-label="Bedrijfsnaam"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">KvK nummer</label>
                <input
                  type="text"
                  defaultValue="12345678"
                  aria-label="KvK nummer"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">BTW nummer</label>
                <input
                  type="text"
                  defaultValue="NL123456789B01"
                  aria-label="BTW nummer"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Adres</label>
                <input
                  type="text"
                  defaultValue="Hoofdstraat 123, 1000 AB Amsterdam"
                  aria-label="Bedrijfsadres"
                  className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Telefoon</label>
                  <input
                    type="tel"
                    defaultValue="+31 20 1234567"
                    aria-label="Bedrijfstelefoon"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">E-mail</label>
                  <input
                    type="email"
                    defaultValue="info@ckw.nl"
                    aria-label="Bedrijfs e-mailadres"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {selectedTab === 'notifications' && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notificatie Instellingen</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">E-mail Notificaties</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Nieuwe vakantieaanvragen</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stuur e-mail bij nieuwe aanvragen</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        aria-label="Nieuwe vakantieaanvragen notificaties"
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Ziekmeldingen</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Stuur e-mail bij nieuwe ziekmeldingen</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        aria-label="Ziekmeldingen notificaties"
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Tijdregistratie herinneringen</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Dagelijkse herinneringen voor medewerkers</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Tijdregistratie herinneringen e-mail notificaties ontvangen"
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-medium text-gray-900 dark:text-white mb-3">Systeem Meldingen</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Systeem updates</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Meldingen over systeem updates</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked
                        aria-label="Systeem updates notificaties"
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Backup status</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Meldingen over backup status</p>
                      </div>
                      <input
                        type="checkbox"
                        aria-label="Backup status notificaties"
                        className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Email Notifications */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">E-mail Voorkeuren</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">E-mails ontvangen</div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ontvang e-mails over tijdregistratie, verlof en goedkeuringen</p>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={emailPref} onChange={(e)=> setEmailPref(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-purple-500/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                <div>
                  <button
                    type="button"
                    disabled={savingPref}
                    onClick={async ()=>{
                      setSavingPref(true);
                      try { await fetch('/api/user/preferences', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ emailEnabled: emailPref }) }); } finally { setSavingPref(false); }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 min-h-[44px] transition-all duration-200"
                  >Opslaan</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}{/* Security Tab */}
      {selectedTab === 'security' && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Wachtwoord Beleid</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Minimale wachtwoord lengte</label>
                  <input
                    type="number"
                    defaultValue="8"
                    min="6"
                    max="20"
                    aria-label="Minimale wachtwoord lengte instellen"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Hoofdletters vereist voor wachtwoorden"
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                    />
                    <label className="ml-3 block text-sm text-gray-900 dark:text-white">
                      Hoofdletters vereist
                    </label>
                  </div>
                  <div className="flex items-center p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                    <input
                      type="checkbox"
                      defaultChecked
                      aria-label="Cijfers vereist voor wachtwoorden"
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                    />
                    <label className="ml-3 block text-sm text-gray-900 dark:text-white">
                      Cijfers vereist
                    </label>
                  </div>
                  <div className="flex items-center p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                    <input
                      type="checkbox"
                      aria-label="Speciale tekens vereist voor wachtwoorden"
                      className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                    />
                    <label className="ml-3 block text-sm text-gray-900 dark:text-white">
                      Speciale tekens vereist
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Wachtwoord verloopt na (dagen)</label>
                  <input
                    type="number"
                    defaultValue="90"
                    aria-label="Wachtwoord verloopt na aantal dagen"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sessie Instellingen</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sessie timeout (minuten)</label>
                  <input
                    type="number"
                    defaultValue="30"
                    aria-label="Sessie timeout in minuten"
                    className="mt-1 block w-full rounded-lg shadow-sm p-3 min-h-[44px] backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="flex items-center p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <input
                    type="checkbox"
                    defaultChecked
                    aria-label="Automatisch uitloggen bij inactiviteit"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                  />
                  <label className="ml-3 block text-sm text-gray-900 dark:text-white">
                    Automatisch uitloggen bij inactiviteit
                  </label>
                </div>
                <div className="flex items-center p-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10">
                  <input
                    type="checkbox"
                    aria-label="Twee-factor authenticatie vereist"
                    className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded dark:bg-white/5"
                  />
                  <label className="ml-3 block text-sm text-gray-900 dark:text-white">
                    Twee-factor authenticatie vereist
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {selectedTab === 'integrations' && (
        <div className="space-y-6">
          {/* Fleet Tracking Providers */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fleet Tracking Integraties</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Koppel uw ritregistratie systeem voor automatische tijdsbesparing
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    Bespaar 2+ uur per week
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RouteVision - NL Popular */}
                <Link
                  href="/settings/fleet-provider/routevision"
                  className="flex flex-col p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">RouteVision</h4>
                          <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">NL</span>
                          <span className="px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Populair</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Ritregistratie specialist
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Ritregistratie</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">GPS Tracking</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Fiscaal</span>
                  </div>
                </Link>

                {/* FleetGO - NL Popular */}
                <Link
                  href="/settings/fleet-provider/fleetgo"
                  className="flex flex-col p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">FleetGO</h4>
                          <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">NL</span>
                          <span className="px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Populair</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Moderne fleet management
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Fleet Management</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Eco-Driving</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Real-time</span>
                  </div>
                </Link>

                {/* Samsara - Global Popular */}
                <Link
                  href="/settings/fleet-provider/samsara"
                  className="flex flex-col p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Samsara</h4>
                          <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">Global</span>
                          <span className="px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Populair</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Enterprise IoT platform
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">AI Dashcams</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">IoT Sensoren</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Compliance</span>
                  </div>
                </Link>

                {/* Webfleet - EU Popular */}
                <Link
                  href="/settings/fleet-provider/webfleet"
                  className="flex flex-col p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Webfleet</h4>
                          <span className="px-2 py-0.5 text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 rounded-full">EU</span>
                          <span className="px-2 py-0.5 text-xs font-medium text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">Populair</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          TomTom professioneel
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">TomTom Navigatie</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">OptiDrive</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Werkorders</span>
                  </div>
                </Link>

                {/* TrackJack - NL Budget */}
                <Link
                  href="/settings/fleet-provider/trackjack"
                  className="flex flex-col p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">TrackJack</h4>
                          <span className="px-2 py-0.5 text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400 rounded-full">NL</span>
                          <span className="px-2 py-0.5 text-xs font-medium text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">MKB</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Betaalbare ritregistratie
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Ritregistratie</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Fiscale Export</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Lage Kosten</span>
                  </div>
                </Link>

                {/* Verizon Connect - Global Enterprise */}
                <Link
                  href="/settings/fleet-provider/verizon"
                  className="flex flex-col p-4 rounded-xl backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all group hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Verizon Connect</h4>
                          <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">Global</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                          Enterprise analytics
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Analytics</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Field Service</span>
                    <span className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded">Video</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 shadow-lg rounded-2xl border border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Waarom Fleet Tracking Integratie?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Tijdsbesparing</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Automatische registratie bespaart 2+ uur per week</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Nauwkeurigheid</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">GPS-gebaseerde data is 100% betrouwbaar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Fiscaal Compliant</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Voldoet aan Belastingdienst eisen</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Automatisch Matchen</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ritten worden gekoppeld aan uren</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Integrations */}
          <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Overige Integraties</h3>
              <div className="flex items-center justify-between p-4 rounded-xl backdrop-blur-sm bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-purple-500/10 opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-500 dark:text-gray-400">Meer integraties</h4>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Salarisverwerking, Planning, en meer - binnenkort beschikbaar
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-full">
                  Roadmap
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] transition-all duration-200">
          Instellingen Opslaan
        </button>
      </div>
    </div>
  );
}

