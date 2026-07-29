import React from 'react';
import { LeaveRequest, Employee, Department, LeaveTypeConfig } from '../types';
import { DEFAULT_LEAVE_TYPES, formatDateEs } from '../utils/vacationCalculator';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  FileText, 
  Paperclip, 
  User, 
  Briefcase, 
  Printer,
  History,
  ShieldCheck
} from 'lucide-react';

interface RequestDetailDrawerProps {
  request: LeaveRequest;
  employees: Employee[];
  departments: Department[];
  onClose: () => void;
}

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  request,
  employees,
  departments,
  onClose,
}) => {
  const employee = employees.find(e => e.id === request.employeeId);
  const type: LeaveTypeConfig = DEFAULT_LEAVE_TYPES.find(t => t.code === request.typeCode) || DEFAULT_LEAVE_TYPES[0];
  const dept = departments.find(d => d.id === request.departmentId);

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl border-l sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-slide-left overflow-hidden">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-10 rounded-full ${type.color}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${type.badgeBg}`}>
                  {type.name}
                </span>
                <span className="text-xs font-mono text-slate-400">#{request.id}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                Detalle Auditor de Licencia
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCertificate}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Imprimir Certificado de Ausencia"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          {/* Employee Info Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
            <img
              src={employee?.avatar}
              alt={employee?.firstName}
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {employee?.firstName} {employee?.lastName}
              </h3>
              <p className="text-slate-500">
                {employee?.position} &bull; <span className="font-semibold text-slate-700 dark:text-slate-300">Área: {dept?.name}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Alta en la Empresa: {formatDateEs(employee?.hireDate || '')}
              </p>
            </div>
          </div>

          {/* Leave Dates & Reason */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-500">
              Datos de la Solicitud
            </h4>

            <div className="grid grid-cols-2 gap-3 bg-indigo-50/50 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900">
              <div>
                <span className="text-slate-500 block mb-0.5">Período de Ausencia</span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {formatDateEs(request.startDate)} al {formatDateEs(request.endDate)}
                </span>
                {request.startTime && (
                  <span className="block text-[11px] text-slate-500">
                    Horario: {request.startTime} hs a {request.endTime} hs
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Días Hábiles Cómputo</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                  {request.workingDays} {request.workingDays === 1 ? 'día hábil' : 'días hábiles'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Motivo:</span>
              <p className="text-slate-600 dark:text-slate-300 italic">"{request.reason}"</p>
            </div>

            {request.attachmentName && (
              <div className="p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 flex items-center gap-2 font-medium">
                <Paperclip className="w-4 h-4 text-indigo-500" />
                <span>Documento Adjunto: {request.attachmentName}</span>
              </div>
            )}
          </div>

          {/* AUDIT TIMELINE (Historial Detallado de Estados) */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Historial Detallado de Estados (Auditoría multinivel)
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {request.history.map((step, idx) => {
                const stepDate = new Date(step.timestamp);
                return (
                  <div key={step.id || idx} className="relative group">
                    {/* Circle Node */}
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {step.actorName} <span className="text-[11px] font-normal text-slate-500">({step.actorRole})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {stepDate.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        Estado asignado: {step.status}
                      </div>

                      {step.comment && (
                        <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                          "{step.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
