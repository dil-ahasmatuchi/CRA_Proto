import type { AssessmentStatus } from "../data/types.js";
import { scopedScenarios } from "./scopeAssessmentRollup.js";

export type AssessmentPhase =
  | "draft"
  | "scoping"
  | "inProgress"
  | "overdue"
  | "assessmentApproved";

/** AI scoring flow on the Scoring tab (Scoring phase / Overdue). */
export type AiScoringPhase = "idle" | "processing" | "complete";

/** Scoring type chosen on the Details tab (drives navigation context to scenario detail). */
export type CraScoringTypeChoice = "inherent" | "residual";

/** `navigate` state when opening a scenario from the new CRA scoring table. */
export type CraScenarioDetailLocationState = {
  assessmentName?: string;
  scoringType?: CraScoringTypeChoice;
  aiScoringPhase?: AiScoringPhase;
  /** CRA assessment route to return to (e.g. `/cyber-risk/cyber-risk-assessments/new` or `.../:id`). */
  returnToAssessmentPath?: string;
};

type ScopeSubView =
  | "overview"
  | "assets"
  | "scopedCyberRisks"
  | "scopedThreats"
  | "scopedVulnerabilities";

const STORAGE_KEY = "cra_new_assessment_draft_v1";

const SCOPE_TAB_INDEX = 1;
const SCORING_TAB_INDEX = 2;
const RESULTS_TAB_INDEX = 3;

export type CraNewAssessmentPersistedDraft = {
  activeTab: number;
  assessmentPhase: AssessmentPhase;
  name: string;
  assessmentId: string;
  assessmentType: string;
  startDate: string;
  dueDate: string;
  /** Mock user ids from `users` (owner lookup). */
  ownerIds: string[];
  scopeSubView: ScopeSubView;
  /** Asset ids included in assessment scope (AST-###). */
  includedScopeAssetIds: string[];
  /** AI scoring CTA/table state; `processing` is not restored after reload. */
  aiScoringPhase: AiScoringPhase;
  /** Scoring type (Inherent vs Residual). */
  scoringType: CraScoringTypeChoice;
};

function isAssessmentPhase(v: unknown): v is AssessmentPhase {
  return (
    v === "draft" ||
    v === "scoping" ||
    v === "inProgress" ||
    v === "overdue" ||
    v === "assessmentApproved"
  );
}

function isAiScoringPhase(v: unknown): v is AiScoringPhase {
  return v === "idle" || v === "processing" || v === "complete";
}

function isCraScoringTypeChoice(v: unknown): v is CraScoringTypeChoice {
  return v === "inherent" || v === "residual";
}

function normalizeCraScoringTypeChoice(v: unknown): CraScoringTypeChoice {
  if (v === "inherent_residual") return "residual";
  if (isCraScoringTypeChoice(v)) return v;
  return "residual";
}

function isScopeSubView(v: unknown): v is ScopeSubView {
  return (
    v === "overview" ||
    v === "assets" ||
    v === "scopedCyberRisks" ||
    v === "scopedThreats" ||
    v === "scopedVulnerabilities"
  );
}

