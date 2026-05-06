### Cyber Risk Assessment - Database & API Implementation

## ✅ Complete Implementation

### 1. Database Tables Created

#### **cyber_risk_assessments** (Main table)
Stores assessment metadata and settings.

```sql
- id (TEXT, PK)
- display_id (TEXT, UNIQUE) -- "ASM-001", "ASM-002"
- name (TEXT)
- assessment_type (TEXT) -- default: 'cyber_risk'
- start_date (TEXT)
- due_date (TEXT)
- completed_at (TEXT)
- phase (TEXT) -- draft, scoping, inProgress, review, overdue, assessmentApproved
- owner_ids (TEXT) -- comma-separated: "user-1,user-2"
- scoring_type (TEXT) -- inherent, residual
- aggregation_method (TEXT) -- highest, average
- ai_scoring_phase (TEXT) -- idle, processing, complete
- ai_scoring_completed_at (TEXT)
- created_at (TEXT)
- updated_at (TEXT)
```

#### **assessment_scope_assets**
Tracks which assets are included in each assessment.

```sql
- id (TEXT, PK)
- assessment_id (TEXT, FK -> assessments.id)
- asset_id (TEXT) -- References assets.display_id
- included (BOOLEAN)
- added_at (TEXT)
```

#### **assessment_exclusions**
Tracks explicitly excluded catalog items (risks, threats, vulns, controls, scenarios).

```sql
- id (TEXT, PK)
- assessment_id (TEXT, FK -> assessments.id)
- entity_type (TEXT) -- 'cyber_risk', 'threat', 'vulnerability', 'control', 'scenario'
- entity_id (TEXT) -- Display ID of excluded entity
- reason (TEXT)
- excluded_at (TEXT)
```

#### **scenarios**
Generated scenarios for each assessment, scored by AI or manually.

```sql
- id (TEXT, PK)
- display_id (TEXT, UNIQUE) -- "SC-001", "SC-002"
- assessment_id (TEXT, FK -> assessments.id)
- name (TEXT)
- asset_id (TEXT) -- AST-001
- cyber_risk_id (TEXT) -- CRK-001
- threat_id (TEXT) -- THR-001
- vulnerability_id (TEXT) -- VUL-001 (nullable)

-- Scores (NULL until scored)
- impact (INTEGER) -- 1-5
- impact_label (TEXT)
- threat_severity (INTEGER) -- 1-5
- threat_severity_label (TEXT)
- vulnerability_severity (INTEGER) -- 1-5
- vulnerability_severity_label (TEXT)
- likelihood (INTEGER) -- 1-25
- likelihood_label (TEXT)
- cyber_risk_score (INTEGER) -- 1-125
- cyber_risk_score_label (TEXT)
- scoring_rationale (TEXT) -- Markdown

-- Status
- status (TEXT) -- active, archived
- is_not_applicable (BOOLEAN)
- is_excluded (BOOLEAN)

-- Metadata
- created_at (TEXT)
- updated_at (TEXT)
- scored_at (TEXT)
- scored_by (TEXT) -- 'ai', 'manual', or user ID
```

#### **scenario_relationships** (Optional, for future)
Tracks many-to-many relationships between scenarios and threats/vulns/controls.

```sql
- id (TEXT, PK)
- scenario_id (TEXT, FK -> scenarios.id)
- entity_type (TEXT) -- 'threat', 'vulnerability', 'control'
- entity_id (TEXT) -- Display ID
```

---

## 2. Relationships

```
cyber_risk_assessments (1) ──┬──> (M) assessment_scope_assets ──> asset_id
                              │
                              ├──> (M) assessment_exclusions
                              │
                              └──> (M) scenarios ┬──> asset_id
                                                  ├──> cyber_risk_id
                                                  ├──> threat_id
                                                  └──> vulnerability_id
```

