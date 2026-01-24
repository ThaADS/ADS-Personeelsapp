/**
 * Toast Notification Component
 * Provides user feedback for actions and events
 */

'use client';

import { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastConfig: Record<ToastType, {
  icon: typeof CheckCircleIcon;
  bgClass: string;
  iconClass: string;
  borderClass: string;
}> = {
  success: {
    icon: CheckCircleIcon,
    bgClass: 'bg-green-50 dark:bg-green-900/20',
    iconClass: 'text-green-500 dark:text-green-400',
    borderClass: 'border-green-200 dark:border-green-500/30',
  },
  error: {
    icon: XCircleIcon,
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    iconClass: 'text-red-500 dark:text-red-400',
    borderClass: 'border-red-200 dark:border-red-500/30',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    iconClass: 'text-amber-500 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-500/30',
  },
  info: {
    icon: InformationCircleIcon,
    bgClass: 'bg-blue-50 dark:bg-blue-900/20',
    iconClass: 'text-blue-500 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-500/30',
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        'animate-slide-in-from-right',
        config.bgClass,
        config.borderClass
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
        aria-label="Sluiten"
      >
        <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = toast.duration ?? 5000;

    setToasts((prev) => [...prev, { ...toast, id }]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 8000 });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none"
        aria-label="Meldingen"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Standalone toast component for use without context
 */
export function Toast({
  type,
  title,
  message,
  onClose,
  className,
}: {
  type: ToastType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm',
        config.bgClass,
        config.borderClass,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconClass)} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          {title}
        </p>
        {message && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
          aria-label="Sluiten"
        >
          <XMarkIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      )}
    </div>
  );
}
