import { assets } from "../data/assets.js";
import type { CraRagKey } from "../data/craScoringScenarioLibrary.js";
import type {
  MockCyberRisk,
  MockCyberRiskRelationships,
  MockScenario,
  MockScenarioRelationships,
  FivePointScaleLabel,
  FivePointScaleValue,
} from "../data/types.js";
import {
  fivePointLabelToRag,
  getCyberRiskScoreLabel,
  getFivePointLabel,
  getLikelihoodLabel,
} from "../data/types.js";
import type { ApiAssessmentScenario } from "../hooks/useAssessmentScenarios.js";
import {
  assessmentScopedCyberRisks,
  assessmentScopedScenarios,
} from "./scopeAssessmentRollup.js";

export type AssessmentCyberResultsRow = {
  id: string;
  kind: "cyberRisk" | "scenario";
  groupId: string;
  name: string;
  impact: { numeric: string; label: string; rag: CraRagKey };
  threat: { numeric: string; label: string; rag: CraRagKey };
  vulnerability: { numeric: string; label: string; rag: CraRagKey };
  likelihood: { numeric: string; label: string; rag: CraRagKey };
  cyberRiskScore: { numeric: string; label: string; rag: CraRagKey };
};

type Chip = AssessmentCyberResultsRow["impact"];

function chipFive(value: number, label: FivePointScaleLabel): Chip {
  return {
    numeric: String(value),
    label,
    rag: fivePointLabelToRag(label) as CraRagKey,
  };
}

function chipLikelihood(value: number): Chip {
  const label = getLikelihoodLabel(value);
  return {
    numeric: String(value),
    label,
    rag: fivePointLabelToRag(label) as CraRagKey,
  };
}

function chipCyberRiskScore(value: number): Chip {
  const label = getCyberRiskScoreLabel(value);
  return {
    numeric: String(value),
    label,
    rag: fivePointLabelToRag(label) as CraRagKey,
  };
}

type ScenarioMetricChips = {
  impact: Chip;
  threat: Chip;
  vulnerability: Chip;
  likelihood: Chip;
  cyberRiskScore: Chip;
};

function scenarioRowChips(s: MockScenario): ScenarioMetricChips {
  return {
    impact: chipFive(s.impact, s.impactLabel),
    threat: chipFive(s.threatSeverity, s.threatSeverityLabel),
    vulnerability: chipFive(s.vulnerabilitySeverity, s.vulnerabilitySeverityLabel),
    likelihood: chipLikelihood(s.likelihood),
    cyberRiskScore: chipCyberRiskScore(s.cyberRiskScore),
  };
}

function maxChip(a: Chip, b: Chip): Chip {
  return Number.parseFloat(a.numeric) >= Number.parseFloat(b.numeric) ? a : b;
}

function riskRowChips(
  cr: MockCyberRisk,
  scens: MockScenario[],
): Omit<AssessmentCyberResultsRow, "id" | "kind" | "groupId" | "name"> {
  if (scens.length === 0) {
    const imp = chipFive(cr.impact, cr.impactLabel);
    const lik = chipLikelihood(cr.likelihood);
    const crs = chipCyberRiskScore(cr.cyberRiskScore);
    return {
      impact: imp,
      threat: imp,
      vulnerability: imp,
      likelihood: lik,
      cyberRiskScore: crs,
    };
  }
  const chips: ScenarioMetricChips[] = scens.map((s) => scenarioRowChips(s));
  const [head, ...rest] = chips;
  return {
    impact: rest.reduce((a, c) => maxChip(a, c.impact), head!.impact),
    threat: rest.reduce((a, c) => maxChip(a, c.threat), head!.threat),
    vulnerability: rest.reduce((a, c) => maxChip(a, c.vulnerability), head!.vulnerability),
    likelihood: rest.reduce((a, c) => maxChip(a, c.likelihood), head!.likelihood),
    cyberRiskScore: rest.reduce((a, c) => maxChip(a, c.cyberRiskScore), head!.cyberRiskScore),
  };
}