### Foreign Keys & Cascades
- `assessment_scope_assets.assessment_id` → `assessments.id` (ON DELETE CASCADE)
- `assessment_exclusions.assessment_id` → `assessments.id` (ON DELETE CASCADE)
- `scenarios.assessment_id` → `assessments.id` (ON DELETE CASCADE)

**Result**: Deleting an assessment automatically deletes all scope, exclusions, and scenarios.

---

## 3. API Endpoints

### **Assessments CRUD**

#### `POST /api/cyber-risk-assessments`
Create new assessment.

**Request:**
```json
{
  "name": "Q1 2026 Security Assessment",
  "assessmentType": "cyber_risk",
  "startDate": "2026-01-01",
  "dueDate": "2026-03-31",
  "ownerIds": ["user-123", "user-456"],
  "scoringType": "inherent",
  "aggregationMethod": "highest"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid-...",
  "displayId": "ASM-001",
  "name": "Q1 2026 Security Assessment",
  "phase": "draft",
  "scoringType": "inherent",
  "aggregationMethod": "highest",
  "aiScoringPhase": "idle",
  "createdAt": "2026-05-06T10:00:00Z"
}
```

---

#### `GET /api/cyber-risk-assessments`
List all assessments with stats.

**Query params:** `?phase=draft&owner=user-123`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-...",
    "displayId": "ASM-001",
    "name": "Q1 2026 Security Assessment",
    "phase": "scoring",
    "startDate": "2026-01-01",
    "dueDate": "2026-03-31",
    "ownerIds": ["user-123"],
    "scoringType": "inherent",
    "aggregationMethod": "highest",
    "aiScoringPhase": "complete",
    "createdAt": "2026-05-06T10:00:00Z",
    "updatedAt": "2026-05-06T12:30:00Z",
    "stats": {
      "scenarios": 45,
      "scopedAssets": 12,
      "scenariosScored": 38
    }
  }
]
```

---

#### `GET /api/cyber-risk-assessments/:id`
Get single assessment with detailed stats.

**Response:** `200 OK`
```json
{
  "id": "uuid-...",
  "displayId": "ASM-001",
  "name": "Q1 2026 Security Assessment",
  "phase": "scoring",
  "startDate": "2026-01-01",
  "dueDate": "2026-03-31",
  "completedAt": null,
  "ownerIds": ["user-123"],
  "scoringType": "inherent",
  "aggregationMethod": "highest",
  "aiScoringPhase": "complete",
  "aiScoringCompletedAt": "2026-05-06T12:30:00Z",
  "createdAt": "2026-05-06T10:00:00Z",
  "updatedAt": "2026-05-06T12:30:00Z",
  "stats": {
    "scenarios": 45,
    "scenariosScored": 38,
    "scenariosNotApplicable": 3,
    "scopedAssets": 12
  }
}
```

---

#### `PATCH /api/cyber-risk-assessments/:id`
Update assessment fields.

**Request:**
```json
{
  "name": "Updated name",
  "phase": "inProgress",
  "aggregationMethod": "average",
  "aiScoringPhase": "complete"
}
```

**Response:** `200 OK` (updated assessment object)

**Auto-behaviors:**
- Setting `phase: "assessmentApproved"` → sets `completed_at`
- Setting `aiScoringPhase: "complete"` → sets `ai_scoring_completed_at`

---

#### `DELETE /api/cyber-risk-assessments/:id`
Delete assessment and all related data (cascades).

**Response:** `204 No Content`

---

### **Assessment Scope**

#### `GET /api/cyber-risk-assessments/:id/scope`
Get scoped assets for this assessment.

**Response:** `200 OK`
```json
{
  "assessmentId": "ASM-001",
  "assets": [
    {
      "assetId": "AST-001",
      "assetName": "Payment Server",
      "assetType": "Server",
      "criticality": 5,
      "criticalityLabel": "Very high",
      "included": true,
      "addedAt": "2026-05-06T10:10:00Z"
    }
  ]
}
```

---

#### `PUT /api/cyber-risk-assessments/:id/scope`
Replace entire scope (bulk update).

**Request:**
```json
{
  "assetIds": ["AST-001", "AST-002", "AST-003"]
}
```

**Response:** `200 OK`
```json
{
  "assessmentId": "ASM-001",
  "scopedAssets": 3,
  "updatedAt": "2026-05-06T10:15:00Z"
}
```

---

### **Assessment Exclusions**

#### `GET /api/cyber-risk-assessments/:id/exclusions`
Get all exclusions for this assessment.

**Query params:** `?entityType=threat`

**Response:** `200 OK`
```json
{
  "assessmentId": "ASM-001",
  "exclusions": [
    {
      "id": "uuid-...",
      "entityType": "threat",
      "entityId": "THR-042",
      "reason": "Out of scope for this quarter",
      "excludedAt": "2026-05-06T10:20:00Z"
    }
  ]
}
```

---

#### `POST /api/cyber-risk-assessments/:id/exclusions`
Add new exclusion.

**Request:**
```json
{
  "entityType": "threat",
  "entityId": "THR-042",
  "reason": "Out of scope for this quarter"
}
```

**Response:** `201 Created`

**Valid entityType values:** `cyber_risk`, `threat`, `vulnerability`, `control`, `scenario`

---

### **Scenarios**

#### `GET /api/cyber-risk-assessments/:id/scenarios`
Get all scenarios for this assessment.

**Query params:** `?status=active&scored=true&notApplicable=false`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid-...",
    "displayId": "SC-001",
    "assessmentId": "ASM-001",
    "name": "SQL Injection on Payment Server",
    "assetId": "AST-001",
    "assetName": "Payment Server",
    "cyberRiskId": "CRK-001",
    "threatId": "THR-001",
    "vulnerabilityId": "VUL-001",
    "impact": 5,
    "impactLabel": "Very high",
    "threatSeverity": 4,
    "threatSeverityLabel": "High",
    "vulnerabilitySeverity": 4,
    "vulnerabilitySeverityLabel": "High",
    "likelihood": 16,
    "likelihoodLabel": "High",
    "cyberRiskScore": 80,
    "cyberRiskScoreLabel": "High",
    "scoringRationale": "## Threat Assessment\n\n...",
    "status": "active",
    "isNotApplicable": false,
    "isExcluded": false,
    "scoredAt": "2026-05-06T12:30:00Z",
    "scoredBy": "ai",
    "createdAt": "2026-05-06T10:30:00Z",
    "updatedAt": "2026-05-06T12:30:00Z"
  }
]
```

