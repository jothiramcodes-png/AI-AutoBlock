// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React, { useEffect, useState } from 'react';
import { fetchAuditTrail } from '../services/api';
import { History, RefreshCw } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditTrail();
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <span>Optimization Run & Decision Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of CP-SAT optimization runs, re-optimizations, solver convergence statuses, and runtimes
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/40">
              <th className="p-3">Run ID</th>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Horizon</th>
              <th className="p-3">Solver Status</th>
              <th className="p-3">Runtime</th>
              <th className="p-3">Total Tasks</th>
              <th className="p-3">Scheduled</th>
              <th className="p-3">Unscheduled</th>
              <th className="p-3">Officer Locks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-slate-500">
                  No optimization runs logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-800/20">
                  <td className="p-3 font-mono text-blue-400 font-bold">{log.run_id}</td>
                  <td className="p-3 text-slate-300">{log.timestamp}</td>
                  <td className="p-3 text-slate-300">{log.horizon}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      {log.solver_status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200">{log.runtime_ms} ms</td>
                  <td className="p-3 text-slate-300">{log.total_tasks}</td>
                  <td className="p-3 text-emerald-400 font-semibold">{log.scheduled_tasks}</td>
                  <td className="p-3 text-amber-400">{log.unscheduled_tasks}</td>
                  <td className="p-3 text-slate-300">{log.locked_tasks}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
