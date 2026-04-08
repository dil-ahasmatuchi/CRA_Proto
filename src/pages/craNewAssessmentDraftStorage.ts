export type AssessmentPhase = "draft" | "scoping" | "inProgress" | "assessmentApproved";

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
};

function isAssessmentPhase(v: unknown): v is AssessmentPhase {
  return v === "draft" || v === "scoping" || v === "inProgress" || v === "assessmentApproved";
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

function sanitizeDraft(raw: CraNewAssessmentPersistedDraft): CraNewAssessmentPersistedDraft {
  let activeTab =
    typeof raw.activeTab === "number" && raw.activeTab >= 0 && raw.activeTab <= 3
      ? raw.activeTab
      : 0;
  const assessmentPhase = isAssessmentPhase(raw.assessmentPhase) ? raw.assessmentPhase : "draft";
  const scopingStarted = assessmentPhase !== "draft";
  const assessmentStarted = assessmentPhase === "inProgress" || assessmentPhase === "assessmentApproved";
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
