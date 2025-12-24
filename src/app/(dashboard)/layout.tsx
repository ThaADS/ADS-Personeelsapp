"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
      { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
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
        { name: 'Facturatie', href: '/billing', current: pathname === '/billing' },
        { name: 'Instellingen', href: '/settings', current: pathname === '/settings' }
      );
    }

    return baseItems;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/20 dark:bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-500/20 dark:bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 dark:opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation - Glassmorphism */}
      <nav className="backdrop-blur-glass bg-white/70 dark:bg-white/5 shadow-lg dark:shadow-glass border-b border-gray-200 dark:border-white/10 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ADS Personeelsapp
                </h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-purple-500 text-purple-700 dark:text-white font-semibold bg-purple-50 dark:bg-white/5'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:border-purple-400/50 hover:bg-purple-50 dark:hover:bg-white/5 font-medium'
                    } inline-flex items-center px-3 pt-1 border-b-2 text-sm transition-all duration-200 rounded-t-lg`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <ThemeToggle />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {session?.user?.name} <span className="text-purple-600 dark:text-purple-400">({session?.user?.role})</span>
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Uitloggen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-glass bg-white/80 dark:bg-slate-900/80 border-t border-gray-200 dark:border-white/10 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {getNavigationItems().slice(0, 4).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400'
                } px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20 sm:pb-6">
        {children}
      </main>
    </div>
  );
}