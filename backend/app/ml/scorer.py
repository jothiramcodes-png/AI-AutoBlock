# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
Explainable Rule-Based Prioritization Scorer.
Computes a transparent 0 - 100 priority score for railway maintenance tasks.
Every score provides an exact factor-level decomposition:
Total Score = Safety Risk + Defect Severity + Asset Criticality + Days Overdue + Delay Impact + Failure History
"""
from typing import Dict, Any, Tuple
from backend.app.models.schemas import ScoreFactorBreakdown

def compute_priority_score(
    severity: str,
    tier: str,
    days_overdue: int,
    safety_risk_flag: bool,
    punctuality_impact_score: float,
    defect_type: str = ""
) -> Tuple[float, ScoreFactorBreakdown]:
    """
    Computes calibrated score with transparent mathematical breakdown.
    Factor Weights:
    - Safety Risk: max 30.0
    - Defect Severity: max 25.0
    - Asset Criticality: max 20.0
    - Days Overdue: max 15.0
    - Delay/Punctuality Impact: max 6.0
    - Failure History / Incident Correlation: max 4.0
    Sum maximum = 100.0
    """
    # 1. Safety Risk Component (0.0 to 30.0)
    safety_comp = 30.0 if safety_risk_flag else 5.0
    
    # 2. Defect Severity Component (5.0 to 25.0)
    if severity == "Critical":
        sev_comp = 25.0
    elif severity == "Major":
        sev_comp = 15.0
    else:
        sev_comp = 5.0
        
    # 3. Asset Criticality Component (5.0 to 20.0)
    if "Tier-1" in tier or "Trunk" in tier:
        tier_comp = 20.0
    elif "Tier-2" in tier or "Main" in tier:
        tier_comp = 12.0
    else:
        tier_comp = 5.0
        
    # 4. Days Overdue Component (0.0 to 15.0)
    # Beyond 20 days overdue reaches ceiling of 15.0
    overdue_comp = round(min(15.0, max(0.0, days_overdue * 0.75)), 2)
    
    # 5. Delay / Punctuality Impact (0.0 to 6.0)
    # Scaled from 0-100 punctuality impact score
    delay_comp = round(min(6.0, max(0.0, (punctuality_impact_score / 100.0) * 6.0)), 2)
    
    # 6. Failure History Correlation (1.0 to 4.0)
    # High-impact keywords like 'Fracture', 'Parting', 'Interlocking' get higher history penalty
    critical_keywords = ["fracture", "parting", "interlocking", "axle", "flashover"]
    if any(k in defect_type.lower() for k in critical_keywords):
        hist_comp = 4.0
    elif severity == "Major":
        hist_comp = 2.5
    else:
        hist_comp = 1.0
        
    # Calculate exact total
    total = round(safety_comp + sev_comp + tier_comp + overdue_comp + delay_comp + hist_comp, 2)
    total = min(100.0, max(0.0, total))
    
    breakdown = ScoreFactorBreakdown(
        safety_risk_component=safety_comp,
        defect_severity_component=sev_comp,
        asset_criticality_component=tier_comp,
        overdue_days_component=overdue_comp,
        train_impact_component=delay_comp,
        failure_history_component=hist_comp,
        total_priority_score=total
    )
    
    return total, breakdown
