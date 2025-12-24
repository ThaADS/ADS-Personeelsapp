/**
 * Approval Validation Service
 * 
 * Deze service implementeert slimme validatieregels voor verschillende soorten goedkeuringen
 * zoals tijdregistraties, vakantieaanvragen en ziekmeldingen.
 */

import { VacationRequest, SickLeave } from "@/types";
import { Timesheet } from "@prisma/client";
import { differenceInMinutes, differenceInDays, isWeekend, addBusinessDays } from "date-fns";
import { nl } from "date-fns/locale";

// Interface voor validatieresultaten
export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

// Interface voor validatiewaarschuwingen
export interface ValidationWarning {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean>;
}

// Interface voor validatiefouten
export interface ValidationError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean>;
}

// Configuratie voor validatieregels
const validationConfig = {
  timesheet: {
    normalWorkdayStartHour: 7, // 7:00
    normalWorkdayEndHour: 19, // 19:00
    minWorkDurationMinutes: 60, // 1 uur
    maxWorkDurationMinutes: 12 * 60, // 12 uur
    maxBreakDurationMinutes: 120, // 2 uur
    normalBreakDurationMinutes: 30, // 30 minuten
  },
  vacation: {
    maxConsecutiveDays: 21, // Maximaal 21 aaneengesloten vakantiedagen
    minRequestDaysInAdvance: 14, // Minimaal 14 dagen van tevoren aanvragen
    maxRequestDaysInAdvance: 365, // Maximaal 1 jaar van tevoren aanvragen
  },
  sickLeave: {
    uwvReportAfterDays: 42, // UWV-melding na 42 dagen (6 weken)
    medicalNoteAfterDays: 7, // Doktersverklaring na 7 dagen
  },
};

/**
 * Valideert een tijdregistratie op basis van slimme regels
 */
export function validateTimesheet(timesheet: Timesheet): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  try {
    // Parse datums en tijden
    const date = new Date(timesheet.date);
    const startTime = new Date(`${timesheet.date}T${timesheet.startTime}`);
    const endTime = new Date(`${timesheet.date}T${timesheet.endTime}`);
    
    // Controleer of het een weekend is
    if (isWeekend(date)) {
      warnings.push({
        code: "WEEKEND_WORK",
        message: "Tijdregistratie is voor een weekend",
      });
    }

    // Controleer werktijden buiten normale uren
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();
    
    if (startHour < validationConfig.timesheet.normalWorkdayStartHour) {
      warnings.push({
        code: "EARLY_START",
        message: `Vroege start (${startTime.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })})`,
      });
    }
    
    if (endHour > validationConfig.timesheet.normalWorkdayEndHour) {
      warnings.push({
        code: "LATE_END",
        message: `Late eindtijd (${endTime.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })})`,
      });
    }

    // Controleer werkduur
    const workDurationMinutes = differenceInMinutes(endTime, startTime) - (timesheet.break_minutes || 0);
    
    if (workDurationMinutes < validationConfig.timesheet.minWorkDurationMinutes) {
      warnings.push({
        code: "SHORT_DURATION",
        message: `Ongebruikelijk korte werkduur (${Math.round(workDurationMinutes / 60)} uur)`,
      });
    }
    
    if (workDurationMinutes > validationConfig.timesheet.maxWorkDurationMinutes) {
      warnings.push({
        code: "LONG_DURATION",
        message: `Ongebruikelijk lange werkduur (${Math.round(workDurationMinutes / 60)} uur)`,
        details: {
          workDurationMinutes,
          maxAllowed: validationConfig.timesheet.maxWorkDurationMinutes,
        },
      });
    }

    // Controleer pauze
    if (timesheet.break_minutes === 0 && workDurationMinutes > 5.5 * 60) {
      warnings.push({
        code: "NO_BREAK",
        message: "Geen pauze geregistreerd voor werkdag langer dan 5,5 uur",
      });
    }
    
    if (timesheet.break_minutes && timesheet.break_minutes > validationConfig.timesheet.maxBreakDurationMinutes) {
      warnings.push({
        code: "LONG_BREAK",
        message: `Ongebruikelijk lange pauze (${timesheet.break_minutes} minuten)`,
      });
    }

    // Controleer GPS-verificatie (check if location data is present)
    if (!timesheet.location_start && !timesheet.location_end) {
      warnings.push({
        code: "NO_GPS_VERIFICATION",
        message: "Geen GPS-verificatie beschikbaar",
      });
    }

    // Controleer of de eindtijd na de begintijd ligt
    if (endTime <= startTime) {
      errors.push({
        code: "INVALID_TIME_RANGE",
        message: "Eindtijd moet na begintijd liggen",
      });
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  } catch (error) {
    console.error("Error validating timesheet:", error);
    return {
      isValid: false,
      warnings,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: "Er is een fout opgetreden bij het valideren van de tijdregistratie",
          details: { errorMessage: error instanceof Error ? error.message : String(error) },
        },
      ],
    };
  }
}

/**
 * Valideert een vakantieaanvraag op basis van slimme regels
 */
