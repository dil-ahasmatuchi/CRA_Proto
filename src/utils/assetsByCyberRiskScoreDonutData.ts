import { assets } from "../data/assets.js";
import { cyberRisks } from "../data/cyberRisks.js";
import {
  formatBandRangeSpaced,
  getActiveCyberRiskScoreBands,
} from "../data/cyberRiskScoringScales.js";
import type { RagDataVizKey } from "../data/ragDataVisualization.js";
import { getCyberRiskScoreLabel, type FivePointScaleLabel } from "../data/types.js";

export type AssetCyberRiskDonutSegment = {
  range: string;
  label: string;
  count: number | null;
  colorKey: RagDataVizKey;
};

function bandSpecFromActiveCyber(): readonly {
  range: string;
  label: FivePointScaleLabel;
  colorKey: RagDataVizKey;
}[] {
  const bands = [...getActiveCyberRiskScoreBands()].sort((a, b) => b.level - a.level);
  return bands.map((row) => ({
    range: formatBandRangeSpaced(row),
    label: row.name,
    colorKey: row.rag,
  }));
}

/**
 * For each in-scope asset, the worst (max) inherent cyber risk score across linked in-scope
 * risks determines the score band. Assets with no linked risk in scope are scored as
 * "Very low" (score 0) for bucketing.
 */
export function buildAssetCyberRiskDonutSegments(
  orgUnitId: string | null,
): AssetCyberRiskDonutSegment[] {
  const riskPool =
    orgUnitId == null
      ? cyberRisks
      : cyberRisks.filter((r) => r.orgUnitId === orgUnitId);

  const assetPool =
    orgUnitId == null
      ? assets
      : assets.filter((a) => a.orgUnitId === orgUnitId);

  const counts: Record<FivePointScaleLabel, number> = {
    "Very high": 0,
    High: 0,
    Medium: 0,
    Low: 0,
    "Very low": 0,
  };

  for (const asset of assetPool) {
    const related = riskPool.filter((r) => r.assetIds.includes(asset.id));
    const maxScore = related.length === 0 ? 0 : Math.max(...related.map((r) => r.cyberRiskScore));
    const label = getCyberRiskScoreLabel(maxScore);
    counts[label] += 1;
  }

  return bandSpecFromActiveCyber().map((row) => ({
    range: row.range,
    label: row.label,
    colorKey: row.colorKey,
    count: counts[row.label],
  }));
}

/** Minimal row shape: same `cyberRiskScore.label` as assessment asset result rows / Assets grid. */
export type AssessmentAssetRowForDonut = {
  cyberRiskScore: { label: string };
};

/**
 * Donut bands for assessment results: counts assets by the grid’s cyber risk score label
 * (scenario-based when present, else criticality fallback).
 */
export function buildAssetCyberRiskDonutSegmentsFromAssessmentAssetRows(
  rows: readonly AssessmentAssetRowForDonut[],
): AssetCyberRiskDonutSegment[] {
  const counts: Record<FivePointScaleLabel, number> = {
    "Very high": 0,
    High: 0,
    Medium: 0,
    Low: 0,
    "Very low": 0,
  };
  for (const row of rows) {
    const lab = row.cyberRiskScore.label as FivePointScaleLabel;
    counts[lab] += 1;
  }
  return bandSpecFromActiveCyber().map((row) => ({
    range: row.range,
    label: row.label,
    colorKey: row.colorKey,
    count: counts[row.label],
  }));
}