---

#### `POST /api/cyber-risk-assessments/:id/scenarios`
Generate scenarios from scoped assets (automatic).

**Request:** (optional filters)
```json
{
  "excludedCyberRiskIds": ["CRK-099"],
  "excludedThreatIds": ["THR-042"]
}
```

**Response:** `201 Created`
```json
{
  "assessmentId": "ASM-001",
  "scenariosCreated": 45,
  "timestamp": "2026-05-06T10:30:00Z"
}
```

**Logic:**
1. Gets all scoped assets
2. For each asset, finds related cyber risks → threats
3. Generates: `asset × cyber_risk × threat` = scenario
4. Deletes old scenarios, inserts new ones (replaces all)
5. Sets `impact` from asset criticality

---

#### `GET /api/scenarios/:id`
Get single scenario with full details.

**Response:** `200 OK`
```json
{
  "id": "uuid-...",
  "displayId": "SC-001",
  "assessmentId": "ASM-001",
  "name": "SQL Injection on Payment Server",
  "assetId": "AST-001",
  "assetName": "Payment Server",
  "assetType": "Server",
  "cyberRiskId": "CRK-001",
  "cyberRiskName": "SQL Injection",
  "threatId": "THR-001",
  "threatName": "Web Application Attack",
  "vulnerabilityId": "VUL-001",
  "vulnerabilityName": "Input Validation Weakness",
  "impact": 5,
  "impactLabel": "Very high",
  "threatSeverity": 4,
  "threatSeverityLabel": "High",
  "vulnerabilitySeverity": 4,
  "vulnerabilitySeverityLabel": "High",
  "likelihood": 16,
  "likelihoodLabel": "High",
  "cyberRiskScore": 80,
  "cyberRiskScoreLabel": "High",
  "scoringRationale": "## Threat Assessment\n\n...",
  "status": "active",
  "isNotApplicable": false,
  "isExcluded": false,
  "createdAt": "2026-05-06T10:30:00Z",
  "updatedAt": "2026-05-06T12:30:00Z",
  "scoredAt": "2026-05-06T12:30:00Z",
  "scoredBy": "ai"
}
```

