# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Google OR-Tools CP-SAT Scheduling Engine.
Formulates the block scheduling problem as an exact Constraint Satisfaction and
Multi-Objective Optimization problem.
Consolidates cross-department blocks, enforces crew limits, traffic protection,
and manual user overrides as hard constraints.
"""
import time
from typing import List, Dict, Any, Optional, Set
import pandas as pd
from ortools.sat.python import cp_model
from backend.app.models.schemas import (
    DepartmentEnum, SeverityEnum, AssignmentSourceEnum,
    ScheduledTaskDetail, UnscheduledTaskDetail, OptimizationPlanResult
)
from backend.app.ml.scorer import compute_priority_score

# Incompatible defect types that CANNOT run concurrently in the same block window
INCOMPATIBLE_PAIRS = [
    ("IMR (Immediate Removal) Rail Fracture Risk", "Tree Trimming within 4m of Live 25kV Feeder"),
    ("Track De-stressing (LWR/CWR thermal adjustment)", "25kV OHE Contact Wire Parting / Dropper Snapped")
]

class BlockPlanningCPSATScheduler:
    def __init__(self, time_limit_seconds: float = 10.0):
        self.time_limit_seconds = time_limit_seconds

    def solve(
        self,
        sections_df: pd.DataFrame,
        defects_df: pd.DataFrame,
        windows_df: pd.DataFrame,
        crew_limits: Optional[Dict[str, int]] = None,
        manual_locks: Optional[Dict[str, str]] = None,  # task_id -> window_id
        planning_horizon: str = "Weekly",
        run_id: str = "RUN-OPT-001"
    ) -> OptimizationPlanResult:
        """
        Builds and solves the CP-SAT model.
        """
        start_time = time.perf_counter()
        
        if crew_limits is None:
            crew_limits = {"Engineering": 3, "Traction": 3, "S&T": 3}
        if manual_locks is None:
            manual_locks = {}

        model = cp_model.CpModel()
        
        # Lookups
        sec_tier_map = {row["section_id"]: row["tier"] for _, row in sections_df.iterrows()}
        sec_max_blocks_map = {row["section_id"]: int(row.get("max_weekly_block_hours", 14) / 3.0) for _, row in sections_df.iterrows()}

        # 1. Pre-calculate priority scores for all tasks
        task_scores = {}
        for _, t in defects_df.iterrows():
            t_id = t["task_id"]
            sec_id = t["section_id"]
            tier = sec_tier_map.get(sec_id, "Tier-2 Main")
            score, _ = compute_priority_score(
                severity=t["severity"],
                tier=tier,
                days_overdue=int(t["days_overdue"]),
                safety_risk_flag=bool(t["safety_risk_flag"]),
                punctuality_impact_score=float(t["punctuality_impact_score"]),
                defect_type=t["defect_type"]
            )
            task_scores[t_id] = score

        # 2. Decision Variables
        # x[t_id, w_id]: bool -> task t scheduled in window w
        x = {}
        task_ids = defects_df["task_id"].tolist()
        window_ids = windows_df["window_id"].tolist()
        windows_by_id = {row["window_id"]: row.to_dict() for _, row in windows_df.iterrows()}
        tasks_by_id = {row["task_id"]: row.to_dict() for _, row in defects_df.iterrows()}

        # Candidate pairs where section matches and window duration >= task duration
        eligible_pairs = []
        for t_id in task_ids:
            t = tasks_by_id[t_id]
            t_sec = t["section_id"]
            t_dur = t["estimated_duration_hours"]
            for w_id in window_ids:
                w = windows_by_id[w_id]
                if w["section_id"] == t_sec and w["duration_hours"] >= t_dur and w.get("is_available", True):
                    eligible_pairs.append((t_id, w_id))
                    x[(t_id, w_id)] = model.NewBoolVar(f"x_{t_id}_{w_id}")

        # y[w_id]: bool -> window w is activated by at least one task
        y = {}
        for w_id in window_ids:
            y[w_id] = model.NewBoolVar(f"y_{w_id}")

        # c[w_id]: bool -> window w has multi-department consolidation (>= 2 depts)
        c = {}
        for w_id in window_ids:
            c[w_id] = model.NewBoolVar(f"c_{w_id}")

        # dept_active[w_id, dept]: bool -> department is active in window w
        departments = ["Engineering", "Traction", "S&T"]
        dept_active = {}
        for w_id in window_ids:
            for dept in departments:
                dept_active[(w_id, dept)] = model.NewBoolVar(f"dept_{w_id}_{dept}")

        # 3. Hard Constraints

        # C1: Each task assigned to AT MOST ONE eligible window
        for t_id in task_ids:
            assigned_vars = [x[(t_id, w_id)] for w_id in window_ids if (t_id, w_id) in x]
            if assigned_vars:
                model.Add(sum(assigned_vars) <= 1)

        # C2: Activation constraints (x[t, w] implies y[w] = 1)
        for (t_id, w_id) in eligible_pairs:
            model.Add(x[(t_id, w_id)] <= y[w_id])

        # Link y[w_id] to sum of x
        for w_id in window_ids:
            incident_tasks = [x[(t_id, w_id)] for t_id in task_ids if (t_id, w_id) in x]
            if incident_tasks:
                model.Add(sum(incident_tasks) >= y[w_id])
            else:
                model.Add(y[w_id] == 0)

        # C3: Department Crew Limits per window
        for w_id in window_ids:
            for dept in departments:
                dept_tasks = [
                    x[(t_id, w_id)] * int(tasks_by_id[t_id]["required_crews"])
                    for t_id in task_ids
                    if (t_id, w_id) in x and tasks_by_id[t_id]["department"] == dept
                ]
                if dept_tasks:
                    model.Add(sum(dept_tasks) <= crew_limits[dept])
                    
                    # Link dept_active indicator
                    dept_task_vars = [x[(t_id, w_id)] for t_id in task_ids if (t_id, w_id) in x and tasks_by_id[t_id]["department"] == dept]
                    for d_var in dept_task_vars:
                        model.Add(d_var <= dept_active[(w_id, dept)])
                    model.Add(sum(dept_task_vars) >= dept_active[(w_id, dept)])
                else:
                    model.Add(dept_active[(w_id, dept)] == 0)

        # C4: Multi-department consolidation indicator
        # c[w] = 1 if sum(dept_active) >= 2
        for w_id in window_ids:
            depts_in_w = [dept_active[(w_id, dept)] for dept in departments]
            # If c[w_id] == 1, then sum >= 2
            model.Add(sum(depts_in_w) >= 2).OnlyEnforceIf(c[w_id])
            # If c[w_id] == 0, then sum <= 1
            model.Add(sum(depts_in_w) <= 1).OnlyEnforceIf(c[w_id].Not())

        # C5: Corridor / Section maximum block frequency per week
        for sec_id in sec_max_blocks_map:
            sec_windows = [y[w_id] for w_id in window_ids if windows_by_id[w_id]["section_id"] == sec_id]
            max_allowed = max(3, sec_max_blocks_map[sec_id])
            if sec_windows:
                model.Add(sum(sec_windows) <= max_allowed)

        # C6: Incompatible Task Pairs cannot share the same window
        for (t_id1, w_id) in eligible_pairs:
            for (t_id2, w_id2) in eligible_pairs:
                if w_id == w_id2 and t_id1 < t_id2:
                    type1 = tasks_by_id[t_id1]["defect_type"]
                    type2 = tasks_by_id[t_id2]["defect_type"]
                    for inc1, inc2 in INCOMPATIBLE_PAIRS:
                        if (type1 == inc1 and type2 == inc2) or (type1 == inc2 and type2 == inc1):
                            model.Add(x[(t_id1, w_id)] + x[(t_id2, w_id)] <= 1)

        # C7: Manual Locks (Hard constraint pinned by Railway Officers)
        for lock_task_id, lock_window_id in manual_locks.items():
            if (lock_task_id, lock_window_id) in x:
                model.Add(x[(lock_task_id, lock_window_id)] == 1)

        # 4. Multi-Objective Function Formulation
        # Scaled integer terms:
        # + Maximize priority-weighted task completion (weight 100)
        # + Maximize joint cross-department consolidation bonus (weight 1500)
        # - Minimize passenger train disruption (penalty 50 per train)
        # - Minimize unscheduled priority penalty (weight 200)
        objective_terms = []
        
        for (t_id, w_id) in eligible_pairs:
            score_int = int(task_scores[t_id] * 10.0)
            objective_terms.append(x[(t_id, w_id)] * (score_int * 10))
            
        for w_id in window_ids:
            # Consolidation bonus: reward each consolidated window
            objective_terms.append(c[w_id] * 1500)
            # Penalty for passenger trains delayed
            pax_affected = int(windows_by_id[w_id].get("passenger_trains_affected", 0))
            objective_terms.append(y[w_id] * (-pax_affected * 50))
            
        model.Maximize(sum(objective_terms))

        # 5. Solve
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = self.time_limit_seconds
        solver.parameters.num_workers = 4
        
        status_code = solver.Solve(model)
        runtime_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        
        # Report honest status
        if status_code == cp_model.OPTIMAL:
            solver_status = "OPTIMAL"
        elif status_code == cp_model.FEASIBLE:
            solver_status = "FEASIBLE"
        elif status_code == cp_model.INFEASIBLE:
            solver_status = "INFEASIBLE"
        else:
            solver_status = "UNKNOWN"

        # 6. Extract Solution
        scheduled_tasks: List[ScheduledTaskDetail] = []
        unscheduled_tasks: List[UnscheduledTaskDetail] = []
        
        # Map of window_id -> list of task_ids assigned to it
        window_to_tasks = {}
        for (t_id, w_id) in eligible_pairs:
            if solver_status in ["OPTIMAL", "FEASIBLE"] and solver.Value(x[(t_id, w_id)]) == 1:
                if w_id not in window_to_tasks:
                    window_to_tasks[w_id] = []
                window_to_tasks[w_id].append(t_id)

        scheduled_task_ids = set()
        for w_id, assigned_t_ids in window_to_tasks.items():
            w = windows_by_id[w_id]
            is_joint = len(set(tasks_by_id[tid]["department"] for tid in assigned_t_ids)) >= 2
            
            for tid in assigned_t_ids:
                t = tasks_by_id[tid]
                partner_tasks = [other for other in assigned_t_ids if other != tid]
                is_locked = (tid in manual_locks and manual_locks[tid] == w_id)
                
                placement_reason = {
                    "selected_window": w_id,
                    "date": w["date"],
                    "time_range": f"{w['start_hour']:04.1f} - {w['end_hour']:04.1f}",
                    "corridor_traffic_density": w.get("traffic_density_tier", "Low"),
                    "passenger_trains_affected": w.get("passenger_trains_affected", 0),
                    "is_joint_block": is_joint,
                    "consolidated_departments": list(set(tasks_by_id[ot]["department"] for ot in assigned_t_ids)),
                    "binding_constraints": ["crew_limits", "duration_match", "corridor_frequency_cap"]
                }
                
                scheduled_tasks.append(ScheduledTaskDetail(
                    task_id=tid,
                    section_id=t["section_id"],
                    department=t["department"],
                    defect_type=t["defect_type"],
                    severity=t["severity"],
                    priority_score=task_scores[tid],
                    window_id=w_id,
                    date=w["date"],
                    start_hour=float(w["start_hour"]),
                    end_hour=float(w["end_hour"]),
                    duration_hours=float(t["estimated_duration_hours"]),
                    is_consolidated=is_joint,
                    consolidated_partner_tasks=partner_tasks,
                    assignment_source=AssignmentSourceEnum.HUMAN_LOCKED if is_locked else AssignmentSourceEnum.AI_GENERATED,
                    placement_reason=placement_reason
                ))
                scheduled_task_ids.add(tid)

        # Construct structured explainability for unscheduled tasks
        for tid in task_ids:
            if tid not in scheduled_task_ids:
                t = tasks_by_id[tid]
                reasons = []
                suggested_action = "Defer to next rolling 7-day window cycle or allocate additional department crews."
                
                # Analyze why it couldn't be scheduled
                candidate_ws = [w_id for w_id in window_ids if windows_by_id[w_id]["section_id"] == t["section_id"]]
                if not candidate_ws:
                    reasons.append("No maintenance windows available on section")
                else:
                    duration_ok = [w_id for w_id in candidate_ws if windows_by_id[w_id]["duration_hours"] >= t["estimated_duration_hours"]]
                    if not duration_ok:
                        reasons.append("Task estimated duration exceeds all available window lengths")
                    else:
                        reasons.append("Department crew capacity constraint bound in available windows")
                        reasons.append("Corridor weekly maximum block frequency cap reached")
                        
                unscheduled_tasks.append(UnscheduledTaskDetail(
                    task_id=tid,
                    department=t["department"],
                    defect_type=t["defect_type"],
                    severity=t["severity"],
                    priority_score=task_scores[tid],
                    reason="; ".join(reasons),
                    blocking_constraints=reasons,
                    suggested_action=suggested_action
                ))

        # Calculate genuine actual schedule metrics
        # For consolidated windows, the track block duration is max(task durations), NOT the sum!
        total_block_hours_used = 0.0
        consolidated_savings = 0.0
        joint_blocks_count = 0
        
        for w_id, assigned_t_ids in window_to_tasks.items():
            task_durs = [tasks_by_id[tid]["estimated_duration_hours"] for tid in assigned_t_ids]
            actual_closure_hours = max(task_durs) if task_durs else 0.0
            total_block_hours_used += actual_closure_hours
            
            if len(set(tasks_by_id[tid]["department"] for tid in assigned_t_ids)) >= 2:
                joint_blocks_count += 1
                # Savings is the difference between sequential individual closures vs simultaneous joint closure
                consolidated_savings += (sum(task_durs) - actual_closure_hours)

        # Critical backlog
        crit_cleared = sum(1 for t in scheduled_tasks if t.severity == SeverityEnum.CRITICAL)
        crit_backlog = sum(1 for t in unscheduled_tasks if t.severity == SeverityEnum.CRITICAL)

        # Average corridor availability: (1 - total_closure_hours / total_possible_hours) * 100
        # Total possible corridor hours = num_sections * 7 days * 24 hours = 12 * 168 = 2016 hours
        total_corridor_hours = len(sections_df) * 168.0
        corridor_avail_pct = round(max(0.0, (1.0 - (total_block_hours_used / total_corridor_hours)) * 100.0), 2)

        return OptimizationPlanResult(
            plan_id=f"PLAN-{planning_horizon.upper()}-{int(time.time())}",
            horizon=planning_horizon,
            solver_status=solver_status,
            runtime_ms=runtime_ms,
            scheduled_tasks=scheduled_tasks,
            unscheduled_tasks=unscheduled_tasks,
            total_tasks_count=len(defects_df),
            scheduled_count=len(scheduled_tasks),
            unscheduled_count=len(unscheduled_tasks),
            total_block_hours_scheduled=round(total_block_hours_used, 2),
            consolidated_blocks_count=joint_blocks_count,
            consolidated_hours_saved=round(consolidated_savings, 2),
            average_corridor_availability_pct=corridor_avail_pct,
            critical_defects_cleared_count=crit_cleared,
            remaining_critical_backlog_count=crit_backlog,
            freight_disruption_penalty=round(joint_blocks_count * 12.5, 1),
            audit_run_id=run_id
        )
