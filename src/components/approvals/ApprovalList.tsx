"use client";

import { useState } from "react";
import { ApprovalItem, isTimesheetApproval, isSickLeaveApproval, isVacationApproval } from "@/types/approval";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import ValidationBadges from "@/components/approvals/ValidationBadges";
import ApprovalDetailModal from "@/components/approvals/ApprovalDetailModal";

interface ApprovalListProps {
  approvals: ApprovalItem[];
  selectedItems: string[];
  toggleItemSelection: (id: string) => void;
  toggleSelectAll: () => void;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  isLoading: boolean;
}

export default function ApprovalList({
  approvals,
  selectedItems,
  toggleItemSelection,
  toggleSelectAll,
  handleApprove,
  handleReject,
  isLoading,
}: ApprovalListProps) {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(null);

  // Functie om het type goedkeuring weer te geven
  const getApprovalTypeText = (type: string) => {
    switch (type) {
      case "timesheet":
        return "Tijdregistratie";
      case "vacation":
        return "Vakantie";
      case "sickleave":
        return "Ziekmelding";
      default:
        return type;
    }
  };

  // Functie om de datum te formatteren
  const formatDate = (dateString: string) => {
    if (!dateString) return "Onbekend";
    try {
      return format(new Date(dateString), "dd-MM-yyyy", { locale: nl });
    } catch {
      return "Ongeldig";
    }
  };

  // Functie om de tijd te formatteren
  const formatTime = (dateTimeString: string) => {
    if (!dateTimeString) return "";
    try {
      return format(new Date(dateTimeString), "HH:mm", { locale: nl });
    } catch {
      return "";
    }
  };

  // Open detail modal
  const openDetailModal = (approval: ApprovalItem) => {
    setSelectedApproval(approval);
    setDetailModalOpen(true);
  };

  // Handle approve from modal
  const handleApproveFromModal = (id: string) => {
    setDetailModalOpen(false);
    handleApprove(id);
  };

  // Handle reject from modal
  const handleRejectFromModal = (id: string) => {
    setDetailModalOpen(false);
    handleReject(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Gegevens laden...</span>
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        <table className="w-full divide-y divide-purple-200/50 dark:divide-purple-500/20">
          <thead className="bg-purple-100/80 dark:bg-white/5">
            <tr>
              <th scope="col" className="w-10 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded bg-white dark:bg-white/5"
                  checked={selectedItems.length === approvals.length && approvals.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Selecteer alle items"
                  title="Selecteer alle items"
                />
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Werknemer
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Datum
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="w-32 px-3 py-3 text-center text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase tracking-wider">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/70 dark:bg-white/5 divide-y divide-purple-200/50 dark:divide-purple-500/20">
            {approvals.map((approval) => {
              const hasErrors = approval.validationErrors && approval.validationErrors.length > 0;

              return (
                <tr
                  key={approval.id}
                  className={`hover:bg-purple-50/50 dark:hover:bg-white/5 transition-colors ${hasErrors ? "bg-red-500/10 dark:bg-red-500/10" : ""}`}
                >
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded bg-white/50 dark:bg-white/5"
                      checked={selectedItems.includes(approval.id)}
                      onChange={() => toggleItemSelection(approval.id)}
                      aria-label={`Selecteer item van ${approval.employeeName}`}
                      title={`Selecteer item van ${approval.employeeName}`}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full backdrop-blur-sm bg-purple-500/20 dark:bg-purple-500/20 border border-purple-500/30 text-purple-800 dark:text-purple-300">
                      {getApprovalTypeText(approval.type)}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {approval.employeeName || "Onbekend"}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {isTimesheetApproval(approval) ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(approval.date || "")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(approval.startTime || "")} - {formatTime(approval.endTime || "")}
                        </div>
                      </div>
                    ) : (isVacationApproval(approval) || isSickLeaveApproval(approval)) ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(approval.startDate || "")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          t/m {approval.endDate ? formatDate(approval.endDate) : "Heden"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    {isTimesheetApproval(approval) ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={approval.description || ''}>
                        {approval.description || "Geen omschrijving"}
                      </div>
                    ) : isVacationApproval(approval) ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={approval.description || ''}>
                        {approval.description || "Vakantie"}
                      </div>
                    ) : isSickLeaveApproval(approval) ? (
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[150px]" title={approval.reason || ''}>
                        {approval.reason || "Ziekmelding"}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-gray-400">-</div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <ValidationBadges
                      warnings={approval.validationWarnings || []}
                      errors={approval.validationErrors || []}
                      compact={true}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* View button */}
                      <button
                        onClick={() => openDetailModal(approval)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                        title="Bekijken"
                        aria-label="Bekijken"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {/* Approve button */}
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={hasErrors}
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-100 dark:hover:bg-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Goedkeuren"
                        aria-label="Goedkeuren"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      {/* Reject button */}
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                        title="Afkeuren"
                        aria-label="Afkeuren"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {approvals.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Geen goedkeuringen gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Card based */}
      <div className="md:hidden divide-y divide-purple-200/50 dark:divide-purple-500/20">
        {/* Select all header for mobile */}
        {approvals.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-purple-100/80 dark:bg-white/5">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded bg-white dark:bg-white/5"
                checked={selectedItems.length === approvals.length}
                onChange={toggleSelectAll}
              />
              Alles selecteren
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {selectedItems.length} geselecteerd
            </span>
          </div>
        )}

        {approvals.map((approval) => {
          const hasErrors = approval.validationErrors && approval.validationErrors.length > 0;

          return (
            <div
              key={approval.id}
              className={`p-4 ${hasErrors ? "bg-red-500/10 dark:bg-red-500/10" : "bg-white/70 dark:bg-white/5"}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-purple-500/30 rounded bg-white/50 dark:bg-white/5"
                  checked={selectedItems.includes(approval.id)}
                  onChange={() => toggleItemSelection(approval.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-800 dark:text-purple-300">
                      {getApprovalTypeText(approval.type)}
                    </span>
                    <ValidationBadges
                      warnings={approval.validationWarnings || []}
                      errors={approval.validationErrors || []}
                      compact={true}
                    />
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {approval.employeeName || "Onbekend"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {isTimesheetApproval(approval) ? (
                      <>
                        {formatDate(approval.date || "")} • {formatTime(approval.startTime || "")} - {formatTime(approval.endTime || "")}
                        {approval.description && (
                          <div className="text-xs mt-0.5 truncate">{approval.description}</div>
                        )}
                      </>
                    ) : (isVacationApproval(approval) || isSickLeaveApproval(approval)) ? (
                      <>
                        {formatDate(approval.startDate || "")} t/m {approval.endDate ? formatDate(approval.endDate) : "Heden"}
                        {isVacationApproval(approval) && approval.description && (
                          <div className="text-xs mt-0.5 truncate">{approval.description}</div>
                        )}
                        {isSickLeaveApproval(approval) && approval.reason && (
                          <div className="text-xs mt-0.5 truncate">{approval.reason}</div>
                        )}
                      </>
                    ) : null}
                  </div>
                  {/* Mobile action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetailModal(approval)}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Bekijken
                    </button>
                    <button
                      onClick={() => handleApprove(approval.id)}
                      disabled={hasErrors}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-sm font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReject(approval.id)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {approvals.length === 0 && (
          <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Geen goedkeuringen gevonden
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <ApprovalDetailModal
        approval={selectedApproval}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onApprove={handleApproveFromModal}
        onReject={handleRejectFromModal}
      />
    </>
  );
}
