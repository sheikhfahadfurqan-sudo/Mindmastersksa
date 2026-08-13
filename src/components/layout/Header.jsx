import React from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { ShieldCheck, ShieldAlert, Shield, Crown, UserCheck, User, Sparkles, Bell, Search, LogOut } from 'lucide-react';

export const Header = () => {
  const { activeRole, setActiveRole, currentUser, canViewFinancials, logout } = useAuthRole();

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand & Workspace Indicator */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-extrabold text-indigo-400 text-lg">
              MM
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-100 tracking-tight text-base font-outfit">MIND MASTERS KSA</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 rounded-full tracking-wide">
                KSA REGION
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Workspace & CRM Architecture</p>
          </div>
        </div>

        {/* Search Bar for Tablet/Desktop */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 w-64">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, clients, docs..."
            className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-full"
          />
        </div>
      </div>

      {/* RBAC ROLE SWITCHER TOGGLE (Interactive Core Component) */}
      <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800/90 p-1 rounded-xl shadow-inner w-full md:w-auto justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-indigo-400" /> Role Toggle:
        </span>
        
        <button
          onClick={() => setActiveRole('EXECUTIVE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeRole === 'EXECUTIVE'
              ? 'bg-gradient-to-r from-amber-500/20 to-indigo-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>Executive</span>
        </button>

        <button
          onClick={() => setActiveRole('ADMIN')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeRole === 'ADMIN'
              ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Admin</span>
        </button>

        <button
          onClick={() => setActiveRole('EMPLOYEE')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
            activeRole === 'EMPLOYEE'
              ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <span>Employee</span>
        </button>
      </div>

      {/* User Profile & Clearance Status Banner */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <div className="hidden sm:flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-xs text-slate-200">{currentUser.name}</span>
            {canViewFinancials ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" title="Full Financial & Vault Clearance" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" title="Restricted Standard Clearance" />
            )}
          </div>
          <span className="text-[10px] text-slate-400">{currentUser.title}</span>
        </div>

        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-9 h-9 rounded-xl ring-2 ring-indigo-500/30 object-cover"
        />

        {/* Prominent Log Out Button */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-rose-950/80 hover:text-rose-300 border border-slate-800 hover:border-rose-800/80 text-slate-300 text-xs font-bold rounded-xl transition duration-200 group shadow-sm"
          title="Sign Out of Session"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-300 transition-colors" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};
