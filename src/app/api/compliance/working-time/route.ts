/**
 * API route voor arbeidstijdenwet compliance checks
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { LaborLawCheck } from "@/lib/services/compliance-service";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api-compliance-working-time");

// Arbeidstijdenwet regels
const WORKING_TIME_RULES = {
  MAX_HOURS_PER_DAY: 12, // Maximaal 12 uur per dag
  MAX_HOURS_PER_WEEK: 60, // Maximaal 60 uur per week
  MAX_HOURS_PER_4_WEEKS: 55, // Gemiddeld maximaal 55 uur per week over 4 weken
  MAX_HOURS_PER_16_WEEKS: 48, // Gemiddeld maximaal 48 uur per week over 16 weken
  MIN_REST_BETWEEN_SHIFTS: 11, // Minimaal 11 uur rust tussen diensten
  MIN_REST_PER_WEEK: 36, // Minimaal 36 uur aaneengesloten rust per week
};

/**
 * GET /api/compliance/working-time
 * Controleert arbeidstijdenwet compliance voor een werknemer
 */
export async function GET(request: NextRequest) {
  try {
    // Sessie controleren
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // Query parameters ophalen
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json({ 
        error: "Ontbrekende parameters: employeeId, startDate en endDate zijn verplicht" 
      }, { status: 400 });
    }

    // In een echte applicatie zouden we hier de tijdregistraties van de werknemer ophalen
    // Voor nu gebruiken we voorbeeld data
    const timeRegistrations = await fetchMockTimeRegistrations(employeeId, startDate, endDate);
    
    // Voer de compliance checks uit
    const complianceChecks = performWorkingTimeChecks(timeRegistrations);

    return NextResponse.json(complianceChecks);
  } catch (error) {
    logger.error("Error in working-time GET", error);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

/**
 * Haalt voorbeeld tijdregistraties op voor een werknemer
 */
async function fetchMockTimeRegistrations(
  employeeId: string,
  startDate: string,
  endDate: string
): Promise<{ employeeId: string; date: string; startTime: string; endTime: string; breakDuration: number; }[]> {
  // In een echte applicatie zouden we hier de tijdregistraties uit de database halen
  // Voor nu genereren we wat voorbeeld data
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const registrations = [];
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    // Sla weekenden over
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Genereer een normale werkdag (8 uur)
      registrations.push({
        employeeId,
        date: new Date(currentDate).toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:30',
        breakDuration: 30, // 30 minuten pauze
      });
    }
    
    // Voeg af en toe een lange dag toe om compliance issues te testen
    if (dayOfWeek === 3 && Math.random() > 0.7) {
      registrations.push({
        employeeId,
        date: new Date(currentDate).toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '22:00',
        breakDuration: 60, // 60 minuten pauze
      });
    }
    
    // Ga naar de volgende dag
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return registrations;
}

/**
 * Voert arbeidstijdenwet compliance checks uit
 */
