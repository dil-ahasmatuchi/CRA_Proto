/**
 * React Hook for Scoring Agent Integration
 *
 * Provides interface for triggering AI scoring from React components.
 */

import { useState, useCallback, useRef } from "react";
import type {
  BatchScoringInput,
  BatchScoringOutput,
  ScoringInput,
} from "../services/scoringAgent.js";
import { mockScoringAgent } from "../services/mockScoringAgent.js";
import { getScenarioById, patchScenario } from "../data/scenarios.js";
import { getAssetById } from "../data/assets.js";
import { getThreatById } from "../data/threats.js";
import { getVulnerabilityById } from "../data/vulnerabilities.js";
import { controls } from "../data/controls.js";
import { orgUnits } from "../data/orgUnits.js";
import { notifyCatalogChange } from "../data/persistence/catalogStore.js";

export type ScoringPhase = "idle" | "processing" | "complete" | "error";

export interface UseScoringAgentReturn {
  /** Current phase of scoring */
  phase: ScoringPhase;

  /** Progress information during scoring */
  progress: {
    current: number;
    total: number;
    percentage: number;
  };

  /** Results from last scoring run */
  results: BatchScoringOutput | null;

  /** Error message if scoring failed */
  error: string | null;

  /** Start scoring for all scenarios in assessment */
  startScoring: (scenarioIds: string[], assessmentId: string, assessmentName?: string) => Promise<void>;

  /** Reset state to idle */
  reset: () => void;
}

export function useScoringAgent(): UseScoringAgentReturn {
  const [phase, setPhase] = useState<ScoringPhase>("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0, percentage: 0 });
  const [results, setResults] = useState<BatchScoringOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const startScoring = useCallback(
    async (scenarioIds: string[], assessmentId: string, assessmentName?: string) => {
      // Reset state
      abortRef.current = false;
      setPhase("processing");
      setError(null);
      setProgress({ current: 0, total: scenarioIds.length, percentage: 0 });
      setResults(null);

      try {
        // Build scoring inputs from scenario IDs
        const scoringInputs: ScoringInput[] = [];

        for (const scenarioId of scenarioIds) {
          const scenario = getScenarioById(scenarioId);
          if (!scenario) {
            console.warn(`Scenario ${scenarioId} not found, skipping`);
            continue;
          }

          const asset = getAssetById(scenario.assetId);
          const threat = getThreatById(scenario.threatIds[0]);
          const vulnerability = getVulnerabilityById(scenario.vulnerabilityIds[0]);

          if (!asset || !threat || !vulnerability) {
            console.warn(
              `Missing data for scenario ${scenarioId} (asset: ${!!asset}, threat: ${!!threat}, vuln: ${!!vulnerability}), skipping`
            );
            continue;
          }

          const orgUnit = orgUnits.find((ou) => ou.id === asset.orgUnitId) || {
            id: "default",
            name: "Unknown",
          };

          // Get controls for this asset
          const assetControls = controls.filter((c) => asset.controlIds.includes(c.id));

          const input: ScoringInput = {
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            cyberRiskId: scenario.cyberRiskId,
            cyberRiskName: scenario.cyberRiskId, // TODO: Get actual risk name
            isNotApplicable: false, // TODO: Check from assessment scope

            asset: {
              id: asset.id,
              name: asset.name,
              assetType: asset.assetType,
              criticality: asset.criticality,
              criticalityLabel: asset.criticalityLabel,
              orgUnitId: asset.orgUnitId,
              status: asset.status,
              controlIds: asset.controlIds,
            },

            threat: {
              id: threat.id,
              displayId: threat.displayId,
              name: threat.name,
              domain: threat.domain,
              description: threat.description,
              sources: threat.sources,
              threatActors: threat.threatActors,
              attackVectors: threat.attackVectors,
              status: threat.status,
            },

            vulnerability: {
              id: vulnerability.id,
              displayId: vulnerability.displayId,
              name: vulnerability.name,
              description: vulnerability.description,
              domain: vulnerability.domain,
              vulnerabilityType: vulnerability.vulnerabilityType,
              primaryCIAImpact: vulnerability.primaryCIAImpact,
              status: vulnerability.status,
            },

            controls: assetControls.map((c) => ({
              id: c.id,
              name: c.name,
              controlType: c.controlType,
              effectiveness: c.effectiveness,
              effectivenessLabel: c.effectivenessLabel,
              keyControl: c.keyControl,
              controlFrequency: c.controlFrequency,
              status: c.status,
            })),

            orgUnit,
          };

          scoringInputs.push(input);
        }

        if (scoringInputs.length === 0) {
          throw new Error("No valid scenarios to score");
        }

        // Create batch input
        const batchInput: BatchScoringInput = {
          assessmentId,
          assessmentName,
          scenarios: scoringInputs,
        };

        // Score batch (this will take a few seconds)
        const batchOutput = await mockScoringAgent.scoreBatch(batchInput);

        if (abortRef.current) {
          setPhase("idle");
          return;
        }

        // Apply scores to scenarios
        for (const result of batchOutput.results) {
          if (result.skipped || result.threatSeverity === null || result.vulnerabilitySeverity === null) {
            continue;
          }

          // Persist scores to scenario
          patchScenario(result.scenarioId, {
            threatSeverity: result.threatSeverity,
            threatSeverityLabel: result.threatSeverityLabel!,
            vulnerabilitySeverity: result.vulnerabilitySeverity,
            vulnerabilitySeverityLabel: result.vulnerabilitySeverityLabel!,
            likelihood: result.calculatedLikelihood!,
            likelihoodLabel: result.calculatedLikelihoodLabel!,
            cyberRiskScore: result.calculatedCyberRiskScore!,
            cyberRiskScoreLabel: result.calculatedCyberRiskScoreLabel!,
            scoringRationale: result.combinedRationaleSummary,
          });
        }

        // Trigger catalog update to refresh UI
        notifyCatalogChange();

        setResults(batchOutput);
        setPhase("complete");
      } catch (err) {
        if (!abortRef.current) {
          setError(err instanceof Error ? err.message : String(err));
          setPhase("error");
        }
      }
    },
    []
  );

  const reset = useCallback(() => {
    abortRef.current = true;
    setPhase("idle");
    setProgress({ current: 0, total: 0, percentage: 0 });
    setResults(null);
    setError(null);
  }, []);

  return {
    phase,
    progress,
    results,
    error,
    startScoring,
    reset,
  };
}
