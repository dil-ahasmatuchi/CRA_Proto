import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import { Container, Stack } from "@mui/material";
import { NavLink, useSearchParams } from "react-router";

import type { BusinessUnitOption } from "../components/BusinessUnitDropdown.js";
import FilterRisks from "../components/FilterRisks.js";
import FilterSideSheet from "../components/FilterSideSheet.js";
import RisksHeroSection from "../components/RisksHeroSection.js";
import RisksTable from "../components/RisksTable.js";
import { getBusinessUnitById } from "../data/businessUnits.js";
import type { MatrixSelectionPayload } from "../components/RisksMatrix.js";
import {
  applyMatrixFiltersToSearchParams,
  parseRiskHeatmapSearchParams,
  stripMatrixParamsFromSearchParams,
} from "../utils/cyberRiskMatrixTableQuery.js";
import {
  applyCyberRiskFilters,
  buildCyberRiskRows,
  countCyberRiskFilterCriteria,
  CYBER_RISK_WORKFLOW_FILTER_OPTIONS,
  EMPTY_CYBER_RISK_TABLE_FILTERS,
  type CyberRiskMatrixTableFilter,
  type CyberRiskTableFilters,
} from "../utils/cyberRiskTableRows.js";

function hasAnyFilterSelected(f: CyberRiskTableFilters): boolean {
  return (
    f.workflowStatuses.length > 0 ||
    f.ownerIds.length > 0 ||
    f.scoreLabels.length > 0 ||
    f.assetIds.length > 0 ||
    f.matrixFilter != null ||
    f.businessUnitId != null
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

  const allRows = useMemo(() => buildCyberRiskRows(), []);
  const filteredRows = useMemo(
    () => applyCyberRiskFilters(allRows, appliedFilters),
    [allRows, appliedFilters],
  );

  const heroBusinessUnit = useMemo((): BusinessUnitOption | null => {
    const id = appliedFilters.businessUnitId;
    if (id == null) return null;
    const bu = getBusinessUnitById(id);
    return { id, label: bu?.name ?? id };
  }, [appliedFilters.businessUnitId]);

  const handleBusinessUnitChange = useCallback((next: BusinessUnitOption | null) => {
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
          businessUnitId: payload.businessUnitId ?? null,
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
          onMatrixSelection={handleMatrixSelection}
          businessUnit={heroBusinessUnit}
          onBusinessUnitChange={handleBusinessUnitChange}
        />

        <RisksTable
          rows={filteredRows}
          onOpenFilters={handleOpenFilters}
          filterCriteriaCount={countCyberRiskFilterCriteria(appliedFilters)}
          onClearFilters={handleClearFilters}
        />
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
