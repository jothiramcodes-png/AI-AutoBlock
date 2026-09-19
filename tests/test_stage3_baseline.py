# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.optimizer.baseline_scheduler import run_baseline_schedule

def test_baseline_deterministic_output():
    """Verify baseline schedule generates reproducible assignments on identical input data."""
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")
    
    res1 = run_baseline_schedule(defects_df, windows_df)
    res2 = run_baseline_schedule(defects_df, windows_df)
    
    assert res1["scheduled_tasks_count"] == res2["scheduled_tasks_count"]
    assert res1["total_block_hours"] == res2["total_block_hours"]
    assert len(res1["scheduled_tasks"]) == len(res2["scheduled_tasks"])
    for t1, t2 in zip(res1["scheduled_tasks"], res2["scheduled_tasks"]):
        assert t1["task_id"] == t2["task_id"]
        assert t1["window_id"] == t2["window_id"]

def test_baseline_zero_consolidation_and_exclusive_windows():
    """In baseline decentralized planning, departments do not consolidate blocks."""
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")
    
    res = run_baseline_schedule(defects_df, windows_df)
    
    assert res["consolidated_blocks_count"] == 0
    assert res["consolidated_hours_saved"] == 0.0
    
    # Check that each window is assigned to at most ONE task
    assigned_windows = [t["window_id"] for t in res["scheduled_tasks"]]
    assert len(assigned_windows) == len(set(assigned_windows)), "Windows must not overlap in baseline"

def test_baseline_crew_limits_respected():
    """Check that baseline scheduler never exceeds department crew caps."""
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")
    
    crew_caps = {"Engineering": 2, "Traction": 2, "S&T": 2}
    res = run_baseline_schedule(defects_df, windows_df, crew_limits=crew_caps)
    
    # Since windows are mutually exclusive in baseline, each task's crew must be <= crew_cap
    for t in res["scheduled_tasks"]:
        task_row = defects_df[defects_df["task_id"] == t["task_id"]].iloc[0]
        assert task_row["required_crews"] <= crew_caps[t["department"]]
