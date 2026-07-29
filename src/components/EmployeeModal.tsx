import React, { useState } from 'react';
import { Employee, Department, Role, JobPosition } from '../types';
import { calculateEntitledVacationDays, calculateSeniorityYears } from '../utils/vacationCalculator';
import { X, UserPlus, UserCheck, Award, Calendar, Building2, Briefcase, Trash2 } from 'lucide-react';

interface EmployeeModalProps {
  employeeToEdit?: Employee | null;
  departments: Department[];
  allEmployees: Employee[];
  positions?: JobPosition[];
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id'> | Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employeeToEdit,
  departments,
  allEmployees,
  positions = [],
  onClose,
  onSave,
  onDelete,
}) => {
  const [firstName, setFirstName] = useState(employeeToEdit?.firstName || '');
  const [lastName, setLastName] = useState(employeeToEdit?.lastName || '');
  const [email, setEmail] = useState(employeeToEdit?.email || '');
  const [age, setAge] = useState<number>(employeeToEdit?.age || 30);
  const [position, setPosition] = useState(employeeToEdit?.position || '');
  const [departmentId, setDepartmentId] = useState(employeeToEdit?.departmentId || departments[0]?.id || '');
  const [managerId, setManagerId] = useState<string>(employeeToEdit?.managerId || '');
  const [hireDate, setHireDate] = useState(employeeToEdit?.hireDate || '2022-01-15');
  const [baseVacationDays, setBaseVacationDays] = useState<number>(employeeToEdit?.baseVacationDays || 14);
  const [role, setRole] = useState<Role>(employeeToEdit?.role || 'EMPLOYEE');
  const [dni, setDni] = useState(employeeToEdit?.dni || '');
  const [phone, setPhone] = useState(employeeToEdit?.phone || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  const seniorityYears = calculateSeniorityYears(hireDate);
  const calculatedDays = calculateEntitledVacationDays(hireDate, baseVacationDays);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    const data = {
      ...(employeeToEdit ? { id: employeeToEdit.id } : {}),
      firstName,
      lastName,
      email,
      avatar: employeeToEdit?.avatar || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random()*100)}?w=150&auto=format&fit=crop&q=80`,
      age,
      position,
      departmentId,
      managerId: managerId || undefined,
      hireDate,
      baseVacationDays: Math.max(baseVacationDays, calculatedDays),
      role,
      isActive: true,
      dni,
      phone,
    };

    onSave(data as any);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-fade-in my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {employeeToEdit ? 'Editar Legajo de Empleado' : 'Alta de Nuevo Empleado'}
              </h2>
              <p className="text-xs text-slate-500">
                Registro completo de personal para el cálculo automático de vacaciones por antigüedad.
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Surname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nombre <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Apellido <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Email, Age & DNI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Email Corporativo <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Edad (Años)
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 25)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
              />
            </div>
          </div>

          {/* Position & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Puesto / Cargo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                list="positions-catalog"
                placeholder="Seleccione o ingrese puesto..."
                value={position}
                onChange={(e) => {
                  const val = e.target.value;
                  setPosition(val);
                  // Auto fill department if pos matches catalog
                  const foundPos = positions.find(p => p.title.toLowerCase() === val.toLowerCase());
                  if (foundPos && foundPos.departmentId) {
                    setDepartmentId(foundPos.departmentId);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <datalist id="positions-catalog">
                {positions.map(p => (
                  <option key={p.id} value={p.title}>{p.title} ({p.level || 'Puesto'})</option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Área / Departamento <span className="text-rose-500">*</span>
              </label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Direct Manager */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Gerente o Superior al que reporta (1ª Aprobación)
            </label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="">-- Sin Gerente asignado --</option>
              {allEmployees.map(e => (
                <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.position})</option>
              ))}
            </select>
          </div>

          {/* Date of Hire & Live Vacation preview */}
          <div className="bg-purple-50/60 dark:bg-purple-950/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-purple-950 dark:text-purple-200 block mb-1">
                  Fecha de Alta en la Empresa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={hireDate}
                  onChange={(e) => setHireDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-purple-950 dark:text-purple-200 block mb-1">
                  Días Base de Vacaciones
                </label>
                <input
                  type="number"
                  min={14}
                  max={60}
                  value={baseVacationDays}
                  onChange={(e) => setBaseVacationDays(parseInt(e.target.value) || 14)}
                  className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-extrabold text-center"
                />
              </div>
            </div>

            {/* Live calculation banner */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 font-medium">
              <span>Antigüedad Calculada: <strong>{seniorityYears} años</strong></span>
              <span>Días vacacionales según Ley/Escala: <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">{calculatedDays} días</strong></span>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Rol en el Sistema
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
            >
              <option value="EMPLOYEE">Empleado / Usuario (Solicitante)</option>
              <option value="AREA_MANAGER">Gerente de Área (1ª Línea de Aprobación)</option>
              <option value="HR_MANAGER">Gerente de RRHH (2ª Línea - Aprobación Definitiva)</option>
              <option value="SUPER_ADMIN">Administrador General Superior</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {employeeToEdit && onDelete ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2 animate-fade-in">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400">¿Eliminar legajo?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(employeeToEdit.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-all"
                  >
                    Sí, Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Legajo</span>
                </button>
              )
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-md shadow-purple-700/20"
              >
                {employeeToEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
