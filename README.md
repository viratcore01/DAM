# 🛡️ DamSafe Twin

**Operational Emergency Action Plan and Real-Time Decision-Support Platform for Dam-Break Preparedness**

> Smart India Hackathon 2026 — Problem Statement SIH26161 (Dam Break Inundation Modelling)
> Sponsoring Organisation: National Technical Research Organisation (NTRO)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND (React + TypeScript)                                       │
│  MapLibre (2D) · CesiumJS (3D) · Time Slider · Report Viewer         │
│  Modules: Incident Console | EAP Dashboard | Scenario Manager |      │
│           Alert Console | Evacuation Planner | Report Generator      │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS / WebSocket
┌───────────────────────────────▼─────────────────────────────────────┐
│  BACKEND (FastAPI + Python)                                          │
│  Auth (Keycloak OIDC) · Scenarios · Simulation · Impact Analysis     │
│  GIS Pipeline · Reports (PDF) · Alerts · Audit Trail                 │
└───────────┬───────────────────────────────────────────┬─────────────┘
            │ Celery Workers                             │
            ▼                                            ▼
   ┌─────────────────┐                    ┌──────────────────────┐
   │ Redis (Broker)   │                    │ PostgreSQL + PostGIS │
   └─────────────────┘                    │ MinIO (S3)           │
                                          └──────────────────────┘
```

## 📁 Project Structure

```
damsafe-twin/
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Async SQLAlchemy + PostGIS
│   │   ├── models.py            # ORM models (all tables)
│   │   ├── s3_client.py         # MinIO/S3 object storage
│   │   ├── worker.py            # Celery worker + tasks
│   │   ├── auth/                # OIDC + RBAC
│   │   ├── scenarios/           # Scenario lifecycle
│   │   ├── simulation/          # Solver orchestration
│   │   ├── impact/              # Hazard index, evacuation priority
│   │   ├── gis/                 # DEM conditioning, quality grading
│   │   ├── reports/             # PDF generation
│   │   ├── alerts/              # Draft/approve/dispatch gate
│   │   ├── audit/               # Immutable audit log
│   │   └── api/v1/              # REST routers
│   ├── migrations/              # Alembic migrations
│   ├── init_db.py               # Database init + seed data
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                     # React + TypeScript frontend
│   ├── src/
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Router
│   │   ├── api/client.ts        # API client
│   │   ├── types/index.ts       # TypeScript types
│   │   ├── i18n/                # EN + HI translations
│   │   ├── components/          # Layout, shared components
│   │   ├── modules/             # 6 frontend modules
│   │   │   ├── incident-console/
│   │   │   ├── eap-dashboard/
│   │   │   ├── scenario-manager/
│   │   │   ├── alert-console/
│   │   │   ├── evacuation-planner/
│   │   │   └── report-generator/
│   │   └── viewers/
│   │       ├── maplibre-2d-map/ # 2D flood visualization
│   │       └── cesium-3d-twin/  # 3D digital twin
│   └── Dockerfile
├── solver-workers/               # Hydrodynamic solver adapters
│   ├── educational-swe/         # Educational 2D SWE solver
│   └── hecras-adapter/          # HEC-RAS adapter stub
├── 3d-assets/                    # 3D dam model pipeline
│   ├── procedural-generator/    # Path B: parametric mesh
│   └── cad-import/              # Path A: real geometry
├── infra/
│   └── docker-compose.yml       # Full stack orchestration
├── docs/
│   ├── provenance-schema.md
│   └── validation-report-template.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Node.js 20+

### 1. Start Infrastructure
```bash
cd damsafe-twin/infra
docker compose up -d postgres redis minio
```

### 2. Initialize Database
```bash
cd damsafe-twin/backend
pip install -r requirements.txt
python init_db.py
```

### 3. Start Backend
```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Start Frontend
```bash
cd damsafe-twin/frontend
npm install
npm run dev
```

### 5. Full Stack (Docker Compose)
```bash
cd damsafe-twin/infra
docker compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/docs
- MinIO Console: http://localhost:9001 (minioadmin/minioadmin)
- Keycloak: http://localhost:8080 (admin/admin)
- PgAdmin: http://localhost:5050

## 🎯 Case Study: Machhu Dam, Morbi (Demo)

The MVP is pre-configured with a demonstration case study:

| Parameter | Value |
|-----------|-------|
| Dam | Machhu Dam (Demo — Morbi, Gujarat) |
| Type | Earthen Embankment |
| Height | 35.0 m |
| Crest Length | 1,600 m |
| Reservoir Capacity | 120 MCM |
| DEM | CartoDEM 30m (Prototype grade) |
| Scenarios | Overtopping (Expected) + Piping (Conservative) |
| Villages at Risk | 8 (including Morbi City, pop. 210,000) |

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/scenarios` | Create scenario | Operator+ |
| POST | `/api/v1/scenarios/{id}/submit` | Submit for approval | Analyst+ |
| POST | `/api/v1/scenarios/{id}/approve` | Approve + lock | Approver |
| GET | `/api/v1/scenarios/{id}/results` | Fetch precomputed layers | Viewer+ |
| POST | `/api/v1/sim-runs/{id}/enqueue` | Enqueue solver job | Analyst+ |
| GET | `/api/v1/impact/{id}/priority` | Evacuation priority list | Viewer+ |
| GET | `/api/v1/impact/{id}/roads?t=180` | Road passability at t=180m | Viewer+ |
| POST | `/api/v1/alerts/{id}/draft` | Generate alert | Operator+ |
| POST | `/api/v1/alerts/{id}/approve` | Human authorisation gate | Approver |
| POST | `/api/v1/alerts/{id}/dispatch` | Dispatch (blocked if not approved) | Approver |
| GET | `/api/v1/reports/{id}/pdf` | One-click EAP PDF | Viewer+ |
| GET | `/api/v1/audit` | Audit trail query | Analyst+ |

## 🔒 Security

- **AuthN:** Keycloak OIDC, MFA for approver/admin
- **AuthZ:** RBAC per route, DB CHECK constraints on approval gates
- **Audit:** Append-only `audit_log` with DB-level write protection
- **Human Gate:** Alert dispatch requires `approved_by IS NOT NULL` (enforced at DB level)

## 🌐 i18n

Bilingual support: English + Hindi for key screens and alert templates.

## 📊 Validation

- Analytical benchmark: 1D Ritter dam-break solution
- Cross-model comparison: IoU, RMSE, arrival-time error vs HEC-RAS/TELEMAC
- Sensitivity analysis: DEM resolution, Manning's n, breach parameters

## ⚠️ Disclaimer

> This demonstration provides a **planning and screening prototype**. Operational use requires
> agency-authorized input data, calibrated model parameters, surveyed terrain/bathymetry,
> independent engineering review, and formal EAP approval.

---

**Built for Smart India Hackathon 2026 | NTRO SIH26161**
