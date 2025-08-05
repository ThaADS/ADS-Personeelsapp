"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  console.log("🔥 LOGIN PAGE COMPONENT LOADED!");
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Simple translation function for now
  const t = (key: string, fallback: string) => fallback;

  const handleLogin = async () => {
    console.log("🚀 BUTTON CLICKED - Starting login process");
    
    if (!email || !password) {
      console.log("❌ Missing credentials");
      setError(t('auth.loginError', 'Vul alle velden in'));
      return;
    }
    
    setIsLoading(true);
    setError("");
    console.log("🚀 Attempting login with:", { email, password: "***" });
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard"
      });
      
      console.log("✅ SignIn result:", result);
      
      if (result?.error) {
        console.log("❌ Login failed:", result.error);
        setError("Ongeldige inloggegevens");
        setIsLoading(false);
        return;
      }
      
      if (result?.ok) {
        console.log("🎉 Login successful! Redirecting...");
        // Wait a moment for the session to be established
        setTimeout(() => {
          router.push("/timesheet");
        }, 100);
        return;
      }
      
      console.log("⚠️ Unexpected result:", result);
      setError(t('auth.loginError', 'Login mislukt'));
      setIsLoading(false);
      
    } catch (error) {
      console.log("💥 Login error:", error);
      setError(t('common.error', 'Er ging iets mis'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ADS Personeelsapp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Log in om toegang te krijgen tot uw dashboard
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('auth.email', 'E-mailadres')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email', 'E-mailadres')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password', 'Wachtwoord')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password', 'Wachtwoord')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
            >
              {isLoading ? t('auth.loginProgress', 'Bezig met inloggen...') : t('auth.loginButton', 'Inloggen')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
