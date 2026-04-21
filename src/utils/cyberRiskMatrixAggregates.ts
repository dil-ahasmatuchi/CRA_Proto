import type { RiskHeatmapLegendItem } from "../components/ResidualRisksMatrix.js";
import type { RiskHeatmapLevel } from "../data/ragDataVisualization.js";
import { getCyberRiskScoreLabel } from "../data/types.js";
import type { FivePointScaleLabel, MockCyberRisk } from "../data/types.js";

/** Row 0 = highest likelihood (top), row 4 = lowest (bottom). */
const LIKELIHOOD_LABEL_TO_ROW: Record<FivePointScaleLabel, number> = {
  "Very high": 0,
  High: 1,
  Medium: 2,
  Low: 3,
  "Very low": 4,
};

function scoreLabelToHeatmapLevel(label: FivePointScaleLabel): RiskHeatmapLevel {
  const map: Record<FivePointScaleLabel, RiskHeatmapLevel> = {
    "Very high": "veryHigh",
    High: "high",
    Medium: "medium",
    Low: "low",
    "Very low": "veryLow",
  };
  return map[label];
}

const LEGEND_SPEC: readonly { label: string; level: RiskHeatmapLevel }[] = [
  { label: "101\u2013125 Very high", level: "veryHigh" },
  { label: "76\u2013100 High", level: "high" },
  { label: "51\u201375 Medium", level: "medium" },
  { label: "26\u201350 Low", level: "low" },
  { label: "1\u201325 Very low", level: "veryLow" },
];

export function buildCyberRiskHeatmapAggregates(
  risks: readonly MockCyberRisk[],
): { grid: number[][]; legend: RiskHeatmapLegendItem[] } {
  const grid: number[][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => 0),
  );

  const scoreCounts: Record<RiskHeatmapLevel, number> = {
    veryHigh: 0,
    high: 0,
    medium: 0,
    low: 0,
    veryLow: 0,
  };

  for (const risk of risks) {
    const colIdx = risk.impact - 1;
    const rowIdx = LIKELIHOOD_LABEL_TO_ROW[risk.likelihoodLabel];
    if (colIdx >= 0 && colIdx < 5) {
      grid[rowIdx][colIdx] += 1;
    }

    const level = scoreLabelToHeatmapLevel(getCyberRiskScoreLabel(risk.cyberRiskScore));
    scoreCounts[level] += 1;
  }

  const legend: RiskHeatmapLegendItem[] = LEGEND_SPEC.map((spec) => ({
    label: spec.label,
    level: spec.level,
    count: scoreCounts[spec.level],
  }));

  return { grid, legend };
}
