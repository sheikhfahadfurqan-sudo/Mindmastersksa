import React, { useState } from 'react';
import { useAuthRole } from '../../context/AuthRoleContext';
import { MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS } from '../../data/mockData';
import { 
  Kanban as KanbanIcon, 
  Table as TableIcon, 
  Calendar as TimelineIcon, 
  Plus, 
  Filter, 
  User, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ChevronLeft,
  Briefcase
} from 'lucide-react';

export const ProjectTaskWorkspace = () => {
  const { activeRole, canViewFinancials, canManageProjects } = useAuthRole();
  const [viewMode, setViewMode] = useState('kanban'); // 'table' | 'kanban' | 'timeline'
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');

  // Filter tasks based on selected project
  const filteredTasks = tasks.filter(t => selectedProjectId === 'ALL' || t.projectId === selectedProjectId);

  // Status transition helper for Kanban & Table
  const moveTaskStatus = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => task.id === taskId ? { ...task, status: newStatus } : task));
  };

  const statusColumns = [
    { id: 'TODO', label: 'To Do', color: 'border-slate-700 bg-slate-900/60' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-indigo-800/60 bg-indigo-950/20' },
    { id: 'REVIEW', label: 'Review', color: 'border-violet-800/60 bg-violet-950/20' },
    { id: 'COMPLETE', label: 'Complete', color: 'border-emerald-800/60 bg-emerald-950/20' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100 font-outfit">Project & Task Workspace</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-950 text-violet-400 border border-violet-800 rounded-md">
              3 View Modes Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage KSA enterprise projects, task assignments, and gantt timeline milestones
          </p>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'table' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>

          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KanbanIcon className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>

          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'timeline' ? 'bg-indigo-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TimelineIcon className="w-3.5 h-3.5" />
            <span>Gantt / Timeline</span>
          </button>
        </div>
      </div>

      {/* Project Selector Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL">All Mega Projects ({MOCK_PROJECTS.length})</option>
            {MOCK_PROJECTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {canManageProjects && (
          <button className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 hover:brightness-110 transition-all">
            <Plus className="w-4 h-4" /> Create New Task
          </button>
        )}
      </div>

      {/* Projects Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_PROJECTS.map((project) => (
          <div
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedProjectId === project.id
                ? 'bg-slate-900 border-indigo-500/60 ring-2 ring-indigo-500/20'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-100 text-xs font-outfit truncate">{project.name}</span>
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                project.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
              }`}>
                {project.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mb-3">{project.clientName}</p>

            <div className="flex items-center justify-between text-[11px] border-t border-slate-800/60 pt-2 text-slate-400">
              <span>Manager: {project.managerName}</span>
              <span className="font-bold text-slate-200">
                {canViewFinancials ? `SAR ${(project.budgetSAR / 1000000).toFixed(2)}M` : '🔒 Budget Masked'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* VIEW MODE 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className={`p-4 rounded-2xl border ${col.color} space-y-3`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h3 className="font-bold text-slate-200 text-xs font-outfit uppercase tracking-wider flex items-center gap-2">
                    <span>{col.label}</span>
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-800 text-slate-300 font-semibold">
                      {colTasks.length}
                    </span>
                  </h3>
                </div>

                <div className="space-y-3 min-h-[300px]">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3.5 bg-slate-900 rounded-xl border border-slate-800/90 shadow-md space-y-2 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                          {task.projectName}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          task.priority === 'URGENT' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          task.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-100 text-xs leading-snug">{task.name}</h4>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assigneeName}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500/30"
                          />
                          <span className="truncate max-w-[90px]">{task.assigneeName}</span>
                        </div>
                        <span className="flex items-center gap-1 text-slate-400 font-medium">
                          <Clock className="w-3 h-3 text-slate-500" /> {task.dueDate}
                        </span>
                      </div>

                      {/* Quick Move Buttons */}
                      <div className="flex items-center justify-between pt-2">
                        {col.id !== 'TODO' && (
                          <button
                            onClick={() => {
                              const prevStatus = col.id === 'IN_PROGRESS' ? 'TODO' : col.id === 'REVIEW' ? 'IN_PROGRESS' : 'REVIEW';
                              moveTaskStatus(task.id, prevStatus);
                            }}
                            className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
                          >
                            <ChevronLeft className="w-3 h-3" /> Move Prev
                          </button>
                        )}
                        {col.id !== 'COMPLETE' && (
                          <button
                            onClick={() => {
                              const nextStatus = col.id === 'TODO' ? 'IN_PROGRESS' : col.id === 'IN_PROGRESS' ? 'REVIEW' : 'COMPLETE';
                              moveTaskStatus(task.id, nextStatus);
                            }}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-0.5 ml-auto"
                          >
                            Move Next <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Task Name</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Assignee</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-100 font-outfit">
                      {task.name}
                    </td>
                    <td className="py-4 px-4 text-indigo-400 font-medium text-[11px]">
                      {task.projectName}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <img src={task.assigneeAvatar} alt={task.assigneeName} className="w-6 h-6 rounded-full object-cover" />
                        <span>{task.assigneeName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        task.priority === 'URGENT' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                        task.priority === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                      {task.dueDate}
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={task.status}
                        onChange={(e) => moveTaskStatus(task.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none cursor-pointer"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="COMPLETE">Complete</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: GANTT / TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div>
            <h3 className="font-bold text-slate-100 text-sm font-outfit">Project Gantt & Milestone Timeline</h3>
            <p className="text-xs text-slate-400">Horizontal schedule representation across August 2026</p>
          </div>

          <div className="space-y-4">
            {/* Timeline Header Days */}
            <div className="grid grid-cols-12 gap-1 text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-2">
              <div className="col-span-4 font-bold text-slate-400">Task Name & Assignee</div>
              <div className="col-span-8 grid grid-cols-4 text-center font-bold">
                <span>Aug 1 - Aug 7</span>
                <span>Aug 8 - Aug 14</span>
                <span>Aug 15 - Aug 21</span>
                <span>Aug 22 - Aug 28</span>
              </div>
            </div>

            {/* Timeline Task Bars */}
            {filteredTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-1 items-center text-xs py-2 border-b border-slate-800/40">
                <div className="col-span-4 space-y-0.5">
                  <span className="font-semibold text-slate-200 block truncate">{task.name}</span>
                  <span className="text-[10px] text-slate-400">{task.assigneeName} ({task.status})</span>
                </div>

                <div className="col-span-8 bg-slate-950 h-8 rounded-lg border border-slate-800 relative flex items-center px-2">
                  <div
                    className={`h-5 rounded-md text-[10px] font-bold text-white flex items-center px-2.5 shadow-md ${
                      task.status === 'COMPLETE' ? 'bg-emerald-600' :
                      task.status === 'IN_PROGRESS' ? 'bg-indigo-600' :
                      task.status === 'REVIEW' ? 'bg-violet-600' : 'bg-slate-700'
                    }`}
                    style={{
                      width: task.status === 'COMPLETE' ? '90%' : task.status === 'IN_PROGRESS' ? '65%' : task.status === 'REVIEW' ? '80%' : '35%',
                      marginLeft: task.id === 't1' ? '10%' : task.id === 't2' ? '25%' : '0%'
                    }}
                  >
                    <span className="truncate">{task.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
