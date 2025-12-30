'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Vehicle {
  id: string;
  providerType: string;
  providerVehicleId: string;
  registration: string;
  vehicleName: string | null;
  isActive: boolean;
  employeeId: string | null;
  employeeName: string | null;
}

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
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  maritalStatus: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  bankAccountNumber: string | null;
  bankAccountName: string | null;
  bsnNumber: string | null;
  employeeRecordId: string | null;
  departmentId: string | null;
  hoursPerWeek: number | null;
  endDate: string | null;
  hourlyRate: number | null;
  managerId: string | null;
  costCenter: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  emergencyRelationship: string | null;
  skills: string[];
  certifications: string[];
  educationLevel: string | null;
  languages: string[];
  remoteWorkAllowed: boolean;
  workLocation: string | null;
  notes: string | null;
  vehicleMappings: {
    id: string;
    provider_type: string;
    provider_vehicle_id: string;
    registration: string;
    vehicle_name: string | null;
    is_active: boolean;
  }[];
}

type TabKey = 'personal' | 'employment' | 'emergency' | 'skills' | 'fleet';

export default function EmployeeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('personal');

  // Form state
  const [formData, setFormData] = useState({
    // Personal
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    maritalStatus: '',
    address: '',
    city: '',
    postalCode: '',
    // Employment
    role: 'USER',
    isActive: true,
    employeeId: '',
    department: '',
    position: '',
    startDate: '',
    endDate: '',
    contractType: '',
    workHoursPerWeek: '',
    hoursPerWeek: '',
    hourlyRate: '',
    costCenter: '',
    workLocation: '',
    remoteWorkAllowed: false,
    // Bank/ID
    bankAccountNumber: '',
    bankAccountName: '',
    bsnNumber: '',
    // Emergency
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    // Skills
    skills: [] as string[],
    certifications: [] as string[],
    educationLevel: '',
    languages: [] as string[],
    // Notes
    notes: '',
    // Fleet - array of vehicle mapping IDs
    vehicleIds: [] as string[],
  });

  const canManageEmployees = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'MANAGER';

  // Fetch employee data
  const fetchEmployee = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/employees/${resolvedParams.id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Werknemer niet gevonden');
        }
        throw new Error('Fout bij ophalen werknemer');
      }

      const data = await response.json();
      setEmployee(data.employee);

      // Populate form
      const emp = data.employee;
      setFormData({
        name: emp.name || '',
        phone: emp.phone || '',
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
        gender: emp.gender || '',
        nationality: emp.nationality || '',
        maritalStatus: emp.maritalStatus || '',
        address: emp.address || '',
        city: emp.city || '',
        postalCode: emp.postalCode || '',
        role: emp.role || 'USER',
        isActive: emp.isActive ?? true,
        employeeId: emp.employeeId || '',
        department: emp.department || '',
        position: emp.position || '',
        startDate: emp.startDate ? emp.startDate.split('T')[0] : '',
        endDate: emp.endDate ? emp.endDate.split('T')[0] : '',
        contractType: emp.contractType || '',
        workHoursPerWeek: emp.workHoursPerWeek?.toString() || '',
        hoursPerWeek: emp.hoursPerWeek?.toString() || '',
        hourlyRate: emp.hourlyRate?.toString() || '',
        costCenter: emp.costCenter || '',
        workLocation: emp.workLocation || '',
        remoteWorkAllowed: emp.remoteWorkAllowed || false,
        bankAccountNumber: emp.bankAccountNumber || '',
        bankAccountName: emp.bankAccountName || '',
        bsnNumber: emp.bsnNumber || '',
        emergencyContact: emp.emergencyContact || '',
        emergencyPhone: emp.emergencyPhone || '',
        emergencyRelationship: emp.emergencyRelationship || '',
        skills: emp.skills || [],
        certifications: emp.certifications || [],
        educationLevel: emp.educationLevel || '',
        languages: emp.languages || [],
        notes: emp.notes || '',
        vehicleIds: emp.vehicleMappings?.map((v: { id: string }) => v.id) || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsLoading(false);
    }
  }, [resolvedParams.id]);

  // Fetch available vehicles
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await fetch('/api/employees/vehicles');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchEmployee();
      fetchVehicles();
    }
  }, [session, fetchEmployee, fetchVehicles]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle vehicle selection toggle
  const handleVehicleToggle = (vehicleId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleIds: prev.vehicleIds.includes(vehicleId)
        ? prev.vehicleIds.filter(id => id !== vehicleId)
        : [...prev.vehicleIds, vehicleId],
    }));
  };

  // Handle skill/certification/language array fields
  const handleArrayField = (field: 'skills' | 'certifications' | 'languages', value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageEmployees) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/employees/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij opslaan');
      }

      setSuccess('Werknemer succesvol bijgewerkt');

      // Redirect after short delay
      setTimeout(() => {
        router.push('/employees');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: 'personal',
      label: 'Persoonlijk',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      key: 'employment',
      label: 'Dienstverband',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      key: 'emergency',
      label: 'Noodcontact',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      key: 'skills',
      label: 'Vaardigheden',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      key: 'fleet',
      label: 'Voertuigen',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
  ];

  if (!canManageEmployees) {
    return (
      <div className="p-6">
        <div className="backdrop-blur-xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-800 dark:text-red-300">U heeft geen rechten om werknemers te bewerken.</p>
          <Link href="/employees" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
            Terug naar werknemers
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="p-6">
        <div className="backdrop-blur-xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-800 dark:text-red-300">{error}</p>
          <Link href="/employees" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
            Terug naar werknemers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className="p-2 rounded-lg hover:bg-purple-500/10 transition-colors"
            title="Terug naar werknemers"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-4 flex-1">
            {employee?.image ? (
              <Image
                src={employee.image}
                alt=""
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover border-2 border-white/20 dark:border-purple-500/30"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-white/20 dark:border-purple-500/30">
                <span className="text-white font-bold text-xl">
                  {employee?.name?.charAt(0) || employee?.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {employee?.name || 'Werknemer bewerken'}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{employee?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
      {success && (
        <div className="backdrop-blur-sm bg-green-500/10 dark:bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-green-800 dark:text-green-300">{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="border-b border-white/20 dark:border-purple-500/20">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 md:p-6">
            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Persoonlijke gegevens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefoon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geboortedatum</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Geslacht</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecteer</option>
                      <option value="M">Man</option>
                      <option value="V">Vrouw</option>
                      <option value="X">Anders</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationaliteit</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Burgerlijke staat</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecteer</option>
                      <option value="single">Ongehuwd</option>
                      <option value="married">Gehuwd</option>
                      <option value="partnership">Geregistreerd partnerschap</option>
                      <option value="divorced">Gescheiden</option>
                      <option value="widowed">Weduwe/Weduwnaar</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8">Adres</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Straat + huisnummer</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postcode</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plaats</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-8">Bank & Identificatie</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN</label>
                    <input
                      type="text"
                      name="bankAccountNumber"
                      value={formData.bankAccountNumber}
                      onChange={handleChange}
                      placeholder="NL00 BANK 0000 0000 00"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam rekeninghouder</label>
                    <input
                      type="text"
                      name="bankAccountName"
                      value={formData.bankAccountName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">BSN</label>
                    <input
                      type="text"
                      name="bsnNumber"
                      value={formData.bsnNumber}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Dienstverband</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personeelsnummer</label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="USER">Medewerker</option>
                      <option value="MANAGER">Manager</option>
                      <option value="TENANT_ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Afdeling</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Functie</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Einddatum</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contracttype</label>
                    <select
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecteer</option>
                      <option value="FULLTIME">Fulltime</option>
                      <option value="PARTTIME">Parttime</option>
                      <option value="FLEX">Flex</option>
                      <option value="TEMPORARY">Tijdelijk</option>
                      <option value="INTERN">Stagiair</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uren per week</label>
                    <input
                      type="number"
                      name="hoursPerWeek"
                      value={formData.hoursPerWeek}
                      onChange={handleChange}
                      min="0"
                      max="60"
                      step="0.5"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uurloon (€)</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kostenplaats</label>
                    <input
                      type="text"
                      name="costCenter"
                      value={formData.costCenter}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Werklocatie</label>
                    <input
                      type="text"
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="remoteWorkAllowed"
                      id="remoteWorkAllowed"
                      checked={formData.remoteWorkAllowed}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="remoteWorkAllowed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Thuiswerken toegestaan
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isActive"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Actief
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Tab */}
            {activeTab === 'emergency' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Noodcontact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam contactpersoon</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefoonnummer</label>
                    <input
                      type="tel"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relatie</label>
                    <select
                      name="emergencyRelationship"
                      value={formData.emergencyRelationship}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecteer</option>
                      <option value="partner">Partner</option>
                      <option value="parent">Ouder</option>
                      <option value="child">Kind</option>
                      <option value="sibling">Broer/Zus</option>
                      <option value="friend">Vriend(in)</option>
                      <option value="other">Anders</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vaardigheden & Kwalificaties</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vaardigheden <span className="text-gray-500">(komma-gescheiden)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.skills.join(', ')}
                      onChange={(e) => handleArrayField('skills', e.target.value)}
                      placeholder="bijv. Excel, Python, Projectmanagement"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Certificaten <span className="text-gray-500">(komma-gescheiden)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.certifications.join(', ')}
                      onChange={(e) => handleArrayField('certifications', e.target.value)}
                      placeholder="bijv. VCA, EHBO, Rijbewijs C"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                    {formData.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.certifications.map((cert, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opleidingsniveau</label>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Selecteer</option>
                      <option value="vmbo">VMBO</option>
                      <option value="havo">HAVO</option>
                      <option value="vwo">VWO</option>
                      <option value="mbo">MBO</option>
                      <option value="hbo">HBO</option>
                      <option value="wo">WO</option>
                      <option value="phd">PhD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Talen <span className="text-gray-500">(komma-gescheiden)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.languages.join(', ')}
                      onChange={(e) => handleArrayField('languages', e.target.value)}
                      placeholder="bijv. Nederlands, Engels, Duits"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    />
                    {formData.languages.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.languages.map((lang, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notities</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                      placeholder="Eventuele opmerkingen..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fleet Tab */}
            {activeTab === 'fleet' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Voertuigen</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Koppel voertuigen aan deze medewerker voor rittenregistratie
                    </p>
                  </div>
                  <Link
                    href="/settings/fleet"
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Fleet instellingen →
                  </Link>
                </div>

                {vehicles.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400">Geen voertuigen geconfigureerd</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Configureer eerst een fleet provider in de instellingen
                    </p>
                    <Link
                      href="/settings/fleet"
                      className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Fleet configureren
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.vehicleIds.length} voertuig(en) geselecteerd
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vehicles.map((vehicle) => {
                        const isSelected = formData.vehicleIds.includes(vehicle.id);
                        const isAssignedToOther = vehicle.employeeId && vehicle.employeeId !== employee?.employeeRecordId;

                        return (
                          <div
                            key={vehicle.id}
                            onClick={() => !isAssignedToOther && handleVehicleToggle(vehicle.id)}
                            className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10'
                                : isAssignedToOther
                                ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500/50'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isSelected ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                              }`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {vehicle.registration}
                                </div>
                                {vehicle.vehicleName && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {vehicle.vehicleName}
                                  </div>
                                )}
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {vehicle.providerType}
                                </div>
                              </div>
                            </div>

                            {isAssignedToOther && (
                              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                Toegewezen aan: {vehicle.employeeName}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with save button */}
          <div className="border-t border-white/20 dark:border-purple-500/20 px-4 py-4 md:px-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Link
              href="/employees"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              Annuleren
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? 'Opslaan...' : 'Opslaan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
