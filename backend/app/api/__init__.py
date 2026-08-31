"""
DamSafe Twin — API v1 Router

Aggregates all module routers under a single prefix.
"""

from fastapi import APIRouter
from app.api.v1 import scenarios, sim_runs, impact, alerts, reports, audit, dams, gis

api_router = APIRouter()

api_router.include_router(dams.router, prefix="/dams", tags=["Dams"])
api_router.include_router(scenarios.router, prefix="/scenarios", tags=["Scenarios"])
api_router.include_router(sim_runs.router, prefix="/sim-runs", tags=["Simulation Runs"])
api_router.include_router(impact.router, prefix="/impact", tags=["Impact Analysis"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(audit.router, prefix="/audit", tags=["Audit"])
api_router.include_router(gis.router, prefix="/gis", tags=["GIS & Data"])
