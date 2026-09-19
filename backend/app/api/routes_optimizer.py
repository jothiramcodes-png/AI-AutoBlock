# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import time
import pandas as pd
from backend.app.database import load_table_df, save_table_df, get_db_connection
from backend.app.models.schemas import OptimizationPlanResult, DefectTaskSchema
from backend.app.optimizer.cp_sat_scheduler import BlockPlanningCPSATScheduler
from backend.app.optimizer.evaluator import evaluate_baseline_vs_optimized

router = APIRouter(prefix="/api/optimizer", tags=["OR-Tools Optimization & What-If Engine"])

# Global in-memory manual locks state for demonstration session: task_id -> window_id
SESSION_MANUAL_LOCKS: Dict[str, str] = {}

class PlanRequest(BaseModel):
    planning_horizon: str = "Weekly"  # "Weekly" or "Monthly"
    crew_limits: Optional[Dict[str, int]] = None
    manual_locks: Optional[Dict[str, str]] = None

class WhatIfRequest(BaseModel):
    action: str = "INJECT_EMERGENCY_DEFECT"  # "INJECT_EMERGENCY_DEFECT" or "CANCEL_BLOCK_WINDOW"
    emergency_task: Optional[DefectTaskSchema] = None
    cancelled_window_id: Optional[str] = None
    planning_horizon: str = "Weekly"

class ManualOverrideRequest(BaseModel):
    task_id: str
    window_id: Optional[str] = None  # None to unlock, string to lock
    action: str = "LOCK"  # "LOCK" or "UNLOCK"

@router.post("/plan", response_model=OptimizationPlanResult)
def generate_optimized_plan(req: PlanRequest = Body(...)):
    """Triggers Google OR-Tools CP-SAT solver to generate an optimized block plan."""
    sections_df = load_table_df("sections")
    defects_df = load_table_df("defects")
    windows_df = load_table_df("timetable_windows")
    
    # Merge session locks with request locks
    active_locks = dict(SESSION_MANUAL_LOCKS)
    if req.manual_locks:
        active_locks.update(req.manual_locks)
        
    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=10.0)
    run_id = f"RUN-{int(time.time()*1000)}"
    
    result = scheduler.solve(
        sections_df=sections_df,
        defects_df=defects_df,
        windows_df=windows_df,
        crew_limits=req.crew_limits,
        manual_locks=active_locks,
        planning_horizon=req.planning_horizon,
        run_id=run_id
    )
    
    # Record to audit log
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO optimization_audit_log 
        (run_id, timestamp, horizon, dataset_version, solver_status, runtime_ms, objective_value, total_tasks, scheduled_tasks, unscheduled_tasks, locked_tasks, data_label)
        VALUES (?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        run_id,
        req.planning_horizon,
        "v1.0-synthetic",
        result.solver_status,
        result.runtime_ms,
        round(result.total_block_hours_scheduled, 2),
        result.total_tasks_count,
        result.scheduled_count,
        result.unscheduled_count,
        len(active_locks),
        result.data_label
    ))
    conn.commit()
    conn.close()
    
    return result

@router.get("/baseline-comparison")
def get_baseline_comparison(horizon: str = "Weekly"):
    """Runs fair comparative evaluation between baseline decentralized BDMS and CP-SAT optimizer."""
    sections_df = load_table_df("sections")
    defects_df = load_table_df("defects")
    windows_df = load_table_df("timetable_windows")
    
    comparison = evaluate_baseline_vs_optimized(
        sections_df=sections_df,
        defects_df=defects_df,
        windows_df=windows_df,
        manual_locks=SESSION_MANUAL_LOCKS,
        planning_horizon=horizon
    )
    return comparison

