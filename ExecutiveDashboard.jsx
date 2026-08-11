import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { MOCK_CLIENTS, MOCK_PROJECTS, MOCK_DOCUMENTS, MOCK_LEAVE_REQUESTS } from '../../data/mockData';
import { 
  TrendingUp, 
  Briefcase, 
  FolderLock, 
  Clock, 
  Lock, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight,
  Sparkles,
  Building2,
  CalendarDays
} from 'lucide-react';

export const ExecutiveDashboard = ({ setActiveTab }) => {
  const { activeRole, canViewFinancials, canApproveLeave } = useAuthRole();

  const totalPipelineSAR = MOCK_CLIENTS.reduce((acc, c) => acc + c.contractValueSAR, 0);
  const activeProjectsCount = MOCK_PROJECTS.filter(p => p.status === 'ACTIVE').length;
  const pendingLeavesCount = MOCK_LEAVE_REQUESTS.filter(l => l.status === 'PENDING').length;
  const restrictedDocsCount = MOCK_DOCUMENTS.filter(d => d.clearance === 'RESTRICTED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 p-6 rounded-2xl border border-indigo-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white font-outfit">Mind Masters KSA • Executive Control Hub</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              KSA Headquarters
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time status monitor across Client CRM, Enterprise Projects, Document Vault & HR Operations.
          </p>
        </div>

        {/* Dynamic RBAC Indicator Badge */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Active Clearance</span>
            <span className={`font-bold ${
              activeRole === 'EXECUTIVE' ? 'text-amber-400' : activeRole === 'LEAD' ? 'text-indigo-400' : 'text-cyan-400'
            }`}>
              {activeRole} MODE
            </span>
          </div>
          {canViewFinancials ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Role Restriction Banner if Standard Employee */}
      {!canViewFinancials && (
        <div className="flex items-center gap-3 p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold text-amber-300">Standard Employee Role Active: </span>
            <span>Client deal values, project budgets, and restricted document downloads are masked or hidden based on RBAC clearance policy. Toggle role to Executive/Lead to test full access.</span>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Pipeline */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">CRM Deal Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-100 font-outfit">
              {canViewFinancials ? (
                `SAR ${(totalPipelineSAR / 1000000).toFixed(2)}M`
              ) : (
                <span className="text-amber-400 text-sm flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> 🔒 Masked (Lead+)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">across 4 enterprise KSA clients</p>
          </div>
        </div>

        {/* Card 2: Active Projects */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Mega Projects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-100 font-outfit">
              {activeProjectsCount} Active
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Aramco, NEOM & DGDA platforms</p>
          </div>
        </div>

        {/* Card 3: Restricted Docs */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Restricted Vault Files</span>
            <div className="w-8 h-8 rounded-lg bg-violet-950/80 text-violet-400 flex items-center justify-center">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-100 font-outfit">
              {restrictedDocsCount} Restricted
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {canViewFinancials ? 'Full Download Clearance' : '🔒 Download Disabled'}
            </p>
          </div>
        </div>

        {/* Card 4: HR Queue */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending HR Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-100 font-outfit">
              {pendingLeavesCount} Request
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {canApproveLeave ? 'Requires your approval' : 'Private Manager Queue'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Active Projects Quick View & Recent Client Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Progress Widget */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-100 text-sm font-outfit">Active Mega Projects Progress</h3>
              <p className="text-xs text-slate-400">Target milestones & budgets for KSA enterprise accounts</p>
            </div>
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Open 3-in-1 Views <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {MOCK_PROJECTS.map((project) => (
              <div key={project.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 text-xs">{project.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${
                        project.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          : 'bg-indigo-950/80 text-indigo-400 border border-indigo-800/50'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{project.clientName} • Manager: {project.managerName}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-300">
                      {canViewFinancials ? `SAR ${(project.budgetSAR / 1000000).toFixed(2)}M` : '🔒 Budget Masked'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Completion</span>
                    <span className="font-semibold text-indigo-400">{project.progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${project.progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CRM Quick Client Feed */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-100 text-sm font-outfit">CRM Client Deals</h3>
            <button
              onClick={() => setActiveTab('crm')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              View CRM <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_CLIENTS.map((client) => (
              <div key={client.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-slate-200 text-xs block">{client.companyName}</span>
                  <span className="text-[10px] text-slate-400 block">{client.contactPerson}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-slate-200 block">
                    {canViewFinancials ? `SAR ${(client.contractValueSAR / 1000).toLocaleString()}k` : '🔒 Masked'}
                  </span>
                  <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block ${
                    client.stage === 'CLOSED_WON' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    client.stage === 'PROPOSAL' ? 'bg-indigo-950 text-indigo-400 border border-indigo-800' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {client.stage.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
