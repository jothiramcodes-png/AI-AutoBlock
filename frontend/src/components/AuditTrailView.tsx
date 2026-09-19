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
    <div className="bg-[#13315C]/90 border border-[#1E3A5F] rounded-xl overflow-hidden shadow-lg p-6">
      <div className="flex items-center justify-between mb-6 border-b border-[#1E3A5F] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-[#4A90D9]" />
            <span>Optimization Run & Decision Audit Trail</span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Immutable log of CP-SAT optimization runs, re-optimizations, solver convergence statuses, and runtimes
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E3A5F] hover:bg-[#1E3A5F]/80 text-xs text-[#94A3B8] hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E3A5F] text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider bg-[#0B1F3A]">
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
          <tbody className="divide-y divide-[#1E3A5F]/60">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-[#94A3B8]">
                  No optimization runs logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={i} className="hover:bg-[#1E3A5F]/20">
                  <td className="p-3 font-mono text-[#4A90D9] font-bold">{log.run_id}</td>
                  <td className="p-3 text-slate-300">{log.timestamp}</td>
                  <td className="p-3 text-slate-300">{log.horizon}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-[#2E9E6D]/15 text-[#2E9E6D] border border-[#2E9E6D]/30 font-bold text-[10px]">
                      {log.solver_status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-200">{log.runtime_ms} ms</td>
                  <td className="p-3 text-slate-300">{log.total_tasks}</td>
                  <td className="p-3 text-[#2E9E6D] font-semibold">{log.scheduled_tasks}</td>
                  <td className="p-3 text-[#F5A623]">{log.unscheduled_tasks}</td>
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
