'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { EmployeeCard } from '@/components/mobile';

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

      const data: EmployeesResponse = await response.json();
      setEmployees(data.employees);
      setDepartments(data.filters.departments);
      setPagination(data.pagination);
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
    router.push(`/employees/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/employees/${id}/edit`);
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
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Werknemers</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overzicht van alle medewerkers</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter toggle - mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 min-h-[44px]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {canManageEmployees && (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] text-sm font-medium">
                + Nieuw
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filters - collapsible on mobile */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
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
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Totaal</h3>
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400">{pagination.total}</div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Medewerkers</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Actief</h3>
          <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            {employees.filter(e => e.isActive).length}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">In dienst</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Afdelingen</h3>
          <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400">
            {departments.length}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Uniek</p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
          <h3 className="text-sm md:text-lg font-medium text-gray-900 dark:text-white mb-1 md:mb-2">Getoond</h3>
          <div className="text-2xl md:text-3xl font-bold text-gray-600 dark:text-gray-400">
            {employees.length}
          </div>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">In filter</p>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-700">
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
            {/* Mobile Card View */}
            <div className="block md:hidden p-4 space-y-3">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  canManage={canManageEmployees}
                  onView={handleView}
                  onEdit={canManageEmployees ? handleEdit : undefined}
                />
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Naam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Afdeling
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Functie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Rol
                    </th>
                    {canManageEmployees && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        Acties
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {employee.image ? (
                            <img
                              src={employee.image}
                              alt=""
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                              <span className="text-white font-medium">
                                {employee.name?.charAt(0) || employee.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {employee.name || 'Geen naam'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</div>
                            {employee.employeeId && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">#{employee.employeeId}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {employee.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{employee.position || '-'}</div>
                        {employee.startDate && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Sinds {formatDate(employee.startDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {employee.phone ? (
                          <a href={`tel:${employee.phone}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                            {employee.phone}
                          </a>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                          {getRoleLabel(employee.role)}
                        </span>
                      </td>
                      {canManageEmployees && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(employee.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 min-h-[44px] px-2"
                            >
                              Bekijken
                            </button>
                            <button
                              onClick={() => handleEdit(employee.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 min-h-[44px] px-2"
                            >
                              Bewerken
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 min-h-[44px]"
                >
                  Vorige
                </button>
                <button
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
    </div>
  );
}
