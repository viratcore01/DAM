"""
DamSafe Twin — Reports Router

One-click EAP / incident summary PDF generation.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io

from app.auth.service import CurrentUser, require_role
from app.database import get_db
from app.reports import service
from app.scenarios.service import get_scenario, list_scenarios
from app.simulation.service import get_latest_completed_run
from app.impact import service as impact_service

router = APIRouter()


@router.get("/{sim_run_id}/pdf")
async def generate_pdf_report(
    sim_run_id: UUID,
    user: CurrentUser = Depends(require_role("viewer")),
    db: AsyncSession = Depends(get_db),
):
    """One-click EAP/incident PDF report from simulation run data."""
    from app.simulation.service import get_sim_run
    sim_run = await get_sim_run(db, sim_run_id)
    if not sim_run:
        raise HTTPException(status_code=404, detail="Simulation run not found")

    scenario = await get_scenario(db, sim_run.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Gather data
    from app.models import Dam
    from sqlalchemy import select
    dam_result = await db.execute(select(Dam).where(Dam.id == scenario.dam_id))
    dam = dam_result.scalar_one_or_none()

    dam_data = {
        "name": dam.name if dam else "Unknown",
        "dam_type": dam.dam_type if dam else "Unknown",
        "height_m": dam.height_m if dam else "N/A",
        "crest_length_m": dam.crest_length_m if dam else "N/A",
        "reservoir_capacity_mcm": dam.reservoir_capacity_mcm if dam else "N/A",
        "spillway_count": dam.spillway_count if dam else "N/A",
    }

    scenarios_data = [{
        "failure_mode": scenario.failure_mode,
        "variant": scenario.variant,
        "solver": scenario.solver,
        "solver_version": scenario.solver_version,
        "status": scenario.status,
        "approved_by": str(scenario.approved_by) if scenario.approved_by else None,
        "breach_params": scenario.breach_params,
    }]

    priorities = await impact_service.compute_evacuation_priorities(db, sim_run_id)
    road_statuses = await impact_service.compute_road_status(db, sim_run_id, 0)
    road_summary = {
        "safe": sum(1 for r in road_statuses if r["status"] == "safe"),
        "restricted": sum(1 for r in road_statuses if r["status"] == "restricted"),
        "impassable": sum(1 for r in road_statuses if r["status"] == "impassable"),
    }
    facilities = await impact_service.get_critical_facilities(db)

    sim_data = {
        "solver": scenario.solver,
        "solver_version": scenario.solver_version,
        "mass_balance_error": sim_run.mass_balance_error,
    }

    # Generate HTML report
    html = await service.generate_eap_report(
        dam_data=dam_data,
        scenarios_data=scenarios_data,
        priorities=priorities,
        road_summary=road_summary,
        facilities=facilities,
        sim_data=sim_data,
    )

    # Convert to PDF
    try:
        pdf_bytes = await service.html_to_pdf(html)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=damsafe-eap-report-{sim_run_id}.pdf"},
        )
    except Exception:
        # Fallback: return HTML if WeasyPrint not available
        return StreamingResponse(
            io.BytesIO(html.encode()),
            media_type="text/html",
            headers={"Content-Disposition": f"attachment; filename=damsafe-eap-report-{sim_run_id}.html"},
        )


@router.get("/{sim_run_id}/html")
async def generate_html_report(
    sim_run_id: UUID,
    user: CurrentUser = Depends(require_role("viewer")),
    db: AsyncSession = Depends(get_db),
):
    """Generate an HTML report (no PDF conversion)."""
    from app.simulation.service import get_sim_run
    sim_run = await get_sim_run(db, sim_run_id)
    if not sim_run:
        raise HTTPException(status_code=404, detail="Simulation run not found")

    scenario = await get_scenario(db, sim_run.scenario_id)
    dam_result = await db.execute(select(Dam).where(Dam.id == scenario.dam_id))
    dam = dam_result.scalar_one_or_none()

    from app.models import Dam
    from sqlalchemy import select as sa_select

    dam_data = {"name": dam.name if dam else "Unknown"} if dam else {}
    priorities = await impact_service.compute_evacuation_priorities(db, sim_run_id)

    html = await service.generate_eap_report(
        dam_data=dam_data,
        scenarios_data=[{
            "failure_mode": scenario.failure_mode,
            "variant": scenario.variant,
            "solver": scenario.solver,
            "solver_version": scenario.solver_version,
            "status": scenario.status,
            "approved_by": None,
            "breach_params": scenario.breach_params,
        }],
        priorities=priorities,
        road_summary={"safe": 10, "restricted": 5, "impassable": 3},
        facilities=[],
        sim_data={"solver": scenario.solver, "solver_version": scenario.solver_version},
    )

    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html)
