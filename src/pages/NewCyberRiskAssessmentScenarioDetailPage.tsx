import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NavLink, useLocation, useNavigate, useParams } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import { getScenarioById } from "../data/scenarios.js";
import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";


const NEW_CRA_PATH = "/cyber-risk/cyber-risk-assessments/new";
const ASSESSMENTS_PATH = "/cyber-risk/cyber-risk-assessments";

type ScoreValue = {
  numeric: string;
  label: string;
  rag: RagDataVizKey;
} | null;

const SCORE_OPTIONS: NonNullable<ScoreValue>[] = [
  { numeric: "1", label: "Very low", rag: "pos05" },
  { numeric: "2", label: "Low", rag: "pos04" },
  { numeric: "3", label: "Medium", rag: "neu03" },
  { numeric: "4", label: "High", rag: "neg03" },
  { numeric: "5", label: "Very high", rag: "neg05" },
];

const LIKELIHOOD_OPTIONS: NonNullable<ScoreValue>[] = [
  { numeric: "1–5", label: "Very low", rag: "pos05" },
  { numeric: "6–10", label: "Low", rag: "pos04" },
  { numeric: "11–15", label: "Medium", rag: "neu03" },
  { numeric: "16–20", label: "High", rag: "neg03" },
  { numeric: "21–25", label: "Very high", rag: "neg05" },
];

const CYBER_RISK_SCORE_OPTIONS: NonNullable<ScoreValue>[] = [
  { numeric: "1–25", label: "Very low", rag: "pos05" },
  { numeric: "26–50", label: "Low", rag: "pos04" },
  { numeric: "51–75", label: "Medium", rag: "neu03" },
  { numeric: "76–100", label: "High", rag: "neg03" },
  { numeric: "101–125", label: "Very high", rag: "neg05" },
];

function likelihoodFromProduct(product: number): NonNullable<ScoreValue> {
  if (product <= 5) return LIKELIHOOD_OPTIONS[0];
  if (product <= 10) return LIKELIHOOD_OPTIONS[1];
  if (product <= 15) return LIKELIHOOD_OPTIONS[2];
  if (product <= 20) return LIKELIHOOD_OPTIONS[3];
  return LIKELIHOOD_OPTIONS[4];
}

function cyberRiskFromProduct(product: number): NonNullable<ScoreValue> {
  if (product <= 25) return CYBER_RISK_SCORE_OPTIONS[0];
  if (product <= 50) return CYBER_RISK_SCORE_OPTIONS[1];
  if (product <= 75) return CYBER_RISK_SCORE_OPTIONS[2];
  if (product <= 100) return CYBER_RISK_SCORE_OPTIONS[3];
  return CYBER_RISK_SCORE_OPTIONS[4];
}

function numericOf(v: ScoreValue): number {
  if (!v) return 0;
  const n = Number(v.numeric);
  return Number.isFinite(n) ? n : 0;
}

function rangeUpperBound(v: ScoreValue): number {
  if (!v) return 0;
  const dashIdx = v.numeric.indexOf("–");
  if (dashIdx >= 0) {
    const n = Number(v.numeric.slice(dashIdx + 1));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v.numeric);
  return Number.isFinite(n) ? n : 0;
}

function RagSwatch({ rag }: { rag: RagDataVizKey }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        width: 16,
        height: 16,
        borderRadius: t.semantic.radius.sm.value,
        flexShrink: 0,
        bgcolor: ragDataVizColor(t, rag),
      })}
      aria-hidden
    />
  );
}

