import React from 'react';
import { UserPersona, RequestStatus } from '../types';
import { 
  CalendarDays, 
  BarChart3, 
  Users, 
  FileCheck2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Clock,
  Plus,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  activePersona: UserPersona;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingCount: number;
  onOpenNewRequest: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePersona,
  activeTab,
  setActiveTab,
  pendingCount,
  onOpenNewRequest,
  onOpenAiAssistant,
}) => {
  const role = activePersona.role;

  const navItems = [
    {
      id: 'my-requests',
      label: 'Mis Solicitudes',
      icon: CalendarDays,
      show: true,
    },
    {
      id: 'approvals',
      label: 'Aprobaciones',
      icon: FileCheck2,
      badge: pendingCount > 0 ? pendingCount : null,
      show: role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'AREA_MANAGER',
    },
    {
      id: 'vacation-map',
      label: 'Mapa de Vacaciones',
      icon: CalendarDays,
      show: true,
    },
    {
      id: 'employees',
      label: 'Legajos de Personal',
      icon: Users,
      show: role === 'SUPER_ADMIN' || role === 'HR_MANAGER',
    },
    {
      id: 'reports',
      label: 'Reportes & Análisis',
      icon: BarChart3,
      show: role === 'SUPER_ADMIN' || role === 'HR_MANAGER' || role === 'AREA_MANAGER',
    },
    {
      id: 'admin-config',
      label: 'Configuración',
      icon: ShieldCheck,
      show: role === 'SUPER_ADMIN',
    },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  Licencia<span className="text-indigo-600 dark:text-indigo-400">Pro</span>
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  SaaS Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Gestión Intuitiva de Vacaciones y Licencias
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 transition-all"
              title="Asistente de IA de Licencias"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Asistente IA</span>
            </button>

            <button
              onClick={onOpenNewRequest}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Solicitud</span>
            </button>

            {/* User Badge */}
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
              <img
                src={activePersona.employee.avatar}
                alt={activePersona.employee.firstName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {activePersona.employee.firstName} {activePersona.employee.lastName}
                </div>
                <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  {activePersona.badge}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span className="ml-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>
      </div>
    </header>
  );
};
