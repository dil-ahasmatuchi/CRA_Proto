# 2-Hour Hackathon Plan: Dynamic Scoping & AI Scoring

## Current State Analysis

### ✅ Already Working (No Changes Needed)
1. **Database**: SQLite with tables for assets, threats, vulnerabilities, controls, cyber-risks
2. **API Endpoints**: `/api/assets`, `/api/threats`, `/api/vulnerability-categories`, `/api/controls`, `/api/cyber-risks`
3. **API Server**: `scripts/api-server.ts` running on port 3001
4. **Frontend Hook**: `useDbAssets()` fetching assets from DB
5. **Scoring Agent**: Complete mock implementation ready to use
6. **Scenario Generation**: `buildScoringRowsForScope()` already generates scenarios dynamically

### ❌ Missing (What You Need to Build)

#### **Database/Backend** (30 min)
Nothing major! Just ensure data exists.

#### **Frontend Hooks** (45 min)
1. `useDbCyberRisks()` - Fetch risks from `/api/cyber-risks`
2. `useDbThreats()` - Fetch threats from `/api/threats`
3. `useDbVulnerabilities()` - Fetch vulns from `/api/vulnerability-categories`
4. `useDbControls()` - Fetch controls from `/api/controls`

#### **UI Changes** (30 min)
1. Wire up scoping tab to use DB data instead of mock data
2. Wire up scoring agent hook in scoring tab
3. Add loading states

#### **Testing** (15 min)
1. Select assets in scoping
2. Verify scenarios generate
3. Run AI scoring
4. Verify scores populate

---

## Implementation Plan (2 Hours)

### Phase 1: Backend Data Prep (15 min) ⏱️

**Goal**: Ensure DB has data

```bash
# Check if data exists
npm run dev:api  # Should start without errors

# If tables are empty, seed them
npm run seed:all
```

**Verify**: Visit `http://localhost:3001/api/assets` - should return JSON array

---

### Phase 2: Create DB Hooks (45 min) ⏱️

#### A. Create `src/hooks/useDbCyberRisks.ts` (10 min)

```typescript
import { useEffect, useState } from "react";

type ApiCyberRiskRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  domain: string;
  status: string;
};

export type DbCyberRisk = {
  id: string;
  name: string;
  domain: string;
  status: string;
};

function mapRow(row: ApiCyberRiskRow): DbCyberRisk {
  return {
    id: row.display_id,
    name: row.name,
    domain: row.domain,
    status: row.status,
  };
}

export type UseDbCyberRisksResult =
  | { status: "loading"; risks: null }
  | { status: "error"; risks: null; message: string }
  | { status: "ok"; risks: DbCyberRisk[] };

export function useDbCyberRisks(): UseDbCyberRisksResult {
  const [result, setResult] = useState<UseDbCyberRisksResult>({ status: "loading", risks: null });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/cyber-risks?status=Active")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiCyberRiskRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          setResult({ status: "ok", risks: rows.map(mapRow) });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ status: "error", risks: null, message: String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
```

#### B. Create `src/hooks/useDbThreats.ts` (10 min)

```typescript
import { useEffect, useState } from "react";

type ApiThreatRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  domain: string;
  status: string;
};

export type DbThreat = {
  id: string;
  name: string;
  domain: string;
  status: string;
};

function mapRow(row: ApiThreatRow): DbThreat {
  return {
    id: row.display_id,
    name: row.name,
    domain: row.domain,
    status: row.status,
  };
}

export type UseDbThreatsResult =
  | { status: "loading"; threats: null }
  | { status: "error"; threats: null; message: string }
  | { status: "ok"; threats: DbThreat[] };

export function useDbThreats(): UseDbThreatsResult {
  const [result, setResult] = useState<UseDbThreatsResult>({ status: "loading", threats: null });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/threats?status=Active")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiThreatRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          setResult({ status: "ok", threats: rows.map(mapRow) });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ status: "error", threats: null, message: String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
```

#### C. Create `src/hooks/useDbVulnerabilities.ts` (10 min)

```typescript
import { useEffect, useState } from "react";

type ApiVulnerabilityRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  domain: string;
  status: string;
};

export type DbVulnerability = {
  id: string;
  name: string;
  domain: string;
  status: string;
};

function mapRow(row: ApiVulnerabilityRow): DbVulnerability {
  return {
    id: row.display_id,
    name: row.name,
    domain: row.domain,
    status: row.status,
  };
}

export type UseDbVulnerabilitiesResult =
  | { status: "loading"; vulnerabilities: null }
  | { status: "error"; vulnerabilities: null; message: string }
  | { status: "ok"; vulnerabilities: DbVulnerability[] };

export function useDbVulnerabilities(): UseDbVulnerabilitiesResult {
  const [result, setResult] = useState<UseDbVulnerabilitiesResult>({ 
    status: "loading", 
    vulnerabilities: null 
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/vulnerability-categories?status=Active")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiVulnerabilityRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          setResult({ status: "ok", vulnerabilities: rows.map(mapRow) });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ status: "error", vulnerabilities: null, message: String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
```

