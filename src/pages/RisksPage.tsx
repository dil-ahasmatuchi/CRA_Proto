import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useApiList } from "../hooks/useApiList.js";
import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import { Alert, CircularProgress, Container, Stack } from "@mui/material";
import { NavLink, useSearchParams } from "react-router";

import type { OrgUnitOption } from "../components/OrgUnitDropdown.js";
import FilterRisks from "../components/FilterRisks.js";
import FilterSideSheet from "../components/FilterSideSheet.js";
import RisksHeroSection from "../components/RisksHeroSection.js";
import RisksTable from "../components/RisksTable.js";
import { getOrgUnitById } from "../data/orgUnits.js";
import type { MatrixSelectionPayload } from "../components/RisksMatrix.js";
import { useCyberRiskScoringConfig } from "../context/CyberRiskScoringConfigContext.js";
import {
  applyMatrixFiltersToSearchParams,
  parseRiskHeatmapSearchParams,
  stripMatrixParamsFromSearchParams,
} from "../utils/cyberRiskMatrixTableQuery.js";
import {
  applyCyberRiskFilters,
  countCyberRiskFilterCriteria,
  CYBER_RISK_WORKFLOW_FILTER_OPTIONS,
  EMPTY_CYBER_RISK_TABLE_FILTERS,
  type CyberRiskMatrixTableFilter,
  type CyberRiskTableFilters,
  type CyberRiskRow,
} from "../utils/cyberRiskTableRows.js";
import type { FivePointScaleValue, FivePointScaleLabel, CyberRiskStatus, MockCyberRisk } from "../data/types.js";
import type { RiskHeatmapLevel } from "../data/ragDataVisualization.js";

// ---------------------------------------------------------------------------
// API → CyberRiskRow mapping
// ---------------------------------------------------------------------------

interface ApiCyberRiskRow {
  id: string;
  display_id: string;
  name: string;
  domain: string | null;
  description: string | null;
  status: string;
  inherent_score: number | null;
  inherent_score_label: string | null;
  residual_score: number | null;
  residual_score_label: string | null;
  created_at: string;
  updated_at: string;
}

const SCORE_LABEL_TO_HEATMAP: Record<FivePointScaleLabel, RiskHeatmapLevel> = {
  "Very low": "veryLow",
  Low: "low",
  Medium: "medium",
  High: "high",
  "Very high": "veryHigh",
};

function mapApiCyberRisk(row: ApiCyberRiskRow): CyberRiskRow {
  const scoreLabel = (row.inherent_score_label ?? "Medium") as FivePointScaleLabel;
  const residualLabel = (row.residual_score_label ?? "Medium") as FivePointScaleLabel;
  const impact = (row.inherent_score ?? 3) as FivePointScaleValue;
  return {
    id: row.display_id,
    name: row.name,
    riskId: row.display_id,
    ownerId: "",
    orgUnitId: "",
    cyberRiskScore: `${impact} - ${scoreLabel}`,
    riskLevel: SCORE_LABEL_TO_HEATMAP[scoreLabel] ?? "medium",
    ownerName: "Unassigned",
    ownerInitials: "",
    assets: 0,
    workflowStatus: row.status as CyberRiskStatus,
    cyberRiskScoreLabel: scoreLabel,
    impact,
    likelihoodLabel: scoreLabel,
    residualLikelihoodLabel: residualLabel,
    residualCyberRiskScoreLabel: residualLabel,
    assetIds: [],
  };
}

const EMPTY_RELATIONSHIPS = {
  assetIds: [],
  threatIds: [],
  vulnerabilityIds: [],
  scenarioIds: [],
  mitigationPlanIds: [],
  assessmentIds: [],
};

function mapApiToHeroRisk(row: ApiCyberRiskRow): MockCyberRisk {
  const scoreLabel = (row.inherent_score_label ?? "Medium") as FivePointScaleLabel;
  const residualLabel = (row.residual_score_label ?? "Medium") as FivePointScaleLabel;
  const score = (row.inherent_score ?? 3) as FivePointScaleValue;
  const residualScore = row.residual_score ?? 3;
  return {
    id: row.display_id,
    name: row.name,
    ownerId: "",
    status: row.status as CyberRiskStatus,
    orgUnitId: "",
    likelihood: score,
    likelihoodLabel: scoreLabel,
    impact: score,
    impactLabel: scoreLabel,
    cyberRiskScore: score,
    cyberRiskScoreLabel: scoreLabel,
    residualLikelihood: residualScore,
    residualLikelihoodLabel: residualLabel,
    residualCyberRiskScore: residualScore,
    residualCyberRiskScoreLabel: residualLabel,
    assetIds: [],
    threatIds: [],
    vulnerabilityIds: [],
    scenarioIds: [],
    mitigationPlanIds: [],
    relationships: EMPTY_RELATIONSHIPS,
  };
}

function hasAnyFilterSelected(f: CyberRiskTableFilters): boolean {
  return (
    f.workflowStatuses.length > 0 ||
    f.ownerIds.length > 0 ||
    f.scoreLabels.length > 0 ||
    f.assetIds.length > 0 ||
    f.matrixFilter != null ||
    f.orgUnitId != null
  );
}

