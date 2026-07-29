import { Employee, LeaveRequest, VacationBalance, CompanySettings, OverloadWarning, LeaveTypeConfig } from '../types';

export const DEFAULT_LEAVE_TYPES: LeaveTypeConfig[] = [
  {
    code: 'VACACIONES',
    name: 'Vacaciones Anuales',
    description: 'Período de descanso anual remunerado con goce de sueldo.',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300',
    requiresAttachment: false,
    deductsFromVacation: true,
    isHourly: false,
    advanceNoticeDays: 15,
  },
  {
    code: 'ENFERMEDAD',
    name: 'Licencia Médica / Enfermedad',
    description: 'Reposo por salud o accidente particular. Requiere certificado médico.',
    color: 'bg-rose-500',
    textColor: 'text-rose-700 dark:text-rose-300',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300',
    requiresAttachment: true,
    deductsFromVacation: false,
    isHourly: false,
    advanceNoticeDays: 0,
  },
  {
    code: 'MATERNIDAD_PATERNIDAD',
    name: 'Maternidad / Paternidad',
    description: 'Licencia por nacimiento o adopción según ley laboral.',
    color: 'bg-purple-500',
    textColor: 'text-purple-700 dark:text-purple-300',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800 dark:text-purple-300',
    requiresAttachment: true,
    deductsFromVacation: false,
    isHourly: false,
    advanceNoticeDays: 30,
  },
  {
    code: 'ESTUDIO',
    name: 'Licencia por Estudio / Examen',
    description: 'Días autorizados para exámenes universitarios o de capacitación.',
    color: 'bg-amber-500',
    textColor: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300',
    requiresAttachment: true,
    deductsFromVacation: false,
    isHourly: false,
    maxDaysPerYear: 10,
    advanceNoticeDays: 5,
  },
  {
    code: 'SALIDA_ESPECIAL',
    name: 'Permiso Especial / Salida por Horas',
    description: 'Permiso por horas dentro de la jornada laboral (trámites, médico express, etc.).',
    color: 'bg-sky-500',
    textColor: 'text-sky-700 dark:text-sky-300',
    badgeBg: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-300',
    requiresAttachment: false,
    deductsFromVacation: false,
    isHourly: true,
    advanceNoticeDays: 1,
  },
  {
    code: 'DUELO',
    name: 'Duelo Familiar',
    description: 'Licencia por fallecimiento de familiar directo.',
    color: 'bg-slate-600',
    textColor: 'text-slate-700 dark:text-slate-300',
    badgeBg: 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200',
    requiresAttachment: false,
    deductsFromVacation: false,
    isHourly: false,
    advanceNoticeDays: 0,
  },
  {
    code: 'DIA_PERSONAL',
    name: 'Día Personal / Trámite',
    description: 'Día libre de libre disponibilidad acordado con la gerencia.',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
    requiresAttachment: false,
    deductsFromVacation: true,
    isHourly: false,
    advanceNoticeDays: 3,
  },
];

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'TechCorp Argentina S.A.',
  cuit: '30-71234567-8',
  seniorityScale: [
    { minYears: 0, maxYears: 5, vacationDays: 14 },
    { minYears: 5, maxYears: 10, vacationDays: 21 },
    { minYears: 10, maxYears: 20, vacationDays: 28 },
    { minYears: 20, maxYears: 99, vacationDays: 35 },
  ],
  maxDepartmentAbsencePercentage: 30, // Max 30% absent in same area at once
  allowNegativeBalance: false,
};

/**
 * Calculates exact seniority in full years from hire date to current date.
 */
