// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React from 'react';
import type { DefectTask, ScheduledTaskDetail } from '../types';
import { X, ShieldCheck, Clock, Layers, Lock, Unlock, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ExplainabilityDrawerProps {
  task: DefectTask | ScheduledTaskDetail | null;
  onClose: () => void;
  onToggleLock: (task: DefectTask | ScheduledTaskDetail) => void;
  isLocked: boolean;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  task,
  onClose,
  onToggleLock,
  isLocked
}) => {
  if (!task) return null;

  const b = 'score_breakdown' in task ? task.score_breakdown : null;
  const placement = 'placement_reason' in task ? task.placement_reason : null;
  const durationHours = 'estimated_duration_hours' in task ? task.estimated_duration_hours : task.duration_hours;

  const factors = b
    ? [
        { label: 'Safety Hazard & Risk', value: b.safety_risk_component, max: 30.0, color: 'bg-[#D64545]' },
        { label: 'Defect Severity Tier', value: b.defect_severity_component, max: 25.0, color: 'bg-[#E8590C]' },
        { label: 'Asset Corridor Criticality', value: b.asset_criticality_component, max: 20.0, color: 'bg-[#F5A623]' },
        { label: 'Aging / Days Overdue', value: b.overdue_days_component, max: 15.0, color: 'bg-[#F5A623]' },
        { label: 'Punctuality & Delay Impact', value: b.train_impact_component, max: 6.0, color: 'bg-[#4A90D9]' },
        { label: 'Failure History Correlation', value: b.failure_history_component, max: 4.0, color: 'bg-[#8B5CF6]' },
      ]
    : [];

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0B1F3A] border-l border-[#1E3A5F] shadow-2xl z-50 overflow-y-auto flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="p-4 border-b border-[#1E3A5F] flex items-center justify-between bg-[#0B1F3A]/95 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#4A90D9]/20 text-[#4A90D9]">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Decision Explainability</h3>
              <p className="text-[11px] text-[#94A3B8]">Mathematical score breakdown & placement audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#13315C] text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Task Summary Banner */}
        <div className="p-4 bg-[#13315C] border-b border-[#1E3A5F]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs font-bold text-[#4A90D9]">{task.task_id}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#4A90D9]/20 text-[#4A90D9] border border-[#4A90D9]/30">
              Score: {task.priority_score.toFixed(1)} / 100
            </span>
          </div>
          <h4 className="text-sm font-semibold text-white leading-snug">{task.defect_type}</h4>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-[#94A3B8]">
            <span className="px-2 py-0.5 rounded bg-[#0B1F3A] text-slate-300 font-mono border border-[#1E3A5F]">{task.section_id}</span>
            <span className="px-2 py-0.5 rounded bg-[#0B1F3A] text-slate-300 border border-[#1E3A5F]">{task.department}</span>
            <span className="px-2 py-0.5 rounded bg-[#0B1F3A] text-slate-300 border border-[#1E3A5F]">{task.severity}</span>
            <span className="px-2 py-0.5 rounded bg-[#0B1F3A] text-slate-300 border border-[#1E3A5F]">{durationHours}h duration</span>
          </div>
        </div>

        {/* Section 1: Why Was This Task Prioritized? */}
        <div className="p-4 border-b border-[#1E3A5F]">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#2E9E6D]" />
              <span>1. Why Was This Task Prioritized?</span>
            </h5>
            <span className="text-[11px] text-[#94A3B8]">Exact Factor Breakdown</span>
          </div>

          <p className="text-xs text-[#94A3B8] mb-3">
            Each factor is derived from statutory Indian Railways safety norms, track speed class, and days overdue. The total matches the sum of components:
          </p>

          <div className="space-y-2.5">
            {factors.map((f, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">{f.label}</span>
                  <span className="text-[#94A3B8] font-mono text-[11px]">
                    <span className="font-semibold text-white">{f.value.toFixed(1)}</span> / {f.max.toFixed(1)} pts
                  </span>
                </div>
                <div className="h-2 w-full bg-[#13315C] rounded-full overflow-hidden">
                  <div
                    className={`h-full ${f.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(f.value / f.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#1E3A5F] flex justify-between text-xs font-bold text-white">
            <span>Calibrated Total Priority:</span>
            <span className="text-[#4A90D9] font-mono">{task.priority_score.toFixed(1)} pts</span>
          </div>
        </div>

        {/* Section 2: Why Was This Task Placed in This Block? */}
        {placement && (
          <div className="p-4 border-b border-[#1E3A5F]">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <Clock className="w-4 h-4 text-[#4A90D9]" />
              <span>2. Why Was It Scheduled in This Window?</span>
            </h5>

            <div className="bg-[#13315C] rounded-xl p-3.5 border border-[#1E3A5F] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Assigned Window:</span>
                <span className="font-mono text-white font-semibold">{placement.selected_window}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Window Time Slot:</span>
                <span className="text-white">{placement.date} ({placement.time_range})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Corridor Traffic Density:</span>
                <span className="text-[#2E9E6D] font-medium">{placement.corridor_traffic_density}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94A3B8]">Passenger Trains Delayed:</span>
                <span className="text-white">{placement.passenger_trains_affected} trains</span>
              </div>

              {placement.is_joint_block && (
                <div className="mt-2 pt-2 border-t border-[#1E3A5F] text-[#8B5CF6]">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Joint Block Synergies:</span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8]">
                    Consolidated with {placement.consolidated_departments.join(' + ')} departments to save duplicate track closure.
                  </p>
                </div>
              )}

              <div className="mt-2 pt-2 border-t border-[#1E3A5F]">
                <span className="text-[#94A3B8] block mb-1">Binding Constraints Satisfied:</span>
                <div className="flex flex-wrap gap-1">
                  {placement.binding_constraints.map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#0B1F3A] text-slate-300 text-[10px] font-mono flex items-center gap-1 border border-[#1E3A5F]">
                      <CheckCircle2 className="w-2.5 h-2.5 text-[#2E9E6D]" /> {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Officer Override Action */}
      <div className="p-4 border-t border-[#1E3A5F] bg-[#0B1F3A]/95 sticky bottom-0">
        <button
          onClick={() => onToggleLock(task)}
          className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
            isLocked
              ? 'bg-[#F5A623]/20 text-[#F5A623] border border-[#F5A623]/40 hover:bg-[#F5A623]/30 font-bold'
              : 'bg-[#F5A623] text-[#0B1F3A] hover:bg-[#F5A623]/90 font-bold shadow-lg shadow-[#F5A623]/10'
          }`}
        >
          {isLocked ? (
            <>
              <Unlock className="w-4 h-4" />
              <span>Unlock Block (Allow AI to Re-Optimize)</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Lock / Pin Block (Enforce as Hard Solver Constraint)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