function readInitialTableFiltersFromLocation(): CyberRiskTableFilters {
  if (typeof window === "undefined") {
    return EMPTY_CYBER_RISK_TABLE_FILTERS;
  }
  const m = parseRiskHeatmapSearchParams(new URLSearchParams(window.location.search));
  return { ...EMPTY_CYBER_RISK_TABLE_FILTERS, ...m };
}

export default function RisksPage() {
  const { cyberScoreBands, likelihoodBands } = useCyberRiskScoringConfig();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CyberRiskTableFilters>(
    readInitialTableFiltersFromLocation,
  );
  const [draftFilters, setDraftFilters] = useState<CyberRiskTableFilters>(
    readInitialTableFiltersFromLocation,
  );

  useLayoutEffect(() => {
    const m = parseRiskHeatmapSearchParams(searchParams);
    setAppliedFilters((prev) => ({ ...prev, ...m }));
    setDraftFilters((prev) => {
      if (isFilterOpen) return prev;
      return { ...prev, ...m };
    });
  }, [searchParams, isFilterOpen]);

  const api = useApiList<ApiCyberRiskRow>("/api/cyber-risks");
  const heroRisks = useMemo(
    () => (api.status === "ok" ? api.data.map(mapApiToHeroRisk) : []),
    [api],
  );
  const allRows = useMemo(
    () => (api.status === "ok" ? api.data.map(mapApiCyberRisk) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, cyberScoreBands, likelihoodBands],
  );
  const filteredRows = useMemo(
    () => applyCyberRiskFilters(allRows, appliedFilters),
    [allRows, appliedFilters],
  );

  const heroOrgUnit = useMemo((): OrgUnitOption | null => {
    const id = appliedFilters.orgUnitId;
    if (id == null) return null;
    const ou = getOrgUnitById(id);
    return { id, label: ou?.name ?? id };
  }, [appliedFilters.orgUnitId]);

  const handleOrgUnitChange = useCallback((next: OrgUnitOption | null) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next) {
        p.set("bu", next.id);
      } else {
        p.delete("bu");
      }
      return p;
    });
  }, [setSearchParams]);

  const hasCommittedFilters = useMemo(
    () => hasAnyFilterSelected(appliedFilters),
    [appliedFilters],
  );
  const hasDraftFilterSelection = useMemo(
    () => hasAnyFilterSelected(draftFilters),
    [draftFilters],
  );
  const hasClearableFilterState = hasCommittedFilters || hasDraftFilterSelection;

  const handleMatrixSelection = useCallback(
    (payload: MatrixSelectionPayload) => {
      const matrixFilter: CyberRiskMatrixTableFilter =
        payload.kind === "cell"
          ? {
              kind: "cell",
              basis: payload.basis,
              rowIdx: payload.rowIdx!,
              colIdx: payload.colIdx!,
            }
          : { kind: "legend", basis: payload.basis, level: payload.level! };
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        applyMatrixFiltersToSearchParams(p, {
          matrixFilter,
          orgUnitId: payload.orgUnitId ?? null,
        });
        return p;
      });
    },
    [setSearchParams],
  );

  const handleOpenFilters = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  }, [appliedFilters]);

  const handleCloseSheet = useCallback(() => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(false);
  }, [appliedFilters]);

  const handleDiscard = useCallback(() => {
    setDraftFilters(appliedFilters);
  }, [appliedFilters]);

  const handleClearFilters = useCallback(() => {
    setDraftFilters(EMPTY_CYBER_RISK_TABLE_FILTERS);
    setAppliedFilters(EMPTY_CYBER_RISK_TABLE_FILTERS);
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      stripMatrixParamsFromSearchParams(p);
      return p;
    });
  }, [setSearchParams]);

  const handleApply = useCallback(() => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  }, [draftFilters]);

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={6}>
        <PageHeader
          pageTitle="Cyber risks"
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset Manager</span>}
              items={[
                {
                  id: "cyber-risk",
                  label: "Cyber risk management",
                  url: "/cyber-risk/overview",
                },
                {
                  id: "cyber-risks",
                  label: "Cyber risks",
                  url: "/cyber-risk/cyber-risks",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
        />

        <RisksHeroSection
          risks={heroRisks}
          onMatrixSelection={handleMatrixSelection}
          orgUnit={heroOrgUnit}
          onOrgUnitChange={handleOrgUnitChange}
        />

        {api.status === "loading" && (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        )}
        {api.status === "error" && (
          <Alert severity="error">Failed to load cyber risks: {api.error}</Alert>
        )}
        {api.status !== "loading" && (
          <RisksTable
            rows={filteredRows}
            onOpenFilters={handleOpenFilters}
            filterCriteriaCount={countCyberRiskFilterCriteria(appliedFilters)}
            onClearFilters={handleClearFilters}
          />
        )}
      </Stack>

      <FilterSideSheet
        open={isFilterOpen}
        onClose={handleCloseSheet}
        onApply={handleApply}
        onClear={handleClearFilters}
        onDiscard={handleDiscard}
        hasClearableFilterState={hasClearableFilterState}
        hasDraftFilterSelection={hasDraftFilterSelection}
        titleId="cyber-risks-filters-title"
        contentAriaLabel="Cyber risks filters"
      >
        <FilterRisks
          value={draftFilters}
          onChange={setDraftFilters}
          workflowOptions={CYBER_RISK_WORKFLOW_FILTER_OPTIONS}
        />
      </FilterSideSheet>
    </Container>
  );
}
