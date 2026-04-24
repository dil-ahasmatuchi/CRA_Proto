# Cyber Risk Management — Product Requirements Document

> **CONFIDENTIAL**

---


|                         |                                                                       |
| ----------------------- | --------------------------------------------------------------------- |
| **Product**             | Cyber Risk Management — within Asset Manager (D1P)                    |
| **Authors**             | Adél Carlson, András Mátyási                                          |
| **Date**                | April 2026                                                            |
| **Status**              | Draft v1.1 — Based on Prototype v1                                    |
| **Prototype Reference** | ([https://cra-new.netlify.app/](https://cra-new.netlify.app/))        |
| **Document Type**       | AI PRD (Standard Product + AI Assessment Agent)                       |
| **Strategic Goal**      | Keep GDR ≥ 95%; reduce implementation time for cyber risk engagements |


---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
  - 1.1 Business Problem
  - 1.2 Personas
  - 1.3 Strategic Alignment
  - 1.4 Competitive Context
  - 1.5 AI Positioning
2. [Success Metrics](#2-success-metrics)
3. [Product Overview & Object Model](#3-product-overview--object-model)
  - 3.1 Product Space & Entitlements
  - 3.2 Core Object Model
  - 3.3 Object Relationships
4. [User Experience](#4-user-experience)
  - 4.1 Assessment Workflow Overview
  - 4.2 Cyber Risk Assessments List
  - 4.3 Cyber Risk Management Overview (Dashboard)
  - 4.4 Cyber Risks Register
  - 4.5 Threats Library
  - 4.6 Vulnerabilities Library
  - 4.7 Controls
  - 4.8 Mitigation Plans
5. [UX / Design Notes](#5-ux--design-notes)
6. [Functional Requirements](#6-functional-requirements)
  - 6.1 Core Functional Requirements
  - 6.2 AI Functional Requirements — Cyber Risk Assessment Agent
7. [Non-Functional Requirements](#7-non-functional-requirements)
  - 7.1 Standard Non-Functional Requirements
  - 7.2 AI Quality & Performance Requirements
8. [Dependencies & Rollout](#8-dependencies--rollout)
  - 8.1 Key Dependencies
  - 8.2 Go-To-Market
  - 8.3 Entitlements
9. [Integrations](#9-integrations)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Open Questions](#11-open-questions)
12. [Change Log](#12-change-log)

---

## 1. Problem Statement

### 1.1 Business Problem

Cyber risk management is not available as an out-of-the-box solution on the Diligent One Platform today. Every customer engagement requires the implementation team to build a custom configuration, resulting in high delivery cost and inconsistent outcomes. The platform cannot answer the fundamental question customers need answered: *"Which critical assets are at risk, why, and what is the business impact?"*

Two foundational domain objects that every cyber risk workflow depends on — a Threat library and asset-level risk scoring — do not exist natively on the platform. Vulnerability data can be imported via connectors (Tenable, Qualys), but mapping findings to risks, controls, and assets is a manual process with no automation on residual risk calculation. Risk assessments can only be executed through uniquely configured robots, which are fragile, error-prone, and impossible to standardise across customers.

There is strong and immediate commercial demand for a dedicated cyber risk product. Competitors (OneTrust, Archer, MetricStream) all ship dedicated ITRM/cyber risk modules with pre-built threat libraries, control frameworks, and risk scoring models. Sales has already built pipeline of $1.6M EMEA against a Q2 target — pipeline that the product behind that positioning does not yet support.

### 1.2 Personas


| **Persona**                        | **Role**                                         | **Primary Goal**                                                                         |
| ---------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| IT Risk Manager / Security Manager | Primary user who creates and manages assessments | Execute structured, repeatable cyber risk assessments without custom configuration       |
| CISO / Head of InfoSec             | Executive consumer of risk posture data          | View overall cyber risk posture, report top risks to the board, track treatment progress |


**Supporting roles (RBAC — inherits from D1P)**


| **Role**              | **Capability in CRM**                                  |
| --------------------- | ------------------------------------------------------ |
| Risk Assessor         | Create/edit assessments, scope assets, score scenarios |
| Reviewer              | Review and approve scenarios; cannot create            |
| Risk Owner            | Own treatments; update status                          |
| Control Owner         | Update control status against linked assets            |
| Read-only / Executive | View dashboards, export reports                        |


> **Note.** Role-permission matrix inherits from the existing AM/D1P RBAC; CRM does not introduce new roles.

### 1.3 Strategic Alignment

The MVP replaces fragile robot-based assessments with a guided, methodology-driven experience that users can follow without specialist implementation support. It is designed to reduce implementation time from bespoke per-customer projects to a guided out-of-the-box setup, directly supporting the strategic goal of keeping GDR above 95%.

The MVP is explicitly **AI-augmented, not agentic.** Agentic capabilities (Risk Maestro, V2) are out of scope.

> **Decision (Tom Faraday, 2026-03-09):** AI-augmented manual workflow approved as the MVP direction and scope.

### 1.4 Competitive Context


| **Competitor** | **Strength**                                 | **Weakness**                              |
| -------------- | -------------------------------------------- | ----------------------------------------- |
| OneTrust       | Mature ITRM module, broad integrations       | Expensive, complex to implement           |
| Archer         | Deep, enterprise-grade                       | High cost, heavy implementation lift      |
| MetricStream   | Pre-built threat library, control frameworks | Weak integrations, poor dashboard quality |


Diligent's differentiator is governance, dashboarding, and board-ready reporting — but only if the cyber risk core (threats, asset scoring, workflow) is delivered.

### 1.5 AI Positioning

AI in a cyber risk product is a **baseline market expectation**, not a differentiator on its own. Strategy distinguishes two versions:

- **Version 1 (this MVP):** AI-augmented manual workflow following the pattern proven in audit risk assessment. AI suggests scores, rationale, and drafts; humans approve.
- **Version 2 (post-MVP):** Fully agentic — Risk Maestro agents autonomously ingest threat data, generate scenarios, and orchestrate treatment plans.

Customer maturity varies widely. Low-maturity customers need a guided, opinionated manual workflow they can grow into; advanced users expect AI to compress a 3–6 week assessment cycle to hours. The MVP therefore delivers **human-in-the-loop AI** as the foundation that V2 will build on.

**Non-Goals (MVP)**

- Fully agentic AI (Risk Maestro) — deferred to V2.
- Fully quantitative risk models (FAIR, Monte Carlo). Qualitative scoring is the primary path; a Quantitative option is exposed but gated — see Open Questions.
- New connectors beyond existing Tenable / Qualys integrations.
- Threat-intelligence ingestion from external feeds (e.g., MITRE ATT&CK live feed).
- Mobile app support; web-only for MVP.
- Net-new Control Library (existing control objects are reused).

---

## 2. Success Metrics


| **Metric**                                              | **Target**                                           | **Notes**                                                                               |
| ------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Implementation time per customer                        | ≤ 20% of current bespoke baseline                    | Measure time from contract to first approved assessment                                 |
| Time to complete a full risk assessment (advanced user) | ≤ 1 week (target), down from 3–6 weeks               | In-app telemetry on assessment `created → approved` duration                            |
| Assessments completed without PS support                | >80% self-serve                                      | Tracks product usability                                                                |
| GDR retention for ITRM customers                        | >95%                                                 | Strategic guardrail                                                                     |
| Pipeline converted (EMEA Cyber Risk)                    | ≥ 30% of $1.6M closed-won within 2 quarters of GA    | Sales-facing measure                                                                    |
| Time to first approved assessment                       | TBD during beta                                      | User onboarding quality                                                                 |
| AI scoring acceptance rate (Sassy)                      | ≥ 60% of AI-suggested scores accepted without edit   | AI agent quality measure; measured via `ai_suggested → approved_without_edit` telemetry |
| CISO dashboard adoption                                 | ≥ 50% of customers with ≥ 1 dashboard export / month | Telemetry on export + dashboard views                                                   |


---

## 3. Product Overview & Object Model

### 3.1 Product Space & Entitlements

Cyber Risk Management is a dedicated module housed within Asset Manager on the Diligent One Platform. It is accessible via the left-hand navigation under "Cyber risk management" and contains the following top-level sections:

- **Overview** — executive KPI dashboard
- **Cyber risk assessments** — assessment list and workflow
- **Cyber risks** — risk register with lifecycle tracking
- **Controls** — control inventory linked to assets and risks
- **Threats** — threat category library
- **Vulnerabilities** — vulnerability library with sub-tabs
- **Mitigation plans** — treatment action tracking

**Entitlement model:**

- Existing Asset Manager customers: module available to all current AM customers at GA at no additional charge.
- New customers: available only with a **Cyber Risk subscription** add-on.

### 3.2 Core Object Model

The product is built around eight interconnected objects. The table below describes each object, its identifier format, and its role in the product.


| **Object**            | **ID Format** | **Status** | **Description**                                                                                                                                                                                                           |
| --------------------- | ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cyber Risk Assessment | CRA-XXX       | New        | The central workflow object that orchestrates the end-to-end assessment process from scoping to approved results.                                                                                                         |
| Cyber Risk            | RSK-XXX       | Extended   | A named risk category (e.g. Ransomware attack) that groups related risk scenarios. Follows a lifecycle: Identification → Assessment → Mitigation → Monitoring.                                                            |
| Asset                 | AST-XXX       | Existing   | AM assets with CIA criticality ratings. Serves as the central hub connecting threats, vulnerabilities, and controls. Types: Database, API, Data, Software, Infrastructure.                                                |
| Threat                | THR-XXX       | New        | Threat category library entries (e.g. Social Engineering). Organised by domain: Application & API, Data & Information, Network & Infrastructure, Cloud & Virtualisation, Identity & Access Management, Endpoint & Device. |
| Vulnerability         | VUL-XXX       | New        | Vulnerability category library entries (e.g. Unpatched web server). Has sub-objects: Vulnerability categories, Discrete assets, Findings, CVEs. Supports scanner import.                                                  |
| Risk Scenario         | (none)        | New        | Auto-generated combinations of [Cyber Risk → Threat × Vulnerability × Asset]. The unit of scoring in the assessment.                                                                                                      |
| Control               | C-XXXXX       | Existing   | Control objects linked to assets and cyber risks. Types: Preventive or Detective. Statuses: Active, Archived, Draft.                                                                                                      |
| Mitigation Plan       | MP-XXX        | New        | Treatment action records linked to a related risk with owner, assets, and deadline. Statuses: Open, In progress, Completed, Overdue.                                                                                      |


### 3.3 Object Relationships

Assets are the central hub. Each asset links to Cyber Risks, Threats, Vulnerabilities, and Controls. Risk scenarios within a Cyber Risk are generated for a specific asset based on the combination of threats × vulnerabilities.Mitigation Plans link back to a specific Cyber Risk and to one or more Assets. Mitigation Plan can also link to a specific Cyber Risk scenario (which includes one specific asset).

> **Scoring Formula (Qualitative Method)**
>
> - **Impact** = Asset criticality level (1–5)
> - **Threat severity** = 1–5
> - **Vulnerability severity** = 1–5
> - **Likelihood** = Threat severity × Vulnerability severity (range: 1–25)
> - **Cyber risk score** = Impact × Likelihood (range: 1–125)
>
> Score bands: 1–25 Very Low | 26–50 Low | 51–75 Medium | 76–100 High | 101–125 Very High 
> Score bands are configurable in Risk Manager. Risk Manager alignment is required here.

**Lifecycle States**

*Cyber Risk Assessment:* `Draft → Scoping → Scoring → Approved`

- `Overdue` is a **derived** state surfaced when `due_date < today()` and assessment is not `Approved`.
- `Back to scoring` action returns an `Approved` assessment to `Scoring` (audit-logged).
- Archive: assessments older than X months auto-archive (X tenant-configurable; default TBD — see Open Questions).

*Cyber Risk:* `Identification → Assessment → Mitigation → Monitoring`
Cyber Risk status is configurable in Risk Manager. Risk Manager alignment is required here.

*Risk Scenario:*


| **State**  | **Description**                                                                 |
| ---------- | ------------------------------------------------------------------------------- |
| `draft`    | Created; values blank or AI-generated, not yet reviewed.                        |
| `n/a`      | Created but not applicable to the asset/context — excluded from the assessment. |
| `reviewed` | Reviewed (and optionally edited) by a user.                                     |
| `Approved` | bulk approved on Cyber Risk level                                               |


*Mitigation Plan:* `Open → In progress → Completed`. `Overdue` is derived when `due_date < today()` AND status ≠ `Completed`.

**Inherent vs. Residual Risk**

The Overview page distinguishes **Inherent risks** and **Residual risks** as separate heat maps:

- `inherent_score` — score excluding the risk-reducing effect of linked controls.
- `residual_score` — score after applying the effect of linked `Active` controls (control weighting algorithm TBD — see Open Questions).

---

## 4. User Experience

### 4.1 Assessment Workflow Overview

The assessment follows a four-step workflow represented as tabs at the top of the assessment detail page. Users can freely navigate between tabs; the status badge reflects the current step.


| **Step** | **Tab** | **Status Badge**       | **Primary Action**                  |
| -------- | ------- | ---------------------- | ----------------------------------- |
| 1        | Details | Draft                  | Move to scoping                     |
| 2        | Scope   | Scoping                | Move to assessment                  |
| 3        | Scoring | In progress            | Review and edit per-scenario scores |
| 4        | Results | In progress → Approved | Approve assessment                  |


---

#### Step 1 — Details (Draft)

The user creates a new assessment and enters the foundational metadata before proceeding to scope.


| **Field**               | **Type**                      | **Required** | **Notes**                                                                         |
| ----------------------- | ----------------------------- | ------------ | --------------------------------------------------------------------------------- |
| Name                    | Text input                    | Yes          | Free text assessment name                                                         |
| ID                      | Number input (prefix pre-set) | Yes          | e.g. CRA-001; user-defined reference                                              |
| Owner                   | User picker                   | No           | Defaults to current user                                                          |
| Due date                | Date picker                   | No           | e.g. 23 Aug 2026                                                                  |
| Assessment method       | Radio buttons                 | Yes          | Qualitative (default, active) or Quantitative (displayed but disabled in v1)      |
| Assessment instructions | Rich text editor              | Yes          | Provides context to assessors; visible throughout the workflow                    |
| Attachments             | File upload                   | No           | Formats: JPG, PDF, XLS. Max file size: 5 MB. Used by AI agent as scoring context. |


> **Assessment Method Details**
>
> - **Qualitative:** Scored using Impact × Likelihood. Impact = Asset criticality. Likelihood = Vulnerability severity × Threat severity. Result: 1–125 score.
> - **Quantitative:** Scored using Financial consequence × Frequency of occurrence, resulting in Annualised Loss Expectancy (ALE). Displayed in prototype but disabled in v1; planned for future release.

---

#### Step 2 — Scope (Scoping)

The user selects which objects to include in the assessment. The scope page displays four cards, each showing the count of included vs. total available objects. Each card has an "Edit scope" link.


| **Scope Object** | **Example Count**       | **Selection Mechanism**                                                                                                                                                                        |
| ---------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Assets           | 3 / 150 Assets          | Toggle per asset (Included / Not included). Filterable by: asset name, asset type, criticality, linked cyber risks, threats, vulnerabilities, objectives. Tabs: All / Included / Not included. |
| Cyber Risks      | 17 / 20 Cyber Risks     | Selected automatically, all related Cyber Risks are selected. Unselect is possible in the risk grid.                                                                                           |
| Threats          | 22 / 60 Threats         | Selected automatically , all related Threats are selected. Related = Related to the selected risk and asset                                                                                    |
| Vulnerabilities  | 4 / 236 Vulnerabilities | Selected automatically , all related Vulnerabilities are selected. Related = Related to the selected asset library                                                                             |


Asset selection columns visible in the selection modal: Asset name, Asset type, Cyber risks count, Threats count, Vulnerabilities count, Criticality, Objectives.

> Scope picker for Cyber Risks, Threats, and Vulnerabilities respects the current Asset scope — only surfaces objects linked to scoped assets. The user cannot advance to Scoring with zero assets in scope.

---

#### Step 3 — Scoring (In Progress)

The system generates risk scenarios from the scoped objects and presents them in a two-level hierarchy. The AI assessment agent evaluates each scenario. Each evaluation can be reviewed and edited in the Rationale page.
The user selects an aggregation method and reviews/edits AI-suggested scores.

**Scenario Hierarchy**

Scenarios are displayed in a two-level collapsible table:

- **Level 1 (parent row):** Cyber risk name — shows aggregated Impact, Threat severity, Vulnerability severity, Likelihood, and Cyber risk score
- **Level 2 (child rows):** Individual Scenario — `{Threat} on {Asset} and {All Vulnerabilities related to the specific Threat and Asset}`. Shows individual scores for each dimension.

**Scoring Columns**


| **Column**             | **Source**                                      | **Editable?**                                                    |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| Impact                 | Asset criticality level (1–5)                   | No (derived from asset)                                          |
| Threat severity        | AI-suggested (1–5 scale)                        | Yes — dropdown: 1 Very low, 2 Low, 3 Medium, 4 High, 5 Very high |
| Vulnerability severity | AI-suggested (1–5 scale)                        | Yes — same dropdown                                              |
| Likelihood             | Threat severity × Vulnerability severity (1–25) | Calculated automatically                                         |
| Cyber risk score       | Impact × Likelihood (1–125)                     | Calculated automatically                                         |


**Actions per Scenario**

Each scenario row has a three-dot action menu. Clicking a scenario row opens the Scoring Rationale detail page where the AI-generated rationale is displayed and can be edited.

All AI-populated fields carry a visible **"AI-suggested"** badge that persists until the user edits or approves the scenario. An assessment cannot transition to `Approved` while any scenario remains in `draft`.

---

#### Scoring Rationale Page (AI Agent Output)

Accessed by clicking into a scenario from the Scoring tab. Shows the full scoring context for one scenario.

- **Header:** Scenario identity — `"{Threat} on {Asset}"`
- **Score fields (editable dropdowns):** Asset criticality | Threat severity | Vulnerability severity | Likelihood | Cyber risk score
- **Scoring rationale:** Rich text editor containing AI-generated analysis (see Section 6.2 for AI requirements)
- User can edit any score field or the rationale text before saving
- When editing the user name and timestamp and scope are saved of the changes.

**Aggregation Method**

The user selects one of two aggregation methods for rolling up scenario scores to the Cyber risk level:

- **Highest** — the highest-scoring scenario determines the parent Cyber risk score
- **Average** — the mean of all scenario scores determines the parent Cyber risk score

Aggregation flow:
Step 1: Aggregate Impact, Threat and Vulnerability ratings
Step 2: Calculate the Risk level Likelihood from the aggregated Threat and Vulnerability ratings
Step 3: Calcualte the Risk level Risk score from the aggregated Impact and Likelihood

---

#### Step 4 — Results

The Results tab presents the aggregated output of the assessment in two panels:

**Overview Panel**

- View toggle: Show Cyber risks / Show Assets
- Cyber risks heat map: 25×5 matrix with Likelihood (Y-axis, 1–25) vs. Impact (X-axis, 1–5), coloured by score band, shows count of risks in each cell
- Assets by cyber risk score: Donut chart with score band breakdown and total asset count
- Score band legend: 101–125 Very High (dark red), 76–100 High (red), 51–75 Medium (orange), 26–50 Low (yellow), 1–25 Very Low (green)  
Please note, the  score band and heatmap matrix is configurable in Risk Manager. This needs alignment with Risk Manager

**Cyber Risks Table**

- Columns: Name, Impact, Threat severity, Vulnerability severity, Likelihood, Cyber risk score, Mitigation plan
- Expandable rows show child scenarios under each Cyber risk
- Inline `+ Mitigation plan` CTA per Cyber risk row (opens Mitigation Plan create flow with Related risk pre-populated)

**Assets Table**

- Columns: Name, ID, Cyber risk score, Criticality level, Confidentiality, Integrity, Availability

**Approve Assessment**

A prominent "Approve assessment" button in the top-right corner transitions the assessment status to Approved and locks the results. A "Back to scoring" action is available on Approved assessments (audit-logged).

---

### 4.2 Cyber Risk Assessments List

The list view is the entry point for all assessments. It shows:

- **Summary widgets:** Assessments by status (Draft / Scoping / In progress / Approved / Overdue) as a donut chart; Assessments by business unit as a donut chart
- **Table columns:** ID, Name, Status (badge), Cyber risks count, Assets count, Threats count, Vulnerabilities count, Scenarios count, Owner
- **Actions:** New cyber risk assessment (top right)

### 4.3 Cyber Risk Management Overview (Dashboard)

The Overview is an interactive, executive dashboard visible to CISOs and IT Risk Managers. It provides a real-time snapshot of the organisation's cyber risk posture.

**KPI Cards (top row):**


| **KPI**                  | **Example Value** | **Trend Indicator** |
| ------------------------ | ----------------- | ------------------- |
| Overall cyber risk score | 95 – High         | Increasing ↑        |
| Critical assets          | 122               | Increasing ↑        |
| Critical risks           | 24                | Decreasing ↓        |
| Treatment progress       | 24%               | Increasing ↑        |


**Charts:**

- **Inherent risks heat map** — 25×5 matrix (Likelihood 1–25 × Impact 1–5), same colour coding as assessment results, with risk counts per cell
- **Residual risks heat map** — same grid, score after applying effect of linked Active controls
- **Risk treatment status** — donut chart showing Mitigation plans across: Open, In progress, Completed, Overdue

**Most Exposed Assets Table:**

Columns: Asset name, Asset type, Criticality, Vulnerabilities count, Threats count, Cyber risk score, Status (At risk / Remediation in progress)

**Export:** "Export cyber risk management overview" CTA exports the whole dashboard as a single document. Per-widget "More options" menu supports individual widget export (PDF, PNG, XLSX).  
Note: Export is a shared capability, AI Risk Essentials.

### 4.4 Cyber Risks Register

The Cyber Risks section is a risk register showing all cyber risks across the organisation, independent of specific assessments.

- **Overview charts:** Workflow status donut (risks across Identification / Assessment / Mitigation / Monitoring); Residual risks heat map
- **Filter:** All business units dropdown
- **Table columns:** Name, ID, Cyber risk score, Owner, Assets count, Workflow status
- **Workflow status badges:** Identification (grey), Assessment (blue), Mitigation (teal), Monitoring (light blue)

Note: Cyber Risk is created in Risk Manager (object library) within the ERM risk hierarchy. Cyber Risk with specific label or category will be synced with AM. This needs alignemnt with Risk Manager.  
 Managing the Risk Workflow can happen in the object library, meaning this can be done in AM?

### 4.5 Threats Library

A curated library of threat categories aligned to standard frameworks.

- **Summary:** Threats by severity donut (5-band distribution); Top 5 threat domains bar chart
- **Threat domains:** Application & API, Data & Information, Network & Infrastructure, Cloud & Virtualisation, Identity & Access Management, Endpoint & Device
- **Table columns:** Name, ID, Assets count, Assets by criticality (inline breakdown), Vulnerabilities count, Source (domain), Created, Created by, Last updated, Last updated by
- **Action:** "Add threats" button. Platform-provided threats are read-only; user-defined threats may be added.

### 4.6 Vulnerabilities Library

A library of vulnerability categories that links to scanner data and aggregated assets.

- **Tabs:** Overview, Vulnerability categories, Discrete assets, Findings, CVEs
- **Alert banner:** Informs user of discrete assets not yet linked to aggregated assets, with a link to "View asset linking rules"
- **Table columns:** Name, ID, Severity score (1–5), Assessments count, Findings count, CVEs count, Aggregated assets count, Vulnerability domain, Created, Created by, Last updated
- **Vulnerability domains:** Technology, People, Process

### 4.7 Controls

A read-only view of controls as they relate to cyber risks and assets. Controls are surfaced from existing Control objects; CRM is a consumer.

- **Table columns:** ID, Name, Status (Active / Archived / Draft), Prevent/Detect, Linked org units, Owner, Assets count, Cyber risks count, Key control flag, Control frequency
- Searchable and filterable  
Note: Controls are sourced from both the OL and Projects.

### 4.8 Mitigation Plans

A standalone, first-class section for all treatment actions arising from risk assessments. Not a sub-step of the assessment record.

- **Table columns:** ID, Name, Status, Severity level (1–5), Owner, Related risk, Assets count, Due date
- **Action:** "+ New mitigation plan" button
- Searchable and filterable
- Plans can also be created from the inline `+ Mitigation plan` CTA on any Cyber Risk row in the Results tab  
Note: if a Mitigation Plan is created here, the issue form needs to have a new variable "Cyber Risk". this needs alignement with Issue Manager.

---

## 5. UX / Design Notes

The following observations from the prototype inform design decisions for the engineering and design handoff:

- **Navigation:** Cyber risk management is a collapsible group in the Asset Manager left nav, consistent with existing Asset Manager IA patterns.
- **Status badges:** Assessment status uses coloured chip badges (Draft — grey; Scoping — cyan; In progress — blue; Approved — green; Overdue — derived).
- **Score colour coding:** Consistent 5-level colour system across all score displays — dark red (Very High), red (High), orange (Medium), yellow (Low), green (Very Low). Applied to inline badges, heat map cells, and donut chart segments.
- **Heat map:** The 25×5 matrix (Likelihood 1–25 × Impact 1–5) uses numbered cells indicating risk count, not risk names. Cells are coloured by score band. Two separate heat maps appear on the Overview (Inherent and Residual) and on the Results tab.
- **Two-level collapsible table:** The Scoring tab uses a collapse/expand pattern (chevron icon) for Cyber risk → Scenario hierarchy. Cyber risk rows show aggregated scores; Scenario rows show individual scores.
- **Scenario naming:** Canonical pattern is `"{Threat description} on {Asset name}"`.
- **AI attribution:** Any field populated by AI must show a visible "AI-suggested" badge that persists until user edit or approval.
- **Editable dropdowns in scoring rationale:** Score fields are dropdowns with the 1–5 labelled options, not free-text fields, ensuring scoring integrity.
- **Rich text editor:** The scoring rationale and instructions fields both use a full rich-text editor toolbar (bold, italic, underline, strikethrough, font colour, alignment, lists, indent, table, quote, attachment, link, image, video, voice).
- **Assessment list widgets:** Two donut charts at the top of the list view (by status, by business unit) provide an at-a-glance summary before the detailed table.
- **Breadcrumb navigation:** Multi-level breadcrumbs (Asset manager > Cyber risk management > [context]) are used throughout, supporting deep-link navigation.
- **Scope counters:** Each scope card shows X / Total format (e.g. "4 / 436 Assets") making inclusion visible at a glance.

---

## 6. Functional Requirements

### 6.1 Core Functional Requirements

#### FR-00 — Cyber Risk Settings

> Cyber Risk Settings define the configurable scoring scales that govern all risk calculations across the module. These settings are established by the IT Risk Manager before assessments begin and apply consistently across all assessments, heat maps, dashboards, and AI-suggested scores. Each scale ships with a platform-defined default; customers may adjust the labels and thresholds within their tenant.


| **ID**  | **Requirement**                                                                                                                                                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-00.1 | The system shall provide a **Cyber Risk Score Scale** configuration, defining the numeric bands and labels used for the overall cyber risk score (1–125). The default bands are: 1–25 Very Low, 26–50 Low, 51–75 Medium, 76–100 High, 101–125 Very High. The scale shall be aligned with Risk Manager; any change requires Risk Manager alignment. |
| FR-00.2 | The system shall provide a **Threat Severity Score Scale** configuration, defining the 1–5 rating labels and their scoring criteria. The default scale is defined in AI-FR-02.1.2 The scale shall be configurable per tenant; changes apply to all subsequent assessments and to Sassy's scoring logic.                                            |
| FR-00.3 | The system shall provide a **Vulnerability Severity Score Scale** configuration, defining the 1–5 rating labels and their scoring criteria. Each level shall have a pre-defined label and description. The scale shall be configurable per tenant; changes apply to all subsequent assessments and to Sassy's scoring logic.                       |
| FR-00.4 | All three scales shall display their current configured values as the reference definition on the Scoring Rationale page, so assessors can see the active scale while scoring.                                                                                                                                                                     |
| FR-00.5 | Scale changes shall not retroactively alter scores on Approved assessments. Changes take effect on assessments that have not yet been approved at the time of the change.                                                                                                                                                                          |
| FR-00.6 | The Cyber Risk Settings shall be accessible only to users with the IT Risk Manager role and app Admin and System Admin                                                                                                                                                                                                                             |
| FR-007  | The Cyber Risk Settings includes the switch of AI Assessment agent. And Classy if it is in scope.                                                                                                                                                                                                                                                  |


---

#### FR-01 — Cyber Risk Management Overview Dashboard


| **ID**    | **Requirement**                                                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01.1   | The system shall display an Overall cyber risk score as a numeric value and label (Very Low / Low / Medium / High / Very High) with a directional trend indicator (increasing / decreasing). |
| FR-01.2   | The system shall display a Critical assets KPI with count and trend indicator.                                                                                                               |
| FR-01.3   | The system shall display a Critical risks KPI with count and trend indicator.                                                                                                                |
| FR-01.4   | The system shall display a Treatment progress KPI as a percentage with trend indicator.                                                                                                      |
| FR-01.5   | The system shall display an **Inherent risks** heat map as a 25×5 matrix (Likelihood 1–25 × Impact 1–5) with risk counts per cell, coloured by score band.                                   |
| FR-01.5.1 | The user can click with drill-down and review the risks in the **Inherent risks** heat map cell. Heatmap cells can be filtered by org unit.                                                  |
| FR-01.6   | The system shall display a **Residual risks** heat map using the same grid and colour coding, computed after applying the effect of linked Active controls.                                  |
| FR-01.6.1 | The user can click with drill-down and review the risks in the **Residual risks** heat map cell. Heatmap cells can be filtered by org unit.                                                  |
| FR-01.7   | The system shall display a Risk treatment status donut chart showing Mitigation plan counts across Open, In progress, Completed, and Overdue statuses.                                       |
| FR-01.8   | The system shall display a Most exposed assets table with columns: Asset name, Asset type, Criticality, Vulnerabilities, Threats, Cyber risk score, Status.                                  |
| FR-01.9   | An "Export cyber risk management overview" CTA shall export the full dashboard. Per-widget "More options" menus shall support individual widget export (PDF, PNG, XLSX).                     |


#### FR-02 — Cyber Risk Assessments List


| **ID**  | **Requirement**                                                                                                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-02.1 | The system shall display all cyber risk assessments in a searchable, filterable, paginated table with columns: ID, Name, Status, Cyber risks count, Assets count, Threats count, Vulnerabilities count, Scenarios count, Owner. |
| FR-02.2 | The system shall display two summary widgets at the top of the list: Assessments by status (donut chart) and Assessments by business unit (donut chart).                                                                        |
| FR-02.3 | The user shall be able to create a new cyber risk assessment via a "New cyber risk assessment" button.                                                                                                                          |
| FR-02.4 | Assessment status shall be displayed as a colour-coded badge: Draft (grey), Scoping (cyan), In progress (blue), Approved (green). `Overdue` is a derived status when `due_date < today()` AND status ≠ `Approved`.              |


#### FR-03 — Assessment Details (Step 1)


| **ID**  | **Requirement**                                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-03.1 | The user shall be able to enter an assessment Name (free text) and ID (required, user-defined prefix, e.g. CRA-001).                                                                                                           |
| FR-03.3 | The user shall be able to assign an Owner (defaults to current user).                                                                                                                                                          |
| FR-03.4 | The user shall be able to enter a Due date via date pickers.                                                                                                                                                                   |
| FR-03.5 | The user shall select an assessment method: Qualitative (Impact × Likelihood) or Quantitative (Financial consequence × Frequency = ALE). Qualitative shall be the default. Quantitative shall be displayed but disabled in v1. |
| FR-03.6 | The qualitative method description shall read: "Assessments are scored using (Impact × Likelihood). Impact is determined by Asset criticality and Likelihood is determined by (Vulnerability severity × Threat severity)."     |
| FR-03.7 | The user shall be able to enter Assessment instructions in a rich text editor (required).                                                                                                                                      |
| FR-03.8 | The user shall be able to upload Attachments (formats: JPG, PDF, XLS; max file size: 5 MB).                                                                                                                                    |
| FR-03.9 | A "Move to scoping" button shall advance the assessment status from Draft to Scoping.                                                                                                                                          |


#### FR-04 — Assessment Scope (Step 2)


| **ID**   | **Requirement**                                                                                                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-04.1  | The Scope tab shall display four scope cards: Assets, Cyber risks, Threats, Vulnerabilities. Each card shall show the count of included vs. total available objects (e.g. "4 / 436 Assets").            |
| FR-04.2  | Asset based scope is available in MVP. Cyber risk scope card only provides perview and unselect options.                                                                                                |
| FR-04.3  | The Asset selection modal shall display a table with columns: Toggle (Included/Not included), Asset name, Asset type, Cyber risks count, Threats count, Vulnerabilities count, Criticality, Objectives. |
| FR-04.4  | The Asset selection modal shall support Search by, Filter, and Columns controls, and shall have three view tabs: All, Included, Not included.                                                           |
| FR-04.5  | Asset rows shall be toggleable between "Not included" and "Included" states. The Included count on the scope card shall update in real time.                                                            |
| FR-04.6  | Scope pickers for Cyber Risks, Threats, and Vulnerabilities shall respect the current Asset scope, only surfacing objects linked to scoped assets.                                                      |
| FR-04.7  | The user shall be able to save an empty scope as Draft but shall not be able to move to Scoring status with zero assets.                                                                                |
| FR-04.8  | The user shall be able to add or remove items from scope without losing previously-entered scoring data for items that remain in scope.                                                                 |
| FR-04.9  | The system shall warn when a scoped asset has no linked controls (impacts residual-risk calculation).                                                                                                   |
| FR-04.10 | A "Move to assessment" button shall advance the assessment status from Scoping to In progress.                                                                                                          |


#### FR-05 — Scoring (Step 3)


| **ID**     | **Requirement**                                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-05.1    | The system shall generate risk scenarios as combinations of [ Threat × Vulnerability × Asset] from the scoped objects when the assessment moves to In progress. Scenarios are restricted to a specific threat and specific asset and related vulnerabilities. |
| FR-05.2    | Scenarios shall be displayed in a two-level collapsible hierarchy: Cyber risk (parent, level 1) → Scenario (child, level 2). The parent row aggregates child scenario scores.                                                                                 |
| FR-05.3    | The canonical scenario name shall be `"{Threat description} on {Asset name}"`.                                                                                                                                                                                |
| FR-05.4    | The user shall be able to select an Aggregation method: Highest or Average. This determines how child scenario scores roll up to the parent Cyber risk score.                                                                                                 |
| FR-05.5    | The scoring table shall display columns: Name, Impact, Threat severity, Vulnerability severity, Likelihood, Cyber risk score.                                                                                                                                 |
| FR-05.6    | Each score cell shall display a coloured dot and numeric value corresponding to the 5-level colour-coded score band system.                                                                                                                                   |
| FR-05.7    | All AI-populated fields shall carry a visible "AI-suggested" badge that persists until the user edits or approves the scenario.                                                                                                                               |
| FR-05.8    | Each scenario row shall have a three-dot action menu.                                                                                                                                                                                                         |
| FR-05.9    | Clicking a scenario row shall navigate to the Scoring Rationale detail page for that scenario.                                                                                                                                                                |
| FR-05.10   | On the Scoring Rationale page, the user shall be able to edit Threat severity and Vulnerability severity via labelled dropdowns (1 Very low through 5 Very high). Likelihood and Cyber risk score shall update automatically.                                 |
| FR-05.10.1 | On the Scoring Rationale page, when the user edits the severity level or add rationale, the user name, timestamp and the scope shall be saved.                                                                                                                |
| FR-05.11   | On the Scoring Rationale page, the user shall be able to edit the AI-generated scoring rationale text in a rich text editor.                                                                                                                                  |
|            |                                                                                                                                                                                                                                                               |
| FR-05.13   | The user shall be able to set a scenario to `n/a` with a required justification note. `n/a` scenarios shall be excluded from aggregation.                                                                                                                     |
| FR-05.14   | The user shall be able to Approve, Edit, or set to `n/a` each scenario. Bulk approval for Cyber Risks is supported.                                                                                                                                           |
| FR-05.14   | Aggregation flow is detailed above                                                                                                                                                                                                                            |
| FR-05.16   | Every state transition shall be captured in an immutable audit log (who, when, old value, new value, AI vs. human attribution).                                                                                                                               |


#### FR-06 — Assessment Results (Step 4)


| **ID**  | **Requirement**                                                                                                                                                                                                                                                                                                                        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-06.1 | The Results tab shall display an Overview section containing: a Cyber risks heat map (25×5, Likelihood 1–25 × Impact 1–5); a donut chart showing Assets by cyber risk score.                                                                                                                                                           |
| FR-06.2 | The heat map cells shall display the count of risks or assets per cell and be coloured by score band.                                                                                                                                                                                                                                  |
| FR-06.3 | A "Show Cyber risks / Show Assets" toggle shall switch the overview charts between risk-level and asset-level views.                                                                                                                                                                                                                   |
| FR-06.4 | A Cyber risks table shall display columns: Name, Impact, Threat severity, Vulnerability severity, Likelihood, Cyber risk score, Mitigation plan. Rows shall be expandable to show child scenarios. Each row shall expose an inline `+ Mitigation plan` CTA that opens the Mitigation Plan create flow with Related risk pre-populated. |
| FR-06.5 | An Assets table shall display columns: Name, ID, Cyber risk score, Criticality level, Confidentiality, Integrity, Availability.                                                                                                                                                                                                        |
| FR-06.6 | An "Approve assessment" button shall be available when the assessment is In progress. Clicking it shall transition the status to Approved and lock the results.                                                                                                                                                                        |
| FR-06.7 | A "Back to scoring" action shall be available on Approved assessments and shall transition the status back to Scoring (audit-logged).                                                                                                                                                                                                  |
| FR-06.8 | The user shall be able to export results to PDF and XLSX with a selectable scope (whole assessment, single Cyber Risk, single asset).                                                                                                                                                                                                  |


#### FR-07 — Cyber Risks Register


| **ID**  | **Requirement**                                                                                                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-07.1 | The Cyber risks section shall display all cyber risks in a searchable, paginated table with columns: Name, ID, Cyber risk score, Owner, Assets count, Workflow status, Inherent and Residual risk scores |
| FR-07.2 | Cyber risks shall follow a four-stage workflow lifecycle with status badges: Identification, Assessment, Mitigation, Monitoring. A summary widget shall show counts per status.                          |
| FR-07.3 | The overview panel shall show a Workflow status donut chart and a Residual risks heat map.                                                                                                               |
| FR-07.4 | The user shall be able to filter cyber risks by business unit.                                                                                                                                           |
| FR-07.5 | Cyber Risk shall be created and updated in Risk Manager (OL), risk workflow is done in RM and assessment is done in Asset Manager. More details in 4.4.                                                  |


#### FR-08 — Threats Library


| **ID**  | **Requirement**                                                                                                                                                                                                                      |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-08.1 | The Threats section shall display all threats in a table with columns: Name, ID, Assets count, Assets by criticality (inline breakdown), Vulnerabilities count, Source (domain), Created, Created by, Last updated, Last updated by. |
| FR-08.2 | The Threats library shall be seeded at GA with a platform-provided set grouped by threat domain. Platform-provided entries are read-only.                                                                                            |
| FR-08.3 | The user shall be able to add new user-defined threats via an "Add threats" button.                                                                                                                                                  |
| FR-08.4 | Summary widgets shall display: Threats by severity (5-band distribution); Top 5 threat domains (count per domain).                                                                                                                   |
| FR-08.5 | Threats shall be filterable and searchable.                                                                                                                                                                                          |


#### FR-09 — Vulnerabilities Library


| **ID**  | **Requirement**                                                                                                                                                                                                                       |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-09.1 | The Vulnerabilities section shall display tabs: Overview, Vulnerability categories, Discrete assets, Findings, CVEs.                                                                                                                  |
| FR-09.2 | The Vulnerability categories tab shall display a table with columns: Name, ID, Severity score (1–5), Assessments count, Findings count, CVEs count, Aggregated assets count, Vulnerability domain, Created, Created by, Last updated. |
| FR-09.3 | The Vulnerability library shall be seeded at GA with a platform-provided set. Platform-provided entries are read-only.                                                                                                                |
| FR-09.4 | The user shall be able to add user-defined vulnerability categories via an "Add vulnerabilities" button.                                                                                                                              |
| FR-09.5 | An info banner shall surface when the tenant has unlinked Discrete Assets, with a link to "View asset linking rules".                                                                                                                 |
| FR-09.6 | A "Import vulnerabilities" CTA shall initiate the existing Tenable/Qualys ingestion flow.                                                                                                                                             |
| FR-09.7 | Vulnerabilities shall be filterable and searchable.                                                                                                                                                                                   |


#### FR-10 — Controls


| **ID**  | **Requirement**                                                                                                                                                                                                       |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-10.1 | The Controls section shall display a table with columns: ID, Name, Status (Active / Archived / Draft), Prevent/Detect, Linked org units, Owner, Assets count, Cyber risks count, Key control flag, Control frequency. |
| FR-10.2 | Controls shall be searchable and filterable. The Controls section is read-only in CRM; it surfaces existing Control objects from Projects and the Object Library.                                                     |


#### FR-11 — Mitigation Plans


| **ID**  | **Requirement**                                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-11.1 | The Mitigation plans section shall display all treatment actions in a table with columns: ID, Name, Status, Severity level (1–5), Owner, Related risk, Assets count, Due date.                            |
| FR-11.2 | The user shall be able to create a new mitigation plan via a "+ New mitigation plan" button at the top-level section, or via the inline `+ Mitigation plan` CTA on any Cyber Risk row on the Results tab. |
| FR-11.3 | Mitigation plans shall be searchable, filterable, and paginated.                                                                                                                                          |
| FR-11.4 | Mitigation plans shall link to a Related risk (Cyber risk) and one or more Assets. Risk scenario level Mitigation Plan should be considered.                                                              |
| FR-11.5 | Mitigation strategies supported: mitigate, accept, avoid, transfer.                                                                                                                                       |
| FR-11.6 | Mitigation plan statuses: Open, In progress, Completed. `Overdue` is derived when `due_date < today()` AND status ≠ `Completed`.                                                                          |
| FR-11.7 | Mitigation plans shall be able to link to one or more existing Controls (to drive residual-risk calculation).                                                                                             |
| FR-11.8 | Email notifications shall be sent to the assigned owner on creation and on `Overdue` transition.                                                                                                          |


---

### 6.2 AI Functional Requirements — Cyber Risk Assessment Agent

> **AI Agents in MVP**
>
> Two AI agents are in scope for the MVP:
>
> - **"Sassy"** (must-have) — AI-suggested scoring and rationale, embedded within the Scoring step.
> - **"Classy"** (optional) — in case we provide file upload capability for assessment. Document intake to inform the assessment method, validated, users requires file upload and risk data identificatio by AI. Does it fit to the MVP scope?
>
> Both follow the **human-in-the-loop** principle: AI proposes, humans dispose. Nothing AI-generated is treated as final without explicit user approval. The MVP is explicitly AI-augmented, not agentic.

#### AI-FR-01 — Scenario Generation


| **ID**     | **Requirement**                                                                                                                                                                                       |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-FR-01.1 | When the assessment moves from Scoping to In progress, the system shall automatically generate risk scenarios as all valid combinations of [Impact × Threat × Vulnerability] from the scoped objects. |
| AI-FR-01.2 | Each scenario shall be labelled in the format: `"{Threat} on {Asset}"`.                                                                                                                               |
| AI-FR-01.3 | Scenarios shall be grouped under their parent Cyber risk and displayed in the two-level hierarchy described in FR-05.2.                                                                               |


#### AI-FR-02 — AI Score Suggestion (Sassy)


| **ID**       | **Requirement**                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| AI-FR-02.1   | For each generated scenario, Sassy shall suggest a Threat severity score (1–5) based on available data. |
| AI-FR-02.1.1 | Available data for Threat severity score                                                                |
| AI-FR-02.1.2 | Threat severity score ratings are pre-defined but configurable. The default scale is defined below.     |


**Threat Severity Scale — Default Definition (Asset-Level)**

Threat severity is determined by combining general threat characteristics with asset-level incident history. Incident history can only raise a severity level, never lower it below what the threat characteristics warrant on their own. When no incident data exists for an asset, the rating defaults to the threat characteristics column alone.


| **Level** | **Label**     | **Threat Characteristics**                                                                                                                                                               | **Asset-Level Incident History**                                                                                                                                                                     |
| --------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**     | **Very Low**  | Theoretical threat; requires highly specialised skills, significant resources, or difficult physical access. No known active exploitation in comparable environments.                    | No incidents recorded on this asset or assets of the same type. No near-misses or flagged anomalies in the monitoring history.                                                                       |
| **2**     | **Low**       | Known threat but rarely exploited in practice. Exploitation requires meaningful effort or specific conditions. Isolated incidents across industries.                                     | No direct incidents on this asset. One or more incidents recorded on similar assets in the organisation, but none recent (beyond 24 months).                                                         |
| **3**     | **Medium**    | Actively exploited in the wild with publicly available tools. A motivated attacker with moderate capability could realistically execute it. Incidents occur regularly across industries. | At least one incident recorded on this asset or a directly comparable asset within the last 24 months, OR a recent near-miss or anomaly flagged on this asset that did not escalate.                 |
| **4**     | **High**      | Widely and actively exploited with well-documented patterns and accessible tools. Executable by low-skill actors using automated methods.                                                | More than one incident recorded on this asset or assets of the same type within the last 12 months, OR one confirmed incident on this specific asset within the last 24 months with verified impact. |
| **5**     | **Very High** | Exploited at scale including in automated or opportunistic campaigns. Minimal attacker capability required. Documented targeting of organisations and asset types like yours.            | Repeated incidents on this specific asset, OR an active or recent (within 6 months) confirmed incident on this asset. Threat is demonstrably persistent against this asset or asset class.           |


| AI-FR-02.2   | For each generated scenario, Sassy shall suggest a Vulnerability severity score (1–5) based on available data. |  
| AI-FR-02.2.1 | Available data for Vulnerability severity score:  controls gaps (failed control test results) and related findings/CVEs  |  
| AI-FR-02.2.2 | Vulnerability severity score ratings are pre-defined but configurable. The default scale is defined below. |

**Vulnerability Severity Scale — Default Definition (Asset-Level)**

Vulnerability severity is determined by combining the intrinsic exploitability of the vulnerability with two asset-level data signals: (1) the effectiveness of related controls — controls linked to both the asset in scope and the vulnerability category — and (2) the volume and recency of related findings and CVEs on the asset. Controls can lower the severity below what exploitability alone would suggest; findings and CVEs can raise it. When no control or finding data exists for an asset, the rating defaults to the exploitability characteristics column alone.  
If no control, finding, or CVE data is available for a given asset, the assessment cannot be performed. In such cases, the agent must not hallucinate; instead, it should stop the assessment and return a “no data” message.

**Relationship between controls and severity:**

Related controls are those linked to **both** the asset in scope **and** the vulnerability category being assessed. A control linked to the asset but not to the relevant vulnerability category does not reduce severity. 


| **Level** | **Label**     | **Exploitability Characteristics**                                                                                                                                                       | **Related Controls** *(linked to this asset + vulnerability category)*                                                                                              | **Related Findings & CVEs** *(on this asset)*                                                                                                                                               |
| --------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**     | **Very Low**  | Vulnerability requires privileged access, highly specific conditions, or no known public exploit exists. Exploitation is theoretical. CVSS base score ≤ 3.9 (if applicable).             | One or more Active controls fully address this vulnerability category on this asset. Controls are recently verified (within 12 months). No control gaps identified. | No open findings and no CVEs mapped to this asset for this vulnerability category.                                                                                                          |
| **2**     | **Low**       | Exploit exists but requires significant effort, chaining with other vulnerabilities, or non-default configuration. Limited real-world exploitation observed. CVSS base score 4.0–5.9.    | Active controls partially address this vulnerability. Controls are in place but not recently verified, or minor gaps exist.                                         | Few open findings (1–2) of low severity, OR CVEs mapped to this asset with no active exploitation flag.                                                                                     |
| **3**     | **Medium**    | Exploit is publicly available and usable with moderate skill. Vulnerability is well-documented and patchable but may remain unpatched. CVSS base score 6.0–7.9.                          | Controls exist but are incomplete, outdated, or misaligned with the vulnerability category. At least one control gap identified with no compensating control.       | Multiple open findings (3–5) on this asset for this vulnerability category, OR at least one CVE with a known exploit mapped to this asset.                                                  |
| **4**     | **High**      | Exploit is widely available, reliable, and requires low skill. Commonly targeted in opportunistic campaigns. Patch or remediation is available but not applied. CVSS base score 8.0–9.9. | Controls are largely absent, ineffective, or in Draft/Archived status for this vulnerability category on this asset. No active compensating controls confirmed.     | Multiple open findings (6+) on this asset, OR one or more CVEs with active exploitation in the wild mapped to this asset, OR at least one finding unresolved beyond its due date.           |
| **5**     | **Very High** | Exploit is trivially executable (e.g. weaponised, wormable, no authentication required). Actively exploited in the wild at scale. CVSS base score 9.0+ or CISA KEV listed.               | No controls linked to this asset for this vulnerability category, OR all linked controls are Archived or Draft.                                                     | High volume of open findings on this asset (including critical/high severity), OR a CVE with active exploitation directly confirmed on this asset, OR multiple overdue findings unresolved. |


```
                                                                               |
```

| AI-FR-02.3 | The Likelihood score shall be automatically calculated as Threat severity × Vulnerability severity.                                                                                                             |
| AI-FR-02.4 | The Cyber risk score shall be automatically calculated as Impact (asset criticality) × Likelihood.                                                                                                              |
| AI-FR-02.5 | When Sassy has insufficient context to suggest a score for a scenario, that scenario's score fields shall be left blank, allowing the user to enter scores manually.                                            |
| AI-FR-02.6 | AI-suggested scores shall be pre-populated in the Scoring table and the Scoring Rationale page. They shall not be locked; the user may override any suggested score at any time.                                |
| AI-FR-02.7 | Sassy shall output a `confidence_flag` (high / medium / low) per scenario. Low-confidence suggestions shall be surfaced with a warning badge and sorted to the top of the scoring queue for reviewer attention. |

#### AI-FR-03 — Scoring Rationale Generation


| **ID**      | **Requirement**                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-FR-03.1  | For each scenario, Sassy shall generate a Scoring rationale — a written explanation presented in a rich text editor on the Scoring Rationale page.                                                                                          |
| AI-FR-03.2  | The scoring rationale shall address each of the following dimensions as separate paragraphs or labelled sections:                                                                                                                           |
| AI-FR-03.2a | • **Threat analysis:** Why the threat has the suggested severity, referencing the data was used for evaluation.                                                                                                                             |
| AI-FR-03.2b | • **Vulnerability analysis:** Why the vulnerability has the suggested severity, referencing the data was used for evaluation. Must name controls, CVEs considered.                                                                          |
| AI-FR-03.2c | • **Asset analysis:** The asset's criticality level and why it warrants that criticality (e.g. business function, data classification, transaction volume).                                                                                 |
| AI-FR-03.2d | • **Likelihood determination:** How threat severity and vulnerability severity combine to produce the likelihood score.                                                                                                                     |
| AI-FR-03.2e | • **Impact determination is the same as** the asset criticality level. It can suggest a different level if there are availabel data on the asset details page. See AI-FR-04.1                                                               |
| AI-FR-03.2f | • **Risk calculation:** The final cyber risk score and its interpretation, with any recommended remediation priority.                                                                                                                       |
| AI-FR-03.3  | The scoring rationale shall be editable by the user via the rich text editor. The user may add, remove, or modify any part of the rationale before approving the assessment.                                                                |
| AI-FR-03.4  | The rich text editor toolbar shall include at minimum: bold, italic, underline, strikethrough, font colour, highlight, text alignment, lists (bulleted and numbered), indent, table, block quote, attachment, link, image, and voice/audio. |
|             |                                                                                                                                                                                                                                             |


#### AI-FR-04 — Context Inputs


| **ID**     | **Requirement**                                                                                                                                                                                                                                                                                                                                                                                                 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-FR-04.1 | Sassy shall use the following context sources when generating scores and rationale: (a) Assessment instructions entered in the Details step; (b) Attachments uploaded in the Details step (JPG, PDF, XLS files); (c) Asset metadata (name, type, criticality, CIA ratings); (d) Threat metadata (name, domain); (e) Vulnerability metadata (name, domain, severity); (f) Existing controls linked to the asset. |
| AI-FR-04.2 | Sassy shall not require all context sources to be present. When context is partial, it shall generate rationale based on available information and indicate where context was limited.                                                                                                                                                                                                                          |
| AI-FR-04.3 | Sassy shall not call external systems or the internet at runtime. All context must come from within the assessment and the platform's own data.                                                                                                                                                                                                                                                                 |


#### AI-FR-05 — User Interaction & Feedback


| **ID**     | **Requirement**                                                                                                                                                                                                                                                                                |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-FR-05.1 | The user shall be able to override any AI-suggested score (Impact, Threat severity, Vulnerability severity, Likelihood, Cyber Risk Score) via an editable dropdown on the Scoring Rationale page. Overriding a score shall trigger automatic recalculation of Likelihood and Cyber risk score. |
| AI-FR-05.2 | Score override shall not trigger regeneration of the AI rationale. The user's manual override is final and the rationale text remains editable independently.                                                                                                                                  |
| AI-FR-05.3 | The user shall be able to add free text to the Scoring rationale field at any time.                                                                                                                                                                                                            |
| AI-FR-05.4 | Any changes in the rationale should be loged with a user name, timestamp and the scope (what changed)                                                                                                                                                                                          |
| AI-FR-05.5 | A scenario might not be relevant. n/a.                                                                                                                                                                                                                                                         |


#### AI-FR-06 — Failure States & Fallbacks


| **ID**     | **Requirement**                                                                                                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-FR-06.1 | If Sassy fails to generate a score for a scenario (e.g. service unavailable, context too sparse), that scenario's score fields shall be left blank. The user shall be able to enter scores manually. |
| AI-FR-06.2 | If Sassy fails to generate a rationale, the rationale field shall be blank but still editable.                                                                                                       |
| AI-FR-06.3 | The system shall not block assessment progression if AI generation fails. The user shall always be able to complete the assessment manually.                                                         |
| AI-FR-06.4 | The system shall not display raw AI errors to the user. Failure states shall be presented as empty editable fields or an inline "Retry" button, not raw error messages.                              |
| AI-FR-06.5 | If the AI gateway is unavailable, a banner shall inform the user that AI suggestions are temporarily offline. The Scoring screen shall remain fully functional for manual entry.                     |


#### AI-FR-07 — AI Agent "Classy" — Document Intake (Needs Validation)

> **Status:** Needs technical  validation if this fits to the MVP Scope


| **ID**     | **Requirement**                                                                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AI-FR-07.1 | Classy shall ingest customer-uploaded documents (PDF, DOCX, XLSX, TXT; ≤ 20 MB each; ≤ 10 per assessment) on the Details tab and summarise them into structured method inputs that Sassy can consume when scoring. |
| AI-FR-07.2 | Classy shall output a structured summary (≤ 500 words) per document extracting: threat and vulnerability related data and impact data related to a registered asset or assets.                                     |
| AI-FR-07.3 | No summarisation output shall be automatically applied; every extracted item is a suggestion that the user explicitly accepts.                                                                                     |
| AI-FR-07.4 | Uploaded files shall never leave the tenant data boundary. File parse failures shall produce a clear user-facing error and not silently drop the file.                                                             |
| AI-FR-07.5 | If Classy is disabled or fails, the Details tab shall remain fully usable as a manual free-text method-notes screen.                                                                                               |


---

## 7. Non-Functional Requirements

### 7.1 Standard Non-Functional Requirements


| **ID**    | **Category**         | **Requirement**                                                                                                                                                                                                                                                     |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01.1  | Scoring              | The 5-level score band system (1–25, 26–50, 51–75, 76–100, 101–125) and colour coding (green → yellow → orange → red → dark red) shall be applied consistently across all score displays: heat maps, inline badges, donut charts, and table cells.                  |
| NFR-01.2  | Scale                | The asset selection grid shall support up to 10,000 assets per tenant with p95 search response ≤ 500 ms. Up to 500 active assessments per tenant. Up to 20,000 scenarios per assessment (exceeding triggers a warning and segmentation recommendation).             |
| NFR-01.3  | Navigation           | All sections of Cyber Risk Management shall be accessible via the left-hand navigation of Asset Manager without requiring separate login.                                                                                                                           |
| NFR-01.4  | Permissions          | The module shall respect the IT Risk Manager and Risk Manager role permission model. Role-based access controls shall govern who can create, edit, and approve assessments.                                                                                         |
| NFR-01.5  | Responsiveness       | Assessment status changes (e.g. Draft → Scoping) shall be reflected immediately in the UI without page reload. Autosave shall survive browser refresh and session expiry.                                                                                           |
| NFR-01.6  | Attachments          | Attachment uploads shall enforce the formats JPG, PDF, XLS and a maximum file size of 5 MB per file. Expanded limits (PDF, DOCX, XLSX, TXT; ≤ 20 MB; ≤ 10 files) apply when Classy is enabled.                                                                      |
| NFR-01.7  | IDs                  | Assessment object IDs (CRA-XXX, RSK-XXX, AST-XXX, THR-XXX, VUL-XXX, MP-XXX) shall have a unique prefix set up by the IT Risk Manager.                                                                                                                               |
| NFR-01.8  | Performance          | Assessment list page loads at p95 ≤ 2 s. Scenario generation for up to 200 assets × 50 threats × 50 vulnerabilities completes in p95 ≤ 15 s (excluding AI suggestion time). Heat map renders in p95 ≤ 1.5 s. Exports complete in p95 ≤ 30 s.                        |
| NFR-01.9  | Audit                | Every domain-object change shall be captured in an immutable, append-only audit log visible to users with the Reviewer role or higher. Audit log is exportable.                                                                                                     |
| NFR-01.10 | Exports              | Every export (PDF, XLSX, PPTX) shall embed assessment ID, export timestamp, and user identity in the footer.                                                                                                                                                        |
| NFR-01.11 | Accessibility        | WCAG 2.1 AA compliance across all CRM screens. Heat map and distribution charts must be navigable and screen-readable (data tables as accessible fallback). Keyboard-only navigation through the full assessment workflow must be possible.                         |
| NFR-01.12 | Internationalisation | UI strings localisable; English (EN-US, EN-GB) at GA; German, French, Dutch, Spanish within 1 quarter post-GA. Threat and Vulnerability Library descriptions ship with translations for GA locales.                                                                 |
| NFR-01.13 | Security & Privacy   | All data at rest encrypted per D1P standard; tenant isolation enforced end-to-end. Module is SOC 2 and ISO 27001 in-scope under existing D1P certifications. No customer content is used to train models; this must be visible in the in-product privacy statement. |
| NFR-01.14 | Observability        | Product telemetry captures: assessment-lifecycle transitions, scenario action events (AI/user), Sassy accept/edit/reject, Classy parse outcomes, export events, dashboard views.                                                                                    |


### 7.2 AI Quality & Performance Requirements


| **ID**    | **Category**         | **Requirement**                                                                                                                                                                                                                                                                                                                 |
| --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AI-NFR-01 | Performance          | AI score and rationale generation shall not block the user from navigating the Scoring tab. Scores may populate asynchronously; a loading indicator shall be shown while generation is in progress. p95 latency to first token ≤ 3 s; p95 latency for full rationale ≤ 10 s.                                                    |
| AI-NFR-02 | Accuracy             | AI-suggested Threat severity and Vulnerability severity scores shall be based on documented threat characteristics and vulnerability properties, not random or arbitrary values. The rationale shall be internally consistent (the explanation shall support the suggested score). AI suggestion acceptance rate target: ≥ 60%. |
| AI-NFR-03 | Transparency         | The AI rationale shall always include the reasoning behind each score component (Threat, Vulnerability, Asset, Likelihood, Impact). Users shall never see a score without an accompanying explanation.                                                                                                                          |
| AI-NFR-04 | Editability          | 100% of AI-generated outputs (scores and rationale) shall be overridable by the user. No AI output shall be locked or treated as authoritative without user review.                                                                                                                                                             |
| AI-NFR-05 | Cost & Budget        | AI generation cost per assessment shall be monitored. High scenario counts may generate many scenarios; cost per assessment shall be tracked and thresholds defined during implementation.                                                                                                                                      |
| AI-NFR-06 | Safety & Compliance  | The AI agent shall not transmit customer asset data, vulnerability data, or assessment content to external third-party systems. All AI inference shall comply with Diligent's data handling and regional data residency policies. All AI calls route through the D1P AI Gateway; no direct model calls from the client.         |
| AI-NFR-07 | Regional Support     | AI-generated rationale text shall be produced in the language of the assessment instructions provided by the user, where feasible.                                                                                                                                                                                              |
| AI-NFR-08 | Model Agnosticism    | This PRD does not prescribe a specific AI model, architecture, or prompt strategy. Model selection and implementation details are engineering decisions. Prompt versions are tracked; a prompt change cannot be rolled out without an evaluation delta report.                                                                  |
| AI-NFR-09 | Graceful Degradation | The product shall be fully functional without AI scoring. A tenant-level "AI features" toggle shall allow customers to disable AI suggestions entirely. If the AI service is unavailable, all score fields shall be blank and manually enterable. The assessment workflow shall not be blocked.                                 |
| AI-NFR-10 | Tenant Isolation     | No cross-tenant data may appear in prompts or outputs; enforced at the orchestration layer. No PII shall be stored in AI telemetry; prompt/response logs must hash any asset-owner names.                                                                                                                                       |
| AI-NFR-11 | Evaluation           | An evaluation dataset of ≥ 200 human-scored scenarios shall be curated pre-GA and used as the regression benchmark. Factuality spot-checks target: ≥ 95% of rationales cite only real inputs. Scale-violation rate target: < 0.5% of calls.                                                                                     |


---

## 8. Dependencies & Rollout

### 8.1 Key Dependencies


| **Dependency**                                                                                                                     | **Owner**                | **Target**                        | **Risk if missed**                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Asset-to-Control direct connection (from Project app and Object Library)                                                           | Engineering              | End of Q2 2026                    | Scope-tab controls display incomplete; residual risk calculation degraded. Required for Vulnerability Severity scoring — controls linked to asset + vulnerability category cannot be evaluated without this link. |
| Integration to Object Library for Risks, Controls, Processes                                                                       | Engineering              | End of Q2 2026                    | Controls library surfaces incomplete data; control-gap signals unavailable to Sassy for vulnerability severity scoring.                                                                                           |
| Threat Category library (seeded content, ISO 27005 / threat domain taxonomy)                                                       | Engineering / Content    | Q2 2026                           | No library = no scenarios; Sassy has no threat metadata to ground threat severity scores.                                                                                                                         |
| Vulnerability Category library (seeded content, with findings and CVE linkage)                                                     | Engineering / Content    | Q2 2026                           | No library = no scenarios; findings and CVE data unavailable to Sassy for vulnerability severity scoring.                                                                                                         |
| Findings and CVE data linkage to assets (via Tenable / Qualys connectors)                                                          | Engineering / Connectors | Q2 2026                           | Sassy cannot evaluate vulnerability severity at asset level; vulnerability severity defaults to exploitability characteristics only, reducing AI scoring quality.                                                 |
| Permission model (IT Risk Manager / Risk Manager roles)                                                                            | Engineering              | Q2 2026                           | Cannot enforce RBAC; FR-00 Cyber Risk Settings (scale configuration) cannot be access-controlled to IT Risk Manager role.                                                                                         |
| Risk Manager alignment — Cyber Risk Score Scale and lifecycle statuses                                                             | RM team / Product        | Before FR-00 implementation       | Misaligned score bands and lifecycle states between CRM and Risk Manager; FR-00.1 requires cross-product agreement before scale configuration ships.                                                              |
| Risk Manager alignment — Cyber Risk Score Scale heatmap matrix configuration                                                       | RM team / Product        | Before FR-00 implementation       | Heat map grid and band thresholds must be consistent across CRM and Risk Manager; divergence creates conflicting risk reporting.                                                                                  |
| Cyber Risk Settings configuration UI (FR-00) — scale definitions for Threat Severity, Vulnerability Severity, Cyber Risk Score     | Engineering              | Before manual workflow milestone  | Assessors cannot score without a confirmed active scale; AI scoring logic (Sassy) depends on the configured scale definitions at inference time.                                                                  |
| D1P AI Gateway capacity and routing                                                                                                | AI Platform              | Before Sassy milestone            | Sassy cannot ship.                                                                                                                                                                                                |
| AI assessment agent — Sassy — including Threat Severity Scale (AI-FR-02.1.2) and Vulnerability Severity Scale (AI-FR-02.2.2) logic | Engineering / AI team    | Q3 2026                           | Assessment scoring is manual-only; asset-level incident history and control-gap signals are not applied automatically.                                                                                            |
| Customer CAB validation for Classy                                                                                                 | PM / CS                  | Before Classy engineering kickoff | Ship a feature no one wants — or descope correctly.                                                                                                                                                               |
| Cyber Risk subscription entitlement for new customers                                                                              | Platform / Entitlement   | Mid August 2026                   | Cannot charge new customers.                                                                                                                                                                                      |


### 8.2 Go-To-Market


| **Milestone**     | **Timing**         | **Detail**                                                                                                                      |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| Working Prototype | End of May 2026    | Fully interactive prototype with mock data for demo purposes only for Solution Engineers - Product responsibility               |
| Sales Enablement  | May 2026           | Internal sessions for Sales and Pre-Sales; Internal technical enablement for Solution Engineers; InfoSecurity Conference London |
| Active Selling    | June 2026 onwards  | Sales motions begin against existing pipeline; prototype is the primary demo vehicle for SE                                     |
| MVP Release       | End of August 2026 | Customer-deployable release. Prototype retired.                                                                                 |


### 8.3 Entitlements

- **Existing Asset Manager customers:** Cyber Risk Management module available immediately upon MVP release at no additional charge.
- **New customers:** Available only with a Cyber Risk subscription. Feature toggle available.
- **AI toggle:** Per AI-NFR-09, AI features can be disabled per tenant without breaking the workflow.

---

## 9. Integrations


| **Integration**                        | **Direction** | **Purpose**                                                         | **Existing vs. New**  |
| -------------------------------------- | ------------- | ------------------------------------------------------------------- | --------------------- |
| Asset Manager (AM)                     | Read/Write    | Source of assets, CIA criticality                                   | Existing              |
| Control repository (Projects + new OL) | Read          | Controls linked to assets; asset↔control direct link by end Q2 2026 | Existing (dependency) |
| Risk Manager (RM)                      | Read          | Risk register alignment; scenario lifecycle aligned to RM lifecycle | Existing              |
| Tenable                                | Read          | Vulnerability findings                                              | Existing connector    |
| Qualys                                 | Read          | Vulnerability findings                                              | Existing connector    |
| D1P AI Gateway                         | Read/Write    | Routes Sassy / Classy / assistant calls                             | Existing              |
| Notification service (email)           | Send          | Treatment owner notifications (FR-11.8)                             | Existing              |
| Export service (PDF/XLSX/PPTX)         | Send          | Dashboard and report exports                                        | Existing              |


> MVP does not include new connectors or external threat-intel feeds.

---


|     |     |     |     |
| --- | --- | --- | --- |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |
|     |     |     |     |


---

## 11. Open Questions


| **#** | **Question**                                                                                                                                                                                                                                             | **Owner**              | **Priority** |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------ |
| 1     | Should the Quantitative assessment method (ALE) be scoped into MVP or explicitly deferred to a future release? The prototype shows it as selectable; the original brief showed it as disabled.                                                           | Product                | High         |
| 2     | What is the maximum number of risk scenarios an assessment can generate (Assets × Threats × Vulnerabilities)? Is there a cap or performance limit? Should scenario generation pre-compute all combinations upfront or lazily on access?                  | Engineering            | High         |
| 3     | How is the Overall cyber risk score on the Overview dashboard calculated? Is it an aggregate of all approved assessments, or the most recent assessment per asset? What is the Cyber Risk (first-level) aggregation rule: max band vs. weighted average? | Product / Engineering  | High         |
| 4     | Threat taxonomy: ISO 27005 categories, prototype "threat domain" groupings, or both (with mapping)?                                                                                                                                                      | Product / SMEs         | High         |
| 5     | What is the control-weighting algorithm for residual-risk calculation?                                                                                                                                                                                   | Product / SMEs         | High         |
| 6     | Can multiple users be assigned as owners/co-owners of a single assessment? (Validated customer feedback requests this.)                                                                                                                                  | Product                | High         |
| 7     | Should the Scoring Rationale page show the AI's confidence level or indicate which context sources were used for a given score?                                                                                                                          | Product / AI           | Medium       |
| 8     | Is regional scoping (e.g. EU assets only vs. US assets) required in v1? Customer interviews confirm demand for this.                                                                                                                                     | Product                | Medium       |
| 9     | What is the archive/retention policy for approved assessments? When do they move from Approved to Archived? (Default archival period X is tenant-configurable.)                                                                                          | Product                | Medium       |
| 10    | Should the Mitigation plan risk decision (Accept / Mitigate / Avoid / Transfer) be visible directly on the Results tab, or only when creating a mitigation plan? Is Strategy a list column, detail-only field, or missing from current design?           | Product / Design       | Medium       |
| 11    | Is "Back to scoring" regression gated by role? If yes, which role?                                                                                                                                                                                       | Product / AM Security  | Medium       |
| 12    | Resolve attachment-limit divergence: prototype shows JPG/PDF/XLS at 5 MB; Classy requires wider formats at 20 MB / 10 files. MVP non-AI path should use proto limits; Classy-enabled path expands them. Confirm.                                         | Engineering / Product  | Medium       |
| 13    | How does the AI agent handle scenarios where the attachment content is not machine-readable (e.g. scanned PDFs, handwritten notes)?                                                                                                                      | Engineering / AI       | Medium       |
| 14    | What success metric defines "AI scoring quality" beyond acceptance rate? Is a human review/audit trail of AI override events required?                                                                                                                   | Product / AI           | Low          |
| 15    | Do we allow user-defined scoring matrices post-MVP, and if so when?                                                                                                                                                                                      | Product                | Low          |
| 16    | Exact localisation SLA post-GA (which locales, which sprint)?                                                                                                                                                                                            | Product / Localisation | Low          |
| 17    | Entitlement UX for the "Cyber Risk" SKU: how do existing AM customers see module availability at GA?                                                                                                                                                     | Packaging              | Before GA    |


---

## 12. Change Log


| **Date**    | **Version** | **Author**   | **Change**                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | ----------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 16 Apr 2026 | 1.0         | Adél Carlson | Initial draft. Based on prototype v1 at cyber-risk-assessment-proto.netlify.app. Covers standard product + AI assessment agent.                                                                                                                                                                                                                                                                                               |
| 20 Apr 2026 | 1.1         | Adél Carlson | Reconciled with Atlas prototype (cra-new.netlify.app). Added: competitive context, AI positioning, supporting RBAC roles, lifecycle states, inherent vs. residual risk model, Classy agent, conversational assistant, integrations section, risks & mitigations, expanded open questions. Updated scoring model to 25×5 / 1–125 scale per prototype. Expanded FR coverage for scope, scoring, results, and mitigation plans.  |
| 21 Apr 2026 | 1.2         | Adél Carlson | Added Threat Severity Scale (1–5) to §6.2 AI-FR-02, defining the default scoring dimension for Sassy. Scale combines general threat characteristics with asset-level incident history across four dimensions: attacker capability, tool accessibility, observed frequency, and incident recency weighting.                                                                                                                    |
| 21 Apr 2026 | 1.3         | Adél Carlson | Added FR-00 — Cyber Risk Settings as the first subsection of §6.1. Covers configurable scales for Cyber Risk Score (aligned with Risk Manager), Threat Severity (referencing AI-FR-02.1.2), and Vulnerability Severity. Includes rules on scope, access, and non-retroactive application.                                                                                                                                     |
| 21 Apr 2026 | 1.4         | Adél Carlson | Added Vulnerability Severity Scale (1–5) to §6.2 AI-FR-02.2.2, mirroring the Threat Severity Scale structure. Scale combines exploitability characteristics with two asset-level data signals: related controls (Active controls linked to both the asset and the vulnerability category) and related findings/CVEs (volume, severity, recency). Includes recency/severity weighting table and control-status exclusion rule. |
| 21 Apr 2026 | 1.5         | Adél Carlson | Removed §8.2 Release Phases & Milestones. Updated §8.1 Key Dependencies to reflect additions from v1.2–v1.4: added dependencies for findings/CVE data linkage, FR-00 Cyber Risk Settings UI, Risk Manager alignment on score scale and heatmap, and expanded Sassy dependency to cover Threat and Vulnerability Severity Scale logic. Renumbered §8.3 Go-To-Market → §8.2 and §8.4 Entitlements → §8.3.                       |


---

