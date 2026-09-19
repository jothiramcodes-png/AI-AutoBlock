# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import pandas as pd
from backend.app.database import load_table_df, save_table_df
from backend.app.models.schemas import DefectTaskSchema, TaskWithScore
from backend.app.ml.scorer import compute_priority_score

router = APIRouter(prefix="/api/defects", tags=["Defects & Maintenance Tasks"])

@router.get("", response_model=List[TaskWithScore])
def list_defects(
    department: Optional[str] = Query(None, description="Filter by department: Engineering, Traction, S&T"),
    severity: Optional[str] = Query(None, description="Filter by severity: Critical, Major, Minor"),
    section_id: Optional[str] = Query(None, description="Filter by section ID")
):
    """Returns maintenance tasks and defects with transparent explainability factor breakdowns."""
    defects_df = load_table_df("defects")
    sections_df = load_table_df("sections")
    sec_tier_map = {row["section_id"]: row["tier"] for _, row in sections_df.iterrows()}
    
    if department:
        defects_df = defects_df[defects_df["department"] == department]
    if severity:
        defects_df = defects_df[defects_df["severity"] == severity]
    if section_id:
        defects_df = defects_df[defects_df["section_id"] == section_id]
        
    results = []
    for _, row in defects_df.iterrows():
        tier = sec_tier_map.get(row["section_id"], "Tier-2 Main")
        score, breakdown = compute_priority_score(
            severity=row["severity"],
            tier=tier,
            days_overdue=int(row["days_overdue"]),
            safety_risk_flag=bool(row["safety_risk_flag"]),
            punctuality_impact_score=float(row["punctuality_impact_score"]),
            defect_type=row["defect_type"]
        )
        
        task_dict = row.to_dict()
        task_dict["priority_score"] = score
        task_dict["score_breakdown"] = breakdown
        task_dict["safety_risk_flag"] = bool(row["safety_risk_flag"])
        task_dict["is_emergency"] = bool(row.get("is_emergency", False))
        results.append(TaskWithScore(**task_dict))
        
    # Sort descending by priority score
    results.sort(key=lambda x: x.priority_score, reverse=True)
    return results

@router.post("", response_model=TaskWithScore)
def create_defect(task: DefectTaskSchema):
    """Ingests a new defect or emergency maintenance task."""
    defects_df = load_table_df("defects")
    sections_df = load_table_df("sections")
    
    if task.task_id in defects_df["task_id"].values:
        raise HTTPException(status_code=400, detail=f"Task ID {task.task_id} already exists")
    if task.section_id not in sections_df["section_id"].values:
        raise HTTPException(status_code=400, detail=f"Invalid section ID {task.section_id}")
        
    new_row = pd.DataFrame([task.model_dump()])
    updated_df = pd.concat([defects_df, new_row], ignore_index=True)
    save_table_df(updated_df, "defects")
    
    sec_tier_map = {row["section_id"]: row["tier"] for _, row in sections_df.iterrows()}
    tier = sec_tier_map.get(task.section_id, "Tier-2 Main")
    
    score, breakdown = compute_priority_score(
        severity=task.severity,
        tier=tier,
        days_overdue=task.days_overdue,
        safety_risk_flag=task.safety_risk_flag,
        punctuality_impact_score=task.punctuality_impact_score,
        defect_type=task.defect_type
    )
    
    res = task.model_dump()
    res["priority_score"] = score
    res["score_breakdown"] = breakdown
    return TaskWithScore(**res)
