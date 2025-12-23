"use client";

// import { useState } from "react"; // Not needed yet
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  // Mobile menu state removed - not currently implemented

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/timesheet', current: pathname === '/timesheet' },
      { name: 'Tijdregistratie', href: '/timesheet', current: pathname === '/timesheet' },
      { name: 'Verlof', href: '/vacation', current: pathname === '/vacation' },
      { name: 'Ziekmelding', href: '/sick-leave', current: pathname === '/sick-leave' },
      { name: 'Profiel', href: '/profile', current: pathname === '/profile' },
    ];

    // Add manager/admin specific items
    if (session?.user?.role === 'MANAGER' || session?.user?.role === 'TENANT_ADMIN') {
      baseItems.splice(1, 0, 
        { name: 'Medewerkers', href: '/employees', current: pathname === '/employees' },
        { name: 'Goedkeuringen', href: '/approvals', current: pathname === '/approvals' }
      );
    }

    // Add admin specific items
    if (session?.user?.role === 'TENANT_ADMIN') {
      baseItems.push(
        { name: 'Instellingen', href: '/settings', current: pathname === '/settings' }
      );
    }

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-black">ADS Personeelsapp</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-600 text-blue-600 font-semibold'
                        : 'border-transparent text-black hover:text-blue-600 hover:border-blue-300 font-medium'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-black font-medium">
                    {session?.user?.name} ({session?.user?.role})
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Uitloggen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}