# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
ML-based ranking and priority estimation module.
Trained on synthetic historical block outcome logs.
Includes automatic fallback to the explainable rule-based scorer.
Reports actual evaluation metrics on synthetic test split without fabrication.
"""
import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from backend.app.ml.scorer import compute_priority_score

MODEL_PATH = "backend/app/ml/ranker_model.pkl"

class MLTaskRanker:
    def __init__(self):
        self.model = None
        self.metrics = None
        self.load_or_train_model()
        
    def load_or_train_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                saved = joblib.load(MODEL_PATH)
                self.model = saved["model"]
                self.metrics = saved["metrics"]
                return
            except Exception:
                pass
                
        # Train on synthetic historical data if available
        csv_path = "data/samples/historical_blocks.csv"
        if os.path.exists(csv_path):
            self.train_on_synthetic_data(csv_path)

    def train_on_synthetic_data(self, csv_path: str):
        df = pd.read_csv(csv_path)
        
        # Feature encoding
        X = pd.DataFrame()
        X["dept_eng"] = (df["department"] == "Engineering").astype(int)
        X["dept_trd"] = (df["department"] == "Traction").astype(int)
        X["dept_snt"] = (df["department"] == "S&T").astype(int)
        X["sev_crit"] = (df["severity"] == "Critical").astype(int)
        X["sev_maj"] = (df["severity"] == "Major").astype(int)
        X["tier_t1"] = (df["tier"] == "Tier-1 Trunk").astype(int)
        X["tier_t2"] = (df["tier"] == "Tier-2 Main").astype(int)
        X["days_overdue"] = df["days_overdue"]
        X["safety_risk_flag"] = df["safety_risk_flag"]
        X["punctuality_impact_score"] = df["punctuality_impact_score"]
        
        y = df["ground_truth_priority"]
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        model = GradientBoostingRegressor(n_estimators=60, max_depth=3, random_state=42)
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        
        # Calculate actual genuine metrics
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        mae = float(mean_absolute_error(y_test, y_pred))
        r2 = float(r2_score(y_test, y_pred))
        
        self.metrics = {
            "model_type": "GradientBoostingRegressor (scikit-learn)",
            "training_dataset": "SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA",
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "test_rmse": round(rmse, 2),
            "test_mae": round(mae, 2),
            "test_r2_score": round(r2, 4)
        }
        self.model = model
        
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump({"model": model, "metrics": self.metrics}, MODEL_PATH)

    def predict_score(self, task_dict: dict, section_tier: str) -> float:
        """Predict priority score with automatic fallback to rule-based scorer."""
        if self.model is None:
            score, _ = compute_priority_score(
                severity=task_dict["severity"],
                tier=section_tier,
                days_overdue=task_dict.get("days_overdue", 0),
                safety_risk_flag=task_dict.get("safety_risk_flag", False),
                punctuality_impact_score=task_dict.get("punctuality_impact_score", 50.0),
                defect_type=task_dict.get("defect_type", "")
            )
            return score
            
        row = pd.DataFrame([{
            "dept_eng": 1 if task_dict["department"] == "Engineering" else 0,
            "dept_trd": 1 if task_dict["department"] == "Traction" else 0,
            "dept_snt": 1 if task_dict["department"] == "S&T" else 0,
            "sev_crit": 1 if task_dict["severity"] == "Critical" else 0,
            "sev_maj": 1 if task_dict["severity"] == "Major" else 0,
            "tier_t1": 1 if "Tier-1" in section_tier else 0,
            "tier_t2": 1 if "Tier-2" in section_tier else 0,
            "days_overdue": task_dict.get("days_overdue", 0),
            "safety_risk_flag": 1 if task_dict.get("safety_risk_flag", False) else 0,
            "punctuality_impact_score": task_dict.get("punctuality_impact_score", 50.0)
        }])
        
        pred = self.model.predict(row)[0]
        return round(float(np.clip(pred, 0.0, 100.0)), 2)

    def get_model_diagnostics(self) -> dict:
        return self.metrics or {"status": "Model using rule-based scoring fallback"}