#### D. Create `src/hooks/useDbControls.ts` (10 min)

```typescript
import { useEffect, useState } from "react";

type ApiControlRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  control_type: string;
  effectiveness: number;
  status: string;
};

export type DbControl = {
  id: string;
  name: string;
  controlType: string;
  effectiveness: number;
  status: string;
};

function mapRow(row: ApiControlRow): DbControl {
  return {
    id: row.display_id,
    name: row.name,
    controlType: row.control_type,
    effectiveness: row.effectiveness,
    status: row.status,
  };
}

export type UseDbControlsResult =
  | { status: "loading"; controls: null }
  | { status: "error"; controls: null; message: string }
  | { status: "ok"; controls: DbControl[] };

export function useDbControls(): UseDbControlsResult {
  const [result, setResult] = useState<UseDbControlsResult>({ status: "loading", controls: null });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/controls?status=Active")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiControlRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          setResult({ status: "ok", controls: rows.map(mapRow) });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ status: "error", controls: null, message: String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
```

#### E. Update `src/data/assessmentScopeRollup.ts` (5 min)

**Current**: Uses mock data from `src/data/*`
**Change**: Add helper to use DB data when available

Add this at the top:
```typescript
let dbAssetsOverride: any[] | null = null;
let dbRisksOverride: any[] | null = null;
let dbThreatsOverride: any[] | null = null;
let dbVulnerabilitiesOverride: any[] | null = null;
let dbControlsOverride: any[] | null = null;

export function setDbDataOverrides(data: {
  assets?: any[];
  risks?: any[];
  threats?: any[];
  vulnerabilities?: any[];
  controls?: any[];
}) {
  dbAssetsOverride = data.assets ?? null;
  dbRisksOverride = data.risks ?? null;
  dbThreatsOverride = data.threats ?? null;
  dbVulnerabilitiesOverride = data.vulnerabilities ?? null;
  dbControlsOverride = data.controls ?? null;
}

export function getEffectiveAssets() {
  return dbAssetsOverride ?? assets;
}

export function getEffectiveCyberRisks() {
  return dbRisksOverride ?? cyberRisks;
}

// ... etc for threats, vulnerabilities, controls
```

---

### Phase 3: Wire Up Scoping Tab (20 min) ⏱️

#### Update `src/pages/AssessmentScopeTab.tsx`

1. **Import all DB hooks** (2 min):
```typescript
import { useDbAssets } from "../hooks/useDbAssets.js";
import { useDbCyberRisks } from "../hooks/useDbCyberRisks.js";
import { useDbThreats } from "../hooks/useDbThreats.js";
import { useDbVulnerabilities } from "../hooks/useDbVulnerabilities.js";
import { useDbControls } from "../hooks/useDbControls.js";
```

2. **Use hooks in component** (5 min):
```typescript
const dbAssets = useDbAssets();
const dbRisks = useDbCyberRisks();
const dbThreats = useDbThreats();
const dbVulns = useDbVulnerabilities();
const dbControls = useDbControls();

// Show loading state if any are loading
if (
  dbAssets.status === "loading" ||
  dbRisks.status === "loading" ||
  dbThreats.status === "loading" ||
  dbVulns.status === "loading" ||
  dbControls.status === "loading"
) {
  return <Box>Loading catalog data...</Box>;
}

// Show error if any failed
const errors = [
  dbAssets.status === "error" ? dbAssets.message : null,
  dbRisks.status === "error" ? dbRisks.message : null,
  // ... etc
].filter(Boolean);

if (errors.length > 0) {
  return <Alert severity="error">Failed to load: {errors.join(", ")}</Alert>;
}

// Set DB data overrides
useEffect(() => {
  if (
    dbAssets.status === "ok" &&
    dbRisks.status === "ok" &&
    dbThreats.status === "ok" &&
    dbVulns.status === "ok" &&
    dbControls.status === "ok"
  ) {
    setDbDataOverrides({
      assets: dbAssets.assets,
      risks: dbRisks.risks,
      threats: dbThreats.threats,
      vulnerabilities: dbVulns.vulnerabilities,
      controls: dbControls.controls,
    });
  }
}, [dbAssets, dbRisks, dbThreats, dbVulns, dbControls]);
```

3. **Build scope rows with DB data** (10 min):
Replace references to `mockAssets` with `dbAssets.assets`.

4. **Handle asset selection** (3 min):
Already works! Asset selection triggers scope recalculation.

---

### Phase 4: Wire Up Scoring Tab (15 min) ⏱️

#### Update `src/pages/AssessmentScoringTab.tsx`