function sanitizeDraft(raw: Partial<CraNewAssessmentPersistedDraft>): CraNewAssessmentPersistedDraft {
  let activeTab =
    typeof raw.activeTab === "number" && raw.activeTab >= 0 && raw.activeTab <= 3
      ? raw.activeTab
      : 0;
  const assessmentPhase = isAssessmentPhase(raw.assessmentPhase) ? raw.assessmentPhase : "draft";
  const scopingStarted = assessmentPhase !== "draft";
  const assessmentStarted =
    assessmentPhase === "inProgress" ||
    assessmentPhase === "overdue" ||
    assessmentPhase === "assessmentApproved";
  if (!scopingStarted && activeTab === SCOPE_TAB_INDEX) {
    activeTab = 0;
  }
  if (!assessmentStarted && (activeTab === SCORING_TAB_INDEX || activeTab === RESULTS_TAB_INDEX)) {
    activeTab = 0;
  }
  const scopeSubView = isScopeSubView(raw.scopeSubView) ? raw.scopeSubView : "overview";
  const ownerIds = Array.isArray(raw.ownerIds)
    ? (raw.ownerIds as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  const includedScopeAssetIds = Array.isArray(raw.includedScopeAssetIds)
    ? (raw.includedScopeAssetIds as unknown[]).filter((x): x is string => typeof x === "string")
    : [];
  let aiScoringPhase: AiScoringPhase = isAiScoringPhase(raw.aiScoringPhase)
    ? raw.aiScoringPhase
    : "idle";
  if (aiScoringPhase === "processing") {
    aiScoringPhase = "idle";
  }
  const scoringType = normalizeCraScoringTypeChoice(raw.scoringType);
  return {
    activeTab,
    assessmentPhase,
    name: typeof raw.name === "string" ? raw.name : "",
    assessmentId: typeof raw.assessmentId === "string" ? raw.assessmentId : "",
    assessmentType: typeof raw.assessmentType === "string" ? raw.assessmentType : "",
    startDate: typeof raw.startDate === "string" ? raw.startDate : "",
    dueDate: typeof raw.dueDate === "string" ? raw.dueDate : "",
    ownerIds,
    scopeSubView,
    includedScopeAssetIds,
    aiScoringPhase,
    scoringType,
  };
}

export function loadCraNewAssessmentDraft(): CraNewAssessmentPersistedDraft | null {
  try {
    const item = sessionStorage.getItem(STORAGE_KEY);
    if (!item) return null;
    const parsed = JSON.parse(item) as unknown;
    if (parsed == null || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    return sanitizeDraft({
      activeTab: o.activeTab as number,
      assessmentPhase: o.assessmentPhase as AssessmentPhase,
      name: o.name as string,
      assessmentId: o.assessmentId as string,
      assessmentType: o.assessmentType as string,
      startDate: o.startDate as string,
      dueDate: o.dueDate as string,
      ownerIds: o.ownerIds as string[],
      scopeSubView: o.scopeSubView as ScopeSubView,
      includedScopeAssetIds: o.includedScopeAssetIds as string[],
      aiScoringPhase: o.aiScoringPhase as AiScoringPhase,
      scoringType: o.scoringType as CraScoringTypeChoice | undefined,
    });
  } catch {
    return null;
  }
}

export function saveCraNewAssessmentDraft(draft: CraNewAssessmentPersistedDraft): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeDraft(draft)));
  } catch {
    // ignore quota / private mode
  }
}

/**
 * When the session draft is in Scoping with scope assets and at least one scoped scenario,
 * advances phase to inProgress (Scoring) so returning from the scenario page restores the right phase.
 */
export function advanceCraPhaseToScoringIfEligible(): void {
  const draft = loadCraNewAssessmentDraft();
  if (!draft) return;
  if (draft.assessmentPhase !== "scoping") return;
  const assetIds = new Set(draft.includedScopeAssetIds);
  if (assetIds.size === 0) return;
  if (scopedScenarios(assetIds).length === 0) return;
  saveCraNewAssessmentDraft({
    ...draft,
    assessmentPhase: "inProgress",
  });
}

/** Clears persisted draft (e.g. before a fresh "new assessment" visit). */
export function clearCraNewAssessmentDraft(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Maps list/grid `AssessmentStatus` to header workflow phase (e.g. when opening an existing mock assessment). */
export function assessmentStatusToPhase(status: AssessmentStatus): AssessmentPhase {
  switch (status) {
    case "Draft":
      return "draft";
    case "Scoping":
      return "scoping";
    case "Scoring":
      return "inProgress";
    case "Approved":
      return "assessmentApproved";
    case "Overdue":
      return "overdue";
    default:
      return "draft";
  }
}

/** Inverse of {@link assessmentStatusToPhase} for the current CRA workflow. */
export function assessmentPhaseToAssessmentStatus(phase: AssessmentPhase): AssessmentStatus {
  switch (phase) {
    case "draft":
      return "Draft";
    case "scoping":
      return "Scoping";
    case "inProgress":
      return "Scoring";
    case "overdue":
      return "Overdue";
    case "assessmentApproved":
      return "Approved";
  }
}
