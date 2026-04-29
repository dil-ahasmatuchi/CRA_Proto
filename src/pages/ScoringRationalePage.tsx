import { useCallback, useMemo, useState } from "react";
import { OverflowBreadcrumbs } from "@diligentcorp/atlas-react-bundle";
import { Alert, AlertTitle, Box, Container, Stack, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NavLink, useLocation, useNavigate, useParams } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import ScoringRationaleHeader from "../components/ScoringRationaleHeader.js";
import {
  type ScenarioHistoryEntry,
  ScenarioHistorySection,
} from "../components/ScenarioHistorySection.js";
import { buildScenarioHistorySnapshot } from "../components/ScenarioHistoryReadOnlyPanel.js";
import ScenarioScoringDropdownsBlock from "../components/ScenarioScoringDropdownsBlock.js";
import type { ScenarioScoringInitialScores } from "../components/ScenarioScoringDropdownsBlock.js";
import {
  cyberRiskFromProduct,
  likelihoodFromProduct,
  numericOf,
  SCORE_OPTIONS,
} from "../components/ScoringMetricField.js";
import {
  NEW_CRA_SCORING_TAB_INDEX,
  type CraScenarioDetailLocationState,
} from "./craNewAssessmentDraftStorage.js";
import {
  getCyberRiskScoreLabel,
  getFivePointLabel,
  getLikelihoodLabel,
  type FivePointScaleValue,
} from "../data/types.js";
import { getScenarioById, patchScenario } from "../data/scenarios.js";
import { users } from "../data/users.js";

const NEW_CRA_PATH = "/cyber-risk/cyber-risk-assessments/new";

/** Prototype “current user” for save / scoring-override history rows. */
const SCENARIO_HISTORY_CURRENT_USER_NAME = users[0]!.fullName;
/** Example names for seeded baseline history entries. */
const SCENARIO_HISTORY_BASELINE_LATEST_OWNER = users[1]!.fullName;
const SCENARIO_HISTORY_BASELINE_PRIOR_OWNER = users[2]!.fullName;
const ASSESSMENTS_PATH = "/cyber-risk/cyber-risk-assessments";

