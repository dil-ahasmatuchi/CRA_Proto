/**
 * Scoring Agent Service
 *
 * Core types and interfaces for the cyber risk assessment scoring agent.
 * Implements the scoring specification v1.1.
 */

// ============================================================================
// Types (from specification)
// ============================================================================

export type AssetType =
  | "Application"
  | "Database"
  | "Server"
  | "Network device"
  | "Cloud service"
  | "Endpoint"
  | "IoT device";

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

export type ThreatSource = "Deliberate" | "Accidental" | "Environmental";

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

export type VulnerabilityDomain = "Technology" | "People" | "Process" | "Physical";

export type CIAImpact = "Confidentiality" | "Integrity" | "Availability";

export type SeverityScore = 1 | 2 | 3 | 4 | 5;

export type SeverityLabel = "Very low" | "Low" | "Medium" | "High" | "Very high";

export type ConfidenceLevel = "high" | "medium" | "low";

// ============================================================================
// Input Structure
// ============================================================================

export interface ScoringInput {
  scenarioId: string;
  scenarioName: string;
  cyberRiskId: string;
  cyberRiskName: string;
  isNotApplicable?: boolean;

  asset: {
    id: string;
    name: string;
    assetType: AssetType;
    criticality: SeverityScore;
    criticalityLabel: SeverityLabel;
    orgUnitId: string;
    status: "Active" | "Inactive" | "Decommissioned";
    controlIds: string[];
  };

  threat: {
    id: string;
    displayId: string;
    name: string;
    domain: ThreatDomain;
    description: string;
    sources: ThreatSource[];
    threatActors: ThreatActor[];
    attackVectors: ThreatAttackVector[];
    status: "Draft" | "Active" | "Archived";
  };

  vulnerability: {
    id: string;
    displayId: string;
    name: string;
    description?: string;
    domain: VulnerabilityDomain;
    vulnerabilityType?: string;
    primaryCIAImpact: CIAImpact[];
    status: "Draft" | "Active" | "Archived";
  };

  controls: Array<{
    id: string;
    name: string;
    controlType: "Preventive" | "Detective";
    effectiveness: SeverityScore;
    effectivenessLabel: SeverityLabel;
    keyControl: boolean;
    controlFrequency: string;
    status: "Draft" | "Active" | "Archived";
  }>;

  orgUnit: {
    id: string;
    name: string;
  };
}

// ============================================================================
// Output Structure
// ============================================================================

export interface ScoringOutput {
  scenarioId: string;
  timestamp: string;
  scoringMode: "inherent";

  skipped?: boolean;
  skipReason?: string;

  threatSeverity: SeverityScore | null;
  threatSeverityLabel: SeverityLabel | null;
  threatConfidence: ConfidenceLevel;
  threatConfidenceReason?: string;
  threatRationale: string;

  vulnerabilitySeverity: SeverityScore | null;
  vulnerabilitySeverityLabel: SeverityLabel | null;
  vulnerabilityConfidence: ConfidenceLevel;
  vulnerabilityConfidenceReason?: string;
  vulnerabilityRationale: string;

  combinedRationaleSummary: string;

  calculatedLikelihood: number | null;
  calculatedLikelihoodLabel: string | null;
  calculatedCyberRiskScore: number | null;
  calculatedCyberRiskScoreLabel: string | null;

  needsReview: boolean;
  reviewReason?: string;
}

// ============================================================================
// Batch Processing
// ============================================================================

export interface BatchScoringInput {
  assessmentId: string;
  assessmentName?: string;
  scenarios: ScoringInput[];
}

export interface BatchScoringOutput {
  assessmentId: string;
  timestamp: string;
  results: ScoringOutput[];

  summary: {
    total: number;
    succeeded: number;
    failed: number;
    flaggedForReview: number;
    skipped: number;
  };

  errors?: Array<{
    scenarioId: string;
    scenarioName: string;
    error: string;
    errorCode?: string;
  }>;
}

// ============================================================================
// Scoring Agent Interface
// ============================================================================

export interface IScoringAgent {
  /**
   * Score a single scenario
   */
  scoreScenario(input: ScoringInput): Promise<ScoringOutput>;

  /**
   * Score multiple scenarios in batch
   */
  scoreBatch(input: BatchScoringInput): Promise<BatchScoringOutput>;

  /**
   * Get agent configuration
   */
  getConfig(): ScoringAgentConfig;
}

export interface ScoringAgentConfig {
  mode: "mock" | "llm" | "rule-based";
  version: string;
  timeoutMs: number;
}

// ============================================================================
// Utility Functions
// ============================================================================

const SEVERITY_LABELS: Record<SeverityScore, SeverityLabel> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

const LIKELIHOOD_BANDS = [
  { from: 1, to: 5, label: "Very low" },
  { from: 6, to: 10, label: "Low" },
  { from: 11, to: 15, label: "Medium" },
  { from: 16, to: 20, label: "High" },
  { from: 21, to: 25, label: "Very high" },
] as const;

const CYBER_RISK_SCORE_BANDS = [
  { from: 1, to: 2, label: "Very low" },
  { from: 3, to: 8, label: "Low" },
  { from: 9, to: 27, label: "Medium" },
  { from: 28, to: 64, label: "High" },
  { from: 65, to: 125, label: "Very high" },
] as const;

export function getSeverityLabel(score: SeverityScore): SeverityLabel {
  return SEVERITY_LABELS[score];
}

export function getLikelihoodLabel(score: number): string {
  for (const band of LIKELIHOOD_BANDS) {
    if (score >= band.from && score <= band.to) {
      return band.label;
    }
  }
  return "Unknown";
}

export function getCyberRiskScoreLabel(score: number): string {
  for (const band of CYBER_RISK_SCORE_BANDS) {
    if (score >= band.from && score <= band.to) {
      return band.label;
    }
  }
  return "Unknown";
}

export function calculateLikelihood(
  threatSeverity: SeverityScore,
  vulnerabilitySeverity: SeverityScore
): number {
  return threatSeverity * vulnerabilitySeverity;
}

export function calculateCyberRiskScore(
  impact: SeverityScore,
  likelihood: number
): number {
  return impact * likelihood;
}

/**
 * Create ISO 8601 timestamp
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate input data completeness
 */
export function validateInput(input: ScoringInput): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  if (!input.scenarioId) issues.push("Missing scenarioId");
  if (!input.asset?.name) issues.push("Missing asset name");
  if (!input.threat?.name) issues.push("Missing threat name");
  if (!input.vulnerability?.name) issues.push("Missing vulnerability name");

  return {
    valid: issues.length === 0,
    issues,
  };
}
