// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React, { useState } from 'react';
import { simulateWhatIf } from '../services/api';
import type { WhatIfResponse } from '../types';
import { AlertCircle, RefreshCw, ArrowRight, Zap } from 'lucide-react';

interface WhatIfSimulatorProps {
  onReoptimized: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ onReoptimized }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WhatIfResponse | null>(null);

  const handleSimulate = async (action: string) => {
    setLoading(true);
    try {
      const res = await simulateWhatIf(action);
      setResult(res);
      onReoptimized();
    } catch (err) {
      console.error('What-If failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Operational Contingency & What-If Re-Optimization Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate unscheduled real-world emergencies (rail fractures, OHE snapping, window cancellations).
            The CP-SAT solver re-optimizes in real-time and computes exact schedule diffs.
          </p>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSimulate('INJECT_EMERGENCY_DEFECT')}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>Inject Emergency Rail Fracture (NDLS-GZB)</span>
          </button>
        </div>
      </div>

      {/* Results / Diff Panel */}
      {result ? (
        <div className="space-y-6">
          {/* Status Metric Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Re-Optimization Runtime</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {result.measured_reoptimization_runtime_ms} ms
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Real wall-clock solver time</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Schedule Shifts Detected</span>
              <span className="text-xl font-bold text-white font-mono">{result.changes_count}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Displaced or reprioritized tasks</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Injected Emergency Task</span>
              <span className="text-xs font-mono font-bold text-red-400 truncate block">
                {result.injected_task_id || 'TSK-EMERGENCY'}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">IMR Rail Fracture (Priority 99+)</span>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <span className="text-xs text-slate-400 block mb-1">Solver Status</span>
              <span className="text-xl font-bold text-blue-400 font-mono">
                {result.new_plan.solver_status}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">Google OR-Tools CP-SAT</span>
            </div>
          </div>

          {/* Schedule Diffs List */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span>Detailed Schedule Adjustments & Explanations</span>
              <span className="text-xs font-normal text-slate-400">({result.schedule_diffs.length} shifts)</span>
            </h3>

            {result.schedule_diffs.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-slate-800">
                The emergency task was accommodated in an open unused window without displacing any scheduled tasks.
              </div>
            ) : (
              <div className="space-y-2.5">
                {result.schedule_diffs.map((diff, idx) => {
                  const isNew = diff.change_type === 'NEWLY_SCHEDULED';
                  const isShift = diff.change_type === 'WINDOW_SHIFTED';

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                        isNew
                          ? 'bg-red-950/20 border-red-500/40 text-red-200'
                          : isShift
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                          : 'bg-slate-800/40 border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{diff.task_id}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 font-semibold uppercase">
                            {diff.change_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-slate-400 font-medium">{diff.department}</span>
                        </div>
                        <div className="font-medium text-white">{diff.defect_type}</div>
                        <p className="text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-300">Why it changed: </span>
                          {diff.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] shrink-0 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-slate-400">{diff.old_window || 'Unscheduled'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-emerald-400 font-semibold">{diff.new_window || 'Unscheduled'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400 text-sm bg-slate-950/40 rounded-xl border border-slate-800/80">
          <AlertCircle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
          <p className="font-semibold text-white">No active contingency simulation</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Click the button above to simulate a sudden 25kV OHE fracture or IMR rail defect on a trunk corridor.
            Watch the CP-SAT engine re-optimize block allocations in real time.
          </p>
        </div>
      )}
    </div>
  );
};
