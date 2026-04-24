import { useCallback, useMemo, useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router";

import FilterRisks from "../components/FilterRisks.js";
import FilterSideSheet from "../components/FilterSideSheet.js";
import RisksTable from "../components/RisksTable.js";
import RisksMatrix from "../components/RisksMatrix.js";
import RiskStatusDonut from "../components/RiskStatusDonut.js";
import { cyberRisks } from "../data/cyberRisks.js";
import {
  applyCyberRiskFilters,
  buildCyberRiskRows,
  CYBER_RISK_WORKFLOW_FILTER_OPTIONS,
  EMPTY_CYBER_RISK_TABLE_FILTERS,
  type CyberRiskTableFilters,
} from "../utils/cyberRiskTableRows.js";

function hasAnyFilterSelected(f: CyberRiskTableFilters): boolean {
  return (
    f.workflowStatuses.length > 0 ||
    f.ownerIds.length > 0 ||
    f.scoreLabels.length > 0 ||
    f.assetIds.length > 0
  );
}

// ---------------------------------------------------------------------------
// Workflow status donut data
// ---------------------------------------------------------------------------

const workflowData = [
  { label: "Identification", value: 26, color: "#c6c6c9" },
  { label: "Assessment", value: 46, color: "#1565c0" },
  { label: "Mitigation", value: 106, color: "#0086fa" },
  { label: "Monitoring", value: 38, color: "#64b5f6" },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RisksPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<CyberRiskTableFilters>(
    EMPTY_CYBER_RISK_TABLE_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<CyberRiskTableFilters>(
    EMPTY_CYBER_RISK_TABLE_FILTERS,
  );

  const allRows = useMemo(() => buildCyberRiskRows(), []);
  const filteredRows = useMemo(
    () => applyCyberRiskFilters(allRows, appliedFilters),
    [allRows, appliedFilters],
  );

  const hasCommittedFilters = useMemo(
    () => hasAnyFilterSelected(appliedFilters),
    [appliedFilters],
  );
  const hasDraftFilterSelection = useMemo(
    () => hasAnyFilterSelected(draftFilters),
    [draftFilters],
  );
  const hasClearableFilterState = hasCommittedFilters || hasDraftFilterSelection;

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
  }, []);

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

        <Card
          sx={({ tokens }) => ({
            backgroundColor: tokens.semantic.color.background.container.value,
            border: "none",
          })}
        >
          <CardHeader
            sx={{ display: "flex" }}
            title={
              <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }}>
                Overview
              </Typography>
            }
            action={
              <Select value="all" size="medium" sx={{ minWidth: 180 }}>
                <MenuItem value="all">All business units</MenuItem>
              </Select>
            }
          />
          <CardContent>
            <Stack direction="row" gap={3} sx={{ alignItems: "stretch" }}>
              <RiskStatusDonut data={workflowData} />
              <RisksMatrix risks={cyberRisks} sx={{ flex: 3, minWidth: 0 }} />
            </Stack>
          </CardContent>
        </Card>

        <RisksTable rows={filteredRows} onOpenFilters={handleOpenFilters} />
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
