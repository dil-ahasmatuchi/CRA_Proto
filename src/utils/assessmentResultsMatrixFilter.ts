import type { MockCyberRisk } from "../data/types.js";
import type { AssessmentCyberResultsRow } from "../pages/craAssessmentScopeRows.js";
import {
  mockCyberRiskMatchesMatrixFilter,
  type CyberRiskMatrixTableFilter,
} from "./cyberRiskTableRows.js";

/**
 * Keeps cyber risk + scenario rows whose parent risk matches the heatmap slice (same semantics as the
 * global cyber risks list matrix filter).
 */
export function filterAssessmentCyberResultsByMatrixFilter(
  rows: AssessmentCyberResultsRow[],
  matrixFilter: CyberRiskMatrixTableFilter | null,
  cyberRiskById: ReadonlyMap<string, MockCyberRisk>,
): AssessmentCyberResultsRow[] {
  if (matrixFilter == null) return rows;
  const matchingGroupIds = new Set<string>();
  for (const [id, risk] of cyberRiskById) {
    if (mockCyberRiskMatchesMatrixFilter(risk, matrixFilter)) {
      matchingGroupIds.add(id);
    }
  }
  return rows.filter((r) => matchingGroupIds.has(r.groupId));
}
