// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import type { Section, DefectTask, ComparisonResult, OptimizationPlanResult, WhatIfResponse } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSections(): Promise<Section[]> {
  const res = await fetch(`${API_BASE}/network/sections`);
  if (!res.ok) throw new Error('Failed to fetch sections');
  return res.json();
}

export async function fetchDefects(dept?: string, severity?: string): Promise<DefectTask[]> {
  const params = new URLSearchParams();
  if (dept && dept !== 'ALL') params.append('department', dept);
  if (severity && severity !== 'ALL') params.append('severity', severity);
  
  const res = await fetch(`${API_BASE}/defects?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch defects');
  return res.json();
}

export async function fetchBaselineComparison(horizon: string = 'Weekly'): Promise<ComparisonResult> {
  const res = await fetch(`${API_BASE}/optimizer/baseline-comparison?horizon=${horizon}`);
  if (!res.ok) throw new Error('Failed to fetch baseline comparison');
  return res.json();
}

export async function runOptimizerPlan(horizon: string = 'Weekly'): Promise<OptimizationPlanResult> {
  const res = await fetch(`${API_BASE}/optimizer/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planning_horizon: horizon })
  });
  if (!res.ok) throw new Error('Failed to run optimizer plan');
  return res.json();
}

export async function simulateWhatIf(action: string = 'INJECT_EMERGENCY_DEFECT'): Promise<WhatIfResponse> {
  const res = await fetch(`${API_BASE}/optimizer/what-if`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, planning_horizon: 'Weekly' })
  });
  if (!res.ok) throw new Error('Failed to run What-If simulation');
  return res.json();
}

export async function applyOverride(taskId: string, windowId: string | null, action: 'LOCK' | 'UNLOCK') {
  const res = await fetch(`${API_BASE}/optimizer/override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId, window_id: windowId, action })
  });
  if (!res.ok) throw new Error('Failed to apply override');
  return res.json();
}

export async function fetchAuditTrail() {
  const res = await fetch(`${API_BASE}/optimizer/audit-trail`);
  if (!res.ok) throw new Error('Failed to fetch audit trail');
  return res.json();
}
