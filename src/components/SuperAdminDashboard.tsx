import React, { useState } from 'react';
import { CompanySettings, LeaveTypeConfig, LeaveRequest, Employee, Department } from '../types';
import { DEFAULT_LEAVE_TYPES, DEFAULT_COMPANY_SETTINGS, formatDateEs } from '../utils/vacationCalculator';
import { 
  ShieldCheck, 
  Settings, 
  Award, 
  Layers, 
  Clock, 
  FileSpreadsheet, 
  Save, 
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Building2,
  Edit,
  X,
  Users
} from 'lucide-react';

interface SuperAdminDashboardProps {
  adminUser: Employee;
  settings: CompanySettings;
  onUpdateSettings: (newSettings: CompanySettings) => void;
  requests: LeaveRequest[];
  employees: Employee[];
  departments: Department[];
  onAddDepartment: (newDept: Omit<Department, 'id'>) => void;
  onUpdateDepartment: (dept: Department) => void;
  onDeleteDepartment: (deptId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  adminUser,
  settings,
  onUpdateSettings,
  requests,
  employees,
  departments,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
}) => {
  const [activeTab, setActiveTab] = useState<'SCALE' | 'DEPARTMENTS' | 'LEAVE_TYPES' | 'AUDIT'>('DEPARTMENTS');
  const [localSettings, setLocalSettings] = useState<CompanySettings>(settings);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>(DEFAULT_LEAVE_TYPES);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Department modal / form state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptName, setDeptName] = useState<string>('');
  const [deptCode, setDeptCode] = useState<string>('');
  const [deptColor, setDeptColor] = useState<string>('bg-purple-600');
  const [deptManagerId, setDeptManagerId] = useState<string>('');
  const [deptDescription, setDeptDescription] = useState<string>('');
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);
  const [deptErrorNotice, setDeptErrorNotice] = useState<string | null>(null);

  const COLOR_OPTIONS = [
    { label: 'Púrpura', value: 'bg-purple-600' },
    { label: 'Azul', value: 'bg-blue-600' },
    { label: 'Esmeralda', value: 'bg-emerald-600' },
    { label: 'Ámbar', value: 'bg-amber-600' },
    { label: 'Índigo', value: 'bg-indigo-600' },
    { label: 'Rosa', value: 'bg-rose-600' },
    { label: 'Cian', value: 'bg-cyan-600' },
    { label: 'Teal', value: 'bg-teal-600' },
  ];

  const handleOpenAddDept = () => {
    setEditingDept(null);
    setDeptName('');
    setDeptCode('');
    setDeptColor('bg-purple-600');
    setDeptManagerId('');
    setDeptDescription('');
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setEditingDept(dept);
    setDeptName(dept.name);
    setDeptCode(dept.code);
    setDeptColor(dept.color);
    setDeptManagerId(dept.managerId || '');
    setDeptDescription(dept.description);
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartmentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;

    if (editingDept) {
      onUpdateDepartment({
        ...editingDept,
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        color: deptColor,
        managerId: deptManagerId || undefined,
        description: deptDescription.trim(),
      });
    } else {
      onAddDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        color: deptColor,
        managerId: deptManagerId || undefined,
        description: deptDescription.trim(),
      });
    }

    setIsDeptModalOpen(false);
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Build global audit history feed
  const allAuditLogs = requests.flatMap(r => {
    const emp = employees.find(e => e.id === r.employeeId);
    return r.history.map(h => ({
      ...h,
      requestTitle: `${r.typeCode} (${formatDateEs(r.startDate)} - ${formatDateEs(r.endDate)})`,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : r.employeeId,
      requestId: r.id,
    }));
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 font-semibold text-xs px-2.5 py-1 rounded-full border border-amber-400/30">
                👑 Administrador General Superior
              </span>
              <span className="text-slate-300 text-xs font-medium">Configuración de Empresa & Parámetros</span>
            </div>
            <h1 className="text-xl font-bold mt-2">
              Panel de Control Global - {adminUser.firstName} {adminUser.lastName}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Creación de Gerencias de la Empresa, parametrización de escala de vacaciones, reglas de negocio y auditoría.
            </p>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Parámetros</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>¡Parámetros y escalas de vacaciones actualizados correctamente!</span>
          </div>
        )}

        {/* Sub Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Creación & Gestión de Gerencias ({departments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SCALE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCALE'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>Escala de Vacaciones por Antigüedad</span>
          </button>
          <button
            onClick={() => setActiveTab('LEAVE_TYPES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'LEAVE_TYPES'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Configuración de Tipos de Licencias</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AUDIT'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Lock className="w-4 h-4 text-sky-400" />
            <span>Trazabilidad & Log de Auditoría ({allAuditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* TAB: DEPARTMENTS (GERENCIAS MANAGEMENT - SUPER ADMIN EXCLUSIVE) */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-300/40">
                  Facultad Exclusiva del Administrador General
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  Estructura Organizacional: Creación y Gestión de Gerencias / Áreas
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define y administra las gerencias de la empresa, asigna gerentes de área responsables y organiza la dotación de personal.
                </p>
              </div>

              <button
                onClick={handleOpenAddDept}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nueva Gerencia</span>
              </button>
            </div>

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {departments.map((dept) => {
                const count = employees.filter(e => e.departmentId === dept.id).length;
                const mgr = employees.find(e => e.id === dept.managerId);

                return (
                  <div
                    key={dept.id}
                    className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold px-3 py-1 rounded-lg text-white shadow-xs ${dept.color}`}>
                          {dept.code}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{count} colaboradores</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {dept.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {dept.description}
                        </p>
                      </div>

                      {/* Manager info */}
                      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/60 text-xs">
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Gerente de Área Asignado</span>
                        {mgr ? (
                          <div className="flex items-center gap-2">
                            <img src={mgr.avatar} alt={mgr.firstName} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{mgr.firstName} {mgr.lastName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sin gerente asignado</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200/80 dark:border-slate-700/60">
                      <button
                        onClick={() => handleOpenEditDept(dept)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Editar Gerencia"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (count > 0) {
                            setDeptErrorNotice(`No se puede eliminar la gerencia "${dept.name}" porque posee ${count} empleado(s) asignado(s). Reasigne primero a los colaboradores.`);
                            return;
                          }
                          setDeptToDelete(dept);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Eliminar Gerencia"
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

      {/* TAB 1: SENIORITY SCALE CONFIG */}
      {activeTab === 'SCALE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Escala Legal / Corporativa de Días por Antigüedad
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configura los días de descanso anual remunerado acordes a los años de servicio en la empresa (Ley de Contrato de Trabajo de Argentina / Normativa Interna).
              </p>
            </div>

            <div className="space-y-3">
              {localSettings.seniorityScale.map((tier, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Desde {tier.minYears} hasta {tier.maxYears} años de antigüedad
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tier.minYears === 0 ? 'Empleados nuevos / Junior' : `Cumplidos ${tier.minYears} años de servicio`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Días asignados:</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={tier.vacationDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setLocalSettings(prev => ({
                          ...prev,
                          seniorityScale: prev.seniorityScale.map((s, i) => i === idx ? { ...s, vacationDays: val } : s)
                        }));
                      }}
                      className="w-20 font-bold text-center px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">días hábiles</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Business Parameters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              Reglas de Negocio & Parámetros
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Razón Social de la Empresa
                </label>
                <input
                  type="text"
                  value={localSettings.companyName}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  CUIT de la Empresa
                </label>
                <input
                  type="text"
                  value={localSettings.cuit}
                  onChange={(e) => setLocalSettings({ ...localSettings, cuit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Límite Máximo de Ausentismo por Área (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={localSettings.maxDepartmentAbsencePercentage}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxDepartmentAbsencePercentage: parseInt(e.target.value) || 30 })}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                  />
                  <span className="text-slate-500">% simultáneo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Si las solicitudes superan este porcentaje, el sistema activará la alerta de desabastecimiento operacional para el Gerente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE TYPES CONFIG */}
      {activeTab === 'LEAVE_TYPES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tipos de Licencias y Permisos Especiales
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Definición de requerimientos (certificado médico, preaviso en días, si descuenta de vacaciones o si es por horas).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveTypes.map((type) => (
              <div
                key={type.code}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-md border ${type.badgeBg}`}>
                    {type.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{type.code}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {type.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className={type.requiresAttachment ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                      {type.requiresAttachment ? '✓ Adjunto obligatorio' : '✗ Sin adjunto'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className={type.deductsFromVacation ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                      {type.deductsFromVacation ? 'Descuenta vacaciones' : 'Con goce de sueldo (No descuenta)'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG FEED */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Historial de Auditoría Global (Trazabilidad Inmutable)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Registro cronológico de todas las creaciones, aprobaciones de 1ª y 2ª línea, observaciones y rechazos del sistema.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allAuditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.actorName} ({log.actorRole}) - <span className="font-normal text-slate-600 dark:text-slate-300">{log.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Solicitud: <span className="font-semibold text-indigo-600">{log.requestTitle}</span> para <span className="font-semibold text-slate-700 dark:text-slate-200">{log.employeeName}</span>
                    </div>
                    {log.comment && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                        "{log.comment}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT CREATION / EDIT MODAL (SUPER ADMIN ONLY) */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingDept ? 'Editar Gerencia' : 'Crear Nueva Gerencia'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Parametrización de estructura organizacional (Exclusivo Administrador General)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeptModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartmentForm} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nombre de la Gerencia / Área <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Marketing & Comunicaciones"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Código Identificador <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ej: MKT"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Color Distintivo
                  </label>
                  <select
                    value={deptColor}
                    onChange={(e) => setDeptColor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {COLOR_OPTIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Gerente de Área Responsable (Opcional)
                </label>
                <select
                  value={deptManagerId}
                  onChange={(e) => setDeptManagerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">-- Sin Gerente Asignado --</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.position})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Descripción del Área
                </label>
                <textarea
                  rows={3}
                  placeholder="Descripción del alcance y responsabilidades del área..."
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDeptModalOpen(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
                >
                  {editingDept ? 'Guardar Cambios' : 'Crear Gerencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: SENIORITY SCALE CONFIG */}
      {activeTab === 'SCALE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Escala Legal / Corporativa de Días por Antigüedad
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configura los días de descanso anual remunerado acordes a los años de servicio en la empresa (Ley de Contrato de Trabajo de Argentina / Normativa Interna).
              </p>
            </div>

            <div className="space-y-3">
              {localSettings.seniorityScale.map((tier, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Desde {tier.minYears} hasta {tier.maxYears} años de antigüedad
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {tier.minYears === 0 ? 'Empleados nuevos / Junior' : `Cumplidos ${tier.minYears} años de servicio`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Días asignados:</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={tier.vacationDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setLocalSettings(prev => ({
                          ...prev,
                          seniorityScale: prev.seniorityScale.map((s, i) => i === idx ? { ...s, vacationDays: val } : s)
                        }));
                      }}
                      className="w-20 font-bold text-center px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">días hábiles</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Col: Business Parameters */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              Reglas de Negocio & Parámetros
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Razón Social de la Empresa
                </label>
                <input
                  type="text"
                  value={localSettings.companyName}
                  onChange={(e) => setLocalSettings({ ...localSettings, companyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  CUIT de la Empresa
                </label>
                <input
                  type="text"
                  value={localSettings.cuit}
                  onChange={(e) => setLocalSettings({ ...localSettings, cuit: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Límite Máximo de Ausentismo por Área (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={localSettings.maxDepartmentAbsencePercentage}
                    onChange={(e) => setLocalSettings({ ...localSettings, maxDepartmentAbsencePercentage: parseInt(e.target.value) || 30 })}
                    className="w-24 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                  />
                  <span className="text-slate-500">% simultáneo</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Si las solicitudes superan este porcentaje, el sistema activará la alerta de desabastecimiento operacional para el Gerente.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE TYPES CONFIG */}
      {activeTab === 'LEAVE_TYPES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tipos de Licencias y Permisos Especiales
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Definición de requerimientos (certificado médico, preaviso en días, si descuenta de vacaciones o si es por horas).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaveTypes.map((type) => (
              <div
                key={type.code}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-md border ${type.badgeBg}`}>
                    {type.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{type.code}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {type.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className={type.requiresAttachment ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                      {type.requiresAttachment ? '✓ Adjunto obligatorio' : '✗ Sin adjunto'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                    <span className={type.deductsFromVacation ? 'text-amber-600 font-bold' : 'text-emerald-600'}>
                      {type.deductsFromVacation ? 'Descuenta vacaciones' : 'Con goce de sueldo (No descuenta)'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOG FEED */}
      {activeTab === 'AUDIT' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Historial de Auditoría Global (Trazabilidad Inmutable)
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Registro cronológico de todas las creaciones, aprobaciones de 1ª y 2ª línea, observaciones y rechazos del sistema.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allAuditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.actorName} ({log.actorRole}) - <span className="font-normal text-slate-600 dark:text-slate-300">{log.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Solicitud: <span className="font-semibold text-indigo-600">{log.requestTitle}</span> para <span className="font-semibold text-slate-700 dark:text-slate-200">{log.employeeName}</span>
                    </div>
                    {log.comment && (
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg">
                        "{log.comment}"
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPT ERROR NOTICE MODAL (IFRAME-SAFE) */}
      {deptErrorNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Imposible Eliminar Gerencia</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {deptErrorNotice}
            </p>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDeptErrorNotice(null)}
                className="px-5 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEPT CONFIRM DELETE MODAL (IFRAME-SAFE) */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Eliminar Gerencia</h3>
                <p className="text-xs text-slate-500">Configuración de Estructura Organizacional</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Confirms eliminar la gerencia <strong className="text-slate-900 dark:text-white">{deptToDelete.name} ({deptToDelete.code})</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setDeptToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteDepartment(deptToDelete.id);
                  setDeptToDelete(null);
                }}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                Sí, Eliminar Gerencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
