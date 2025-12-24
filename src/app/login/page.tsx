"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LockClosedIcon, UserIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  const t = (key: string, fallback: string) => fallback;

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('auth.loginError', 'Vul alle velden in'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      });

      if (result?.error) {
        setError("Ongeldige inloggegevens");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        setTimeout(() => {
          router.push("/dashboard");
        }, 100);
        return;
      }

      setError(t('auth.loginError', 'Login mislukt'));
      setIsLoading(false);

    } catch (error) {
      setError(t('common.error', 'Er ging iets mis'));
      setIsLoading(false);
    }
  };

  const fillCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setShowTestAccounts(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full">
          {/* Logo and header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg">
              <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
              ADS Personeelsapp
            </h2>
            <p className="text-white">
              Welkom terug! Log in om door te gaan
            </p>
          </div>

          {/* Login card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="space-y-6">
              {/* Email input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  E-mailadres
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="naam@bedrijf.nl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Wachtwoord
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-white/20 rounded-xl bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Login button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Bezig met inloggen...
                  </>
                ) : (
                  <>
                    Inloggen
                    <ChevronRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              {/* Test accounts toggle */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowTestAccounts(!showTestAccounts)}
                  className="w-full text-sm text-white hover:text-purple-300 transition-colors flex items-center justify-center group"
                >
                  <span className="group-hover:underline">
                    {showTestAccounts ? 'Verberg testaccounts' : 'Toon testaccounts voor demo'}
                  </span>
                  <ChevronRightIcon className={`ml-1 h-4 w-4 transition-transform ${showTestAccounts ? 'rotate-90' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Test accounts panel */}
          {showTestAccounts && (
            <div className="mt-4 backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-6 animate-in slide-in-from-top-2 duration-300">
              <h3 className="text-lg font-semibold text-white mb-4">Demo Accounts</h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => fillCredentials('superuser@ads-personeelsapp.nl', 'SuperAdmin123!')}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">Super Admin</div>
                      <div className="text-xs text-gray-400 mt-1">Volledige toegang tot alle tenants</div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('admin@demo-company.nl', 'Admin123!')}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">Tenant Admin</div>
                      <div className="text-xs text-gray-400 mt-1">Beheerder van Demo Company</div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('manager@demo-company.nl', 'Manager123!')}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">Manager</div>
                      <div className="text-xs text-gray-400 mt-1">Goedkeuren van uren en verlof</div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => fillCredentials('gebruiker@demo-company.nl', 'Gebruiker123!')}
                  className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white group-hover:text-purple-300 transition-colors">Medewerker</div>
                      <div className="text-xs text-gray-400 mt-1">Basis gebruikersrechten</div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-white/60">
              © 2025 ADS Personeelsapp. Professioneel HR-beheer voor moderne organisaties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
