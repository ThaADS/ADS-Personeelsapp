"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCardIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

// Types
interface SubscriptionData {
  tenant: {
    id: string;
    name: string;
    subscriptionStatus: string | null;
    currentPlan: string | null;
    trialEndsAt: string | null;
    stripeCustomerId: string | null;
  };
  subscription: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEnd: string | null;
    userCount: number;
    plan: {
      name: string;
      type: string;
      price: number;
      includedUsers: number;
      pricePerExtraUser: number;
    };
  } | null;
  usage: {
    activeUsers: number;
    includedUsers: number;
    extraUsers: number;
    extraUserCost: number;
    totalMonthlyPrice: number;
  };
  stripeSubscription: {
    status: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  } | null;
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  amount: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
    ACTIVE: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircleIcon, label: "Actief" },
    TRIAL: { color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400", icon: ClockIcon, label: "Proefperiode" },
    PAST_DUE: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: ExclamationTriangleIcon, label: "Betaling achterstallig" },
    UNPAID: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircleIcon, label: "Onbetaald" },
    CANCELED: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: XCircleIcon, label: "Geannuleerd" },
    FREEMIUM: { color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400", icon: SparklesIcon, label: "Gratis" },
  };

  const config = statusConfig[status] || statusConfig.FREEMIUM;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

