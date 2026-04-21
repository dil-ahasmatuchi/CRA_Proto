import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Container,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useLocation, useNavigate, useNavigationType, useParams } from "react-router";

import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";

import NewCyberRiskAssessmentMethodSection from "./NewCyberRiskAssessmentMethodSection.js";
import AssessmentScoringTab from "./AssessmentScoringTab.js";
import AssessmentResultsTab from "./AssessmentResultsTab.js";
import AssessmentScopeTab, {
  type ScopeSubView,
} from "./AssessmentScopeTab.js";
import {
  assessmentStatusToPhase,
  clearCraNewAssessmentDraft,
  loadCraNewAssessmentDraft,
  saveCraNewAssessmentDraft,
  type AiScoringPhase,
  type AssessmentPhase,
  type CraScoringTypeChoice,
} from "./craNewAssessmentDraftStorage.js";
import { scopedScenarios } from "./scopeAssessmentRollup.js";
import { getRiskAssessmentById } from "../data/riskAssessments.js";
import AssessmentDetailHeader from "../components/AssessmentDetailHeader.js";
import { joinUserFullNames, mockUserEmail, users } from "../data/users.js";

const ASSESSMENT_TYPE_OPTIONS = [
  "Cyber risk assessment",
  "Enterprise risk assessment",
] as const;

const DEFAULT_NEW_ASSESSMENT_NAME = "New cyber risk assessment";
const DEFAULT_NEW_OWNER_ID = users[0]!.id;

function isStandardAssessmentType(value: string): boolean {
  return (ASSESSMENT_TYPE_OPTIONS as readonly string[]).includes(value);
}

/** Atlas user-lookup `Autocomplete` option shape (`OptionType.user`). */
type AssessmentOwnerLookupOption = {
  id: string;
  label: string;
  email: string;
  type: "user";
};

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

const SCOPE_TAB_INDEX = 1;
const SCORING_TAB_INDEX = 2;

