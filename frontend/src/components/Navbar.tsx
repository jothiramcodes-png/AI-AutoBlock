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
    <header className="border-b border-[#1E3A5F] bg-[#0B1F3A]/95 backdrop-blur sticky top-0 z-40">
      {/* Simulation Compliance Banner */}
      <div className="bg-[#F5A623]/10 border-b border-[#F5A623]/25 px-4 py-1 text-center text-xs font-semibold text-[#F5A623] flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span>SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA (SIH PS ID 26027 PROTOTYPE)</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & System Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#13315C] border border-[#1E3A5F] rounded-lg shadow-lg flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#F5A623]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg tracking-tight">AI-AutoBlock</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#4A90D9]/20 text-[#4A90D9] border border-[#4A90D9]/30">
                  SIH 26027
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">Automatic Block Planning System • Ministry of Railways</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 bg-[#13315C] p-1 rounded-xl border border-[#1E3A5F]">
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
                    ? 'bg-[#1E3A5F] text-[#F5A623] shadow border border-[#F5A623]/30 font-semibold'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E3A5F]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Horizon Toggle & Status Controls */}
          <div className="flex items-center gap-3">
            {/* Horizon Switcher */}
            <div className="flex items-center bg-[#13315C] rounded-lg p-0.5 border border-[#1E3A5F] text-xs">
              <button
                onClick={() => setHorizon('Weekly')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  horizon === 'Weekly' ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Weekly (7D)
              </button>
              <button
                onClick={() => setHorizon('Monthly')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  horizon === 'Monthly' ? 'bg-[#1E3A5F] text-white shadow-sm' : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Monthly (30D)
              </button>
            </div>

            {/* Solver Status Indicator */}
            {solverStatus && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#2E9E6D]/15 border border-[#2E9E6D]/30 text-xs text-[#2E9E6D]">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-semibold">{solverStatus}</span>
                {runtimeMs && <span className="text-[#94A3B8] text-[10px]">({runtimeMs}ms)</span>}
              </div>
            )}

            {/* Re-solve Button */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5A623] hover:bg-[#F5A623]/90 text-[#0B1F3A] text-xs font-bold transition-all shadow-md shadow-[#F5A623]/10 disabled:opacity-50"
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
