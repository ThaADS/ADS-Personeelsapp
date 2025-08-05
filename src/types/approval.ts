/**
 * Types voor goedkeuringen in het systeem
 */

export interface ValidationWarning {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Basis interface voor alle goedkeuringen
export interface ApprovalItem {
  id: string;
  type: string;
  employeeId: string;
  employeeName?: string;
  submittedAt: string;
  status: string;
  validationWarnings?: ValidationWarning[];
  validationErrors?: ValidationError[];
}

// Specifieke interface voor tijdregistratie goedkeuringen
export interface TimesheetApproval extends ApprovalItem {
  date?: string;
  startTime?: string;
  endTime?: string;
  breakDuration?: number;
  locationVerified?: boolean;
  startLocation?: string;
  endLocation?: string;
  description?: string;
}

// Specifieke interface voor ziekteverlof goedkeuringen
export interface SickLeaveApproval extends ApprovalItem {
  startDate: string;
  endDate?: string | null;
  reason?: string;
  medicalNote?: boolean;
  uwvReported?: boolean;
  expectedReturnDate?: string;
}

// Specifieke interface voor vakantie goedkeuringen
export interface VacationApproval extends ApprovalItem {
  startDate: string;
  endDate: string;
  description?: string;
  totalDays: number;
  vacationType: 'regular' | 'special' | 'tijd-voor-tijd';
}

// Type guard functies om het type goedkeuring te bepalen
export function isTimesheetApproval(approval: ApprovalItem): approval is TimesheetApproval {
  return approval.type === 'timesheet';
}

export function isSickLeaveApproval(approval: ApprovalItem): approval is SickLeaveApproval {
  return approval.type === 'sick-leave';
}

export function isVacationApproval(approval: ApprovalItem): approval is VacationApproval {
  return approval.type === 'vacation' || approval.type === 'tijd-voor-tijd';
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApprovalActionPayload {
  ids: string[];
  action: "approve" | "reject";
  comment?: string;
}

export interface ApprovalResponse {
  items: ApprovalItem[];
  pagination: PaginationData;
}
