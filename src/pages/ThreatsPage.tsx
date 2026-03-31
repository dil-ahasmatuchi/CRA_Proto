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
import { useMemo } from "react";
import { NavLink } from "react-router";

import {
  ragDataVizColor,
  resolveColorForCanvas,
  RAG_DATA_VIZ_CANVAS_FALLBACK,
  type RagDataVizKey,
} from "../data/ragDataVisualization.js";
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

interface ThreatRow {
  id: number;
  name: string;
  threatId: string;
  threatIntel: number;
  assessments: number;
  aggregatedAssets: number;
  veryHigh: number;
  high: number;
  medium: number;
  vulnerabilities: number;
  threatDomain: string;
  created: string;
  createdBy: string;
  createdByInitials: string;
  lastUpdated: string;
  lastUpdatedBy: string;
  lastUpdatedByInitials: string;
}

const threatRows: ThreatRow[] = [
  {
    id: 1,
    name: "Theft of digital identity or credentials",
    threatId: "THR-001",
    threatIntel: 522,
    assessments: 2,
    aggregatedAssets: 492,
    veryHigh: 160,
    high: 240,
    medium: 92,
    vulnerabilities: 57,
    threatDomain: "Human actions",
    created: "23 Jan 2025",
    createdBy: "User name",
    createdByInitials: "AB",
    lastUpdated: "23 Jan 2025",
    lastUpdatedBy: "User name",
    lastUpdatedByInitials: "AB",
  },
  {
    id: 2,
    name: "Social Engineering",
    threatId: "THR-001",
    threatIntel: 483,
    assessments: 4,
    aggregatedAssets: 357,
    veryHigh: 100,
    high: 220,
    medium: 37,
    vulnerabilities: 63,
    threatDomain: "Human actions",
    created: "23 Jan 2025",
    createdBy: "User name",
    createdByInitials: "AB",
    lastUpdated: "23 Jan 2025",
    lastUpdatedBy: "User name",
    lastUpdatedByInitials: "AB",
  },
  {
    id: 3,
    name: "Interception of radiation of a device",
    threatId: "THR-001",
    threatIntel: 591,
    assessments: 5,
    aggregatedAssets: 429,
    veryHigh: 201,
    high: 208,
    medium: 20,
    vulnerabilities: 28,
    threatDomain: "Human actions",
    created: "23 Jan 2025",
    createdBy: "User name",
    createdByInitials: "AB",
    lastUpdated: "23 Jan 2025",
    lastUpdatedBy: "User name",
    lastUpdatedByInitials: "AB",
  },
  {
    id: 4,
    name: "Remote spying",
    threatId: "THR-001",
    threatIntel: 333,
    assessments: 1,
    aggregatedAssets: 299,
    veryHigh: 50,
    high: 150,
    medium: 99,
    vulnerabilities: 75,
    threatDomain: "Human actions",
    created: "23 Jan 2025",
    createdBy: "User name",
    createdByInitials: "AB",
    lastUpdated: "23 Jan 2025",
    lastUpdatedBy: "User name",
    lastUpdatedByInitials: "AB",
  },
  {
    id: 5,
    name: "Theft of media or documents",
    threatId: "THR-001",
    threatIntel: 507,
    assessments: 2,
    aggregatedAssets: 388,
    veryHigh: 208,
    high: 80,
    medium: 100,
    vulnerabilities: 49,
    threatDomain: "Human actions",
    created: "23 Jan 2025",
    createdBy: "User name",
    createdByInitials: "AB",
    lastUpdated: "23 Jan 2025",
    lastUpdatedBy: "User name",
    lastUpdatedByInitials: "AB",
  },
];

const severityData = {
  veryLow: 4,
  low: 26,
  medium: 46,
  high: 210,
  veryHigh: 38,
};

const barChartData = {
  labels: ["1", "2", "3", "4", "5"],
  domains: [
    { label: "Human actions", value: 350 },
    { label: "Compromise of functions or services", value: 325 },
    { label: "Physical threats", value: 290 },
    { label: "Organizational threats", value: 240 },
    { label: "Infrastructure failures", value: 165 },
  ],
};

