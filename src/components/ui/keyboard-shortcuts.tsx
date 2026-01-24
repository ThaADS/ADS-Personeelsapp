/**
 * Keyboard Shortcuts Component
 * Provides keyboard shortcut hints and navigation
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

const defaultShortcuts: ShortcutCategory[] = [
  {
    name: 'Navigatie',
    shortcuts: [
      { keys: ['g', 'd'], description: 'Ga naar Dashboard' },
      { keys: ['g', 't'], description: 'Ga naar Tijdregistratie' },
      { keys: ['g', 'v'], description: 'Ga naar Verlof' },
      { keys: ['g', 'z'], description: 'Ga naar Ziekmelding' },
      { keys: ['g', 'p'], description: 'Ga naar Profiel' },
    ],
  },
  {
    name: 'Algemeen',
    shortcuts: [
      { keys: ['?'], description: 'Toon sneltoetsen' },
      { keys: ['Esc'], description: 'Sluit dialoog' },
      { keys: ['/', 'Ctrl+K'], description: 'Zoeken' },
    ],
  },
  {
    name: 'Acties',
    shortcuts: [
      { keys: ['n'], description: 'Nieuwe registratie' },
      { keys: ['s'], description: 'Opslaan' },
    ],
  },
];

function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-mono font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-purple-500/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-white">
            Sneltoetsen
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Sluiten"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultShortcuts.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <span key={j} className="flex items-center gap-1">
                            {j > 0 && (
                              <span className="text-xs text-gray-400 mx-1">of</span>
                            )}
                            <KeyBadge>
                              {key === 'Ctrl+K' ? (
                                <>
                                  <span className="mr-1">⌘</span>K
                                </>
                              ) : key === 'Esc' ? (
                                'esc'
                              ) : (
                                key
                              )}
                            </KeyBadge>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Druk op <KeyBadge>?</KeyBadge> om dit dialoog te openen of sluiten
          </p>
        </div>
      </div>
    </div>
  );
}

export function useKeyboardShortcuts() {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const [keySequence, setKeySequence] = useState<string[]>([]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Show shortcuts dialog
      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault();
        setShowDialog((prev) => !prev);
        return;
      }

      // Close dialog on escape
      if (key === 'escape') {
        setShowDialog(false);
        setKeySequence([]);
        return;
      }

      // Handle key sequence for navigation
      const newSequence = [...keySequence, key];
      setKeySequence(newSequence);

      // Check for navigation shortcuts (g + letter)
      if (newSequence.length === 2 && newSequence[0] === 'g') {
        const routes: Record<string, string> = {
          d: '/dashboard',
          t: '/timesheet',
          v: '/vacation',
          z: '/sick-leave',
          p: '/profile',
          s: '/settings',
          e: '/employees',
          a: '/approvals',
        };

        const route = routes[newSequence[1]];
        if (route) {
          e.preventDefault();
          router.push(route);
        }
        setKeySequence([]);
        return;
      }

      // Reset sequence after 1 second
      setTimeout(() => setKeySequence([]), 1000);
    },
    [keySequence, router]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showDialog,
    setShowDialog,
    currentSequence: keySequence.join(' '),
  };
}

/**
 * Key sequence indicator shown while typing shortcuts
 */
export function KeySequenceIndicator({ sequence }: { sequence: string }) {
  if (!sequence) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-[90]',
        'px-4 py-2 rounded-lg',
        'bg-gray-900/90 dark:bg-gray-800/90 backdrop-blur-sm',
        'text-white text-sm font-mono',
        'animate-slide-in-from-bottom'
      )}
    >
      {sequence}
    </div>
  );
}