function performWorkingTimeChecks(timeRegistrations: { employeeId: string; date: string; startTime: string; endTime: string; breakDuration: number; }[]): LaborLawCheck[] {
  const checks: LaborLawCheck[] = [];
  
  // Groepeer registraties per dag
  const registrationsByDay = timeRegistrations.reduce((acc, reg) => {
    if (!acc[reg.date]) {
      acc[reg.date] = [];
    }
    acc[reg.date].push(reg);
    return acc;
  }, {} as Record<string, { employeeId: string; date: string; startTime: string; endTime: string; breakDuration: number; }[]>);
  
  // Controleer uren per dag
  Object.entries(registrationsByDay).forEach(([date, regs]) => {
    let totalHoursForDay = 0;
    
    regs.forEach(reg => {
      const startParts = reg.startTime.split(':');
      const endParts = reg.endTime.split(':');
      
      const startHours = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
      const endHours = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
      
      // Trek pauze af van de werktijd
      const workHours = endHours - startHours - (reg.breakDuration / 60);
      
      totalHoursForDay += workHours;
    });
    
    // Controleer maximale uren per dag
    if (totalHoursForDay > WORKING_TIME_RULES.MAX_HOURS_PER_DAY) {
      checks.push({
        id: `day-${date}`,
        checkType: 'max-hours-per-day',
        description: 'Maximaal aantal werkuren per dag',
        result: 'fail',
        details: `Werktijd van ${totalHoursForDay.toFixed(1)} uur overschrijdt het maximum van ${WORKING_TIME_RULES.MAX_HOURS_PER_DAY} uur op ${date}`,
        timestamp: new Date().toISOString(),
        relatedEmployeeId: regs[0].employeeId
      });
    } else if (totalHoursForDay > WORKING_TIME_RULES.MAX_HOURS_PER_DAY - 2) {
      checks.push({
        id: `day-${date}`,
        checkType: 'max-hours-per-day',
        description: 'Maximaal aantal werkuren per dag',
        result: 'warning',
        details: `Werktijd van ${totalHoursForDay.toFixed(1)} uur nadert het maximum van ${WORKING_TIME_RULES.MAX_HOURS_PER_DAY} uur op ${date}`,
        timestamp: new Date().toISOString(),
        relatedEmployeeId: regs[0].employeeId
      });
    } else {
      checks.push({
        id: `day-${date}`,
        checkType: 'max-hours-per-day',
        description: 'Maximaal aantal werkuren per dag',
        result: 'pass',
        details: `Werktijd van ${totalHoursForDay.toFixed(1)} uur is binnen het maximum van ${WORKING_TIME_RULES.MAX_HOURS_PER_DAY} uur op ${date}`,
        timestamp: new Date().toISOString(),
        relatedEmployeeId: regs[0].employeeId
      });
    }
  });
  
  // Controleer wekelijkse uren
  // Groepeer registraties per week
  const weeklyHours: Record<string, number> = {};
  
  timeRegistrations.forEach(reg => {
    const date = new Date(reg.date);
    const weekNumber = getWeekNumber(date);
    const weekKey = `${date.getFullYear()}-W${weekNumber}`;
    
    if (!weeklyHours[weekKey]) {
      weeklyHours[weekKey] = 0;
    }
    
    const startParts = reg.startTime.split(':');
    const endParts = reg.endTime.split(':');
    
    const startHours = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
    const endHours = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
    
    // Trek pauze af van de werktijd
    const workHours = endHours - startHours - (reg.breakDuration / 60);
    
    weeklyHours[weekKey] += workHours;
  });
  
  // Controleer maximale uren per week
  Object.entries(weeklyHours).forEach(([weekKey, hours]) => {
    if (hours > WORKING_TIME_RULES.MAX_HOURS_PER_WEEK) {
      checks.push({
        id: `week-${weekKey}`,
        checkType: 'max-hours-per-week',
        description: 'Maximaal aantal werkuren per week',
        result: 'fail',
        details: `Werktijd van ${hours.toFixed(1)} uur overschrijdt het maximum van ${WORKING_TIME_RULES.MAX_HOURS_PER_WEEK} uur in week ${weekKey}`,
        timestamp: new Date().toISOString(),
        relatedEmployeeId: timeRegistrations[0].employeeId
      });
    } else if (hours > WORKING_TIME_RULES.MAX_HOURS_PER_WEEK - 5) {
      checks.push({
        id: `week-${weekKey}`,
        checkType: 'max-hours-per-week',
        description: 'Maximaal aantal werkuren per week',
        result: 'warning',
        details: `Werktijd van ${hours.toFixed(1)} uur nadert het maximum van ${WORKING_TIME_RULES.MAX_HOURS_PER_WEEK} uur in week ${weekKey}`,
        timestamp: new Date().toISOString(),
        relatedEmployeeId: timeRegistrations[0].employeeId
      });
    } else {
      checks.push({
        id: `week-${weekKey}`,
        checkType: 'max-hours-per-week',
        description: 'Maximaal aantal werkuren per week',
        result: 'pass',
        details: `Werktijd van ${hours.toFixed(1)} uur is binnen het maximum van ${WORKING_TIME_RULES.MAX_HOURS_PER_WEEK} uur in week ${weekKey}`,
        timestamp: new Date().toISOString(),
        relatedEmployeeId: timeRegistrations[0].employeeId
      });
    }
  });
  
  return checks;
}

/**
 * Helper functie om het weeknummer te bepalen
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
