/**
 * Hook to fetch cyber risk assessments from API
 */

import { useEffect, useState } from "react";

export type AssessmentPhase =
  | "draft"
  | "scoping"
  | "inProgress"
  | "review"
  | "overdue"
  | "assessmentApproved";

export interface Assessment {
  id: string;
  displayId: string;
  name: string;
  assessmentType: string;
  phase: AssessmentPhase;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  ownerIds: string[];
  scoringType: "inherent" | "residual";
  aggregationMethod: "highest" | "average";
  aiScoringPhase: "idle" | "processing" | "complete";
  aiScoringCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  stats: {
    scenarios: number;
    scopedAssets: number;
    scenariosScored: number;
    scenariosNotApplicable: number;
  };
}

export type UseAssessmentsResult =
  | { status: "loading"; assessments: null }
  | { status: "error"; assessments: null; message: string }
  | { status: "ok"; assessments: Assessment[] };

/**
 * Fetches all cyber risk assessments from the API
 */
export function useAssessments(phase?: string): UseAssessmentsResult {
  const [result, setResult] = useState<UseAssessmentsResult>({
    status: "loading",
    assessments: null
  });

  useEffect(() => {
    let cancelled = false;

    const url = phase
      ? `/api/cyber-risk-assessments?phase=${phase}`
      : "/api/cyber-risk-assessments";

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<Assessment[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setResult({ status: "ok", assessments: data });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            status: "error",
            assessments: null,
            message: String(err)
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [phase]);

  return result;
}
