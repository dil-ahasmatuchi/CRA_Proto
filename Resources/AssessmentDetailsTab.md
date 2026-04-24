# Assessment details (`AssessmentDetailsTab`)

Source: `[src/pages/AssessmentDetailsTab.tsx](../src/pages/AssessmentDetailsTab.tsx)` (uses `[AssessmentDetailHeader](../src/components/AssessmentDetailHeader.tsx)` and tab content components).

The document has **three** main sections: **Description**, **Flows**, and **Main actions & page elements**.

---

## 1. Description

This page is the **cyber risk assessment** workspace: it shows and edits **assessment object details**, drives **lifecycle status**, and hosts the **Scope**, **Scoring**, and **Results** experiences in tabs. It is used for **creating a new assessment** (draft stored in browser local storage), **opening an existing mock assessment** from the list by ID, or **continuing a draft** after navigation (for example, returning from scenario rationale with state restored).

Routes:

- `/cyber-risk/cyber-risk-assessments/new` — new assessment (no URL id).
- `/cyber-risk/cyber-risk-assessments/:assessmentId` — assessment loaded from mock data (`getRiskAssessmentById`); invalid IDs redirect to the assessments list.

---

## 2. Flows

### Add new assessment

User opens **New assessment** from the assessments list. The page loads with default name, empty custom ID, default owners, **Draft** phase, and the **Details** tab. Edits are persisted to `**cra_new_assessment_draft_v1`** in `localStorage` on change (save handler). Including assets in scope can auto-advance phase from **Draft** toward **Scoping** (see implementation in the tab file). **Move to scoping** / **Move to scoring** advance phase and switch tabs; **Approve assessment** marks the assessment approved and opens **Results**.

### View assessment details

User opens an assessment from the list with a valid `:assessmentId`. Header metadata (created, last updated, and so on) reflects **mock** assessment data where available. Tabs behave the same structurally; persistence for “new” flow is skipped when a route assessment ID is present.

### Edit assessment

User changes **Details** fields (name, custom ID, type, owners, due date, method, instructions, attachments UI), **Scope** inclusion, **Scoring** interactions, and **Results** views. Status can be changed from the **status dropdown** (with constraints: some statuses are display-only). **Save** writes the draft for the **new** assessment path only.

---

## 3. Main actions and page elements

### 3.1 Main actions

Generic product intent (aligned with the header controls):


| Action                 | Role                                         | Effect (intended)                                                                                                                                                                                                  |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Save**               | Primary button                               | Persists progress (in this prototype: writes the new-assessment draft to `localStorage`; no-op when viewing a fixed `:assessmentId` from mock data).                                                               |
| **More**               | Tertiary icon button                         | Reserved for overflow actions; `**AssessmentDetailsTab` does not pass `onMoreClick`**, so the control is present but **not wired** to a menu in the prototype. Intended actions can include **Delete assessment**. |
| **Move to scoping**    | Tertiary text button (label varies by phase) | From **Draft**: sets phase to **Scoping** and switches to the **Scope** tab.                                                                                                                                       |
| **Move to scoring**    | Tertiary text button                         | From **Scoping**: sets phase to **Scoring** (internal phase `inProgress`) and switches to the **Scoring** tab.                                                                                                     |
| **Approve assessment** | Tertiary text button                         | From **Scoring** / **Overdue** (when AI scoring run is complete): sets phase to **Approved** and switches to the **Results** tab.                                                                                  |
| **Back to scoring**    | Shown when phase is **Approved**             | Returns to **Scoring** phase and tab for further edits.                                                                                                                                                            |


**Status dropdown** (chip + menu): displays current status and allows changing to selectable lifecycle states (**Draft**, **Scoping**, **Scoring**). **Approved** and **Overdue** appear in the list but are **not selectable** (informational).

### 3.2 Page elements

Top to bottom, main header layout (from `AssessmentDetailHeader` + `PageHeader`).

#### Page header

