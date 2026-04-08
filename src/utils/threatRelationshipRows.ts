import type { RelationLinkedObjectRowProps } from "../components/RelationLinkedObjectRow.js";
import {
  ragDataVizColor,
  RISK_HEATMAP_LEVEL_TO_RAG,
  type RagDataVizKey,
  type RiskHeatmapLevel,
} from "../data/ragDataVisualization.js";
import { getAssetById } from "../data/assets.js";
import { getCyberRiskById } from "../data/cyberRisks.js";
import type {
  AssetStatus,
  CyberRiskStatus,
  FivePointScaleLabel,
  FivePointScaleValue,
  MockAsset,
  MockCyberRisk,
  MockVulnerability,
  VulnerabilityStatus,
} from "../data/types.js";
import { getVulnerabilityById } from "../data/vulnerabilities.js";

const CYBER_RISKS_LIST_PATH = "/cyber-risk/cyber-risks";

function formatMetaIdForDisplay(id: string): string {
  return id.replace(/-/g, " - ");
}

function criticalityToRagKey(c: FivePointScaleValue): RagDataVizKey {
  const map: Record<FivePointScaleValue, RagDataVizKey> = {
    1: RISK_HEATMAP_LEVEL_TO_RAG.veryLow,
    2: RISK_HEATMAP_LEVEL_TO_RAG.low,
    3: RISK_HEATMAP_LEVEL_TO_RAG.medium,
    4: RISK_HEATMAP_LEVEL_TO_RAG.high,
    5: RISK_HEATMAP_LEVEL_TO_RAG.veryHigh,
  };
  return map[c];
}

function assetStatusColor(
  status: AssetStatus,
): NonNullable<RelationLinkedObjectRowProps["status"]>["color"] {
  if (status === "Active") return "success";
  if (status === "Inactive") return "subtle";
  return "generic";
}

function vulnerabilityStatusColor(
  status: VulnerabilityStatus,
): NonNullable<RelationLinkedObjectRowProps["status"]>["color"] {
  if (status === "Active") return "success";
  if (status === "Draft") return "subtle";
  return "generic";
}

const SCORE_LABEL_TO_HEATMAP: Record<FivePointScaleLabel, RiskHeatmapLevel> = {
  "Very low": "veryLow",
  Low: "low",
  Medium: "medium",
  High: "high",
  "Very high": "veryHigh",
};

function cyberRiskStatusColor(
  status: CyberRiskStatus,
): NonNullable<RelationLinkedObjectRowProps["status"]>["color"] {
  switch (status) {
    case "Draft":
      return "subtle";
    case "Assessment":
      return "warning";
    case "Mitigation":
      return "information";
    case "Identification":
      return "generic";
    case "Monitoring":
      return "success";
    default:
      return "generic";
  }
}

function assetToRow(asset: MockAsset): RelationLinkedObjectRowProps {
  const ragKey = criticalityToRagKey(asset.criticality);
  return {
    itemKey: asset.id,
    objectId: formatMetaIdForDisplay(asset.id),
    objectName: asset.name,
    status: { label: asset.status, color: assetStatusColor(asset.status) },
    trailing: {
      label: "Asset criticality",
      ragLabel: `${asset.criticality} - ${asset.criticalityLabel}`,
      ragSwatchSx: ({ tokens: t }) => ({ bgcolor: ragDataVizColor(t, ragKey) }),
    },
  };
}

function vulnerabilityToRow(v: MockVulnerability): RelationLinkedObjectRowProps {
  const base = `/cyber-risk/vulnerabilities/${encodeURIComponent(v.id)}`;
  return {
    itemKey: v.id,
    objectId: v.displayId,
    objectName: v.name,
    idHref: base,
    nameHref: base,
    status: { label: v.status, color: vulnerabilityStatusColor(v.status) },
  };
}

function cyberRiskToRow(r: MockCyberRisk): RelationLinkedObjectRowProps {
  const heat = SCORE_LABEL_TO_HEATMAP[r.cyberRiskScoreLabel];
  const ragKey = RISK_HEATMAP_LEVEL_TO_RAG[heat];
  const scoreLabel = `${r.cyberRiskScore} - ${r.cyberRiskScoreLabel}`;
  return {
    itemKey: r.id,
    objectId: formatMetaIdForDisplay(r.id),
    objectName: r.name,
    idHref: CYBER_RISKS_LIST_PATH,
    nameHref: CYBER_RISKS_LIST_PATH,
    status: { label: r.status, color: cyberRiskStatusColor(r.status) },
    trailing: {
      label: "Cyber risk score",
      ragLabel: scoreLabel,
      ragSwatchSx: ({ tokens: t }) => ({ bgcolor: ragDataVizColor(t, ragKey) }),
    },
  };
}

/** Linked assets for a threat, in ID order. */
export function rowsForThreatAssetIds(assetIds: string[]): RelationLinkedObjectRowProps[] {
  const out: RelationLinkedObjectRowProps[] = [];
  for (const id of assetIds) {
    const a = getAssetById(id);
    if (a) out.push(assetToRow(a));
  }
  return out;
}

/** Linked vulnerabilities for a threat, in ID order. */
export function rowsForThreatVulnerabilityIds(
  vulnerabilityIds: string[],
): RelationLinkedObjectRowProps[] {
  const out: RelationLinkedObjectRowProps[] = [];
  for (const id of vulnerabilityIds) {
    const v = getVulnerabilityById(id);
    if (v) out.push(vulnerabilityToRow(v));
  }
  return out;
}

/** Linked cyber risks for a threat, in ID order. */
export function rowsForThreatCyberRiskIds(cyberRiskIds: string[]): RelationLinkedObjectRowProps[] {
  const out: RelationLinkedObjectRowProps[] = [];
  for (const id of cyberRiskIds) {
    const r = getCyberRiskById(id);
    if (r) out.push(cyberRiskToRow(r));
  }
  return out;
}
