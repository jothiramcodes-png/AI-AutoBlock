// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React, { useState } from 'react';
import type { DefectTask } from '../types';
import { Search, Lock, Unlock, Eye } from 'lucide-react';

interface TaskTableProps {
  tasks: DefectTask[];
  onSelectTask: (task: DefectTask) => void;
  onToggleLock: (task: DefectTask) => void;
  lockedTaskIds: Set<string>;
  selectedTaskId?: string;
}

export const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onSelectTask,
  onToggleLock,
  lockedTaskIds,
  selectedTaskId
}) => {
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    if (deptFilter !== 'ALL' && t.department !== deptFilter) return false;
    if (severityFilter !== 'ALL' && t.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.task_id.toLowerCase().includes(q) ||
        t.defect_type.toLowerCase().includes(q) ||
        t.section_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'Major':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Minor':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400 font-bold';
    if (score >= 60) return 'text-amber-400 font-bold';
    if (score >= 40) return 'text-blue-400 font-medium';
    return 'text-slate-400';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Maintenance Tasks & Defect Inventory</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">
              {filteredTasks.length} Tasks
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Prioritized by AI explainability model based on safety risk, defect severity, overdue aging, and train punctuality impact
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            {['ALL', 'Engineering', 'Traction', 'S&T'].map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  deptFilter === d ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            {['ALL', 'Critical', 'Major', 'Minor'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  severityFilter === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider z-10">
            <tr>
              <th className="p-3">Task ID</th>
              <th className="p-3">Section</th>
              <th className="p-3">Dept</th>
              <th className="p-3">Defect Description</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Overdue</th>
              <th className="p-3">Duration</th>
              <th className="p-3 text-right">Priority Score</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredTasks.map((t) => {
              const isSelected = selectedTaskId === t.task_id;
              const isLocked = lockedTaskIds.has(t.task_id);

              return (
                <tr
                  key={t.task_id}
                  onClick={() => onSelectTask(t)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-950/40 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <td className="p-3 font-mono font-bold text-slate-200">{t.task_id}</td>
                  <td className="p-3 font-mono text-slate-300">{t.section_id}</td>
                  <td className="p-3 font-medium text-slate-300">{t.department}</td>
                  <td className="p-3 text-white font-medium max-w-xs truncate" title={t.defect_type}>
                    {t.defect_type}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityBadge(t.severity)}`}>
                      {t.severity}
                    </span>
                  </td>
                  <td className="p-3">
                    {t.days_overdue > 0 ? (
                      <span className="text-amber-400 font-semibold">{t.days_overdue} days</span>
                    ) : (
                      <span className="text-slate-500">On schedule</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-300">{t.estimated_duration_hours}h</td>
                  <td className="p-3 text-right">
                    <span className={`text-sm ${getScoreColor(t.priority_score)}`}>
                      {t.priority_score.toFixed(1)}
                    </span>
                  </td>
                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectTask(t)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="View Explainability Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleLock(t)}
                        className={`p-1 rounded transition-colors ${
                          isLocked
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={isLocked ? 'Task Locked by Officer' : 'Lock/Pin to Block'}
                      >
                        {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
