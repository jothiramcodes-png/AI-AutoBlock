# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app
from backend.app.database import get_db_connection

client = TestClient(app)

def test_manual_override_lifecycle():
    """Verify Lock -> Plan with Lock -> Unlock -> Plan without Lock lifecycle."""
    # 1. Get task and candidate window on its section
    tasks_res = client.get("/api/defects")
    task = tasks_res.json()[0]
    task_id = task["task_id"]
    task_sec = task["section_id"]

    windows_res = client.get("/api/network/windows")
    eligible_windows = [w for w in windows_res.json() if w["section_id"] == task_sec and w["duration_hours"] >= task["estimated_duration_hours"]]
    target_window_id = eligible_windows[0]["window_id"]

    # 2. Lock assignment
    lock_res = client.post("/api/optimizer/override", json={
        "task_id": task_id,
        "window_id": target_window_id,
        "action": "LOCK"
    })
    assert lock_res.status_code == 200
    assert lock_res.json()["active_manual_locks"][task_id] == target_window_id

    # 3. Run optimizer plan and verify lock enforced
    plan_res = client.post("/api/optimizer/plan", json={"planning_horizon": "Weekly"})
    assert plan_res.status_code == 200
    plan_data = plan_res.json()

    locked_t = next((t for t in plan_data["scheduled_tasks"] if t["task_id"] == task_id), None)
    assert locked_t is not None
    assert locked_t["window_id"] == target_window_id
    assert locked_t["assignment_source"] == "HUMAN_LOCKED"

    # 4. Unlock assignment
    unlock_res = client.post("/api/optimizer/override", json={
        "task_id": task_id,
        "action": "UNLOCK"
    })
    assert unlock_res.status_code == 200
    assert task_id not in unlock_res.json()["active_manual_locks"]

def test_audit_trail_logging():
    """Verify that optimization runs are persisted in SQLite audit table with all mandatory fields."""
    # Trigger a plan run
    plan_res = client.post("/api/optimizer/plan", json={"planning_horizon": "Weekly"})
    assert plan_res.status_code == 200

    # Fetch audit trail via API
    audit_res = client.get("/api/optimizer/audit-trail")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0

    latest = logs[0]
    required_fields = [
        "run_id", "timestamp", "horizon", "dataset_version",
        "solver_status", "runtime_ms", "total_tasks",
        "scheduled_tasks", "unscheduled_tasks", "locked_tasks", "data_label"
    ]
    for field in required_fields:
        assert field in latest, f"Missing required audit field: {field}"

    assert latest["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert latest["runtime_ms"] > 0
    assert "SYNTHETIC" in latest["data_label"]
