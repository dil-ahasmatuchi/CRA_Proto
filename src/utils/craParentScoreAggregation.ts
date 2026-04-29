/**
 * Parent cyber-risk row aggregation when "Weighted average" (persisted `average`) is selected.
 * Uses each scenario's Impact as weight; round only after weighted sums for T, V, I.
 */

export type ImpactWeightedScenarioInput = {
  impact: number;
  threat: number;
  vulnerability: number;
};

function clampFivePoint(n: number): number {
  return Math.min(5, Math.max(1, n));
}

/**
 * Returns aggregated impact, threat, and vulnerability (1–5 integers).
 * Single scenario: pass-through without rounding/clamping beyond catalog values.
 * Multiple scenarios: weighted sums, Math.round at steps 2–3–5 only, then clamp to 1–5.
 * Null when no inputs or weight_total <= 0 (caller shows dash).
 */
export function aggregateImpactWeightedParentScores(
  scenarios: readonly ImpactWeightedScenarioInput[],
): { impact: number; threat: number; vulnerability: number } | null {
  if (scenarios.length === 0) return null;
  if (scenarios.length === 1) {
    const s = scenarios[0]!;
    return {
      impact: s.impact,
      threat: s.threat,
      vulnerability: s.vulnerability,
    };
  }

  const weightTotal = scenarios.reduce((acc, s) => acc + s.impact, 0);
  /** Avoid division by zero; caller treats as no valid aggregate. */
  if (weightTotal <= 0) return null;

  const threatAgg = Math.round(
    scenarios.reduce((acc, s) => acc + s.threat * s.impact, 0) / weightTotal,
  );
  const vulnerabilityAgg = Math.round(
    scenarios.reduce((acc, s) => acc + s.vulnerability * s.impact, 0) / weightTotal,
  );
  const impactAgg = Math.round(
    scenarios.reduce((acc, s) => acc + s.impact * s.impact, 0) / weightTotal,
  );

  return {
    threat: clampFivePoint(threatAgg),
    vulnerability: clampFivePoint(vulnerabilityAgg),
    impact: clampFivePoint(impactAgg),
  };
}