// Subscription card component
function SubscriptionCard({ data, onManageSubscription, onUpgrade }: {
  data: SubscriptionData;
  onManageSubscription: () => void;
  onUpgrade: () => void;
}) {
  const { subscription, tenant, usage, stripeSubscription } = data;
  const isFreemium = tenant.subscriptionStatus === "FREEMIUM" || !subscription;
  const isTrial = tenant.subscriptionStatus === "TRIAL";
  const trialDaysLeft = tenant.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isFreemium ? "Gratis Plan" : subscription?.plan.name || "Standaard Plan"}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {tenant.name}
            </p>
          </div>
          <StatusBadge status={tenant.subscriptionStatus || "FREEMIUM"} />
        </div>

        {isTrial && (
          <div className="mt-4 p-4 backdrop-blur-sm bg-blue-500/10 dark:bg-blue-500/10 rounded-xl border border-blue-500/20">
            <div className="flex items-center gap-3">
              <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Proefperiode - nog {trialDaysLeft} dagen
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Eindigt op {new Date(tenant.trialEndsAt!).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {stripeSubscription?.cancelAtPeriodEnd && (
          <div className="mt-4 p-4 backdrop-blur-sm bg-yellow-500/10 dark:bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Abonnement eindigt binnenkort
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Wordt geannuleerd op {new Date(stripeSubscription.currentPeriodEnd * 1000).toLocaleDateString("nl-NL")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-xl border border-white/20 dark:border-purple-500/10">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <UserGroupIcon className="w-4 h-4" />
              <span className="text-sm">Gebruikers</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
              {usage.activeUsers}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {usage.includedUsers} inbegrepen{usage.extraUsers > 0 && `, ${usage.extraUsers} extra`}
            </p>
          </div>

          <div className="p-4 backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-xl border border-white/20 dark:border-purple-500/10">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <CreditCardIcon className="w-4 h-4" />
              <span className="text-sm">Maandelijks</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">
              €{usage.totalMonthlyPrice.toFixed(2)}
            </p>
            {usage.extraUserCost > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                incl. €{usage.extraUserCost.toFixed(2)} extra gebruikers
              </p>
            )}
          </div>
        </div>

        {subscription && (
          <div className="mt-4 p-4 backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-xl border border-white/20 dark:border-purple-500/10">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <CalendarDaysIcon className="w-4 h-4" />
              <span className="text-sm">Huidige periode</span>
            </div>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(subscription.currentPeriodStart).toLocaleDateString("nl-NL")} - {new Date(subscription.currentPeriodEnd).toLocaleDateString("nl-NL")}
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 backdrop-blur-sm bg-white/30 dark:bg-white/5 border-t border-white/20 dark:border-purple-500/20 flex gap-3">
        {isFreemium ? (
          <button
            onClick={onUpgrade}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg transition-all duration-200 font-medium min-h-[44px]"
          >
            <SparklesIcon className="w-5 h-5" />
            Upgraden naar Standaard
          </button>
        ) : (
          <>
            <button
              onClick={onManageSubscription}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg shadow-lg transition-all duration-200 font-medium min-h-[44px]"
            >
              <CreditCardIcon className="w-5 h-5" />
              Beheer Abonnement
            </button>
            <button
              onClick={onUpgrade}
              className="px-4 py-3 backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors font-medium min-h-[44px]"
            >
              Wijzigen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// Pricing card component
function PricingCard({
  name,
  price,
  yearlyPrice,
  features,
  isCurrentPlan,
  onSelect,
  interval
}: {
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  isCurrentPlan: boolean;
  onSelect: (interval: "month" | "year") => void;
  interval: "month" | "year";
}) {
  const displayPrice = interval === "year" ? yearlyPrice / 12 : price;
  const savings = interval === "year" ? Math.round(((price * 12 - yearlyPrice) / (price * 12)) * 100) : 0;

  return (
    <div className={`backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg overflow-hidden ${
      isCurrentPlan
        ? "border-2 border-purple-500 dark:border-purple-400"
        : "border border-white/20 dark:border-purple-500/20"
    }`}>
      {isCurrentPlan && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-1 text-sm font-medium">
          Huidig plan
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            €{displayPrice.toFixed(2)}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/maand</span>
        </div>
        {interval === "year" && savings > 0 && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400 font-medium">
            Bespaar {savings}% met jaarabonnement
          </p>
        )}
        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <CheckCircleIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 pb-6">
        <button
          onClick={() => onSelect(interval)}
          disabled={isCurrentPlan}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 min-h-[44px] ${
            isCurrentPlan
              ? "backdrop-blur-sm bg-gray-100/50 dark:bg-white/5 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
          }`}
        >
          {isCurrentPlan ? "Huidig plan" : "Selecteren"}
        </button>
      </div>
    </div>
  );
}

// Invoice row component
function InvoiceRow({ invoice }: { invoice: Invoice }) {
  const statusColors: Record<string, string> = {
    paid: "text-green-600 dark:text-green-400",
    open: "text-yellow-600 dark:text-yellow-400",
    draft: "text-gray-600 dark:text-gray-400",
    uncollectible: "text-red-600 dark:text-red-400",
    void: "text-gray-600 dark:text-gray-400",
  };

  const statusLabels: Record<string, string> = {
    paid: "Betaald",
    open: "Open",
    draft: "Concept",
    uncollectible: "Oninbaar",
    void: "Ongeldig",
  };

  return (
    <div className="flex items-center justify-between py-3 px-3 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 mb-2 last:mb-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 backdrop-blur-sm bg-purple-100/50 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
          <CreditCardIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {invoice.number || `Factuur #${invoice.id.slice(-8)}`}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(invoice.created * 1000).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            €{(invoice.amount / 100).toFixed(2)}
          </p>
          <p className={`text-xs font-medium ${statusColors[invoice.status] || statusColors.draft}`}>
            {statusLabels[invoice.status] || invoice.status}
          </p>
        </div>
        {invoice.hostedInvoiceUrl && (
          <a
            href={invoice.hostedInvoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );
}

// Main billing page
export default function BillingPage() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const fetchSubscriptionData = useCallback(async () => {
    try {
      const response = await fetch("/api/billing/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription data");
      }
      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      setError("Kon abonnementsgegevens niet laden");
      console.error(err);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    try {
      const response = await fetch("/api/billing/invoices");
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSubscriptionData(), fetchInvoices()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchSubscriptionData, fetchInvoices]);

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create portal session");
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError("Kon klantenportaal niet openen");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgrade = async (interval: "month" | "year") => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCount: subscriptionData?.usage.activeUsers || 3,
          interval,
        }),
      });
      if (!response.ok) throw new Error("Failed to create checkout session");
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError("Kon checkout niet starten");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ArrowPathIcon className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 backdrop-blur-sm bg-red-500/10 dark:bg-red-500/10 rounded-2xl border border-red-500/20">
        <div className="flex items-center gap-3">
          <XCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
        <button
          onClick={() => {
            setError(null);
            fetchSubscriptionData();
          }}
          className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  const standardFeatures = [
    "Tot 3 gebruikers inbegrepen",
    "Onbeperkte tijdregistraties",
    "Vakantie- en ziektebeheer",
    "GPS-verificatie",
    "Goedkeuringsworkflows",
    "Rapporten en exports",
    "E-mail notificaties",
    "Prioriteit support",
  ];

  const freemiumFeatures = [
    "1 gebruiker",
    "Basis tijdregistratie",
    "Beperkte rapporten",
    "Geen GPS-verificatie",
    "Geen goedkeuringen",
  ];

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
          Facturatie & Abonnement
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Beheer je abonnement, bekijk facturen en pas je plan aan
        </p>
      </div>

      {/* Current Subscription */}
      {subscriptionData && (
        <SubscriptionCard
          data={subscriptionData}
          onManageSubscription={handleManageSubscription}
          onUpgrade={() => setShowUpgradeModal(true)}
        />
      )}

      {/* Upgrade Modal / Section */}
      {showUpgradeModal && (
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Kies je plan
            </h2>
            <div className="flex items-center backdrop-blur-sm bg-white/30 dark:bg-white/5 rounded-lg p-1 border border-white/20 dark:border-purple-500/20">
              <button
                onClick={() => setBillingInterval("month")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 min-h-[40px] ${
                  billingInterval === "month"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                Maandelijks
              </button>
              <button
                onClick={() => setBillingInterval("year")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 min-h-[40px] ${
                  billingInterval === "year"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                    : "text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                }`}
              >
                Jaarlijks
                <span className="ml-1 text-xs text-green-600 dark:text-green-400">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <PricingCard
              name="Gratis"
              price={0}
              yearlyPrice={0}
              features={freemiumFeatures}
              isCurrentPlan={subscriptionData?.tenant.subscriptionStatus === "FREEMIUM"}
              onSelect={() => {}}
              interval={billingInterval}
            />
            <PricingCard
              name="Standaard"
              price={49.95}
              yearlyPrice={479.52}
              features={standardFeatures}
              isCurrentPlan={subscriptionData?.tenant.currentPlan === "STANDARD"}
              onSelect={handleUpgrade}
              interval={billingInterval}
            />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Extra gebruikers: €4,95 per gebruiker per maand
          </p>
        </div>
      )}

      {/* Invoice History */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-lg border border-white/20 dark:border-purple-500/20">
        <div className="p-6 border-b border-white/20 dark:border-purple-500/20">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Factuurgeschiedenis
          </h2>
        </div>
        <div className="p-6">
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCardIcon className="w-12 h-12 text-purple-300 dark:text-purple-500/50 mx-auto" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Nog geen facturen beschikbaar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div className="backdrop-blur-xl bg-white/90 dark:bg-slate-800/90 rounded-2xl p-6 flex items-center gap-4 border border-white/20 dark:border-purple-500/20 shadow-lg">
            <ArrowPathIcon className="w-6 h-6 text-purple-600 animate-spin" />
            <p className="text-gray-900 dark:text-white font-medium">
              Even geduld...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
