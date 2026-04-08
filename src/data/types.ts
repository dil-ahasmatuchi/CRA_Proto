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
  | "Draft"
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

/** Default options for “Typical threat actor / source” (multi-select). */
export type ThreatActor =
  | "Nation-State / State-Sponsored Actor"
  | "Organised Cybercriminal Group"
  | "Hacktivist"
  | "Malicious Insider (employee, contractor)"
  | "Negligent / Untrained Employee"
  | "Opportunistic / Script Kiddie"
  | "Terrorist / Extremist Group"
  | "Competitor (corporate espionage)"
  | "Natural / Environmental Event"
  | "System / Process Failure (non-human)";

/** Default options for “Attack vector” (multi-select). */
export type ThreatAttackVector =
  | "Email & Messaging (phishing, BEC, malicious attachments)"
  | "Web Application & Browser"
  | "Network & Remote Access (VPN, RDP, open ports)"
  | "Physical Access & Removable Media"
  | "Insider / Privileged Access Abuse"
  | "Supply Chain & Third-Party Software"
  | "Cloud Services & APIs"
  | "Social Media & Public Channels"
  | "Wireless & Mobile (Wi-Fi, Bluetooth, SMS)"
  | "Operational Technology / Industrial Interfaces";

/** Enterprise threat taxonomy for reporting and heat maps. */
export type ThreatDomain =
  | "Identity & Access Management"
  | "Endpoint & Device"
  | "Network & Infrastructure"
  | "Application & API"
  | "Data & Information"
  | "Cloud & Virtualisation"
  | "Physical & Facilities"
  | "Supply Chain & Third Party"
  | "Operational Technology (OT/ICS)"
  | "People & Workforce";

export type VulnerabilityDomain =
  | "Technology"
  | "People"
  | "Process"
  | "Physical";

/** Default single-select options for “Vulnerability type” (within domain). ISO 27005 / NIST CSF–aligned library. */
export const VULNERABILITY_TYPE_OPTIONS = [
  "Patch / Update Management",
  "Security Configuration",
  "Unsupported / End-of-Life Technology",
  "Authentication and Access Control",
  "Cryptographic Weakness",
  "Network Security Weakness",
  "Application Security Defect",
  "Cloud Security Misconfiguration",
  "Asset Visibility and Inventory Gap",
  "Logging, Monitoring and Detection Gap",
  "Data Protection Weakness",
  "Identity and Privilege Management",
  "Security Awareness and Training Gap",
  "Insider Risk and Human Error",
  "Policy and Governance Gap",
  "Change and Release Management Weakness",
  "Incident Response Readiness Gap",
  "Third-Party and Vendor Risk",
  "Software Supply Chain Risk",
  "Physical and Environmental Security Gap",
] as const;

export type VulnerabilityType = (typeof VULNERABILITY_TYPE_OPTIONS)[number];

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

/** Cross-entity links; filled when threats, cyber risks, and scenarios are loaded. */
export interface MockAssetRelationships {
  vulnerabilityIds: string[];
  threatIds: string[];
  cyberRiskIds: string[];
  scenarioIds: string[];
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
  vulnerabilityIds: string[];
  threatIds: string[];
  relationships: MockAssetRelationships;
}

/** cyberRisk / control / mitigation / scenario links are placeholders until those catalogs are regenerated. */
export interface MockThreatRelationships {
  assetIds: string[];
  vulnerabilityIds: string[];
  cyberRiskIds: string[];
  controlIds: string[];
  mitigationPlanIds: string[];
  scenarioIds: string[];
}

export interface MockThreatAttachment {
  id: string;
  fileName: string;
}

/**
 * Threat category (curated library object), MVP-aligned with ISO 27005 / NIST CSF framing.
 * Meta ID (`id`) and display ID are customer-configurable in product; prototype uses seeded values.
 */
