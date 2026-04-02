import { assets } from "../data/assets.js";
import type { CraRagKey } from "../data/craScoringScenarioLibrary.js";
import type { MockCyberRisk, MockScenario, FivePointScaleLabel } from "../data/types.js";
import {
  fivePointLabelToRag,
  getCyberRiskScoreLabel,
  getLikelihoodLabel,
} from "../data/types.js";
import { scopedCyberRisks, scopedScenarios } from "./scopeAssessmentRollup.js";

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
): AssessmentCyberResultsRow[] {
  if (includedAssetIds.size === 0) return [];
  const risks = scopedCyberRisks(includedAssetIds);
  const scenarioList = scopedScenarios(includedAssetIds);
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
): AssessmentAssetResultRow[] {
  if (includedAssetIds.size === 0) return [];
  const scenarioList = scopedScenarios(includedAssetIds);
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