export function calculateSeniorityYears(hireDateStr: string, targetDateStr: string = '2026-12-31'): number {
  const hireDate = new Date(hireDateStr);
  const targetDate = new Date(targetDateStr);
  
  if (isNaN(hireDate.getTime())) return 0;
  
  let years = targetDate.getFullYear() - hireDate.getFullYear();
  const m = targetDate.getMonth() - hireDate.getMonth();
  
  if (m < 0 || (m === 0 && targetDate.getDate() < hireDate.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
}

/**
 * Calculates entitled annual vacation days based on seniority scale or custom base override.
 */
export function calculateEntitledVacationDays(
  hireDateStr: string, 
  baseVacationDaysOverride?: number,
  settings: CompanySettings = DEFAULT_COMPANY_SETTINGS
): number {
  const years = calculateSeniorityYears(hireDateStr);
  
  // Find matching tier
  const tier = settings.seniorityScale.find(
    s => years >= s.minYears && years < s.maxYears
  );
  
  const scaleDays = tier ? tier.vacationDays : 14;
  
  // If employee has a negotiated base higher than standard scale, keep the higher value
  if (baseVacationDaysOverride && baseVacationDaysOverride > scaleDays) {
    return baseVacationDaysOverride;
  }
  
  return scaleDays;
}

/**
 * Calculates working days between start and end date (inclusive), ignoring weekends (Sat, Sun).
 */
export function calculateWorkingDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Calculates vacation balance for an employee based on request history.
 */
export function calculateVacationBalance(
  employee: Employee,
  requests: LeaveRequest[],
  settings: CompanySettings = DEFAULT_COMPANY_SETTINGS
): VacationBalance {
  const seniorityYears = calculateSeniorityYears(employee.hireDate);
  const totalEntitledDays = calculateEntitledVacationDays(employee.hireDate, employee.baseVacationDays, settings);
  
  // Filter requests for this employee that deduct from vacation
  const employeeRequests = requests.filter(r => {
    if (r.employeeId !== employee.id) return false;
    const leaveType = DEFAULT_LEAVE_TYPES.find(t => t.code === r.typeCode);
    return leaveType ? leaveType.deductsFromVacation : false;
  });
  
  // Days approved
  const daysTaken = employeeRequests
    .filter(r => r.status === 'APPROVED_FINAL')
    .reduce((sum, r) => sum + r.workingDays, 0);
    
  // Days pending approval (either Manager or HR)
  const daysPending = employeeRequests
    .filter(r => r.status === 'PENDING_MANAGER' || r.status === 'APPROVED_MANAGER')
    .reduce((sum, r) => sum + r.workingDays, 0);
    
  const daysAvailable = totalEntitledDays - daysTaken - daysPending;
  
  return {
    employeeId: employee.id,
    hireDate: employee.hireDate,
    seniorityYears,
    totalEntitledDays,
    daysTaken,
    daysPending,
    daysAvailable,
  };
}

/**
 * Checks for department absence overload during a date range.
 */
export function checkDepartmentOverlap(
  departmentId: string,
  startDateStr: string,
  endDateStr: string,
  allEmployees: Employee[],
  allRequests: LeaveRequest[],
  thresholdPercent: number = 30
): { isRisk: boolean; absentEmployees: string[]; percentAbsent: number; message: string } {
  const deptEmployees = allEmployees.filter(e => e.departmentId === departmentId && e.isActive);
  if (deptEmployees.length === 0) {
    return { isRisk: false, absentEmployees: [], percentAbsent: 0, message: 'No hay personal registrado en el área.' };
  }
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const absentEmpIds = new Set<string>();
  
  // Find approved or pending requests overlapping the date range
  allRequests.forEach(req => {
    if (req.status === 'REJECTED' || req.status === 'CANCELLED') return;
    const reqStart = new Date(req.startDate);
    const reqEnd = new Date(req.endDate);
    
    // Check overlap
    if (reqStart <= end && reqEnd >= start) {
      const emp = deptEmployees.find(e => e.id === req.employeeId);
      if (emp) {
        absentEmpIds.add(`${emp.firstName} ${emp.lastName}`);
      }
    }
  });
  
  const absentCount = absentEmpIds.size;
  const percentAbsent = Math.round((absentCount / deptEmployees.length) * 100);
  const isRisk = percentAbsent >= thresholdPercent;
  
  const absentList = Array.from(absentEmpIds).join(', ');
  const message = isRisk 
    ? `⚠️ ALERTA DE COBERTURA: El ${percentAbsent}% del área estará ausente (${absentCount} de ${deptEmployees.length} empleados: ${absentList}).`
    : `Cobertura normal: ${percentAbsent}% de ausencias planificadas en el área.`;
    
  return {
    isRisk,
    absentEmployees: Array.from(absentEmpIds),
    percentAbsent,
    message,
  };
}

export function formatDateEs(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