@router.post("/what-if")
def simulate_what_if(req: WhatIfRequest):
    """
    Simulates real operational contingencies (emergency rail fracture / cancelled window)
    by running a genuine CP-SAT re-optimization and returning exact schedule diffs.
    """
    sections_df = load_table_df("sections")
    defects_df = load_table_df("defects")
    windows_df = load_table_df("timetable_windows")
    
    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=8.0)
    
    # 1. Base Plan before perturbation
    old_plan = scheduler.solve(
        sections_df=sections_df,
        defects_df=defects_df,
        windows_df=windows_df,
        manual_locks=SESSION_MANUAL_LOCKS,
        planning_horizon=req.planning_horizon,
        run_id="RUN-BASE"
    )
    old_schedule_map = {t.task_id: t.window_id for t in old_plan.scheduled_tasks}
    
    # 2. Apply perturbation
    new_defects_df = defects_df.copy()
    new_windows_df = windows_df.copy()
    injected_task_id = None
    
    if req.action == "INJECT_EMERGENCY_DEFECT":
        if req.emergency_task is None:
            # Default emergency: IMR Rail Fracture on NDLS-GZB (SEC-001)
            injected_task_id = f"TSK-EMERGENCY-{int(time.time())}"
            emergency_row = {
                "task_id": injected_task_id,
                "section_id": "SEC-001",
                "department": "Engineering",
                "defect_type": "EMERGENCY: Immediate Removal (IMR) Rail Fracture",
                "severity": "Critical",
                "reported_date": "2026-09-16",
                "due_date": "2026-09-16",
                "days_overdue": 5,
                "estimated_duration_hours": 3.0,
                "required_crews": 2,
                "required_machinery": "AFTD / Rail Welder",
                "safety_risk_flag": True,
                "punctuality_impact_score": 99.0,
                "is_emergency": True,
                "notes": "Simulated emergency rail fracture injection via What-If"
            }
        else:
            injected_task_id = req.emergency_task.task_id
            emergency_row = req.emergency_task.model_dump()
            
        new_defects_df = pd.concat([new_defects_df, pd.DataFrame([emergency_row])], ignore_index=True)
        
    elif req.action == "CANCEL_BLOCK_WINDOW" and req.cancelled_window_id:
        new_windows_df = new_windows_df[new_windows_df["window_id"] != req.cancelled_window_id]

    # 3. Solve Perturbed Problem
    reopt_start = time.perf_counter()
    new_plan = scheduler.solve(
        sections_df=sections_df,
        defects_df=new_defects_df,
        windows_df=new_windows_df,
        manual_locks=SESSION_MANUAL_LOCKS,
        planning_horizon=req.planning_horizon,
        run_id="RUN-WHATIF"
    )
    reopt_runtime_ms = round((time.perf_counter() - reopt_start) * 1000.0, 2)
    new_schedule_map = {t.task_id: t.window_id for t in new_plan.scheduled_tasks}
    
    # 4. Compute exact schedule diffs
    diffs = []
    # Newly scheduled
    for t in new_plan.scheduled_tasks:
        tid = t.task_id
        if tid not in old_schedule_map:
            diffs.append({
                "task_id": tid,
                "defect_type": t.defect_type,
                "department": t.department,
                "change_type": "NEWLY_SCHEDULED",
                "old_window": None,
                "new_window": t.window_id,
                "reason": "Emergency defect prioritized with high safety weight"
            })
        elif old_schedule_map[tid] != t.window_id:
            diffs.append({
                "task_id": tid,
                "defect_type": t.defect_type,
                "department": t.department,
                "change_type": "WINDOW_SHIFTED",
                "old_window": old_schedule_map[tid],
                "new_window": t.window_id,
                "reason": "Displaced by higher priority task or schedule re-balancing"
            })
            
    # Dropped / displaced tasks
    for tid, old_win in old_schedule_map.items():
        if tid not in new_schedule_map:
            old_t = next(t for t in old_plan.scheduled_tasks if t.task_id == tid)
            diffs.append({
                "task_id": tid,
                "defect_type": old_t.defect_type,
                "department": old_t.department,
                "change_type": "BUMPED_TO_UNSCHEDULED",
                "old_window": old_win,
                "new_window": None,
                "reason": "Corridor window capacity preempted by emergency priority task"
            })
            
    return {
        "what_if_action": req.action,
        "measured_reoptimization_runtime_ms": reopt_runtime_ms,
        "injected_task_id": injected_task_id,
        "changes_count": len(diffs),
        "schedule_diffs": diffs,
        "old_plan_summary": {
            "scheduled": old_plan.scheduled_count,
            "unscheduled": old_plan.unscheduled_count,
            "block_hours": old_plan.total_block_hours_scheduled
        },
        "new_plan": new_plan
    }

@router.post("/override")
def apply_manual_override(req: ManualOverrideRequest):
    """Locks or unlocks a task to a specific block window."""
    defects_df = load_table_df("defects")
    windows_df = load_table_df("timetable_windows")
    
    if req.task_id not in defects_df["task_id"].values:
        raise HTTPException(status_code=404, detail=f"Task {req.task_id} not found")
        
    if req.action == "LOCK":
        if not req.window_id or req.window_id not in windows_df["window_id"].values:
            raise HTTPException(status_code=400, detail=f"Invalid window ID {req.window_id}")
        SESSION_MANUAL_LOCKS[req.task_id] = req.window_id
        msg = f"Task {req.task_id} locked to window {req.window_id}"
    elif req.action == "UNLOCK":
        SESSION_MANUAL_LOCKS.pop(req.task_id, None)
        msg = f"Task {req.task_id} unlocked"
    else:
        raise HTTPException(status_code=400, detail="Action must be LOCK or UNLOCK")
        
    return {
        "status": "success",
        "message": msg,
        "active_manual_locks": SESSION_MANUAL_LOCKS
    }

@router.get("/audit-trail")
def get_audit_trail():
    """Returns past optimization and re-optimization execution logs."""
    conn = get_db_connection()
    df = pd.read_sql_query("SELECT * FROM optimization_audit_log ORDER BY timestamp DESC LIMIT 50", conn)
    conn.close()
    return df.to_dict(orient="records")
