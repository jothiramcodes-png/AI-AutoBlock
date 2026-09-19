// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'gantt' | 'conflicts' | 'defects' | 'whatif' | 'audit';
  setActiveTab: (tab: 'dashboard' | 'gantt' | 'conflicts' | 'defects' | 'whatif' | 'audit') => void;
  horizon: 'Weekly' | 'Monthly';
  setHorizon: (h: 'Weekly' | 'Monthly') => void;
  onRefresh: () => void;
  loading: boolean;
  solverStatus?: string;
  runtimeMs?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  horizon,
  setHorizon,
  onRefresh,
  loading,
  solverStatus,
  runtimeMs
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
      {/* Simulation Compliance Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 text-center text-xs font-semibold text-amber-400 flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA (SIH PS ID 26027 PROTOTYPE)</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & System Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">AI-AutoBlock</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  SIH 26027
                </span>
              </div>
              <p className="text-xs text-slate-400">Automatic Block Planning System • Ministry of Railways</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {[
              { id: 'dashboard', label: 'Executive KPIs' },
              { id: 'gantt', label: 'Corridor Gantt' },
              { id: 'conflicts', label: 'Conflict View' },
              { id: 'defects', label: 'Task Backlog' },
              { id: 'whatif', label: 'What-If Simulation' },
              { id: 'audit', label: 'Audit Trail' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Horizon Toggle & Status Controls */}
          <div className="flex items-center gap-3">
            {/* Horizon Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setHorizon('Weekly')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  horizon === 'Weekly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekly (7D)
              </button>
              <button
                onClick={() => setHorizon('Monthly')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  horizon === 'Monthly' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly (30D)
              </button>
            </div>

            {/* Solver Status Indicator */}
            {solverStatus && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-semibold">{solverStatus}</span>
                {runtimeMs && <span className="text-slate-400 text-[10px]">({runtimeMs}ms)</span>}
              </div>
            )}

            {/* Re-solve Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Solving...' : 'Re-Run CP-SAT'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
