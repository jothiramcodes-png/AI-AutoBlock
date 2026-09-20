// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React, { useState } from 'react';
import type { Section, ScheduledTaskDetail } from '../types';
import { Lock, Layers } from 'lucide-react';

interface GanttTimelineProps {
  sections: Section[];
  scheduledTasks: ScheduledTaskDetail[];
  onSelectTask: (task: ScheduledTaskDetail) => void;
  onLockTask: (task: ScheduledTaskDetail) => void;
  selectedTaskId?: string;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  sections,
  scheduledTasks,
  onSelectTask,
  selectedTaskId
}) => {
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract distinct dates
  const distinctDates = Array.from(new Set(scheduledTasks.map((t) => t.date))).sort();

  // Filter tasks
  const filteredTasks = scheduledTasks.filter((t) => {
    if (deptFilter !== 'ALL' && t.department !== deptFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.task_id.toLowerCase().includes(q) ||
        t.defect_type.toLowerCase().includes(q) ||
        t.section_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Group scheduled tasks by (section_id, date)
  const taskMap: Record<string, ScheduledTaskDetail[]> = {};
  filteredTasks.forEach((t) => {
    const key = `${t.section_id}_${t.date}`;
    if (!taskMap[key]) taskMap[key] = [];
    taskMap[key].push(t);
  });

  const getDeptColor = (dept: string) => {
    switch (dept) {
      case 'Engineering':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30';
      case 'Traction':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30';
      case 'S&T':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Controls Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-slate-900">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2">
            <span>Corridor Block Allocation Timeline</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-normal">
              {filteredTasks.length} Active Blocks Scheduled
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Constraint-optimized track closure windows across Indian Railways trunk & branch sections
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Department Filter */}
          <div className="flex items-center overflow-x-auto no-scrollbar bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs shrink-0">
            {['ALL', 'Engineering', 'Traction', 'S&T'].map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all shrink-0 ${
                  deptFilter === d ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search section or defect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full sm:w-52"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="px-3 sm:px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
        <span className="text-slate-400 font-medium text-[11px] sm:text-xs">Legend:</span>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
          <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block shrink-0"></span>
          <span className="text-slate-300">Engineering (Track)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block shrink-0"></span>
          <span className="text-slate-300">Traction (OHE)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block shrink-0"></span>
          <span className="text-slate-300">S&T (Signals)</span>
        </div>
        <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-700 sm:pl-3">
          <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/50 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <Layers className="w-3 h-3" /> JOINT BLOCK
          </span>
          <span className="text-slate-400 text-[10px] sm:text-[11px]">Consolidated multi-dept window</span>
        </div>
        <div className="flex items-center gap-1.5 sm:border-l sm:border-slate-700 sm:pl-3">
          <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-400/50 text-[10px] font-bold flex items-center gap-1 shrink-0">
            <Lock className="w-3 h-3" /> PINNED
          </span>
          <span className="text-slate-400 text-[10px] sm:text-[11px]">Human Officer Lock</span>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden px-3 py-1 bg-slate-950/70 border-b border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
        <span>Swipe horizontally to view all corridor dates</span>
        <span>→</span>
      </div>

      {/* Gantt Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px] sm:min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="p-2 sm:p-3 w-40 sm:w-64 sticky left-0 bg-slate-900 z-20">Corridor Section</th>
              {distinctDates.map((date) => (
                <th key={date} className="p-2 sm:p-3 text-center border-l border-slate-800/80 min-w-[130px] sm:min-w-[140px]">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {sections.map((sec) => (
              <tr key={sec.section_id} className="hover:bg-slate-800/20 transition-colors">
                {/* Section Details Sticky Column */}
                <td className="p-2 sm:p-3 sticky left-0 bg-slate-900/95 z-20 border-r border-slate-800 max-w-[140px] sm:max-w-none">
                  <div className="font-semibold text-white text-[11px] sm:text-xs leading-snug break-words">{sec.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                      {sec.section_id}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        sec.tier === 'Tier-1 Trunk'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {sec.tier}
                    </span>
                    <span className="text-[10px] text-slate-400">{sec.speed_limit_kmh} km/h</span>
                  </div>
                </td>

                {/* Day Cells */}
                {distinctDates.map((date) => {
                  const cellTasks = taskMap[`${sec.section_id}_${date}`] || [];
                  return (
                    <td key={date} className="p-2 border-l border-slate-800/60 align-top">
                      {cellTasks.length === 0 ? (
                        <div className="h-12 flex items-center justify-center text-[10px] text-slate-600 italic">
                          Clear Line
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {cellTasks.map((t) => {
                            const isSelected = selectedTaskId === t.task_id;
                            const isJoint = t.is_consolidated;
                            const isLocked = t.assignment_source === 'HUMAN_LOCKED';

                            return (
                              <div
                                key={t.task_id}
                                onClick={() => onSelectTask(t)}
                                className={`p-2 rounded-lg border text-left cursor-pointer transition-all relative ${getDeptColor(
                                  t.department
                                )} ${
                                  isSelected ? 'ring-2 ring-blue-400 scale-[1.02] shadow-md' : ''
                                } ${isJoint ? 'border-purple-500/80 shadow-purple-500/10' : ''}`}
                              >
                                {/* Header badges */}
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[10px] font-bold tracking-tight">
                                    {t.task_id}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {isJoint && (
                                      <span className="px-1 py-0.2 rounded bg-purple-500 text-white text-[9px] font-bold flex items-center gap-0.5">
                                        <Layers className="w-2.5 h-2.5" /> JOINT
                                      </span>
                                    )}
                                    {isLocked && (
                                      <span className="p-0.5 rounded bg-yellow-500 text-slate-900" title="Locked by Officer">
                                        <Lock className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                    <span className="text-[10px] font-semibold text-slate-300">
                                      {t.priority_score.toFixed(0)} pts
                                    </span>
                                  </div>
                                </div>

                                {/* Defect Title */}
                                <div className="font-medium text-[11px] truncate" title={t.defect_type}>
                                  {t.defect_type}
                                </div>

                                {/* Time range and duration */}
                                <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                                  <span>{t.placement_reason.time_range || `${t.start_hour}:00 - ${t.end_hour}:00`}</span>
                                  <span className="font-semibold">{t.duration_hours}h block</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
