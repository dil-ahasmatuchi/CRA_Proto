import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormControlLabel,
  IconButton,
  Link,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { useNavigate } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import AiContentCard, { AiContentCardAssessmentPreset } from "../components/AiContentCard.js";
import AssessmentScopeEmptyState from "../components/AssessmentScopeEmptyState.js";

import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";
import { fivePointLabelToRag, getLikelihoodLabel, getCyberRiskScoreLabel } from "../data/types.js";
import type { FivePointScaleLabel } from "../data/types.js";
import type { AiScoringPhase, CraScoringTypeChoice } from "./craNewAssessmentDraftStorage.js";
import { scopedCyberRisks, scopedScenarios } from "./scopeAssessmentRollup.js";

type ScoreValue = {
  numeric: string;
  label: string;
  rag: RagDataVizKey;
} | null;

type ScoringRow = {
  id: string;
  kind: "cyberRisk" | "scenario";
  /** Cyber risk group id scenarios belong to */
  groupId: string;
  tag: string;
  title: React.ReactNode;
  impact: ScoreValue;
  threat: ScoreValue;
  vulnerability: ScoreValue;
  likelihood: ScoreValue;
  cyberRiskScore: ScoreValue;
};

type AggregationMethod = "highest" | "average";

const SCENARIO_DETAIL_PATH = "/cyber-risk/cyber-risk-assessments/new/scenario";

/** Name column is fixed width (sticky first column). */
const SCORING_NAME_COL_WIDTH_PX = 400;

/** Actions column is fixed width (sticky last column). */
const SCORING_ACTIONS_COL_WIDTH_PX = 48;

const SCORING_THREAT_MIN_PX = 132;
const SCORING_VULNERABILITY_MIN_PX = 164;
const SCORING_LIKELIHOOD_MIN_PX = 110;
const SCORING_CYBER_RISK_SCORE_MIN_PX = 134;

/**
 * Metric columns use intrinsic width from cell content.
 * `width: 0.01%` is a common auto-table hint so extra horizontal space is not assigned here first.
 */
const scoringMetricThSx = {
  px: 2,
  width: "0.01%",
  maxWidth: "max-content",
  boxSizing: "border-box" as const,
  overflow: "visible",
  whiteSpace: "normal" as const,
  wordBreak: "break-word" as const,
  overflowWrap: "break-word" as const,
};

const scoringMetricTdSx = {
  px: 2,
  py: 0,
  width: "0.01%",
  maxWidth: "max-content",
  verticalAlign: "middle" as const,
  boxSizing: "border-box" as const,
  overflow: "visible",
  whiteSpace: "nowrap" as const,
};

const scoringThreatMetricThSx = { ...scoringMetricThSx, minWidth: SCORING_THREAT_MIN_PX };
const scoringThreatMetricTdSx = { ...scoringMetricTdSx, minWidth: SCORING_THREAT_MIN_PX };
const scoringVulnerabilityMetricThSx = { ...scoringMetricThSx, minWidth: SCORING_VULNERABILITY_MIN_PX };
const scoringVulnerabilityMetricTdSx = { ...scoringMetricTdSx, minWidth: SCORING_VULNERABILITY_MIN_PX };
const scoringLikelihoodMetricThSx = { ...scoringMetricThSx, minWidth: SCORING_LIKELIHOOD_MIN_PX };
const scoringLikelihoodMetricTdSx = { ...scoringMetricTdSx, minWidth: SCORING_LIKELIHOOD_MIN_PX };
const scoringCyberRiskScoreMetricThSx = { ...scoringMetricThSx, minWidth: SCORING_CYBER_RISK_SCORE_MIN_PX };
const scoringCyberRiskScoreMetricTdSx = { ...scoringMetricTdSx, minWidth: SCORING_CYBER_RISK_SCORE_MIN_PX };

const scoringNameHeadCellSx = ({ tokens: t }: Theme) => ({
  position: "sticky" as const,
  left: 0,
  zIndex: 3,
  width: SCORING_NAME_COL_WIDTH_PX,
  minWidth: SCORING_NAME_COL_WIDTH_PX,
  maxWidth: SCORING_NAME_COL_WIDTH_PX,
  boxSizing: "border-box" as const,
  bgcolor: t.semantic.color.background.container.value,
  whiteSpace: "normal" as const,
  wordBreak: "break-word" as const,
  overflowWrap: "break-word" as const,
  overflow: "visible" as const,
});

