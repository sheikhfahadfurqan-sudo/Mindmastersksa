import React, { useState } from 'react';
import { AuthRoleProvider } from './context/AuthRoleContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ExecutiveDashboard } from './components/dashboard/ExecutiveDashboard';
import { ClientManagement } from './components/crm/ClientManagement';
import { ProjectTaskWorkspace } from './components/projects/ProjectTaskWorkspace';
import { DocumentVault } from './components/vault/DocumentVault';
import { LeaveManagement } from './components/hr/LeaveManagement';

export function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AuthRoleProvider>
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
    </AuthRoleProvider>
  );
}

export default App;
