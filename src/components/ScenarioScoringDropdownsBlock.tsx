import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";

import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";

import ScoringRationaleDropdowns from "./ScoringRationaleDropdowns.js";
import {
  cyberRiskFromProduct,
  likelihoodFromProduct,
  numericOf,
  rangeUpperBound,
  type ScoreValue,
} from "./ScoringMetricField.js";
import { advanceCraPhaseToScoringIfEligible } from "../pages/craNewAssessmentDraftStorage.js";

export type ScenarioScoringInitialScores = {
  impact: ScoreValue;
  threat: ScoreValue;
  vulnerability: ScoreValue;
  likelihood: ScoreValue;
  cyberRiskScore: ScoreValue;
};

type PendingOverride = {
  field: "impact" | "threat" | "vulnerability" | "likelihood" | "cyberRiskScore";
  fieldLabel: string;
  baselineKind: "calculated" | "current";
  calculatedValue: NonNullable<ScoreValue>;
  newValue: NonNullable<ScoreValue>;
};

function OverrideRationaleDialog({
  pending,
  onConfirm,
  onDiscard,
}: {
  pending: PendingOverride | null;
  onConfirm: (rationale: string) => void;
  onDiscard: () => void;
}) {
  const [rationale, setRationale] = useState("");

  useEffect(() => {
    if (pending) setRationale("");
  }, [pending]);

  if (!pending) return null;

  return (
    <Dialog
      open
      onClose={onDiscard}
      aria-labelledby="override-dialog-title"
      aria-describedby="override-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle component="div">
        <h2 id="override-dialog-title">Override {pending.fieldLabel.toLowerCase()}</h2>
        <p id="override-dialog-description">
          {pending.baselineKind === "calculated" ? (
            <>
              The calculated value is{" "}
              <strong>
                {pending.calculatedValue.numeric} - {pending.calculatedValue.label}
              </strong>
            </>
          ) : (
            <>
              The current value is{" "}
              <strong>
                {pending.calculatedValue.numeric} - {pending.calculatedValue.label}
              </strong>
            </>
          )}
          . Provide a rationale for changing it to{" "}
          <strong>
            {pending.newValue.numeric} - {pending.newValue.label}
          </strong>
          .
        </p>
        <IconButton aria-label="Close" onClick={onDiscard} color="inherit" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          {pending.baselineKind === "calculated"
            ? "Explain why the manually selected score better reflects the assessment than the calculated value."
            : "Explain why the new score better reflects the assessment."}
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={4}
          label="Rationale"
          placeholder="Enter your rationale for this override..."
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onDiscard}>
          Discard
        </Button>
        <Button
          variant="contained"
          disabled={rationale.trim().length === 0}
          onClick={() => onConfirm(rationale.trim())}
        >
          Add rationale
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export type ScenarioScoringDropdownsBlockProps = {
  /** Block title (e.g. Inherent scores / Residual scores / Scoring rationale). */
  title: string;
  /** When false, the gray panel heading above the dropdowns is omitted. */
  showBlockTitle?: boolean;
  initialScores: ScenarioScoringInitialScores;
  /** Appends override rationale text into the shared scenario rationale field. `previousScores` is the metrics before applying the pending override. */
  onAppendScoringRationale: (
    appended: string,
    context: { previousScores: ScenarioScoringInitialScores },
  ) => void;
  /** Called whenever the five metric scores change (for parent save/history). */
  onScoresChange?: (scores: ScenarioScoringInitialScores) => void;
};

/**
 * One gray scoring panel with the five metric dropdowns, override dialog flow,
 * and calculated likelihood / cyber risk behavior from the scenario details page.
 */
export default function ScenarioScoringDropdownsBlock({
  title,
  showBlockTitle = true,
  initialScores,
  onAppendScoringRationale,
  onScoresChange,
}: ScenarioScoringDropdownsBlockProps) {
  const [impact, setImpact] = useState<ScoreValue>(initialScores.impact);
  const [threat, setThreat] = useState<ScoreValue>(initialScores.threat);
  const [vulnerability, setVulnerability] = useState<ScoreValue>(initialScores.vulnerability);
  const [likelihood, setLikelihood] = useState<ScoreValue>(initialScores.likelihood);
  const [cyberRiskScore, setCyberRiskScore] = useState<ScoreValue>(initialScores.cyberRiskScore);

  const [likelihoodOverridden, setLikelihoodOverridden] = useState(false);
  const [cyberRiskOverridden, setCyberRiskOverridden] = useState(false);
  const [pendingOverride, setPendingOverride] = useState<PendingOverride | null>(null);

  const calculatedLikelihood = useMemo(() => {
    const t = numericOf(threat);
    const v = numericOf(vulnerability);
    if (t === 0 || v === 0) return null;
    return likelihoodFromProduct(t * v);
  }, [threat, vulnerability]);

  const calculatedCyberRisk = useMemo(() => {
    const i = numericOf(impact);
    if (i === 0) return null;

    if (likelihoodOverridden && likelihood) {
      const l = rangeUpperBound(likelihood);
      if (l === 0) return null;
      return cyberRiskFromProduct(i * l);
    }

    const t = numericOf(threat);
    const v = numericOf(vulnerability);
    if (t === 0 || v === 0) return null;
    return cyberRiskFromProduct(i * t * v);
  }, [impact, threat, vulnerability, likelihood, likelihoodOverridden]);

  useEffect(() => {
    if (!likelihoodOverridden && calculatedLikelihood) {
      setLikelihood(calculatedLikelihood);
    }
  }, [calculatedLikelihood, likelihoodOverridden]);

  useEffect(() => {
    if (!cyberRiskOverridden && calculatedCyberRisk) {
      setCyberRiskScore(calculatedCyberRisk);
    }
  }, [calculatedCyberRisk, cyberRiskOverridden]);

  const handleImpactChange = useCallback(
    (next: ScoreValue) => {
      if (!next) {
        setImpact(null);
        return;
      }
      const from = impact;
      if (from && next.numeric !== from.numeric) {
        setPendingOverride({
          field: "impact",
          fieldLabel: "Asset criticality",
          baselineKind: "current",
          calculatedValue: from,
          newValue: next,
        });
        return;
      }
      setImpact(next);
      advanceCraPhaseToScoringIfEligible();
    },
    [impact],
  );

  const handleThreatChange = useCallback(
    (next: ScoreValue) => {
      if (!next) {
        setThreat(null);
        return;
      }
      const from = threat;
      if (from && next.numeric !== from.numeric) {
        setPendingOverride({
          field: "threat",
          fieldLabel: "Threat severity",
          baselineKind: "current",
          calculatedValue: from,
          newValue: next,
        });
        return;
      }
      setThreat(next);
      advanceCraPhaseToScoringIfEligible();
    },
    [threat],
  );

  const handleVulnerabilityChange = useCallback(
    (next: ScoreValue) => {
      if (!next) {
        setVulnerability(null);
        return;
      }
      const from = vulnerability;
      if (from && next.numeric !== from.numeric) {
        setPendingOverride({
          field: "vulnerability",
          fieldLabel: "Vulnerability severity",
          baselineKind: "current",
          calculatedValue: from,
          newValue: next,
        });
        return;
      }
      setVulnerability(next);
      advanceCraPhaseToScoringIfEligible();
    },
    [vulnerability],
  );

  const handleLikelihoodChange = useCallback(
    (next: ScoreValue) => {
      if (
        calculatedLikelihood &&
        next &&
        next.numeric !== calculatedLikelihood.numeric
      ) {
        setPendingOverride({
          field: "likelihood",
          fieldLabel: "Likelihood",
          baselineKind: "calculated",
          calculatedValue: calculatedLikelihood,
          newValue: next,
        });
        return;
      }
      setLikelihoodOverridden(false);
      setLikelihood(next);
      if (next) {
        advanceCraPhaseToScoringIfEligible();
      }
    },
    [calculatedLikelihood],
  );

  const handleCyberRiskChange = useCallback(
    (next: ScoreValue) => {
      if (
        calculatedCyberRisk &&
        next &&
        next.numeric !== calculatedCyberRisk.numeric
      ) {
        setPendingOverride({
          field: "cyberRiskScore",
          fieldLabel: "Cyber risk score",
          baselineKind: "calculated",
          calculatedValue: calculatedCyberRisk,
          newValue: next,
        });
        return;
      }
      setCyberRiskOverridden(false);
      setCyberRiskScore(next);
      if (next) {
        advanceCraPhaseToScoringIfEligible();
      }
    },
    [calculatedCyberRisk],
  );

  const handleOverrideConfirm = useCallback(
    (rationale: string) => {
      if (!pendingOverride) return;
      const previousScores: ScenarioScoringInitialScores = {
        impact,
        threat,
        vulnerability,
        likelihood,
        cyberRiskScore,
      };
      const { field, newValue } = pendingOverride;
      if (field === "impact") {
        setImpact(newValue);
      } else if (field === "threat") {
        setThreat(newValue);
      } else if (field === "vulnerability") {
        setVulnerability(newValue);
      } else if (field === "likelihood") {
        setLikelihood(newValue);
        setLikelihoodOverridden(true);
      } else {
        setCyberRiskScore(newValue);
        setCyberRiskOverridden(true);
      }
      const update = `Update: ${rationale}`;
      onAppendScoringRationale(update, { previousScores });
      setPendingOverride(null);
      advanceCraPhaseToScoringIfEligible();
    },
    [
      impact,
      threat,
      vulnerability,
      likelihood,
      cyberRiskScore,
      pendingOverride,
      onAppendScoringRationale,
    ],
  );

  const handleOverrideDiscard = useCallback(() => {
    setPendingOverride(null);
  }, []);

  useEffect(() => {
    if (!onScoresChange) return;
    onScoresChange({
      impact,
      threat,
      vulnerability,
      likelihood,
      cyberRiskScore,
    });
  }, [
    impact,
    threat,
    vulnerability,
    likelihood,
    cyberRiskScore,
    onScoresChange,
  ]);

  return (
    <>
      <ScoringRationaleDropdowns
        title={title}
        showTitle={showBlockTitle}
        controlled={{
          impact,
          threat,
          vulnerability,
          likelihood,
          cyberRiskScore,
          onImpactChange: handleImpactChange,
          onThreatChange: handleThreatChange,
          onVulnerabilityChange: handleVulnerabilityChange,
          onLikelihoodChange: handleLikelihoodChange,
          onCyberRiskScoreChange: handleCyberRiskChange,
        }}
      />
      <OverrideRationaleDialog
        pending={pendingOverride}
        onConfirm={handleOverrideConfirm}
        onDiscard={handleOverrideDiscard}
      />
    </>
  );
}
