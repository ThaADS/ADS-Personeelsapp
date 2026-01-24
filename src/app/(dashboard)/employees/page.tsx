'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { EmployeeDetailModal } from '@/components/employees/EmployeeDetailModal';

// View mode type
type ViewMode = 'list' | 'grid';

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
  // Additional personal details
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  maritalStatus: string | null;
  // Address
  address: string | null;
  city: string | null;
  postalCode: string | null;
  // Emergency contact
  emergencyContact: string | null;
  emergencyPhone: string | null;
  emergencyRelationship: string | null;
  // Employment details
  hoursPerWeek: number | null;
  costCenter: string | null;
  endDate: string | null;
  // Skills and qualifications
  skills: string[];
  certifications: string[];
  educationLevel: string | null;
  languages: string[];
  // Work preferences
  remoteWorkAllowed: boolean;
  workLocation: string | null;
  // Notes
  notes: string | null;
}

interface EmployeesResponse {
  employees: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filters: {
    departments: string[];
    roles: string[];
  };
}

export default function EmployeesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, totalPages: 1 });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const canManageEmployees = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'MANAGER';

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDepartment !== 'all') params.append('department', selectedDepartment);
      params.append('page', pagination.page.toString());

      const response = await fetch(`/api/employees?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Fout bij ophalen werknemers');
      }

      const result = await response.json();
      // Handle both wrapped (success/data) and direct response formats
      const data: EmployeesResponse = result.data || result;
      setEmployees(data.employees || []);
      setDepartments(data.filters?.departments || []);
      setPagination(data.pagination || { total: 0, page: 1, limit: 50, totalPages: 1 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Onbekende fout');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedDepartment, pagination.page]);

  useEffect(() => {
    if (session) {
      fetchEmployees();
    }
  }, [session, fetchEmployees]);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (session) {
        fetchEmployees();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedDepartment, session, fetchEmployees]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TENANT_ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'USER':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TENANT_ADMIN':
        return 'Admin';
      case 'MANAGER':
        return 'Manager';
      case 'USER':
        return 'Medewerker';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const handleView = (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (employee) {
      setSelectedEmployee(employee);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/employees/${id}/edit`);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  if (isLoading && employees.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Werknemers</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overzicht van alle medewerkers</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode switcher */}
            <div className="hidden md:flex items-center backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-purple-500/30 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'}`}
                title="Lijstweergave"
                aria-label="Lijstweergave"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'}`}
                title="Gridweergave"
                aria-label="Gridweergave"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            {/* Filter toggle - mobile */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden inline-flex items-center px-3 py-2 border border-purple-500/30 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 backdrop-blur-sm bg-white/50 dark:bg-white/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 min-h-[44px] transition-colors"
              title="Filters tonen/verbergen"
              aria-label="Filters tonen/verbergen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {/* View mode switcher - mobile */}
            <div className="md:hidden flex items-center backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-purple-500/30 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                title="Lijstweergave"
                aria-label="Lijstweergave"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400'}`}
                title="Gridweergave"
                aria-label="Gridweergave"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
            {canManageEmployees && (
              <Link
                href="/employees/new"
                className="hidden md:inline-flex bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] text-sm font-medium transition-all duration-200 items-center"
                title="Nieuwe medewerker toevoegen"
              >
                + Nieuw
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filters - collapsible on mobile */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Zoek op naam, email of personeelsnummer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
              />
            </div>
            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full md:w-auto border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[44px]"
                title="Filter op afdeling"
                aria-label="Filter op afdeling"
              >
                <option value="all">Alle afdelingen</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Totaal</h3>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{pagination.total}</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Medewerkers</p>
        </div>
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Actief</h3>
          <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            {employees.filter(e => e.isActive).length}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">In dienst</p>
        </div>
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Afdelingen</h3>
          <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
            {departments.length}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Uniek</p>
        </div>
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 md:mb-2">Getoond</h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-400">
            {employees.length}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">In filter</p>
        </div>
      </div>

      {/* Employee List */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="px-4 py-5 border-b border-white/20 dark:border-purple-500/20">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Medewerkers ({employees.length})
          </h3>
        </div>

        {employees.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>Geen medewerkers gevonden.</p>
            {(searchTerm || selectedDepartment !== 'all') && (
              <p className="text-sm mt-2">Probeer een andere zoekopdracht of filter.</p>
            )}
          </div>
        ) : (
          <>
            {/* List View */}
            {viewMode === 'list' && (
              <div className="divide-y divide-white/10 dark:divide-purple-500/20">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => handleView(employee.id)}
                    className="flex items-center justify-between p-4 hover:bg-purple-500/5 dark:hover:bg-purple-500/10 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {employee.image ? (
                        <Image
                          src={employee.image}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover border-2 border-white/20 dark:border-purple-500/30 flex-shrink-0"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 border-2 border-white/20 dark:border-purple-500/30">
                          <span className="text-white font-bold text-lg">
                            {employee.name?.charAt(0) || employee.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-base font-bold text-gray-900 dark:text-white truncate">
                          {employee.name || 'Geen naam'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {employee.position || employee.department || getRoleLabel(employee.role)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Status indicator */}
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${employee.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className={`text-sm font-medium ${employee.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                          {employee.isActive ? 'Actief' : 'Inactief'}
                        </span>
                      </div>
                      {/* Chevron */}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    className="backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-white/20 dark:border-purple-500/20 rounded-2xl p-4 hover:shadow-lg transition-all"
                  >
                    {/* Avatar & Status */}
                    <div className="flex flex-col items-center text-center mb-3">
                      {employee.image ? (
                        <Image
                          src={employee.image}
                          alt=""
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-full object-cover border-2 border-white/30 dark:border-purple-500/30 mb-2"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-2 border-2 border-white/30 dark:border-purple-500/30">
                          <span className="text-white font-bold text-xl">
                            {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || employee.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate w-full">
                        {employee.name || 'Geen naam'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full">
                        {employee.position || getRoleLabel(employee.role)}
                      </p>
                      {employee.department && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate w-full">
                          {employee.department}
                        </p>
                      )}
                      {/* Status badge */}
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${employee.isActive ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${employee.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {employee.isActive ? 'Actief' : 'Inactief'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(employee.id)}
                        className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold transition-colors min-h-[36px]"
                      >
                        Bekijken
                      </button>
                      {canManageEmployees && (
                        <button
                          type="button"
                          onClick={() => handleEdit(employee.id)}
                          className="flex-1 px-3 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-xs font-semibold transition-colors min-h-[36px]"
                        >
                          Bewerken
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pagina {pagination.page} van {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 min-h-[44px]"
                >
                  Vorige
                </button>
                <button
                  type="button"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 min-h-[44px]"
                >
                  Volgende
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FAB Button - Mobile only */}
      {canManageEmployees && (
        <Link
          href="/employees/new"
          className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
          title="Nieuwe medewerker toevoegen"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          canManage={canManageEmployees}
          onClose={closeModal}
          onEdit={() => {
            closeModal();
            handleEdit(selectedEmployee.id);
          }}
          getRoleLabel={getRoleLabel}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}
