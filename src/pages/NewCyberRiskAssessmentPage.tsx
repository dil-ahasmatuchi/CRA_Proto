import { useCallback, useEffect, useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  StatusIndicator,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router";

import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";

import NewCyberRiskAssessmentMethodSection from "./NewCyberRiskAssessmentMethodSection.js";
import NewCyberRiskAssessmentScoringTab from "./NewCyberRiskAssessmentScoringTab.js";
import NewCyberRiskAssessmentResultsTab from "./NewCyberRiskAssessmentResultsTab.js";
import NewCyberRiskAssessmentScopeTab, {
  type ScopeSubView,
} from "./NewCyberRiskAssessmentScopeTab.js";

const SCOPE_DETAIL_PAGE: Record<
  Exclude<ScopeSubView, "overview">,
  { title: string; subtitle: string; crumb: string }
> = {
  assets: {
    title: "Assets",
    subtitle: "Choose which assets to include in this assessment.",
    crumb: "Assets",
  },
  scopedCyberRisks: {
    title: "Cyber risks",
    subtitle: "Cyber risks linked to assets included in this assessment.",
    crumb: "Cyber risks",
  },
  scopedThreats: {
    title: "Threats",
    subtitle: "Threats linked to assets included in this assessment.",
    crumb: "Threats",
  },
  scopedVulnerabilities: {
    title: "Vulnerabilities",
    subtitle: "Vulnerabilities linked to assets included in this assessment.",
    crumb: "Vulnerabilities",
  },
};
import {
  loadCraNewAssessmentDraft,
  saveCraNewAssessmentDraft,
  type AssessmentPhase,
} from "./craNewAssessmentDraftStorage.js";

const TAB_LABELS = ["Details", "Scope", "Scoring", "Results"] as const;

const SCOPE_TAB_INDEX = 1;
const SCORING_TAB_INDEX = 2;
const RESULTS_TAB_INDEX = 3;

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`new-cra-tabpanel-${index}`}
      aria-labelledby={`new-cra-tab-${index}`}
    >
      {value === index ? children : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={({ tokens: t }) => ({
        fontSize: 26,
        fontWeight: 600,
        lineHeight: "34px",
        color: t.semantic.color.type.default.value,
      })}
    >
      {children}
    </Typography>
  );
}

