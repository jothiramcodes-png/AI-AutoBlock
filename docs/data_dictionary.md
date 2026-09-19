# Data Dictionary & Schema Specification
## AI-Powered Automatic Block Planning System (SIH PS ID 26027)

> **DATA NOTICE**:
> **SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA.**
> All datasets, route section identifiers, defects, timetables, and historical logs are synthetic representations created with deterministic seed `42` for benchmarking and prototype evaluation.

---

### 1. `sections` (Corridor Infrastructure Network)

| Column Name | Data Type | Nullable | Description & Domain Rules |
|---|---|---|---|
| `section_id` | `VARCHAR(16)` | NO | Primary Key. Unique corridor identifier (e.g. `SEC-001`, `SEC-002`). |
| `name` | `VARCHAR(128)` | NO | Section name (e.g. `New Delhi (NDLS) - Ghaziabad (GZB)`). |
| `division` | `VARCHAR(64)` | NO | Railway division (e.g. `Delhi`, `Prayagraj`, `Agra`). |
| `zone` | `VARCHAR(64)` | NO | Railway zone (e.g. `Northern Railway`, `North Central Railway`). |
| `tier` | `VARCHAR(32)` | NO | Route criticality tier: `Tier-1 Trunk`, `Tier-2 Main`, `Tier-3 Branch`. |
| `speed_limit_kmh` | `INTEGER` | NO | Maximum permissible speed in km/h (`75` to `160`). |
| `daily_gmt` | `FLOAT` | NO | Gross Million Tonnes of annual traffic density. |
| `length_km` | `FLOAT` | NO | Section length in route kilometers. |
| `num_tracks` | `INTEGER` | NO | Number of running lines (`1` single, `2` double, `3` or `4` quad). |
| `max_weekly_block_hours` | `FLOAT` | NO | Maximum allowable total maintenance closure hours per week. |
| `description` | `TEXT` | YES | Operational description and corridor role. |

---

### 2. `defects` (Maintenance Tasks & Defect Inventory)

| Column Name | Data Type | Nullable | Description & Domain Rules |
|---|---|---|---|
| `task_id` | `VARCHAR(32)` | NO | Primary Key (e.g. `TSK-ENG-0001`, `TSK-TRD-0002`). |
| `section_id` | `VARCHAR(16)` | NO | Foreign Key referencing `sections.section_id`. |
| `department` | `VARCHAR(32)` | NO | Engineering department: `Engineering`, `Traction`, `S&T`. |
| `defect_type` | `VARCHAR(128)` | NO | Defect name (e.g. `IMR Rail Fracture Risk`, `25kV OHE Contact Wire Parting`). |
| `severity` | `VARCHAR(16)` | NO | Severity classification: `Critical`, `Major`, `Minor`. |
| `reported_date` | `DATE` | NO | Date defect was identified (YYYY-MM-DD). |
| `due_date` | `DATE` | NO | Statutory target completion deadline (YYYY-MM-DD). |
| `days_overdue` | `INTEGER` | NO | Days elapsed past due date ($\ge 0$). |
| `estimated_duration_hours`| `FLOAT` | NO | Required track closure duration in hours ($> 0.0$). |
| `required_crews` | `INTEGER` | NO | Number of concurrent gang/crew units needed ($\ge 1$). |
| `required_machinery` | `VARCHAR(64)` | YES | Specialized machinery (e.g. `CSM Tamping Machine`, `OHE Tower Wagon`). |
| `safety_risk_flag` | `BOOLEAN` | NO | Boolean flag (`True` if defect poses direct derailment or power tripping risk). |
| `punctuality_impact_score`| `FLOAT` | NO | Projected train delay impact score ($0.0$ to $100.0$). |
| `is_emergency` | `BOOLEAN` | NO | Flag indicating real-time What-If emergency injection. |
| `notes` | `TEXT` | YES | Operational remarks and work instructions. |

---

### 3. `timetable_windows` (Available Maintenance Windows)

| Column Name | Data Type | Nullable | Description & Domain Rules |
|---|---|---|---|
| `window_id` | `VARCHAR(32)` | NO | Primary Key (e.g. `WIN-SEC-001-1-001`). |
| `section_id` | `VARCHAR(16)` | NO | Foreign Key referencing `sections.section_id`. |
| `date` | `DATE` | NO | Window calendar date (YYYY-MM-DD). |
| `day_offset` | `INTEGER` | NO | Planning horizon day offset ($0$ to $6$ for weekly). |
| `start_hour` | `FLOAT` | NO | Window start time in fractional 24h format (e.g. `1.5` = 01:30). |
| `end_hour` | `FLOAT` | NO | Window end time in fractional 24h format (e.g. `4.5` = 04:30). |
| `duration_hours` | `FLOAT` | NO | Total window length in hours ($> 0.0$). |
| `traffic_density_tier` | `VARCHAR(32)` | NO | Traffic condition: `Low (Night Lull)`, `Medium (Midday)`, `High (Traffic Margin)`. |
| `passenger_trains_affected`| `INTEGER` | NO | Scheduled passenger paths traversing this section during window. |
| `is_available` | `BOOLEAN` | NO | Operational availability flag (set to False if corridor cancelled). |

---

### 4. `goods_forecast` (Freight Traffic Demand)

| Column Name | Data Type | Nullable | Description & Domain Rules |
|---|---|---|---|
| `corridor_id` | `VARCHAR(16)` | NO | Foreign Key referencing `sections.section_id`. |
| `corridor_name` | `VARCHAR(128)` | NO | Corridor section descriptive title. |
| `week_number` | `INTEGER` | NO | Operational calendar week number. |
| `projected_rakes_per_week`| `INTEGER` | NO | Expected freight train rakes traversing route. |
| `priority_freight_flag` | `BOOLEAN` | NO | Critical commodity indicator (e.g. thermal coal rakes). |
| `max_tolerable_delay_hours`| `FLOAT` | NO | Maximum buffer before supply chain penalty triggers. |
| `disruption_penalty_factor`| `FLOAT` | NO | Scaling multiplier for objective penalty ($1.0$ to $1.5$). |

---

### 5. `optimization_audit_log` (Decision & Execution Audit Trail)

| Column Name | Data Type | Nullable | Description & Domain Rules |
|---|---|---|---|
| `run_id` | `VARCHAR(64)` | NO | Primary Key. Unique audit identifier (e.g. `RUN-1726501234`). |
| `timestamp` | `TIMESTAMP` | NO | Execution timestamp in ISO format. |
| `horizon` | `VARCHAR(16)` | NO | Planning horizon (`Weekly` or `Monthly`). |
| `dataset_version` | `VARCHAR(32)` | NO | Version identifier of input data (`v1.0-synthetic`). |
| `solver_status` | `VARCHAR(16)` | NO | Solver convergence state: `OPTIMAL`, `FEASIBLE`, `INFEASIBLE`. |
| `runtime_ms` | `FLOAT` | NO | Measured wall-clock solver execution time in milliseconds. |
| `objective_value` | `FLOAT` | NO | Final objective function value computed by CP-SAT. |
| `total_tasks` | `INTEGER` | NO | Number of input defect tasks evaluated. |
| `scheduled_tasks` | `INTEGER` | NO | Tasks successfully allocated to feasible windows. |
| `unscheduled_tasks` | `INTEGER` | NO | Tasks deferred due to crew/window constraints. |
| `locked_tasks` | `INTEGER` | NO | Tasks pinned as hard constraints by human officers. |
| `data_label` | `TEXT` | NO | Standard disclaimer: `"SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA"`. |
