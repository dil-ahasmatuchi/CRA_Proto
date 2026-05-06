import { useEffect, useState } from "react";

export type ApiScenario = {
  id: string;
  displayId: string;
  assessmentId: string;
  name: string;
  assetId: string;
  assetName: string;
  assetType: string;
  cyberRiskId: string;
  cyberRiskName: string;
  threatId: string;
  threatName: string;
  vulnerabilityId: string | null;
  vulnerabilityName: string | null;
  impact: number;
  impactLabel: string;
  threatSeverity: number | null;
  threatSeverityLabel: string | null;
  vulnerabilitySeverity: number | null;
  vulnerabilitySeverityLabel: string | null;
  likelihood: number | null;
  likelihoodLabel: string | null;
  cyberRiskScore: number | null;
  cyberRiskScoreLabel: string | null;
  scoringRationale: string | null;
  status: string;
  isNotApplicable: boolean;
  isExcluded: boolean;
  createdAt: string;
  updatedAt: string;
  scoredAt: string | null;
  scoredBy: string | null;
};

type UseScenarioResult =
  | { status: "loading"; data: null; error: null; refetch: () => void }
  | { status: "error"; data: null; error: string; refetch: () => void }
  | { status: "ok"; data: ApiScenario; error: null; refetch: () => void };

export function useScenario(scenarioId: string | undefined): UseScenarioResult {
  const [result, setResult] = useState<UseScenarioResult>({
    status: "loading",
    data: null,
    error: null,
    refetch: () => {},
  });

  useEffect(() => {
    if (!scenarioId) {
      setResult({
        status: "error",
        data: null,
        error: "No scenario ID provided",
        refetch: () => {},
      });
      return;
    }

    let cancelled = false;

    const fetchScenario = async () => {
      try {
        setResult((prev) => ({ ...prev, status: "loading" }));

        const response = await fetch(`/api/scenarios/${scenarioId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch scenario: ${response.statusText}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setResult({
            status: "ok",
            data,
            error: null,
            refetch: fetchScenario,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            status: "error",
            data: null,
            error: error instanceof Error ? error.message : "Unknown error",
            refetch: fetchScenario,
          });
        }
      }
    };

    fetchScenario();

    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  return result;
}
