import { useEffect, useRef, useState } from "react";

/** Shape returned by GET /api/cyber-risk-assessments/:id/scenarios */
export type ApiAssessmentScenario = {
  id: string;
  displayId: string;
  name: string;
  assetId: string | null;
  assetName: string | null;
  assetCriticality?: number | null;
  assetCriticalityLabel?: string | null;
  cyberRiskId: string;
  cyberRiskName: string | null;
  threatId: string | null;
  impact: number | null;
  impactLabel: string | null;
  threatSeverity: number | null;
  threatSeverityLabel: string | null;
  vulnerabilitySeverity: number | null;
  vulnerabilitySeverityLabel: string | null;
  likelihood: number | null;
  likelihoodLabel: string | null;
  cyberRiskScore: number | null;
  cyberRiskScoreLabel: string | null;
  isNotApplicable: boolean;
  isExcluded: boolean;
};

export type ApiScenariosState =
  | { status: "idle"; refetch: () => void }
  | { status: "loading"; refetch: () => void }
  | { status: "generating"; refetch: () => void }
  | { status: "ok"; data: ApiAssessmentScenario[]; refetch: () => void }
  | { status: "error"; error: string; refetch: () => void };

/**
 * Fetches scenarios for a saved assessment from the API.
 * When no scenarios exist yet but assets are in scope, auto-generates them via POST.
 */
export function useAssessmentScenarios(
  dbDisplayId: string | null | undefined,
  hasAssets: boolean,
): ApiScenariosState {
  const [state, setState] = useState<ApiScenariosState>({
    status: "idle",
    refetch: () => {},
  });
  const cancelRef = useRef(false);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (!dbDisplayId) {
      setState({ status: "idle", refetch });
      return;
    }

    cancelRef.current = false;
    setState({ status: "loading", refetch });

    void (async () => {
      try {
        const res = await fetch(`/api/cyber-risk-assessments/${dbDisplayId}/scenarios`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiAssessmentScenario[] = await res.json();

        if (cancelRef.current) return;

        if (data.length === 0 && hasAssets) {
          setState({ status: "generating", refetch });
          const genRes = await fetch(`/api/cyber-risk-assessments/${dbDisplayId}/scenarios`, {
            method: "POST",
          });
          if (!genRes.ok) throw new Error(`Generate HTTP ${genRes.status}`);

          const refetchRes = await fetch(`/api/cyber-risk-assessments/${dbDisplayId}/scenarios`);
          if (!refetchRes.ok) throw new Error(`HTTP ${refetchRes.status}`);
          const generated: ApiAssessmentScenario[] = await refetchRes.json();

          if (!cancelRef.current) setState({ status: "ok", data: generated, refetch });
        } else {
          if (!cancelRef.current) setState({ status: "ok", data, refetch });
        }
      } catch (e) {
        if (!cancelRef.current) setState({ status: "error", error: String(e), refetch });
      }
    })();

    return () => {
      cancelRef.current = true;
    };
  }, [dbDisplayId, hasAssets, refetchTrigger]);

  return state;
}
