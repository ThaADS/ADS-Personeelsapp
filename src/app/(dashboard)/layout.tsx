"use client";

import { useState, useCallback, lazy, Suspense } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  useKeyboardShortcuts,
  KeyboardShortcutsDialog,
  KeySequenceIndicator,
} from "@/components/ui/keyboard-shortcuts";

// Lazy load the chatbot component for better initial page load performance
const FAQChatbot = lazy(() => import("@/components/chat/FAQChatbot"));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showDialog, setShowDialog, currentSequence } = useKeyboardShortcuts();

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    setMobileMenuOpen(false);
    try {
      await signOut({ callbackUrl: '/login', redirect: true });
    } catch {
      setIsLoggingOut(false);
    }
  }, []);

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', current: pathname === '/dashboard' },
      { name: 'Tijdregistratie', href: '/timesheet', current: pathname === '/timesheet' },
      { name: 'Verlof', href: '/vacation', current: pathname === '/vacation' },
      { name: 'Ziekmelding', href: '/sick-leave', current: pathname === '/sick-leave' },
      { name: 'Profiel', href: '/profile', current: pathname === '/profile' },
      { name: 'Hulp', href: '/help', current: pathname === '/help' },
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
      <nav className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/60 shadow-lg dark:shadow-glass border-b border-white/20 dark:border-purple-500/20 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ADSPersoneelapp
                </h1>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-2 xl:space-x-4">
                {getNavigationItems().map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      item.current
                        ? 'border-purple-500 text-purple-700 dark:text-white font-semibold bg-purple-50 dark:bg-white/5'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-purple-700 dark:hover:text-white hover:border-purple-400/50 hover:bg-purple-50 dark:hover:bg-white/5 font-medium'
                    } inline-flex items-center px-2 xl:px-3 pt-1 border-b-2 text-xs lg:text-sm transition-all duration-200 rounded-t-lg whitespace-nowrap max-w-[120px] xl:max-w-none truncate`}
                    title={item.name}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden lg:ml-6 lg:flex lg:items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowDialog(true)}
                    className="hidden xl:flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-white/10 rounded-md border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all"
                    title="Sneltoetsen (druk op ?)"
                  >
                    <kbd className="font-mono">?</kbd>
                    <span>Sneltoetsen</span>
                  </button>
                  <ThemeToggle />
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium hidden xl:inline max-w-[200px] truncate" title={`${session?.user?.name} (${session?.user?.role})`}>
                    {session?.user?.name} <span className="text-purple-600 dark:text-purple-400">({session?.user?.role})</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] flex items-center justify-center"
                  >
                    {isLoggingOut ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Bezig...
                      </>
                    ) : (
                      'Uitloggen'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet hamburger button - visible on screens smaller than lg */}
            <div className="lg:hidden flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-white/10 focus:outline-none transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label="Open menu"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Menu Dropdown - visible on screens smaller than lg */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/20 dark:border-purple-500/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl max-h-[70vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {getNavigationItems().map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors truncate ${
                    item.current
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-white/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* User info and logout */}
              <div className="pt-4 pb-2 border-t border-gray-200 dark:border-white/10 mt-4">
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 truncate">
                  Ingelogd als: <span className="font-medium text-gray-900 dark:text-white truncate">{session?.user?.name}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium truncate max-w-full">
                    {session?.user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoggingOut ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Bezig...
                    </>
                  ) : (
                    'Uitloggen'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile bottom bar - only on small screens, hidden on tablets and up */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-white/20 dark:border-purple-500/20 px-2 py-2 shadow-glass safe-area-inset-bottom">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center flex-1 min-w-0 overflow-x-auto scrollbar-hide gap-1">
            {getNavigationItems().slice(0, 4).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    : 'text-gray-600 dark:text-gray-400'
                } px-2 py-2 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors flex-shrink-0 max-w-[72px] truncate text-center`}
                title={item.name}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-20 sm:pb-6 lg:pb-6">
        {children}
      </main>

      {/* FAQ Chatbot - Lazy loaded for better performance */}
      <Suspense fallback={null}>
        <FAQChatbot />
      </Suspense>

      {/* Keyboard Shortcuts */}
      <KeyboardShortcutsDialog isOpen={showDialog} onClose={() => setShowDialog(false)} />
      <KeySequenceIndicator sequence={currentSequence} />
    </div>
  );
}