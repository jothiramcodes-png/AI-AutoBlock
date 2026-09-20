// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import React, { useState } from 'react';
import { Activity, ShieldAlert, Cpu, RefreshCw, Menu, X } from 'lucide-react';

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

const TABS = [
  { id: 'dashboard', label: 'Executive KPIs' },
  { id: 'gantt', label: 'Corridor Gantt' },
  { id: 'conflicts', label: 'Conflict View' },
  { id: 'defects', label: 'Task Backlog' },
  { id: 'whatif', label: 'What-If Simulation' },
  { id: 'audit', label: 'Audit Trail' },
] as const;

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-40">
      {/* Simulation Compliance Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 text-center text-[10px] sm:text-xs font-semibold text-amber-400 flex items-center justify-center gap-1.5 leading-tight">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        <span className="break-words">SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA (SIH PS ID 26027 PROTOTYPE)</span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand & System Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center shrink-0">
              <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white text-base sm:text-lg tracking-tight truncate">AI-AutoBlock</span>
                <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                  SIH 26027
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden xs:block">Automatic Block Planning System • Ministry of Railways</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

          {/* Controls: Horizon Toggle & Re-Solve */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Horizon Switcher (visible on tablet+) */}
            <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
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

            {/* Solver Status Indicator (desktop only) */}
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
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-medium transition-all disabled:opacity-50 shrink-0"
              title="Re-Run CP-SAT"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Solving...' : 'Re-Run CP-SAT'}</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scrollable Tab Strip (< xl) */}
      <div className="xl:hidden border-t border-slate-800/80 bg-slate-900/90 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white bg-slate-800/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expandable Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 space-y-4 shadow-xl">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Navigation Views</p>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
              </button>
            ))}
          </div>

          {/* Mobile Horizon Switcher */}
          <div className="pt-3 border-t border-slate-800 sm:hidden">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Planning Horizon</p>
            <div className="grid grid-cols-2 gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                onClick={() => {
                  setHorizon('Weekly');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-center rounded-md font-medium transition-all ${
                  horizon === 'Weekly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Weekly (7D)
              </button>
              <button
                onClick={() => {
                  setHorizon('Monthly');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 text-center rounded-md font-medium transition-all ${
                  horizon === 'Monthly' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly (30D)
              </button>
            </div>
          </div>

          {/* Solver Status on Mobile */}
          {solverStatus && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Solver Status:</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                <span className="font-semibold">{solverStatus}</span>
                {runtimeMs && <span className="text-slate-400 text-[10px]">({runtimeMs}ms)</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