- **Breadcrumbs** — `OverflowBreadcrumbs`: leading “Asset manager”, then **Cyber risk management** and **Cyber risk analysis** (links to assessments URL).
- **Back** — Returns to **Cyber risk assessments** list (or **Back to scope overview** when a Scope drill-down is active).
- **Page title** — Assessment name, or “New cyber risk assessment” if empty.
- **Page subtitle** — Shown only in **Scope drill-down** (subview title / description).
- **Status** — **Status dropdown**: current status chip (with dot colors), opens menu of statuses; **Approved** / **Overdue** are non-selectable.
- **Tertiary row (right side)** — Dynamic **phase CTA** (“Move to scoping”, “Move to scoring”, “Approve assessment”, “Done”, or **hidden** while AI scoring is processing when approval is not yet available) + **Save** (contained) + **More** (icon).
- **Scope drill-down mode** — Replaces the default actions with **Cancel** (back to scope overview) and **Done** (finish drill-down). Breadcrumbs gain an extra crumb; tabs are **hidden**.

#### Metadata row (below header, main view only)

- **ID** — System-style identifier (`CRA-###`), generated once per header mount for the prototype.
- **Custom ID** — User-defined code from the Details form (or “—”).
- **Due date** — From Details scheduling field (or “—”).
- **Created** — From mock assessment when viewing by ID; otherwise “—”.
- **Created by** — Derived from selected **Owners** (joined names).
- **Last updated** — From mock `dueDate` when viewing by ID (placeholder-style); otherwise “—”.
- **Last updated by** — Mock owner name when viewing by ID; otherwise “—”.

#### Tabs (main view only)

`aria-label`: “Cyber risk assessment sections”.

1. **Details**
2. **Scope**
3. **Scoring**
4. **Results**

---

#### Details tab (`index 0`)

- **Name** — Text field.
- **Custom ID** — Text field (placeholder e.g. `CRA-001`).
- **Assessment type** — Select (**Cyber risk assessment**, **Enterprise risk assessment**); supports non-standard value display if present in data.
- **Owner** — Multi-select **Autocomplete** (user lookup presets).
- **Scheduling** (section heading)
  - **Due date** — Text field with **Clear** and **Calendar** icon buttons (calendar is visual only in prototype).
- **Select assessment method** (caption-style section title)
  - **Qualitative** / **Quantitative** — Radio group (**Quantitative** disabled with tooltip “Currently not available.”).
  - Descriptive copy under each option (qualitative explains Impact × Likelihood, and so on).
- **Instructions** (`SectionHeader` + `AssessmentWysiwygEditor`) — Rich text **Assessment instructions** (required field in editor).
- **Attachments** — Dashed drop zone; **Drag files here** + **browse** link; hidden file input (`.jpg`, `.jpeg`, `.pdf`, `.xls`, `.xlsx`).

---

#### Scope tab (`index 1`, `AssessmentScopeTab`)

- **Overview** — Cards for **Assets**, **Cyber risks**, **Threats**, **Vulnerabilities** (counts, **Include** / **Open** style actions per card; **Include assets** on the assets card).
- **Drill-down subviews** — Choosing a catalog opens a **detail** layout: header shows subview **title** / **subtitle**, extended breadcrumbs, **Cancel** / **Done**, and content such as:
  - **Assets** — Data grid (include toggles, filters, toolbar).
  - **Cyber risks** — Data grid of risks linked to included assets; **Included** / **Not included** column (same pattern as assets), toolbar filters, and bulk header toggle; exclusions persist as `excludedScopeCyberRiskIds` in draft/catalog.
  - **Threats**, **Controls** — Same inclusion column, filters, and bulk header; rows are candidates from linked cyber risks; toggles are disabled when no linked cyber risk is in effective scope; exclusions persist as `excludedScopeThreatIds` / `excludedScopeControlIds`.
  - **Vulnerabilities** — Same inclusion UX; exclusions persist as `excludedScopeVulnerabilityIds`.

(Subview state is `scopeSubView`; returning to overview clears drill-down when leaving the Scope tab.)

---

#### Scoring tab (`index 2`, `AssessmentScoringTab`)

- Empty state if **no assets** in scope — message + CTA to go to **Scope**.
- Optional **AI scoring** card (when phase allows and scope has assets/scenarios) — copy, **Start AI scoring**, scoring methodology text.
- **Aggregation method** — Radio group (when AI phase complete and table present).
- **Scenarios / cyber risks** scoring **table** — Rows for scoped scenarios, score controls, links to scenario detail routes, and so on.

---

#### Results tab (`index 3`, `AssessmentResultsTab`)

- Overview charts / heatmaps and related **Results** content; **Back to scoring** navigation when applicable from within that tab.

---

*Last reviewed against `AssessmentDetailsTab.tsx` and `AssessmentDetailHeader.tsx`.*