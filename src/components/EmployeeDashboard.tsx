import React, { useState } from 'react';
import { Employee, LeaveRequest, VacationBalance, LeaveTypeConfig } from '../types';
import { DEFAULT_LEAVE_TYPES, formatDateEs } from '../utils/vacationCalculator';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Plus, 
  AlertCircle,
  Briefcase,
  Award,
  ChevronRight,
  Sparkles,
  Paperclip
} from 'lucide-react';

interface EmployeeDashboardProps {
  employee: Employee;
  balance: VacationBalance;
  requests: LeaveRequest[];
  onOpenNewRequest: () => void;
  onSelectRequest: (request: LeaveRequest) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  employee,
  balance,
  requests,
  onOpenNewRequest,
  onSelectRequest,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const myRequests = requests.filter(r => r.employeeId === employee.id);

  const filteredRequests = myRequests.filter(r => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return r.status === 'PENDING_MANAGER' || r.status === 'APPROVED_MANAGER';
    if (statusFilter === 'APPROVED') return r.status === 'APPROVED_FINAL';
    if (statusFilter === 'REJECTED') return r.status === 'REJECTED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Pendiente Aprobación Gerente
          </span>
        );
      case 'APPROVED_MANAGER':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            Aprobado por Gerente (Pendiente RRHH)
          </span>
        );
      case 'APPROVED_FINAL':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Aprobación Definitiva (RRHH)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            Rechazada
          </span>
        );
      default:
        return null;
    }
  };

  const getLeaveType = (code: string): LeaveTypeConfig => {
    return DEFAULT_LEAVE_TYPES.find(t => t.code === code) || DEFAULT_LEAVE_TYPES[0];
  };

  return (
    <div className="space-y-6">
      {/* Header Profile & Seniority Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={employee.avatar}
              alt={employee.firstName}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 dark:ring-slate-800 shadow-sm"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                ¡Hola, {employee.firstName}!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {employee.position} &bull; <span className="font-medium text-slate-700 dark:text-slate-300">Antigüedad: {balance.seniorityYears} años</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-md">
                  Fecha de Alta: {formatDateEs(employee.hireDate)}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium px-2.5 py-0.5 rounded-md">
                  Edad: {employee.age} años
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenNewRequest}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all w-full lg:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            <span>Solicitar Licencia / Vacaciones</span>
          </button>
        </div>
      </div>

      {/* Balance Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accrued */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Derecho Anual (Antigüedad)</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {balance.totalEntitledDays} <span className="text-sm font-normal text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Calculado para {balance.seniorityYears} años de servicio
          </p>
        </div>

        {/* Days Taken */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>Días Gozados (Aprobados)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {balance.daysTaken} <span className="text-sm font-normal text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Vacaciones acumuladas aprobadas
          </p>
        </div>

        {/* Days Pending */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
            <span>En Trámite de Aprobación</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {balance.daysPending} <span className="text-sm font-normal text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Pendiente de Gerencia / RRHH
          </p>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-tr from-indigo-900 to-indigo-800 text-white p-5 rounded-2xl shadow-md shadow-indigo-900/20 relative overflow-hidden">
          <div className="flex items-center justify-between text-indigo-200 text-xs font-medium mb-2">
            <span>Saldo Disponible Restante</span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-3xl font-extrabold text-white">
            {balance.daysAvailable} <span className="text-sm font-normal text-indigo-200">días</span>
          </div>
          <p className="text-[11px] text-indigo-200 mt-2">
            Disponibles para solicitar este año
          </p>
        </div>
      </div>

      {/* Requests History Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Solicitudes y Licencias
            </h2>
            <p className="text-xs text-slate-500">
              Seguimiento transparente del estado de tus solicitudes paso a paso.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Todas ({myRequests.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'PENDING'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              En Revisión
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'APPROVED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Aprobadas
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'REJECTED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Rechazadas
            </button>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No se encontraron solicitudes
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No tienes licencias registradas en esta categoría. Puedes hacer clic en "Nueva Solicitud" para cargar un pedido.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRequests.map((req) => {
              const type = getLeaveType(req.typeCode);
              return (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-12 rounded-full ${type.color} shrink-0 mt-0.5`} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${type.badgeBg}`}>
                          {type.name}
                        </span>
                        {req.attachmentName && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            <Paperclip className="w-3 h-3 text-slate-400" />
                            Certificado Adjunto
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {formatDateEs(req.startDate)} al {formatDateEs(req.endDate)}
                        {req.startTime && (
                          <span className="text-xs font-normal text-slate-500 ml-2">
                            ({req.startTime} a {req.endTime} hs)
                          </span>
                        )}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {req.workingDays} {req.workingDays === 1 ? 'día hábil' : 'días hábiles'}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(req.status)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
