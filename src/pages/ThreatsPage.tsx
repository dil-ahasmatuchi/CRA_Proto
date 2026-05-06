import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Link,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { useCallback, useMemo, useState } from "react";
import { useApiList } from "../hooks/useApiList.js";
import { NavLink, useNavigate } from "react-router";

import {
  ragDataVizColor,
  resolveColorForCanvas,
  RAG_DATA_VIZ_CANVAS_FALLBACK,
  type RagDataVizKey,
} from "../data/ragDataVisualization.js";
import { addThreat } from "../data/threats.js";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import FilterThreats from "../components/FilterThreats.js";
import FilterSideSheet from "../components/FilterSideSheet.js";
import NewToolbar from "../components/NewToolbar.js";
import {
  applyThreatTableFilters,
  countThreatFilterCriteria,
  EMPTY_THREAT_TABLE_FILTERS,
  hasAnyThreatFilterSelected,
  type ThreatTableFilters,
} from "../utils/threatTableFilters.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);



interface ThreatRow {
  id: string;
  name: string;
  threatId: string;
  assessments: number;
  aggregatedAssets: number;
  vulnerabilities: number;
  assetIds: string[];
  vulnerabilityIds: string[];
  threatDomain: string;
  created: string;
  createdBy: string;
  createdByInitials: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  lastUpdatedByInitials: string;
}


interface ApiThreatRow {
  id: string;
  display_id: string;
  name: string;
  domain: string;
  description: string | null;
  status: string;
  owner: string | null;
  severity_level: number | null;
  created_at: string;
  updated_at: string;
}

function getInitials(name: string | null): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapApiThreat(row: ApiThreatRow): ThreatRow {
  const dateStr = row.created_at?.slice(0, 10) ?? "";
  return {
    id: row.display_id,
    name: row.name,
    threatId: row.display_id,
    assessments: 0,
    aggregatedAssets: 0,
    vulnerabilities: 0,
    assetIds: [],
    vulnerabilityIds: [],
    threatDomain: row.domain,
    created: dateStr,
    createdBy: row.owner ?? "Unassigned",
    createdByInitials: getInitials(row.owner),
    lastUpdated: dateStr,
    lastUpdatedBy: row.owner ?? "Unassigned",
    lastUpdatedByInitials: getInitials(row.owner),
  };
}

function aggregateSeverityFromThreats(rows: ApiThreatRow[]): {
  veryLow: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
} {
  const buckets = { veryLow: 0, low: 0, medium: 0, high: 0, veryHigh: 0 };
  for (const row of rows) {
    const score = row.severity_level ?? 3;
    if (score === 1) buckets.veryLow += 1;
    else if (score === 2) buckets.low += 1;
    else if (score === 3) buckets.medium += 1;
    else if (score === 4) buckets.high += 1;
    else buckets.veryHigh += 1;
  }
  return buckets;
}

