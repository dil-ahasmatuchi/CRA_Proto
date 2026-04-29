import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import DownloadIcon from "@diligentcorp/atlas-react-bundle/icons/Download";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import {
  assessmentStatusFromDisplayLabel,
  assessmentStatusLabel,
} from "../data/assessmentStatusLabels.js";
import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";
import {
  assessmentPhaseToAssessmentStatus,
  assessmentStatusToPhase,
  type AiScoringPhase,
  type AssessmentPhase,
} from "../pages/craNewAssessmentDraftStorage.js";
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

/** Menu order for the status dropdown; Overdue is last. Approved and Overdue are informational only. */
const STATUS_DROPDOWN_ORDER: readonly AssessmentStatusValue[] = [
  "Draft",
  "Scoping",
  "Scoring",
  "Approved",
  "Overdue",
];

const STATUS_DROPDOWN_OPTIONS = STATUS_DROPDOWN_ORDER.map(assessmentStatusLabel);

const NON_SELECTABLE_STATUS_LABELS: readonly string[] = [
  assessmentStatusLabel("Approved"),
  assessmentStatusLabel("Overdue"),
];

/** Random system-style id `CRA-NNN` (001–999), stable for the lifetime of the header instance. */
function randomCraStyleId(): string {
  const n = Math.floor(Math.random() * 999) + 1;
  return `CRA-${String(n).padStart(3, "0")}`;
}

export type AssessmentDetailHeaderProps = {
  /** Assessment display name (used in breadcrumb + page title). */
  assessmentName: string;
  /** User-defined assessment code from details; shown as Custom ID. */
  assessmentId: string;
  dueDate: string;
  /** Display string for when the assessment was created. */
  createdAtDisplay: string;
  /** Display name of the created-by user. */
  createdBy: string;
  /** Display string for last update time. */
  lastUpdatedAtDisplay: string;
  /** Display name of the user who last updated the assessment. */
  lastUpdatedByDisplay: string;
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
  /** When the assessment is approved, called from the header "Export results" action. */
  onExportResults?: () => void;
  /** When scoring/overdue, controls when the header shows "Approve assessment" (after AI run completes). */
  aiScoringPhase?: AiScoringPhase;
  /** After "Reset scores" (approved → scoring); e.g. reset scenario score aggregation to default. */
  onResetScores?: () => void;
};

export default function AssessmentDetailHeader({
  assessmentName,
  assessmentId,
  dueDate,
  createdAtDisplay,
  createdBy,
  lastUpdatedAtDisplay,
  lastUpdatedByDisplay,
  assessmentPhase,
  onPhaseChange,
  activeTab,
  onActiveTabChange,
  scopeDetail,
  onScopeSubViewBack,
  onScopeDetailDone,
  onSave,
  onExportResults,
  aiScoringPhase = "complete",
  onResetScores,
}: AssessmentDetailHeaderProps) {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;

  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  const generatedSystemIdRef = useRef("");
  if (!generatedSystemIdRef.current) {
    generatedSystemIdRef.current = randomCraStyleId();
  }
  const systemIdDisplay = generatedSystemIdRef.current;

  const pageDisplayTitle = assessmentName.trim() || "New cyber risk assessment";
  const phaseDisplayLabel = assessmentStatusLabel(
    assessmentPhaseToAssessmentStatus(assessmentPhase),
  );

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
      <>
        <Button
          variant="text"
          size="medium"
          onClick={() => {
            onPhaseChange("inProgress");
            onActiveTabChange(SCORING_TAB_INDEX);
            onResetScores?.();
          }}
        >
          Reset scores
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<DownloadIcon aria-hidden />}
          aria-label="Export assessment results"
          onClick={() => {
            onExportResults?.();
          }}
        >
          Export results
        </Button>
      </>
    ) : inProgressOrOverdue && aiScoringPhase !== "complete" ? null : (
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
            setApproveConfirmOpen(true);
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
      {onSave ? (
        <Button variant="contained" size="medium" onClick={onSave}>
          Save changes
        </Button>
      ) : null}
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
              options={[...STATUS_DROPDOWN_OPTIONS]}
              nonSelectableOptions={NON_SELECTABLE_STATUS_LABELS}
              onChange={(label) => {
                const status = assessmentStatusFromDisplayLabel(label);
                if (status) onPhaseChange(assessmentStatusToPhase(status));
              }}
              aria-label="Assessment status"
              resolveDotFill={(label, t) =>
                assessmentStatusDotBackground(
                  assessmentStatusFromDisplayLabel(label) ?? "Draft",
                  t,
                )
              }
              renderChip={({ value: v }) => (
                <AssessmentStatus
                  status={assessmentStatusFromDisplayLabel(v) ?? "Draft"}
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
          flexWrap="wrap"
          gap={1}
          sx={{
            alignItems: "center",
            marginBottom: tokens.core.spacing["2"].value,
            paddingInlineStart: metaRowInset,
          }}
        >
          <MetaTag label="ID" value={systemIdDisplay} />
          <MetaTag label="Custom ID" value={assessmentId.trim() || "—"} />
          <MetaTag label="Due date" value={dueDate || "—"} />
          <MetaTag label="Created" value={createdAtDisplay || "—"} />
          <MetaTag label="Created by" value={createdBy || "—"} />
          <MetaTag label="Last updated" value={lastUpdatedAtDisplay || "—"} />
          <MetaTag label="Last updated by" value={lastUpdatedByDisplay || "—"} />
        </Stack>
      ) : null}

      {!scopeDetail ? (
        <Tabs
          value={activeTab}
          onChange={(_e, v: number) => {
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
          {TAB_LABELS.map((label, index) => (
            <Tab
              key={`${label}-${index}`}
              label={label}
              id={`new-cra-tab-${index}`}
              aria-controls={`new-cra-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      ) : null}

      <Dialog
        open={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        aria-labelledby="approve-assessment-dialog-title"
        aria-describedby="approve-assessment-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle component="div">
          <h2 id="approve-assessment-dialog-title">Approve assessment</h2>
          <IconButton
            aria-label="Close"
            onClick={() => setApproveConfirmOpen(false)}
            color="inherit"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="approve-assessment-dialog-description">
            After approving you will not be able to make changes to the assessment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={() => setApproveConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            autoFocus
            onClick={() => {
              approveAssessmentClick();
              setApproveConfirmOpen(false);
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