---

#### `PATCH /api/scenarios/:id`
Update scenario (scores, status, etc.).

**Request:**
```json
{
  "threatSeverity": 4,
  "threatSeverityLabel": "High",
  "vulnerabilitySeverity": 4,
  "vulnerabilitySeverityLabel": "High",
  "likelihood": 16,
  "likelihoodLabel": "High",
  "cyberRiskScore": 80,
  "cyberRiskScoreLabel": "High",
  "scoringRationale": "## Threat Assessment\n\n...",
  "scoredBy": "ai"
}
```

**Response:** `200 OK` (updated scenario object)

**Auto-behaviors:**
- Setting `threatSeverity` or `vulnerabilitySeverity` → sets `scored_at` (first time only)

---

## 4. Usage Flow

### Flow 1: Create Assessment → Scope → Generate Scenarios → AI Score

```typescript
// 1. Create assessment
const createRes = await fetch("/api/cyber-risk-assessments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Q1 2026 Security Assessment",
    startDate: "2026-01-01",
    dueDate: "2026-03-31",
    ownerIds: ["user-123"]
  })
});
const assessment = await createRes.json();
// → { displayId: "ASM-001", phase: "draft" }

// 2. Update phase to scoping
await fetch(`/api/cyber-risk-assessments/${assessment.displayId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phase: "scoping" })
});

// 3. Set scope (select assets)
await fetch(`/api/cyber-risk-assessments/${assessment.displayId}/scope`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    assetIds: ["AST-001", "AST-002", "AST-003"]
  })
});

// 4. Generate scenarios
await fetch(`/api/cyber-risk-assessments/${assessment.displayId}/scenarios`, {
  method: "POST"
});
// → { scenariosCreated: 45 }

// 5. Update phase to scoring
await fetch(`/api/cyber-risk-assessments/${assessment.displayId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phase: "inProgress" })
});

// 6. Get scenarios
const scenariosRes = await fetch(
  `/api/cyber-risk-assessments/${assessment.displayId}/scenarios`
);
const scenarios = await scenariosRes.json();

// 7. AI scores scenarios (via useScoringAgent hook)
for (const result of aiResults) {
  await fetch(`/api/scenarios/${result.scenarioId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      threatSeverity: result.threatSeverity,
      vulnerabilitySeverity: result.vulnerabilitySeverity,
      likelihood: result.calculatedLikelihood,
      cyberRiskScore: result.calculatedCyberRiskScore,
      scoringRationale: result.combinedRationaleSummary,
      scoredBy: "ai"
    })
  });
}

// 8. Mark AI scoring complete
await fetch(`/api/cyber-risk-assessments/${assessment.displayId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ aiScoringPhase: "complete" })
});

// 9. Complete assessment
await fetch(`/api/cyber-risk-assessments/${assessment.displayId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phase: "assessmentApproved" })
});
```

---

## 5. UI Integration with Current Buttons

### Phase Transition Buttons

```typescript
// In AssessmentHeader.tsx or AssessmentToolbar.tsx