function aggregateTop5ThreatDomains(rows: ApiThreatRow[]): { label: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.domain] = (counts[row.domain] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

const THREAT_SEVERITY_CHART_RAG: RagDataVizKey[] = ["pos05", "pos04", "neu03", "neg03", "neg05"];

function ThreatsBySeverityCard({ rows }: { rows: ApiThreatRow[] }) {
  const { tokens } = useTheme();
  const severityData = useMemo(() => aggregateSeverityFromThreats(rows), [rows]);

  const chartBackgroundColors = useMemo(
    () =>
      THREAT_SEVERITY_CHART_RAG.map((key) =>
        resolveColorForCanvas(ragDataVizColor(tokens, key), RAG_DATA_VIZ_CANVAS_FALLBACK[key]),
      ),
    [tokens],
  );

  const severityTotal = Object.values(severityData).reduce((sum, v) => sum + v, 0);

  const chartData = {
    labels: ["Very low", "Low", "Medium", "High", "Very high"],
    datasets: [
      {
        data: [
          severityData.veryLow,
          severityData.low,
          severityData.medium,
          severityData.high,
          severityData.veryHigh,
        ],
        backgroundColor: chartBackgroundColors,
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  const legendItems = [
    { label: "Very low", value: severityData.veryLow, rag: "pos05" as const },
    { label: "Low", value: severityData.low, rag: "pos04" as const },
    { label: "Medium", value: severityData.medium, rag: "neu03" as const },
    { label: "High", value: severityData.high, rag: "neg03" as const },
    { label: "Very high", value: severityData.veryHigh, rag: "neg05" as const },
  ];

  return (
    <Card sx={{ flex: "0 1 360px", minWidth: 280, border: "none" }}>
      <CardHeader
        title={
          <Typography variant="h4" component="h3" fontWeight="600">
            Threats by severity
          </Typography>
        }
        action={
          <Button variant="text" size="small" aria-label="More options for threats by severity">
            <MoreIcon aria-hidden />
          </Button>
        }
        sx={{ display: "flex" }}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          height: "100%",
          pt: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 220,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Doughnut
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h2"
              component="span"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.default.value,
                fontWeight: 400,
              })}
            >
              {severityTotal}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.muted.value,
              })}
            >
              Threats
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: 2,
            width: "100%",
          }}
        >
          {legendItems.map((item) => (
            <Stack key={item.label} gap={0}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={({ tokens: t }) => ({
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    backgroundColor: ragDataVizColor(t, item.rag),
                    flexShrink: 0,
                  })}
                />
                <Typography
                  variant="textSm"
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  {item.label}
                </Typography>
              </Stack>
              <Typography
                variant="textMd"
                sx={{ pl: 3, fontWeight: 600 }}
              >
                <Link href="#" underline="hover">
                  {item.value}
                </Link>
              </Typography>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function Top5ThreatDomainsCard({ rows }: { rows: ApiThreatRow[] }) {
  const { tokens } = useTheme();
  const domainBars = useMemo(() => aggregateTop5ThreatDomains(rows), [rows]);
  const maxValue = useMemo(
    () => (domainBars.length > 0 ? Math.max(...domainBars.map((d) => d.value)) : 1),
    [domainBars],
  );
  const yMax = Math.max(10, Math.ceil(maxValue / 10) * 10);

  const barColors = ["#e22e33", "#dc5731", "#d4732e", "#cb8b2b", "#bfa126"];

  const chartData = {
    labels: domainBars.map((_, i) => String(i + 1)),
    datasets: [
      {
        data: domainBars.map((d) => d.value),
        backgroundColor: domainBars.map((_, i) => barColors[i % barColors.length]),
        borderWidth: 0,
        borderRadius: 4,
        maxBarThickness: 64,
      },
    ],
  };

  return (
    <Card sx={{ flex: 1, minWidth: 0, border: "none" }}>
      <CardHeader
        title={
          <Typography variant="h4" component="h3" fontWeight="600">
            Top 5 threat domains
          </Typography>
        }
        action={
          <Button variant="text" size="small" aria-label="More options for top 5 threat domains chart">
            <MoreIcon aria-hidden />
          </Button>
        }
        sx={{ display: "flex" }}
      />
      <CardContent sx={{ pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ height: 280 }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: yMax,
                  ticks: {
                    stepSize: Math.max(1, Math.ceil(yMax / 8)),
                    color: tokens.semantic.color.type.muted.value,
                    font: { size: 11 },
                  },
                  grid: {
                    color: tokens.semantic.color.ui.divider.default.value,
                    drawTicks: false,
                    lineWidth: 1,
                  },
                  border: { display: false, dash: [4, 4] },
                },
                x: {
                  ticks: {
                    color: tokens.semantic.color.type.muted.value,
                    font: { size: 11 },
                  },
                  grid: {
                    display: false,
                  },
                  border: {
                    color: tokens.semantic.color.ui.divider.default.value,
                  },
                },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: 1,
          }}
        >
          {domainBars.map((d, i) => (
            <Stack key={d.label} direction="row" gap={0.5} alignItems="baseline">
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                  minWidth: 12,
                })}
              >
                {i + 1}
              </Typography>
              <Typography variant="labelXs" sx={{ fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {d.label}
                </Link>
              </Typography>
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                ({d.value})
              </Typography>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}


function AvatarCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Avatar {...getAvatarProps({ size: "small", color: "red" })}>{initials}</Avatar>
      <Typography variant="textMd">{name}</Typography>
    </Stack>
  );
}

function ThreatsDataGrid({
  rows,
  onOpenFilters,
  filterCriteriaCount = 0,
  onClearFilters,
}: {
  rows: ThreatRow[];
  onOpenFilters: () => void;
  filterCriteriaCount?: number;
  onClearFilters?: () => void;
}) {
  const columns: GridColDef<ThreatRow>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<ThreatRow>) => {
        const detailPath = `/cyber-risk/threats/${params.row.id}`;
        const label = params.value as string;
        return (
          <Link
            component={NavLink}
            to={detailPath}
            underline="hover"
            sx={{ cursor: "pointer" }}
            aria-label={`Open threat details for ${label}`}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {label}
          </Link>
        );
      },
    },
    {
      field: "threatId",
      headerName: "ID",
      width: 100,
    },
    {
      field: "aggregatedAssets",
      headerName: "Assets",
      width: 140,
      type: "number",
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <Typography variant="textMd" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "vulnerabilities",
      headerName: "Vulnerabilities",
      width: 120,
      type: "number",
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <Typography variant="textMd" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: "threatDomain",
      headerName: "Source",
      width: 140,
    },
    {
      field: "created",
      headerName: "Created",
      width: 120,
    },
    {
      field: "createdBy",
      headerName: "Created by",
      width: 160,
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <AvatarCell name={params.row.createdBy} initials={params.row.createdByInitials} />
      ),
    },
    {
      field: "lastUpdated",
      headerName: "Last updated",
      width: 120,
    },
    {
      field: "lastUpdatedBy",
      headerName: "Last updated by",
      width: 160,
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <AvatarCell name={params.row.lastUpdatedBy} initials={params.row.lastUpdatedByInitials} />
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pagination
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } },
        }}
        disableRowSelectionOnClick
        showToolbar
        slots={{
          toolbar: () => (
            <NewToolbar
              onOpenFilters={onOpenFilters}
              filterCriteriaCount={filterCriteriaCount}
              onClearFilters={onClearFilters}
            />
          ),
        }}
        slotProps={{
          main: {
            "aria-label":
              "Threat categories table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
          },
          basePagination: {
            material: {
              labelRowsPerPage: "Rows",
            },
          },
        }}
        sx={{ border: 0 }}
      />
    </Box>
  );
}