function TabPanel({
  children,
  value,
  index,
  sx,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
  sx?: React.ComponentProps<typeof Box>["sx"];
}) {
  return (
    <Box
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`new-cra-tabpanel-${index}`}
      aria-labelledby={`new-cra-tab-${index}`}
      sx={sx}
    >
      {value === index ? children : null}
    </Box>
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

export default function AssessmentDetailsTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { assessmentId: routeAssessmentId } = useParams();
  const { presets } = useTheme();
  const { AutocompletePresets } = presets;

  const isReturningFromScenario =
    (location.state as { craReturnToScoring?: boolean } | null)?.craReturnToScoring === true;

  const mockFromRoute =
    routeAssessmentId != null && routeAssessmentId !== ""
      ? getRiskAssessmentById(routeAssessmentId)
      : undefined;

  const [initialDraft] = useState(() => {
    if (routeAssessmentId != null && routeAssessmentId !== "") return null;
    if (mockFromRoute != null) return null;
    return loadCraNewAssessmentDraft();
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (initialDraft) return initialDraft.activeTab;
    if (mockFromRoute) return 0;
    return 0;
  });
  /** Draft → Scoping → Scoring → Approved → Done (navigate to list). */
  const [assessmentPhase, setAssessmentPhase] = useState<AssessmentPhase>(() => {
    if (initialDraft) return initialDraft.assessmentPhase;
    if (mockFromRoute) return assessmentStatusToPhase(mockFromRoute.status);
    return "draft";
  });
  const [name, setName] = useState(() => {
    if (initialDraft) return initialDraft.name;
    if (mockFromRoute) return mockFromRoute.name;
    return DEFAULT_NEW_ASSESSMENT_NAME;
  });
  const [assessmentId, setAssessmentId] = useState(() => {
    if (initialDraft) return initialDraft.assessmentId;
    if (mockFromRoute) return mockFromRoute.id;
    return "";
  });
  const [assessmentType, setAssessmentType] = useState(() => {
    if (initialDraft) return initialDraft.assessmentType;
    if (mockFromRoute) return mockFromRoute.assessmentType;
    return ASSESSMENT_TYPE_OPTIONS[0];
  });
  const [dueDate, setDueDate] = useState(() => {
    if (initialDraft) return initialDraft.dueDate;
    if (mockFromRoute) return mockFromRoute.dueDate;
    return "";
  });
  const [ownerIds, setOwnerIds] = useState<string[]>(() => {
    if (initialDraft) return initialDraft.ownerIds;
    if (mockFromRoute) return [mockFromRoute.ownerId];
    return [DEFAULT_NEW_OWNER_ID];
  });
  /** Scope tab: card overview vs assets data grid (drives PageHeader). */
  const [scopeSubView, setScopeSubView] = useState<ScopeSubView>(() => {
    if (initialDraft) return initialDraft.scopeSubView;
    if (mockFromRoute) return "overview";
    return "overview";
  });

  const [includedScopeAssetIds, setIncludedScopeAssetIds] = useState<Set<string>>(() => {
    if (initialDraft) return new Set(initialDraft.includedScopeAssetIds ?? []);
    if (mockFromRoute) return new Set(mockFromRoute.assetIds);
    return new Set();
  });

  const [aiScoringPhase, setAiScoringPhase] = useState<AiScoringPhase>(() => {
    if (mockFromRoute) return "idle";
    if (initialDraft) return initialDraft.aiScoringPhase;
    return "idle";
  });

  const [scoringType, setScoringType] = useState<CraScoringTypeChoice>(() => {
    if (initialDraft) return initialDraft.scoringType;
    return "residual";
  });

  const aiScoringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Clear stale draft on fresh entry to `/new`, but not when the user pops back (browser-style back preserves remounted state + draft). */
  const needsInitialDraftClear =
    !routeAssessmentId &&
    mockFromRoute == null &&
    !isReturningFromScenario &&
    navigationType !== "POP";

  useLayoutEffect(() => {
    if (!needsInitialDraftClear) return;
    clearCraNewAssessmentDraft();
  }, [needsInitialDraftClear]);

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

  const assessmentOwnerLookupOptions = useMemo((): AssessmentOwnerLookupOption[] => {
    return users.map((u) => ({
      id: u.id,
      label: u.fullName,
      email: mockUserEmail(u),
      type: "user" as const,
    }));
  }, []);

  const selectedAssessmentOwners = useMemo((): AssessmentOwnerLookupOption[] => {
    return ownerIds
      .map((id) => assessmentOwnerLookupOptions.find((o) => o.id === id))
      .filter((o): o is AssessmentOwnerLookupOption => o != null);
  }, [ownerIds, assessmentOwnerLookupOptions]);

  const createdByDisplay = useMemo(() => joinUserFullNames(ownerIds, "—"), [ownerIds]);

  useEffect(() => {
    if (routeAssessmentId) return;
    if (mockFromRoute != null) return;
    if (assessmentPhase !== "draft") return;
    if (includedScopeAssetIds.size === 0) return;
    setAssessmentPhase("scoping");
  }, [routeAssessmentId, mockFromRoute, assessmentPhase, includedScopeAssetIds]);

  const showAiScoringAction = useMemo(() => {
    if (assessmentPhase === "inProgress" || assessmentPhase === "overdue") return true;
    if (assessmentPhase === "scoping") {
      return (
        includedScopeAssetIds.size >= 1 && scopedScenarios(includedScopeAssetIds).length >= 1
      );
    }
    return false;
  }, [assessmentPhase, includedScopeAssetIds]);

  const handleSaveDraft = useCallback(() => {
    if (routeAssessmentId) return;
    saveCraNewAssessmentDraft({
      activeTab,
      assessmentPhase,
      name,
      assessmentId,
      assessmentType,
      startDate: "",
      dueDate,
      ownerIds,
      scopeSubView,
      includedScopeAssetIds: [...includedScopeAssetIds],
      aiScoringPhase,
      scoringType,
    });
  }, [
    routeAssessmentId,
    activeTab,
    assessmentPhase,
    name,
    assessmentId,
    assessmentType,
    dueDate,
    ownerIds,
    scopeSubView,
    includedScopeAssetIds,
    aiScoringPhase,
    scoringType,
  ]);

  const handleAiScoringClick = useCallback(() => {
    if (assessmentPhase === "scoping") {
      if (
        includedScopeAssetIds.size < 1 ||
        scopedScenarios(includedScopeAssetIds).length < 1
      ) {
        return;
      }
      setAssessmentPhase("inProgress");
    }
    setAiScoringPhase((prev) => {
      if (prev !== "idle") return prev;
      if (aiScoringTimerRef.current) {
        clearTimeout(aiScoringTimerRef.current);
      }
      aiScoringTimerRef.current = setTimeout(() => {
        aiScoringTimerRef.current = null;
        setAiScoringPhase("complete");
      }, 3000);
      return "processing";
    });
  }, [assessmentPhase, includedScopeAssetIds]);

  useEffect(() => {
    return () => {
      if (aiScoringTimerRef.current) {
        clearTimeout(aiScoringTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    handleSaveDraft();
  }, [handleSaveDraft]);

  useEffect(() => {
    if (!routeAssessmentId) return;
    const a = getRiskAssessmentById(routeAssessmentId);
    if (!a) {
      navigate("/cyber-risk/cyber-risk-assessments", { replace: true });
    }
  }, [routeAssessmentId, navigate]);

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

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={0}>
        <AssessmentDetailHeader
          assessmentName={name}
          assessmentId={assessmentId}
          dueDate={dueDate}
          createdAtDisplay={mockFromRoute ? mockFromRoute.startDate : "—"}
          createdBy={createdByDisplay}
          lastUpdatedAtDisplay={mockFromRoute ? mockFromRoute.dueDate : "—"}
          lastUpdatedByDisplay={
            mockFromRoute ? joinUserFullNames([mockFromRoute.ownerId]) : "—"
          }
          assessmentPhase={assessmentPhase}
          onPhaseChange={(phase) => {
            setAssessmentPhase(phase);
          }}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          scopeDetail={scopeDetail}
          onScopeSubViewBack={() => setScopeSubView("overview")}
          onScopeDetailDone={() => setScopeSubView("overview")}
          onSave={handleSaveDraft}
          aiScoringPhase={aiScoringPhase}
        />

        <TabPanel value={activeTab} index={0}>
          <Stack gap={6} sx={{ pt: 3, pb: 4, width: "100%" }}>
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
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    Custom ID
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={assessmentId}
                    onChange={(e) => setAssessmentId(e.target.value)}
                    placeholder="e.g. CRA-001"
                    aria-label="Custom ID"
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "3 1 0" }, minWidth: { xs: "100%", md: 200 } }}>
                <FormControl fullWidth>
                  <InputLabel id="cra-assessment-type-label">Assessment type</InputLabel>
                  <Select
                    labelId="cra-assessment-type-label"
                    id="cra-assessment-type"
                    label="Assessment type"
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    aria-label="Assessment type"
                  >
                    {!isStandardAssessmentType(assessmentType) && assessmentType ? (
                      <MenuItem value={assessmentType}>{assessmentType}</MenuItem>
                    ) : null}
                    {ASSESSMENT_TYPE_OPTIONS.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            <Box sx={{ width: "100%" }}>
              <FormControl fullWidth margin="none">
                <Autocomplete
                  multiple
                  id="cra-new-assessment-owner-lookup"
                  options={assessmentOwnerLookupOptions as never}
                  value={selectedAssessmentOwners as never}
                  onChange={(_, newValue) => setOwnerIds(newValue.map((o) => o.id))}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Owner"
                      placeholder="Select users..."
                      margin="none"
                    />
                  )}
                  renderOption={AutocompletePresets.userLookup.renderOption}
                  renderTags={AutocompletePresets.userLookup.type.multiple.renderTags}
                />
              </FormControl>
            </Box>

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

            <NewCyberRiskAssessmentMethodSection
              scoringType={scoringType}
              onScoringTypeChange={setScoringType}
            />
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <AssessmentScopeTab
            scopeSubView={scopeSubView}
            onScopeSubViewChange={setScopeSubView}
            includedAssetIds={includedScopeAssetIds}
            onToggleAssetIncluded={toggleAssetIncluded}
            onBulkAssetIdsIncluded={bulkSetAssetsIncluded}
          />
        </TabPanel>
        <TabPanel
          value={activeTab}
          index={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <AssessmentScoringTab
            assessmentName={name}
            returnToAssessmentPath={location.pathname}
            includedAssetIds={includedScopeAssetIds}
            aiScoringPhase={aiScoringPhase}
            scoringType={scoringType}
            showAiScoringAction={showAiScoringAction}
            onAiScoringClick={handleAiScoringClick}
            onGoToScope={() => setActiveTab(SCOPE_TAB_INDEX)}
          />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <AssessmentResultsTab
            includedAssetIds={includedScopeAssetIds}
            onGoToScoring={() => setActiveTab(SCORING_TAB_INDEX)}
          />
        </TabPanel>
      </Stack>
    </Container>
  );
}
