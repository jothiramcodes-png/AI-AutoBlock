# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import os
import sys
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.optimizer.evaluator import evaluate_baseline_vs_optimized

def test_evaluator_metrics_mathematical_consistency():
    """Verify that all comparative delta KPIs match their exact mathematical formulas."""
    sections_df = pd.read_csv("data/samples/sections.csv")
    defects_df = pd.read_csv("data/samples/defects_tasks.csv")
    windows_df = pd.read_csv("data/samples/train_timetable_windows.csv")

    eval_result = evaluate_baseline_vs_optimized(sections_df, defects_df, windows_df)
    kpis = eval_result["kpis"]

    # 1. Block hours saved
    base_hours = kpis["baseline_total_block_hours"]
    opt_hours = kpis["optimized_total_block_hours"]
    hours_saved = kpis["block_hours_saved"]
    assert round(base_hours - opt_hours, 2) == hours_saved

    # 2. Downtime reduction percentage
    if base_hours > 0:
        expected_downtime_pct = round((hours_saved / base_hours) * 100.0, 2)
        assert kpis["downtime_reduction_pct"] == expected_downtime_pct

    # 3. Critical clearance delta
    opt_crit = kpis["optimized_critical_cleared"]
    base_crit = kpis["baseline_critical_cleared"]
    assert kpis["critical_clearance_delta"] == opt_crit - base_crit

    # 4. Measured runtime
    assert eval_result["evaluation_summary"]["measured_optimizer_runtime_ms"] > 0
    assert eval_result["evaluation_summary"]["solver_status"] in ["OPTIMAL", "FEASIBLE"]
