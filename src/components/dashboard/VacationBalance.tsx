"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface VacationBalanceData {
  total: number;
  used: number;
  pending: number;
  remaining: number;
}

export function VacationBalance() {
  const [balance, setBalance] = useState<VacationBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/vacation-balance");
        if (!response.ok) {
          throw new Error("Kon verlof saldo niet ophalen");
        }
        const data = await response.json();
        setBalance(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Onbekende fout");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="text-center text-red-500 dark:text-red-400">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!balance) return null;

  const usedPercentage = (balance.used / balance.total) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <span className="text-2xl mr-2">🏖️</span>
          Verlof Saldo
        </h3>
        <Link
          href="/vacation"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Aanvragen →
        </Link>
      </div>

      {/* Main Balance */}
      <div className="text-center mb-6">
        <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-1">
          {balance.remaining}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">dagen beschikbaar</div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Gebruikt: {balance.used}</span>
          <span>Totaal: {balance.total}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2">
          <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
            {balance.used}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Gebruikt</div>
        </div>
        <div className="bg-pink-50 dark:bg-pink-900/30 rounded-lg p-2">
          <div className="text-lg font-semibold text-pink-600 dark:text-pink-400">
            {balance.pending}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Aangevraagd</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {balance.remaining}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Resterend</div>
        </div>
      </div>
    </div>
  );
}
