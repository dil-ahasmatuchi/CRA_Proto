import type { RagDataVizKey } from "./ragDataVisualization.js";

// ---------------------------------------------------------------------------
// Scale types
// ---------------------------------------------------------------------------

export type FivePointScaleValue = 1 | 2 | 3 | 4 | 5;

export type FivePointScaleLabel =
  | "Very low"
  | "Low"
  | "Medium"
  | "High"
  | "Very high";

// ---------------------------------------------------------------------------
// Status types
// ---------------------------------------------------------------------------

export type CyberRiskStatus =
  | "Identification"
  | "Assessment"
  | "Mitigation"
  | "Monitoring";

export type AssessmentStatus = "Draft" | "In progress" | "Approved";

export type ControlStatus = "Draft" | "Active" | "Archived";

export type ThreatStatus = "Draft" | "Active" | "Archived";

export type VulnerabilityStatus = "Draft" | "Active" | "Archived";

export type MitigationPlanStatus = "In progress" | "Completed" | "Overdue";

export type AssetStatus = "Active" | "Inactive" | "Decommissioned";

// ---------------------------------------------------------------------------
// Enum-like attribute types
// ---------------------------------------------------------------------------

export type ControlType = "Preventive" | "Detective";

export type ControlFrequency =
  | "Daily"
  | "Weekly"
  | "Bi-weekly"
  | "Monthly"
  | "Quarterly"
  | "Annually";

export type ThreatSource = "Deliberate" | "Accidental" | "Environmental";

export type VulnerabilityDomain =
  | "Technology"
  | "People"
  | "Process"
  | "Physical";

export type CIAImpact = "Confidentiality" | "Integrity" | "Availability";

export type AssetType =
  | "Application"
  | "Database"
  | "Server"
  | "Network device"
  | "Cloud service"
  | "Endpoint"
  | "IoT device";

// ---------------------------------------------------------------------------
// Entity interfaces
// ---------------------------------------------------------------------------

export interface MockUser {
  id: string;
  initials: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface MockBusinessUnit {
  id: string;
  name: string;
}

export interface MockAsset {
  id: string;
  name: string;
  ownerId: string;
  assetType: AssetType;
  criticality: FivePointScaleValue;
  criticalityLabel: FivePointScaleLabel;
  businessUnitId: string;
  status: AssetStatus;
}

export interface MockThreat {
  id: string;
  name: string;
  ownerId: string;
  source: ThreatSource;
  status: ThreatStatus;
  controlFrequency: ControlFrequency;
  cyberRiskIds: string[];
  assetIds: string[];
  vulnerabilityIds: string[];
}

export interface MockVulnerability {
  id: string;
  name: string;
  ownerId: string;
  domain: VulnerabilityDomain;
  status: VulnerabilityStatus;
  primaryCIAImpact: CIAImpact;
  cyberRiskIds: string[];
  assetIds: string[];
  threatIds: string[];
}

export interface MockControl {
  id: string;
  name: string;
  ownerId: string;
  status: ControlStatus;
  controlType: ControlType;
  keyControl: boolean;
  controlFrequency: ControlFrequency;
  cyberRiskIds: string[];
}

export interface MockCyberRisk {
  id: string;
  name: string;
  ownerId: string;
  status: CyberRiskStatus;
  businessUnitId: string;
  likelihood: number;
  likelihoodLabel: FivePointScaleLabel;
  impact: FivePointScaleValue;
  impactLabel: FivePointScaleLabel;
  cyberRiskScore: number;
  cyberRiskScoreLabel: FivePointScaleLabel;
  assetIds: string[];
  threatIds: string[];
  vulnerabilityIds: string[];
  scenarioIds: string[];
  controlIds: string[];
  mitigationPlanIds: string[];
}

export interface MockScenario {
  id: string;
  name: string;
  ownerId: string;
  cyberRiskId: string;
  assetId: string;
  impact: FivePointScaleValue;
  impactLabel: FivePointScaleLabel;
  threatSeverity: FivePointScaleValue;
  threatSeverityLabel: FivePointScaleLabel;
  vulnerabilitySeverity: FivePointScaleValue;
  vulnerabilitySeverityLabel: FivePointScaleLabel;
  likelihood: number;
  likelihoodLabel: FivePointScaleLabel;
  cyberRiskScore: number;
  cyberRiskScoreLabel: FivePointScaleLabel;
  threatIds: string[];
  vulnerabilityIds: string[];
  scoringRationale: string;
}

export interface MockCyberRiskAssessment {
  id: string;
  name: string;
  ownerId: string;
  status: AssessmentStatus;
  assessmentType: string;
  startDate: string;
  dueDate: string;
  assetIds: string[];
  cyberRiskIds: string[];
  threatIds: string[];
  vulnerabilityIds: string[];
  scenarioIds: string[];
}

export interface MockMitigationPlan {
  id: string;
  name: string;
  ownerId: string;
  status: MitigationPlanStatus;
  dueDate: string;
  businessUnitId: string;
  severity: FivePointScaleValue;
  severityLabel: FivePointScaleLabel;
  controlIds: string[];
  cyberRiskIds: string[];
  assessmentIds: string[];
}

// ---------------------------------------------------------------------------
// Utility functions — scale labels & RAG mapping
// ---------------------------------------------------------------------------

const FIVE_POINT_LABELS: Record<FivePointScaleValue, FivePointScaleLabel> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

export function getFivePointLabel(value: FivePointScaleValue): FivePointScaleLabel {
  return FIVE_POINT_LABELS[value];
}

export function getLikelihoodLabel(value: number): FivePointScaleLabel {
  if (value >= 21) return "Very high";
  if (value >= 16) return "High";
  if (value >= 11) return "Medium";
  if (value >= 6) return "Low";
  return "Very low";
}

export function getLikelihoodRange(value: number): string {
  if (value >= 21) return "21–25";
  if (value >= 16) return "16–20";
  if (value >= 11) return "11–15";
  if (value >= 6) return "6–10";
  return "1–5";
}

export function getCyberRiskScoreLabel(value: number): FivePointScaleLabel {
  if (value >= 101) return "Very high";
  if (value >= 76) return "High";
  if (value >= 51) return "Medium";
  if (value >= 26) return "Low";
  return "Very low";
}

export function getCyberRiskScoreRange(value: number): string {
  if (value >= 101) return "101–125";
  if (value >= 76) return "76–100";
  if (value >= 51) return "51–75";
  if (value >= 26) return "26–50";
  return "1–25";
}

const FIVE_POINT_TO_RAG: Record<FivePointScaleLabel, RagDataVizKey> = {
  "Very low": "pos05",
  Low: "pos04",
  Medium: "neu03",
  High: "neg03",
  "Very high": "neg05",
};

export function fivePointLabelToRag(label: FivePointScaleLabel): RagDataVizKey {
  return FIVE_POINT_TO_RAG[label];
}

// ---------------------------------------------------------------------------
// ID helpers
// ---------------------------------------------------------------------------

export function padId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}
