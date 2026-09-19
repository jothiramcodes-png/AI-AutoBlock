# Enterprise Architecture & Integration Specification
## AI-Powered Automatic Block Planning System (SIH PS ID 26027)

> **DATA NOTICE**:
> **SYNTHETIC / SIMULATED DATA — NOT INDIAN RAILWAYS OPERATIONAL DATA.**
> The current hackathon prototype operates on high-fidelity synthetic datasets. This document outlines the proposed production-grade enterprise integration blueprint for live deployment across Indian Railways zones and divisions.

---

### 1. Executive Summary & Problem Context

In Indian Railways, maintenance of fixed infrastructure is handled by three distinct engineering departments:
1. **Civil Engineering (Track / P-Way)**: Rail fractures, deep screening, track tamping, turnout renewals.
2. **Traction Distribution (TRD / Electrical)**: 25kV Overhead Equipment (OHE) wire wear, neutral sections, cantilever staggers, substation maintenance.
3. **Signal & Telecommunication (S&T)**: Electronic Interlocking (EI), Point machines, Digital Axle Counters (DAC), automatic block signalling circuits.

Currently, these departments request track possessions independently through **BDMS** (Block Demand Management System). Because each department plans in isolation:
- Same corridor sections are closed repeatedly on different days.
- Joint consolidation opportunities are missed.
- Line throughput and freight train speeds suffer severe degradation.
- Operational controllers manually broker disputes under time pressure.

This system replaces manual, decentralized block requests with an **AI-Assisted, Constraint-Optimized Joint Block Scheduling Engine** powered by **Google OR-Tools CP-SAT**.

---

### 2. High-Level Enterprise Integration Architecture

```mermaid
flowchart TD
    subgraph Indian_Railways_Enterprise_Systems [Indian Railways Enterprise Systems]
        TMS[TMS: Track Management System\n- Ultrasonic Rail Defect Testing\n- Track Geometry Car Data\n- Overdue Tamping / LWR Restressing]
        SMMS[SMMS: Signalling Maintenance Mgmt\n- Point Machine Failures\n- Axle Counter Track Drops\n- Signal Aspect Life Cycles]
        TDMS[TDMS: Traction Distribution Mgmt\n- OHE Current Contact Wear\n- Insulator Flashover Logs\n- Power Substation Overhaul]
        COA[COA: Control Office Application\n- Live Train Movement Graphs\n- Timetabled Passenger Paths\n- Corridor Block Availability Windows]
        FOIS[FOIS: Freight Operations Information\n- Goods Train Path Requests\n- Powerhouse Coal Rake Demands]
        BDMS[BDMS: Block Demand System\n- Centralized Granting Workflow]
    end

    subgraph Integration_Bus [Enterprise Integration Bus (Apache Kafka / REST Gateway)]
        EventBus[Kafka Topics:\n- `ir.tms.defects`\n- `ir.smms.faults`\n- `ir.tdms.ohe_status`\n- `ir.coa.timetables`\n- `ir.fois.freight_flow`]
    end

    subgraph AutoBlock_Core [AI AutoBlock Planning System]
        Ingestion[Data Ingestion & Integrity Validator]
        Scorer[Explainable Risk & Priority Scorer\n- Safety Risk (30%)\n- Defect Severity (25%)\n- Asset Tier (20%)\n- Days Overdue (15%)\n- Delay Impact (6%)\n- Failure History (4%)]
        CPSAT[Google OR-Tools CP-SAT Optimizer\n- Joint Consolidation\n- Crew / Resource Limits\n- Corridor Availability Protection]
        DiffEngine[Differential Re-Optimizer / What-If Engine]
        AuditLog[(PostgreSQL / Audit Repository)]
    end

    subgraph Command_Dashboard [Mission-Control Operations UI]
        GanttUI[Corridor Gantt Timeline]
        ExplainUI[Explainability Drawer]
        OverrideUI[Manual Lock & Override Modal]
        WhatIfUI[Contingency Simulator]
    end

    TMS --> EventBus
    SMMS --> EventBus
    TDMS --> EventBus
    COA --> EventBus
    FOIS --> EventBus

    EventBus --> Ingestion
    Ingestion --> Scorer
    Scorer --> CPSAT
    CPSAT --> DiffEngine
    CPSAT --> AuditLog
    CPSAT --> BDMS

    DiffEngine --> GanttUI
    CPSAT --> GanttUI
    Scorer --> ExplainUI
    OverrideUI -->|Hard Lock Constraint| CPSAT
    WhatIfUI -->|Emergency Injection| CPSAT
```

