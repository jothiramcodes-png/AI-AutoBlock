# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Generates synthetic historical block requests and outcomes.
Represents past BDMS manual requests and operational results.
Used for training and calibrating prioritization models.
Uses deterministic random seed (seed=42).
"""
import random
import pandas as pd

def generate_historical_blocks_df(count: int = 500, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    records = []
    departments = ["Engineering", "Traction", "S&T"]
    severities = ["Critical", "Major", "Minor"]
    tiers = ["Tier-1 Trunk", "Tier-2 Main", "Tier-3 Branch"]
    
    for i in range(1, count + 1):
        dept = random.choice(departments)
        sev = random.choices(severities, weights=[0.25, 0.45, 0.30])[0]
        tier = random.choices(tiers, weights=[0.50, 0.35, 0.15])[0]
        
        days_overdue = random.randint(0, 25)
        safety_flag = 1 if (sev == "Critical" or (sev == "Major" and random.random() < 0.4)) else 0
        punctuality_impact = random.randint(30, 95) if sev in ["Critical", "Major"] else random.randint(10, 45)
        
        # Ground-truth outcome: was it granted high priority and resolved timely?
        # Target label priority_score (0 - 100)
        score = (
            safety_flag * 30.0 +
            (25.0 if sev == "Critical" else (15.0 if sev == "Major" else 5.0)) +
            (20.0 if tier == "Tier-1 Trunk" else (12.0 if tier == "Tier-2 Main" else 5.0)) +
            min(15.0, days_overdue * 0.8) +
            (punctuality_impact * 0.10)
        )
        score = round(min(100.0, max(5.0, score + random.gauss(0, 2.5))), 1)
        
        records.append({
            "history_id": f"HIST-{i:05d}",
            "department": dept,
            "severity": sev,
            "tier": tier,
            "days_overdue": days_overdue,
            "safety_risk_flag": safety_flag,
            "punctuality_impact_score": punctuality_impact,
            "requested_duration_hours": round(random.uniform(1.5, 4.0), 1),
            "granted_duration_hours": round(random.uniform(1.0, 3.5), 1),
            "was_consolidated": random.choice([0, 0, 1]),  # historically BDMS has low consolidation
            "actual_incident_avoided": 1 if score > 70 else (1 if random.random() < 0.3 else 0),
            "ground_truth_priority": score
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    df = generate_historical_blocks_df(count=500)
    df.to_csv("data/samples/historical_blocks.csv", index=False)
    print(f"Generated {len(df)} synthetic historical block logs.")
