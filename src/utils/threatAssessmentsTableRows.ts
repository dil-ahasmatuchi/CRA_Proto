import { cyberRiskAssessments } from "../data/cyberRiskAssessments.js";
import { getAssetById } from "../data/assets.js";
import { scenarios } from "../data/scenarios.js";
import {
  RISK_HEATMAP_LEVEL_TO_RAG,
  type RagDataVizKey,
  type RiskHeatmapLevel,
} from "../data/ragDataVisualization.js";
import type {
  AssessmentStatus,
  FivePointScaleLabel,
  FivePointScaleValue,
  MockCyberRiskAssessment,
} from "../data/types.js";
import { getFivePointLabel } from "../data/types.js";
import { getUserById, users } from "../data/users.js";

const LABEL_TO_HEATMAP: Record<FivePointScaleLabel, RiskHeatmapLevel> = {
  "Very low": "veryLow",
  Low: "low",
  Medium: "medium",
  High: "high",
  "Very high": "veryHigh",
};

function cyberRiskLabelToRagKey(label: FivePointScaleLabel): RagDataVizKey {
  return RISK_HEATMAP_LEVEL_TO_RAG[LABEL_TO_HEATMAP[label]];
}

function threatSeverityToRagKey(v: FivePointScaleValue): RagDataVizKey {
  const map: Record<FivePointScaleValue, RagDataVizKey> = {
    1: RISK_HEATMAP_LEVEL_TO_RAG.veryLow,
    2: RISK_HEATMAP_LEVEL_TO_RAG.low,
    3: RISK_HEATMAP_LEVEL_TO_RAG.medium,
    4: RISK_HEATMAP_LEVEL_TO_RAG.high,
    5: RISK_HEATMAP_LEVEL_TO_RAG.veryHigh,
  };
  return map[v];
}

function formatCraIdForDisplay(id: string): string {
  return id.replace(/-/g, " - ");
}

function formatDueDateDisplay(iso: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(`${iso.trim()}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function pickAssetLabel(assessment: MockCyberRiskAssessment, threatAssetIds: string[]): string {
  const intersect = assessment.assetIds.filter((id) => threatAssetIds.includes(id));
  const pool = intersect.length > 0 ? intersect : assessment.assetIds;
  if (pool.length === 0) return "—";
  const aid = pool[0]!;
  return getAssetById(aid)?.name ?? aid;
}

function scenarioMatchesThreatInAssessment(
  s: (typeof scenarios)[number],
  assessment: MockCyberRiskAssessment,
  threatId: string,
): boolean {
  return assessment.scenarioIds.includes(s.id) && s.threatIds.includes(threatId);
}

function pickAssessorUserId(ownerId: string): string {
  const ownerIdx = users.findIndex((u) => u.id === ownerId);
  const i = ownerIdx >= 0 ? ownerIdx : 0;
  return users[(i + 7) % users.length]!.id;
}

export type ThreatAssessmentGridRow = {
  id: string;
  displayId: string;
  name: string;
  assetLabel: string;
  status: AssessmentStatus;
  threatSeverityLabel: string | null;
  threatRagKey: RagDataVizKey | null;
  cyberRiskScoreLabel: string | null;
  cyberRagKey: RagDataVizKey | null;
  dueDateDisplay: string;
  assessorName: string;
  assessorInitials: string;
  ownerName: string;
  ownerInitials: string;
};

export function buildThreatAssessmentGridRows(
  threatId: string,
  threatAssetIds: string[],
): ThreatAssessmentGridRow[] {
  const list = cyberRiskAssessments.filter((a) => a.threatIds.includes(threatId));

  return list.map((a) => {
    let maxThreatSev: FivePointScaleValue | null = null;
    let maxCyberScore = -1;
    let maxCyberLabel: FivePointScaleLabel | null = null;

    for (const s of scenarios) {
      if (!scenarioMatchesThreatInAssessment(s, a, threatId)) continue;
      if (maxThreatSev === null || s.threatSeverity > maxThreatSev) {
        maxThreatSev = s.threatSeverity;
      }
      if (s.cyberRiskScore > maxCyberScore) {
        maxCyberScore = s.cyberRiskScore;
        maxCyberLabel = s.cyberRiskScoreLabel;
      }
    }

    const threatSeverityLabel =
      maxThreatSev != null ? `${maxThreatSev} - ${getFivePointLabel(maxThreatSev)}` : null;
    const threatRagKey = maxThreatSev != null ? threatSeverityToRagKey(maxThreatSev) : null;

    const cyberRiskScoreLabel =
      maxCyberScore >= 0 && maxCyberLabel != null ? `${maxCyberScore} - ${maxCyberLabel}` : null;
    const cyberRagKey = maxCyberLabel != null ? cyberRiskLabelToRagKey(maxCyberLabel) : null;

    const owner = getUserById(a.ownerId);
    const assessor = getUserById(pickAssessorUserId(a.ownerId));

    return {
      id: a.id,
      displayId: formatCraIdForDisplay(a.id),
      name: a.name,
      assetLabel: pickAssetLabel(a, threatAssetIds),
      status: a.status,
      threatSeverityLabel,
      threatRagKey,
      cyberRiskScoreLabel,
      cyberRagKey,
      dueDateDisplay: formatDueDateDisplay(a.dueDate),
      assessorName: assessor?.fullName ?? "—",
      assessorInitials: assessor?.initials ?? "—",
      ownerName: owner?.fullName ?? "—",
      ownerInitials: owner?.initials ?? "—",
    };
  });
}
