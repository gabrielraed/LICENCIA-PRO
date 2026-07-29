import React, { useState } from 'react';
import { Employee, LeaveRequest, Department, LeaveTypeConfig } from '../types';
import { DEFAULT_LEAVE_TYPES, formatDateEs } from '../utils/vacationCalculator';
import { 
  Calendar as CalendarIcon, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  CalendarDays,
  ArrowRight
} from 'lucide-react';

interface VacationMapProps {
  employees: Employee[];
  requests: LeaveRequest[];
  departments: Department[];
}

export const VacationMap: React.FC<VacationMapProps> = ({
  employees,
  requests,
  departments,
}) => {
  const [viewMode, setViewMode] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // August (0-indexed 7)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const monthsEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const monthsShortEs = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  // Calculate days in selected month (for monthly view)
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter employees
  const filteredEmployees = employees.filter(e => {
    const matchesDept = selectedDepartment === 'ALL' || e.departmentId === selectedDepartment;
    const matchesSearch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getLeaveType = (code: string): LeaveTypeConfig => {
    return DEFAULT_LEAVE_TYPES.find(t => t.code === code) || DEFAULT_LEAVE_TYPES[0];
  };

  /**
   * Check if employee has a request active on a specific day of the selected month/year.
   */
  const getDayStatus = (empId: string, day: number) => {
    const targetDateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const targetDate = new Date(targetDateStr + 'T00:00:00');

    for (const req of requests) {
      if (req.employeeId !== empId) continue;
      if (req.status === 'REJECTED' || req.status === 'CANCELLED') continue;

      const start = new Date(req.startDate + 'T00:00:00');
      const end = new Date(req.endDate + 'T00:00:00');

      if (targetDate >= start && targetDate <= end) {
        return {
          request: req,
          type: getLeaveType(req.typeCode),
          isPending: req.status === 'PENDING_MANAGER' || req.status === 'APPROVED_MANAGER',
          isStart: targetDate.getTime() === start.getTime(),
          isEnd: targetDate.getTime() === end.getTime(),
        };
      }
    }
    return null;
  };

  /**
   * Calculate summary of leave requests for an employee in a specific month of the selected year (Annual View).
   */
  const getMonthSummaryForEmployee = (empId: string, monthIdx: number, year: number) => {
    const monthStart = new Date(year, monthIdx, 1);
    const monthEnd = new Date(year, monthIdx + 1, 0);

    const activeReqs: { req: LeaveRequest; daysInMonth: number; type: LeaveTypeConfig }[] = [];
    let totalApprovedDays = 0;
    let totalPendingDays = 0;

    for (const req of requests) {
      if (req.employeeId !== empId) continue;
      if (req.status === 'REJECTED' || req.status === 'CANCELLED') continue;

      const start = new Date(req.startDate + 'T00:00:00');
      const end = new Date(req.endDate + 'T00:00:00');

      if (start <= monthEnd && end >= monthStart) {
        const overlapStart = start < monthStart ? monthStart : start;
        const overlapEnd = end > monthEnd ? monthEnd : end;
        const daysCount = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        const type = getLeaveType(req.typeCode);
        activeReqs.push({ req, daysInMonth: daysCount, type });

        if (req.status === 'APPROVED_FINAL') {
          totalApprovedDays += daysCount;
        } else {
          totalPendingDays += daysCount;
        }
      }
    }

    return { activeReqs, totalApprovedDays, totalPendingDays };
  };

  /**
   * Calculate total annual leave days for an employee across all 12 months.
   */
  const getAnnualTotalForEmployee = (empId: string, year: number) => {
    let totalApproved = 0;
    let totalPending = 0;

    for (let m = 0; m < 12; m++) {
      const { totalApprovedDays, totalPendingDays } = getMonthSummaryForEmployee(empId, m, year);
      totalApproved += totalApprovedDays;
      totalPending += totalPendingDays;
    }

    return { totalApproved, totalPending };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Mapa Visual de Vacaciones y Licencias
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {viewMode === 'MONTHLY' 
                ? 'Visualización Gantt detallada día por día del mes seleccionado.' 
                : 'Consolidado Anual de los 12 Meses del año. Haz clic en cualquier mes para profundizar en su detalle.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('MONTHLY')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'MONTHLY'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Vista Mensual</span>
              </button>
              <button
                onClick={() => setViewMode('ANNUAL')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'ANNUAL'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Vista Anual (12 Meses)</span>
              </button>
            </div>

            {/* Controls: Month / Year Navigation */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  if (viewMode === 'MONTHLY') {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(prev => prev - 1);
                    } else {
                      setSelectedMonth(prev => prev - 1);
                    }
                  } else {
                    setSelectedYear(prev => prev - 1);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-slate-900 dark:text-white px-3 py-1 min-w-28 text-center">
                {viewMode === 'MONTHLY' ? `${monthsEs[selectedMonth]} ${selectedYear}` : `Año ${selectedYear}`}
              </span>

              <button
                onClick={() => {
                  if (viewMode === 'MONTHLY') {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(prev => prev + 1);
                    } else {
                      setSelectedMonth(prev => prev + 1);
                    }
                  } else {
                    setSelectedYear(prev => prev + 1);
                  }
                }}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Department Selector */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Filtrar por Área / Departamento
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Áreas de la Empresa</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Month Selector (if monthly) or Year selector (if annual) */}
          {viewMode === 'MONTHLY' ? (
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Seleccionar Mes
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {monthsEs.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                Seleccionar Año
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                <option value={2024}>Año 2024</option>
                <option value={2025}>Año 2025</option>
                <option value={2026}>Año 2026</option>
                <option value={2027}>Año 2027</option>
              </select>
            </div>
          )}

          {/* Search Employee */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Buscar Empleado
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nombre o puesto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-slate-500 text-[11px]">Leyenda del Mapa:</span>
          {DEFAULT_LEAVE_TYPES.map(t => (
            <div key={t.code} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-sm ${t.color}`} />
              <span className="text-slate-700 dark:text-slate-300 text-[11px]">{t.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 border border-dashed border-amber-500" />
            <span className="text-slate-500 text-[11px]">Solicitud Pendiente</span>
          </div>
        </div>
      </div>

      {/* VISTA MENSUAL (Gantt Matrix Día por Día) */}
      {viewMode === 'MONTHLY' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 text-left w-56 sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                    Empleado ({filteredEmployees.length})
                  </th>
                  {daysArray.map((day) => {
                    const date = new Date(selectedYear, selectedMonth, day);
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    return (
                      <th
                        key={day}
                        className={`p-1.5 text-center min-w-8 border-r border-slate-100 dark:border-slate-800/60 ${
                          isWeekend ? 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-400' : ''
                        }`}
                      >
                        <div className="text-[10px] font-normal">{['Do','Lu','Ma','Mi','Ju','Vi','Sá'][date.getDay()]}</div>
                        <div className="font-bold">{day}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.firstName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate max-w-[170px]">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {emp.position}
                          </div>
                        </div>
                      </div>
                    </td>

                    {daysArray.map((day) => {
                      const status = getDayStatus(emp.id, day);
                      const date = new Date(selectedYear, selectedMonth, day);
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                      return (
                        <td
                          key={day}
                          className={`p-0 text-center relative border-r border-slate-100 dark:border-slate-800/60 ${
                            isWeekend ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''
                          }`}
                        >
                          {status ? (
                            <div
                              title={`${status.type.name}: ${formatDateEs(status.request.startDate)} al ${formatDateEs(status.request.endDate)} (${status.request.reason})`}
                              className={`h-8 mx-0.5 rounded-xs flex items-center justify-center text-[10px] font-bold text-white shadow-2xs transition-all ${
                                status.type.color
                              } ${status.isPending ? 'opacity-70 border-2 border-dashed border-amber-300' : ''}`}
                            >
                              {status.isStart && <span className="text-[9px]">►</span>}
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA ANUAL (12 Meses Consolidado) */}
      {viewMode === 'ANNUAL' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-600" />
              Vista Anual Consolidada ({selectedYear}) — Haz clic en cualquier mes para ver el detalle diario
            </span>
            <span className="text-slate-500">
              Mostrando {filteredEmployees.length} legajos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 text-left w-56 sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700">
                    Empleado ({filteredEmployees.length})
                  </th>
                  {monthsShortEs.map((mName, mIdx) => (
                    <th
                      key={mIdx}
                      className="p-3 text-center min-w-[70px] border-r border-slate-100 dark:border-slate-800"
                    >
                      <div className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{mName}</div>
                      <div className="text-[9px] text-slate-400 font-normal uppercase">{selectedYear}</div>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[90px] bg-slate-100/80 dark:bg-slate-800 text-purple-900 dark:text-purple-300 font-extrabold">
                    Total Año
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredEmployees.map((emp) => {
                  const annualTotals = getAnnualTotalForEmployee(emp.id, selectedYear);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      {/* Sticky Employee Name Column */}
                      <td className="p-3 sticky left-0 z-10 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.firstName}
                            className="w-7 h-7 rounded-full object-cover shrink-0"
                          />
                          <div className="truncate max-w-[170px]">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {emp.position}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 12 Months Cells */}
                      {monthsShortEs.map((_, mIdx) => {
                        const { activeReqs, totalApprovedDays, totalPendingDays } = getMonthSummaryForEmployee(emp.id, mIdx, selectedYear);
                        const hasActivity = activeReqs.length > 0;

                        return (
                          <td
                            key={mIdx}
                            onClick={() => {
                              setSelectedMonth(mIdx);
                              setViewMode('MONTHLY');
                            }}
                            className="p-2 text-center border-r border-slate-100 dark:border-slate-800/60 cursor-pointer hover:bg-purple-50/60 dark:hover:bg-purple-950/40 transition-colors group relative"
                            title={hasActivity 
                              ? `Ver ${monthsEs[mIdx]}: ${activeReqs.map(r => `${r.type.name} (${r.daysInMonth}d)`).join(', ')}` 
                              : `Ver ${monthsEs[mIdx]} (Sin licencias)`
                            }
                          >
                            {hasActivity ? (
                              <div className="space-y-1">
                                {activeReqs.map(({ req, daysInMonth, type }, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white shadow-2xs truncate transition-transform group-hover:scale-105 ${
                                      type.color
                                    } ${req.status !== 'APPROVED_FINAL' ? 'opacity-80 border border-dashed border-amber-300' : ''}`}
                                  >
                                    {daysInMonth}d {type.code}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-300 dark:text-slate-700 text-[11px] group-hover:text-purple-600 transition-colors">
                                &bull;
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Total Annual Column */}
                      <td className="p-3 text-center bg-purple-50/30 dark:bg-purple-950/10 font-bold">
                        {(annualTotals.totalApproved > 0 || annualTotals.totalPending > 0) ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 border border-purple-300/60">
                              {annualTotals.totalApproved}d
                            </span>
                            {annualTotals.totalPending > 0 && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                                +{annualTotals.totalPending}d pend.
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">0d</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
