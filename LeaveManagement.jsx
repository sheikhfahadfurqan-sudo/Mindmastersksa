import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { MOCK_LEAVE_REQUESTS, MOCK_USERS } from '../../data/mockData';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ShieldCheck, 
  User, 
  Lock, 
  Check, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const LeaveManagement = () => {
  const { activeRole, currentUser, canApproveLeave } = useAuthRole();
  const [leaveRequests, setLeaveRequests] = useState(MOCK_LEAVE_REQUESTS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New Leave Form State
  const [leaveType, setLeaveType] = useState('VACATION');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-30');
  const [reason, setReason] = useState('');

  // Handle Approve / Reject Action
  const handleApprovalAction = (id, newStatus) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: newStatus,
          approvedByName: currentUser.name
        };
      }
      return req;
    }));
  };

  // Submit Leave Request
  const handleLeaveSubmit = (e) => {
    e.preventDefault();
    if (!reason) return;

    const newReq = {
      id: `l${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatar: currentUser.avatar,
      title: currentUser.title,
      department: currentUser.department,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setLeaveRequests([newReq, ...leaveRequests]);
    setShowSubmitModal(false);
    setReason('');
  };

  const pendingQueue = leaveRequests.filter(req => req.status === 'PENDING');
  const approvedLeaves = leaveRequests.filter(req => req.status === 'APPROVED');

  return (
    <div className="space-y-6">
      {/* Module Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-outfit">HR & Employee Absence Management</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 rounded-md">
              KSA Team Schedule
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Leave submissions, manager approval workflows, and sanitized team calendar
          </p>
        </div>

        {/* Submit Leave Button */}
        <button
          onClick={() => setShowSubmitModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> Submit Leave Request
        </button>
      </div>

      {/* 1. PRIVATE EXECUTIVE / MANAGER APPROVAL QUEUE */}
      {canApproveLeave ? (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm font-outfit">Private Executive & Manager Approval Queue</h3>
                <p className="text-xs text-slate-400">Visible only to Executive & Lead roles ({pendingQueue.length} Pending)</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-amber-950 text-amber-400 border border-amber-800 rounded-md">
              Clearance Level: {activeRole}
            </span>
          </div>

          {pendingQueue.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
              No pending leave requests awaiting approval.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map((req) => (
                <div key={req.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={req.employeeAvatar} alt={req.employeeName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30" />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 text-xs">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-500">({req.title} • {req.department})</span>
                      </div>
                      <span className="text-[11px] text-indigo-400 font-medium block">
                        {req.leaveType} • {req.startDate} to {req.endDate}
                      </span>
                      {/* Confidential Reason (Visible to Lead+) */}
                      <p className="text-[11px] text-slate-400 italic bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                        "{req.reason}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                      onClick={() => handleApprovalAction(req.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs font-medium flex items-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprovalAction(req.id, 'APPROVED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 text-xs flex items-center gap-1 shadow-md transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve Leave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400" /> Manager Approval Queue is hidden for Standard Employee role.
          </span>
          <span className="text-[10px] text-slate-500">Switch role to Lead/Executive to approve requests</span>
        </div>
      )}

      {/* 2. TEAM OUT-OF-OFFICE CALENDAR (SANITIZED VIEW) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div>
          <h3 className="font-bold text-slate-100 text-sm font-outfit">Team Out-of-Office Calendar</h3>
          <p className="text-xs text-slate-400">
            Public schedule view for all employees. Displays approved absence dates without exposing private medical or personal reasons.
          </p>
        </div>

        <div className="space-y-3">
          {approvedLeaves.map((leave) => (
            <div key={leave.id} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <img src={leave.employeeAvatar} alt={leave.employeeName} className="w-9 h-9 rounded-xl object-cover" />
                <div>
                  <span className="font-semibold text-slate-200 block">{leave.employeeName}</span>
                  <span className="text-[10px] text-slate-400">{leave.department} • Approved by {leave.approvedByName || 'Executive'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-amber-950/80 text-amber-400 border border-amber-800 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> {leave.startDate} → {leave.endDate}
                </span>
                <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md text-[10px] font-bold uppercase">
                  OUT OF OFFICE
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Request Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 font-outfit">Submit Employee Leave Request</h3>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                >
                  <option value="VACATION">Annual Vacation</option>
                  <option value="SICK">Medical / Sick Leave</option>
                  <option value="PERSONAL">Personal & Family Emergency</option>
                  <option value="MATERNITY_PATERNITY">Parental Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium block">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium block">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium block">Private Reason (Visible to Manager Only)</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe reason for leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/20"
                >
                  Submit Request for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