export default function ScoringRationalePage() {
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = location.state as CraScenarioDetailLocationState | null;
  const assessmentNameFromNav = nav?.assessmentName;

  const scenario = scenarioId ? getScenarioById(scenarioId) : undefined;
  const assessmentTitle = (assessmentNameFromNav ?? "").trim() || "New cyber risk assessment";

  const initialScores = useMemo((): ScenarioScoringInitialScores => {
    if (!scenario) {
      return {
        impact: null,
        threat: null,
        vulnerability: null,
        likelihood: null,
        cyberRiskScore: null,
      };
    }
    return {
      impact: SCORE_OPTIONS[scenario.impact - 1] ?? null,
      threat: SCORE_OPTIONS[scenario.threatSeverity - 1] ?? null,
      vulnerability: SCORE_OPTIONS[scenario.vulnerabilitySeverity - 1] ?? null,
      likelihood: likelihoodFromProduct(scenario.likelihood),
      cyberRiskScore: cyberRiskFromProduct(scenario.cyberRiskScore),
    };
  }, [scenario]);

  const [scoringRationale, setScoringRationale] = useState(scenario?.scoringRationale ?? "");

  const [preEditHistoryEntries, setPreEditHistoryEntries] = useState<ScenarioHistoryEntry[]>([]);
  const [expandedHistoryEntryId, setExpandedHistoryEntryId] = useState<string | false>(false);
  const [liveScores, setLiveScores] = useState<ScenarioScoringInitialScores | null>(null);

  const appendScoringRationaleLine = useCallback(
    (line: string, context: { previousScores: ScenarioScoringInitialScores }) => {
      if (!scenario) return;
      const id = `score-edit-${
        globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      }`;
      const snapshotBeforeEdit = buildScenarioHistorySnapshot(scenario, context.previousScores, {
        rationaleBody: scoringRationale,
      });
      setPreEditHistoryEntries((prev) => [
        {
          id,
          owner: SCENARIO_HISTORY_CURRENT_USER_NAME,
          at: new Date(),
          snapshot: snapshotBeforeEdit,
        },
        ...prev,
      ]);
      setScoringRationale((prev) => (prev.trim() ? `${line}\n\n${prev.trim()}` : line));
    },
    [scenario, scoringRationale],
  );

  const baselineHistoryEntries = useMemo((): ScenarioHistoryEntry[] => {
    if (!scenario) return [];
    const latest = buildScenarioHistorySnapshot(scenario, initialScores);
    const prior = buildScenarioHistorySnapshot(scenario, initialScores, {
      rationaleBody: scenario.scoringRationale.split(/\n\n/).slice(0, 3).join("\n\n"),
    });
    return [
      {
        id: "latest",
        owner: SCENARIO_HISTORY_BASELINE_LATEST_OWNER,
        at: new Date("2026-04-23T15:30:30"),
        snapshot: latest,
      },
      {
        id: "prior",
        owner: SCENARIO_HISTORY_BASELINE_PRIOR_OWNER,
        at: new Date("2026-04-22T10:00:00"),
        snapshot: prior,
      },
    ];
  }, [scenario, initialScores]);

  const historyEntries = useMemo(
    (): ScenarioHistoryEntry[] => [...preEditHistoryEntries, ...baselineHistoryEntries],
    [preEditHistoryEntries, baselineHistoryEntries],
  );

  /** Matches Details tab inherent/residual choice (via scoring tab navigation state). */
  const scenarioScoresBlockTitle =
    nav?.scoringType === "inherent" ? "Inherent scores" : "Residual scores";

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

  const goBackToScoring = useCallback(() => {
    const returnPath = nav?.returnToAssessmentPath?.trim() || NEW_CRA_PATH;
    const tabIndex = nav?.craReturnToTabIndex ?? NEW_CRA_SCORING_TAB_INDEX;
    navigate(returnPath, { state: { craReturnToTabIndex: tabIndex } });
  }, [navigate, nav?.returnToAssessmentPath, nav?.craReturnToTabIndex]);

  const handleSave = useCallback(() => {
    if (!scenario) return;
    const scores = liveScores ?? initialScores;
    const id = `save-${
      globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    }`;
    const snapshot = buildScenarioHistorySnapshot(scenario, scores, {
      rationaleBody: scoringRationale,
    });
    setPreEditHistoryEntries((prev) => [
      {
        id,
        owner: SCENARIO_HISTORY_CURRENT_USER_NAME,
        at: new Date(),
        snapshot,
      },
      ...prev,
    ]);

    const impact = (scores.impact ? numericOf(scores.impact) : scenario.impact) as FivePointScaleValue;
    const threatSeverity = (scores.threat ? numericOf(scores.threat) : scenario.threatSeverity) as FivePointScaleValue;
    const vulnerabilitySeverity = (scores.vulnerability
      ? numericOf(scores.vulnerability)
      : scenario.vulnerabilitySeverity) as FivePointScaleValue;
    const likelihood = threatSeverity * vulnerabilitySeverity;
    const cyberRiskScore = impact * likelihood;
    patchScenario(scenario.id, {
      impact,
      impactLabel: getFivePointLabel(impact),
      threatSeverity,
      threatSeverityLabel: getFivePointLabel(threatSeverity),
      vulnerabilitySeverity,
      vulnerabilitySeverityLabel: getFivePointLabel(vulnerabilitySeverity),
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(cyberRiskScore),
      scoringRationale: scoringRationale.trim(),
    });
  }, [scenario, liveScores, initialScores, scoringRationale]);

  const scoringBlocks = scenario ? (
    <ScenarioScoringDropdownsBlock
      key={scenario.id}
      title={scenarioScoresBlockTitle}
      showBlockTitle
      initialScores={initialScores}
      onAppendScoringRationale={appendScoringRationaleLine}
      onScoresChange={setLiveScores}
    />
  ) : null;

  if (!scenario) {
    return (
      <Container sx={{ py: 2 }}>
        <Stack gap={0}>
          <ScoringRationaleHeader
            scenarioName="Scenario not found"
            scenarioId={scenarioId}
            breadcrumbs={breadcrumbs}
            onBack={goBackToScoring}
            backButtonAriaLabel="Back"
          />
          <Typography variant="body1" sx={{ py: 4 }}>
            We could not find that scenario. Use the back control to return to scoring.
          </Typography>
        </Stack>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={0}>
        <ScoringRationaleHeader
          scenarioName={scenario.name.trim() || scenario.id}
          scenarioId={scenario.id}
          breadcrumbs={breadcrumbs}
          onBack={goBackToScoring}
          backButtonAriaLabel="Back to scoring"
          onSave={handleSave}
        />

        <Stack gap={3} sx={{ pt: 3, pb: 6, width: "100%", maxWidth: "none" }}>
          <Alert
            severity="info"
            icon={<AiSparkleIcon />}
            aria-live="off"
            role={undefined}
            sx={{
              backgroundColor: "var(--lens-component-avatar-purple-background-color)",
              color: "var(--lens-component-accordion-active-color)",
              py: 2,
            }}
          >
            <Box sx={visuallyHidden}>AI</Box>
            <AlertTitle>Generated by Diligent Scoring AI</AlertTitle>
            The scoring and the rationale for this scenario were generated by the Diligent Scoring AI agent. Review the results and adjust as needed.
          </Alert>

          {scoringBlocks}

          <AssessmentWysiwygEditor
            fieldId="cra-scenario-scoring-rationale"
            label="Scoring rationale"
            value={scoringRationale}
            onChange={setScoringRationale}
            minRows={16}
            semiboldLabelPrefixes
            aria-label="Scoring rationale for this scenario"
          />

          <ScenarioHistorySection
            scenarioId={scenario.id}
            entries={historyEntries}
            expandedEntryId={expandedHistoryEntryId}
            onExpandedEntryChange={setExpandedHistoryEntryId}
          />
        </Stack>
      </Stack>
    </Container>
  );
}