export default function ThreatsPage() {
  const navigate = useNavigate();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<ThreatTableFilters>(
    EMPTY_THREAT_TABLE_FILTERS,
  );
  const [draftFilters, setDraftFilters] = useState<ThreatTableFilters>(
    EMPTY_THREAT_TABLE_FILTERS,
  );

  const api = useApiList<ApiThreatRow>("/api/threats");
  const threatRows = useMemo(
    () => (api.status === "ok" ? api.data.map(mapApiThreat) : []),
    [api],
  );

  const filteredThreatRows = useMemo(
    () => applyThreatTableFilters(threatRows, appliedFilters),
    [threatRows, appliedFilters],
  );

  const hasCommittedFilters = useMemo(
    () => hasAnyThreatFilterSelected(appliedFilters),
    [appliedFilters],
  );
  const hasDraftFilterSelection = useMemo(
    () => hasAnyThreatFilterSelected(draftFilters),
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
    setDraftFilters(EMPTY_THREAT_TABLE_FILTERS);
    setAppliedFilters(EMPTY_THREAT_TABLE_FILTERS);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(draftFilters);
    setIsFilterOpen(false);
  }, [draftFilters]);

  const handleAddThreats = () => {
    const t = addThreat();
    navigate(`${t.id}`, {
      state: { showCreatedToast: true },
      relative: "path",
    });
  };

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
        <PageHeader
          pageTitle="Threats"
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset manager</span>}
              items={[
                {
                  id: "threats",
                  label: "Threats",
                  url: "/cyber-risk/threats",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
          moreButton={
            <Box
              sx={{
                position: "relative",
                zIndex: 2,
                flexShrink: 0,
              }}
            >
              <Button type="button" variant="contained" onClick={handleAddThreats}>
                Add threats
              </Button>
            </Box>
          }
        />

        <Box
          sx={({ tokens }) => ({
            backgroundColor: tokens.semantic.color.background.container.value,
            borderRadius: 2,
            p: 3,
          })}
        >
          <Stack direction="row" gap={3} sx={{ minHeight: 460 }}>
            <ThreatsBySeverityCard rows={api.status === "ok" ? api.data : []} />
            <Top5ThreatDomainsCard rows={api.status === "ok" ? api.data : []} />
          </Stack>
        </Box>

        {api.status === "loading" && (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        )}
        {api.status === "error" && (
          <Alert severity="error">Failed to load threats: {api.error}</Alert>
        )}
        {api.status !== "loading" && (
          <ThreatsDataGrid
            rows={filteredThreatRows}
            onOpenFilters={handleOpenFilters}
            filterCriteriaCount={countThreatFilterCriteria(appliedFilters)}
            onClearFilters={handleClearFilters}
          />
        )}
      </Stack>

      <FilterSideSheet
        open={isFilterOpen}
        onClose={handleCloseSheet}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onDiscard={handleDiscard}
        hasClearableFilterState={hasClearableFilterState}
        hasDraftFilterSelection={hasDraftFilterSelection}
        titleId="threats-filters-title"
        contentAriaLabel="Threat filters"
      >
        <FilterThreats
          value={draftFilters}
          onChange={setDraftFilters}
          rows={threatRows}
        />
      </FilterSideSheet>
    </Container>
  );
}
