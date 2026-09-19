# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Baseline Scheduler (Decentralized Departmental Planning).
Simulates current real-world BDMS practice:
- Engineering, Traction, and S&T schedule maintenance independently.
- No cross-department consolidation (each department takes its own isolated block).
- Evaluates on the exact same input dataset as the CP-SAT optimizer for fair comparison.
- Produces realistic baseline block-hours and downtime metrics.
"""
from typing import List, Dict, Any
import pandas as pd
from backend.app.models.schemas import DepartmentEnum

def run_baseline_schedule(
    defects_df: pd.DataFrame,
    windows_df: pd.DataFrame,
    crew_limits: Dict[str, int] = None
) -> Dict[str, Any]:
    """
    Simulates decentralized departmental planning.
    Each department iterates through its tasks and takes the earliest available window
    matching section and duration without joint coordination.
    """
    if crew_limits is None:
        crew_limits = {
            "Engineering": 3,
            "Traction": 3,
            "S&T": 3
        }

    # Department-wise task queues sorted by reported date / due date (standard operational practice)
    departments = ["Engineering", "Traction", "S&T"]
    scheduled_tasks = []
    unscheduled_tasks = []
    
    # Track occupied windows per section: window_id -> list of assigned tasks
    # In baseline, each task gets exclusive occupancy of a window (no joint blocks)
    window_occupancy = {}
    
    # Track concurrent crew utilization per window: (window_id, department) -> crews used
    crew_usage = {}
    
    # Available windows indexed by section_id
    windows_by_section = {}
    for _, win in windows_df.iterrows():
        sec_id = win["section_id"]
        if sec_id not in windows_by_section:
            windows_by_section[sec_id] = []
        windows_by_section[sec_id].append(win.to_dict())

    # Sort windows chronologically by date and start_hour
    for sec_id in windows_by_section:
        windows_by_section[sec_id].sort(key=lambda w: (w["date"], w["start_hour"]))

    # Each department schedules in isolation
    for dept in departments:
        dept_tasks = defects_df[defects_df["department"] == dept].sort_values(by=["due_date", "days_overdue"], ascending=[True, False])
        
        for _, task in dept_tasks.iterrows():
            sec_id = task["section_id"]
            task_duration = task["estimated_duration_hours"]
            task_crews = task["required_crews"]
            task_id = task["task_id"]
            
            candidate_windows = windows_by_section.get(sec_id, [])
            assigned = False
            
            for win in candidate_windows:
                win_id = win["window_id"]
                win_duration = win["duration_hours"]
                
                # Check 1: Window long enough for this task
                if win_duration < task_duration:
                    continue
                    
                # Check 2: In baseline, windows are NOT shared across tasks (isolated blocks)
                if win_id in window_occupancy:
                    continue
                    
                # Check 3: Crew capacity
                current_crews = crew_usage.get((win_id, dept), 0)
                if current_crews + task_crews > crew_limits[dept]:
                    continue
                    
                # Assign exclusively to this task
                window_occupancy[win_id] = [task_id]
                crew_usage[(win_id, dept)] = current_crews + task_crews
                
                scheduled_tasks.append({
                    "task_id": task_id,
                    "section_id": sec_id,
                    "department": dept,
                    "defect_type": task["defect_type"],
                    "severity": task["severity"],
                    "window_id": win_id,
                    "date": win["date"],
                    "start_hour": win["start_hour"],
                    "end_hour": win["end_hour"],
                    "duration_hours": task_duration,
                    "is_consolidated": False,
                    "consolidated_partner_tasks": []
                })
                assigned = True
                break
                
            if not assigned:
                unscheduled_tasks.append({
                    "task_id": task_id,
                    "department": dept,
                    "defect_type": task["defect_type"],
                    "severity": task["severity"],
                    "reason": "No unassigned block window satisfying duration and department crew limits in baseline queue"
                })

    # Calculate actual baseline block-hours (each block is separate)
    total_block_hours = sum(t["duration_hours"] for t in scheduled_tasks)
    
    return {
        "planning_mode": "BASELINE_DECENTRALIZED",
        "data_label": "SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA",
        "total_tasks": len(defects_df),
        "scheduled_tasks_count": len(scheduled_tasks),
        "unscheduled_tasks_count": len(unscheduled_tasks),
        "scheduled_tasks": scheduled_tasks,
        "unscheduled_tasks": unscheduled_tasks,
        "total_block_hours": round(total_block_hours, 2),
        "consolidated_blocks_count": 0,  # Zero by definition in siloed planning
        "consolidated_hours_saved": 0.0
    }
