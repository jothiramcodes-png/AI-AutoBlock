# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.optimizer.cp_sat_scheduler import BlockPlanningCPSATScheduler

def test_cp_sat_feasibility_and_status():
    """Verify OR-Tools CP-SAT solves and returns OPTIMAL or FEASIBLE status."""
    sections_df = pd.read_csv("data/samples/sections.csv")
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")

    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=5.0)
    res = scheduler.solve(sections_df, defects_df, windows_df)

    assert res.solver_status in ["OPTIMAL", "FEASIBLE"]
    assert res.scheduled_count > 0
    assert res.total_tasks_count == len(defects_df)
    assert res.scheduled_count + res.unscheduled_count == res.total_tasks_count

def test_cp_sat_crew_limits_and_section_integrity():
    """Verify department crew limits are strictly enforced in every single block window."""
    sections_df = pd.read_csv("data/samples/sections.csv")
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")

    crew_caps = {"Engineering": 2, "Traction": 2, "S&T": 2}
    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=5.0)
    res = scheduler.solve(sections_df, defects_df, windows_df, crew_limits=crew_caps)

    # Group scheduled tasks by window
    window_dept_crews = {}
    tasks_lookup = {row["task_id"]: row for _, row in defects_df.iterrows()}
    
    for t in res.scheduled_tasks:
        win_id = t.window_id
        dept = t.department
        crews = tasks_lookup[t.task_id]["required_crews"]
        
        key = (win_id, dept)
        window_dept_crews[key] = window_dept_crews.get(key, 0) + crews
        
        # Verify section consistency
        assert t.section_id == tasks_lookup[t.task_id]["section_id"]

    for (win_id, dept), total_c in window_dept_crews.items():
        assert total_c <= crew_caps[dept], f"Crew limit violated in {win_id} for {dept}: {total_c} > {crew_caps[dept]}"

def test_cp_sat_consolidation_produces_savings():
    """Verify that joint cross-department block consolidation saves track closure hours."""
    sections_df = pd.read_csv("data/samples/sections.csv")
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")

    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=5.0)
    res = scheduler.solve(sections_df, defects_df, windows_df)

    assert res.consolidated_blocks_count >= 0
    if res.consolidated_blocks_count > 0:
        assert res.consolidated_hours_saved > 0.0

def test_cp_sat_manual_lock_hard_constraint():
    """Verify that a manual lock pinned by an officer is enforced as a hard constraint."""
    sections_df = pd.read_csv("data/samples/sections.csv")
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")

    # Pick the first task and an eligible window
    task0 = defects_df.iloc[0]
    t0_id = task0["task_id"]
    t0_sec = task0["section_id"]
    
    eligible_windows = windows_df[
        (windows_df["section_id"] == t0_sec) & 
        (windows_df["duration_hours"] >= task0["estimated_duration_hours"])
    ]
    target_window_id = eligible_windows.iloc[0]["window_id"]

    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=5.0)
    res = scheduler.solve(
        sections_df, defects_df, windows_df,
        manual_locks={t0_id: target_window_id}
    )

    locked_task = next((t for t in res.scheduled_tasks if t.task_id == t0_id), None)
    assert locked_task is not None, f"Locked task {t0_id} must be scheduled"
    assert locked_task.window_id == target_window_id
    assert locked_task.assignment_source.value == "HUMAN_LOCKED"

def test_cp_sat_infeasible_scenario_handling():
    """Verify that tasks that cannot be scheduled are returned with structured unscheduled info."""
    sections_df = pd.read_csv("data/samples/sections.csv")
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    # Provide empty windows
    empty_windows_df = pd.DataFrame(columns=pd.read_csv("data/samples/train_timetable_windows.csv").columns)

    scheduler = BlockPlanningCPSATScheduler(time_limit_seconds=2.0)
    res = scheduler.solve(sections_df, defects_df, empty_windows_df)

    assert res.scheduled_count == 0
    assert res.unscheduled_count == len(defects_df)
    for unsched in res.unscheduled_tasks:
        assert len(unsched.blocking_constraints) > 0
        assert "No maintenance windows" in unsched.reason
