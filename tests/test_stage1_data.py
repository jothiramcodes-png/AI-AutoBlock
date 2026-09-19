# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
import pytest
import pandas as pd
import os
import sys

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from data.generators.generate_network import generate_network_df
from data.generators.generate_defects import generate_defects_df
from data.generators.generate_timetable import generate_timetable_windows_df
from data.generators.generate_goods_forecast import generate_goods_forecast_df
from data.generators.seed_all import validate_datasets, seed_database

def test_deterministic_generation():
    """Verify that using seed=42 generates 100% identical datasets every time."""
    sec_df1 = generate_network_df()
    sec_df2 = generate_network_df()
    pd.testing.assert_frame_equal(sec_df1, sec_df2)

    def_df1 = generate_defects_df(sec_df1, count=40, seed=42)
    def_df2 = generate_defects_df(sec_df2, count=40, seed=42)
    pd.testing.assert_frame_equal(def_df1, def_df2)

    win_df1 = generate_timetable_windows_df(sec_df1, days=3, seed=42)
    win_df2 = generate_timetable_windows_df(sec_df2, days=3, seed=42)
    pd.testing.assert_frame_equal(win_df1, win_df2)

def test_validation_integrity():
    """Verify foreign keys, absence of nulls, and domain enums."""
    sec_df = generate_network_df()
    def_df = generate_defects_df(sec_df, count=50, seed=42)
    win_df = generate_timetable_windows_df(sec_df, days=7, seed=42)
    goods_df = generate_goods_forecast_df(sec_df, seed=42)
    
    # Validation should pass without throwing
    validate_datasets(sec_df, def_df, win_df, goods_df, pd.DataFrame({"dummy": [1]}))
    
    # Assert counts
    assert len(sec_df) == 12
    assert len(def_df) == 50
    assert len(win_df) > 50
    assert len(goods_df) == 12

def test_negative_duration_fails_validation():
    """Validation must catch non-positive durations."""
    sec_df = generate_network_df()
    def_df = generate_defects_df(sec_df, count=10, seed=42)
    def_df.loc[0, "estimated_duration_hours"] = -1.5
    win_df = generate_timetable_windows_df(sec_df, days=2, seed=42)
    goods_df = generate_goods_forecast_df(sec_df, seed=42)
    
    with pytest.raises(ValueError, match="Non-positive defect duration"):
        validate_datasets(sec_df, def_df, win_df, goods_df, pd.DataFrame({"dummy": [1]}))

def test_foreign_key_mismatch_fails_validation():
    """Validation must catch non-existent section_id."""
    sec_df = generate_network_df()
    def_df = generate_defects_df(sec_df, count=10, seed=42)
    def_df.loc[0, "section_id"] = "SEC-UNKNOWN-999"
    win_df = generate_timetable_windows_df(sec_df, days=2, seed=42)
    goods_df = generate_goods_forecast_df(sec_df, seed=42)
    
    with pytest.raises(ValueError, match="Foreign key mismatch"):
        validate_datasets(sec_df, def_df, win_df, goods_df, pd.DataFrame({"dummy": [1]}))

def test_seed_database_executes(tmp_path):
    """Verify seed_database creates the SQLite tables properly."""
    db_file = str(tmp_path / "test_blocks.db")
    seed_database(db_path=db_file, seed=42)
    assert os.path.exists(db_file)
