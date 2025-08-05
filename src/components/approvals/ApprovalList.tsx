"use client";


import { ApprovalItem, isTimesheetApproval, isSickLeaveApproval, isVacationApproval } from "@/types/approval";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import ValidationBadges from "@/components/approvals/ValidationBadges";

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
  // Functie om het type goedkeuring weer te geven
  const getApprovalTypeText = (type: string) => {
    switch (type) {
      case "timesheet":
        return "Tijdregistratie";
      case "vacation":
        return "Vakantieaanvraag";
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
      return "Ongeldige datum";
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Gegevens laden...</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={selectedItems.length === approvals.length && approvals.length > 0}
                  onChange={toggleSelectAll}
                  aria-label="Selecteer alle items"
                  title="Selecteer alle items"
                />
              </div>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Werknemer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Validatie
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ingediend
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acties
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {approvals.map((approval) => (
            <tr key={approval.id} className={approval.validationErrors && approval.validationErrors.length > 0 ? "bg-red-50" : ""}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedItems.includes(approval.id)}
                    onChange={() => toggleItemSelection(approval.id)}
                    aria-label={`Selecteer item van ${approval.employeeName}`}
                    title={`Selecteer item van ${approval.employeeName}`}
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {getApprovalTypeText(approval.type)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {approval.employeeName}
                </div>
                <div className="text-sm text-gray-500">
                  {approval.employeeId}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isTimesheetApproval(approval) ? (
                  <div className="text-sm text-gray-900">
                    {formatDate(approval.date || "")}
                  </div>
                ) : (isVacationApproval(approval) || isSickLeaveApproval(approval)) ? (
                  <div className="text-sm text-gray-900">
                    {formatDate(approval.startDate || "")} - {approval.endDate ? formatDate(approval.endDate) : "Onbekend"}
                  </div>
                ) : (
                  <div className="text-sm text-gray-900">Geen datum beschikbaar</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isTimesheetApproval(approval) ? (
                  <div className="text-sm text-gray-900">
                    {approval.startTime || 'Onbekend'} - {approval.endTime || 'Onbekend'}
                    <div className="text-xs text-gray-500">
                      {approval.description || ''}
                    </div>
                  </div>
                ) : isVacationApproval(approval) ? (
                  <div className="text-sm text-gray-900">
                    {approval.description || 'Geen reden opgegeven'}
                  </div>
                ) : isSickLeaveApproval(approval) ? (
                  <div className="text-sm text-gray-900">
                    {approval.reason || 'Geen reden opgegeven'}
                    <div className="text-xs text-gray-500">
                      UWV gemeld: {approval.uwvReported ? "Ja" : "Nee"}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-900">Geen details beschikbaar</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <ValidationBadges 
                  warnings={approval.validationWarnings || []} 
                  errors={approval.validationErrors || []} 
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(approval.submittedAt)} {formatTime(approval.submittedAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="text-green-600 hover:text-green-900"
                    disabled={approval.validationErrors && approval.validationErrors.length > 0}
                  >
                    Goedkeuren
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Afkeuren
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {approvals.length === 0 && (
            <tr>
              <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                Geen goedkeuringen gevonden
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
