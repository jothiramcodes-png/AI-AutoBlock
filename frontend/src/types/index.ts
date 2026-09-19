// SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA

export type Department = 'Engineering' | 'Traction' | 'S&T';
export type Severity = 'Critical' | 'Major' | 'Minor';
export type TrackTier = 'Tier-1 Trunk' | 'Tier-2 Main' | 'Tier-3 Branch';

export interface Section {
  section_id: string;
  name: string;
  division: string;
  zone: string;
  tier: TrackTier;
  speed_limit_kmh: number;
  daily_gmt: number;
  length_km: number;
  num_tracks: number;
  max_weekly_block_hours: number;
  description: string;
}

export interface ScoreFactorBreakdown {
  safety_risk_component: number;
  defect_severity_component: number;
  asset_criticality_component: number;
  overdue_days_component: number;
  train_impact_component: number;
  failure_history_component: number;
  total_priority_score: number;
}

export interface DefectTask {
  task_id: string;
  section_id: string;
  department: Department;
  defect_type: string;
  severity: Severity;
  reported_date: string;
  due_date: string;
  days_overdue: number;
  estimated_duration_hours: number;
  required_crews: number;
  required_machinery?: string;
  safety_risk_flag: boolean;
  punctuality_impact_score: number;
  is_emergency: boolean;
  notes?: string;
  priority_score: number;
  score_breakdown: ScoreFactorBreakdown;
}

export interface PlacementReason {
  selected_window: string;
  date: string;
  time_range: string;
  corridor_traffic_density: string;
  passenger_trains_affected: number;
  is_joint_block: boolean;
  consolidated_departments: string[];
  binding_constraints: string[];
}

export interface ScheduledTaskDetail {
  task_id: string;
  section_id: string;
  department: Department;
  defect_type: string;
  severity: Severity;
  priority_score: number;
  window_id: string;
  date: string;
  start_hour: number;
  end_hour: number;
  duration_hours: number;
  is_consolidated: boolean;
  consolidated_partner_tasks: string[];
  assignment_source: 'AI_GENERATED' | 'HUMAN_LOCKED' | 'HUMAN_MODIFIED';
  placement_reason: PlacementReason;
}

export interface UnscheduledTaskDetail {
  task_id: string;
  department: Department;
  defect_type: string;
  severity: Severity;
  priority_score: number;
  reason: string;
  blocking_constraints: string[];
  suggested_action: string;
}

export interface OptimizationPlanResult {
  plan_id: string;
  horizon: string;
  solver_status: 'OPTIMAL' | 'FEASIBLE' | 'INFEASIBLE' | 'UNKNOWN';
  runtime_ms: number;
  scheduled_tasks: ScheduledTaskDetail[];
  unscheduled_tasks: UnscheduledTaskDetail[];
  total_tasks_count: number;
  scheduled_count: number;
  unscheduled_count: number;
  total_block_hours_scheduled: number;
  consolidated_blocks_count: number;
  consolidated_hours_saved: number;
  average_corridor_availability_pct: number;
  critical_defects_cleared_count: number;
  remaining_critical_backlog_count: number;
  freight_disruption_penalty: number;
  audit_run_id: string;
  data_label: string;
}

export interface ComparisonKPIs {
  baseline_total_block_hours: number;
  optimized_total_block_hours: number;
  block_hours_saved: number;
  downtime_reduction_pct: number;
  baseline_scheduled_tasks: number;
  optimized_scheduled_tasks: number;
  tasks_scheduled_delta: number;
  baseline_consolidated_blocks: number;
  optimized_consolidated_blocks: number;
  consolidation_rate_pct: number;
  total_critical_defects: number;
  baseline_critical_cleared: number;
  optimized_critical_cleared: number;
  remaining_critical_backlog: number;
  critical_clearance_delta: number;
  corridor_availability_pct: number;
  freight_disruption_penalty: number;
}

export interface BaselineSchedule {
  planning_mode: string;
  total_tasks: number;
  scheduled_tasks_count: number;
  unscheduled_tasks_count: number;
  total_block_hours: number;
  scheduled_tasks: Array<{
    task_id: string;
    section_id: string;
    department: Department;
    defect_type: string;
    severity: Severity;
    window_id: string;
    date: string;
    start_hour: number;
    end_hour: number;
    duration_hours: number;
  }>;
}

export interface ComparisonResult {
  evaluation_summary: {
    planning_horizon: string;
    data_label: string;
    total_tasks_considered: number;
    solver_status: string;
    measured_optimizer_runtime_ms: number;
  };
  kpis: ComparisonKPIs;
  baseline_schedule: BaselineSchedule;
  optimized_plan: OptimizationPlanResult;
}

export interface ScheduleDiff {
  task_id: string;
  defect_type: string;
  department: Department;
  change_type: 'NEWLY_SCHEDULED' | 'WINDOW_SHIFTED' | 'BUMPED_TO_UNSCHEDULED';
  old_window: string | null;
  new_window: string | null;
  reason: string;
}

export interface WhatIfResponse {
  what_if_action: string;
  measured_reoptimization_runtime_ms: number;
  injected_task_id: string;
  changes_count: number;
  schedule_diffs: ScheduleDiff[];
  new_plan: OptimizationPlanResult;
}