export function validateVacationRequest(
  vacationRequest: VacationRequest,
  remainingDays: number = 25 // Standaard aantal vakantiedagen
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  try {
    // Parse datums
    const startDate = new Date(vacationRequest.startDate);
    const endDate = vacationRequest.endDate ? new Date(vacationRequest.endDate) : startDate;
    const today = new Date();
    
    // Bereken aantal dagen
    const daysRequested = differenceInDays(endDate, startDate) + 1;
    const daysInAdvance = differenceInDays(startDate, today);
    
    // Controleer of er voldoende vakantiedagen beschikbaar zijn
    if (daysRequested > remainingDays) {
      errors.push({
        code: "INSUFFICIENT_DAYS",
        message: `Onvoldoende vakantiedagen beschikbaar (${remainingDays} beschikbaar, ${daysRequested} aangevraagd)`,
      });
    }
    
    // Controleer of de aanvraag niet te laat is ingediend
    if (daysInAdvance < validationConfig.vacation.minRequestDaysInAdvance) {
      warnings.push({
        code: "LATE_REQUEST",
        message: `Vakantie is aangevraagd met minder dan ${validationConfig.vacation.minRequestDaysInAdvance} dagen vooraf`,
        details: {
          daysInAdvance,
          minRequired: validationConfig.vacation.minRequestDaysInAdvance,
        },
      });
    }
    
    // Controleer of de aanvraag niet te ver vooruit is gepland
    if (daysInAdvance > validationConfig.vacation.maxRequestDaysInAdvance) {
      warnings.push({
        code: "FAR_FUTURE_REQUEST",
        message: `Vakantie is meer dan ${validationConfig.vacation.maxRequestDaysInAdvance} dagen vooruit gepland`,
      });
    }
    
    // Controleer of de vakantie niet te lang is
    if (daysRequested > validationConfig.vacation.maxConsecutiveDays) {
      warnings.push({
        code: "LONG_VACATION",
        message: `Lange vakantieperiode (${daysRequested} dagen)`,
      });
    }
    
    // Controleer of de einddatum na de begindatum ligt
    if (endDate < startDate) {
      errors.push({
        code: "INVALID_DATE_RANGE",
        message: "Einddatum moet na begindatum liggen",
      });
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  } catch (error) {
    console.error("Error validating vacation request:", error);
    return {
      isValid: false,
      warnings,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: "Er is een fout opgetreden bij het valideren van de vakantieaanvraag",
          details: { errorMessage: error instanceof Error ? error.message : String(error) },
        },
      ],
    };
  }
}

/**
 * Valideert een ziekmelding op basis van slimme regels
 */
export function validateSickLeave(sickLeave: SickLeave): ValidationResult {
  const warnings: ValidationWarning[] = [];
  const errors: ValidationError[] = [];

  try {
    // Parse datums
    const startDate = new Date(sickLeave.startDate);
    const endDate = sickLeave.endDate ? new Date(sickLeave.endDate) : null;
    const today = new Date();
    
    // Bereken aantal dagen ziek
    const daysSick = endDate ? differenceInDays(endDate, startDate) + 1 : differenceInDays(today, startDate) + 1;
    
    // Controleer of UWV-melding nodig is
    if (daysSick >= validationConfig.sickLeave.uwvReportAfterDays && !sickLeave.uwvReported) {
      warnings.push({
        code: "UWV_REPORT_REQUIRED",
        message: `UWV-melding vereist na ${validationConfig.sickLeave.uwvReportAfterDays} dagen ziekte`,
      });
    }
    
    // Controleer of doktersverklaring nodig is
    if (daysSick >= validationConfig.sickLeave.medicalNoteAfterDays && !sickLeave.medicalNote) {
      warnings.push({
        code: "MEDICAL_NOTE_REQUIRED",
        message: `Doktersverklaring aanbevolen na ${validationConfig.sickLeave.medicalNoteAfterDays} dagen ziekte`,
      });
    }
    
    // Controleer of de einddatum na de begindatum ligt (als er een einddatum is)
    if (endDate && endDate < startDate) {
      errors.push({
        code: "INVALID_DATE_RANGE",
        message: "Einddatum moet na begindatum liggen",
      });
    }
    
    // Controleer of de begindatum niet in de toekomst ligt
    if (startDate > today) {
      errors.push({
        code: "FUTURE_START_DATE",
        message: "Begindatum van ziekmelding kan niet in de toekomst liggen",
      });
    }

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
    };
  } catch (error) {
    console.error("Error validating sick leave:", error);
    return {
      isValid: false,
      warnings,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: "Er is een fout opgetreden bij het valideren van de ziekmelding",
          details: { errorMessage: error instanceof Error ? error.message : String(error) },
        },
      ],
    };
  }
}

/**
 * Valideert een goedkeuring op basis van het type
 */
export function validateApproval(
  item: Timesheet | VacationRequest | SickLeave,
  type: "timesheet" | "vacation" | "sickleave",
  additionalData?: { remainingDays?: number }
): ValidationResult {
  switch (type) {
    case "timesheet":
      return validateTimesheet(item as Timesheet);
    case "vacation":
      return validateVacationRequest(item as VacationRequest, additionalData?.remainingDays);
    case "sickleave":
      return validateSickLeave(item as SickLeave);
    default:
      return {
        isValid: false,
        warnings: [],
        errors: [
          {
            code: "UNKNOWN_TYPE",
            message: `Onbekend type goedkeuring: ${type}`,
          },
        ],
      };
  }
}
