/** Shared CRA new-assessment draft model (used by page storage + catalog persistence). */

export type AssessmentPhase =
  | "draft"
  | "scoping"
  | "inProgress"
  | "overdue"
  | "assessmentApproved";

export type AiScoringPhase = "idle" | "processing" | "complete";

export type CraScoringTypeChoice = "inherent" | "residual";

/** How parent cyber-risk rows aggregate scenario scores in the Scoring tab. */
export type CraScenarioScoreAggregationMethod = "highest" | "average";

export type ScopeSubView =
  | "overview"
  | "assets"
  | "scopedCyberRisks"
  | "scopedThreats"
  | "scopedVulnerabilities"
  | "scopedControls";

export type CraNewAssessmentPersistedDraft = {
  activeTab: number;
  assessmentPhase: AssessmentPhase;
  name: string;
  assessmentId: string;
  assessmentType: string;
  startDate: string;
  dueDate: string;
  ownerIds: string[];
  scopeSubView: ScopeSubView;
  includedScopeAssetIds: string[];
  /** Cyber risk library ids explicitly removed from this assessment (still in candidate set from assets). */
  excludedScopeCyberRiskIds: string[];
  /** Threat library ids explicitly excluded while still linked to candidate scope. */
  excludedScopeThreatIds: string[];
  excludedScopeVulnerabilityIds: string[];
  excludedScopeControlIds: string[];
  aiScoringPhase: AiScoringPhase;
  scoringType: CraScoringTypeChoice;
  scenarioScoreAggregationMethod: CraScenarioScoreAggregationMethod;
  /** Scenario library ids marked n/a for this assessment (excluded from weighted aggregation). */
  scenarioNotApplicableIds: string[];
};