/** Cyber risk + scenario rows for Results, aligned with scoped Scoring data. */
export function buildCyberResultsRowsForScope(
  includedAssetIds: Set<string>,
  excludedScopeCyberRiskIds: Set<string>,
  excludedScopeScenarioIds: Set<string> = new Set(),
): AssessmentCyberResultsRow[] {
  if (includedAssetIds.size === 0) return [];
  const risks = assessmentScopedCyberRisks(includedAssetIds, excludedScopeCyberRiskIds);
  const scenarioList = assessmentScopedScenarios(
    includedAssetIds,
    excludedScopeCyberRiskIds,
    excludedScopeScenarioIds,
  );
  const byRisk = new Map<string, MockScenario[]>();
  for (const s of scenarioList) {
    const list = byRisk.get(s.cyberRiskId) ?? [];
    list.push(s);
    byRisk.set(s.cyberRiskId, list);
  }

  const rows: AssessmentCyberResultsRow[] = [];
  for (const cr of risks) {
    const scens = byRisk.get(cr.id) ?? [];
    const rc = riskRowChips(cr, scens);
    rows.push({
      id: cr.id,
      kind: "cyberRisk",
      groupId: cr.id,
      name: cr.name,
      ...rc,
    });
    for (const s of scens) {
      const sc = scenarioRowChips(s);
      rows.push({
        id: s.id,
        kind: "scenario",
        groupId: cr.id,
        name: s.name,
        ...sc,
      });
    }
  }
  return rows;
}

export type AssessmentAssetResultRow = {
  id: string;
  name: string;
  assetId: string;
  cyberRiskScore: Chip;
  criticality: Chip;
  confidentiality: Chip;
  integrity: Chip;
  availability: Chip;
};

function maxScenarioCyberRiskChip(scens: MockScenario[]): Chip {
  let best = scens[0]!;
  for (const s of scens) {
    if (s.cyberRiskScore > best.cyberRiskScore) best = s;
  }
  return chipCyberRiskScore(best.cyberRiskScore);
}