const scoringNameBodyCellSx = ({ tokens: t }: Theme) => ({
  position: "sticky" as const,
  left: 0,
  zIndex: 2,
  bgcolor: t.semantic.color.background.base.value,
  width: SCORING_NAME_COL_WIDTH_PX,
  minWidth: SCORING_NAME_COL_WIDTH_PX,
  maxWidth: SCORING_NAME_COL_WIDTH_PX,
  boxSizing: "border-box" as const,
  whiteSpace: "normal" as const,
  wordBreak: "break-word" as const,
  overflowWrap: "break-word" as const,
  overflow: "visible" as const,
});

function RiskLegendCell({ value }: { value: ScoreValue }) {
  return (
    <Box sx={{ minHeight: 56, display: "flex", alignItems: "center", py: 1 }}>
      {value == null ? (
        <Typography
          sx={({ tokens: t }) => ({
            fontSize: t.semantic.font.label.xs.fontSize.value,
            lineHeight: t.semantic.font.label.xs.lineHeight.value,
            letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
            fontFamily: t.semantic.font.label.xs.fontFamily.value,
            fontWeight: t.semantic.font.label.xs.fontWeight.value,
            color: t.semantic.color.type.muted.value,
          })}
        >
          -
        </Typography>
      ) : (
        <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
          <Box
            sx={({ tokens: t }) => ({
              width: 16,
              height: 16,
              borderRadius: t.semantic.radius.sm.value,
              flexShrink: 0,
              bgcolor: ragDataVizColor(t, value.rag),
            })}
          />
          <Typography
            component="span"
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.label.xs.fontSize.value,
              lineHeight: t.semantic.font.label.xs.lineHeight.value,
              letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
              fontFamily: t.semantic.font.label.xs.fontFamily.value,
              fontWeight: t.semantic.font.label.xs.fontWeight.value,
              color: t.semantic.color.type.default.value,
              whiteSpace: "nowrap",
            })}
          >
            {value.numeric} - {value.label}
          </Typography>
        </Stack>
      )}
    </Box>
  );
}

const scoreTableCellContentSx = {
  display: "flex",
  alignItems: "center",
  width: "max-content",
  maxWidth: "100%",
  minWidth: 0,
  overflow: "visible",
  boxSizing: "border-box" as const,
};

function MetricLegendCell({ value }: { value: ScoreValue }) {
  return (
    <Box sx={scoreTableCellContentSx}>
      <RiskLegendCell value={value} />
    </Box>
  );
}

function toFivePointScore(value: number, label: FivePointScaleLabel): ScoreValue {
  return { numeric: String(value), label, rag: fivePointLabelToRag(label) };
}

function toLikelihoodScore(value: number): ScoreValue {
  const label = getLikelihoodLabel(value);
  return { numeric: String(value), label, rag: fivePointLabelToRag(label) };
}

function toCyberRiskScoreValue(value: number): ScoreValue {
  const label = getCyberRiskScoreLabel(value);
  return { numeric: String(value), label, rag: fivePointLabelToRag(label) };
}

