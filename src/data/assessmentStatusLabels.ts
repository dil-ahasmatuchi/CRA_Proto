import type { AssessmentStatus } from "./types.js";

/**
 * Single UI copy map for {@link AssessmentStatus}. Keep labels unique so
 * {@link assessmentStatusFromDisplayLabel} is unambiguous.
 */
export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  Draft: "Draft",
  Scoping: "Scoping",
  Scoring: "Scoring",
  Approved: "Approved",
  Overdue: "Overdue",
};

export function assessmentStatusLabel(status: AssessmentStatus): string {
  return ASSESSMENT_STATUS_LABELS[status];
}

const DISPLAY_LABEL_TO_STATUS: Map<string, AssessmentStatus> = (() => {
  const m = new Map<string, AssessmentStatus>();
  for (const status of Object.keys(ASSESSMENT_STATUS_LABELS) as AssessmentStatus[]) {
    const label = ASSESSMENT_STATUS_LABELS[status];
    m.set(label, status);
  }
  return m;
})();

/** Resolves a visible label from the dropdown/chip back to the canonical status. */
export function assessmentStatusFromDisplayLabel(label: string): AssessmentStatus | undefined {
  return DISPLAY_LABEL_TO_STATUS.get(label);
}
