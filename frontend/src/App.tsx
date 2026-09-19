// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { KPISummaryCards } from './components/KPISummaryCards';
import { GanttTimeline } from './components/GanttTimeline';
import { ConflictResolutionView } from './components/ConflictResolutionView';
import { TaskTable } from './components/TaskTable';
import { ExplainabilityDrawer } from './components/ExplainabilityDrawer';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AuditTrailView } from './components/AuditTrailView';
import { fetchSections, fetchDefects, fetchBaselineComparison, applyOverride } from './services/api';
import type { Section, DefectTask, ScheduledTaskDetail, ComparisonResult } from './types';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gantt' | 'conflicts' | 'defects' | 'whatif' | 'audit'>('dashboard');
  const [horizon, setHorizon] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data
  const [sections, setSections] = useState<Section[]>([]);
  const [defects, setDefects] = useState<DefectTask[]>([]);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  // Drawer / Selection state
  const [selectedTask, setSelectedTask] = useState<DefectTask | ScheduledTaskDetail | null>(null);
  const [lockedTaskIds, setLockedTaskIds] = useState<Set<string>>(new Set());

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [secData, defData, compData] = await Promise.all([
        fetchSections(),
        fetchDefects(),
        fetchBaselineComparison(horizon)
      ]);
      setSections(secData);
      setDefects(defData);
      setComparison(compData);

      // Track locked tasks from scheduled plan
      const locked = new Set<string>();
      compData.optimized_plan.scheduled_tasks.forEach((t) => {
        if (t.assignment_source === 'HUMAN_LOCKED') {
          locked.add(t.task_id);
        }
      });
      setLockedTaskIds(locked);
    } catch (err: any) {
      console.error('Data loading error:', err);
      setError(err.message || 'Failed to connect to automatic block planning backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [horizon]);

  // Handle Manual Lock / Unlock toggle
  const handleToggleLock = async (task: DefectTask | ScheduledTaskDetail) => {
    const taskId = task.task_id;
    const isCurrentlyLocked = lockedTaskIds.has(taskId);

    try {
      if (isCurrentlyLocked) {
        await applyOverride(taskId, null, 'UNLOCK');
        setLockedTaskIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      } else {
        // If task is scheduled, lock to its current window; else lock to first available window
        const windowId = 'window_id' in task ? task.window_id : 'WIN-SEC-001-1-001';
        await applyOverride(taskId, windowId, 'LOCK');
        setLockedTaskIds((prev) => new Set(prev).add(taskId));
      }
      // Reload schedule with new lock constraint enforced
      await loadAllData();
    } catch (err: any) {
      console.error('Override failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-sans">
      {/* Header & Simulation Notice */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        horizon={horizon}
        setHorizon={setHorizon}
        onRefresh={loadAllData}
        loading={loading}
        solverStatus={comparison?.evaluation_summary?.solver_status}
        runtimeMs={comparison?.evaluation_summary?.measured_optimizer_runtime_ms}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Notification */}
        {error && (
          <div className="bg-[#D64545]/10 border border-[#D64545]/30 rounded-xl p-4 flex items-center gap-3 text-[#D64545] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div className="flex-1">
              <span className="font-bold">Backend Connection Notice: </span>
              {error}. Ensure the FastAPI server is running on http://localhost:8000.
            </div>
            <button
              onClick={loadAllData}
              className="px-3 py-1 rounded bg-[#D64545]/30 hover:bg-[#D64545]/40 text-xs font-semibold text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Global KPIs Top Bar */}
        <KPISummaryCards
          kpis={comparison?.kpis}
          solverRuntimeMs={comparison?.evaluation_summary?.measured_optimizer_runtime_ms}
          solverStatus={comparison?.evaluation_summary?.solver_status}
        />

        {/* Dynamic Tab Views */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <GanttTimeline
              sections={sections}
              scheduledTasks={comparison?.optimized_plan?.scheduled_tasks || []}
              onSelectTask={setSelectedTask}
              onLockTask={handleToggleLock}
              selectedTaskId={selectedTask?.task_id}
            />

            <ConflictResolutionView
              scheduledTasks={comparison?.optimized_plan?.scheduled_tasks || []}
            />
          </div>
        )}

        {activeTab === 'gantt' && (
          <GanttTimeline
            sections={sections}
            scheduledTasks={comparison?.optimized_plan?.scheduled_tasks || []}
            onSelectTask={setSelectedTask}
            onLockTask={handleToggleLock}
            selectedTaskId={selectedTask?.task_id}
          />
        )}

        {activeTab === 'conflicts' && (
          <ConflictResolutionView
            scheduledTasks={comparison?.optimized_plan?.scheduled_tasks || []}
          />
        )}

        {activeTab === 'defects' && (
          <TaskTable
            tasks={defects}
            onSelectTask={setSelectedTask}
            onToggleLock={handleToggleLock}
            lockedTaskIds={lockedTaskIds}
            selectedTaskId={selectedTask?.task_id}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator onReoptimized={loadAllData} />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView />
        )}
      </main>

      {/* Explainability Drawer */}
      {selectedTask && (
        <ExplainabilityDrawer
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggleLock={handleToggleLock}
          isLocked={lockedTaskIds.has(selectedTask.task_id)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-[#1E3A5F] bg-[#0B1F3A] py-4 px-6 text-center text-xs text-[#94A3B8]">
        <p>
          AI-Powered Automatic Block Planning System • SIH PS ID 26027 (Ministry of Railways)
        </p>
        <p className="text-[#94A3B8]/80 mt-0.5">
          SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA. Google OR-Tools CP-SAT Scheduling Core.
        </p>
      </footer>
    </div>
  );
}

export default App;
