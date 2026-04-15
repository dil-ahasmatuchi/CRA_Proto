import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { NavLink } from "react-router";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import ArrowUpIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowUp";
import ArrowDownIcon from "@diligentcorp/atlas-react-bundle/icons/ArrowDown";
import DownloadIcon from "@diligentcorp/atlas-react-bundle/icons/Download";

import { type RiskHeatmapLevel, ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";
import ResidualRisksMatrix from "../components/ResidualRisksMatrix.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// ---------------------------------------------------------------------------
// KPI data
// ---------------------------------------------------------------------------

interface KpiItem {
  title: string;
  value: string;
  trend: "increasing" | "decreasing";
  trendLabel: string;
  trendSentiment: "positive" | "negative";
}

const kpiItems: KpiItem[] = [
  {
    title: "Overall cyber risk score",
    value: "95 - High",
    trend: "increasing",
    trendLabel: "Increasing",
    trendSentiment: "negative",
  },
  {
    title: "Critical assets",
    value: "122",
    trend: "increasing",
    trendLabel: "Increasing",
    trendSentiment: "negative",
  },
  {
    title: "Critical risks",
    value: "24",
    trend: "decreasing",
    trendLabel: "Decreasing",
    trendSentiment: "positive",
  },
  {
    title: "Treatment progress",
    value: "24 %",
    trend: "increasing",
    trendLabel: "Increasing",
    trendSentiment: "positive",
  },
];

// ---------------------------------------------------------------------------
// Residual risks heat map data (5 x 5, Likelihood vs Impact)
// ---------------------------------------------------------------------------

const heatmapGrid: number[][] = [
  [12, 10, 9, 8, 7],
  [11, 9, 7, 6, 5],
  [10, 8, 8, 5, 7],
  [14, 9, 7, 6, 6],
  [16, 12, 9, 7, 8],
];

const heatmapLegend: { label: string; level: RiskHeatmapLevel; count: number }[] = [
  { label: "101\u2013125 Very high", level: "veryHigh", count: 20 },
  { label: "76\u2013100 High", level: "high", count: 40 },
  { label: "51\u201375 Medium", level: "medium", count: 48 },
  { label: "26\u201350 Low", level: "low", count: 66 },
  { label: "1\u201325 Very low", level: "veryLow", count: 42 },
];

// ---------------------------------------------------------------------------
// Risk treatment status donut data
// ---------------------------------------------------------------------------

const TREATMENT_COLORS = {
  open: "#c6c6c9",
  inProgress: "#0086fa",
  completed: "#7cb342",
  overdue: "#ef5350",
};

const treatmentData = [
  { label: "Open", value: 10, color: TREATMENT_COLORS.open },
  { label: "In progress", value: 45, color: TREATMENT_COLORS.inProgress },
  { label: "Completed", value: 20, color: TREATMENT_COLORS.completed },
  { label: "Overdue", value: 8, color: TREATMENT_COLORS.overdue },
];

const treatmentTotal = treatmentData.reduce((sum, d) => sum + d.value, 0);

// ---------------------------------------------------------------------------
// Most exposed assets data
// ---------------------------------------------------------------------------

type ScoreChip = { numeric: string; label: string; rag: RagDataVizKey };

interface CriticalAssetRow {
  id: number;
  assetName: string;
  assetType: string;
  criticality: ScoreChip;
  vulnerabilities: number;
  threats: number;
  cyberRiskScore: ScoreChip;
}

const criticalAssetRows: CriticalAssetRow[] = [
  {
    id: 1,
    assetName: "Customer database",
    assetType: "Database",
    criticality: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerabilities: 4,
    threats: 6,
    cyberRiskScore: { numeric: "115", label: "Very high", rag: "neg05" },
  },
  {
    id: 2,
    assetName: "ERP system",
    assetType: "Application",
    criticality: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerabilities: 6,
    threats: 3,
    cyberRiskScore: { numeric: "110", label: "Very high", rag: "neg05" },
  },
  {
    id: 3,
    assetName: "Inventory management database",
    assetType: "Database",
    criticality: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerabilities: 2,
    threats: 5,
    cyberRiskScore: { numeric: "105", label: "Very high", rag: "neg05" },
  },
  {
    id: 4,
    assetName: "Payment gateway",
    assetType: "Application",
    criticality: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerabilities: 1,
    threats: 3,
    cyberRiskScore: { numeric: "100", label: "High", rag: "neg03" },
  },
  {
    id: 5,
    assetName: "Vendor master database",
    assetType: "Database",
    criticality: { numeric: "4", label: "High", rag: "neg03" },
    vulnerabilities: 3,
    threats: 5,
    cyberRiskScore: { numeric: "95", label: "High", rag: "neg03" },
  },
  {
    id: 6,
    assetName: "Active Directory server",
    assetType: "Server",
    criticality: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerabilities: 5,
    threats: 3,
    cyberRiskScore: { numeric: "90", label: "High", rag: "neg03" },
  },
  {
    id: 7,
    assetName: "Email server",
    assetType: "Server",
    criticality: { numeric: "4", label: "High", rag: "neg03" },
    vulnerabilities: 3,
    threats: 4,
    cyberRiskScore: { numeric: "80", label: "High", rag: "neg03" },
  },
  {
    id: 8,
    assetName: "Purchase order approval system",
    assetType: "Application",
    criticality: { numeric: "4", label: "High", rag: "neg03" },
    vulnerabilities: 1,
    threats: 2,
    cyberRiskScore: { numeric: "72", label: "Medium", rag: "neu03" },
  },
  {
    id: 9,
    assetName: "Financial reporting platform",
    assetType: "Application",
    criticality: { numeric: "4", label: "High", rag: "neg03" },
    vulnerabilities: 3,
    threats: 4,
    cyberRiskScore: { numeric: "68", label: "Medium", rag: "neu03" },
  },
  {
    id: 10,
    assetName: "Cloud storage service",
    assetType: "Cloud service",
    criticality: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerabilities: 2,
    threats: 2,
    cyberRiskScore: { numeric: "55", label: "Medium", rag: "neu03" },
  },
];

// ===========================================================================
// Sub-components
// ===========================================================================

function KpiCard({ item }: { item: KpiItem }) {
  const isPositive = item.trendSentiment === "positive";
  const trendColor = isPositive ? "#388e3c" : "#d32f2f";

  return (
    <Card sx={{ flex: 1, minWidth: 0 }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography
          sx={({ tokens: t }) => ({
            fontFamily: t.semantic.font.title.h4Md.fontFamily.value,
            fontSize: t.semantic.font.title.h4Md.fontSize.value,
            lineHeight: t.semantic.font.title.h4Md.lineHeight.value,
            letterSpacing: t.semantic.font.title.h4Md.letterSpacing.value,
            fontWeight: t.semantic.fontWeight.emphasis.value,
            color: t.semantic.color.type.default.value,
            whiteSpace: "pre-line",
            minHeight: 40,
          })}
        >
          {item.title}
        </Typography>
        <Typography
          variant="h2"
          component="p"
          sx={({ tokens: t }) => ({
            color: t.semantic.color.type.default.value,
            fontWeight: 600,
          })}
        >
          {item.value}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          gap={0.5}
          sx={{ minHeight: 24 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              flexShrink: 0,
              overflow: "visible",
              color: trendColor,
              "& svg": {
                width: 24,
                height: 24,
                display: "block",
              },
            }}
          >
            {item.trend === "increasing" ? (
              <ArrowUpIcon aria-hidden />
            ) : (
              <ArrowDownIcon aria-hidden />
            )}
          </Box>
          <Typography
            variant="textSm"
            sx={{ color: trendColor, lineHeight: "24px" }}
          >
            {item.trendLabel}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RiskTreatmentStatusCard() {
  const chartData = {
    labels: treatmentData.map((d) => d.label),
    datasets: [
      {
        data: treatmentData.map((d) => d.value),
        backgroundColor: treatmentData.map((d) => d.color),
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  return (
    <Card sx={{ flex: 2, minWidth: 0 }}>
      <CardHeader
        title={
          <Typography variant="h4" component="h2" fontWeight={600}>
            Risk treatment status
          </Typography>
        }
        action={
          <Button
            variant="text"
            size="small"
            aria-label="More options for risk treatment status"
          >
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
          gap: ({ spacing }) => spacing(3.75),
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              component="span"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.default.value,
                fontWeight: 400,
                fontSize: 26,
                lineHeight: "34px",
              })}
            >
              {treatmentTotal}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.muted.value,
                lineHeight: "24px",
                letterSpacing: "0.2px",
              })}
            >
              Mitigation plans
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            columnGap: 2,
            rowGap: 2,
            width: "100%",
          }}
        >
          {treatmentData.map((item) => (
            <Stack key={item.label} gap={0}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 0.5,
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
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
              <Typography variant="textMd" sx={{ pl: 3, fontWeight: 600 }}>
                {item.value}
              </Typography>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function ScoreChipCell({ value }: { value: ScoreChip }) {
  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
      <Box
        sx={({ tokens: t }) => ({
          width: 16,
          height: 16,
          borderRadius: t.semantic.radius.sm.value,
          flexShrink: 0,
          bgcolor: ragDataVizColor(t, value.rag),
        })}
      />
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.label.xs.fontSize.value,
          lineHeight: t.semantic.font.label.xs.lineHeight.value,
          letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
          fontFamily: t.semantic.font.label.xs.fontFamily.value,
          fontWeight: t.semantic.font.label.xs.fontWeight.value,
          color: t.semantic.color.type.default.value,
          whiteSpace: "nowrap",
        })}
      >
        {value.numeric} - {value.label}
      </Typography>
    </Stack>
  );
}

function MostExposedAssetsTable() {
  const columns: GridColDef<CriticalAssetRow>[] = [
    {
      field: "assetName",
      headerName: "Asset name",
      flex: 1,
      minWidth: 240,
      renderCell: (params: GridRenderCellParams<CriticalAssetRow>) => (
        <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
          {params.value}
        </Link>
      ),
    },
    {
      field: "assetType",
      headerName: "Asset type",
      width: 140,
    },
    {
      field: "criticality",
      headerName: "Criticality",
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CriticalAssetRow>) => (
        <ScoreChipCell value={params.row.criticality} />
      ),
    },
    {
      field: "vulnerabilities",
      headerName: "Vulnerabilities",
      width: 130,
      type: "number",
    },
    {
      field: "threats",
      headerName: "Threats",
      width: 100,
      type: "number",
    },
    {
      field: "cyberRiskScore",
      headerName: "Cyber risk score",
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<CriticalAssetRow>) => (
        <ScoreChipCell value={params.row.cyberRiskScore} />
      ),
    },
  ];

  return (
    <Stack gap={2}>
      <Typography variant="h4" component="h2" fontWeight={600}>
        Most exposed assets
      </Typography>
      <Box sx={{ width: "100%" }}>
        <DataGridPro
          rows={criticalAssetRows}
          columns={columns}
          disableRowSelectionOnClick
          hideFooter
          slotProps={{
            main: {
              "aria-label":
                "Most exposed assets table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
            },
          }}
          sx={{ border: 0 }}
        />
      </Box>
    </Stack>
  );
}

// ===========================================================================
// Page
// ===========================================================================

export default function OverviewPage() {
  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
        <PageHeader
          pageTitle="Cyber risk management overview"
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
                  id: "overview",
                  label: "Overview",
                  url: "/cyber-risk/overview",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
          moreButton={
            <Button
              variant="contained"
              color="primary"
              size="medium"
              startIcon={<DownloadIcon aria-hidden />}
              aria-label="Export cyber risk management overview"
            >
              Export
            </Button>
          }
        />

        {/* KPI summary cards */}
        <Stack direction="row" gap={2}>
          {kpiItems.map((item) => (
            <KpiCard key={item.title} item={item} />
          ))}
        </Stack>

        {/* Heat map + donut row */}
        <Stack direction="row" gap={3} sx={{ alignItems: "stretch" }}>
          <ResidualRisksMatrix
            title="Residual risks"
            grid={heatmapGrid}
            legend={heatmapLegend}
            sx={{ flex: 3, minWidth: 0 }}
          />
          <RiskTreatmentStatusCard />
        </Stack>

        {/* Most exposed assets */}
        <MostExposedAssetsTable />
      </Stack>
    </Container>
  );
}
