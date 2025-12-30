'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Employee {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  name: string | null;
  email: string;
  image: string | null;
  phone: string | null;
  department: string | null;
  position: string | null;
  employeeId: string | null;
  startDate: string | null;
  contractType: string | null;
  workHoursPerWeek: number | null;
  createdAt: string;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  maritalStatus: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  emergencyRelationship: string | null;
  hoursPerWeek: number | null;
  costCenter: string | null;
  endDate: string | null;
  skills: string[];
  certifications: string[];
  educationLevel: string | null;
  languages: string[];
  remoteWorkAllowed: boolean;
  workLocation: string | null;
  notes: string | null;
}

interface EmployeeDetailModalProps {
  employee: Employee;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
  getRoleLabel: (role: string) => string;
  formatDate: (date: string | null) => string;
}

type TabType = 'overview' | 'personal' | 'employment' | 'skills' | 'emergency';

export function EmployeeDetailModal({
  employee,
  canManage,
  onClose,
  onEdit,
  getRoleLabel,
  formatDate,
}: EmployeeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const getContractTypeLabel = (type: string | null) => {
    switch (type) {
      case 'FULLTIME': return 'Voltijd';
      case 'PARTTIME': return 'Deeltijd';
      case 'FLEX': return 'Flex';
      case 'TEMPORARY': return 'Tijdelijk';
      case 'INTERN': return 'Stage';
      default: return type || '-';
    }
  };

  const getGenderLabel = (gender: string | null) => {
    switch (gender?.toLowerCase()) {
      case 'male': case 'm': return 'Man';
      case 'female': case 'f': case 'v': return 'Vrouw';
      case 'other': case 'x': return 'Anders';
      default: return gender || '-';
    }
  };

  const getMaritalStatusLabel = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'single': return 'Ongehuwd';
      case 'married': return 'Gehuwd';
      case 'divorced': return 'Gescheiden';
      case 'widowed': return 'Weduwe/Weduwnaar';
      case 'partnership': return 'Geregistreerd partnerschap';
      default: return status || '-';
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Check if birthday is upcoming (within 30 days)
  const isUpcomingBirthday = (dob: string | null) => {
    if (!dob) return false;
    const birthDate = new Date(dob);
    const today = new Date();
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    const daysUntil = Math.ceil((thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil >= 0 && daysUntil <= 30;
  };

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'personal', label: 'Persoonlijk', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'employment', label: 'Contract', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'skills', label: 'Vaardigheden', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
    { id: 'emergency', label: 'Noodcontact', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[90vh] backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 rounded-3xl shadow-2xl border border-white/20 dark:border-purple-500/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-r from-purple-600 to-pink-600 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Sluiten"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            {employee.image ? (
              <Image
                src={employee.image}
                alt=""
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover border-4 border-white/30 shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-lg">
                <span className="text-white font-bold text-2xl">
                  {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || employee.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {employee.name || 'Geen naam'}
                {isUpcomingBirthday(employee.dateOfBirth) && (
                  <span className="text-2xl" title="Verjaardag binnenkort!">🎂</span>
                )}
              </h2>
              <p className="text-white/80 text-sm">
                {employee.position || getRoleLabel(employee.role)}
              </p>
              {employee.department && (
                <p className="text-white/60 text-xs">{employee.department}</p>
              )}
              {/* Status Badge */}
              <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${employee.isActive ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-200'}`}>
                <span className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></span>
                {employee.isActive ? 'Actief' : 'Inactief'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-purple-500/20 overflow-x-auto flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contactgegevens
                </h3>
                <a
                  href={`mailto:${employee.email}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400">E-mail</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{employee.email}</p>
                  </div>
                </a>

                {employee.phone && (
                  <a
                    href={`tel:${employee.phone}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Telefoon</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.phone}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {employee.department && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Afdeling</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.department}</p>
                  </div>
                )}
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Rol</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getRoleLabel(employee.role)}</p>
                </div>
                {employee.startDate && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">In dienst sinds</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(employee.startDate)}</p>
                  </div>
                )}
                {employee.employeeId && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Personeelsnr.</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">#{employee.employeeId}</p>
                  </div>
                )}
                {employee.dateOfBirth && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Geboortedatum</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(employee.dateOfBirth)}
                      {calculateAge(employee.dateOfBirth) && (
                        <span className="text-gray-500 dark:text-gray-400 ml-1">
                          ({calculateAge(employee.dateOfBirth)} jaar)
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {(employee.workHoursPerWeek || employee.hoursPerWeek) && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uren per week</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {employee.workHoursPerWeek || employee.hoursPerWeek} uur
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Personal Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Persoonlijke gegevens</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Geboortedatum</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {employee.dateOfBirth ? (
                      <>
                        {formatDate(employee.dateOfBirth)}
                        {isUpcomingBirthday(employee.dateOfBirth) && ' 🎂'}
                      </>
                    ) : '-'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Leeftijd</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {calculateAge(employee.dateOfBirth) ? `${calculateAge(employee.dateOfBirth)} jaar` : '-'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Geslacht</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getGenderLabel(employee.gender)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nationaliteit</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.nationality || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5 col-span-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Burgerlijke staat</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getMaritalStatusLabel(employee.maritalStatus)}</p>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-6">Adres</h3>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                {employee.address || employee.city || employee.postalCode ? (
                  <div className="space-y-1">
                    {employee.address && (
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.address}</p>
                    )}
                    {(employee.postalCode || employee.city) && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {[employee.postalCode, employee.city].filter(Boolean).join(' ')}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geen adres opgegeven</p>
                )}
              </div>
            </div>
          )}

          {/* Employment Tab */}
          {activeTab === 'employment' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Contractgegevens</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Personeelsnummer</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.employeeId || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Contracttype</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getContractTypeLabel(employee.contractType)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Startdatum</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(employee.startDate)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Einddatum</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(employee.endDate)}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Uren per week</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {employee.workHoursPerWeek || employee.hoursPerWeek || '-'} uur
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Kostenplaats</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.costCenter || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Werklocatie</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.workLocation || '-'}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Thuiswerken</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {employee.remoteWorkAllowed ? (
                      <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Toegestaan
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Niet van toepassing</span>
                    )}
                  </p>
                </div>
              </div>

              {employee.notes && (
                <>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-6">Notities</h3>
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{employee.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Opleidingsniveau</h3>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/5">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.educationLevel || 'Niet opgegeven'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Vaardigheden</h3>
                {employee.skills && employee.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {employee.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geen vaardigheden opgegeven</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Certificeringen</h3>
                {employee.certifications && employee.certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {employee.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geen certificeringen opgegeven</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Talen</h3>
                {employee.languages && employee.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {employee.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geen talen opgegeven</p>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Noodcontact</h3>
              {employee.emergencyContact || employee.emergencyPhone ? (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {employee.emergencyContact || 'Onbekend'}
                      </p>
                      {employee.emergencyRelationship && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{employee.emergencyRelationship}</p>
                      )}
                      {employee.emergencyPhone && (
                        <a
                          href={`tel:${employee.emergencyPhone}`}
                          className="inline-flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {employee.emergencyPhone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Geen noodcontact opgegeven. Het is belangrijk om een noodcontact in te stellen.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-gray-200 dark:border-purple-500/20 flex gap-3 flex-shrink-0">
          {canManage && (
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              Bewerken
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${canManage ? 'flex-1' : 'w-full'} px-4 py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-colors`}
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
