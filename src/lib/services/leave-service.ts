/**
 * Leave Management Service
 * Handles sick leave, vacation, and tijd-voor-tijd requests
 */

import { 
  SickLeaveApproval, 
  VacationApproval, 
  PaginationData,
  ValidationError,
  ValidationWarning
} from "@/types/approval";

// Interface voor de response van verlofaanvragen
interface LeaveResponse<T> {
  items: T[];
  pagination: PaginationData;
}

// Interface voor het aanmaken van een ziekteverlof aanvraag
export interface CreateSickLeaveRequest {
  employeeId: string;
  startDate: string;
  endDate?: string | null;
  reason?: string;
  medicalNote: boolean;
}

// Interface voor het aanmaken van een vakantie aanvraag
export interface CreateVacationRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  description?: string;
  vacationType: 'regular' | 'special' | 'tijd-voor-tijd';
}

/**
 * Haalt ziekteverlof aanvragen op
 */
export async function fetchSickLeaves(
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<LeaveResponse<SickLeaveApproval>> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      queryParams.append('status', status);
    }
    
    const response = await fetch(`/api/sick-leaves?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sick leaves:', error);
    throw error;
  }
}

/**
 * Haalt vakantie aanvragen op
 */
export async function fetchVacations(
  page: number = 1,
  limit: number = 10,
  status?: string,
  type?: string
): Promise<LeaveResponse<VacationApproval>> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      queryParams.append('status', status);
    }
    
    if (type) {
      queryParams.append('type', type);
    }
    
    const response = await fetch(`/api/vacations?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching vacations:', error);
    throw error;
  }
}

/**
 * Maakt een nieuwe ziekteverlof aanvraag aan
 */
export async function createSickLeave(data: CreateSickLeaveRequest): Promise<SickLeaveApproval> {
  try {
    const response = await fetch('/api/sick-leaves', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating sick leave:', error);
    throw error;
  }
}

/**
 * Maakt een nieuwe vakantie aanvraag aan
 */
export async function createVacation(data: CreateVacationRequest): Promise<VacationApproval> {
  try {
    const response = await fetch('/api/vacations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating vacation:', error);
    throw error;
  }
}

/**
 * Valideert een ziekteverlof aanvraag
 */
export function validateSickLeave(data: Partial<CreateSickLeaveRequest>): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Verplichte velden controleren
  if (!data.employeeId) {
    errors.push({
      code: 'REQUIRED_FIELD',
      message: 'Werknemer is verplicht',
    });
  }

  if (!data.startDate) {
    errors.push({
      code: 'REQUIRED_FIELD',
      message: 'Startdatum is verplicht',
    });
  }

  // Datums valideren
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (end < start) {
      errors.push({
        code: 'INVALID_DATE_RANGE',
        message: 'Einddatum moet na startdatum liggen',
      });
    }
    
    // Waarschuwing voor lang ziekteverlof
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 14) {
      warnings.push({
        code: 'LONG_SICK_LEAVE',
        message: 'Ziekteverlof langer dan 14 dagen. UWV melding vereist.',
      });
    }
  }

  // Medische verklaring waarschuwing
  if (data.startDate && data.endDate && !data.medicalNote) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 7) {
      warnings.push({
        code: 'MEDICAL_NOTE_RECOMMENDED',
        message: 'Medische verklaring aanbevolen voor ziekteverlof langer dan 7 dagen',
      });
    }
  }

  return { errors, warnings };
}

/**
 * Valideert een vakantie aanvraag
 */
export function validateVacation(data: Partial<CreateVacationRequest>): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Verplichte velden controleren
  if (!data.employeeId) {
    errors.push({
      code: 'REQUIRED_FIELD',
      message: 'Werknemer is verplicht',
    });
  }

  if (!data.startDate) {
    errors.push({
      code: 'REQUIRED_FIELD',
      message: 'Startdatum is verplicht',
    });
  }

  if (!data.endDate) {
    errors.push({
      code: 'REQUIRED_FIELD',
      message: 'Einddatum is verplicht',
    });
  }

  if (!data.vacationType) {
    errors.push({
      code: 'REQUIRED_FIELD',
      message: 'Type verlof is verplicht',
    });
  }

  // Datums valideren
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    
    if (end < start) {
      errors.push({
        code: 'INVALID_DATE_RANGE',
        message: 'Einddatum moet na startdatum liggen',
      });
    }
    
    // Waarschuwing voor lange vakantie
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 21) {
      warnings.push({
        code: 'LONG_VACATION',
        message: 'Vakantie langer dan 21 dagen. Controleer beschikbare vakantiedagen.',
      });
    }
  }

  return { errors, warnings };
}
