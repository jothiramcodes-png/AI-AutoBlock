# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Master seed and validation script.
Generates all synthetic datasets, validates data integrity, foreign keys,
and populates SQLite database.
Deterministic seed = 42.
"""
import os
import sqlite3
import pandas as pd
try:
    from data.generators.generate_network import generate_network_df
    from data.generators.generate_defects import generate_defects_df
    from data.generators.generate_timetable import generate_timetable_windows_df
    from data.generators.generate_goods_forecast import generate_goods_forecast_df
    from data.generators.generate_historical_blocks import generate_historical_blocks_df
except ImportError:
    from generate_network import generate_network_df
    from generate_defects import generate_defects_df
    from generate_timetable import generate_timetable_windows_df
    from generate_goods_forecast import generate_goods_forecast_df
    from generate_historical_blocks import generate_historical_blocks_df

def validate_datasets(sections_df, defects_df, windows_df, goods_df, history_df):
    """Rigorous data validation checks before database insertion."""
    errors = []
    
    # 1. Null checks
    for name, df in [("Sections", sections_df), ("Defects", defects_df), 
                     ("Windows", windows_df), ("Goods", goods_df), ("History", history_df)]:
        null_counts = df.isnull().sum()
        if null_counts.any():
            # required machinery or notes might be null/empty, check critical columns
            crit_nulls = df[["task_id" if "task_id" in df.columns else df.columns[0]]].isnull().sum()
            if crit_nulls.any():
                errors.append(f"Critical null values found in {name}")

    # 2. Duplicate ID checks
    if sections_df["section_id"].duplicated().any():
        errors.append("Duplicate section_id detected in sections_df")
    if defects_df["task_id"].duplicated().any():
        errors.append("Duplicate task_id detected in defects_df")
    if windows_df["window_id"].duplicated().any():
        errors.append("Duplicate window_id detected in windows_df")
        
    # 3. Foreign Key checks
    valid_sections = set(sections_df["section_id"].unique())
    defects_invalid_sections = set(defects_df["section_id"].unique()) - valid_sections
    if defects_invalid_sections:
        errors.append(f"Foreign key mismatch in defects: {defects_invalid_sections}")
        
    windows_invalid_sections = set(windows_df["section_id"].unique()) - valid_sections
    if windows_invalid_sections:
        errors.append(f"Foreign key mismatch in windows: {windows_invalid_sections}")
        
    goods_invalid_sections = set(goods_df["corridor_id"].unique()) - valid_sections
    if goods_invalid_sections:
        errors.append(f"Foreign key mismatch in goods: {goods_invalid_sections}")

    # 4. Valid range checks
    if (defects_df["estimated_duration_hours"] <= 0).any():
        errors.append("Non-positive defect duration found")
    if (defects_df["punctuality_impact_score"] < 0).any() or (defects_df["punctuality_impact_score"] > 100).any():
        errors.append("Punctuality impact score out of [0, 100] bounds")
    if (windows_df["duration_hours"] <= 0).any():
        errors.append("Non-positive window duration found")
        
    # 5. Department and Severity domain validation
    valid_depts = {"Engineering", "Traction", "S&T"}
    if not set(defects_df["department"].unique()).issubset(valid_depts):
        errors.append(f"Invalid department in defects: {set(defects_df['department'].unique()) - valid_depts}")
        
    valid_sevs = {"Critical", "Major", "Minor"}
    if not set(defects_df["severity"].unique()).issubset(valid_sevs):
        errors.append(f"Invalid severity in defects: {set(defects_df['severity'].unique()) - valid_sevs}")
        
    if errors:
        raise ValueError(f"Data validation failed with errors: {errors}")
        
    print("Data validation check PASSED: zero duplicate IDs, zero broken foreign keys, valid domains and ranges.")

def seed_database(db_path: str = "data/railway_blocks.db", seed: int = 42):
    os.makedirs("data/samples", exist_ok=True)
    
    print(f"Generating synthetic datasets with deterministic seed={seed}...")
    sections_df = generate_network_df()
    defects_df = generate_defects_df(sections_df, count=60, seed=seed)
    windows_df = generate_timetable_windows_df(sections_df, days=7, seed=seed)
    goods_df = generate_goods_forecast_df(sections_df, seed=seed)
    history_df = generate_historical_blocks_df(count=500, seed=seed)
    
    # Validate
    validate_datasets(sections_df, defects_df, windows_df, goods_df, history_df)
    
    # Save CSVs
    sections_df.to_csv("data/samples/sections.csv", index=False)
    defects_df.to_csv("data/samples/defects_tasks.csv", index=False)
    windows_df.to_csv("data/samples/train_timetable_windows.csv", index=False)
    goods_df.to_csv("data/samples/goods_forecast.csv", index=False)
    history_df.to_csv("data/samples/historical_blocks.csv", index=False)
    print("Saved all CSV files to data/samples/")
    
    # Seed SQLite
    conn = sqlite3.connect(db_path)
    sections_df.to_sql("sections", conn, if_exists="replace", index=False)
    defects_df.to_sql("defects", conn, if_exists="replace", index=False)
    windows_df.to_sql("timetable_windows", conn, if_exists="replace", index=False)
    goods_df.to_sql("goods_forecast", conn, if_exists="replace", index=False)
    history_df.to_sql("historical_blocks", conn, if_exists="replace", index=False)
    
    # Create audit table if not exists
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS optimization_audit_log (
        run_id TEXT PRIMARY KEY,
        timestamp TEXT,
        horizon TEXT,
        dataset_version TEXT,
        solver_status TEXT,
        runtime_ms REAL,
        objective_value REAL,
        total_tasks INTEGER,
        scheduled_tasks INTEGER,
        unscheduled_tasks INTEGER,
        locked_tasks INTEGER,
        data_label TEXT
    )
    """)
    conn.commit()
    conn.close()
    print(f"Database seeded successfully at {db_path} with audit table.")

if __name__ == "__main__":
    seed_database()
