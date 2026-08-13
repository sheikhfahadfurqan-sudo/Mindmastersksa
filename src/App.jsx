import React, { useState } from 'react';
import { AuthRoleProvider, useAuthRole } from './context/AuthRoleContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ClientManagement } from './components/crm/ClientManagement';
import { ProjectTaskWorkspace } from './components/projects/ProjectTaskWorkspace';
import { DocumentVault } from './components/vault/DocumentVault';
import { LeaveManagement } from './components/hr/LeaveManagement';
import { LogIn, Shield, Lock } from 'lucide-react';

function WorkspaceContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isLoggedIn, login } = useAuthRole();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center font-extrabold text-indigo-400 text-2xl font-outfit">
              MM
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-100 font-outfit">MIND MASTERS KSA</h2>
            <p className="text-xs text-slate-400 mt-1">Enterprise Workspace & CRM Architecture</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <Shield className="w-4 h-4" />
              <span>Select Your Access Level to Sign In</span>
            </div>
            <p className="text-xs text-slate-400">
              Corporate authentication is restricted to Executive, Admin, and Employee clearances.
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => login('EXECUTIVE')}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 hover:border-amber-500/50 border border-amber-500/30 text-amber-300 rounded-2xl transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300">👑</div>
                <div>
                  <span className="font-bold text-xs block text-slate-100 font-outfit">Executive Access</span>
                  <span className="text-[10px] text-slate-400 block">C-Suite, Financials & Governance</span>
                </div>
              </div>
              <span className="text-amber-400 text-xs font-bold">Sign In →</span>
            </button>

            <button
              onClick={() => login('ADMIN')}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 hover:border-indigo-500/50 border border-indigo-500/30 text-indigo-300 rounded-2xl transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">🛡️</div>
                <div>
                  <span className="font-bold text-xs block text-slate-100 font-outfit">Admin Access</span>
                  <span className="text-[10px] text-slate-400 block">Management, HR Queue & Delivery</span>
                </div>
              </div>
              <span className="text-indigo-400 text-xs font-bold">Sign In →</span>
            </button>

            <button
              onClick={() => login('EMPLOYEE')}
              className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 hover:border-cyan-500/50 border border-cyan-500/30 text-cyan-300 rounded-2xl transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300">👤</div>
                <div>
                  <span className="font-bold text-xs block text-slate-100 font-outfit">Employee Access</span>
                  <span className="text-[10px] text-slate-400 block">Tasks, Worksheets & Payslips</span>
                </div>
              </div>
              <span className="text-cyan-400 text-xs font-bold">Sign In →</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 pt-2">
            Official KSA Region Enterprise Workspace • 3-Tier Security SSO
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header with Live RBAC Role Switcher */}
      <Header />

      {/* Workspace Body Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Dashboard Module Workspace */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'dashboard' && <ExecutiveDashboard setActiveTab={setActiveTab} />}
          {activeTab === 'crm' && <ClientManagement />}
          {activeTab === 'projects' && <ProjectTaskWorkspace />}
          {activeTab === 'vault' && <DocumentVault />}
          {activeTab === 'hr' && <LeaveManagement />}
        </main>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthRoleProvider>
      <WorkspaceContent />
    </AuthRoleProvider>
  );
}

export default App;
