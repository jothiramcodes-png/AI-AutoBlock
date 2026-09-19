# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Generates realistic synthetic maintenance tasks and defects across
Engineering (Civil/Track), Traction (Electrical/OHE), and S&T (Signalling & Telecom).
Uses deterministic random seed (seed=42) for exact reproducibility.
"""
import random
from datetime import datetime, timedelta
import pandas as pd

DEPARTMENT_DEFECT_CATALOG = {
    "Engineering": [
        {"defect_type": "IMR (Immediate Removal) Rail Fracture Risk", "severity": "Critical", "base_duration": 3.5, "crews": 2, "machinery": "AFTD / Rail Welder", "safety_flag": True, "punctuality_impact": 95.0},
        {"defect_type": "Turnout / Switch Diamond Tongue Rail Wear", "severity": "Critical", "base_duration": 4.0, "crews": 2, "machinery": "Point Inspection Trolley", "safety_flag": True, "punctuality_impact": 85.0},
        {"defect_type": "Ballast Tamping & Track Packing (High Unevenness)", "severity": "Major", "base_duration": 3.0, "crews": 1, "machinery": "CSM Tamping Machine", "safety_flag": False, "punctuality_impact": 65.0},
        {"defect_type": "Fishplate Bolt Loose / Missing at Glued Joint", "severity": "Major", "base_duration": 2.5, "crews": 1, "machinery": "Torque Wrench Unit", "safety_flag": True, "punctuality_impact": 60.0},
        {"defect_type": "Sleeper Replacement on Approach Bridge", "severity": "Major", "base_duration": 4.0, "crews": 2, "machinery": "Crane / Dip-Lorry", "safety_flag": False, "punctuality_impact": 55.0},
        {"defect_type": "Cess Clearing and Drainage Deep Screening", "severity": "Minor", "base_duration": 2.0, "crews": 1, "machinery": "BRM Machine", "safety_flag": False, "punctuality_impact": 30.0},
        {"defect_type": "Track De-stressing (LWR/CWR thermal adjustment)", "severity": "Major", "base_duration": 3.5, "crews": 2, "machinery": "Rail Tensor", "safety_flag": True, "punctuality_impact": 70.0}
    ],
    "Traction": [
        {"defect_type": "25kV OHE Contact Wire Parting / Dropper Snapped", "severity": "Critical", "base_duration": 3.0, "crews": 2, "machinery": "OHE Tower Wagon", "safety_flag": True, "punctuality_impact": 92.0},
        {"defect_type": "OHE Insulator Flashover / Heavy Flashing", "severity": "Critical", "base_duration": 2.5, "crews": 1, "machinery": "Ladder Trolley", "safety_flag": True, "punctuality_impact": 88.0},
        {"defect_type": "Neutral Section PTFE Assembly Inspection & Adjustment", "severity": "Major", "base_duration": 2.5, "crews": 1, "machinery": "OHE Tower Wagon", "safety_flag": True, "punctuality_impact": 70.0},
        {"defect_type": "OHE Cantilever Height & Stagger Adjustment", "severity": "Major", "base_duration": 2.0, "crews": 1, "machinery": "OHE Tower Wagon", "safety_flag": False, "punctuality_impact": 50.0},
        {"defect_type": "Traction Substation Interrupter Overhaul", "severity": "Major", "base_duration": 3.0, "crews": 2, "machinery": "Substation Testing Kit", "safety_flag": False, "punctuality_impact": 60.0},
        {"defect_type": "Tree Trimming within 4m of Live 25kV Feeder", "severity": "Minor", "base_duration": 1.5, "crews": 1, "machinery": "Tree Pruning Truck", "safety_flag": True, "punctuality_impact": 35.0},
        {"defect_type": "Earth Bonding / Jumper Wire Replacement", "severity": "Minor", "base_duration": 2.0, "crews": 1, "machinery": "Manual Bonding Kit", "safety_flag": False, "punctuality_impact": 25.0}
    ],
    "S&T": [
        {"defect_type": "Electronic Interlocking (EI) Card Redundancy Fault", "severity": "Critical", "base_duration": 2.5, "crews": 2, "machinery": "EI Diagnostics Kit", "safety_flag": True, "punctuality_impact": 94.0},
        {"defect_type": "Digital Axle Counter (DAC) Track Circuit Dropping", "severity": "Critical", "base_duration": 2.0, "crews": 1, "machinery": "DAC Signal Analyzer", "safety_flag": True, "punctuality_impact": 90.0},
        {"defect_type": "Point Machine Clamplock Obstruction & Setting", "severity": "Major", "base_duration": 2.0, "crews": 1, "machinery": "Point Test Meter", "safety_flag": True, "punctuality_impact": 75.0},
        {"defect_type": "LED Signal Aspect Failure on Home Signal", "severity": "Major", "base_duration": 1.5, "crews": 1, "machinery": "Aspect Measurement Unit", "safety_flag": True, "punctuality_impact": 80.0},
        {"defect_type": "OFC Cable Low Optical Margin / Splicing Maintenance", "severity": "Major", "base_duration": 3.0, "crews": 1, "machinery": "OTDR Splicing Machine", "safety_flag": False, "punctuality_impact": 45.0},
        {"defect_type": "Track Lead Cable Insulation Degradation", "severity": "Minor", "base_duration": 2.0, "crews": 1, "machinery": "Megger Insulation Tester", "safety_flag": False, "punctuality_impact": 35.0},
        {"defect_type": "Automatic Block Signalling (ABS) Relay Overhaul", "severity": "Major", "base_duration": 2.5, "crews": 1, "machinery": "Relay Testing Kit", "safety_flag": True, "punctuality_impact": 65.0}
    ]
}

def generate_defects_df(sections_df: pd.DataFrame, count: int = 60, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    base_date = datetime(2026, 9, 15)
    records = []
    
    section_ids = sections_df["section_id"].tolist()
    departments = ["Engineering", "Traction", "S&T"]
    
    for i in range(1, count + 1):
        dept = random.choice(departments)
        template = random.choice(DEPARTMENT_DEFECT_CATALOG[dept])
        sec_id = random.choice(section_ids)
        
        # Determine overdue status and reported date
        # Some are overdue (positive days_overdue), some are upcoming (negative or zero)
        reported_offset = random.randint(3, 30)
        reported_date = base_date - timedelta(days=reported_offset)
        
        if template["severity"] == "Critical":
            days_allowed = random.randint(2, 5)
        elif template["severity"] == "Major":
            days_allowed = random.randint(7, 14)
        else:
            days_allowed = random.randint(14, 28)
            
        due_date = reported_date + timedelta(days=days_allowed)
        days_overdue = max(0, (base_date - due_date).days)
        
        # Duration variation +/- 0.5 hour
        duration = round(max(1.0, template["base_duration"] + random.choice([-0.5, 0.0, 0.5])), 1)
        
        records.append({
            "task_id": f"TSK-{dept[:3].upper()}-{i:04d}",
            "section_id": sec_id,
            "department": dept,
            "defect_type": template["defect_type"],
            "severity": template["severity"],
            "reported_date": reported_date.strftime("%Y-%m-%d"),
            "due_date": due_date.strftime("%Y-%m-%d"),
            "days_overdue": days_overdue,
            "estimated_duration_hours": duration,
            "required_crews": template["crews"],
            "required_machinery": template["machinery"],
            "safety_risk_flag": template["safety_flag"],
            "punctuality_impact_score": template["punctuality_impact"],
            "is_emergency": False,
            "notes": f"Generated synthetic maintenance order for {template['defect_type']}"
        })
        
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    from generate_network import generate_network_df
    sec_df = generate_network_df()
    df = generate_defects_df(sec_df, count=60)
    df.to_csv("data/samples/defects_tasks.csv", index=False)
    print(f"Generated {len(df)} synthetic defect tasks.")