export default function NewCyberRiskAssessmentPage() {
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;
  const location = useLocation();
  const navigate = useNavigate();

  const isReturningFromScenario =
    (location.state as { craReturnToScoring?: boolean } | null)?.craReturnToScoring === true;
  const [initialDraft] = useState(() =>
    isReturningFromScenario ? loadCraNewAssessmentDraft() : null,
  );
  const [activeTab, setActiveTab] = useState(initialDraft?.activeTab ?? 0);
  /** Draft → Scoping → In progress → Approved assessment → Done (navigate to list). */
  const [assessmentPhase, setAssessmentPhase] = useState<AssessmentPhase>(
    initialDraft?.assessmentPhase ?? "draft",
  );
  const [name, setName] = useState(initialDraft?.name ?? "");
  const [assessmentId, setAssessmentId] = useState(initialDraft?.assessmentId ?? "");
  const [assessmentType, setAssessmentType] = useState(initialDraft?.assessmentType ?? "");
  const [startDate, setStartDate] = useState(initialDraft?.startDate ?? "");
  const [dueDate, setDueDate] = useState(initialDraft?.dueDate ?? "");
  /** Scope tab: card overview vs assets data grid (drives PageHeader). */
  const [scopeSubView, setScopeSubView] = useState<ScopeSubView>(
    initialDraft?.scopeSubView ?? "overview",
  );

  const [includedScopeAssetIds, setIncludedScopeAssetIds] = useState<Set<string>>(() => {
    const d = loadCraNewAssessmentDraft();
    return new Set(d?.includedScopeAssetIds ?? []);
  });

  const toggleAssetIncluded = useCallback((assetId: string, included: boolean) => {
    setIncludedScopeAssetIds((prev) => {
      const next = new Set(prev);
      if (included) next.add(assetId);
      else next.delete(assetId);
      return next;
    });
  }, []);

  const bulkSetAssetsIncluded = useCallback((assetIds: string[], included: boolean) => {
    setIncludedScopeAssetIds((prev) => {
      const next = new Set(prev);
      for (const id of assetIds) {
        if (included) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    saveCraNewAssessmentDraft({
      activeTab,
      assessmentPhase,
      name,
      assessmentId,
      assessmentType,
      startDate,
      dueDate,
      scopeSubView,
      includedScopeAssetIds: [...includedScopeAssetIds],
    });
  }, [
    activeTab,
    assessmentPhase,
    name,
    assessmentId,
    assessmentType,
    startDate,
    dueDate,
    scopeSubView,
    includedScopeAssetIds,
  ]);

  useEffect(() => {
    const st = location.state as { craReturnToScoring?: boolean } | null;
    if (st?.craReturnToScoring) {
      setActiveTab(SCORING_TAB_INDEX);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate]);

  const isScopeDetailView =
    activeTab === SCOPE_TAB_INDEX && scopeSubView !== "overview";

  const scopeDetail =
    isScopeDetailView
      ? SCOPE_DETAIL_PAGE[scopeSubView as Exclude<ScopeSubView, "overview">]
      : undefined;

  useEffect(() => {
    if (activeTab !== SCOPE_TAB_INDEX) {
      setScopeSubView("overview");
    }
  }, [activeTab]);

  const assessmentsUrl = "/cyber-risk/cyber-risk-assessments";

  const breadcrumbs = (
    <OverflowBreadcrumbs
      leadingElement={<span>Asset manager</span>}
      items={[
        {
          id: "crm",
          label: "Cyber risk management",
          url: assessmentsUrl,
        },
        {
          id: "cra",
          label: "Cyber risk analysis",
          url: assessmentsUrl,
        },
      ]}
      aria-label="Breadcrumbs"
    >
      {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
    </OverflowBreadcrumbs>
  );

  /** Scope subviews: extended trail + hide current page crumb (matches Figma 10752-119596 pattern). */
  const scopeDetailBreadcrumbs = scopeDetail ? (
    <OverflowBreadcrumbs
      leadingElement={<span>Asset manager</span>}
      hideLastItem
      items={[
        { id: "crm", label: "Cyber risk management", url: assessmentsUrl },
        { id: "cra", label: "Cyber risk analysis", url: assessmentsUrl },
        {
          id: "assessment",
          label: name.trim() || "New cyber risk assessment",
          url: assessmentsUrl,
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

  const defaultPageTitle = (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      sx={{
        gap: tokens.component.pageHeader.desktop.statusContainer.gap.value,
        minWidth: 0,
        width: "100%",
      }}
    >
      <Typography
        component="h1"
        variant="h1"
        sx={{
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontWeight: tokens.component.pageHeader.desktop.title.fontWeight.value,
        }}
      >
        {name.trim() || "New cyber risk assessment"}
      </Typography>
      <Box sx={{ flexShrink: 0 }}>
        {assessmentPhase === "draft" ? (
          <StatusIndicator
            customColor={({ semantic }) => ({
              backgroundColor: semantic.color.status.neutral.backgroundVariant.value,
              color: semantic.color.status.neutral.text.value,
            })}
            sx={{ display: "flex" }}
            label="Draft"
            aria-label="Assessment status: Draft"
          />
        ) : assessmentPhase === "scoping" ? (
          <StatusIndicator
            color="information"
            sx={{ display: "flex" }}
            label="Scoping"
            aria-label="Assessment status: Scoping"
          />
        ) : assessmentPhase === "inProgress" ? (
          <StatusIndicator
            color="information"
            sx={{ display: "flex" }}
            label="In progress"
            aria-label="Assessment status: In progress"
          />
        ) : (
          <StatusIndicator
            color="success"
            sx={{ display: "flex" }}
            label="Approved assessment"
            aria-label="Assessment status: Approved assessment"
          />
        )}
      </Box>
    </Stack>
  );

  const ctaLabel =
    assessmentPhase === "draft"
      ? "Move to scoping"
      : assessmentPhase === "scoping"
        ? "Move to assessment"
        : assessmentPhase === "inProgress"
          ? "Approve assessment"
          : "Done";

  const defaultMoreButton =
    assessmentPhase === "assessmentApproved" ? (
      <Stack direction="row" alignItems="center" gap={1}>
        <Button
          variant="text"
          size="medium"
          onClick={() => {
            setAssessmentPhase("inProgress");
            setActiveTab(SCORING_TAB_INDEX);
          }}
        >
          Back to scoring
        </Button>
        <Button
          variant="contained"
          size="medium"
          onClick={() => navigate(assessmentsUrl)}
        >
          Done
        </Button>
      </Stack>
    ) : (
      <Button
        variant="contained"
        size="medium"
        onClick={() => {
          if (assessmentPhase === "draft") {
            setAssessmentPhase("scoping");
            setActiveTab(SCOPE_TAB_INDEX);
            return;
          }
          if (assessmentPhase === "scoping") {
            setAssessmentPhase("inProgress");
            setActiveTab(SCORING_TAB_INDEX);
            return;
          }
          if (assessmentPhase === "inProgress") {
            setAssessmentPhase("assessmentApproved");
            setActiveTab(RESULTS_TAB_INDEX);
            return;
          }
        }}
      >
        {ctaLabel}
      </Button>
    );

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <PageHeader
          pageTitle={scopeDetail ? scopeDetail.title : defaultPageTitle}
          pageSubtitle={scopeDetail ? scopeDetail.subtitle : undefined}
          breadcrumbs={scopeDetailBreadcrumbs ?? breadcrumbs}
          slotProps={
            scopeDetail
              ? {
                  backButton: {
                    "aria-label": "Back to scope overview",
                    onClick: () => setScopeSubView("overview"),
                  },
                }
              : undefined
          }
          moreButton={
            scopeDetail ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <Button variant="text" size="medium" onClick={() => setScopeSubView("overview")}>
                  Cancel
                </Button>
                <Button variant="contained" size="medium" onClick={() => setScopeSubView("overview")}>
                  Done
                </Button>
              </Stack>
            ) : (
              defaultMoreButton
            )
          }
        />

        {!isScopeDetailView ? (
          <Tabs
            value={activeTab}
            onChange={(_e, v: number) => {
              const scopingStarted = assessmentPhase !== "draft";
              const assessmentStarted = assessmentPhase === "inProgress" || assessmentPhase === "assessmentApproved";
              if (v === SCOPE_TAB_INDEX && !scopingStarted) return;
              if (v === SCORING_TAB_INDEX && !assessmentStarted) return;
              if (v === RESULTS_TAB_INDEX && !assessmentStarted) return;
              setActiveTab(v);
            }}
            aria-label="New cyber risk assessment steps"
            {...TabsPresets.Tabs.alignToPageHeader}
            sx={[
              TabsPresets.Tabs.alignToPageHeader?.sx,
              { "& .MuiTabs-flexContainer": { gap: 0 } },
            ]}
          >
            {TAB_LABELS.map((label, index) => {
              const scopingStarted = assessmentPhase !== "draft";
              const assessmentStarted = assessmentPhase === "inProgress" || assessmentPhase === "assessmentApproved";
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

        <TabPanel value={activeTab} index={0}>
          <Stack gap={6} sx={{ pt: 3, pb: 4, maxWidth: 1280 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              flexWrap="wrap"
              alignItems={{ xs: "stretch", md: "flex-end" }}
            >
              <Box sx={{ flex: { md: "7 1 0" }, minWidth: { xs: "100%", md: 280 } }}>
                <Stack gap={1}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Assessment name"
                    aria-label="Assessment name"
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "2 1 0" }, minWidth: { xs: "100%", md: 120 } }}>
                <Stack gap={1}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      ID
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.muted.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      (Required)
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    value={assessmentId}
                    onChange={(e) => setAssessmentId(e.target.value)}
                    placeholder="e.g. CRA-001"
                    aria-label="Assessment ID"
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "3 1 0" }, minWidth: { xs: "100%", md: 200 } }}>
                <FormControl fullWidth>
                  <InputLabel id="assessment-type-label" size="medium">
                    Assessment type
                  </InputLabel>
                  <Select
                    labelId="assessment-type-label"
                    label="Assessment type"
                    size="medium"
                    displayEmpty
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    renderValue={(selected) =>
                      selected ? (
                        selected
                      ) : (
                        <Typography
                          component="span"
                          variant="body1"
                          sx={({ tokens: t }) => ({
                            color: t.semantic.color.type.muted.value,
                          })}
                        >
                          Select assessment type
                        </Typography>
                      )
                    }
                  >
                    <MenuItem value="Cyber risk assessment">Cyber risk assessment</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            <Stack gap={2}>
              <SectionHeading>Scheduling</SectionHeading>
              <Stack direction={{ xs: "column", sm: "row" }} gap={3} flexWrap="wrap">
                <Box sx={{ flex: { sm: "1 1 240px" }, minWidth: 194, maxWidth: 400 }}>
                  <Stack gap={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      Start date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      placeholder="e.g. 02 Feb 2026"
                      aria-label="Start date"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                aria-label="Clear start date"
                                onClick={() => setStartDate("")}
                              >
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open calendar">
                                <CalendarIcon aria-hidden />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Box>
                <Box sx={{ flex: { sm: "1 1 240px" }, minWidth: 194, maxWidth: 400 }}>
                  <Stack gap={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      Due date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      placeholder="e.g. 23 Aug 2026"
                      aria-label="Due date"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                aria-label="Clear due date"
                                onClick={() => setDueDate("")}
                              >
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open calendar">
                                <CalendarIcon aria-hidden />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Stack>

            <NewCyberRiskAssessmentMethodSection />
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <NewCyberRiskAssessmentScopeTab
            scopeSubView={scopeSubView}
            onScopeSubViewChange={setScopeSubView}
            includedAssetIds={includedScopeAssetIds}
            onToggleAssetIncluded={toggleAssetIncluded}
            onBulkAssetIdsIncluded={bulkSetAssetsIncluded}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <NewCyberRiskAssessmentScoringTab
            assessmentName={name}
            includedAssetIds={includedScopeAssetIds}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <NewCyberRiskAssessmentResultsTab includedAssetIds={includedScopeAssetIds} />
        </TabPanel>
      </Stack>
    </Container>
  );
}
