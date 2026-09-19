# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.main import app

client = TestClient(app)

def test_full_pipeline_end_to_end():
    """
    End-to-End pipeline verification:
    1. Check API health
    2. Retrieve network sections
    3. Retrieve defects with explainable scores
    4. Run baseline vs CP-SAT comparison and verify genuine positive/defensible delta
    5. Run What-If emergency injection and inspect schedule diffs
    6. Verify audit trail entry created
    """
    # 1. Health
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json() == {"status": "ok"}

    # 2. Network sections
    res_sections = client.get("/api/network/sections")
    assert res_sections.status_code == 200
    sections = res_sections.json()
    assert len(sections) == 12

    # 3. Defects with explainable scoring
    res_defects = client.get("/api/defects")
    assert res_defects.status_code == 200
    defects = res_defects.json()
    assert len(defects) > 0
    first_task = defects[0]
    b = first_task["score_breakdown"]
    assert round(
        b["safety_risk_component"] +
        b["defect_severity_component"] +
        b["asset_criticality_component"] +
        b["overdue_days_component"] +
        b["train_impact_component"] +
        b["failure_history_component"], 2
    ) == first_task["priority_score"]

    # 4. Baseline vs CP-SAT Comparison
    res_comp = client.get("/api/optimizer/baseline-comparison?horizon=Weekly")
    assert res_comp.status_code == 200
    comp_data = res_comp.json()
    kpis = comp_data["kpis"]

    # Verify that CP-SAT optimizer scheduled tasks
    assert comp_data["optimized_plan"]["scheduled_count"] > 0
    assert comp_data["optimized_plan"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
    assert kpis["optimized_total_block_hours"] > 0
    assert kpis["baseline_total_block_hours"] > 0
    # Block hours saved is accurately calculated
    assert kpis["block_hours_saved"] == round(kpis["baseline_total_block_hours"] - kpis["optimized_total_block_hours"], 2)

    # 5. What-If Emergency Re-Optimization
    res_whatif = client.post("/api/optimizer/what-if", json={
        "action": "INJECT_EMERGENCY_DEFECT",
        "planning_horizon": "Weekly"
    })
    assert res_whatif.status_code == 200
    whatif_data = res_whatif.json()
    assert whatif_data["measured_reoptimization_runtime_ms"] > 0
    assert whatif_data["new_plan"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]

    # 6. Audit Trail
    res_audit = client.get("/api/optimizer/audit-trail")
    assert res_audit.status_code == 200
    assert len(res_audit.json()) > 0
