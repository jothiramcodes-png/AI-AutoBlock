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
        return 'bg-[#D64545]/20 text-[#D64545] border-[#D64545]/40';
      case 'Major':
        return 'bg-[#E8590C]/20 text-[#E8590C] border-[#E8590C]/40';
      case 'Minor':
        return 'bg-[#1E3A5F] text-[#94A3B8] border-[#1E3A5F]';
      default:
        return 'bg-[#0B1F3A] text-[#94A3B8] border-[#1E3A5F]';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#D64545] font-bold';
    if (score >= 60) return 'text-[#E8590C] font-bold';
    if (score >= 40) return 'text-[#4A90D9] font-medium';
    return 'text-[#94A3B8]';
  };

  return (
    <div className="bg-[#13315C]/90 border border-[#1E3A5F] rounded-xl overflow-hidden shadow-lg">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-[#1E3A5F] flex flex-wrap items-center justify-between gap-4 bg-[#0B1F3A]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Maintenance Tasks & Defect Inventory</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#4A90D9]/20 text-[#4A90D9] font-normal border border-[#4A90D9]/30">
              {filteredTasks.length} Tasks
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Prioritized by AI explainability model based on safety risk, defect severity, overdue aging, and train punctuality impact
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center bg-[#13315C] rounded-lg p-0.5 border border-[#1E3A5F] text-xs">
            {['ALL', 'Engineering', 'Traction', 'S&T'].map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  deptFilter === d ? 'bg-[#1E3A5F] text-[#F5A623] font-semibold border border-[#F5A623]/30 shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center bg-[#13315C] rounded-lg p-0.5 border border-[#1E3A5F] text-xs">
            {['ALL', 'Critical', 'Major', 'Minor'].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  severityFilter === s ? 'bg-[#1E3A5F] text-[#F5A623] font-semibold border border-[#F5A623]/30 shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#13315C] border border-[#1E3A5F] rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90D9]"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-[#0B1F3A] border-b border-[#1E3A5F] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider z-10">
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
          <tbody className="divide-y divide-[#1E3A5F]/60">
            {filteredTasks.map((t) => {
              const isSelected = selectedTaskId === t.task_id;
              const isLocked = lockedTaskIds.has(t.task_id);

              return (
                <tr
                  key={t.task_id}
                  onClick={() => onSelectTask(t)}
                  className={`hover:bg-[#1E3A5F]/40 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#1E3A5F]/60 border-l-2 border-[#F5A623]' : ''
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
                      <span className="text-[#F5A623] font-semibold">{t.days_overdue} days</span>
                    ) : (
                      <span className="text-[#94A3B8]">On schedule</span>
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
                        className="p-1 rounded bg-[#1E3A5F] hover:bg-[#1E3A5F]/80 text-[#94A3B8] hover:text-white transition-colors"
                        title="View Explainability Breakdown"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onToggleLock(t)}
                        className={`p-1 rounded transition-colors ${
                          isLocked
                            ? 'bg-[#F5A623]/20 text-[#F5A623] hover:bg-[#F5A623]/30 border border-[#F5A623]/40'
                            : 'bg-[#1E3A5F] hover:bg-[#1E3A5F]/80 text-[#94A3B8] hover:text-white'
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
