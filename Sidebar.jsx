import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Kanban, 
  FolderLock, 
  CalendarDays, 
  ShieldCheck, 
  Lock,
  Building2,
  Users,
  Award
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { activeRole, isExecutive, canApproveLeave } = useAuthRole();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: isExecutive ? 'Full Access' : 'View'
    },
    {
      id: 'crm',
      label: 'CRM & Clients',
      icon: Building2,
      badge: '4 Clients'
    },
    {
      id: 'projects',
      label: 'Projects & Tasks',
      icon: Kanban,
      badge: '3 Views'
    },
    {
      id: 'vault',
      label: 'Document Vault',
      icon: FolderLock,
      badge: activeRole === 'STANDARD' ? '🔒 Restricted' : 'Cleared'
    },
    {
      id: 'hr',
      label: 'HR & Absence Queue',
      icon: CalendarDays,
      badge: canApproveLeave ? '1 Pending' : 'Calendar'
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
            Core Workspace Modules
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-indigo-700/80 text-indigo-100'
                        : item.badge.includes('🔒')
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Clearance Card Widget */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2">
            {activeRole === 'EXECUTIVE' && <Crown className="w-4 h-4 text-amber-400" />}
            {activeRole === 'LEAD' && <ShieldCheck className="w-4 h-4 text-indigo-400" />}
            {activeRole === 'STANDARD' && <Lock className="w-4 h-4 text-cyan-400" />}
            <span className="text-xs font-bold text-slate-200 font-outfit uppercase tracking-wider">
              {activeRole} ACCESS
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {activeRole === 'EXECUTIVE' && 'Full Administrative, Financial, Budget & Approval control across all KSA operations.'}
            {activeRole === 'LEAD' && 'Project creation, Task management, Document upload, and Leave approval clearances.'}
            {activeRole === 'STANDARD' && 'Task execution view. Deal values, project budgets, and restricted document downloads are masked.'}
          </p>

          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span>KSA Team Size: 28</span>
            <span className="text-emerald-400 font-medium">Active Session</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span>Mind Masters KSA v1.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <span className="text-[10px]">Riyadh • Jeddah • Dhahran</span>
      </div>
    </aside>
  );
};
