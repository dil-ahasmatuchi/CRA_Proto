import type { RiskHeatmapLevel } from "../data/ragDataVisualization.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { getUserById } from "../data/users.js";
import type { CyberRiskStatus, FivePointScaleLabel } from "../data/types.js";

const SCORE_LABEL_TO_HEATMAP: Record<FivePointScaleLabel, RiskHeatmapLevel> = {
  "Very low": "veryLow",
  Low: "low",
  Medium: "medium",
  High: "high",
  "Very high": "veryHigh",
};

export type CyberRiskRow = {
  id: string;
  name: string;
  riskId: string;
  ownerId: string;
  cyberRiskScore: string;
  riskLevel: RiskHeatmapLevel | null;
  ownerName: string;
  ownerInitials: string;
  assets: number;
  workflowStatus: CyberRiskStatus;
  cyberRiskScoreLabel: FivePointScaleLabel;
  assetIds: string[];
};

/** Workflow values shown in filter UI (all statuses used in the app). */
export const CYBER_RISK_WORKFLOW_FILTER_OPTIONS: readonly CyberRiskStatus[] = [
  "Draft",
  "Identification",
  "Assessment",
  "Mitigation",
  "Monitoring",
] as const;

/** Inherent cyber risk score (label) options for the filter UI. */
export const CYBER_RISK_SCORE_FILTER_OPTIONS: readonly FivePointScaleLabel[] = [
  "Very low",
  "Low",
  "Medium",
  "High",
  "Very high",
] as const;

export type CyberRiskTableFilters = {
  /** Empty = no restriction (all statuses). */
  workflowStatuses: CyberRiskStatus[];
  /** Empty = no restriction (all owners). */
  ownerIds: string[];
  /** Empty = no restriction (all score labels). */
  scoreLabels: FivePointScaleLabel[];
  /** Empty = no restriction; otherwise row must include at least one of these assets. */
  assetIds: string[];
};

export const EMPTY_CYBER_RISK_TABLE_FILTERS: CyberRiskTableFilters = {
  workflowStatuses: [],
  ownerIds: [],
  scoreLabels: [],
  assetIds: [],
};

export function buildCyberRiskRows(): CyberRiskRow[] {
  return cyberRisks.map((r) => {
    const owner = getUserById(r.ownerId);
    return {
      id: r.id,
      name: r.name,
      riskId: r.id,
      ownerId: r.ownerId,
      cyberRiskScore: `${r.cyberRiskScore} - ${r.cyberRiskScoreLabel}`,
      riskLevel: SCORE_LABEL_TO_HEATMAP[r.cyberRiskScoreLabel],
      ownerName: owner?.fullName ?? "Unassigned",
      ownerInitials: owner?.initials ?? "",
      assets: r.assetIds.length,
      workflowStatus: r.status,
      cyberRiskScoreLabel: r.cyberRiskScoreLabel,
      assetIds: [...r.assetIds],
    };
  });
}

export function applyCyberRiskFilters(
  rows: CyberRiskRow[],
  filters: CyberRiskTableFilters,
): CyberRiskRow[] {
  const statusSet =
    filters.workflowStatuses.length > 0 ? new Set(filters.workflowStatuses) : null;
  const ownerSet = filters.ownerIds.length > 0 ? new Set(filters.ownerIds) : null;
  const scoreSet = filters.scoreLabels.length > 0 ? new Set(filters.scoreLabels) : null;
  const assetSet = filters.assetIds.length > 0 ? new Set(filters.assetIds) : null;

  return rows.filter((row) => {
    if (statusSet && !statusSet.has(row.workflowStatus)) return false;
    if (ownerSet && !ownerSet.has(row.ownerId)) return false;
    if (scoreSet && !scoreSet.has(row.cyberRiskScoreLabel)) return false;
    if (assetSet) {
      const hasOverlap = row.assetIds.some((id) => assetSet.has(id));
      if (!hasOverlap) return false;
    }
    return true;
  });
}
