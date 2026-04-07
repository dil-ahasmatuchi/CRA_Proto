import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
  ColumnsPanelTrigger,
  FilterPanelTrigger,
  QuickFilter,
  QuickFilterControl,
  Toolbar,
} from "@mui/x-data-grid-pro";
import { useMemo, useSyncExternalStore } from "react";
import { NavLink, useNavigate } from "react-router";

import {
  ragDataVizColor,
  resolveColorForCanvas,
  RAG_DATA_VIZ_CANVAS_FALLBACK,
  type RagDataVizKey,
} from "../data/ragDataVisualization.js";
import {
  addThreat,
  getThreatsSnapshotVersion,
  subscribeThreats,
  threats,
} from "../data/threats.js";
import { getAssetById } from "../data/assets.js";
import { getUserById, joinUserFullNames } from "../data/users.js";
import type { FivePointScaleLabel } from "../data/types.js";
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
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface AssetCriticalityCounts {
  veryHigh: number;
  high: number;
  medium: number;
  low: number;
  veryLow: number;
}

const CRITICALITY_LEVELS: { key: keyof AssetCriticalityCounts; label: FivePointScaleLabel }[] = [
  { key: "veryHigh", label: "Very high" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
  { key: "veryLow", label: "Very low" },
];

function countLinkedAssetsByCriticality(assetIds: string[]): AssetCriticalityCounts {
  const counts: AssetCriticalityCounts = {
    veryHigh: 0,
    high: 0,
    medium: 0,
    low: 0,
    veryLow: 0,
  };
  for (const aid of assetIds) {
    const asset = getAssetById(aid);
    if (!asset) continue;
    switch (asset.criticality) {
      case 5:
        counts.veryHigh += 1;
        break;
      case 4:
        counts.high += 1;
        break;
      case 3:
        counts.medium += 1;
        break;
      case 2:
        counts.low += 1;
        break;
      case 1:
        counts.veryLow += 1;
        break;
      default:
        break;
    }
  }
  return counts;
}

interface ThreatRow {
  id: string;
  name: string;
  threatId: string;
  criticality: number;
  assessments: number;
  aggregatedAssets: number;
  assetsByCriticality: AssetCriticalityCounts;
  vulnerabilities: number;
  threatDomain: string;
  created: string;
  createdBy: string;
  createdByInitials: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  lastUpdatedByInitials: string;
}

function buildThreatRows(): ThreatRow[] {
  return threats.map((t, i) => {
    const owner = getUserById(t.ownerIds[0] ?? "");
    const seed = i + 1;
    const assessments = Math.floor(seededRandom(seed * 19) * 8) + 1;
    const assetsByCriticality = countLinkedAssetsByCriticality(t.assetIds);

    return {
      id: t.id,
      name: t.name,
      threatId: t.id,
      criticality: 0,
      assessments,
      aggregatedAssets: t.assetIds.length,
      assetsByCriticality,
      vulnerabilities: t.vulnerabilityIds.length,
      threatDomain: t.domain,
      created: "23 Jan 2025",
      createdBy: joinUserFullNames(t.ownerIds),
      createdByInitials: owner?.initials ?? "",
      lastUpdated: "23 Jan 2025",
      lastUpdatedBy: owner?.fullName ?? "Unassigned",
      lastUpdatedByInitials: owner?.initials ?? "",
    };
  });
}

function aggregateSeverityFromThreats(): {
  veryLow: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
} {
  const buckets = { veryLow: 0, low: 0, medium: 0, high: 0, veryHigh: 0 };
  threats.forEach((_, i) => {
    const score = Math.floor(seededRandom((i + 1) * 41) * 5) + 1;
    if (score === 1) buckets.veryLow += 1;
    else if (score === 2) buckets.low += 1;
    else if (score === 3) buckets.medium += 1;
    else if (score === 4) buckets.high += 1;
    else buckets.veryHigh += 1;
  });
  return buckets;
}

function aggregateTop5ThreatDomains(): { label: string; value: number }[] {
  const counts: Record<string, number> = {};
  for (const t of threats) {
    counts[t.domain] = (counts[t.domain] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
}

const THREAT_SEVERITY_CHART_RAG: RagDataVizKey[] = ["pos05", "pos04", "neu03", "neg03", "neg05"];

function ThreatsBySeverityCard({ catalogVersion }: { catalogVersion: number }) {
  const { tokens } = useTheme();
  const severityData = useMemo(() => aggregateSeverityFromThreats(), [catalogVersion]);

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

function Top5ThreatDomainsCard({ catalogVersion }: { catalogVersion: number }) {
  const { tokens } = useTheme();
  const domainBars = useMemo(() => aggregateTop5ThreatDomains(), [catalogVersion]);
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

function AssetsByCriticalityTags({ counts }: { counts: AssetCriticalityCounts }) {
  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap" useFlexGap>
      {CRITICALITY_LEVELS.map(({ key, label }) => {
        const n = counts[key];
        if (n === 0) return null;
        return (
          <Box
            key={key}
            sx={({ tokens: t }) => ({
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.5,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: t.semantic.color.background.container.value,
            })}
          >
            <Typography variant="textSm" sx={{ fontSize: 11 }}>
              {label}
            </Typography>
            <Typography variant="textSm" sx={{ fontSize: 11, fontWeight: 600 }}>
              {n}
            </Typography>
          </Box>
        );
      })}
    </Stack>
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

function CustomToolbar() {
  return (
    <Toolbar>
      <QuickFilter expanded>
        <QuickFilterControl
          render={({ ref, value, ...other }) => (
            <TextField
              {...other}
              inputRef={ref}
              value={value ?? ""}
              placeholder="Search by"
              size="small"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  ...other.slotProps?.input,
                },
                ...other.slotProps,
              }}
            />
          )}
        />
      </QuickFilter>
      <FilterPanelTrigger
        render={(props) => (
          <Button {...props} startIcon={<FilterIcon />} aria-label="Show filters">
            Filter
          </Button>
        )}
      />
      <ColumnsPanelTrigger
        render={(props) => (
          <Button {...props} startIcon={<ColumnsIcon />} aria-label="Select columns">
            Columns
          </Button>
        )}
      />
    </Toolbar>
  );
}

function ThreatsDataGrid({ rows }: { rows: ThreatRow[] }) {
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
      field: "criticality",
      headerName: "Assets by criticality",
      flex: 1,
      minWidth: 260,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <AssetsByCriticalityTags counts={params.row.assetsByCriticality} />
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
          toolbar: CustomToolbar,
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
  const catalogVersion = useSyncExternalStore(
    subscribeThreats,
    getThreatsSnapshotVersion,
    () => 0,
  );
  const threatRows = useMemo(() => buildThreatRows(), [catalogVersion]);

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
            <ThreatsBySeverityCard catalogVersion={catalogVersion} />
            <Top5ThreatDomainsCard catalogVersion={catalogVersion} />
          </Stack>
        </Box>

        <ThreatsDataGrid rows={threatRows} />
      </Stack>
    </Container>
  );
}
