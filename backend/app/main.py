# SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA
"""
FastAPI Main Application.
AI-Powered Automatic Block Planning System (SIH PS ID 26027, Ministry of Railways).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.routes_network import router as network_router
from backend.app.api.routes_defects import router as defects_router
from backend.app.api.routes_optimizer import router as optimizer_router

app = FastAPI(
    title="AI-Powered Automatic Block Planning System (SIH PS ID 26027)",
    description="Constraint-optimized, explainable automatic block planning system for Indian Railways infrastructure maintenance. NOTE: SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(network_router)
app.include_router(defects_router)
app.include_router(optimizer_router)

@app.get("/api/health")
def health_check():
    """System health check endpoint."""
    return {"status": "ok"}

@app.get("/")
def root():
    return {
        "system": "AI-Powered Automatic Block Planning System (SIH 26027)",
        "status": "online",
        "documentation": "/docs",
        "data_notice": "SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
