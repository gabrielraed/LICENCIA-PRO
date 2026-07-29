import React, { useState } from 'react';
import { Employee, LeaveRequest, Department, LeaveTypeConfig } from '../types';
import { DEFAULT_LEAVE_TYPES, checkDepartmentOverlap, formatDateEs } from '../utils/vacationCalculator';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Calendar, 
  FileText, 
  Paperclip,
  ShieldAlert,
  Search,
  MessageSquare
} from 'lucide-react';

interface AreaManagerDashboardProps {
  manager: Employee;
  employees: Employee[];
  requests: LeaveRequest[];
  departments: Department[];
  onApproveByManager: (requestId: string, comment?: string) => void;
  onRejectByManager: (requestId: string, reason: string) => void;
  onSelectRequest: (request: LeaveRequest) => void;
}

export const AreaManagerDashboard: React.FC<AreaManagerDashboardProps> = ({
  manager,
  employees,
  requests,
  departments,
  onApproveByManager,
  onRejectByManager,
  onSelectRequest,
}) => {
  const [selectedReqForReject, setSelectedReqForReject] = useState<LeaveRequest | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [approvalCommentInput, setApprovalCommentInput] = useState<{ [key: string]: string }>({});

  const myDepartment = departments.find(d => d.id === manager.departmentId);
  const myTeam = employees.filter(e => e.departmentId === manager.departmentId && e.id !== manager.id);

  // Filter pending manager requests for employees in this manager's department or reporting to this manager
  const pendingRequests = requests.filter(r => {
    if (r.status !== 'PENDING_MANAGER') return false;
    const emp = employees.find(e => e.id === r.employeeId);
    return emp && (emp.managerId === manager.id || emp.departmentId === manager.departmentId);
  });

  const getLeaveType = (code: string): LeaveTypeConfig => {
    return DEFAULT_LEAVE_TYPES.find(t => t.code === code) || DEFAULT_LEAVE_TYPES[0];
  };

  const handleConfirmReject = () => {
    if (!selectedReqForReject || !rejectionReasonInput.trim()) return;
    onRejectByManager(selectedReqForReject.id, rejectionReasonInput);
    setSelectedReqForReject(null);
    setRejectionReasonInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 font-semibold text-xs px-2.5 py-1 rounded-full border border-blue-400/30">
                1ª Línea de Aprobación
              </span>
              <span className="text-slate-300 text-xs font-medium">
                {myDepartment?.name || 'Departamento'}
              </span>
            </div>
            <h1 className="text-xl font-bold mt-2">
              Panel de Gerencia de Área - {manager.firstName} {manager.lastName}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Revisión operacional de ausencias y licencias para mantener la cobertura de tu equipo ({myTeam.length} colaboradores).
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-xs text-slate-300 font-medium">Pendientes por Aprobar</div>
              <div className="text-lg font-extrabold text-white">
                {pendingRequests.length} {pendingRequests.length === 1 ? 'solicitud' : 'solicitudes'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Approval Queue & Team Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pending Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Solicitudes Pendientes de tu Equipo
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {pendingRequests.length} pendientes
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ¡Todo al día! No hay solicitudes pendientes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Todas las licencias de tu área han sido revisadas. Cuando un colaborador solicite días, aparecerá aquí para tu aprobación de 1ª línea.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => {
                const emp = employees.find(e => e.id === req.employeeId);
                const type = getLeaveType(req.typeCode);
                const overlapCheck = checkDepartmentOverlap(
                  manager.departmentId,
                  req.startDate,
                  req.endDate,
                  employees,
                  requests
                );

                return (
                  <div
                    key={req.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
                  >
                    {/* Header Request */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp?.avatar}
                          alt={emp?.firstName}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {emp?.firstName} {emp?.lastName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {emp?.position} &bull; Antigüedad: {formatDateEs(emp?.hireDate || '')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${type.badgeBg}`}>
                          {type.name}
                        </span>
                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800">
                          {req.workingDays} {req.workingDays === 1 ? 'día hábil' : 'días hábiles'}
                        </span>
                      </div>
                    </div>

                    {/* Request Details & Dates */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Período: {formatDateEs(req.startDate)} al {formatDateEs(req.endDate)}
                          {req.startTime && ` (${req.startTime} hs a ${req.endTime} hs)`}
                        </span>
                        <button
                          onClick={() => onSelectRequest(req)}
                          className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                        >
                          Ver Historial Completo &rarr;
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{req.reason}"
                      </p>

                      {req.attachmentName && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Adjunto: {req.attachmentName}</span>
                        </div>
                      )}
                    </div>

                    {/* Overlap & Risk Indicator */}
                    {overlapCheck.isRisk ? (
                      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 p-3 rounded-xl flex items-start gap-2.5 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Advertencia de Cobertura de Área:</span> {overlapCheck.message}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Sin riesgos de desabastecimiento: Cobertura de área garantizada.</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Comentario para RRHH u observaciones..."
                        value={approvalCommentInput[req.id] || ''}
                        onChange={(e) => setApprovalCommentInput(prev => ({ ...prev, [req.id]: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => setSelectedReqForReject(req)}
                          className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all w-full sm:w-auto"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar</span>
                        </button>

                        <button
                          onClick={() => onApproveByManager(req.id, approvalCommentInput[req.id])}
                          className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all w-full sm:w-auto"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprobar (Pasar a RRHH)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Team Roster Summary */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-indigo-600" />
              Equipo a tu Cargo ({myTeam.length})
            </h3>

            <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
              {myTeam.map((emp) => {
                const activeAbsence = requests.find(r => r.employeeId === emp.id && r.status === 'APPROVED_FINAL');
                return (
                  <div key={emp.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={emp.avatar}
                        alt={emp.firstName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {emp.firstName} {emp.lastName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {emp.position}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {activeAbsence ? (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          Licencia Programada
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 justify-end">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Activo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal Dialog */}
      {selectedReqForReject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <XCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Motivo del Rechazo de Licencia
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Por favor indica el motivo por el cual no se puede aprobar la solicitud para que quede registrado en el historial auditable del colaborador.
            </p>

            <textarea
              rows={3}
              placeholder="Ej: Coincide con pico de entregas clave del área. Coordinar nuevas fechas..."
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedReqForReject(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReasonInput.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm disabled:opacity-50"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
