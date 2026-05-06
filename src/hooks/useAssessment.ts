/**
 * Hook to fetch a single cyber risk assessment from API
 */

import { useCallback, useEffect, useState } from "react";
import type { Assessment } from "./useAssessments.js";

export type UseAssessmentResult =
  | { status: "loading"; assessment: null; refetch: () => void }
  | { status: "error"; assessment: null; message: string; refetch: () => void }
  | { status: "ok"; assessment: Assessment; refetch: () => void };

/**
 * Fetches a single cyber risk assessment by display ID
 * @param displayId - The assessment display ID (e.g., "ASM-001")
 */
export function useAssessment(displayId: string | undefined): UseAssessmentResult {
  const [result, setResult] = useState<Omit<UseAssessmentResult, "refetch">>({
    status: "loading",
    assessment: null
  });
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!displayId) {
      setResult({
        status: "error",
        assessment: null,
        message: "No assessment ID provided"
      });
      return;
    }

    let cancelled = false;
    setResult({ status: "loading", assessment: null });

    fetch(`/api/cyber-risk-assessments/${displayId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(`Assessment ${displayId} not found`);
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json() as Promise<Assessment>;
      })
      .then((data) => {
        if (!cancelled) {
          setResult({ status: "ok", assessment: data });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error("Error fetching assessment:", err);
          setResult({
            status: "error",
            assessment: null,
            message: err instanceof Error ? err.message : String(err)
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [displayId, refetchTrigger]);

  return { ...result, refetch } as UseAssessmentResult;
}
