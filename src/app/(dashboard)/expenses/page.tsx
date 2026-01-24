'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  ReceiptPercentIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BanknotesIcon,
  DocumentTextIcon,
  TruckIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  code: string;
  isMileage: boolean;
  requiresReceipt: boolean;
}

interface Expense {
  id: string;
  date: string;
  category: {
    id: string;
    name: string;
    code: string;
    is_mileage: boolean;
  };
  amount: number;
  currency: string;
  description: string;
  merchant: string | null;
  isMileage: boolean;
  distanceKm: number | null;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'CANCELLED';
  submittedAt: string | null;
  rejectionReason: string | null;
  employeeName: string | null;
  createdAt: string;
}

interface NewExpenseModalProps {
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

function NewExpenseModal({ categories, onClose, onSave }: NewExpenseModalProps) {
  const [formData, setFormData] = useState({
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    merchant: '',
    isMileage: false,
    distanceKm: '',
    fromLocation: '',
    toLocation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  useEffect(() => {
    if (selectedCategory?.isMileage) {
      setFormData((f) => ({ ...f, isMileage: true }));
    }
  }, [selectedCategory]);

  const handleSubmit = async (submitNow: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: formData.isMileage ? undefined : parseFloat(formData.amount),
          distanceKm: formData.isMileage ? parseFloat(formData.distanceKm) : undefined,
          submitNow,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Aanmaken mislukt');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is een fout opgetreden');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nieuwe declaratie</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categorie
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Selecteer categorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Datum
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Mileage fields */}
          {formData.isMileage || selectedCategory?.isMileage ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Afstand (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.distanceKm}
                  onChange={(e) => setFormData({ ...formData, distanceKm: e.target.value })}
                  placeholder="Bijv. 45.5"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
                {formData.distanceKm && (
                  <p className="text-sm text-gray-500 mt-1">
                    Vergoeding: €{(parseFloat(formData.distanceKm) * 0.23).toFixed(2)} (€0.23/km)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Van
                  </label>
                  <input
                    type="text"
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    placeholder="Vertrekpunt"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Naar
                  </label>
                  <input
                    type="text"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    placeholder="Bestemming"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bedrag (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Omschrijving
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Doel van de uitgave"
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Merchant */}
          {!formData.isMileage && !selectedCategory?.isMileage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Leverancier/Winkel
              </label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="Naam van de winkel of leverancier"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            Annuleren
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !formData.categoryId}
              className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg disabled:opacity-50"
            >
              Bewaar als concept
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isLoading || !formData.categoryId}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50"
            >
              {isLoading ? 'Bezig...' : 'Indienen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [view, setView] = useState<'my' | 'team'>('my');

  const fetchData = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        fetch(`/api/expenses?status=${filter}&view=${view}`),
        fetch('/api/expenses/categories'),
      ]);

      if (expensesRes.ok) {
        const data = await expensesRes.json();
        setExpenses(data.expenses);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter, view]);

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit concept wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: typeof ClockIcon }> = {
      DRAFT: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-600 dark:text-gray-400', icon: DocumentTextIcon },
      SUBMITTED: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: ClockIcon },
      APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: CheckCircleIcon },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: XCircleIcon },
      PAID: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', icon: BanknotesIcon },
      CANCELLED: { bg: 'bg-gray-100 dark:bg-slate-700', text: 'text-gray-500 dark:text-gray-500', icon: XCircleIcon },
    };

    const labels: Record<string, string> = {
      DRAFT: 'Concept',
      SUBMITTED: 'Ingediend',
      APPROVED: 'Goedgekeurd',
      REJECTED: 'Afgewezen',
      PAID: 'Uitbetaald',
      CANCELLED: 'Geannuleerd',
    };

    const style = styles[status] || styles.DRAFT;
    const Icon = style.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <Icon className="w-3 h-3" />
        {labels[status] || status}
      </span>
    );
  };

  // Calculate totals
  const totals = expenses.reduce(
    (acc, exp) => {
      acc.all += exp.amount;
      if (exp.status === 'SUBMITTED') acc.pending += exp.amount;
      if (exp.status === 'APPROVED') acc.approved += exp.amount;
      return acc;
    },
    { all: 0, pending: 0, approved: 0 }
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Declaraties</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Beheer je onkostendeclaraties
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nieuwe declaratie
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ReceiptPercentIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Totaal</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatAmount(totals.all, 'EUR')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">In behandeling</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatAmount(totals.pending, 'EUR')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Goedgekeurd</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatAmount(totals.approved, 'EUR')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'draft', 'submitted', 'approved', 'rejected', 'paid'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {
              {
                all: 'Alles',
                draft: 'Concepten',
                submitted: 'Ingediend',
                approved: 'Goedgekeurd',
                rejected: 'Afgewezen',
                paid: 'Uitbetaald',
              }[status]
            }
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Laden...</div>
        ) : expenses.length === 0 ? (
          <div className="p-8 text-center">
            <ReceiptPercentIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Geen declaraties gevonden</p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-4 text-purple-600 dark:text-purple-400 hover:underline"
            >
              Maak je eerste declaratie
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Datum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Categorie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Omschrijving</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bedrag</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {expense.isMileage ? (
                          <TruckIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ReceiptPercentIcon className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-900 dark:text-white">{expense.category.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-900 dark:text-white truncate max-w-xs">
                        {expense.description}
                      </p>
                      {expense.merchant && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.merchant}</p>
                      )}
                      {expense.isMileage && expense.distanceKm && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{expense.distanceKm} km</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                      {formatAmount(expense.amount, expense.currency)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(expense.status)}
                      {expense.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={expense.rejectionReason}>
                          {expense.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/expenses/${expense.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        {expense.status === 'DRAFT' && (
                          <>
                            <Link
                              href={`/expenses/${expense.id}/edit`}
                              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(expense.id)}
                              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Expense Modal */}
      {showNewModal && (
        <NewExpenseModal
          categories={categories}
          onClose={() => setShowNewModal(false)}
          onSave={() => {
            setShowNewModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
