'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

export default function EmployeesPage() {
  const { data: session } = useSession();
  
  // Session will be used for role-based access control
  console.log('Employee management session:', session?.user?.role);
  
  // User permissions will be checked when implementing actions
  // const canManageEmployees = session?.user?.role === 'TENANT_ADMIN' || session?.user?.role === 'MANAGER';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const employees = [
    {
      id: 1,
      name: 'Jan de Vries',
      email: 'jan.devries@ckw.nl',
      department: 'IT',
      position: 'Developer',
      phone: '+31 6 12345678',
      status: 'Actief'
    },
    {
      id: 2,
      name: 'Maria Janssen',
      email: 'maria.janssen@ckw.nl',
      department: 'HR',
      position: 'HR Manager',
      phone: '+31 6 87654321',
      status: 'Actief'
    },
    {
      id: 3,
      name: 'Piet van der Berg',
      email: 'piet.vandenberg@ckw.nl',
      department: 'Finance',
      position: 'Accountant',
      phone: '+31 6 11223344',
      status: 'Verlof'
    },
    {
      id: 4,
      name: 'Lisa de Jong',
      email: 'lisa.dejong@ckw.nl',
      department: 'IT',
      position: 'System Administrator',
      phone: '+31 6 55667788',
      status: 'Actief'
    },
    {
      id: 5,
      name: 'Tom Bakker',
      email: 'tom.bakker@ckw.nl',
      department: 'Operations',
      position: 'Operations Manager',
      phone: '+31 6 99887766',
      status: 'Ziek'
    }
  ];

  const departments = ['all', 'IT', 'HR', 'Finance', 'Operations'];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Actief':
        return 'bg-green-100 text-green-800';
      case 'Verlof':
        return 'bg-yellow-100 text-yellow-800';
      case 'Ziek':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Werknemers</h1>
        <p className="text-gray-600">Overzicht van alle medewerkers</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Zoek op naam, email of functie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Zoek medewerkers op naam, email of functie"
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            aria-label="Filter medewerkers op afdeling"
            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Alle afdelingen</option>
            {departments.slice(1).map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Nieuwe Medewerker
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Totaal</h3>
          <div className="text-3xl font-bold text-blue-600">{employees.length}</div>
          <p className="text-sm text-gray-500">Medewerkers</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Actief</h3>
          <div className="text-3xl font-bold text-green-600">
            {employees.filter(e => e.status === 'Actief').length}
          </div>
          <p className="text-sm text-gray-500">Aanwezig</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Verlof</h3>
          <div className="text-3xl font-bold text-yellow-600">
            {employees.filter(e => e.status === 'Verlof').length}
          </div>
          <p className="text-sm text-gray-500">Op vakantie</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ziek</h3>
          <div className="text-3xl font-bold text-red-600">
            {employees.filter(e => e.status === 'Ziek').length}
          </div>
          <p className="text-sm text-gray-500">Ziekgemeld</p>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Medewerkers ({filteredEmployees.length})
          </h3>
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Naam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Afdeling
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Functie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          Bekijken
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          Bewerken
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Deactiveren
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