const THREAT_SEVERITY_CHART_RAG: RagDataVizKey[] = ["pos05", "pos04", "neu03", "neg03", "neg05"];

function ThreatsBySeverityCard() {
  const { tokens } = useTheme();
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

function Top5ThreatDomainsCard() {
  const { tokens } = useTheme();

  const barColors = ["#e22e33", "#dc5731", "#d4732e", "#cb8b2b", "#bfa126"];

  const chartData = {
    labels: barChartData.labels,
    datasets: [
      {
        data: barChartData.domains.map((d) => d.value),
        backgroundColor: barColors,
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
            Top 5 threat domains by no. of threats
          </Typography>
        }
        action={
          <Button variant="text" size="small" aria-label="More options for top 5 threat domains">
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
                  max: 400,
                  ticks: {
                    stepSize: 50,
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

        <Stack gap={1}>
          <Stack direction="row" gap={2}>
            <Stack direction="row" gap={0.5} flex={1} alignItems="baseline">
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                1
              </Typography>
              <Typography variant="labelXs" sx={{ fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {barChartData.domains[0].label}
                </Link>
              </Typography>
            </Stack>
            <Stack direction="row" gap={0.5} flex={1} alignItems="baseline">
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                4
              </Typography>
              <Typography variant="labelXs" sx={{ fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {barChartData.domains[3].label}
                </Link>
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" gap={2}>
            <Stack direction="row" gap={0.5} flex={1} alignItems="baseline">
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                2
              </Typography>
              <Typography variant="labelXs" sx={{ fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {barChartData.domains[1].label}
                </Link>
              </Typography>
            </Stack>
            <Stack direction="row" gap={0.5} flex={1} alignItems="baseline">
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                5
              </Typography>
              <Typography variant="labelXs" sx={{ fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {barChartData.domains[4].label}
                </Link>
              </Typography>
            </Stack>
          </Stack>
          <Stack direction="row" gap={2}>
            <Stack direction="row" gap={0.5} flex={1} alignItems="baseline">
              <Typography
                variant="labelXs"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                3
              </Typography>
              <Typography variant="labelXs" sx={{ fontWeight: 600 }}>
                <Link href="#" underline="hover">
                  {barChartData.domains[2].label}
                </Link>
              </Typography>
            </Stack>
            <Box flex={1} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CriticalityTags({ veryHigh, high, medium }: { veryHigh: number; high: number; medium: number }) {
  return (
    <Stack direction="row" gap={0.5} flexWrap="wrap">
      <Box
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
        <Typography variant="textSm" sx={{ fontSize: 11 }}>Very high</Typography>
        <Typography variant="textSm" sx={{ fontSize: 11, fontWeight: 600 }}>{veryHigh}</Typography>
      </Box>
      <Box
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
        <Typography variant="textSm" sx={{ fontSize: 11 }}>High</Typography>
        <Typography variant="textSm" sx={{ fontSize: 11, fontWeight: 600 }}>{high}</Typography>
      </Box>
      <Box
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
        <Typography variant="textSm" sx={{ fontSize: 11 }}>Medium</Typography>
        <Typography variant="textSm" sx={{ fontSize: 11, fontWeight: 600 }}>{medium}</Typography>
      </Box>
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

function ThreatsDataGrid() {
  const columns: GridColDef<ThreatRow>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
          {params.value}
        </Link>
      ),
    },
    {
      field: "threatId",
      headerName: "ID",
      width: 100,
    },
    {
      field: "aggregatedAssets",
      headerName: "Aggregated assets",
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
      headerName: "Aggregated assets by criticality",
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<ThreatRow>) => (
        <CriticalityTags
          veryHigh={params.row.veryHigh}
          high={params.row.high}
          medium={params.row.medium}
        />
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
      headerName: "Threat domain",
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
        rows={threatRows}
        columns={columns}
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
            <Button variant="contained">Add threats</Button>
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
            <ThreatsBySeverityCard />
            <Top5ThreatDomainsCard />
          </Stack>
        </Box>

        <ThreatsDataGrid />
      </Stack>
    </Container>
  );
}
