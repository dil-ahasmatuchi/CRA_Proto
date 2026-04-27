import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Autocomplete,
  Box,
  Container,
  FormControl,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { format, isValid, parseISO } from "date-fns";
import { useLocation, useNavigate, useNavigationType, useParams } from "react-router";

import NewCyberRiskAssessmentMethodSection from "./NewCyberRiskAssessmentMethodSection.js";
import AssessmentScoringTab from "./AssessmentScoringTab.js";
import AssessmentResultsTab from "./AssessmentResultsTab.js";
import AssessmentScopeTab, {
  type ScopeSubView,
} from "./AssessmentScopeTab.js";
import {
  assessmentPhaseToAssessmentStatus,
  assessmentStatusToPhase,
  clearCraNewAssessmentDraft,
  loadCraNewAssessmentDraft,
  saveCraNewAssessmentDraft,
  type AiScoringPhase,
  type AssessmentPhase,
  type CraScenarioScoreAggregationMethod,
  type CraScoringTypeChoice,
} from "./craNewAssessmentDraftStorage.js";
import {
  assessmentScopedScenarios,
  candidateScopedCyberRisks,
  candidateScopedControls,
  candidateScopedThreats,
  candidateScopedVulnerabilities,
} from "../data/assessmentScopeRollup.js";
import {
  computeAssessmentRollupForAssetIds,
  getRiskAssessmentById,
  updateRiskAssessment,
} from "../data/riskAssessments.js";
import AssessmentDetailHeader from "../components/AssessmentDetailHeader.js";
import { joinUserFullNames, mockUserEmail, users } from "../data/users.js";

const DEFAULT_ASSESSMENT_TYPE = "Cyber risk assessment";
const DEFAULT_NEW_ASSESSMENT_NAME = "New cyber risk assessment";
const DEFAULT_NEW_OWNER_ID = users[0]!.id;

function dueDateStringToValue(s: string): Date | null {
  const t = s.trim();
  if (!t) return null;
  if (t.length >= 10) {
    const fromIso = parseISO(t.slice(0, 10));
    if (isValid(fromIso)) return fromIso;
  }
  const parsed = new Date(t);
  return isValid(parsed) ? parsed : null;
}

