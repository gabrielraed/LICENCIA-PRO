import React from 'react';
import { Employee, LeaveRequest, Department, LeaveTypeConfig } from '../types';
import { DEFAULT_LEAVE_TYPES } from '../utils/vacationCalculator';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { BarChart3, TrendingUp, Users, Calendar, Award, CheckCircle2 } from 'lucide-react';

interface ReportsViewProps {
  employees: Employee[];
  requests: LeaveRequest[];
  departments: Department[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  employees,
  requests,
  departments,
}) => {
  // 1. Data by Leave Type
  const leaveTypeData = DEFAULT_LEAVE_TYPES.map(type => {
    const count = requests.filter(r => r.typeCode === type.code && r.status !== 'REJECTED').length;
    const totalDays = requests
      .filter(r => r.typeCode === type.code && r.status === 'APPROVED_FINAL')
      .reduce((sum, r) => sum + r.workingDays, 0);

    return {
      name: type.name.split('/')[0].trim(),
      solicitudes: count,
      diasGozados: totalDays,
    };
  });

  // 2. Data by Department
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];
  const departmentData = departments.map((dept, index) => {
    const deptEmployees = employees.filter(e => e.departmentId === dept.id);
    const deptRequests = requests.filter(r => r.departmentId === dept.id && r.status === 'APPROVED_FINAL');
    const totalDays = deptRequests.reduce((sum, r) => sum + r.workingDays, 0);

    return {
      name: dept.name,
      dias: totalDays,
      empleados: deptEmployees.length,
      color: COLORS[index % COLORS.length],
    };
  });

  // 3. Monthly Trend Data (Jan to Dec 2026)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const monthlyData = months.map((m, idx) => {
    const count = requests.filter(r => {
      const d = new Date(r.startDate);
      return d.getMonth() === idx;
    }).length;
    return { mes: m, solicitudes: count };
  });

  // KPIs
  const totalApprovedDays = requests
    .filter(r => r.status === 'APPROVED_FINAL')
    .reduce((sum, r) => sum + r.workingDays, 0);

  const avgSeniority = employees.length > 0 
    ? (employees.reduce((acc, e) => {
        const y = new Date().getFullYear() - new Date(e.hireDate).getFullYear();
        return acc + Math.max(0, y);
      }, 0) / employees.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Reportes & Métricas de Licencias y Personal
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Análisis de tendencias de ausentismo, distribución por departamento y días gozados por tipo de licencia.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Solicitudes Registradas</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {requests.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">En el período 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Días Hábiles Aprobados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {totalApprovedDays} <span className="text-sm font-normal text-slate-500">días</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Descontados de saldos anuales</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Antigüedad Promedio Equipo</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
            {avgSeniority} <span className="text-sm font-normal text-slate-500">años</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Promedio de servicio en la empresa</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Personal Activo En Nómina</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {employees.length} <span className="text-sm font-normal text-slate-500">colaboradores</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">En 5 áreas corporativas</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Leave Type Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Distribución por Tipo de Licencia (Días Aprobados)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaveTypeData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="diasGozados" fill="#6366f1" radius={[6, 6, 0, 0]} name="Días Gozados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Absence Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Días de Ausencia por Área de la Empresa
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="dias"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Monthly Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tendencia Mensual de Solicitudes (2026)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="solicitudes" stroke="#8b5cf6" strokeWidth={3} name="Solicitudes" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
