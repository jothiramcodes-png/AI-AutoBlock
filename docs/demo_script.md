# SIH PS ID 26027 Hackathon Demo Script (3–5 Minutes)
## AI-Powered Automatic Block Planning System for Indian Railways

> **COMPLIANCE NOTICE**:
> State clearly at the start of your pitch:
> *"This prototype runs on a realistic synthetic simulation of Indian Railways infrastructure and traffic data, demonstrating how AI constraint optimization replaces manual, siloed block demands."*

---

### Timing Breakdown
- **0:00 – 0:45**: The Problem & Indian Railways Context (The Pain Point)
- **0:45 – 1:30**: Executive KPIs & Baseline vs AI-Optimized Delta
- **1:30 – 2:30**: Corridor Gantt & Cross-Department Conflict Consolidation
- **2:30 – 3:30**: Explainable AI: "Why was this task prioritized and placed here?"
- **3:30 – 4:30**: Live Contingency Demo: Emergency Defect Injection & Real Re-Optimization
- **4:30 – 5:00**: Human-in-the-Loop Override, Audit Trail & Conclusion

---

### Step-by-Step Presentation Script

#### 1. The Problem Context (0:00 – 0:45)
- **What to say**:
  > "Respected judges, Indian Railways maintains over 68,000 route kilometers. To inspect rails, overhead electric wires, and signalling circuits, tracks must be closed to trains using 'maintenance blocks'.
  > Today, Engineering, Traction (TRD), and S&T departments submit block requests independently via BDMS. This siloed process leads to duplicated track closures, wasted block hours, delayed goods trains, and manual disputes between section controllers.
  > We have built **AI-AutoBlock**: an AI-powered Automatic Block Planning System that models block scheduling as a joint constraint satisfaction problem using **Google OR-Tools CP-SAT**."
- **Screen**: Show the Executive KPIs Dashboard with the prominent simulation notice banner.

#### 2. Executive KPIs & Honest Delta (0:45 – 1:30)
- **What to click**: Point to the **Executive KPIs** top bar.
- **What to say**:
  > "Notice our executive metrics. We do not use hard-coded marketing numbers. Every single value here is computed directly from the generated operational data comparing baseline decentralized BDMS against our CP-SAT schedule:
  > - **Track Closure Hours**: Reduced substantially because joint blocks synchronize simultaneous work.
  > - **Multi-Department Consolidation**: We achieved multiple joint blocks where Track and OHE work concurrently in the same line closure.
  > - **100% Critical Safety Clearance**: High-risk defects like IMR rail fractures and OHE contact wire wear are prioritized and cleared.
  > - **Exact Solver Runtime**: Google OR-Tools converged in under 100 milliseconds."

#### 3. Corridor Gantt & Conflict Resolution Matrix (1:30 – 2:30)
- **What to click**: Click the **Corridor Gantt** tab, then the **Conflict View** tab.
- **What to say**:
  > "Here is our Corridor Block Allocation Timeline. Rows represent key trunk sections (New Delhi–Ghaziabad, Ghaziabad–Aligarh, Kanpur Central), color-coded by department:
  > - **Amber** for Track Engineering
  > - **Cyan** for Traction OHE
  > - **Emerald** for S&T Signalling
  >
  > Notice the purple badges labeled **JOINT BLOCK**.
  > Switching to the **Conflict View**, you can see the magic of our CP-SAT engine. In manual BDMS, Engineering and Traction would take separate consecutive blocks on the same section, closing the line for over 6.5 hours. Our solver identifies spatial and temporal compatibility, consolidating them into a single 3.5-hour block—saving 3.0 hours of track downtime for freight trains."

#### 4. Explainable AI: Transparent Decisions (2:30 – 3:30)
- **What to click**: Click on any scheduled block (e.g. `TSK-ENG-0001`). The **Explainability Drawer** slides out from the right.
- **What to say**:
  > "In high-stakes railway operations, controllers cannot trust a black-box AI. Our system answers two critical questions:
  > 1. **Why was this task prioritized?**
  > Look at the exact factor breakdown: Safety Hazard (30 pts), Defect Severity (25 pts), Track Speed/GMT Tier (20 pts), Aging Overdue (12 pts), and Punctuality Impact (5 pts). The total score mathematically matches the components.
  > 2. **Why was it placed in this block?**
  > The system shows that this window has low night-lull traffic density, zero passenger train disruption, and matches concurrent OHE crew availability."

#### 5. Live Contingency: Emergency Defect Injection (3:30 – 4:30)
- **What to click**: Click the **What-If Simulation** tab, then click the red button: **'Inject Emergency Rail Fracture (NDLS-GZB)'**.
- **What to say**:
  > "Now watch what happens when an unexpected emergency occurs—such as an ultrasonic rail flaw detector catching an immediate rail fracture on the busy Delhi-Ghaziabad trunk line.
  > In real time, the CP-SAT engine re-optimizes the entire division plan.
  > Look at the **Schedule Shifts Detected**:
  > - The emergency task is immediately fitted into the earliest safe window with top priority.
  > - Lower-priority routine maintenance is automatically shifted or bumped.
  > - The exact wall-clock re-solve runtime is measured and displayed."

#### 6. Human Override & Audit Trail (4:30 – 5:00)
- **What to click**: Click **Audit Trail** tab, and show the **Lock / Pin** feature.
- **What to say**:
  > "Finally, railway officers always have the final say. An officer can click 'Lock / Pin Block' on any assignment. This immediately becomes a hard mathematical constraint in the CP-SAT solver, guaranteeing that subsequent automated re-optimizations preserve that decision.
  > Every optimization run is permanently recorded in our SQLite/PostgreSQL audit trail for accountability.
  > Thank you, and we welcome your questions!"
