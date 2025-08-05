"use client";

// import { useState } from "react"; // Not needed yet
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">ADS Personeelsapp</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <ThemeSwitcher />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {session?.user?.name} ({session?.user?.role})
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
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