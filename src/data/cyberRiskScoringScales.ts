import type { RagDataVizKey } from "./ragDataVisualization.js";
import { RAG_FIVE_POINT_BAND_KEYS } from "./ragDataVisualization.js";

export type ScoringScaleKind = "cyberRiskScore" | "likelihood";

export type ScoringBandRow = {
  /** Level index 1–5 */
  level: 1 | 2 | 3 | 4 | 5;
  name: "Very low" | "Low" | "Medium" | "High" | "Very high";
  rag: RagDataVizKey;
  from: number;
  to: number;
  description: string;
};

const NAMES: ScoringBandRow["name"][] = ["Very low", "Low", "Medium", "High", "Very high"];

function rowsFrom(
  pairs: { from: number; to: number }[],
  descriptions: string[],
): ScoringBandRow[] {
  return RAG_FIVE_POINT_BAND_KEYS.map((rag, i) => ({
    level: (i + 1) as ScoringBandRow["level"],
    name: NAMES[i]!,
    rag,
    from: pairs[i]!.from,
    to: pairs[i]!.to,
    description: descriptions[i]!,
  }));
}

/** Figma: Cyber risk score (Impact × Likelihood, 1–125). */
export const DEFAULT_CYBER_RISK_SCORE_BANDS: ScoringBandRow[] = rowsFrom(
  [
    { from: 1, to: 25 },
    { from: 26, to: 50 },
    { from: 51, to: 75 },
    { from: 76, to: 100 },
    { from: 101, to: 125 },
  ],
  [
    "Negligible business impact. No disruption to operations, no financial loss expected, and no regulatory exposure. Risk can be accepted or monitored without active treatment.",
    "Minor impact on isolated systems or processes. Limited financial exposure and short recovery time. Routine controls are sufficient; risk owner should monitor quarterly.",
    "Moderate disruption to business operations or sensitive data. Noticeable financial or reputational impact possible. Requires a documented mitigation plan and assigned owner.",
    "Significant operational or financial impact. Potential for regulatory breach, data loss, or prolonged downtime. Immediate mitigation action and senior oversight required.",
    "Severe or critical impact across multiple systems or business units. Major financial loss, regulatory penalties, or reputational damage likely. Escalate immediately; treatment plan mandatory before next assessment cycle.",
  ],
);

/**
 * Likelihood product bands (1–25). Aligns with {@link getActiveLikelihoodOptions} in ScoringMetricField.
 */
export const DEFAULT_LIKELIHOOD_BANDS: ScoringBandRow[] = rowsFrom(
  [
    { from: 1, to: 5 },
    { from: 6, to: 10 },
    { from: 11, to: 15 },
    { from: 16, to: 20 },
    { from: 21, to: 25 },
  ],
  [
    "Rare or negligible probability under current controls. Poses minimal concern for prioritization; monitor in periodic reviews.",
    "Uncommon but possible exposure. May materialize if controls weaken; track trends and keep compensating measures current.",
    "Credible and periodic exposure. Requires scheduled reviews, clear ownership, and timely remediation of control gaps.",
    "Likely without strong mitigation. Near-term action plan and management attention are expected; escalate blockers early.",
    "Imminent or highly likely under observed conditions. Treat as top priority: immediate containment, resource allocation, and execution oversight.",
  ],
);

export function deepCloneBands(rows: ScoringBandRow[]): ScoringBandRow[] {
  return rows.map((r) => ({ ...r }));
}

// ---------------------------------------------------------------------------
// Active configuration (mirrored from React provider; defaults at load)
// ---------------------------------------------------------------------------

let activeCyberRiskScoreBands: ScoringBandRow[] = deepCloneBands(DEFAULT_CYBER_RISK_SCORE_BANDS);
let activeLikelihoodBands: ScoringBandRow[] = deepCloneBands(DEFAULT_LIKELIHOOD_BANDS);

export function getActiveCyberRiskScoreBands(): readonly ScoringBandRow[] {
  return activeCyberRiskScoreBands;
}

export function getActiveLikelihoodBands(): readonly ScoringBandRow[] {
  return activeLikelihoodBands;
}

export function setActiveCyberRiskScoreBands(rows: readonly ScoringBandRow[]): void {
  activeCyberRiskScoreBands = deepCloneBands(rows as ScoringBandRow[]);
}

export function setActiveLikelihoodBands(rows: readonly ScoringBandRow[]): void {
  activeLikelihoodBands = deepCloneBands(rows as ScoringBandRow[]);
}

/** Inclusive [from, to]; bands should be sorted by `from` ascending. */
export function resolveBandForScore(
  score: number,
  bands: readonly ScoringBandRow[],
): ScoringBandRow | undefined {
  for (const row of bands) {
    if (score >= row.from && score <= row.to) return row;
  }
  return undefined;
}

/** En dash range string for UI (matches existing “26–50” style). */
export function formatBandRangeEnDash(row: ScoringBandRow): string {
  return `${row.from}\u2013${row.to}`;
}

/** Space-separated range for donut legend (matches “51 - 75” style). */
export function formatBandRangeSpaced(row: ScoringBandRow): string {
  return `${row.from} - ${row.to}`;
}

export function resolveCyberRiskScoreBandOrFallback(
  score: number,
  bands: readonly ScoringBandRow[],
): ScoringBandRow {
  const hit = resolveBandForScore(score, bands);
  if (hit) return hit;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- prototype diagnostics
    console.warn("[scoring] score outside configured bands; clamping", { score, bands });
  }
  if (bands.length === 0) {
    return DEFAULT_CYBER_RISK_SCORE_BANDS[0]!;
  }
  const sorted = [...bands].sort((a, b) => a.from - b.from);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (score < first.from) return first;
  return last;
}

export function resolveLikelihoodBandOrFallback(
  value: number,
  bands: readonly ScoringBandRow[],
): ScoringBandRow {
  const hit = resolveBandForScore(value, bands);
  if (hit) return hit;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console -- prototype diagnostics
    console.warn("[scoring] likelihood outside configured bands; clamping", { value, bands });
  }
  if (bands.length === 0) {
    return DEFAULT_LIKELIHOOD_BANDS[0]!;
  }
  const sorted = [...bands].sort((a, b) => a.from - b.from);
  const first = sorted[0]!;
  const last = sorted[sorted.length - 1]!;
  if (value < first.from) return first;
  return last;
}

export function bandRowFromToValid(row: ScoringBandRow): boolean {
  return row.from <= row.to;
}

export function bandsAreContinuous(rows: readonly ScoringBandRow[]): boolean {
  for (let i = 0; i < rows.length - 1; i += 1) {
    if (rows[i]!.to + 1 !== rows[i + 1]!.from) return false;
  }
  return true;
}

export function bandsFullyValid(rows: readonly ScoringBandRow[]): boolean {
  return rows.every(bandRowFromToValid) && bandsAreContinuous(rows);
}
