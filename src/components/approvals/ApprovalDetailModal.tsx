"use client";

import { ApprovalItem, isTimesheetApproval, isSickLeaveApproval, isVacationApproval, TimesheetApproval, VacationApproval, SickLeaveApproval } from "@/types/approval";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import ValidationBadges from "@/components/approvals/ValidationBadges";

interface ApprovalDetailModalProps {
  approval: ApprovalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function ApprovalDetailModal({
  approval,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: ApprovalDetailModalProps) {
  if (!isOpen || !approval) return null;

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Onbekend";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: nl });
    } catch {
      return "Ongeldige datum";
    }
  };

  const formatTime = (dateTimeString: string | undefined | null) => {
    if (!dateTimeString) return "";
    try {
      return format(new Date(dateTimeString), "HH:mm", { locale: nl });
    } catch {
      return "";
    }
  };

  const formatDateTime = (dateTimeString: string | undefined | null) => {
    if (!dateTimeString) return "Onbekend";
    try {
      return format(new Date(dateTimeString), "dd-MM-yyyy 'om' HH:mm", { locale: nl });
    } catch {
      return "Onbekend";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "timesheet": return "Tijdregistratie";
      case "vacation": return "Vakantieaanvraag";
      case "sickleave": return "Ziekmelding";
      default: return type;
    }
  };

  const hasErrors = approval.validationErrors && approval.validationErrors.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop - separate layer */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal container - needs relative to sit above backdrop */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Centering helper for sm+ screens */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal panel - solid background, no blur inheritance */}
        <div className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-500/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white" id="modal-title">
                  {getTypeLabel(approval.type)}
                </h3>
                <p className="text-sm text-purple-200">{approval.employeeName}</p>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Sluiten"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Validation badges */}
            {(approval.validationWarnings?.length || approval.validationErrors?.length) ? (
              <div className="mb-4">
                <ValidationBadges
                  warnings={approval.validationWarnings || []}
                  errors={approval.validationErrors || []}
                />
              </div>
            ) : null}

            {/* Timesheet specific details */}
            {isTimesheetApproval(approval) && (
              <TimesheetDetails approval={approval} formatDate={formatDate} formatTime={formatTime} />
            )}

            {/* Vacation specific details */}
            {isVacationApproval(approval) && (
              <VacationDetails approval={approval} formatDate={formatDate} />
            )}

            {/* Sick leave specific details */}
            {isSickLeaveApproval(approval) && (
              <SickLeaveDetails approval={approval} formatDate={formatDate} />
            )}

            {/* Submission info */}
            <div className="pt-4 border-t border-gray-200 dark:border-purple-500/20">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ingediend: {formatDateTime(approval.submittedAt)}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 dark:bg-slate-700/50 px-6 py-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onApprove(approval.id)}
              disabled={hasErrors}
              className="flex-1 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Goedkeuren
            </button>
            <button
              onClick={() => onReject(approval.id)}
              className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Afkeuren
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timesheet details component
function TimesheetDetails({
  approval,
  formatDate,
  formatTime
}: {
  approval: TimesheetApproval;
  formatDate: (d: string | undefined | null) => string;
  formatTime: (d: string | undefined | null) => string;
}) {
  return (
    <div className="space-y-3">
      <DetailRow label="Datum" value={formatDate(approval.date)} />
      <DetailRow
        label="Werktijden"
        value={`${formatTime(approval.startTime) || 'Onbekend'} - ${formatTime(approval.endTime) || 'Onbekend'}`}
      />
      {approval.breakDuration !== undefined && (
        <DetailRow label="Pauze" value={`${approval.breakDuration} minuten`} />
      )}
      {approval.description && (
        <DetailRow label="Omschrijving" value={approval.description} />
      )}
      {approval.locationVerified !== undefined && (
        <DetailRow
          label="Locatie geverifieerd"
          value={approval.locationVerified ? "Ja" : "Nee"}
          valueClassName={approval.locationVerified ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}
        />
      )}
      {approval.startLocation && (
        <DetailRow label="Start locatie" value={approval.startLocation} />
      )}
      {approval.endLocation && (
        <DetailRow label="Eind locatie" value={approval.endLocation} />
      )}
    </div>
  );
}

// Vacation details component
function VacationDetails({
  approval,
  formatDate
}: {
  approval: VacationApproval;
  formatDate: (d: string | undefined | null) => string;
}) {
  const getVacationTypeLabel = (type: string) => {
    switch (type) {
      case "regular": return "Regulier verlof";
      case "special": return "Bijzonder verlof";
      case "tijd-voor-tijd": return "Tijd voor tijd";
      default: return type;
    }
  };

  return (
    <div className="space-y-3">
      <DetailRow label="Type verlof" value={getVacationTypeLabel(approval.vacationType)} />
      <DetailRow label="Van" value={formatDate(approval.startDate)} />
      <DetailRow label="Tot" value={formatDate(approval.endDate)} />
      <DetailRow label="Aantal dagen" value={`${approval.totalDays} dagen`} />
      {approval.description && (
        <DetailRow label="Reden" value={approval.description} />
      )}
    </div>
  );
}

// Sick leave details component
function SickLeaveDetails({
  approval,
  formatDate
}: {
  approval: SickLeaveApproval;
  formatDate: (d: string | undefined | null) => string;
}) {
  return (
    <div className="space-y-3">
      <DetailRow label="Startdatum" value={formatDate(approval.startDate)} />
      {approval.endDate && (
        <DetailRow label="Einddatum" value={formatDate(approval.endDate)} />
      )}
      {approval.expectedReturnDate && (
        <DetailRow label="Verwachte terugkeer" value={formatDate(approval.expectedReturnDate)} />
      )}
      {approval.reason && (
        <DetailRow label="Reden" value={approval.reason} />
      )}
      <DetailRow
        label="Doktersverklaring"
        value={approval.medicalNote ? "Ja" : "Nee"}
        valueClassName={approval.medicalNote ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}
      />
      <DetailRow
        label="UWV gemeld"
        value={approval.uwvReported ? "Ja" : "Nee"}
        valueClassName={approval.uwvReported ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}
      />
    </div>
  );
}

// Reusable detail row component
function DetailRow({
  label,
  value,
  valueClassName = "text-gray-900 dark:text-white"
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${valueClassName} text-right max-w-[60%]`}>{value}</span>
    </div>
  );
}