/** Asset rows on Results for assets in scope (scores from scenarios on that asset). */
export function buildAssetResultRowsForScope(
  includedAssetIds: Set<string>,
  excludedScopeCyberRiskIds: Set<string>,
  excludedScopeScenarioIds: Set<string> = new Set(),
): AssessmentAssetResultRow[] {
  if (includedAssetIds.size === 0) return [];
  const scenarioList = assessmentScopedScenarios(
    includedAssetIds,
    excludedScopeCyberRiskIds,
    excludedScopeScenarioIds,
  );
  const byAsset = new Map<string, MockScenario[]>();
  for (const s of scenarioList) {
    const list = byAsset.get(s.assetId) ?? [];
    list.push(s);
    byAsset.set(s.assetId, list);
  }

  const list = assets.filter((a) => includedAssetIds.has(a.id));
  return list.map((a, i) => {
    const scens = byAsset.get(a.id) ?? [];
    const crs =
      scens.length === 0
        ? chipCyberRiskScore(a.criticality * 10)
        : maxScenarioCyberRiskChip(scens);
    const crit = chipFive(a.criticality, a.criticalityLabel);
    return {
      id: String(i + 1),
      name: a.name,
      assetId: a.id,
      cyberRiskScore: crs,
      criticality: crit,
      confidentiality: crit,
      integrity: crit,
      availability: crit,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// API assessment scenarios → Results tab (charts + tree), same semantics as mock scope
// ─────────────────────────────────────────────────────────────────────────────

const FIVE_POINT_LABELS: readonly FivePointScaleLabel[] = [
  "Very low",
  "Low",
  "Medium",
  "High",
  "Very high",
];

function parseFivePointLabel(s: string | null | undefined, fallback: FivePointScaleLabel): FivePointScaleLabel {
  if (s && (FIVE_POINT_LABELS as readonly string[]).includes(s)) return s as FivePointScaleLabel;
  return fallback;
}

function clampFive(n: number): FivePointScaleValue {
  const x = Math.round(n);
  if (x < 1) return 1;
  if (x > 5) return 5;
  return x as FivePointScaleValue;
}

/** Scenarios for an assessment from the DB, filtered like {@link assessmentScopedScenarios}. */
export function filterApiAssessmentScenariosForScope(
  scenarios: readonly ApiAssessmentScenario[],
  includedAssetIds: Set<string>,
  excludedScopeCyberRiskIds: Set<string>,
  excludedScopeScenarioIds: ReadonlySet<string> = new Set(),
): ApiAssessmentScenario[] {
  if (includedAssetIds.size === 0) return [];
  return scenarios.filter(
    (s) =>
      !s.isExcluded &&
      Boolean(s.assetId) &&
      includedAssetIds.has(s.assetId!) &&
      !excludedScopeCyberRiskIds.has(s.cyberRiskId) &&
      !excludedScopeScenarioIds.has(s.displayId) &&
      !excludedScopeScenarioIds.has(s.id),
  );
}

function apiScenarioToMockScenario(s: ApiAssessmentScenario): MockScenario {
  const impactNum = clampFive(s.impact ?? s.assetCriticality ?? 1);
  const impactLabel = parseFivePointLabel(s.impactLabel, getFivePointLabel(impactNum));
  const thNum = clampFive(s.threatSeverity ?? impactNum);
  const thLab = parseFivePointLabel(s.threatSeverityLabel, getFivePointLabel(thNum));
  const vulNum = clampFive(s.vulnerabilitySeverity ?? impactNum);
  const vulLab = parseFivePointLabel(s.vulnerabilitySeverityLabel, getFivePointLabel(vulNum));
  const lik = s.likelihood ?? 0;
  const likLab = parseFivePointLabel(s.likelihoodLabel, getLikelihoodLabel(lik));
  const crs = s.cyberRiskScore ?? 0;
  const crsLab = parseFivePointLabel(s.cyberRiskScoreLabel, getCyberRiskScoreLabel(crs));

  const rel: MockScenarioRelationships = {
    cyberRiskId: s.cyberRiskId,
    assetId: s.assetId ?? "",
    threatIds: s.threatId ? [s.threatId] : [],
    vulnerabilityIds: [],
    controlIds: [],
    mitigationPlanIds: [],
  };

  return {
    id: s.displayId,
    name: s.name,
    ownerId: "",
    cyberRiskId: s.cyberRiskId,
    assetId: s.assetId ?? "",
    impact: impactNum,
    impactLabel,
    threatSeverity: thNum,
    threatSeverityLabel: thLab,
    vulnerabilitySeverity: vulNum,
    vulnerabilitySeverityLabel: vulLab,
    likelihood: lik,
    likelihoodLabel: likLab,
    cyberRiskScore: crs,
    cyberRiskScoreLabel: crsLab,
    threatIds: rel.threatIds,
    vulnerabilityIds: rel.vulnerabilityIds,
    scoringRationale: "",
    relationships: rel,
  };
}

function synthMockCyberRiskFromApiScenarios(
  riskId: string,
  riskName: string,
  scenarios: ApiAssessmentScenario[],
): MockCyberRisk {
  const applicable = scenarios.filter((s) => !s.isNotApplicable);
  const pool = applicable.length > 0 ? applicable : scenarios;

  const impact = clampFive(Math.max(1, ...pool.map((s) => s.impact ?? s.assetCriticality ?? 1)));
  const impactLabel = getFivePointLabel(impact);

  const likelihood =
    applicable.length > 0 ? Math.max(0, ...applicable.map((s) => s.likelihood ?? 0)) : 0;
  const likelihoodLabel = getLikelihoodLabel(likelihood);

  const cyberRiskScore =
    applicable.length > 0 ? Math.max(0, ...applicable.map((s) => s.cyberRiskScore ?? 0)) : 0;
  const cyberRiskScoreLabel = getCyberRiskScoreLabel(cyberRiskScore);

  const assetIds = [...new Set(scenarios.map((s) => s.assetId).filter((x): x is string => Boolean(x)))];
  const scenarioIds = scenarios.map((s) => s.displayId);

  const rel: MockCyberRiskRelationships = {
    assetIds,
    threatIds: [],
    vulnerabilityIds: [],
    scenarioIds,
    mitigationPlanIds: [],
    assessmentIds: [],
  };

  return {
    id: riskId,
    name: riskName,
    ownerId: "",
    status: "Assessment",
    orgUnitId: "",
    likelihood,
    likelihoodLabel,
    impact,
    impactLabel,
    cyberRiskScore,
    cyberRiskScoreLabel,
    residualLikelihood: likelihood,
    residualLikelihoodLabel: likelihoodLabel,
    residualCyberRiskScore: cyberRiskScore,
    residualCyberRiskScoreLabel: cyberRiskScoreLabel,
    assetIds,
    threatIds: [],
    vulnerabilityIds: [],
    scenarioIds,
    mitigationPlanIds: [],
    relationships: rel,
  };
}

/** Heatmap + legend on Results: one synthetic row per cyber risk in API scenarios. */
export function buildHeatmapCyberRisksFromApiScenarios(
  scenarios: readonly ApiAssessmentScenario[],
): MockCyberRisk[] {
  if (scenarios.length === 0) return [];

  const riskOrder: string[] = [];
  const byRisk = new Map<string, ApiAssessmentScenario[]>();
  for (const s of scenarios) {
    if (!byRisk.has(s.cyberRiskId)) {
      riskOrder.push(s.cyberRiskId);
      byRisk.set(s.cyberRiskId, []);
    }
    byRisk.get(s.cyberRiskId)!.push(s);
  }

  return riskOrder.map((rid) => {
    const list = byRisk.get(rid)!;
    const name = list[0]?.cyberRiskName ?? rid;
    return synthMockCyberRiskFromApiScenarios(rid, name, list);
  });
}

/** Cyber risk + scenario rows for Results from API scenarios. */
export function buildCyberResultsRowsFromApiAssessmentScenarios(
  scenarios: readonly ApiAssessmentScenario[],
): AssessmentCyberResultsRow[] {
  if (scenarios.length === 0) return [];

  const riskOrder: string[] = [];
  const byRisk = new Map<string, ApiAssessmentScenario[]>();
  for (const s of scenarios) {
    if (!byRisk.has(s.cyberRiskId)) {
      riskOrder.push(s.cyberRiskId);
      byRisk.set(s.cyberRiskId, []);
    }
    byRisk.get(s.cyberRiskId)!.push(s);
  }

  const rows: AssessmentCyberResultsRow[] = [];
  for (const rid of riskOrder) {
    const apiList = byRisk.get(rid)!;
    const mockScens = apiList.map(apiScenarioToMockScenario);
    const synthCr = synthMockCyberRiskFromApiScenarios(rid, apiList[0]?.cyberRiskName ?? rid, apiList);
    const rc = riskRowChips(synthCr, mockScens);
    rows.push({
      id: rid,
      kind: "cyberRisk",
      groupId: rid,
      name: synthCr.name,
      ...rc,
    });
    for (const ms of mockScens) {
      const sc = scenarioRowChips(ms);
      rows.push({
        id: ms.id,
        kind: "scenario",
        groupId: rid,
        name: ms.name,
        ...sc,
      });
    }
  }
  return rows;
}

/** Asset rows for donut + grid from API scenarios (max scored cyber risk per asset). */
export function buildAssetResultRowsFromApiAssessmentScenarios(
  includedAssetIds: Set<string>,
  scenarios: readonly ApiAssessmentScenario[],
): AssessmentAssetResultRow[] {
  if (includedAssetIds.size === 0) return [];

  const byAsset = new Map<string, MockScenario[]>();
  for (const s of scenarios) {
    if (!s.assetId) continue;
    const ms = apiScenarioToMockScenario(s);
    const list = byAsset.get(s.assetId) ?? [];
    list.push(ms);
    byAsset.set(s.assetId, list);
  }

  let i = 0;
  const out: AssessmentAssetResultRow[] = [];
  for (const assetId of includedAssetIds) {
    const scens = byAsset.get(assetId) ?? [];
    const scored = scens.filter((s) => s.cyberRiskScore > 0);
    const crs =
      scored.length > 0 ? maxScenarioCyberRiskChip(scored) : chipCyberRiskScore(0);
    const first = scenarios.find((s) => s.assetId === assetId);
    const critVal = clampFive(first?.assetCriticality ?? 3);
    const critLab = parseFivePointLabel(first?.assetCriticalityLabel ?? null, getFivePointLabel(critVal));
    const crit = chipFive(critVal, critLab);
    const name = first?.assetName ?? assetId;
    i += 1;
    out.push({
      id: String(i),
      name,
      assetId,
      cyberRiskScore: crs,
      criticality: crit,
      confidentiality: crit,
      integrity: crit,
      availability: crit,
    });
  }
  return out;
}
