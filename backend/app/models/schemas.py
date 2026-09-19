# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class DepartmentEnum(str, Enum):
    ENGINEERING = "Engineering"
    TRACTION = "Traction"
    SNT = "S&T"

class SeverityEnum(str, Enum):
    CRITICAL = "Critical"  # e.g., IMR (Immediate Removal) rail fracture risk, 25kV OHE dropper snapped
    MAJOR = "Major"        # e.g., Point machine high friction, sleeper cracking
    MINOR = "Minor"        # e.g., Routine greasing, sign board cleaning

class TrackCriticalityTier(str, Enum):
    TIER_1_TRUNK = "Tier-1 Trunk"    # High speed corridor (130-160 km/h, >30 GMT)
    TIER_2_MAIN = "Tier-2 Main"      # Main line (110-130 km/h, 15-30 GMT)
    TIER_3_BRANCH = "Tier-3 Branch"  # Branch line (<110 km/h, <15 GMT)

class TaskStatusEnum(str, Enum):
    PENDING = "PENDING"
    SCHEDULED = "SCHEDULED"
    UNSCHEDULED = "UNSCHEDULED"
    COMPLETED = "COMPLETED"

class AssignmentSourceEnum(str, Enum):
    AI_GENERATED = "AI_GENERATED"
    HUMAN_LOCKED = "HUMAN_LOCKED"
    HUMAN_MODIFIED = "HUMAN_MODIFIED"

# Network Section Schema
class SectionSchema(BaseModel):
    section_id: str
    name: str
    division: str
    zone: str
    tier: TrackCriticalityTier
    speed_limit_kmh: int
    daily_gmt: float
    length_km: float
    num_tracks: int  # 1: Single, 2: Double, 3/4: Multiple lines
    max_weekly_block_hours: float
    description: str

# Maintenance / Defect Task Schema
class DefectTaskSchema(BaseModel):
    task_id: str
    section_id: str
    department: DepartmentEnum
    defect_type: str
    severity: SeverityEnum
    reported_date: str
    due_date: str
    days_overdue: int
    estimated_duration_hours: float
    required_crews: int
    required_machinery: Optional[str] = None
    safety_risk_flag: bool
    punctuality_impact_score: float = Field(..., ge=0.0, le=100.0)
    is_emergency: bool = False
    notes: Optional[str] = None

# Timetable Passenger Path / Available Block Window
class BlockWindowSchema(BaseModel):
    window_id: str
    section_id: str
    date: str  # YYYY-MM-DD
    start_hour: float  # e.g., 1.5 = 01:30
    end_hour: float    # e.g., 4.5 = 04:30
    duration_hours: float
    traffic_density_tier: str  # e.g. "Low (Night Lull)", "Medium", "High (Peak)"
    passenger_trains_affected: int
    is_available: bool = True

# Goods / Freight Train Traffic Forecast
class GoodsForecastSchema(BaseModel):
    corridor_id: str
    week_number: int
    projected_rakes: int
    priority_freight: bool  # e.g., coal to power plants
    max_tolerable_delay_hours: float

# Factor breakdown for explainability
class ScoreFactorBreakdown(BaseModel):
    safety_risk_component: float
    defect_severity_component: float
    asset_criticality_component: float
    overdue_days_component: float
    train_impact_component: float
    failure_history_component: float
    total_priority_score: float

class TaskWithScore(DefectTaskSchema):
    priority_score: float
    score_breakdown: ScoreFactorBreakdown
    status: TaskStatusEnum = TaskStatusEnum.PENDING

# Scheduled Task details
class ScheduledTaskDetail(BaseModel):
    task_id: str
    section_id: str
    department: DepartmentEnum
    defect_type: str
    severity: SeverityEnum
    priority_score: float
    window_id: str
    date: str
    start_hour: float
    end_hour: float
    duration_hours: float
    is_consolidated: bool
    consolidated_partner_tasks: List[str] = []
    assignment_source: AssignmentSourceEnum = AssignmentSourceEnum.AI_GENERATED
    placement_reason: Dict[str, Any] = {}

class UnscheduledTaskDetail(BaseModel):
    task_id: str
    department: DepartmentEnum
    defect_type: str
    severity: SeverityEnum
    priority_score: float
    reason: str
    blocking_constraints: List[str]
    suggested_action: str

# Comprehensive Schedule Plan
class OptimizationPlanResult(BaseModel):
    plan_id: str
    horizon: str  # "Weekly" or "Monthly"
    solver_status: str  # "OPTIMAL", "FEASIBLE", "INFEASIBLE", "UNKNOWN"
    runtime_ms: float
    scheduled_tasks: List[ScheduledTaskDetail]
    unscheduled_tasks: List[UnscheduledTaskDetail]
    total_tasks_count: int
    scheduled_count: int
    unscheduled_count: int
    total_block_hours_scheduled: float
    consolidated_blocks_count: int
    consolidated_hours_saved: float
    average_corridor_availability_pct: float
    critical_defects_cleared_count: int
    remaining_critical_backlog_count: int
    freight_disruption_penalty: float
    audit_run_id: str
    data_label: str = "SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA"
