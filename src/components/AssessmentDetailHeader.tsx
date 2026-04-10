import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import {
  Button,
  CircularProgress,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";
import type { AiScoringPhase, AssessmentPhase } from "../pages/craNewAssessmentDraftStorage.js";
import AssessmentStatus, {
  assessmentStatusDotBackground,
} from "./AssessmentStatus.js";
import MetaTag from "./MetaTag.js";
import StatusDropdown from "./StatusDropdown.js";
import {
  atlasPageHeaderNavigationTabsSx,
  atlasPageHeaderTabsSlotProps,
} from "../utils/atlasNavigationTabsSx.js";

const ASSESSMENTS_URL = "/cyber-risk/cyber-risk-assessments";

const SCOPE_TAB_INDEX = 1;
const SCORING_TAB_INDEX = 2;
const RESULTS_TAB_INDEX = 3;

const TAB_LABELS = ["Details", "Scope", "Scoring", "Results"] as const;

/** Display labels for assessment phases, in dropdown order. */
const ASSESSMENT_PHASE_LABELS: Record<AssessmentPhase, string> = {
  draft: "Draft",
  scoping: "Scoping",
  inProgress: "Scoring",
  overdue: "Overdue",
  assessmentApproved: "Approved assessment",
};

const PHASE_LABEL_TO_PHASE: Record<string, AssessmentPhase> = {
  Draft: "draft",
  Scoping: "scoping",
  Scoring: "inProgress",
  Overdue: "overdue",
  "Approved assessment": "assessmentApproved",
};

/** Maps PageHeader phase labels to canonical list/grid status tokens for `AssessmentStatus` colors. */
const PHASE_LABEL_TO_ASSESSMENT_STATUS: Record<string, AssessmentStatusValue> = {
  Draft: "Draft",
  Scoping: "Scoping",
  Scoring: "Scoring",
  Overdue: "Overdue",
  "Approved assessment": "Approved",
};

const ALL_PHASE_DISPLAY_LABELS = Object.values(ASSESSMENT_PHASE_LABELS);

export type AssessmentDetailHeaderProps = {
  /** Assessment display name (used in breadcrumb + page title). */
  assessmentName: string;
  /** Meta ID (e.g. "CRA-001"), shown in MetaTag row. */
  assessmentId: string;
  startDate: string;
  dueDate: string;
  /** Display name of the created-by user. */
  createdBy: string;
  assessmentPhase: AssessmentPhase;
  onPhaseChange: (phase: AssessmentPhase) => void;
  activeTab: number;
  onActiveTabChange: (tab: number) => void;
  /** When provided, the header switches to scope-detail mode (nested breadcrumb, back button returns to overview). */
  scopeDetail?: { title: string; subtitle: string; crumb: string };
  /** Called when the back button is pressed in scope-detail mode (return to scope overview). */
  onScopeSubViewBack: () => void;
  /** Called when the "Done" CTA is pressed in scope-detail mode. */
  onScopeDetailDone: () => void;
  /** Primary Save action (main header only; not shown in scope-detail mode). */
  onSave?: () => void;
  /** Tertiary More icon action (main header only). */
  onMoreClick?: () => void;
  /** Scoring phase / overdue: AI scoring vs Approve assessment (after AI run completes). */
  aiScoringPhase?: AiScoringPhase;
  /** Starts the simulated AI scoring run (idle → processing). */
  onAiScoringClick?: () => void;
};

export default function AssessmentDetailHeader({
  assessmentName,
  assessmentId,
  startDate,
  dueDate,
  createdBy,
  assessmentPhase,
  onPhaseChange,
  activeTab,
  onActiveTabChange,
  scopeDetail,
  onScopeSubViewBack,
  onScopeDetailDone,
  onSave = () => {},
  onMoreClick = () => {},
  aiScoringPhase = "complete",
  onAiScoringClick = () => {},
}: AssessmentDetailHeaderProps) {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets, CircularProgressPresets } = presets;

  const pageDisplayTitle = assessmentName.trim() || "New cyber risk assessment";
  const phaseDisplayLabel = ASSESSMENT_PHASE_LABELS[assessmentPhase];

  const metaRowInset = `calc(${tokens.component.button.iconOnly.medium.width.value} + ${tokens.component.pageHeader.desktop.mainContent.gap.value})`;

  const breadcrumbs = (
    <OverflowBreadcrumbs
      leadingElement={<span>Asset manager</span>}
      items={[
        { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_URL },
        { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_URL },
      ]}
      aria-label="Breadcrumbs"
    >
      {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
    </OverflowBreadcrumbs>
  );

  const scopeDetailBreadcrumbs = scopeDetail ? (
    <OverflowBreadcrumbs
      leadingElement={<span>Asset manager</span>}
      hideLastItem
      items={[
        { id: "crm", label: "Cyber risk management", url: ASSESSMENTS_URL },
        { id: "cra", label: "Cyber risk analysis", url: ASSESSMENTS_URL },
        {
          id: "assessment",
          label: pageDisplayTitle,
          url: ASSESSMENTS_URL,
        },
        { id: "scope_detail", label: scopeDetail.crumb, url: "#" },
      ]}
      aria-label="Breadcrumbs"
    >
      {({ label, url }) =>
        url === "#" ? (
          <Typography component="span" variant="body1">
            {label}
          </Typography>
        ) : (
          <NavLink to={url}>{label}</NavLink>
        )
      }
    </OverflowBreadcrumbs>
  ) : null;

  const ctaLabel =
    assessmentPhase === "draft"
      ? "Move to scoping"
      : assessmentPhase === "scoping"
        ? "Move to scoring"
        : assessmentPhase === "inProgress" || assessmentPhase === "overdue"
          ? "Approve assessment"
          : "Done";

  const inProgressOrOverdue =
    assessmentPhase === "inProgress" || assessmentPhase === "overdue";

  const approveAssessmentClick = () => {
    onPhaseChange("assessmentApproved");
    onActiveTabChange(RESULTS_TAB_INDEX);
  };

  const primaryCta =
    assessmentPhase === "assessmentApproved" ? (
      <Button
        variant="text"
        size="medium"
        onClick={() => {
          onPhaseChange("inProgress");
          onActiveTabChange(SCORING_TAB_INDEX);
        }}
      >
        Back to scoring
      </Button>
    ) : inProgressOrOverdue && aiScoringPhase !== "complete" ? (
      <Button
        variant="contained"
        color="ai"
        size="medium"
        startIcon={aiScoringPhase === "processing" ? undefined : <AiSparkleIcon aria-hidden />}
        loading={aiScoringPhase === "processing"}
        loadingPosition="start"
        loadingIndicator={
          <CircularProgress color="inherit" {...CircularProgressPresets.size.sm} />
        }
        onClick={onAiScoringClick}
        aria-busy={aiScoringPhase === "processing"}
      >
        AI scoring
      </Button>
    ) : (
      <Button
        variant="text"
        size="medium"
        onClick={() => {
          if (assessmentPhase === "draft") {
            onPhaseChange("scoping");
            onActiveTabChange(SCOPE_TAB_INDEX);
            return;
          }
          if (assessmentPhase === "scoping") {
            onPhaseChange("inProgress");
            onActiveTabChange(SCORING_TAB_INDEX);
            return;
          }
          if (inProgressOrOverdue) {
            approveAssessmentClick();
            return;
          }
        }}
      >
        {ctaLabel}
      </Button>
    );

  const defaultMoreButton = (
    <Stack
      direction="row"
      alignItems="center"
      sx={({ tokens: t }) => ({
        gap: t.core.spacing["2"].value,
      })}
    >
      {primaryCta}
      <Button variant="contained" size="medium" onClick={onSave}>
        Save
      </Button>
      <IconButton size="medium" aria-label="More options" onClick={onMoreClick}>
        <MoreIcon aria-hidden />
      </IconButton>
    </Stack>
  );

  const scopeDetailMoreButton = (
    <Stack direction="row" alignItems="center" gap={1}>
      <Button variant="text" size="medium" onClick={onScopeSubViewBack}>
        Cancel
      </Button>
      <Button variant="contained" size="medium" onClick={onScopeDetailDone}>
        Done
      </Button>
    </Stack>
  );

  return (
    <Stack
      component="section"
      aria-label="Assessment detail header"
      spacing={0}
      sx={{ width: "100%", alignSelf: "stretch", minWidth: 0 }}
    >
      <PageHeader
        containerProps={{
          sx: {
            marginBottom: tokens.core.spacing["0_5"].value,
          },
        }}
        pageTitle={scopeDetail ? scopeDetail.title : pageDisplayTitle}
        pageSubtitle={scopeDetail ? scopeDetail.subtitle : undefined}
        breadcrumbs={scopeDetailBreadcrumbs ?? breadcrumbs}
        statusIndicator={
          scopeDetail ? undefined : (
            <StatusDropdown
              value={phaseDisplayLabel}
              options={ALL_PHASE_DISPLAY_LABELS}
              onChange={(label) => {
                const phase = PHASE_LABEL_TO_PHASE[label];
                if (phase) onPhaseChange(phase);
              }}
              aria-label="Assessment status"
              resolveDotFill={(label, t) =>
                assessmentStatusDotBackground(
                  PHASE_LABEL_TO_ASSESSMENT_STATUS[label] ?? "Draft",
                  t,
                )
              }
              renderChip={({ value: v }) => (
                <AssessmentStatus
                  status={PHASE_LABEL_TO_ASSESSMENT_STATUS[v] ?? "Draft"}
                  label={v}
                />
              )}
            />
          )
        }
        moreButton={scopeDetail ? scopeDetailMoreButton : defaultMoreButton}
        slotProps={
          scopeDetail
            ? {
                backButton: {
                  "aria-label": "Back to scope overview",
                  onClick: onScopeSubViewBack,
                },
              }
            : {
                backButton: {
                  "aria-label": "Back to assessments",
                  onClick: () => navigate(ASSESSMENTS_URL),
                },
              }
        }
      />

      {!scopeDetail ? (
        <Stack
          direction="row"
          component="div"
          flexWrap="nowrap"
          gap={1}
          sx={{
            alignItems: "center",
            marginBottom: tokens.core.spacing["2"].value,
            paddingInlineStart: metaRowInset,
          }}
        >
          <MetaTag label="ID" value={assessmentId || "—"} />
          <MetaTag label="Start date" value={startDate || "—"} />
          <MetaTag label="Due date" value={dueDate || "—"} />
          <MetaTag label="Created by" value={createdBy || "—"} />
        </Stack>
      ) : null}

      {!scopeDetail ? (
        <Tabs
          value={activeTab}
          onChange={(_e, v: number) => {
            const scopingStarted = assessmentPhase !== "draft";
            const assessmentStarted =
              assessmentPhase === "inProgress" ||
              assessmentPhase === "overdue" ||
              assessmentPhase === "assessmentApproved";
            if (v === SCOPE_TAB_INDEX && !scopingStarted) return;
            if (v === SCORING_TAB_INDEX && !assessmentStarted) return;
            if (v === RESULTS_TAB_INDEX && !assessmentStarted) return;
            onActiveTabChange(v);
          }}
          className="atlas-size-large"
          aria-label="Cyber risk assessment sections"
          {...TabsPresets.Tabs.alignToPageHeader}
          slotProps={atlasPageHeaderTabsSlotProps}
          sx={{
            ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
            ...atlasPageHeaderNavigationTabsSx,
          }}
        >
          {TAB_LABELS.map((label, index) => {
            const scopingStarted = assessmentPhase !== "draft";
            const assessmentStarted =
              assessmentPhase === "inProgress" ||
              assessmentPhase === "overdue" ||
              assessmentPhase === "assessmentApproved";
            const scopeLocked = index === SCOPE_TAB_INDEX && !scopingStarted;
            const scoringLocked = index === SCORING_TAB_INDEX && !assessmentStarted;
            const resultsLocked = index === RESULTS_TAB_INDEX && !assessmentStarted;
            const tabDisabled = scopeLocked || scoringLocked || resultsLocked;
            return (
              <Tab
                key={`${label}-${index}`}
                label={label}
                id={`new-cra-tab-${index}`}
                aria-controls={`new-cra-tabpanel-${index}`}
                disabled={tabDisabled}
                sx={
                  tabDisabled
                    ? ({ tokens: t }) => ({
                        color: `${t.semantic.color.type.muted.value} !important`,
                      })
                    : undefined
                }
              />
            );
          })}
        </Tabs>
      ) : null}
    </Stack>
  );
}
