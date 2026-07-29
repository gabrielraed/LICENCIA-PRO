import React from 'react';
import { UserPersona } from '../types';
import { Shield, Briefcase, Users, User, RefreshCw, CheckCircle2 } from 'lucide-react';

interface RoleSelectorProps {
  personas: UserPersona[];
  activePersona: UserPersona;
  onSelectPersona: (persona: UserPersona) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  personas,
  activePersona,
  onSelectPersona,
}) => {
  const getIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="w-4 h-4 text-amber-500" />;
      case 'HR_MANAGER':
        return <Briefcase className="w-4 h-4 text-purple-500" />;
      case 'AREA_MANAGER':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white text-xs py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30">
            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
            <span>MODO DEMO INTERACTIVO</span>
          </div>
          <span className="text-slate-400 hidden lg:inline">
            Selecciona el rol para probar los 3 niveles de permisos y aprobación:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {personas.map((persona) => {
            const isActive = activePersona.id === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => onSelectPersona(persona)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-medium text-left ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {getIcon(persona.role)}
                <span>{persona.label}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5 text-indigo-200" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