function ScoringMetricField({
  label,
  value,
  onChange,
  options = SCORE_OPTIONS,
}: {
  label: string;
  value: ScoreValue;
  onChange: (next: ScoreValue) => void;
  options?: NonNullable<ScoreValue>[];
}) {
  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const selected = options.find((o) => o.numeric === e.target.value) ?? null;
      onChange(selected);
    },
    [onChange, options],
  );

  return (
    <Stack gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        component="p"
        sx={({ tokens: t }) => ({
          m: 0,
          fontWeight: 600,
          letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
          fontSize: t.semantic.font.label.sm.fontSize.value,
          lineHeight: t.semantic.font.label.sm.lineHeight.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        {label}
      </Typography>
      <FormControl fullWidth>
        <Select
          displayEmpty
          value={value?.numeric ?? ""}
          onChange={handleChange}
          inputProps={{ "aria-label": label }}
          renderValue={(selected) => {
            const opt = options.find((o) => o.numeric === selected);
            if (!opt) {
              return (
                <Typography
                  component="span"
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.muted.value,
                    fontSize: t.semantic.font.text.md.fontSize.value,
                  })}
                >
                  Not scored
                </Typography>
              );
            }
            return (
              <Stack direction="row" alignItems="center" gap={1}>
                <RagSwatch rag={opt.rag} />
                <span>
                  {opt.numeric} {opt.label}
                </span>
              </Stack>
            );
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.numeric} value={opt.numeric}>
              <Stack direction="row" alignItems="center" gap={1}>
                <RagSwatch rag={opt.rag} />
                <span>
                  {opt.numeric} {opt.label}
                </span>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}

type PendingOverride = {
  field: "impact" | "threat" | "vulnerability" | "likelihood" | "cyberRiskScore";
  fieldLabel: string;
  /** Formula-derived vs prior selection on this page */
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
        <IconButton
          aria-label="Close"
          onClick={onDiscard}
          color="inherit"
          size="small"
        >
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

export default function NewCyberRiskAssessmentScenarioDetailPage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const assessmentNameFromNav = (location.state as { assessmentName?: string } | null)
    ?.assessmentName;

  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const assessmentTitle = (assessmentNameFromNav ?? "").trim() || "New cyber risk assessment";

  const initialScores = useMemo(() => {
    if (!scenario) return { impact: null, threat: null, vulnerability: null, likelihood: null, cyberRiskScore: null } as Record<string, ScoreValue>;
    return {
      impact: SCORE_OPTIONS[scenario.impact - 1] ?? null,
      threat: SCORE_OPTIONS[scenario.threatSeverity - 1] ?? null,
      vulnerability: SCORE_OPTIONS[scenario.vulnerabilitySeverity - 1] ?? null,
      likelihood: likelihoodFromProduct(scenario.likelihood),
      cyberRiskScore: cyberRiskFromProduct(scenario.cyberRiskScore),
    };
  }, [scenario]);

  const [impact, setImpact] = useState<ScoreValue>(initialScores.impact);
  const [threat, setThreat] = useState<ScoreValue>(initialScores.threat);
  const [vulnerability, setVulnerability] = useState<ScoreValue>(initialScores.vulnerability);
  const [likelihood, setLikelihood] = useState<ScoreValue>(initialScores.likelihood);
  const [cyberRiskScore, setCyberRiskScore] = useState<ScoreValue>(initialScores.cyberRiskScore);

  const [scoringRationale, setScoringRationale] = useState(scenario?.scoringRationale ?? "");
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
    },
    [calculatedCyberRisk],
  );

  const handleOverrideConfirm = useCallback(
    (rationale: string) => {
      if (!pendingOverride) return;
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
      setScoringRationale((prev) => {
        const update = `Update: ${rationale}`;
        return prev.trim() ? `${update}\n\n${prev.trim()}` : update;
      });
      setPendingOverride(null);
    },
    [pendingOverride],
  );

  const handleOverrideDiscard = useCallback(() => {
    setPendingOverride(null);
  }, []);

  const breadcrumbs = useMemo(
    () => (
      <OverflowBreadcrumbs
        leadingElement={<span>Asset manager</span>}
        hideLastItem
        items={[
          { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_PATH },
          { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_PATH },
          { id: "assessment", label: assessmentTitle, url: NEW_CRA_PATH },
        ]}
        aria-label="Breadcrumbs"
      >
        {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
      </OverflowBreadcrumbs>
    ),
    [assessmentTitle],
  );

  if (!scenario) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Stack gap={0}>
          <PageHeader
            pageTitle="Scenario not found"
            breadcrumbs={breadcrumbs}
            slotProps={{
              backButton: {
                "aria-label": "Back",
                onClick: () =>
                  navigate(NEW_CRA_PATH, { state: { craReturnToScoring: true } }),
              },
            }}
          />
          <Typography variant="body1" sx={{ py: 4 }}>
            We could not find that scenario. Use the back control to return to scoring.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <PageHeader
          pageTitle="Scoring rationales"
          breadcrumbs={breadcrumbs}
          slotProps={{
            backButton: {
              "aria-label": "Back to scoring",
              onClick: () =>
                navigate(NEW_CRA_PATH, { state: { craReturnToScoring: true } }),
            },
          }}
        />

        <Stack gap={3} sx={{ pt: 3, pb: 6, width: "100%", maxWidth: "none" }}>
          <Alert
            severity="info"
            icon={<AiSparkleIcon />}
            aria-live="off"
            role={undefined}
            sx={{
              backgroundColor: 'var(--lens-component-avatar-purple-background-color)',
              color: 'var(--lens-component-accordion-active-color)',
              py: 2,
            }}
          >
            <Box sx={visuallyHidden}>AI</Box>
            <AlertTitle>Generated by Diligent Scoring AI</AlertTitle>
            The scoring and the rationale for this scenario were generated by the Diligent Scoring AI agent. Review the results and adjust as needed.
          </Alert>

          <Typography
            component="h2"
            variant="h5"
            sx={({ tokens: t }) => ({
              m: 0,
              fontWeight: 600,
              color: t.semantic.color.type.default.value,
            })}
          >
            {scenario.id}
          </Typography>

          <Typography
            sx={({ tokens: t }) => ({
              m: 0,
              fontSize: t.semantic.font.text.md.fontSize.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            {scenario.name}
          </Typography>

          <Box
            sx={({ tokens: t }) => ({
              p: 3,
              borderRadius: t.semantic.radius.lg.value,
              bgcolor: t.semantic.color.surface.variant.value,
              border: "none",
              borderImage: "none",
            })}
          >
            <Stack direction="row" gap={2}>
              <ScoringMetricField
                label="Asset criticality"
                value={impact}
                onChange={handleImpactChange}
              />
              <ScoringMetricField
                label="Threat severity"
                value={threat}
                onChange={handleThreatChange}
              />
              <ScoringMetricField
                label="Vulnerability severity"
                value={vulnerability}
                onChange={handleVulnerabilityChange}
              />
              <ScoringMetricField
                label="Likelihood"
                value={likelihood}
                onChange={handleLikelihoodChange}
                options={LIKELIHOOD_OPTIONS}
              />
              <ScoringMetricField
                label="Cyber risk score"
                value={cyberRiskScore}
                onChange={handleCyberRiskChange}
                options={CYBER_RISK_SCORE_OPTIONS}
              />
            </Stack>
          </Box>

          <AssessmentWysiwygEditor
            fieldId="cra-scenario-scoring-rationale"
            label="Scoring rationale"
            value={scoringRationale}
            onChange={setScoringRationale}
            minRows={16}
            aria-label="Scoring rationale for this scenario"
          />
        </Stack>
      </Stack>

      <OverrideRationaleDialog
        pending={pendingOverride}
        onConfirm={handleOverrideConfirm}
        onDiscard={handleOverrideDiscard}
      />
    </Container>
  );
}
