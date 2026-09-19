# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
from fastapi import APIRouter
from typing import List
from backend.app.database import load_table_df
from backend.app.models.schemas import SectionSchema, BlockWindowSchema, GoodsForecastSchema

router = APIRouter(prefix="/api/network", tags=["Network & Corridor Infrastructure"])

@router.get("/sections", response_model=List[SectionSchema])
def get_sections():
    """Returns all railway corridor sections with track tiers and block parameters."""
    df = load_table_df("sections")
    return df.to_dict(orient="records")

@router.get("/windows", response_model=List[BlockWindowSchema])
def get_windows():
    """Returns available maintenance block windows across corridor sections."""
    df = load_table_df("timetable_windows")
    return df.to_dict(orient="records")

@router.get("/goods-forecast", response_model=List[GoodsForecastSchema])
def get_goods_forecast():
    """Returns freight traffic demand projections per corridor."""
    df = load_table_df("goods_forecast")
    return df.to_dict(orient="records")
