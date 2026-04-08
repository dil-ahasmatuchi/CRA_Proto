import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useLocation, useNavigate } from "react-router";

import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";

import NewCyberRiskAssessmentMethodSection from "./NewCyberRiskAssessmentMethodSection.js";
import NewCyberRiskAssessmentScoringTab from "./NewCyberRiskAssessmentScoringTab.js";
import NewCyberRiskAssessmentResultsTab from "./NewCyberRiskAssessmentResultsTab.js";
import NewCyberRiskAssessmentScopeTab, {
  type ScopeSubView,
} from "./NewCyberRiskAssessmentScopeTab.js";
import {
  loadCraNewAssessmentDraft,
  saveCraNewAssessmentDraft,
  type AssessmentPhase,
} from "./craNewAssessmentDraftStorage.js";
import AssessmentDetailHeader from "../components/AssessmentDetailHeader.js";
import { joinUserFullNames, mockUserEmail, users } from "../data/users.js";

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
  const location = useLocation();
  const navigate = useNavigate();
  const { presets } = useTheme();
  const { AutocompletePresets } = presets;

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
  const [ownerIds, setOwnerIds] = useState<string[]>(initialDraft?.ownerIds ?? []);
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
    saveCraNewAssessmentDraft({
      activeTab,
      assessmentPhase,
      name,
      assessmentId,
      assessmentType,
      startDate,
      dueDate,
      ownerIds,
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
    ownerIds,
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

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={0}>
        <AssessmentDetailHeader
          assessmentName={name}
          assessmentId={assessmentId}
          startDate={startDate}
          dueDate={dueDate}
          createdBy={createdByDisplay}
          assessmentPhase={assessmentPhase}
          onPhaseChange={(phase) => {
            setAssessmentPhase(phase);
          }}
          activeTab={activeTab}
          onActiveTabChange={setActiveTab}
          scopeDetail={scopeDetail}
          onScopeSubViewBack={() => setScopeSubView("overview")}
          onScopeDetailDone={() => setScopeSubView("overview")}
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
