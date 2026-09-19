# AI-Powered Automatic Block Planning System (SIH PS ID 26027)

> **PROJECT CLASSIFICATION & COMPLIANCE NOTICE**:
> **An SIH hackathon prototype demonstrating AI-assisted, constraint-optimized automatic block planning using realistic synthetic railway maintenance and traffic data.**
>
> **DATA NOTICE**:
> **SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA.**
> This prototype does not connect to live Indian Railways production systems (TMS, SMMS, TDMS, COA, BDMS, FOIS). All corridor sections, maintenance orders, and timetables are synthetic representations generated using deterministic random seed (`seed=42`).

---

## 1. Problem Statement & Operational Solution

In Indian Railways, maintenance of track infrastructure (**Engineering**), overhead 25kV traction lines (**Traction/TRD**), and signalling & interlocking circuits (**S&T**) is requested independently by each department through the Block Demand Management System (**BDMS**).

Because each department plans in a silo:
1. **Corridors are repeatedly closed**: The same section may be blocked on Monday for track tamping and again on Wednesday for OHE wire adjustments.
2. **Line capacity is wasted**: Track downtime multiplies, delaying freight trains and passenger services.
3. **Manual conflict arbitration**: Section controllers manually negotiate overlapping requests under operational pressure.

### The AI-AutoBlock Solution
This prototype unifies cross-departmental demands using:
- **Explainable Multi-Factor Prioritization Scorer**: Evaluates safety hazard (30 pts), defect severity (25 pts), track speed/GMT tier (20 pts), overdue days (15 pts), delay impact (6 pts), and failure history correlation (4 pts).
- **Google OR-Tools CP-SAT Scheduling Core**: Mathematical constraint satisfaction engine that enforces crew capacities, non-overlap, traffic protection, and automatically consolidates compatible multi-department tasks into shared **Joint Blocks**.
- **Honest Baseline vs. Optimized Evaluator**: Directly computes track closure hours saved, downtime reduction percentage, and freight protection metrics with zero hard-coded or fabricated numbers.
- **Mission-Control Operations UI**: Interactive React Gantt timeline, multi-department conflict matrix, explainability drawer, and real-time What-If contingency re-optimization.

---

## 2. Project Architecture & Directory Structure

```
d:/sih_railway/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_defects.py       # Defect listing & explainability factor breakdowns
│   │   │   ├── routes_network.py       # Corridor sections, windows & goods forecast
│   │   │   └── routes_optimizer.py     # CP-SAT solver, What-If & manual overrides
│   │   ├── ml/
│   │   │   ├── scorer.py               # Rule-based explainable scorer (Score = Sum Factors)
│   │   │   └── ranker.py               # Scikit-learn Gradient Boosting ranker with fallback
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic domain models with typed validation
│   │   ├── optimizer/
│   │   │   ├── baseline_scheduler.py   # Decentralized BDMS simulator (siloed requests)
│   │   │   ├── cp_sat_scheduler.py     # Google OR-Tools CP-SAT joint optimization core
│   │   │   └── evaluator.py            # Calculated comparative KPI delta engine
│   │   ├── database.py                 # SQLite persistence & audit trail connection
│   │   └── main.py                     # FastAPI application with CORS & health endpoint
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Operations header with simulation disclaimer
│   │   │   ├── KPISummaryCards.tsx     # Calculated delta cards vs baseline
│   │   │   ├── GanttTimeline.tsx       # Corridor Gantt matrix with joint & pinned badges
│   │   │   ├── ConflictResolutionView.tsx # Multi-department conflict resolution view
│   │   │   ├── TaskTable.tsx           # Searchable & filterable defect backlog
│   │   │   ├── ExplainabilityDrawer.tsx# Factor bar decomposition & placement audit
│   │   │   ├── WhatIfSimulator.tsx     # Emergency contingency injector & diff viewer
│   │   │   └── AuditTrailView.tsx      # Immutable optimization execution log
│   │   ├── services/
│   │   │   └── api.ts                  # Typed client service
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript domain interfaces
│   │   ├── App.tsx                     # Main layout and state container
│   │   └── index.css                   # Tailwind v4 dark railway mission-control theme
│   ├── package.json
│   └── vite.config.ts
├── data/
│   ├── generators/
│   │   ├── generate_network.py         # 12 high-density corridor sections
│   │   ├── generate_defects.py         # 60 synthetic maintenance defects (seed=42)
│   │   ├── generate_timetable.py       # Corridor maintenance windows & passenger paths
│   │   ├── generate_goods_forecast.py  # Freight train rake demand projections
│   │   ├── generate_historical_blocks.py# 500 historical logs for ranker calibration
│   │   └── seed_all.py                 # Master seed orchestrator & schema validator
│   ├── samples/                        # Generated CSVs
│   └── railway_blocks.db               # Populated SQLite database
├── docs/
│   ├── architecture.md                 # Live IR enterprise integration blueprint (Kafka/REST)
│   ├── data_dictionary.md              # Complete dataset schema specification
│   └── demo_script.md                  # 3-5 minute winning hackathon presentation script
├── tests/                              # Automated test suites across all 10 stages (29 tests)
│   ├── test_stage1_data.py
│   ├── test_stage2_scoring.py
│   ├── test_stage3_baseline.py
│   ├── test_stage4_optimizer.py
│   ├── test_stage5_evaluator.py
│   ├── test_stage6_api.py
│   ├── test_stage8_whatif.py
│   ├── test_stage9_override_audit.py
│   └── test_stage10_e2e.py
└── README.md
```

---

