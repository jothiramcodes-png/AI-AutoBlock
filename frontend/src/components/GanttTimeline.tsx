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
        return 'bg-[#4A90D9]/15 text-[#4A90D9] border-[#4A90D9]/50 hover:bg-[#4A90D9]/25';
      case 'Traction':
        return 'bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/50 hover:bg-[#F5A623]/25';
      case 'S&T':
        return 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/25';
      default:
        return 'bg-[#1E3A5F] text-slate-300 border-[#1E3A5F]';
    }
  };

  return (
    <div className="bg-[#13315C]/90 border border-[#1E3A5F] rounded-xl overflow-hidden shadow-lg">
      {/* Controls Bar */}
      <div className="p-4 border-b border-[#1E3A5F] flex flex-wrap items-center justify-between gap-4 bg-[#0B1F3A]">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Corridor Block Allocation Timeline</span>
            <span className="text-xs px-2 py-0.5 rounded bg-[#4A90D9]/20 text-[#4A90D9] font-normal border border-[#4A90D9]/30">
              {filteredTasks.length} Active Blocks Scheduled
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Constraint-optimized track closure windows across Indian Railways trunk & branch sections
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          {/* Search Box */}
          <input
            type="text"
            placeholder="Search section or defect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#13315C] border border-[#1E3A5F] rounded-lg px-3 py-1 text-xs text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#4A90D9]"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-b border-[#1E3A5F] bg-[#0B1F3A]/70 flex flex-wrap items-center gap-4 text-xs">
        <span className="text-[#94A3B8] font-medium">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#4A90D9] inline-block"></span>
          <span className="text-slate-300">Engineering (Track)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#F5A623] inline-block"></span>
          <span className="text-slate-300">Traction Distribution</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-[#8B5CF6] inline-block"></span>
          <span className="text-slate-300">Signal & Telecom</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-[#1E3A5F] pl-3">
          <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/50 text-[10px] font-bold flex items-center gap-1">
            <Layers className="w-3 h-3" /> JOINT BLOCK
          </span>
          <span className="text-[#94A3B8] text-[11px]">Consolidated multi-dept window</span>
        </div>
        <div className="flex items-center gap-1.5 border-l border-[#1E3A5F] pl-3">
          <span className="px-1.5 py-0.5 rounded bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/50 text-[10px] font-bold flex items-center gap-1">
            <Lock className="w-3 h-3" /> PINNED
          </span>
          <span className="text-[#94A3B8] text-[11px]">Human Officer Lock</span>
        </div>
      </div>

      {/* Gantt Grid Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#1E3A5F] bg-[#0B1F3A] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
              <th className="p-3 w-64 sticky left-0 bg-[#0B1F3A] z-10">Corridor Section</th>
              {distinctDates.map((date) => (
                <th key={date} className="p-3 text-center border-l border-[#1E3A5F] min-w-[140px]">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E3A5F]/60 text-xs">
            {sections.map((sec) => (
              <tr key={sec.section_id} className="hover:bg-[#1E3A5F]/20 transition-colors">
                {/* Section Details Sticky Column */}
                <td className="p-3 sticky left-0 bg-[#0B1F3A] z-10 border-r border-[#1E3A5F]">
                  <div className="font-semibold text-white text-xs leading-snug">{sec.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#13315C] text-[#94A3B8] font-mono border border-[#1E3A5F]">
                      {sec.section_id}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        sec.tier === 'Tier-1 Trunk'
                          ? 'bg-[#D64545]/20 text-[#D64545] border border-[#D64545]/30'
                          : 'bg-[#4A90D9]/20 text-[#4A90D9] border border-[#4A90D9]/30'
                      }`}
                    >
                      {sec.tier}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">{sec.speed_limit_kmh} km/h</span>
                  </div>
                </td>

                {/* Day Cells */}
                {distinctDates.map((date) => {
                  const cellTasks = taskMap[`${sec.section_id}_${date}`] || [];
                  return (
                    <td key={date} className="p-2 border-l border-[#1E3A5F]/60 align-top">
                      {cellTasks.length === 0 ? (
                        <div className="h-12 flex items-center justify-center text-[10px] text-[#94A3B8]/60 italic">
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
                                  isSelected ? 'ring-2 ring-[#F5A623] scale-[1.02] shadow-md' : ''
                                } ${isJoint ? 'border-[#8B5CF6]/80 shadow-[#8B5CF6]/10' : ''}`}
                              >
                                {/* Header badges */}
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="font-mono text-[10px] font-bold tracking-tight">
                                    {t.task_id}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {isJoint && (
                                      <span className="px-1 py-0.2 rounded bg-[#8B5CF6] text-white text-[9px] font-bold flex items-center gap-0.5">
                                        <Layers className="w-2.5 h-2.5" /> JOINT
                                      </span>
                                    )}
                                    {isLocked && (
                                      <span className="p-0.5 rounded bg-[#F5A623] text-[#0B1F3A]" title="Locked by Officer">
                                        <Lock className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                    <span className="text-[10px] font-semibold text-slate-300">
                                      {t.priority_score.toFixed(0)} pts
                                    </span>
                                  </div>
                                </div>

                                {/* Defect Title */}
                                <div className="font-medium text-[11px] truncate text-slate-200" title={t.defect_type}>
                                  {t.defect_type}
                                </div>

                                {/* Time range and duration */}
                                <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-1">
                                  <span>{t.placement_reason.time_range || `${t.start_hour}:00 - ${t.end_hour}:00`}</span>
                                  <span className="font-semibold text-slate-300">{t.duration_hours}h block</span>
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