function valueToDueDateString(d: Date | null): string {
  if (!d || !isValid(d)) return "";
  return format(d, "yyyy-MM-dd");
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
  scopedControls: {
    title: "Controls",
    subtitle: "Controls linked to assets included in this assessment.",
    crumb: "Controls",
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

export default function AssessmentDetailsTab() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { assessmentId: routeAssessmentId } = useParams();
  const { presets } = useTheme();
  const { AutocompletePresets } = presets;

  const isReturningFromScenario = (() => {
    const st = location.state as
      | { craReturnToScoring?: boolean; craReturnToTabIndex?: number }
      | null;
    return st?.craReturnToScoring === true || typeof st?.craReturnToTabIndex === "number";
  })();

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
  const [persistedAssessmentType] = useState(() => {
    if (initialDraft) return initialDraft.assessmentType;
    if (mockFromRoute) return mockFromRoute.assessmentType;
    return DEFAULT_ASSESSMENT_TYPE;
  });
  const [dueDate, setDueDate] = useState(() => {
    if (initialDraft) return initialDraft.dueDate;
    if (mockFromRoute) return mockFromRoute.dueDate;
    return "";
  });
  const [ownerIds, setOwnerIds] = useState<string[]>(() => {
    if (initialDraft) return initialDraft.ownerIds.slice(0, 1);
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

  const [excludedScopeCyberRiskIds, setExcludedScopeCyberRiskIds] = useState<Set<string>>(() => {
    if (initialDraft) return new Set(initialDraft.excludedScopeCyberRiskIds ?? []);
    if (mockFromRoute) return new Set(mockFromRoute.excludedScopeCyberRiskIds ?? []);
    return new Set();
  });

  const [excludedScopeThreatIds, setExcludedScopeThreatIds] = useState<Set<string>>(() => {
    if (initialDraft) return new Set(initialDraft.excludedScopeThreatIds ?? []);
    if (mockFromRoute) return new Set(mockFromRoute.excludedScopeThreatIds ?? []);
    return new Set();
  });

  const [excludedScopeVulnerabilityIds, setExcludedScopeVulnerabilityIds] = useState<Set<string>>(
    () => {
      if (initialDraft) return new Set(initialDraft.excludedScopeVulnerabilityIds ?? []);
      if (mockFromRoute) return new Set(mockFromRoute.excludedScopeVulnerabilityIds ?? []);
      return new Set();
    },
  );

  const [excludedScopeControlIds, setExcludedScopeControlIds] = useState<Set<string>>(() => {
    if (initialDraft) return new Set(initialDraft.excludedScopeControlIds ?? []);
    if (mockFromRoute) return new Set(mockFromRoute.excludedScopeControlIds ?? []);
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

  const [scenarioScoreAggregationMethod, setScenarioScoreAggregationMethod] =
    useState<CraScenarioScoreAggregationMethod>(() => {
      if (initialDraft) return initialDraft.scenarioScoreAggregationMethod;
      return "highest";
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

  /** Drop exclusions that no longer apply when asset scope changes. */
  useEffect(() => {
    setExcludedScopeCyberRiskIds((prev) => {
      const candidateIds = new Set(
        candidateScopedCyberRisks(includedScopeAssetIds).map((cr) => cr.id),
      );
      const next = new Set<string>();
      for (const id of prev) {
        if (candidateIds.has(id)) next.add(id);
      }
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!next.has(id)) return next;
        }
        return prev;
      }
      return next;
    });
  }, [includedScopeAssetIds]);

  /** Drop threat / vulnerability / control exclusions that no longer apply when asset scope changes. */
  useEffect(() => {
    const threatCand = new Set(candidateScopedThreats(includedScopeAssetIds).map((t) => t.id));
    setExcludedScopeThreatIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (threatCand.has(id)) next.add(id);
      }
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!next.has(id)) return next;
        }
        return prev;
      }
      return next;
    });

    const vulnCand = new Set(candidateScopedVulnerabilities(includedScopeAssetIds).map((v) => v.id));
    setExcludedScopeVulnerabilityIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (vulnCand.has(id)) next.add(id);
      }
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!next.has(id)) return next;
        }
        return prev;
      }
      return next;
    });

    const controlCand = new Set(candidateScopedControls(includedScopeAssetIds).map((c) => c.id));
    setExcludedScopeControlIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (controlCand.has(id)) next.add(id);
      }
      if (next.size === prev.size) {
        for (const id of prev) {
          if (!next.has(id)) return next;
        }
        return prev;
      }
      return next;
    });
  }, [includedScopeAssetIds]);

  const setCyberRiskScopeIncluded = useCallback((cyberRiskId: string, included: boolean) => {
    setExcludedScopeCyberRiskIds((prev) => {
      const next = new Set(prev);
      if (included) next.delete(cyberRiskId);
      else next.add(cyberRiskId);
      return next;
    });
  }, []);

  const bulkSetCyberRisksScopeIncluded = useCallback((cyberRiskIds: string[], included: boolean) => {
    setExcludedScopeCyberRiskIds((prev) => {
      const next = new Set(prev);
      for (const id of cyberRiskIds) {
        if (included) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const setThreatScopeIncluded = useCallback((threatId: string, included: boolean) => {
    setExcludedScopeThreatIds((prev) => {
      const next = new Set(prev);
      if (included) next.delete(threatId);
      else next.add(threatId);
      return next;
    });
  }, []);

  const bulkSetThreatsScopeIncluded = useCallback((threatIds: string[], included: boolean) => {
    setExcludedScopeThreatIds((prev) => {
      const next = new Set(prev);
      for (const id of threatIds) {
        if (included) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }, []);

  const setVulnerabilityScopeIncluded = useCallback((vulnerabilityId: string, included: boolean) => {
    setExcludedScopeVulnerabilityIds((prev) => {
      const next = new Set(prev);
      if (included) next.delete(vulnerabilityId);
      else next.add(vulnerabilityId);
      return next;
    });
  }, []);

  const bulkSetVulnerabilitiesScopeIncluded = useCallback(
    (vulnerabilityIds: string[], included: boolean) => {
      setExcludedScopeVulnerabilityIds((prev) => {
        const next = new Set(prev);
        for (const id of vulnerabilityIds) {
          if (included) next.delete(id);
          else next.add(id);
        }
        return next;
      });
    },
    [],
  );

  const setControlScopeIncluded = useCallback((controlId: string, included: boolean) => {
    setExcludedScopeControlIds((prev) => {
      const next = new Set(prev);
      if (included) next.delete(controlId);
      else next.add(controlId);
      return next;
    });
  }, []);

  const bulkSetControlsScopeIncluded = useCallback((controlIds: string[], included: boolean) => {
    setExcludedScopeControlIds((prev) => {
      const next = new Set(prev);
      for (const id of controlIds) {
        if (included) next.delete(id);
        else next.add(id);
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

  const selectedAssessmentOwner = useMemo((): AssessmentOwnerLookupOption | null => {
    const id = ownerIds[0];
    if (id == null || id === "") return null;
    return assessmentOwnerLookupOptions.find((o) => o.id === id) ?? null;
  }, [ownerIds, assessmentOwnerLookupOptions]);

  const createdByDisplay = useMemo(() => joinUserFullNames(ownerIds, "—"), [ownerIds]);

  /** Adding scope assets moves the workflow from Draft → Scoping (including on `/…/:assessmentId`). */
  useEffect(() => {
    if (assessmentPhase !== "draft") return;
    if (includedScopeAssetIds.size === 0) return;
    setAssessmentPhase("scoping");
    setScenarioScoreAggregationMethod("highest");
  }, [assessmentPhase, includedScopeAssetIds]);

  const handleAssessmentPhaseChange = useCallback((phase: AssessmentPhase) => {
    setAssessmentPhase(phase);
    if (phase === "scoping") {
      setScenarioScoreAggregationMethod("highest");
    }
  }, []);

  const showAiScoringAction = useMemo(() => {
    if (assessmentPhase === "inProgress" || assessmentPhase === "overdue") return true;
    if (assessmentPhase === "scoping") {
      return (
        includedScopeAssetIds.size >= 1 &&
        assessmentScopedScenarios(includedScopeAssetIds, excludedScopeCyberRiskIds).length >= 1
      );
    }
    return false;
  }, [assessmentPhase, includedScopeAssetIds, excludedScopeCyberRiskIds]);

  const handleSaveDraft = useCallback(() => {
    const catalogAssessmentId =
      routeAssessmentId != null && routeAssessmentId !== ""
        ? routeAssessmentId
        : /^CRA-\d+$/.test(assessmentId)
          ? assessmentId
          : undefined;

    if (catalogAssessmentId) {
      const row = getRiskAssessmentById(catalogAssessmentId);
      if (row) {
        const trimmedName = name.trim();
        const rollup = computeAssessmentRollupForAssetIds([...includedScopeAssetIds], {
          excludedScopeCyberRiskIds: [...excludedScopeCyberRiskIds],
          excludedScopeThreatIds: [...excludedScopeThreatIds],
          excludedScopeVulnerabilityIds: [...excludedScopeVulnerabilityIds],
          excludedScopeControlIds: [...excludedScopeControlIds],
        });
        updateRiskAssessment(catalogAssessmentId, {
          name: trimmedName || row.name,
          ownerId: ownerIds[0] ?? row.ownerId,
          status: assessmentPhaseToAssessmentStatus(assessmentPhase),
          assessmentType: row.assessmentType,
          dueDate,
          startDate: row.startDate,
          ...rollup,
        });
      }
    }

    if (!routeAssessmentId) {
      saveCraNewAssessmentDraft({
        activeTab,
        assessmentPhase,
        name,
        assessmentId,
        assessmentType: persistedAssessmentType,
        startDate: "",
        dueDate,
        ownerIds,
        scopeSubView,
        includedScopeAssetIds: [...includedScopeAssetIds],
        excludedScopeCyberRiskIds: [...excludedScopeCyberRiskIds],
        excludedScopeThreatIds: [...excludedScopeThreatIds],
        excludedScopeVulnerabilityIds: [...excludedScopeVulnerabilityIds],
        excludedScopeControlIds: [...excludedScopeControlIds],
        aiScoringPhase,
        scoringType,
        scenarioScoreAggregationMethod,
      });
    }
  }, [
    routeAssessmentId,
    activeTab,
    assessmentPhase,
    name,
    assessmentId,
    persistedAssessmentType,
    dueDate,
    ownerIds,
    scopeSubView,
    includedScopeAssetIds,
    excludedScopeCyberRiskIds,
    excludedScopeThreatIds,
    excludedScopeVulnerabilityIds,
    excludedScopeControlIds,
    aiScoringPhase,
    scoringType,
    scenarioScoreAggregationMethod,
  ]);

  const handleAiScoringClick = useCallback(() => {
    if (assessmentPhase === "scoping") {
      if (
        includedScopeAssetIds.size < 1 ||
        assessmentScopedScenarios(includedScopeAssetIds, excludedScopeCyberRiskIds).length < 1
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
  }, [assessmentPhase, includedScopeAssetIds, excludedScopeCyberRiskIds]);

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
    const st = location.state as
      | { craReturnToScoring?: boolean; craReturnToTabIndex?: number }
      | null;
    if (st?.craReturnToTabIndex != null) {
      setActiveTab(st.craReturnToTabIndex);
      navigate(location.pathname, { replace: true, state: null });
    } else if (st?.craReturnToScoring) {
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

  const isApproved = assessmentPhase === "assessmentApproved";

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
          onPhaseChange={handleAssessmentPhaseChange}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          scopeDetail={scopeDetail}
          onScopeSubViewBack={() => setScopeSubView("overview")}
          onScopeDetailDone={() => setScopeSubView("overview")}
          onSave={isApproved ? undefined : handleSaveDraft}
          aiScoringPhase={aiScoringPhase}
          onResetScores={() => setScenarioScoreAggregationMethod("highest")}
        />

        <TabPanel value={activeTab} index={0}>
          <Stack gap={6} sx={{ pt: 3, pb: 4, width: "100%" }}>
            <Box sx={{ width: "100%" }}>
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
                  slotProps={{ input: { readOnly: isApproved } }}
                />
              </Stack>
            </Box>

            <Box
              sx={({ tokens: t }) => ({
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: t.core.spacing["3"].value,
                flexWrap: "wrap",
                width: "100%",
                alignItems: { xs: "stretch", sm: "flex-end" },
              })}
            >
              <Box sx={{ flex: { sm: "2 1 0" }, minWidth: { xs: "100%", sm: 0 }, minHeight: 0 }}>
                <FormControl fullWidth margin="none">
                  <Autocomplete
                    id="cra-new-assessment-owner-lookup"
                    options={assessmentOwnerLookupOptions as never}
                    value={(selectedAssessmentOwner ?? null) as never}
                    onChange={(_, newValue) => setOwnerIds(newValue ? [newValue.id] : [])}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    disabled={isApproved}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Owner"
                        placeholder="Select a user..."
                        margin="none"
                      />
                    )}
                    renderOption={AutocompletePresets.userLookup.renderOption}
                  />
                </FormControl>
              </Box>
              <Box sx={{ flex: { sm: "1 1 0" }, minWidth: { xs: "100%", sm: 0 }, minHeight: 0 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    label="Due date"
                    value={dueDateStringToValue(dueDate)}
                    onChange={(d) => setDueDate(valueToDueDateString(d))}
                    dayOfWeekFormatter={(day: Date) => format(day, "EEEEEE")}
                    readOnly={isApproved}
                    disabled={isApproved}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </Box>
              <Box sx={{ flex: { sm: "1 1 0" }, minWidth: { xs: "100%", sm: 0 }, minHeight: 0 }}>
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
                    slotProps={{ input: { readOnly: isApproved } }}
                  />
                </Stack>
              </Box>
            </Box>

            <NewCyberRiskAssessmentMethodSection
              scoringType={scoringType}
              onScoringTypeChange={setScoringType}
              readOnly={isApproved}
            />
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <AssessmentScopeTab
            scopeSubView={scopeSubView}
            onScopeSubViewChange={setScopeSubView}
            includedAssetIds={includedScopeAssetIds}
            excludedScopeCyberRiskIds={excludedScopeCyberRiskIds}
            onSetCyberRiskScopeIncluded={setCyberRiskScopeIncluded}
            onBulkCyberRisksScopeIncluded={bulkSetCyberRisksScopeIncluded}
            excludedScopeThreatIds={excludedScopeThreatIds}
            onSetThreatScopeIncluded={setThreatScopeIncluded}
            onBulkThreatsScopeIncluded={bulkSetThreatsScopeIncluded}
            excludedScopeVulnerabilityIds={excludedScopeVulnerabilityIds}
            onSetVulnerabilityScopeIncluded={setVulnerabilityScopeIncluded}
            onBulkVulnerabilitiesScopeIncluded={bulkSetVulnerabilitiesScopeIncluded}
            excludedScopeControlIds={excludedScopeControlIds}
            onSetControlScopeIncluded={setControlScopeIncluded}
            onBulkControlsScopeIncluded={bulkSetControlsScopeIncluded}
            onToggleAssetIncluded={toggleAssetIncluded}
            onBulkAssetIdsIncluded={bulkSetAssetsIncluded}
            scopeTogglesReadOnly={isApproved}
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
            aggregationMethod={scenarioScoreAggregationMethod}
            onAggregationMethodChange={setScenarioScoreAggregationMethod}
            includedAssetIds={includedScopeAssetIds}
            excludedScopeCyberRiskIds={excludedScopeCyberRiskIds}
            assessmentPhase={assessmentPhase}
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
            excludedScopeCyberRiskIds={excludedScopeCyberRiskIds}
            onGoToScoring={() => setActiveTab(SCORING_TAB_INDEX)}
            assessmentName={name}
            returnToAssessmentPath={location.pathname}
            assessmentPhase={assessmentPhase}
            scoringType={scoringType}
            aiScoringPhase={aiScoringPhase}
          />
        </TabPanel>
      </Stack>
    </Container>
  );
}
