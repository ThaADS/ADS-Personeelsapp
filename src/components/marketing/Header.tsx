"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/marketing", label: "Home" },
  { href: "/marketing/features", label: "Functies" },
  { href: "/marketing/pricing", label: "Prijzen" },
  { href: "/marketing/security", label: "Beveiliging" },
  { href: "/marketing/faq", label: "FAQ" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/marketing" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">A</span>
          <span className="font-bold text-black dark:text-white">ADS Personeelsapp</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${pathname === item.href ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 font-semibold hover:text-blue-600 dark:hover:text-blue-400">
            Inloggen
          </Link>
          <Link href="/login" className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            Aan de slag
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href
                    ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-2 border-t border-gray-200 dark:border-gray-700 mt-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Inloggen
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block mt-2 mx-3 text-center rounded bg-blue-600 px-4 py-2 text-base font-bold text-white hover:bg-blue-700"
              >
                Aan de slag
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