export interface MockThreat {
  /** Meta / system identifier (e.g. THR-001). */
  id: string;
  /** Display identifier shown to users (customer-defined in product). */
  displayId: string;
  /** Short, recognisable label (required). */
  name: string;
  domain: ThreatDomain;
  /** Scenario narrative: what the threat is, how it manifests, what it targets. */
  description: string;
  /** Type of threat source (multi-select). */
  sources: ThreatSource[];
  /** Typical threat actor / source (multi-select). */
  threatActors: ThreatActor[];
  attackVectors: ThreatAttackVector[];
  status: ThreatStatus;
  /** User lookup — accountable owners for review and accuracy (ordered). */
  ownerIds: string[];
  /** Supplementary references only (not primary structured data). */
  attachments: MockThreatAttachment[];
  cyberRiskIds: string[];
  assetIds: string[];
  vulnerabilityIds: string[];
  relationships: MockThreatRelationships;
}

/** UI copy for “Type of threat source” options (configurable values, fixed semantics in spec). */
export const THREAT_SOURCE_OPTION_DETAILS: ReadonlyArray<{
  value: ThreatSource;
  caption: string;
}> = [
  {
    value: "Deliberate",
    caption: "Deliberate — intentional, malicious acts by human actors",
  },
  {
    value: "Accidental",
    caption: "Accidental — unintentional human errors or omissions",
  },
  {
    value: "Environmental",
    caption: "Environmental — natural events or infrastructure failures outside human control",
  },
];

export const THREAT_ACTOR_OPTIONS: readonly ThreatActor[] = [
  "Nation-State / State-Sponsored Actor",
  "Organised Cybercriminal Group",
  "Hacktivist",
  "Malicious Insider (employee, contractor)",
  "Negligent / Untrained Employee",
  "Opportunistic / Script Kiddie",
  "Terrorist / Extremist Group",
  "Competitor (corporate espionage)",
  "Natural / Environmental Event",
  "System / Process Failure (non-human)",
] as const;

export const THREAT_ATTACK_VECTOR_OPTIONS: readonly ThreatAttackVector[] = [
  "Email & Messaging (phishing, BEC, malicious attachments)",
  "Web Application & Browser",
  "Network & Remote Access (VPN, RDP, open ports)",
  "Physical Access & Removable Media",
  "Insider / Privileged Access Abuse",
  "Supply Chain & Third-Party Software",
  "Cloud Services & APIs",
  "Social Media & Public Channels",
  "Wireless & Mobile (Wi-Fi, Bluetooth, SMS)",
  "Operational Technology / Industrial Interfaces",
] as const;

/** Cross-entity links; non-asset fields start empty until mock data rewrite catches up. */
export interface MockVulnerabilityRelationships {
  assetId: string;
  cyberRiskIds: string[];
  threatIds: string[];
  controlIds: string[];
  mitigationPlanIds: string[];
  scenarioIds: string[];
}

/**
 * Vulnerability category (library row), aligned with ISO 27005 / NIST CSF framing.
 * Meta ID (`id`) and display ID are customer-configurable in product; prototype uses seeded values.
 */
export interface MockVulnerability {
  /** Meta / system identifier (e.g. VUL-001). */
  id: string;
  /** Display identifier shown to users (e.g. VUL-CAT-001). */
  displayId: string;
  /** Short, recognisable label (required). */
  name: string;
  /** Optional narrative — scope and boundary of the category. */
  description?: string;
  domain: VulnerabilityDomain;
  /** Optional finer classification within the domain. */
  vulnerabilityType?: VulnerabilityType;
  status: VulnerabilityStatus;
  /** One or more CIA triad pillars affected (multi-select). */
  primaryCIAImpact: CIAImpact[];
  /** User lookup — accountable owners for review and accuracy (ordered). */
  ownerIds: string[];
  /** Supplementary references only (not primary structured data). */
  attachments: MockThreatAttachment[];
  cyberRiskIds: string[];
  /** Single asset per row; mirrors `relationships.assetId`. */
  assetIds: string[];
  threatIds: string[];
  relationships: MockVulnerabilityRelationships;
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

export interface MockCyberRiskRelationships {
  assetIds: string[];
  threatIds: string[];
  vulnerabilityIds: string[];
  scenarioIds: string[];
  controlIds: string[];
  mitigationPlanIds: string[];
  assessmentIds: string[];
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
  relationships: MockCyberRiskRelationships;
}

export interface MockScenarioRelationships {
  cyberRiskId: string;
  assetId: string;
  threatIds: string[];
  vulnerabilityIds: string[];
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
  relationships: MockScenarioRelationships;
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
