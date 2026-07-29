import React, { useState } from 'react';
import { 
  Employee, 
  LeaveRequest, 
  Department, 
  CompanySettings, 
  UserPersona, 
  Role,
  RequestStatus,
  StatusHistoryItem,
  JobPosition 
} from './types';
import { DEMO_PERSONAS, MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_LEAVE_REQUESTS, MOCK_POSITIONS } from './data/mockData';
import { DEFAULT_COMPANY_SETTINGS, calculateVacationBalance } from './utils/vacationCalculator';
import { RoleSelector } from './components/RoleSelector';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AreaManagerDashboard } from './components/AreaManagerDashboard';
import { HRDashboard } from './components/HRDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { VacationMap } from './components/VacationMap';
import { ReportsView } from './components/ReportsView';
import { NewRequestModal } from './components/NewRequestModal';
import { RequestDetailDrawer } from './components/RequestDetailDrawer';
import { EmployeeModal } from './components/EmployeeModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export default function App() {
  const [activePersona, setActivePersona] = useState<UserPersona>(DEMO_PERSONAS[0]);
  const [activeTab, setActiveTab] = useState<string>('my-requests');
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [positions, setPositions] = useState<JobPosition[]>(MOCK_POSITIONS);
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);

  // Department Handlers (Super Admin Exclusive)
  const handleAddDepartment = (newDept: Omit<Department, 'id'>) => {
    const created: Department = {
      ...newDept,
      id: `dept-${Date.now()}`
    };
    setDepartments(prev => [...prev, created]);
  };

  const handleUpdateDepartment = (updatedDept: Department) => {
    setDepartments(prev => prev.map(d => d.id === updatedDept.id ? updatedDept : d));
  };

  const handleDeleteDepartment = (deptId: string) => {
    setDepartments(prev => prev.filter(d => d.id !== deptId));
  };

  // Position Handlers (HR Manager Exclusive)
  const handleAddPosition = (newPos: Omit<JobPosition, 'id'>) => {
    const created: JobPosition = {
      ...newPos,
      id: `pos-${Date.now()}`
    };
    setPositions(prev => [...prev, created]);
  };

  const handleUpdatePosition = (updatedPos: JobPosition) => {
    setPositions(prev => prev.map(p => p.id === updatedPos.id ? updatedPos : p));
  };

  const handleDeletePosition = (posId: string) => {
    setPositions(prev => prev.filter(p => p.id !== posId));
  };

  // Modal states
  const [isNewRequestOpen, setIsNewRequestOpen] = useState<boolean>(false);
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<LeaveRequest | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Current active employee profile based on persona
  const currentEmployee = activePersona.employee;
  const currentRole = activePersona.role;

  // Calculate pending approvals count for navbar badge
  const pendingForManager = requests.filter(r => {
    if (r.status !== 'PENDING_MANAGER') return false;
    const emp = employees.find(e => e.id === r.employeeId);
    return emp && (emp.managerId === currentEmployee.id || emp.departmentId === currentEmployee.departmentId);
  }).length;

  const pendingForHR = requests.filter(r => r.status === 'APPROVED_MANAGER').length;

  const totalPendingBadge = (currentRole === 'SUPER_ADMIN' || currentRole === 'HR_MANAGER') 
    ? pendingForHR + pendingForManager
    : pendingForManager;

  // Calculate vacation balance for current employee
  const currentBalance = calculateVacationBalance(currentEmployee, requests, settings);

  // --- HANDLERS ---
  const handleSelectPersona = (persona: UserPersona) => {
    setActivePersona(persona);
    // Adjust active tab to appropriate view if current tab is restricted
    if (persona.role === 'EMPLOYEE' && (activeTab === 'approvals' || activeTab === 'employees' || activeTab === 'admin-config')) {
      setActiveTab('my-requests');
    } else if (persona.role === 'AREA_MANAGER' && (activeTab === 'employees' || activeTab === 'admin-config')) {
      setActiveTab('approvals');
    }
  };

  const handleCreateRequest = (requestData: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'status'>) => {
    const newId = `req-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const initialHistory: StatusHistoryItem = {
      id: `hist-${Date.now()}-1`,
      status: 'PENDING_MANAGER',
      actorId: currentEmployee.id,
      actorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
      actorRole: currentEmployee.role,
      timestamp: nowIso,
      comment: 'Solicitud ingresada por el colaborador para revisión de Gerencia de Área.',
    };

    const newReq: LeaveRequest = {
      ...requestData,
      id: newId,
      status: 'PENDING_MANAGER',
      createdAt: nowIso,
      updatedAt: nowIso,
      history: [initialHistory],
    };

    setRequests(prev => [newReq, ...prev]);
    setIsNewRequestOpen(false);
  };

  // 1st Level Manager Approval
  const handleApproveByManager = (requestId: string, comment?: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const historyItem: StatusHistoryItem = {
        id: `hist-${Date.now()}`,
        status: 'APPROVED_MANAGER',
        actorId: currentEmployee.id,
        actorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
        actorRole: currentRole,
        timestamp: nowIso,
        comment: comment || 'Aprobado en 1ª instancia por Gerencia de Área. Derivado a RRHH para aprobación definitiva.',
      };
      return {
        ...r,
        status: 'APPROVED_MANAGER',
        updatedAt: nowIso,
        history: [...r.history, historyItem],
      };
    }));
  };

  // 1st Level Manager Rejection
  const handleRejectByManager = (requestId: string, reason: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const historyItem: StatusHistoryItem = {
        id: `hist-${Date.now()}`,
        status: 'REJECTED',
        actorId: currentEmployee.id,
        actorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
        actorRole: currentRole,
        timestamp: nowIso,
        comment: `Rechazado en 1ª instancia por Gerencia de Área: "${reason}"`,
      };
      return {
        ...r,
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: nowIso,
        history: [...r.history, historyItem],
      };
    }));
  };

  // 2nd Level HR Final Approval
  const handleFinalApproveByHR = (requestId: string, comment?: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const historyItem: StatusHistoryItem = {
        id: `hist-${Date.now()}`,
        status: 'APPROVED_FINAL',
        actorId: currentEmployee.id,
        actorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
        actorRole: currentRole,
        timestamp: nowIso,
        comment: comment || 'Aprobación definitiva otorgada por RRHH. Días liquidados y computados en legajo.',
      };
      return {
        ...r,
        status: 'APPROVED_FINAL',
        updatedAt: nowIso,
        history: [...r.history, historyItem],
      };
    }));
  };

  // 2nd Level HR Final Rejection
  const handleFinalRejectByHR = (requestId: string, reason: string) => {
    const nowIso = new Date().toISOString();
    setRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      const historyItem: StatusHistoryItem = {
        id: `hist-${Date.now()}`,
        status: 'REJECTED',
        actorId: currentEmployee.id,
        actorName: `${currentEmployee.firstName} ${currentEmployee.lastName}`,
        actorRole: currentRole,
        timestamp: nowIso,
        comment: `Rechazado en 2ª instancia por RRHH: "${reason}"`,
      };
      return {
        ...r,
        status: 'REJECTED',
        rejectionReason: reason,
        updatedAt: nowIso,
        history: [...r.history, historyItem],
      };
    }));
  };

  // Employee Add / Save / Delete
  const handleSaveEmployee = (empData: any) => {
    if (empData.id) {
      setEmployees(prev => prev.map(e => e.id === empData.id ? empData : e));
    } else {
      const newEmp: Employee = {
        ...empData,
        id: `emp-${Date.now()}`,
      };
      setEmployees(prev => [...prev, newEmp]);
    }
    setIsEmployeeModalOpen(false);
    setEmployeeToEdit(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Interactive Demo Persona Selector */}
      <RoleSelector
        personas={DEMO_PERSONAS}
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
      />

      {/* Primary Header Navbar */}
      <Navbar
        activePersona={activePersona}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={totalPendingBadge}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {activeTab === 'my-requests' && (
          <EmployeeDashboard
            employee={currentEmployee}
            balance={currentBalance}
            requests={requests}
            onOpenNewRequest={() => setIsNewRequestOpen(true)}
            onSelectRequest={(req) => setSelectedRequestDetail(req)}
          />
        )}

        {activeTab === 'approvals' && (
          <>
            {currentRole === 'AREA_MANAGER' ? (
              <AreaManagerDashboard
                manager={currentEmployee}
                employees={employees}
                requests={requests}
                departments={departments}
                onApproveByManager={handleApproveByManager}
                onRejectByManager={handleRejectByManager}
                onSelectRequest={(req) => setSelectedRequestDetail(req)}
              />
            ) : (
              <HRDashboard
                hrUser={currentEmployee}
                employees={employees}
                requests={requests}
                departments={departments}
                positions={positions}
                onFinalApproveByHR={handleFinalApproveByHR}
                onFinalRejectByHR={handleFinalRejectByHR}
                onOpenAddEmployee={() => {
                  setEmployeeToEdit(null);
                  setIsEmployeeModalOpen(true);
                }}
                onEditEmployee={(emp) => {
                  setEmployeeToEdit(emp);
                  setIsEmployeeModalOpen(true);
                }}
                onDeleteEmployee={handleDeleteEmployee}
                onSelectRequest={(req) => setSelectedRequestDetail(req)}
                onAddPosition={handleAddPosition}
                onUpdatePosition={handleUpdatePosition}
                onDeletePosition={handleDeletePosition}
              />
            )}
          </>
        )}

        {activeTab === 'vacation-map' && (
          <VacationMap
            employees={employees}
            requests={requests}
            departments={departments}
          />
        )}

        {activeTab === 'employees' && (
          <HRDashboard
            hrUser={currentEmployee}
            employees={employees}
            requests={requests}
            departments={departments}
            positions={positions}
            onFinalApproveByHR={handleFinalApproveByHR}
            onFinalRejectByHR={handleFinalRejectByHR}
            onOpenAddEmployee={() => {
              setEmployeeToEdit(null);
              setIsEmployeeModalOpen(true);
            }}
            onEditEmployee={(emp) => {
              setEmployeeToEdit(emp);
              setIsEmployeeModalOpen(true);
            }}
            onDeleteEmployee={handleDeleteEmployee}
            onSelectRequest={(req) => setSelectedRequestDetail(req)}
            onAddPosition={handleAddPosition}
            onUpdatePosition={handleUpdatePosition}
            onDeletePosition={handleDeletePosition}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            employees={employees}
            requests={requests}
            departments={departments}
          />
        )}

        {activeTab === 'admin-config' && (
          <SuperAdminDashboard
            adminUser={currentEmployee}
            settings={settings}
            onUpdateSettings={(newSettings) => setSettings(newSettings)}
            requests={requests}
            employees={employees}
            departments={departments}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-bold text-slate-900 dark:text-white">LicenciaPro SaaS</span> &bull; Sistema de Gestión de Licencias, Vacaciones y Personal
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Flujo de 2 Niveles</span>
            <span>&bull;</span>
            <span>Cómputo Automático Antigüedad</span>
            <span>&bull;</span>
            <span>Auditoría Inmutable</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {isNewRequestOpen && (
        <NewRequestModal
          employee={currentEmployee}
          balance={currentBalance}
          allEmployees={employees}
          allRequests={requests}
          departments={departments}
          onClose={() => setIsNewRequestOpen(false)}
          onSubmit={handleCreateRequest}
        />
      )}

      {selectedRequestDetail && (
        <RequestDetailDrawer
          request={selectedRequestDetail}
          employees={employees}
          departments={departments}
          onClose={() => setSelectedRequestDetail(null)}
        />
      )}

      {isEmployeeModalOpen && (
        <EmployeeModal
          employeeToEdit={employeeToEdit}
          departments={departments}
          allEmployees={employees}
          positions={positions}
          onClose={() => {
            setIsEmployeeModalOpen(false);
            setEmployeeToEdit(null);
          }}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}

      {isAiAssistantOpen && (
        <AiAssistantDrawer
          employee={currentEmployee}
          onClose={() => setIsAiAssistantOpen(false)}
        />
      )}
    </div>
  );
}