1. **Import scoring hook** (1 min):
```typescript
import { useScoringAgent } from "../hooks/useScoringAgent.js";
import { useSavedChangesToast } from "../context/SavedChangesToastContext.js";
```

2. **Use hook** (3 min):
```typescript
const scoringAgent = useScoringAgent();
const { notifySavedChanges } = useSavedChangesToast();
```

3. **Wire up button** (5 min):
```typescript
const handleStartScoring = useCallback(() => {
  const scenarioIds = scoringRows
    .filter((row) => row.kind === "scenario" && !scenarioNotApplicableIds.has(row.id))
    .map((row) => row.id);

  if (scenarioIds.length === 0) {
    alert("No scenarios to score");
    return;
  }

  scoringAgent.startScoring(scenarioIds, assessmentId, assessmentName);
}, [scoringRows, scenarioNotApplicableIds, scoringAgent, assessmentId, assessmentName]);
```

4. **Pass to ScoringInfoCard** (3 min):
```typescript
<ScoringInfoCard
  onAction={scoringAgent.phase === "idle" ? handleStartScoring : undefined}
  actionLoading={scoringAgent.phase === "processing"}
  // ... other props
/>
```

5. **Show success toast** (3 min):
```typescript
useEffect(() => {
  if (scoringAgent.phase === "complete" && scoringAgent.results) {
    notifySavedChanges();
  }
}, [scoringAgent.phase, scoringAgent.results, notifySavedChanges]);
```

---

### Phase 5: Testing (20 min) ⏱️

#### Test Flow (15 min)

1. **Start dev server**:
```bash
npm run dev
```

2. **Open app**: `http://localhost:5173`

3. **Create new assessment**

4. **Scoping tab**:
   - Should see assets from DB
   - Select 2-3 assets
   - Verify related risks/threats/vulns show in counts

5. **Scoring tab**:
   - Should see scenarios generated
   - Click "Start AI scoring"
   - Wait ~5-10 seconds
   - Verify scores populate in table

6. **Click scenario**:
   - Opens rationale page
   - Should see AI banner
   - Should see combined rationale in editor

#### Bug Fixes (5 min)
If anything breaks, check:
- API endpoints returning data: `curl http://localhost:3001/api/assets`
- Console errors in browser DevTools
- Network tab shows successful fetches

---

## Summary: What Changes

| Component | Change | Time |
|-----------|--------|------|
| **Backend** | None (already working) | 0 min |
| **DB Hooks** | Create 4 new hooks | 40 min |
| **Scope Rollup** | Add DB override helper | 5 min |
| **Scoping Tab** | Use DB hooks, add loading | 20 min |
| **Scoring Tab** | Wire up scoring agent | 15 min |
| **Testing** | End-to-end flow | 20 min |
| **Buffer** | Debugging/fixes | 20 min |
| **TOTAL** | | **120 min** |

---

## Quick Reference

### Key Files to Modify

1. ✅ `src/hooks/useDbCyberRisks.ts` - NEW
2. ✅ `src/hooks/useDbThreats.ts` - NEW
3. ✅ `src/hooks/useDbVulnerabilities.ts` - NEW
4. ✅ `src/hooks/useDbControls.ts` - NEW
5. ✅ `src/data/assessmentScopeRollup.ts` - ADD DB OVERRIDES
6. ✅ `src/pages/AssessmentScopeTab.tsx` - USE DB HOOKS
7. ✅ `src/pages/AssessmentScoringTab.tsx` - WIRE SCORING AGENT

### Files Already Complete (No Changes)

- ✅ `src/hooks/useScoringAgent.ts` - Scoring agent hook
- ✅ `src/services/mockScoringAgent.ts` - Mock scoring logic
- ✅ `scripts/api-server.ts` - API server
- ✅ `api/assets/index.ts` - Assets endpoint
- ✅ `api/cyber-risks/index.ts` - Risks endpoint
- ✅ `api/threats/index.ts` - Threats endpoint
- ✅ `api/vulnerability-categories/index.ts` - Vulns endpoint
- ✅ `api/controls/index.ts` - Controls endpoint

---

## Risk Mitigation

### If Running Out of Time

**Priority 1 (Must Have)**: 
- Assets from DB ✅ (Already working!)
- Scoring agent integration ✅ (15 min)

**Priority 2 (Nice to Have)**:
- Risks/Threats/Vulns from DB (40 min)
- Can demo with mock data + DB assets

**Priority 3 (Bonus)**:
- Polish loading states
- Error handling
- Success toasts

### Fallback Plan

If DB integration takes too long:
1. Keep assets from DB (already working)
2. Use mock data for risks/threats/vulns
3. Focus on AI scoring demo (the impressive part!)

---

## Ready to Start?

1. **Read this plan** (5 min)
2. **Start timer** ⏱️
3. **Follow phases in order**
4. **Demo at 2 hours!** 🎉
