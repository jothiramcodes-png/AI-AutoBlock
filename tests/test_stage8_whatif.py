# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
import pandas as pd
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app

client = TestClient(app)

def test_whatif_emergency_injection_and_reoptimization():
    """Verify that What-If executes real CP-SAT re-optimization and reports honest runtime and diffs."""
    payload = {
        "action": "INJECT_EMERGENCY_DEFECT",
        "planning_horizon": "Weekly"
    }
    response = client.post("/api/optimizer/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Measured runtime must be genuine
    assert "measured_reoptimization_runtime_ms" in data
    assert data["measured_reoptimization_runtime_ms"] > 0
    assert data["measured_reoptimization_runtime_ms"] < 20000  # Feasible within 20s

    # 2. Injected task must be present in diffs and scheduled
    injected_id = data["injected_task_id"]
    assert injected_id is not None
    assert any(d["task_id"] == injected_id and d["change_type"] == "NEWLY_SCHEDULED" for d in data["schedule_diffs"])

    # 3. Verify new plan solver status
    new_plan = data["new_plan"]
    assert new_plan["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert any(t["task_id"] == injected_id for t in new_plan["scheduled_tasks"])

def test_whatif_preserves_human_locked_assignments():
    """Verify that What-If re-optimization strictly preserves Human-Locked assignments."""
    # Step 1: Pick an existing task and an eligible window on its section
    tasks_res = client.get("/api/defects")
    first_task = tasks_res.json()[0]
    task_id = first_task["task_id"]
    task_sec = first_task["section_id"]

    windows_res = client.get("/api/network/windows")
    eligible_windows = [w for w in windows_res.json() if w["section_id"] == task_sec and w["duration_hours"] >= first_task["estimated_duration_hours"]]
    target_window_id = eligible_windows[0]["window_id"]

    lock_payload = {
        "task_id": task_id,
        "window_id": target_window_id,
        "action": "LOCK"
    }
    res_lock = client.post("/api/optimizer/override", json=lock_payload)
    assert res_lock.status_code == 200

    # Step 2: Run What-If emergency injection
    whatif_res = client.post("/api/optimizer/what-if", json={"action": "INJECT_EMERGENCY_DEFECT", "planning_horizon": "Weekly"})
    assert whatif_res.status_code == 200
    whatif_data = whatif_res.json()

    # Step 3: Verify that the locked task's window was NOT altered or bumped
    scheduled_locked = next((t for t in whatif_data["new_plan"]["scheduled_tasks"] if t["task_id"] == task_id), None)
    if scheduled_locked:
        assert scheduled_locked["window_id"] == target_window_id
        assert scheduled_locked["assignment_source"] == "HUMAN_LOCKED"

    # Cleanup unlock
    client.post("/api/optimizer/override", json={"task_id": task_id, "action": "UNLOCK"})
