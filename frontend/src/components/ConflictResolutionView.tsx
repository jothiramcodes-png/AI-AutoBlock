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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <span>Cross-Department Conflict Resolution & Joint Consolidation Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visualizing how independent departmental block requests in BDMS are automatically resolved and consolidated by Google OR-Tools CP-SAT
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-semibold">
          {consolidatedWindows.length} Joint Blocks Formed
        </div>
      </div>

      {consolidatedWindows.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
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
                className="bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 rounded-xl p-4 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-purple-300 font-bold">{winId}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{secId}</span>
                    <span className="text-xs text-slate-400">{date}</span>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Saved {savedHours}h Closure
                  </div>
                </div>

                {/* Comparison Columns: BDMS Silo vs AI Joint */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {/* BDMS Siloed Mode */}
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-2">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Manual BDMS (Siloed)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
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
                    <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] font-bold text-rose-300 flex justify-between">
                      <span>Total Corridor Closure:</span>
                      <span>{sumDuration.toFixed(1)} hrs</span>
                    </div>
                  </div>

                  {/* AI CP-SAT Consolidated Mode */}
                  <div className="bg-purple-950/20 p-3 rounded-lg border border-purple-800/40">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-2">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>AI-Optimized (Joint)</span>
                    </div>
                    <p className="text-[11px] text-purple-200 mb-2">
                      Synchronized simultaneously in one track closure:
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {departments.map((d) => (
                        <span key={d} className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[10px] font-medium">
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-purple-800/50 text-[11px] font-bold text-emerald-300 flex justify-between">
                      <span>Actual Corridor Closure:</span>
                      <span>{maxDuration.toFixed(1)} hrs</span>
                    </div>
                  </div>
                </div>

                {/* Tasks List in Window */}
                <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
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
