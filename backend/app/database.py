# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
SQLite database connection and DataFrame access helpers.
Ensures persistent storage and easy migration to PostgreSQL.
"""
import sqlite3
import os
import pandas as pd

DB_PATH = "data/railway_blocks.db"

def get_db_connection():
    if not os.path.exists(DB_PATH):
        from data.generators.seed_all import seed_database
        seed_database(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def load_table_df(table_name: str) -> pd.DataFrame:
    conn = get_db_connection()
    df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
    conn.close()
    return df

def save_table_df(df: pd.DataFrame, table_name: str):
    conn = get_db_connection()
    df.to_sql(table_name, conn, if_exists="replace", index=False)
    conn.close()