## 3. Technologies & Versions Used

- **Optimization Core**: Google OR-Tools `v9.15.6755` (CP-SAT Solver)
- **Backend API**: Python `3.14.5`, FastAPI `v0.138.1`, Uvicorn `v0.49.0`, Pydantic `v2.13.4`, SQLAlchemy `v2.0.52`
- **Machine Learning**: Scikit-Learn `v1.9.0`, NumPy `v2.4.6`, Pandas `v3.0.5`, Joblib `v1.5.3`
- **Frontend Dashboard**: React `19.2`, TypeScript `v5.9`, Vite `v8.3.0`, Tailwind CSS `v4.2`, Lucide React `v1.16`
- **Testing**: Pytest `v9.1.1`, HTTPX `v0.28.1`

---

## 4. Quick Start & Execution Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js v18+ & npm (tested on Node v24.16 & npm 11.13)

### Step 1: Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### Step 2: Generate Synthetic Data & Seed Database
```bash
python data/generators/seed_all.py
```
*Output*: Generates sample CSVs in `data/samples/` and seeds `data/railway_blocks.db` with deterministic seed `42`.

### Step 3: Run Automated Test Suite (29 Tests Across All Stages)
```bash
python -m pytest tests/
```
*Expected Result*: `29 passed in ~100s` with 100% pass rate.

### Step 4: Launch Backend API Server
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Health Check: `http://localhost:8000/api/health` $\rightarrow$ `{"status": "ok"}`
- Interactive Swagger UI: `http://localhost:8000/docs`

### Step 5: Launch React Mission-Control Dashboard
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open browser at: **`http://localhost:5173`**

---

## 5. Mathematical CP-SAT Formulation

### Decision Variables
- $x_{t, w} \in \{0, 1\}$: Binary variable indicating if task $t$ is scheduled in block window $w$.
- $y_{w} \in \{0, 1\}$: Binary variable indicating if window $w$ is active (track is closed to traffic).
- $c_{w} \in \{0, 1\}$: Binary variable indicating joint consolidation ($\ge 2$ departments active in window $w$).
- $u_{t} \in \{0, 1\}$: Binary variable indicating task $t$ is unscheduled ($u_t = 1 - \sum_w x_{t, w}$).

### Hard Constraints
1. **Section & Duration Match**: Task $t$ can only be assigned to a window on its own section with duration $\ge$ task duration:
   $$x_{t, w} = 0 \quad \forall w \text{ where } \text{section}(w) \ne \text{section}(t) \lor \text{duration}(w) < \text{duration}(t)$$
2. **At Most One Window**: $\sum_{w} x_{t, w} \le 1 \quad \forall t$.
3. **Department Concurrent Crew Limits**:
   $$\sum_{t \in \text{Dept}_d} \text{crews}(t) \cdot x_{t, w} \le \text{CrewLimit}_d \quad \forall w, \forall d$$
4. **Corridor Maximum Block Frequency (Freight Protection)**:
   $$\sum_{w \in \text{Windows}(s)} y_w \le \text{MaxAllowedWeeklyBlocks}_s \quad \forall s$$
5. **Officer Locks (Human-in-the-Loop Override)**:
   $$x_{t, w} = 1 \quad \forall (t, w) \in \text{ManualLocks}$$
6. **Task Incompatibility Mutual Exclusion**:
   $$x_{t_1, w} + x_{t_2, w} \le 1 \quad \forall (t_1, t_2) \in \text{IncompatiblePairs}, \forall w$$

### Multi-Objective Function
$$\max \sum_{t, w} 100 \cdot \text{Priority}_t \cdot x_{t, w} + 1500 \sum_{w} c_w - 50 \sum_{w} \text{PaxImpact}_w \cdot y_w - 200 \sum_t \text{Priority}_t \cdot u_t$$

---

## 6. Baseline vs. Optimized Methodology

Both schedulers run against the **exact same input dataset**:
- **Baseline (Decentralized BDMS)**: Simulates current Indian Railways practice. Engineering, Traction, and S&T plan blocks independently. Overlapping demands result in separate consecutive closures, multiplying line downtime.
- **Optimized (AI CP-SAT)**: Jointly solves constraints and consolidates cross-department work into shared block windows. For joint blocks, total track downtime is $\max_{t \in w}(\text{duration}_t)$ instead of $\sum \text{duration}_t$.

### Honest Calculated Formulas:
- $\text{Total Block Hours} = \sum_{w \text{ active}} \max_{t \in w}(\text{duration}_t)$
- $\text{Block Hours Saved} = \text{Baseline Block Hours} - \text{Optimized Block Hours}$
- $\text{Downtime Reduction \%} = (\text{Block Hours Saved} / \text{Baseline Block Hours}) \times 100\%$
- $\text{Consolidation Rate \%} = (\text{Joint Blocks Count} / \text{Total Active Windows}) \times 100\%$
- $\text{Solver Runtime} = \text{Measured wall-clock execution time in milliseconds}$

---

## 7. Known Limitations & Future Scope

1. **Synthetic Data**: The prototype uses synthetic datasets clearly labeled as such. Production deployment requires live API adapters to TMS, SMMS, TDMS, COA, and BDMS as specified in `docs/architecture.md`.
2. **Timetable Granularity**: Current prototype models corridor availability in discrete maintenance windows. Production integration will consume live dynamic train path graphs directly from COA.
3. **Single Division Horizon**: Demonstrates 12 corridor sections over weekly (7-day) and monthly (30-day) horizons. Can scale horizontally across Indian Railways' 70 divisions.
