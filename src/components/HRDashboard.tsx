import React, { useState } from 'react';
import { Employee, LeaveRequest, Department, LeaveTypeConfig, JobPosition } from '../types';
import { DEFAULT_LEAVE_TYPES, calculateVacationBalance, formatDateEs } from '../utils/vacationCalculator';
import { 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Search, 
  FileCheck2, 
  Building2, 
  Download, 
  Clock, 
  Paperclip,
  Briefcase,
  Award,
  Filter,
  UserCheck,
  Plus,
  Edit,
  Trash2,
  X,
  Users
} from 'lucide-react';

interface HRDashboardProps {
  hrUser: Employee;
  employees: Employee[];
  requests: LeaveRequest[];
  departments: Department[];
  positions: JobPosition[];
  onFinalApproveByHR: (requestId: string, comment?: string) => void;
  onFinalRejectByHR: (requestId: string, reason: string) => void;
  onOpenAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee?: (employeeId: string) => void;
  onSelectRequest: (request: LeaveRequest) => void;
  onAddPosition: (newPos: Omit<JobPosition, 'id'>) => void;
  onUpdatePosition: (pos: JobPosition) => void;
  onDeletePosition: (posId: string) => void;
}

export const HRDashboard: React.FC<HRDashboardProps> = ({
  hrUser,
  employees,
  requests,
  departments,
  positions,
  onFinalApproveByHR,
  onFinalRejectByHR,
  onOpenAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onSelectRequest,
  onAddPosition,
  onUpdatePosition,
  onDeletePosition,
}) => {
  const [activeTab, setActiveTab] = useState<'APPROVALS' | 'ROSTER' | 'POSITIONS'>('APPROVALS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [rejectReqModal, setRejectReqModal] = useState<LeaveRequest | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [hrCommentInput, setHrCommentInput] = useState<{ [key: string]: string }>({});

  // Confirmation Modals for Deletions (Iframe-safe)
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);
  const [posToDelete, setPosToDelete] = useState<JobPosition | null>(null);

  // Position Modal state (HR Exclusive)
  const [isPosModalOpen, setIsPosModalOpen] = useState<boolean>(false);
  const [editingPos, setEditingPos] = useState<JobPosition | null>(null);
  const [posTitle, setPosTitle] = useState<string>('');
  const [posDeptId, setPosDeptId] = useState<string>('');
  const [posLevel, setPosLevel] = useState<'Junior' | 'Semi-Senior' | 'Senior' | 'Lead' | 'Gerencial' | 'Directivo'>('Semi-Senior');
  const [posDescription, setPosDescription] = useState<string>('');

  const handleOpenAddPosition = () => {
    setEditingPos(null);
    setPosTitle('');
    setPosDeptId(departments[0]?.id || '');
    setPosLevel('Semi-Senior');
    setPosDescription('');
    setIsPosModalOpen(true);
  };

  const handleOpenEditPosition = (pos: JobPosition) => {
    setEditingPos(pos);
    setPosTitle(pos.title);
    setPosDeptId(pos.departmentId || '');
    setPosLevel(pos.level || 'Semi-Senior');
    setPosDescription(pos.description || '');
    setIsPosModalOpen(true);
  };

  const handleSavePositionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!posTitle.trim()) return;

    if (editingPos) {
      onUpdatePosition({
        ...editingPos,
        title: posTitle.trim(),
        departmentId: posDeptId || undefined,
        level: posLevel,
        description: posDescription.trim(),
      });
    } else {
      onAddPosition({
        title: posTitle.trim(),
        departmentId: posDeptId || undefined,
        level: posLevel,
        description: posDescription.trim(),
      });
    }

    setIsPosModalOpen(false);
  };

  // Requests waiting for 2nd stage HR final approval
  const pendingHRRequests = requests.filter(r => r.status === 'APPROVED_MANAGER');

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = 
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesDept = departmentFilter === 'ALL' || e.departmentId === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const getLeaveType = (code: string): LeaveTypeConfig => {
    return DEFAULT_LEAVE_TYPES.find(t => t.code === code) || DEFAULT_LEAVE_TYPES[0];
  };

  const getDepartmentName = (deptId: string): string => {
    const d = departments.find(dept => dept.id === deptId);
    return d ? d.name : deptId;
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['ID', 'Nombre', 'Apellido', 'Puesto', 'Área', 'Fecha Alta', 'Antigüedad (Años)', 'Días Base', 'Días Tomados', 'Días Disponibles'].join(','),
      ...employees.map(e => {
        const bal = calculateVacationBalance(e, requests);
        return [
          e.id,
          `"${e.firstName}"`,
          `"${e.lastName}"`,
          `"${e.position}"`,
          `"${getDepartmentName(e.departmentId)}"`,
          e.hireDate,
          bal.seniorityYears,
          bal.totalEntitledDays,
          bal.daysTaken,
          bal.daysAvailable
        ].join(',');
      })
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Legajos_Personal_LicenciaPro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HR Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-purple-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/30 text-purple-200 font-semibold text-xs px-2.5 py-1 rounded-full border border-purple-400/30">
                2ª Línea - Aprobación Definitiva & Coordinación
              </span>
              <span className="text-purple-200 text-xs font-medium">Recursos Humanos</span>
            </div>
            <h1 className="text-xl font-bold mt-2">
              Gestión de RRHH - {hrUser.firstName} {hrUser.lastName}
            </h1>
            <p className="text-xs text-purple-200 mt-1">
              Coordinación centralizada de licencias, control de antigüedad, saldos anuales y legajos de personal de la empresa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={onOpenAddEmployee}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-purple-950 hover:bg-purple-50 shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4 text-purple-700" />
              <span>Nuevo Empleado</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-purple-800/60 hover:bg-purple-800 text-white border border-purple-700 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Legajos (CSV)</span>
            </button>
          </div>
        </div>

        {/* Inner Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-purple-800/60">
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'APPROVALS'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-purple-200 hover:bg-purple-800/40'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Aprobación Definitiva RRHH ({pendingHRRequests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ROSTER')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ROSTER'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-purple-200 hover:bg-purple-800/40'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Legajos & Saldos de Personal ({employees.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('POSITIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'POSITIONS'
                ? 'bg-white text-purple-950 shadow-sm'
                : 'text-purple-200 hover:bg-purple-800/40'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Catálogo & Creación de Puestos ({positions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PENDING FINAL APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
              Solicitudes Aprobadas por Gerente (Pendientes de Firma Final RRHH)
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {pendingHRRequests.length} en espera
            </span>
          </div>

          {pendingHRRequests.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                No hay solicitudes pendientes de validación por RRHH
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Las solicitudes pre-aprobadas por los Gerentes de Área aparecerán aquí para la validación definitiva de sueldo y cómputo de días.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingHRRequests.map((req) => {
                const emp = employees.find(e => e.id === req.employeeId);
                const type = getLeaveType(req.typeCode);
                const balance = emp ? calculateVacationBalance(emp, requests) : null;
                const managerApprovalStep = req.history.find(h => h.status === 'APPROVED_MANAGER');

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
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/20"
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {emp?.firstName} {emp?.lastName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {emp?.position} &bull; Área: <span className="font-semibold">{getDepartmentName(emp?.departmentId || '')}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${type.badgeBg}`}>
                          {type.name}
                        </span>
                        {balance && (
                          <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                            Saldo Disponible: {balance.daysAvailable} días
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pre-approval Manager Audit Note */}
                    {managerApprovalStep && (
                      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 p-3 rounded-xl text-xs space-y-1">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          Aprobado por Gerente de Área: {managerApprovalStep.actorName} ({formatDateEs(managerApprovalStep.timestamp.split('T')[0])})
                        </div>
                        {managerApprovalStep.comment && (
                          <p className="italic text-slate-600 dark:text-slate-300 pl-5">
                            "{managerApprovalStep.comment}"
                          </p>
                        )}
                      </div>
                    )}

                    {/* Request Details */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Período Solicitado: {formatDateEs(req.startDate)} al {formatDateEs(req.endDate)} ({req.workingDays} días hábiles)
                        </span>
                        <button
                          onClick={() => onSelectRequest(req)}
                          className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
                        >
                          Ver Historial Auditor &rarr;
                        </button>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{req.reason}"
                      </p>

                      {req.attachmentName && (
                        <div className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Documento adjunto verificado: {req.attachmentName}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Nota final de liquidación para el legajo..."
                        value={hrCommentInput[req.id] || ''}
                        onChange={(e) => setHrCommentInput(prev => ({ ...prev, [req.id]: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          onClick={() => {
                            setRejectReqModal(req);
                            setRejectReason('');
                          }}
                          className="flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all w-full sm:w-auto"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Rechazar RRHH</span>
                        </button>

                        <button
                          onClick={() => onFinalApproveByHR(req.id, hrCommentInput[req.id])}
                          className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all w-full sm:w-auto"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Aprobación Definitiva (Descontar Días)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EMPLOYEE ROSTER & VACATION BALANCES */}
      {activeTab === 'ROSTER' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, puesto o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Todas las Áreas</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">Empleado / Puesto</th>
                  <th className="p-4">Área</th>
                  <th className="p-4">Alta Empresa</th>
                  <th className="p-4 text-center">Antigüedad</th>
                  <th className="p-4 text-center">Derecho Anual</th>
                  <th className="p-4 text-center">Días Gozados</th>
                  <th className="p-4 text-center">Saldo Disponible</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredEmployees.map((emp) => {
                  const balance = calculateVacationBalance(emp, requests);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp.avatar}
                            alt={emp.firstName}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {emp.position} &bull; {emp.age} años
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                        {getDepartmentName(emp.departmentId)}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">
                        {formatDateEs(emp.hireDate)}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {balance.seniorityYears} {balance.seniorityYears === 1 ? 'año' : 'años'}
                      </td>
                      <td className="p-4 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {balance.totalEntitledDays} días
                      </td>
                      <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                        {balance.daysTaken} días
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {balance.daysAvailable} días
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditEmployee(emp)}
                            className="px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 rounded-lg border border-purple-200 dark:border-purple-800 transition-all"
                          >
                            Editar Legajo
                          </button>
                          {onDeleteEmployee && (
                            <button
                              onClick={() => setEmpToDelete(emp)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                              title="Eliminar Legajo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: POSITIONS MANAGEMENT (HR EXCLUSIVE) */}
      {activeTab === 'POSITIONS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-purple-300/40">
                  Facultad Exclusiva de Gerencia de RRHH
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Catálogo Oficial y Creación de Puestos / Cargos
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Crea y gestiona los puestos de la compañía, asigna niveles jerárquicos y vincula a las gerencias para la selección e incorporación de personal.
                </p>
              </div>

              <button
                onClick={handleOpenAddPosition}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Puesto</span>
              </button>
            </div>

            {/* Positions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {positions.map((pos) => {
                const count = employees.filter(e => e.position.toLowerCase() === pos.title.toLowerCase()).length;
                const dept = departments.find(d => d.id === pos.departmentId);

                const getLevelBadgeColor = (level?: string) => {
                  switch (level) {
                    case 'Directivo': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300';
                    case 'Gerencial': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300';
                    case 'Lead': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-300';
                    case 'Senior': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-300';
                    case 'Semi-Senior': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300';
                    default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
                  }
                };

                return (
                  <div
                    key={pos.id}
                    className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-700 transition-all shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeColor(pos.level)}`}>
                          {pos.level || 'Semi-Senior'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{count} ocupantes</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {pos.title}
                        </h3>
                        {dept && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`w-2 h-2 rounded-full ${dept.color}`} />
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{dept.name} ({dept.code})</span>
                          </div>
                        )}
                        {pos.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                            {pos.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                      <button
                        onClick={() => handleOpenEditPosition(pos)}
                        className="p-1.5 text-slate-600 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Editar Puesto"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPosToDelete(pos)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Eliminar Puesto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POSITION CREATION / EDIT MODAL (HR EXCLUSIVE) */}
      {isPosModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingPos ? 'Editar Puesto' : 'Crear Nuevo Puesto en Catálogo'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Definición de puesto / cargo corporativo (Exclusivo Gerente de RRHH)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPosModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePositionForm} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Título del Puesto / Cargo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Analista de Capital Humano, Líder de Sistemas..."
                  value={posTitle}
                  onChange={(e) => setPosTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gerencia / Área habitual
                  </label>
                  <select
                    value={posDeptId}
                    onChange={(e) => setPosDeptId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">-- Sin Gerencia Específica --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nivel Jerárquico / Seniority
                  </label>
                  <select
                    value={posLevel}
                    onChange={(e) => setPosLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Junior">Junior</option>
                    <option value="Semi-Senior">Semi-Senior</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead / Coordinador</option>
                    <option value="Gerencial">Gerencial</option>
                    <option value="Directivo">Directivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Descripción del Puesto / Perfil
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción de responsabilidades y perfil requerido para el puesto..."
                  value={posDescription}
                  onChange={(e) => setPosDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPosModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md"
                >
                  {editingPos ? 'Guardar Cambios' : 'Crear Puesto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectReqModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 text-rose-600">
              <XCircle className="w-5 h-5" />
              Rechazo Definitivo de Licencia por RRHH
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Ingresa el motivo administrativo para rechazar la solicitud en 2ª instancia:
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ej: Inconsistencia de documentación médica / Saldo insuficiente..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectReqModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    onFinalRejectByHR(rejectReqModal.id, rejectReason);
                    setRejectReqModal(null);
                  }
                }}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 text-white rounded-xl disabled:opacity-50"
              >
                Confirmar Rechazo Definitivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE EMPLOYEE MODAL (IFRAME-SAFE) */}
      {empToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Eliminar Legajo de Empleado</h3>
                <p className="text-xs text-slate-500">Acción irreversible de Recursos Humanos</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Está seguro de eliminar definitivamente el legajo de <strong className="text-slate-900 dark:text-white">{empToDelete.firstName} {empToDelete.lastName}</strong>? El colaborador será removido de la nómina y legajos.
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEmpToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (onDeleteEmployee) {
                    onDeleteEmployee(empToDelete.id);
                  }
                  setEmpToDelete(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Sí, Eliminar Legajo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE POSITION MODAL (IFRAME-SAFE) */}
      {posToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Eliminar Puesto del Catálogo</h3>
                <p className="text-xs text-slate-500">Gestión de Catálogo Corporativo</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Confirma eliminar el puesto <strong className="text-slate-900 dark:text-white">{posToDelete.title}</strong> del catálogo oficial?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPosToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeletePosition(posToDelete.id);
                  setPosToDelete(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Sí, Eliminar Puesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