function AssessmentPhaseButtons({ assessmentId, currentPhase, onPhaseChange }) {
  
  const transitionPhase = async (newPhase: string) => {
    await fetch(`/api/cyber-risk-assessments/${assessmentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase: newPhase })
    });
    onPhaseChange(newPhase);
  };

  if (currentPhase === "draft") {
    return (
      <Button variant="contained" onClick={() => transitionPhase("scoping")}>
        Start Scoping
      </Button>
    );
  }

  if (currentPhase === "scoping") {
    return (
      <Button variant="contained" onClick={async () => {
        // Generate scenarios
        await fetch(`/api/cyber-risk-assessments/${assessmentId}/scenarios`, {
          method: "POST"
        });
        // Transition to scoring
        await transitionPhase("inProgress");
      }}>
        Complete Scoping & Generate Scenarios
      </Button>
    );
  }

  if (currentPhase === "inProgress") {
    return (
      <Button variant="contained" onClick={() => transitionPhase("review")}>
        Submit for Review
      </Button>
    );
  }

  if (currentPhase === "review") {
    return (
      <Button variant="contained" onClick={() => transitionPhase("assessmentApproved")}>
        Approve Assessment
      </Button>
    );
  }

  if (currentPhase === "assessmentApproved") {
    return <Chip label="Assessment Complete" color="success" />;
  }

  return null;
}
```

---

## 6. Run Migration

```bash
# Run migration to create tables
tsx scripts/migrate-assessments.ts

# Start API server
npm run dev:api

# Test endpoints
curl http://localhost:3001/api/cyber-risk-assessments
```

---

## 7. Files Created

### Migration
- ✅ `scripts/migrate-assessments.ts`

### API Endpoints
- ✅ `api/cyber-risk-assessments/index.ts` - POST, GET (list)
- ✅ `api/cyber-risk-assessments/[id].ts` - GET, PATCH, DELETE
- ✅ `api/cyber-risk-assessments/[id]/scope.ts` - GET, PUT
- ✅ `api/cyber-risk-assessments/[id]/exclusions.ts` - GET, POST
- ✅ `api/cyber-risk-assessments/[id]/scenarios.ts` - GET, POST
- ✅ `api/scenarios/[id].ts` - GET, PATCH

### API Server Registration
- ✅ `scripts/api-server.ts` - Updated with new routes

---

## 8. Testing Checklist

### Backend Testing

```bash
# 1. Create assessment
curl -X POST http://localhost:3001/api/cyber-risk-assessments \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Assessment","ownerIds":["user-1"]}'

# 2. List assessments
curl http://localhost:3001/api/cyber-risk-assessments

# 3. Get single assessment
curl http://localhost:3001/api/cyber-risk-assessments/ASM-001

# 4. Set scope
curl -X PUT http://localhost:3001/api/cyber-risk-assessments/ASM-001/scope \
  -H "Content-Type: application/json" \
  -d '{"assetIds":["AST-001","AST-002"]}'

# 5. Generate scenarios
curl -X POST http://localhost:3001/api/cyber-risk-assessments/ASM-001/scenarios

# 6. Get scenarios
curl http://localhost:3001/api/cyber-risk-assessments/ASM-001/scenarios

# 7. Update scenario
curl -X PATCH http://localhost:3001/api/scenarios/SC-001 \
  -H "Content-Type: application/json" \
  -d '{"threatSeverity":4,"threatSeverityLabel":"High"}'

# 8. Update phase
curl -X PATCH http://localhost:3001/api/cyber-risk-assessments/ASM-001 \
  -H "Content-Type: application/json" \
  -d '{"phase":"inProgress"}'
```

---

## 9. Summary

✅ **4 main tables** created with proper relationships
✅ **10 API endpoints** implemented (CRUD + sub-resources)
✅ **Cascade deletes** configured
✅ **Auto-timestamps** for completed_at, ai_scoring_completed_at, scored_at
✅ **Simple status flow** via single PATCH endpoint
✅ **Scenario generation** from scope (automatic)
✅ **Ready for UI integration** with current buttons

**Next step**: Wire up frontend hooks and UI components (see HACKATHON_2HR_PLAN.md).
