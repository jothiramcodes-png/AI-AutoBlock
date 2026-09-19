// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React from 'react';
import type { ScheduledTaskDetail } from '../types';
import { Layers, CheckCircle2, XCircle } from 'lucide-react';

interface ConflictResolutionViewProps {
  scheduledTasks: ScheduledTaskDetail[];
}

export const ConflictResolutionView: React.FC<ConflictResolutionViewProps> = ({ scheduledTasks }) => {
  // Find consolidated windows
  const windowGroups: Record<string, ScheduledTaskDetail[]> = {};
  scheduledTasks.forEach((t) => {
    if (!windowGroups[t.window_id]) windowGroups[t.window_id] = [];
    windowGroups[t.window_id].push(t);
  });

  const consolidatedWindows = Object.entries(windowGroups).filter(([_, tasks]) => {
    const depts = new Set(tasks.map((t) => t.department));
    return depts.size >= 2;
  });

  return (
    <div className="bg-[#13315C]/90 border border-[#1E3A5F] rounded-xl overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#8B5CF6]" />
            <span>Cross-Department Conflict Resolution & Joint Consolidation Matrix</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Visualizing how independent departmental block requests in BDMS are automatically resolved and consolidated by Google OR-Tools CP-SAT
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 text-xs font-semibold">
          {consolidatedWindows.length} Joint Blocks Formed
        </div>
      </div>

      {consolidatedWindows.length === 0 ? (
        <div className="text-center py-12 text-[#94A3B8] text-sm">
          No multi-department joint blocks formed in the current planning horizon.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {consolidatedWindows.map(([winId, tasks]) => {
            const departments = Array.from(new Set(tasks.map((t) => t.department)));
            const secId = tasks[0].section_id;
            const date = tasks[0].date;
            const maxDuration = Math.max(...tasks.map((t) => t.duration_hours));
            const sumDuration = tasks.reduce((acc, t) => acc + t.duration_hours, 0);
            const savedHours = roundNum(sumDuration - maxDuration, 1);

            return (
              <div
                key={winId}
                className="bg-[#0B1F3A]/90 border border-[#1E3A5F] hover:border-[#8B5CF6]/50 rounded-xl p-4 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8B5CF6] font-bold">{winId}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#13315C] text-[#94A3B8] border border-[#1E3A5F]">{secId}</span>
                    <span className="text-xs text-[#94A3B8]">{date}</span>
                  </div>
                  <div className="text-xs font-bold text-[#2E9E6D] bg-[#2E9E6D]/15 px-2 py-0.5 rounded border border-[#2E9E6D]/30">
                    Saved {savedHours}h Closure
                  </div>
                </div>

                {/* Comparison Columns: BDMS Silo vs AI Joint */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* BDMS Siloed Mode */}
                  <div className="bg-[#13315C] p-3 rounded-lg border border-[#1E3A5F]">
                    <div className="flex items-center gap-1.5 text-[#D64545] font-semibold mb-2">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Manual BDMS (Siloed)</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mb-2">
                      Departments request separate blocks sequentially:
                    </p>
                    <div className="space-y-1 text-[11px]">
                      {tasks.map((t) => (
                        <div key={t.task_id} className="text-slate-300 flex justify-between">
                          <span>{t.department}:</span>
                          <span className="font-mono">{t.duration_hours}h</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#1E3A5F] text-[11px] font-bold text-[#D64545] flex justify-between">
                      <span>Total Corridor Closure:</span>
                      <span>{sumDuration.toFixed(1)} hrs</span>
                    </div>
                  </div>

                  {/* AI CP-SAT Consolidated Mode */}
                  <div className="bg-[#13315C] p-3 rounded-lg border border-[#8B5CF6]/40">
                    <div className="flex items-center gap-1.5 text-[#2E9E6D] font-semibold mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>AI-Optimized (Joint)</span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] mb-2">
                      Synchronized simultaneously in one track closure:
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {departments.map((d) => (
                        <span key={d} className="px-1.5 py-0.2 rounded bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 text-[10px] font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#8B5CF6]/40 text-[11px] font-bold text-[#2E9E6D] flex justify-between">
                      <span>Actual Corridor Closure:</span>
                      <span>{maxDuration.toFixed(1)} hrs</span>
                    </div>
                  </div>
                </div>

                {/* Tasks List in Window */}
                <div className="mt-3 pt-2 border-t border-[#1E3A5F] text-[11px] text-[#94A3B8]">
                  <span className="font-medium text-slate-300">Co-scheduled tasks: </span>
                  {tasks.map((t) => `${t.task_id} (${t.defect_type})`).join(' • ')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function roundNum(val: number, dec: number) {
  return Number(val.toFixed(dec));
}
