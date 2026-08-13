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
  const [email, setEmail] = useState('tariq.mansoor@mindmasters.sa');
  const [password, setPassword] = useState('ExecSecret2026!');
  const [authError, setAuthError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      login(email, password);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleQuickSelect = (roleKey) => {
    setAuthError('');
    if (roleKey === 'EXECUTIVE') {
      setEmail('tariq.mansoor@mindmasters.sa');
      setPassword('ExecSecret2026!');
    } else if (roleKey === 'ADMIN') {
      setEmail('sarah.ghamdi@mindmasters.sa');
      setPassword('AdminSecret2026!');
    } else {
      setEmail('fahad.otaibi@mindmasters.sa');
      setPassword('EmpSecret2026!');
    }
  };

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

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <Shield className="w-4 h-4" />
              <span>Corporate SSO Sign In</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Select your access role to fill corporate credentials, then click <strong>Sign In</strong>.
            </p>
          </div>

          {/* 3 Access Level Selector */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSelect('EXECUTIVE')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-center space-y-0.5 transition"
            >
              <span className="text-sm">👑</span>
              <span className="font-bold text-[10px] block text-amber-300">Executive</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('ADMIN')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-center space-y-0.5 transition"
            >
              <span className="text-sm">🛡️</span>
              <span className="font-bold text-[10px] block text-indigo-300">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('EMPLOYEE')}
              className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-center space-y-0.5 transition"
            >
              <span className="text-sm">👤</span>
              <span className="font-bold text-[10px] block text-cyan-300">Employee</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold text-left">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="text-slate-300 text-xs font-semibold block mb-1">Company Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@mindmasters.sa"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 rounded-xl text-slate-100 text-xs outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-slate-300 text-xs font-semibold block mb-1">Corporate Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 p-3 rounded-xl text-slate-100 text-xs outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate & Sign In</span>
            </button>
          </form>

          <p className="text-[10px] text-slate-500 pt-1">
            Official KSA Region Workspace • Strict Password & Role Verification Active
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
