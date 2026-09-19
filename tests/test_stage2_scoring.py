# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.ml.scorer import compute_priority_score
from backend.app.ml.ranker import MLTaskRanker

def test_scorer_factor_sum_mathematical_identity():
    """Verify that Total Priority Score matches the sum of its individual factor components exactly."""
    cases = [
        ("Critical", "Tier-1 Trunk", 15, True, 90.0, "IMR Rail Fracture Risk"),
        ("Major", "Tier-2 Main", 5, False, 60.0, "Ballast Tamping"),
        ("Minor", "Tier-3 Branch", 0, False, 20.0, "Cess Clearing"),
        ("Critical", "Tier-2 Main", 25, True, 85.0, "OHE Wire Snapped"),
    ]
    
    for sev, tier, overdue, safety, punctuality, defect_type in cases:
        score, b = compute_priority_score(sev, tier, overdue, safety, punctuality, defect_type)
        factor_sum = round(
            b.safety_risk_component +
            b.defect_severity_component +
            b.asset_criticality_component +
            b.overdue_days_component +
            b.train_impact_component +
            b.failure_history_component,
            2
        )
        assert score == factor_sum, f"Mismatch: score {score} != factor sum {factor_sum}"
        assert 0.0 <= score <= 100.0

def test_scorer_edge_case_critical_vs_minor():
    """Critical safety defects on high-speed trunk routes must drastically outrank minor routine branch tasks."""
    crit_score, _ = compute_priority_score(
        severity="Critical",
        tier="Tier-1 Trunk",
        days_overdue=10,
        safety_risk_flag=True,
        punctuality_impact_score=95.0,
        defect_type="IMR (Immediate Removal) Rail Fracture Risk"
    )
    
    minor_score, _ = compute_priority_score(
        severity="Minor",
        tier="Tier-3 Branch",
        days_overdue=0,
        safety_risk_flag=False,
        punctuality_impact_score=15.0,
        defect_type="Sign Board Cleaning"
    )
    
    assert crit_score >= 85.0, f"Critical task score {crit_score} should be >= 85"
    assert minor_score <= 30.0, f"Minor task score {minor_score} should be <= 30"
    assert crit_score > minor_score + 50.0

def test_ml_ranker_train_and_metrics():
    """Verify ML ranker trains on synthetic history and exposes real metrics without fabrication."""
    ranker = MLTaskRanker()
    diag = ranker.get_model_diagnostics()
    assert "training_dataset" in diag
    assert "SYNTHETIC" in diag["training_dataset"]
    assert "test_r2_score" in diag
    assert isinstance(diag["test_r2_score"], float)
    
    sample_task = {
        "department": "Engineering",
        "severity": "Critical",
        "days_overdue": 12,
        "safety_risk_flag": True,
        "punctuality_impact_score": 90.0,
        "defect_type": "Rail Fracture"
    }
    pred = ranker.predict_score(sample_task, "Tier-1 Trunk")
    assert 0.0 <= pred <= 100.0
