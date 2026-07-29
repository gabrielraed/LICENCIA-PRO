import React, { useState, useEffect } from 'react';
import { Employee, LeaveRequest, VacationBalance, LeaveTypeCode, LeaveTypeConfig, Department } from '../types';
import { DEFAULT_LEAVE_TYPES, calculateWorkingDays, checkDepartmentOverlap, formatDateEs } from '../utils/vacationCalculator';
import { 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Paperclip, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

interface NewRequestModalProps {
  employee: Employee;
  balance: VacationBalance;
  allEmployees: Employee[];
  allRequests: LeaveRequest[];
  departments: Department[];
  onClose: () => void;
  onSubmit: (requestData: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status'>) => void;
}

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  employee,
  balance,
  allEmployees,
  allRequests,
  departments,
  onClose,
  onSubmit,
}) => {
  const [typeCode, setTypeCode] = useState<LeaveTypeCode>('VACACIONES');
  const [startDate, setStartDate] = useState<string>('2026-08-15');
  const [endDate, setEndDate] = useState<string>('2026-08-21');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('12:00');
  const [reason, setReason] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<{ isRisk: boolean; message: string } | null>(null);
  const [isEvaluatingAi, setIsEvaluatingAi] = useState<boolean>(false);

  const selectedType: LeaveTypeConfig = DEFAULT_LEAVE_TYPES.find(t => t.code === typeCode) || DEFAULT_LEAVE_TYPES[0];
  const workingDays = calculateWorkingDays(startDate, endDate);

  // Check overlap whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      setIsEvaluatingAi(true);
      const overlap = checkDepartmentOverlap(
        employee.departmentId,
        startDate,
        endDate,
        allEmployees,
        allRequests
      );
      setAiAnalysis(overlap);
      setIsEvaluatingAi(false);
    }
  }, [startDate, endDate, employee.departmentId]);

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        setFileName(file.name);
        setIsUploading(false);
      }, 600);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    // Check balance for vacation
    if (selectedType.deductsFromVacation && workingDays > balance.daysAvailable) {
      alert(`⚠️ Saldo insuficiente: Has solicitado ${workingDays} días hábiles pero solo dispones de ${balance.daysAvailable} días disponibles.`);
      return;
    }

    onSubmit({
      employeeId: employee.id,
      typeCode,
      startDate,
      endDate,
      workingDays: selectedType.isHourly ? 1 : workingDays,
      startTime: selectedType.isHourly ? startTime : undefined,
      endTime: selectedType.isHourly ? endTime : undefined,
      reason,
      attachmentName: fileName || undefined,
      departmentId: employee.departmentId,
      managerId: employee.managerId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Nueva Solicitud de Licencia
              </h2>
              <p className="text-xs text-slate-500">
                Colaborador: {employee.firstName} {employee.lastName} &bull; Saldo Disponible: <span className="font-bold text-indigo-600">{balance.daysAvailable} días</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Leave Type Selector */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Tipo de Licencia o Permiso
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEFAULT_LEAVE_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.code}
                  onClick={() => setTypeCode(type.code)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    typeCode === type.code
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${type.color}`} />
                    <span className="truncate">{type.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {type.deductsFromVacation ? 'Descuenta vacaciones' : 'Con goce de sueldo'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dates & Hours selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Fecha de Inicio
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Fecha de Fin
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            {/* If Hourly Exit Permit */}
            {selectedType.isHourly && (
              <>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Hora Desde
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Hora Hasta
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}

            {/* Days Counter Summary */}
            <div className="sm:col-span-2 flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <span className="text-slate-500 font-medium">Cómputo Total de Días Hábiles:</span>
              <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                {selectedType.isHourly ? 'Permiso por horas (1 jornada)' : `${workingDays} días hábiles`}
              </span>
            </div>
          </div>

          {/* AI Coverage & Overlap Analysis Alert */}
          {aiAnalysis && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
              aiAnalysis.isRisk 
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
            }`}>
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">IA de Cobertura de Área:</span> {aiAnalysis.message}
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Motivo o Justificación <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe detalladamente el motivo de tu solicitud..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Attachment upload if required or optional */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Comprobante o Certificado Adjunto {selectedType.requiresAttachment ? '(Requerido)' : '(Opcional)'}
            </label>

            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleSimulatedFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1" />
              {isUploading ? (
                <span className="text-slate-500 font-semibold">Cargando archivo...</span>
              ) : fileName ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" />
                  {fileName}
                </span>
              ) : (
                <span className="text-slate-500">
                  Arrastra tu archivo aquí o <span className="text-indigo-600 font-semibold">haz clic para examinar</span> (PDF, PNG, JPG)
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/20 transition-all"
            >
              Enviar para Aprobación de Gerente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