function buildScoringRowsForScope(includedAssetIds: Set<string>): ScoringRow[] {
  if (includedAssetIds.size === 0) return [];
  const risks = scopedCyberRisks(includedAssetIds);
  const scenarioList = scopedScenarios(includedAssetIds);
  const byRisk = new Map<string, (typeof scenarioList)[number][]>();
  for (const s of scenarioList) {
    const list = byRisk.get(s.cyberRiskId) ?? [];
    list.push(s);
    byRisk.set(s.cyberRiskId, list);
  }

  return risks.flatMap((cr) => {
    const riskRow: ScoringRow = {
      id: cr.id,
      kind: "cyberRisk",
      groupId: cr.id,
      tag: "Cyber risk",
      title: (
        <Link
          href="#"
          onClick={(e) => e.preventDefault()}
          underline="always"
          sx={({ tokens: t }) => ({
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
            fontWeight: 600,
            color: t.semantic.color.type.default.value,
          })}
        >
          {cr.name}
        </Link>
      ),
      impact: null,
      threat: null,
      vulnerability: null,
      likelihood: null,
      cyberRiskScore: null,
    };

    const relatedScenarios = byRisk.get(cr.id) ?? [];
    const scenarioRows: ScoringRow[] = relatedScenarios.map((s) => ({
      id: s.id,
      kind: "scenario" as const,
      groupId: cr.id,
      tag: "Scenario",
      title: (
        <Typography
          sx={({ tokens: t }) => ({
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
            color: t.semantic.color.type.default.value,
          })}
        >
          {s.name}
        </Typography>
      ),
      impact: toFivePointScore(s.impact, s.impactLabel),
      threat: toFivePointScore(s.threatSeverity, s.threatSeverityLabel),
      vulnerability: toFivePointScore(s.vulnerabilitySeverity, s.vulnerabilitySeverityLabel),
      likelihood: toLikelihoodScore(s.likelihood),
      cyberRiskScore: toCyberRiskScoreValue(s.cyberRiskScore),
    }));

    return [riskRow, ...scenarioRows];
  });
}

function parseScoreNumeric(value: ScoreValue): number | null {
  if (value == null) return null;
  const n = Number.parseFloat(value.numeric);
  return Number.isFinite(n) ? n : null;
}

type MetricKey = "impact" | "threat" | "vulnerability" | "likelihood" | "cyberRiskScore";

function scoreFromAggregatedNumeric(
  aggregated: number,
  referenceValues: NonNullable<ScoreValue>[],
): ScoreValue {
  const rounded = Math.round(aggregated);
  if (referenceValues.length === 0) return null;
  let best = referenceValues[0];
  let bestDist = Math.abs(parseScoreNumeric(best)! - aggregated);
  for (const v of referenceValues) {
    const n = parseScoreNumeric(v);
    if (n == null) continue;
    const d = Math.abs(n - aggregated);
    if (d < bestDist) {
      best = v;
      bestDist = d;
    }
  }
  return { numeric: String(rounded), label: best.label, rag: best.rag };
}

function aggregateMetricForGroup(
  scenariosInGroup: ScoringRow[],
  metric: MetricKey,
  method: AggregationMethod,
): ScoreValue {
  const withValue = scenariosInGroup.filter((s) => s[metric] != null);
  if (withValue.length === 0) return null;

  const values = withValue.map((s) => s[metric]!);

  if (method === "highest") {
    let best = values[0];
    let bestN = parseScoreNumeric(best)!;
    for (const v of values) {
      const n = parseScoreNumeric(v)!;
      if (n > bestN) {
        bestN = n;
        best = v;
      }
    }
    return best;
  }

  const entries = values.map((v, i) => ({
    n: parseScoreNumeric(v)!,
    weight: parseScoreNumeric(withValue[i].likelihood) ?? 1,
  }));

  if (method === "average") {
    const sum = entries.reduce((acc, e) => acc + e.n, 0);
    return scoreFromAggregatedNumeric(sum / entries.length, values);
  }

  let weightTotal = 0;
  let weightedSum = 0;
  for (const e of entries) {
    const w = e.weight > 0 ? e.weight : 1;
    weightedSum += e.n * w;
    weightTotal += w;
  }
  if (weightTotal === 0) return null;
  return scoreFromAggregatedNumeric(weightedSum / weightTotal, values);
}

