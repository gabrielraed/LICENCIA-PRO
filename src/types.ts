export type Role = 'SUPER_ADMIN' | 'HR_MANAGER' | 'AREA_MANAGER' | 'EMPLOYEE';

export type RequestStatus = 
  | 'PENDING_MANAGER' 
  | 'APPROVED_MANAGER' 
  | 'APPROVED_FINAL' 
  | 'REJECTED' 
  | 'CANCELLED';

export type LeaveTypeCode = 
  | 'VACACIONES' 
  | 'ENFERMEDAD' 
  | 'MATERNIDAD_PATERNIDAD' 
  | 'ESTUDIO' 
  | 'SALIDA_ESPECIAL' 
  | 'DUELO' 
  | 'DIA_PERSONAL';

export interface LeaveTypeConfig {
  code: LeaveTypeCode;
  name: string;
  description: string;
  color: string; // Tailwind background/badge color
  textColor: string;
  badgeBg: string;
  requiresAttachment: boolean;
  deductsFromVacation: boolean;
  isHourly: boolean;
  maxDaysPerYear?: number;
  advanceNoticeDays: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  color: string;
  managerId?: string;
  description: string;
}

export interface JobPosition {
  id: string;
  title: string;
  departmentId?: string;
  level?: 'Junior' | 'Semi-Senior' | 'Senior' | 'Lead' | 'Gerencial' | 'Directivo';
  description?: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  age: number;
  position: string; // Puesto
  departmentId: string; // Área
  managerId?: string; // Gerente al que reporta
  hireDate: string; // Fecha de alta en la empresa (YYYY-MM-DD)
  baseVacationDays: number; // Días base acordados
  role: Role;
  isActive: boolean;
  phone?: string;
  dni?: string;
}

export interface StatusHistoryItem {
  id: string;
  status: RequestStatus;
  actorId: string;
  actorName: string;
  actorRole: Role;
  timestamp: string; // ISO String
  comment?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  typeCode: LeaveTypeCode;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  workingDays: number;
  startTime?: string; // For SALIDA_ESPECIAL (e.g. "14:00")
  endTime?: string; // For SALIDA_ESPECIAL (e.g. "17:00")
  reason: string;
  attachmentName?: string;
  attachmentUrl?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  history: StatusHistoryItem[];
  departmentId: string;
  managerId?: string;
  rejectionReason?: string;
}

export interface VacationBalance {
  employeeId: string;
  hireDate: string;
  seniorityYears: number;
  totalEntitledDays: number; // Calculated base + seniority
  daysTaken: number;
  daysPending: number;
  daysAvailable: number;
}

export interface OverloadWarning {
  departmentId: string;
  departmentName: string;
  date: string;
  absentCount: number;
  totalCount: number;
  absentPercentage: number;
  isRisk: boolean;
}

export interface CompanySettings {
  companyName: string;
  logoUrl?: string;
  cuit: string;
  seniorityScale: {
    minYears: number;
    maxYears: number;
    vacationDays: number;
  }[];
  maxDepartmentAbsencePercentage: number; // e.g. 30% threshold
  allowNegativeBalance: boolean;
}

export interface UserPersona {
  id: string;
  employee: Employee;
  role: Role;
  label: string;
  description: string;
  badge: string;
}
