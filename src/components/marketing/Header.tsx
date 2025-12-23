"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/marketing", label: "Home" },
  { href: "/marketing/features", label: "Functies" },
  { href: "/marketing/pricing", label: "Prijzen" },
  { href: "/marketing/security", label: "Beveiliging" },
  { href: "/marketing/faq", label: "FAQ" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/marketing" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white font-bold">A</span>
          <span className="font-bold text-black">ADS Personeelsapp</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm ${pathname === item.href ? "text-black font-bold" : "text-black font-semibold"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-block px-4 py-2 text-sm text-black font-semibold hover:underline">Inloggen</Link>
          <Link href="/login" className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
            Aan de slag
          </Link>
        </div>
      </div>
    </header>
  );
}
