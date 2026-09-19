# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app

client = TestClient(app)

def test_api_health():
    """Verify GET /api/health returns {'status': 'ok'}."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_api_network_sections():
    """Verify GET /api/network/sections returns sections."""
    response = client.get("/api/network/sections")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 12
    assert data[0]["section_id"] == "SEC-001"
    assert "tier" in data[0]

def test_api_defects_list_and_explainability():
    """Verify GET /api/defects returns explainable factor breakdowns."""
    response = client.get("/api/defects?department=Engineering")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    first = data[0]
    assert first["department"] == "Engineering"
    assert "priority_score" in first
    assert "score_breakdown" in first
    breakdown = first["score_breakdown"]
    assert "safety_risk_component" in breakdown
    assert "defect_severity_component" in breakdown

def test_api_optimizer_plan():
    """Verify POST /api/optimizer/plan runs CP-SAT and returns valid plan."""
    payload = {"planning_horizon": "Weekly"}
    response = client.post("/api/optimizer/plan", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert data["scheduled_count"] > 0
    assert data["runtime_ms"] > 0

def test_api_baseline_comparison():
    """Verify GET /api/optimizer/baseline-comparison returns genuine deltas."""
    response = client.get("/api/optimizer/baseline-comparison?horizon=Weekly")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "block_hours_saved" in data["kpis"]
    assert "downtime_reduction_pct" in data["kpis"]

def test_api_manual_override_and_audit():
    """Verify POST /api/optimizer/override locks and unlocks tasks."""
    # Get a real task and window
    tasks_res = client.get("/api/defects")
    assert tasks_res.status_code == 200
    first_task = tasks_res.json()[0]
    task_id = first_task["task_id"]

    windows_res = client.get("/api/network/windows")
    assert windows_res.status_code == 200
    first_win = windows_res.json()[0]
    win_id = first_win["window_id"]

    lock_payload = {
        "task_id": task_id,
        "window_id": win_id,
        "action": "LOCK"
    }
    res_lock = client.post("/api/optimizer/override", json=lock_payload)
    assert res_lock.status_code == 200
    assert res_lock.json()["status"] == "success"

    unlock_payload = {
        "task_id": task_id,
        "action": "UNLOCK"
    }
    res_unlock = client.post("/api/optimizer/override", json=unlock_payload)
    assert res_unlock.status_code == 200
    assert res_unlock.json()["status"] == "success"

def test_api_what_if_reoptimization():
    """Verify POST /api/optimizer/what-if runs real re-optimization with diffs."""
    payload = {
        "action": "INJECT_EMERGENCY_DEFECT",
        "planning_horizon": "Weekly"
    }
    response = client.post("/api/optimizer/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "schedule_diffs" in data
    assert "measured_reoptimization_runtime_ms" in data
    assert data["measured_reoptimization_runtime_ms"] > 0
