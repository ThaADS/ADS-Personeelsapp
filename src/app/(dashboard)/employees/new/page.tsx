'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

type WizardStep = 'account' | 'personal' | 'employment' | 'fleet' | 'review';

const STEPS: { key: WizardStep; label: string; description: string }[] = [
  { key: 'account', label: 'Account', description: 'Login gegevens' },
  { key: 'personal', label: 'Persoonlijk', description: 'Persoonlijke gegevens' },
  { key: 'employment', label: 'Dienstverband', description: 'Werk informatie' },
  { key: 'fleet', label: 'Voertuigen', description: 'Fleet koppeling' },
  { key: 'review', label: 'Controleren', description: 'Overzicht & bevestigen' },
];

export default function NewEmployeePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState<WizardStep>('account');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    // Account
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'USER',
    locale: 'nl',
    // Personal
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Nederlands',
    maritalStatus: '',
    address: '',
    city: '',
    postalCode: '',
    // Bank/ID
    bankAccountNumber: '',
    bankAccountName: '',
    bsnNumber: '',
    // Employment
    employeeId: '',
    department: '',
    position: '',
    startDate: new Date().toISOString().split('T')[0],
    contractType: 'FULLTIME',
    hoursPerWeek: '40',
    hourlyRate: '',
    costCenter: '',
    workLocation: '',
    remoteWorkAllowed: false,
    // Emergency
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    // Skills
    skills: [] as string[],
    certifications: [] as string[],
    educationLevel: '',
    languages: ['Nederlands'] as string[],
    // Fleet
    vehicleIds: [] as string[],
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canManageEmployees = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'MANAGER';

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
      fetchVehicles();
    }
  }, [session, fetchVehicles]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
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

  // Handle array field
  const handleArrayField = (field: 'skills' | 'certifications' | 'languages', value: string) => {
    const items = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({
      ...prev,
      [field]: items,
    }));
  };

  // Validate current step
  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'account':
        if (!formData.email) newErrors.email = 'E-mail is verplicht';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Ongeldig e-mailadres';
        }
        if (!formData.name) newErrors.name = 'Naam is verplicht';
        if (!formData.password) newErrors.password = 'Wachtwoord is verplicht';
        else if (formData.password.length < 8) {
          newErrors.password = 'Wachtwoord moet minimaal 8 tekens zijn';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
        }
        break;

      case 'personal':
        // Phone is optional but validate format if provided
        if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
          newErrors.phone = 'Ongeldig telefoonnummer';
        }
        break;

      case 'employment':
        if (!formData.startDate) newErrors.startDate = 'Startdatum is verplicht';
        if (!formData.contractType) newErrors.contractType = 'Contracttype is verplicht';
        break;

      case 'fleet':
        // No required fields
        break;

      case 'review':
        // Final validation - no additional checks
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      const currentIndex = STEPS.findIndex(s => s.key === currentStep);
      if (currentIndex < STEPS.length - 1) {
        setCurrentStep(STEPS[currentIndex + 1].key);
      }
    }
  };

  // Navigate to previous step
  const prevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep('review')) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fout bij aanmaken werknemer');
      }

      router.push('/employees?success=created');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.key === currentStep);

  if (!canManageEmployees) {
    return (
      <div className="p-6">
        <div className="backdrop-blur-xl bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <p className="text-red-800 dark:text-red-300">U heeft geen rechten om werknemers toe te voegen.</p>
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
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Nieuwe medewerker
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Onboarding wizard</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 hidden sm:block" style={{ left: '10%', right: '10%' }}></div>
          <div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 hidden sm:block transition-all duration-300"
            style={{ left: '10%', width: `${(currentStepIndex / (STEPS.length - 1)) * 80}%` }}
          ></div>

          {STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = step.key === currentStep;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.key)}
                  disabled={index > currentStepIndex}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    isCompleted
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : isCurrent
                      ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 ring-2 ring-purple-500'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  } ${index <= currentStepIndex ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </button>
                <span className={`mt-2 text-xs font-medium hidden sm:block ${
                  isCurrent ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="border-b border-white/20 dark:border-purple-500/20 px-4 py-4 md:px-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {STEPS[currentStepIndex].label}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {STEPS[currentStepIndex].description}
          </p>
        </div>

        <div className="p-4 md:p-6">
          {/* Step 1: Account */}
          {currentStep === 'account' && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mailadres *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="medewerker@bedrijf.nl"
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Volledige naam *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jan de Vries"
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Wachtwoord *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimaal 8 tekens"
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bevestig wachtwoord *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Herhaal wachtwoord"
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Voorkeurstaal
                  </label>
                  <select
                    name="locale"
                    value={formData.locale}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="nl">Nederlands</option>
                    <option value="en">English</option>
                    <option value="de">Deutsch</option>
                    <option value="pl">Polski</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    De taal waarin de medewerker de app ziet
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal */}
          {currentStep === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefoon</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="06-12345678"
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
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
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Adres</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Straat + huisnummer</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Hoofdstraat 123"
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
                    placeholder="1234 AB"
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
                    placeholder="Amsterdam"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Noodcontact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Naam</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefoon</label>
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

          {/* Step 3: Employment */}
          {currentStep === 'employment' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Personeelsnummer</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="Bijv. EMP001"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Afdeling</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Bijv. Operations"
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
                    placeholder="Bijv. Monteur"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Startdatum *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-500">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contracttype *</label>
                  <select
                    name="contractType"
                    value={formData.contractType}
                    onChange={handleChange}
                    className={`w-full border rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 ${
                      errors.contractType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="FULLTIME">Fulltime</option>
                    <option value="PARTTIME">Parttime</option>
                    <option value="FLEX">Flex</option>
                    <option value="TEMPORARY">Tijdelijk</option>
                    <option value="INTERN">Stagiair</option>
                  </select>
                  {errors.contractType && <p className="mt-1 text-sm text-red-500">{errors.contractType}</p>}
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
                    placeholder="Bijv. Hoofdkantoor Amsterdam"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
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
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">Vaardigheden</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vaardigheden <span className="text-gray-500">(komma-gescheiden)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => handleArrayField('skills', e.target.value)}
                    placeholder="bijv. Excel, Python"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certificaten <span className="text-gray-500">(komma-gescheiden)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.certifications.join(', ')}
                    onChange={(e) => handleArrayField('certifications', e.target.value)}
                    placeholder="bijv. VCA, EHBO"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Fleet */}
          {currentStep === 'fleet' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Koppel voertuigen aan deze medewerker voor automatische rittenregistratie
                  </p>
                </div>
                <Link
                  href="/settings/fleet"
                  className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
                >
                  Fleet instellingen →
                </Link>
              </div>

              {vehicles.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Geen voertuigen beschikbaar</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Configureer eerst een fleet provider om voertuigen te koppelen
                  </p>
                  <Link
                    href="/settings/fleet"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Fleet configureren
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                    Je kunt deze stap overslaan en later voertuigen koppelen
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formData.vehicleIds.length} voertuig(en) geselecteerd
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vehicles.map((vehicle) => {
                      const isSelected = formData.vehicleIds.includes(vehicle.id);
                      const isAssignedToOther = vehicle.employeeId !== null;

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

          {/* Step 5: Review */}
          {currentStep === 'review' && (
            <div className="space-y-6">
              <p className="text-gray-600 dark:text-gray-400">
                Controleer de gegevens voordat je de medewerker aanmaakt
              </p>

              {/* Account Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">1</span>
                  Account
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600 dark:text-gray-400">E-mail:</div>
                  <div className="text-gray-900 dark:text-white font-medium">{formData.email}</div>
                  <div className="text-gray-600 dark:text-gray-400">Naam:</div>
                  <div className="text-gray-900 dark:text-white font-medium">{formData.name}</div>
                  <div className="text-gray-600 dark:text-gray-400">Rol:</div>
                  <div className="text-gray-900 dark:text-white font-medium">
                    {formData.role === 'USER' ? 'Medewerker' : formData.role === 'MANAGER' ? 'Manager' : 'Admin'}
                  </div>
                </div>
              </div>

              {/* Personal Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">2</span>
                  Persoonlijk
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.phone && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">Telefoon:</div>
                      <div className="text-gray-900 dark:text-white">{formData.phone}</div>
                    </>
                  )}
                  {formData.address && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">Adres:</div>
                      <div className="text-gray-900 dark:text-white">
                        {formData.address}, {formData.postalCode} {formData.city}
                      </div>
                    </>
                  )}
                  {formData.emergencyContact && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">Noodcontact:</div>
                      <div className="text-gray-900 dark:text-white">{formData.emergencyContact} ({formData.emergencyPhone})</div>
                    </>
                  )}
                </div>
              </div>

              {/* Employment Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">3</span>
                  Dienstverband
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {formData.employeeId && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">Personeelsnummer:</div>
                      <div className="text-gray-900 dark:text-white">{formData.employeeId}</div>
                    </>
                  )}
                  {formData.department && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">Afdeling:</div>
                      <div className="text-gray-900 dark:text-white">{formData.department}</div>
                    </>
                  )}
                  {formData.position && (
                    <>
                      <div className="text-gray-600 dark:text-gray-400">Functie:</div>
                      <div className="text-gray-900 dark:text-white">{formData.position}</div>
                    </>
                  )}
                  <div className="text-gray-600 dark:text-gray-400">Startdatum:</div>
                  <div className="text-gray-900 dark:text-white">
                    {new Date(formData.startDate).toLocaleDateString('nl-NL')}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">Contract:</div>
                  <div className="text-gray-900 dark:text-white">
                    {formData.contractType} - {formData.hoursPerWeek} uur/week
                  </div>
                </div>
              </div>

              {/* Fleet Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">4</span>
                  Voertuigen
                </h3>
                {formData.vehicleIds.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Geen voertuigen gekoppeld</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {formData.vehicleIds.map(id => {
                      const vehicle = vehicles.find(v => v.id === id);
                      return vehicle ? (
                        <span
                          key={id}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          {vehicle.registration}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="border-t border-white/20 dark:border-purple-500/20 px-4 py-4 md:px-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Vorige
          </button>
          <div className="flex gap-3">
            <Link
              href="/employees"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              Annuleren
            </Link>
            {currentStep === 'review' ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Aanmaken...' : 'Medewerker aanmaken'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg transition-all"
              >
                Volgende
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