---

### 3. System Data Contracts & Ingestion Specifications

In production, the system consumes messages from standard railway IT systems via Kafka topics or REST webhooks:

#### A. TMS (Track Management System) Contract
- **Topic**: `ir.tms.defects.v1`
- **Schema Payload**:
  ```json
  {
    "event_id": "EVT-TMS-90821",
    "timestamp": "2026-09-16T12:00:00Z",
    "section_id": "SEC-001",
    "track_number": "UP_MAIN",
    "defect_classification": "IMR_RAIL_FRACTURE",
    "severity": "CRITICAL",
    "usfd_flaw_detected": true,
    "speed_restriction_imposed_kmh": 30,
    "statutory_compliance_due": "2026-09-18",
    "estimated_repair_hours": 3.5,
    "required_machinery": "AFTD_WELDER"
  }
  ```

#### B. TDMS (Traction Distribution Management System) Contract
- **Topic**: `ir.tdms.maintenance.v1`
- **Schema Payload**:
  ```json
  {
    "event_id": "EVT-TDMS-4412",
    "section_id": "SEC-001",
    "ohe_subdivision": "GZB_TRD",
    "defect_type": "OHE_CONTACT_WIRE_PARTING",
    "power_block_required": true,
    "traffic_block_required": true,
    "voltage_level_kv": 25.0,
    "crew_requirement": 2,
    "tower_wagon_required": true
  }
  ```

#### C. COA (Control Office Application) Contract
- **Topic**: `ir.coa.corridor_windows.v1`
- **Schema Payload**:
  ```json
  {
    "corridor_id": "SEC-001",
    "date": "2026-09-17",
    "lull_window_start": "01:30",
    "lull_window_end": "04:30",
    "passenger_trains_path_impact": 0,
    "freight_paths_available": 2
  }
  ```

---

### 4. Mathematical Formulation: Google OR-Tools CP-SAT

The scheduling engine formulates block allocation as a mixed-integer constraint satisfaction problem:

#### Decision Variables:
1. $x_{t, w} \in \{0, 1\}$: Task $t$ assigned to block window $w$.
2. $y_{w} \in \{0, 1\}$: Window $w$ is active (track is closed to commercial traffic).
3. $c_{w} \in \{0, 1\}$: Joint consolidation flag (window $w$ contains $\ge 2$ departments).
4. $u_{t} \in \{0, 1\}$: Task $t$ is unscheduled ($u_t = 1 - \sum_w x_{t, w}$).

#### Hard Operational Constraints:
1. **Section and Duration Admissibility**:
   $$x_{t, w} = 0 \quad \forall w \text{ where } \text{section}(w) \ne \text{section}(t) \lor \text{duration}(w) < \text{duration}(t)$$
2. **At Most One Window per Task**:
   $$\sum_{w} x_{t, w} \le 1 \quad \forall t$$
3. **Department Crew Resource Limits**:
   $$\sum_{t \in \text{Dept}_d} \text{crews}(t) \cdot x_{t, w} \le \text{CrewLimit}_d \quad \forall w, \forall d$$
4. **Corridor Maximum Block Frequency (Freight Protection)**:
   $$\sum_{w \in \text{Windows}(s)} y_w \le \text{MaxAllowedWeeklyBlocks}_s \quad \forall s$$
5. **Officer Locks (Human-in-the-Loop)**:
   $$x_{t, w} = 1 \quad \forall (t, w) \in \text{ManualLocks}$$
6. **Task Incompatibility Matrix**:
   $$x_{t_1, w} + x_{t_2, w} \le 1 \quad \forall (t_1, t_2) \in \text{IncompatiblePairs}, \forall w$$

#### Objective Function:
$$\max \sum_{t, w} 100 \cdot \text{Priority}_t \cdot x_{t, w} + 1500 \sum_{w} c_w - 50 \sum_{w} \text{PaxImpact}_w \cdot y_w - 200 \sum_t \text{Priority}_t \cdot u_t$$

---

### 5. Deployment Topology

- **Backend Microservice**: Python FastAPI container with multi-threaded OR-Tools C++ binary bindings.
- **Relational / Temporal Storage**: PostgreSQL with TimescaleDB extension for high-velocity defect logs and immutable audit tables.
- **Message Broker**: Redpanda / Apache Kafka for real-time TMS/SMMS/TDMS/COA event ingestion.
- **Frontend Dashboard**: React Single Page Application (SPA) delivered via NGINX with WebSocket connections for real-time re-optimization notifications.
