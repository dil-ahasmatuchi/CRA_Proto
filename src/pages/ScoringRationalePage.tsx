import { useCallback, useMemo, useState } from "react";
import { OverflowBreadcrumbs, SectionHeader } from "@diligentcorp/atlas-react-bundle";
import { Alert, AlertTitle, Box, Container, Stack, Typography } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { NavLink, useLocation, useNavigate, useParams } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";
import HistoryAccordion, {
  formatHistoryLogDateTime,
} from "../components/HistoryAccordion.js";
import ScoringRationaleHeader from "../components/ScoringRationaleHeader.js";
import ScenarioHistoryReadOnlyPanel, {
  buildScenarioHistorySnapshot,
  type ScenarioHistoryReadOnlySnapshot,
} from "../components/ScenarioHistoryReadOnlyPanel.js";
import ScenarioScoringDropdownsBlock from "../components/ScenarioScoringDropdownsBlock.js";
import type { ScenarioScoringInitialScores } from "../components/ScenarioScoringDropdownsBlock.js";
import {
  cyberRiskFromProduct,
  likelihoodFromProduct,
  SCORE_OPTIONS,
} from "../components/ScoringMetricField.js";
import type { CraScenarioDetailLocationState } from "./craNewAssessmentDraftStorage.js";
import { getScenarioById } from "../data/scenarios.js";
import { users } from "../data/users.js";

const NEW_CRA_PATH = "/cyber-risk/cyber-risk-assessments/new";

/** Prototype “current user” for save / scoring-override history rows. */
const SCENARIO_HISTORY_CURRENT_USER_NAME = users[0]!.fullName;
/** Example names for seeded baseline history entries. */
const SCENARIO_HISTORY_BASELINE_LATEST_OWNER = users[1]!.fullName;
const SCENARIO_HISTORY_BASELINE_PRIOR_OWNER = users[2]!.fullName;
const ASSESSMENTS_PATH = "/cyber-risk/cyber-risk-assessments";

type ScenarioHistoryEntry = {
  id: string;
  owner: string;
  at: Date;
  snapshot: ScenarioHistoryReadOnlySnapshot;
};

function ScenarioHistorySection({
  scenarioId,
  entries,
  expandedEntryId,
  onExpandedEntryChange,
}: {
  scenarioId: string;
  entries: ScenarioHistoryEntry[];
  expandedEntryId: string | false;
  onExpandedEntryChange: (id: string | false) => void;
}) {
  return (
    <Stack sx={{ width: "100%" }} gap={2}>
      <SectionHeader title="History" headingLevel="h3" />
      <Stack gap={0} sx={{ width: "100%" }}>
        {entries.map((entry) => {
          const panelId = `${scenarioId}-history-${entry.id}`;
          const expanded = expandedEntryId === entry.id;
          return (
            <HistoryAccordion
              key={entry.id}
              panelId={panelId}
              title={entry.owner}
              subtitle={formatHistoryLogDateTime(entry.at)}
              expanded={expanded}
              onExpandedChange={(next) => onExpandedEntryChange(next ? entry.id : false)}
            >
              <ScenarioHistoryReadOnlyPanel snapshot={entry.snapshot} />
            </HistoryAccordion>
          );
        })}
      </Stack>
    </Stack>
  );
}

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
    navigate(returnPath, { state: { craReturnToScoring: true } });
  }, [navigate, nav?.returnToAssessmentPath]);

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
  }, [scenario, liveScores, initialScores, scoringRationale]);

  const scoringBlocks = scenario ? (
    <ScenarioScoringDropdownsBlock
      key={scenario.id}
      title="Scoring rationale"
      showBlockTitle={false}
      initialScores={initialScores}
      onAppendScoringRationale={appendScoringRationaleLine}
      onScoresChange={setLiveScores}
    />
  ) : null;

  if (!scenario) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Stack gap={0}>
          <ScoringRationaleHeader
            pageTitle="Scenario not found"
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
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <ScoringRationaleHeader
          pageTitle="Scoring rationales"
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

          <SectionHeader
            title={scenario.id}
            subtitle={scenario.name}
            headingLevel="h2"
          />

          {scoringBlocks}

          <AssessmentWysiwygEditor
            fieldId="cra-scenario-scoring-rationale"
            label="Scoring rationale"
            value={scoringRationale}
            onChange={setScoringRationale}
            minRows={16}
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