function NameCell({
  row,
  expanded,
  onToggle,
}: {
  row: ScoringRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isGroup = row.kind === "cyberRisk";
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      gap={1}
      sx={{
        py: 1,
        minHeight: 56,
        pl: isGroup ? 0 : 4,
      }}
    >
      {isGroup ? (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse cyber risk" : "Expand cyber risk"}
          sx={{ mt: 0.25, p: 0.5 }}
        >
          <Box
            component="span"
            aria-hidden
            sx={{
              display: "inline-flex",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          >
            <ExpandDownIcon />
          </Box>
        </IconButton>
      ) : null}
      <Stack gap={0.25} sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={({ tokens: t }) => ({
            alignSelf: "flex-start",
            px: 0.5,
            py: 0.25,
            borderRadius: t.semantic.radius.sm.value,
            bgcolor: t.semantic.color.surface.variant.value,
          })}
        >
          <Typography
            sx={({ tokens: t }) => ({
              fontSize: t.semantic.font.label.sm.fontSize.value,
              lineHeight: t.semantic.font.label.sm.lineHeight.value,
              letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
              fontWeight: 600,
              color: t.semantic.color.type.default.value,
            })}
          >
            {row.tag}
          </Typography>
        </Box>
        <Box
          sx={{
            minWidth: 0,
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            "& .MuiTypography-root": { whiteSpace: "normal" },
            "& .MuiLink-root": { whiteSpace: "normal" },
          }}
        >
          {row.title}
        </Box>
      </Stack>
    </Stack>
  );
}

function MetricScoreSkeleton() {
  return (
    <Box sx={{ minHeight: 56, display: "flex", alignItems: "center", py: 1 }}>
      <Skeleton variant="rounded" width={120} height={22} sx={{ borderRadius: 1 }} />
    </Box>
  );
}

type AssessmentScoringTabProps = {
  /** Passed to the scenario detail page for breadcrumbs. */
  assessmentName?: string;
  /** Current CRA assessment URL; used when returning from scenario scoring rationale. */
  returnToAssessmentPath: string;
  includedAssetIds: Set<string>;
  aiScoringPhase: AiScoringPhase;
  scoringType: CraScoringTypeChoice;
  /** Scoring or overdue phase: show AI scoring CTA above the table. */
  showAiScoringAction: boolean;
  onAiScoringClick: () => void;
  /** Empty state: navigate to Scope tab. */
  onGoToScope: () => void;
};

export default function AssessmentScoringTab({
  assessmentName = "",
  returnToAssessmentPath,
  includedAssetIds,
  aiScoringPhase,
  scoringType,
  showAiScoringAction,
  onAiScoringClick,
  onGoToScope,
}: AssessmentScoringTabProps) {
  const navigate = useNavigate();
  const aggregationLabelId = useId();
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod | null>(null);
  const scoringRows = useMemo(
    () => buildScoringRowsForScope(includedAssetIds),
    [includedAssetIds],
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const riskIds = scoringRows.filter((r) => r.kind === "cyberRisk").map((r) => r.id);
    setExpanded(Object.fromEntries(riskIds.map((id) => [id, true])));
  }, [scoringRows]);

  const goToScenario = useCallback(
    (scenarioId: string) => {
      navigate(`${SCENARIO_DETAIL_PATH}/${encodeURIComponent(scenarioId)}`, {
        state: {
          assessmentName: assessmentName.trim() || undefined,
          scoringType,
          aiScoringPhase,
          returnToAssessmentPath,
        },
      });
    },
    [navigate, assessmentName, scoringType, aiScoringPhase, returnToAssessmentPath],
  );

  const toggleGroup = useCallback((groupId: string) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  }, []);

  const scenariosByGroupId = useMemo(() => {
    const m = new Map<string, ScoringRow[]>();
    for (const row of scoringRows) {
      if (row.kind !== "scenario") continue;
      const list = m.get(row.groupId) ?? [];
      list.push(row);
      m.set(row.groupId, list);
    }
    return m;
  }, [scoringRows]);

  const previewImpactByGroupId = useMemo(() => {
    const result = new Map<string, ScoreValue>();
    for (const [groupId, scenarios] of scenariosByGroupId) {
      result.set(groupId, aggregateMetricForGroup(scenarios, "impact", "highest"));
    }
    return result;
  }, [scenariosByGroupId]);

  const aggregatedByGroupId = useMemo(() => {
    const metrics: MetricKey[] = ["impact", "threat", "vulnerability", "likelihood", "cyberRiskScore"];
    const result = new Map<string, Record<MetricKey, ScoreValue>>();
    if (aggregationMethod == null) return result;
    for (const [groupId, scenarios] of scenariosByGroupId) {
      const agg = {} as Record<MetricKey, ScoreValue>;
      for (const m of metrics) {
        agg[m] = aggregateMetricForGroup(scenarios, m, aggregationMethod);
      }
      result.set(groupId, agg);
    }
    return result;
  }, [aggregationMethod, scenariosByGroupId]);

  const visibleRows = useMemo(() => {
    const out: ScoringRow[] = [];
    let currentGroup = "";
    let groupOpen = true;
    for (const row of scoringRows) {
      if (row.kind === "cyberRisk") {
        currentGroup = row.groupId;
        groupOpen = expanded[row.groupId] !== false;
        out.push(row);
        continue;
      }
      if (row.groupId === currentGroup && groupOpen) {
        out.push(row);
      }
    }
    return out;
  }, [expanded, scoringRows]);

  const handleAggregationChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === "highest" || value === "average") {
      setAggregationMethod(value);
    }
  }, []);

  if (includedAssetIds.size === 0) {
    return (
      <Stack
        sx={({ tokens: t }) => ({
          gap: t.core.spacing["3"].value,
          pt: t.core.spacing["3"].value,
          pb: t.core.spacing["4"].value,
        })}
      >
        <AssessmentScopeEmptyState variant="scoring" onPrimaryAction={onGoToScope} />
      </Stack>
    );
  }

  return (
    <Stack
      sx={({ tokens: t }) => ({
        gap: t.core.spacing["3"].value,
        pt: t.core.spacing["3"].value,
        pb: t.core.spacing["4"].value,
      })}
    >
      {showAiScoringAction ? (
        aiScoringPhase === "complete" ? (
          <Alert
            severity="info"
            icon={<AiSparkleIcon />}
            aria-live="off"
            role={undefined}
            sx={({ tokens: t }) => ({
              width: "100%",
              maxWidth: 1280,
              alignSelf: "stretch",
              backgroundColor: "var(--lens-component-avatar-purple-background-color)",
              color: "var(--lens-component-accordion-active-color)",
              py: t.core.spacing["2"].value,
            })}
          >
            <Box sx={visuallyHidden}>AI</Box>
            <AlertTitle>AI scoring is completed.</AlertTitle>
            You can review and edit each individual scenario scoring and rationale.
          </Alert>
        ) : (
          <AiContentCard
            actionLabel="Start AI Scoring."
            onAction={onAiScoringClick}
            footerLoading={aiScoringPhase === "processing"}
          >
            <AiContentCardAssessmentPreset
              omitAssessmentType
              title="AI scoring"
              description="Assessments will be scored using (Impact x Likelihood). Impact is determined by Asset criticality and Likelihood is determined by (Vulnerability severity x Threat severity). Set scoring type on the Details tab. Review and adjust values in the table below before approving the assessment."
            />
          </AiContentCard>
        )
      ) : null}
      {scoringRows.length === 0 ? (
        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({ color: t.semantic.color.type.muted.value })}
        >
          No cyber risks or scenarios are linked to the selected assets. Adjust selections on the Scope tab if needed.
        </Typography>
      ) : null}
      {aiScoringPhase === "complete" ? (
        <Stack gap={0} sx={{ width: "100%" }}>
          <Typography
            id={aggregationLabelId}
            component="p"
            sx={({ tokens: t }) => ({
              m: 0,
              fontFamily: t.semantic.font.label.sm.fontFamily.value,
              fontSize: t.semantic.font.label.sm.fontSize.value,
              lineHeight: t.semantic.font.label.sm.lineHeight.value,
              letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
              fontWeight: t.semantic.fontWeight.emphasis.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            Aggregation method
          </Typography>
          <FormControl variant="standard" fullWidth sx={{ mt: 0 }}>
            <RadioGroup
              row
              aria-labelledby={aggregationLabelId}
              name="new-cra-scoring-aggregation"
              value={aggregationMethod ?? ""}
              onChange={handleAggregationChange}
            >
              <FormControlLabel
                value="highest"
                control={<Radio />}
                label="Highest"
                slotProps={{
                  typography: {
                    sx: ({ tokens: t }) => ({
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      color: t.semantic.color.type.default.value,
                    }),
                  },
                }}
              />
              <FormControlLabel
                value="average"
                control={<Radio />}
                label="Average"
                slotProps={{
                  typography: {
                    sx: ({ tokens: t }) => ({
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      color: t.semantic.color.type.default.value,
                    }),
                  },
                }}
              />
            </RadioGroup>
          </FormControl>
        </Stack>
      ) : null}

      {scoringRows.length === 0 ? null : (
      <Box
        sx={({ tokens: t }) => ({
          borderRadius: t.semantic.radius.md.value,
          background: "none",
          backgroundColor: "unset",
          overflow: "visible",
          width: "100%",
          p: 0,
        })}
      >
        <TableContainer
          aria-busy={aiScoringPhase === "processing"}
          sx={{
            overflowX: "auto",
            overflowY: "visible",
            maxWidth: "100%",
            borderRadius: ({ tokens: t }) => t.semantic.radius.sm.value,
            bgcolor: ({ tokens: t }) => t.semantic.color.background.base.value,
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              tableLayout: "auto",
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              "& .MuiTableCell-root": {
                borderBottom: ({ tokens: t }) => `1px solid ${t.semantic.color.ui.divider.default.value}`,
                overflow: "visible",
              },
              "& .MuiTableBody-root .MuiTableCell-root": {
                verticalAlign: "middle",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={({ tokens: t }) => ({
                  "& .MuiTableCell-head": {
                    bgcolor: t.semantic.color.background.container.value,
                    fontSize: t.semantic.font.label.sm.fontSize.value,
                    lineHeight: t.semantic.font.label.sm.lineHeight.value,
                    letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
                    fontWeight: 600,
                    color: t.semantic.color.type.default.value,
                    py: 0.5,
                    px: 2,
                    verticalAlign: "middle",
                    overflow: "visible",
                  },
                })}
              >
                <TableCell sx={scoringNameHeadCellSx}>Name</TableCell>
                <TableCell sx={scoringMetricThSx}>Impact</TableCell>
                <TableCell sx={scoringThreatMetricThSx}>Threat severity</TableCell>
                <TableCell sx={scoringVulnerabilityMetricThSx}>Vulnerability severity</TableCell>
                <TableCell sx={scoringLikelihoodMetricThSx}>Likelihood</TableCell>
                <TableCell sx={scoringCyberRiskScoreMetricThSx}>Cyber risk score</TableCell>
                <TableCell
                  align="right"
                  sx={({ tokens: t }) => ({
                    width: SCORING_ACTIONS_COL_WIDTH_PX,
                    minWidth: SCORING_ACTIONS_COL_WIDTH_PX,
                    maxWidth: SCORING_ACTIONS_COL_WIDTH_PX,
                    position: "sticky",
                    right: 0,
                    zIndex: 3,
                    bgcolor: t.semantic.color.background.container.value,
                  })}
                />
              </TableRow>
            </TableHead>
            <TableBody>
              {aiScoringPhase === "processing"
                ? visibleRows.map((row) => (
                    <TableRow key={row.id} hover={false}>
                      <TableCell sx={scoringNameBodyCellSx}>
                        <NameCell
                          row={row}
                          expanded={expanded[row.groupId] !== false}
                          onToggle={() => toggleGroup(row.groupId)}
                        />
                      </TableCell>
                      <TableCell sx={scoringMetricTdSx}>
                        <MetricScoreSkeleton />
                      </TableCell>
                      <TableCell sx={scoringThreatMetricTdSx}>
                        <MetricScoreSkeleton />
                      </TableCell>
                      <TableCell sx={scoringVulnerabilityMetricTdSx}>
                        <MetricScoreSkeleton />
                      </TableCell>
                      <TableCell sx={scoringLikelihoodMetricTdSx}>
                        <MetricScoreSkeleton />
                      </TableCell>
                      <TableCell sx={scoringCyberRiskScoreMetricTdSx}>
                        <MetricScoreSkeleton />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={({ tokens: t }) => ({
                          position: "sticky",
                          right: 0,
                          zIndex: 2,
                          width: SCORING_ACTIONS_COL_WIDTH_PX,
                          minWidth: SCORING_ACTIONS_COL_WIDTH_PX,
                          maxWidth: SCORING_ACTIONS_COL_WIDTH_PX,
                          bgcolor: t.semantic.color.background.base.value,
                          verticalAlign: "middle",
                        })}
                      >
                        <IconButton size="small" aria-label="Row actions" disabled>
                          <MoreIcon aria-hidden />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                : visibleRows.map((row) => {
                    const isScenario = row.kind === "scenario";
                    const idleMode = aiScoringPhase === "idle";
                    const impactValue = idleMode
                      ? row.kind === "cyberRisk"
                        ? previewImpactByGroupId.get(row.groupId) ?? null
                        : row.impact
                      : row.kind === "cyberRisk"
                        ? aggregationMethod
                          ? aggregatedByGroupId.get(row.groupId)?.impact ?? null
                          : null
                        : row.impact;
                    return (
                      <TableRow
                        key={row.id}
                        hover={isScenario}
                        tabIndex={isScenario ? 0 : undefined}
                        aria-label={
                          isScenario
                            ? `Open ${row.tag}: ${row.id}. Press Enter to view scoring rationale.`
                            : undefined
                        }
                        onClick={() => {
                          if (isScenario) goToScenario(row.id);
                        }}
                        onKeyDown={(e) => {
                          if (!isScenario) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            goToScenario(row.id);
                          }
                        }}
                        sx={
                          isScenario
                            ? ({ tokens: t }) => ({
                                cursor: "pointer",
                                "&.MuiTableRow-hover:hover": {
                                  backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                                },
                                "&.MuiTableRow-hover:hover .MuiTableCell-root": {
                                  backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                                },
                                "&:focus-visible": {
                                  outline: `2px solid ${t.semantic.color.action.primary.default.value}`,
                                  outlineOffset: -2,
                                },
                              })
                            : undefined
                        }
                      >
                        <TableCell sx={scoringNameBodyCellSx}>
                          <NameCell
                            row={row}
                            expanded={expanded[row.groupId] !== false}
                            onToggle={() => toggleGroup(row.groupId)}
                          />
                        </TableCell>
                        <TableCell sx={scoringMetricTdSx}>
                          <Box sx={scoreTableCellContentSx}>
                            <RiskLegendCell value={impactValue} />
                          </Box>
                        </TableCell>
                        <TableCell sx={scoringThreatMetricTdSx}>
                          <MetricLegendCell
                            value={
                              idleMode
                                ? null
                                : row.kind === "cyberRisk"
                                  ? aggregationMethod
                                    ? aggregatedByGroupId.get(row.groupId)?.threat ?? null
                                    : null
                                  : row.threat
                            }
                          />
                        </TableCell>
                        <TableCell sx={scoringVulnerabilityMetricTdSx}>
                          <MetricLegendCell
                            value={
                              idleMode
                                ? null
                                : row.kind === "cyberRisk"
                                  ? aggregationMethod
                                    ? aggregatedByGroupId.get(row.groupId)?.vulnerability ?? null
                                    : null
                                  : row.vulnerability
                            }
                          />
                        </TableCell>
                        <TableCell sx={scoringLikelihoodMetricTdSx}>
                          <MetricLegendCell
                            value={
                              idleMode
                                ? null
                                : row.kind === "cyberRisk"
                                  ? aggregationMethod
                                    ? aggregatedByGroupId.get(row.groupId)?.likelihood ?? null
                                    : null
                                  : row.likelihood
                            }
                          />
                        </TableCell>
                        <TableCell sx={scoringCyberRiskScoreMetricTdSx}>
                          <MetricLegendCell
                            value={
                              idleMode
                                ? null
                                : row.kind === "cyberRisk"
                                  ? aggregationMethod
                                    ? aggregatedByGroupId.get(row.groupId)?.cyberRiskScore ?? null
                                    : null
                                  : row.cyberRiskScore
                            }
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={({ tokens: t }) => ({
                            position: "sticky",
                            right: 0,
                            zIndex: 2,
                            width: SCORING_ACTIONS_COL_WIDTH_PX,
                            minWidth: SCORING_ACTIONS_COL_WIDTH_PX,
                            maxWidth: SCORING_ACTIONS_COL_WIDTH_PX,
                            bgcolor: t.semantic.color.background.base.value,
                            verticalAlign: "middle",
                          })}
                        >
                          <IconButton
                            size="small"
                            aria-label="Row actions"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreIcon aria-hidden />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      )}
    </Stack>
  );
}
