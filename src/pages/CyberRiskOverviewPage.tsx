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
  useTheme,
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

import { type RiskHeatmapLevel } from "../data/ragDataVisualization.js";
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
    title: "Overall\ncyber risk score",
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
// Top 5 critical assets data
// ---------------------------------------------------------------------------

interface CriticalAssetRow {
  id: number;
  assetName: string;
  assetType: string;
  criticality: "High" | "Very high";
  vulnerabilities: number;
  findings: number;
  cyberRiskScore: string;
  status: "At risk" | "Remediation in progress";
}

const criticalAssetRows: CriticalAssetRow[] = [
  {
    id: 1,
    assetName: "Vendor master database",
    assetType: "Database",
    criticality: "High",
    vulnerabilities: 3,
    findings: 5,
    cyberRiskScore: "5 \u2013 Very high",
    status: "At risk",
  },
  {
    id: 2,
    assetName: "ERP system administrator credentials",
    assetType: "Infrastructure",
    criticality: "High",
    vulnerabilities: 6,
    findings: 3,
    cyberRiskScore: "5 \u2013 Very high",
    status: "At risk",
  },
  {
    id: 3,
    assetName: "Purchase order approval matrix",
    assetType: "Infrastructure",
    criticality: "High",
    vulnerabilities: 1,
    findings: 2,
    cyberRiskScore: "5 \u2013 Very high",
    status: "Remediation in progress",
  },
  {
    id: 4,
    assetName: "Inventory management database",
    assetType: "Database",
    criticality: "Very high",
    vulnerabilities: 2,
    findings: 5,
    cyberRiskScore: "5 \u2013 Very high",
    status: "Remediation in progress",
  },
  {
    id: 5,
    assetName: "Payment gateway API",
    assetType: "API",
    criticality: "Very high",
    vulnerabilities: 1,
    findings: 3,
    cyberRiskScore: "5 \u2013 Very high",
    status: "At risk",
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

function CriticalityCell({ value }: { value: CriticalAssetRow["criticality"] }) {
  const { presets } = useTheme();
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator;

  return (
    <StatusIndicator
      label={value}
      customColor={() => ({
        backgroundColor: value === "Very high" ? "#d32f2f" : "#ef6c00",
        color: "#fff",
      })}
    />
  );
}

function CyberRiskScoreCell({ value }: { value: string }) {
  const { presets } = useTheme();
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator;

  return (
    <StatusIndicator
      label={value}
      customColor={() => ({
        backgroundColor: "#d32f2f",
        color: "#fff",
      })}
    />
  );
}

function AssetStatusCell({ value }: { value: CriticalAssetRow["status"] }) {
  const { presets } = useTheme();
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator;

  const isAtRisk = value === "At risk";

  return (
    <StatusIndicator
      label={value}
      customColor={() => ({
        backgroundColor: isAtRisk ? "#d32f2f" : "#ef6c00",
        color: "#fff",
      })}
    />
  );
}

function TopCriticalAssetsTable() {
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
      width: 130,
      renderCell: (params: GridRenderCellParams<CriticalAssetRow>) => (
        <CriticalityCell
          value={params.value as CriticalAssetRow["criticality"]}
        />
      ),
    },
    {
      field: "vulnerabilities",
      headerName: "Vulnerabilities",
      width: 130,
      type: "number",
    },
    {
      field: "findings",
      headerName: "Findings",
      width: 100,
      type: "number",
    },
    {
      field: "cyberRiskScore",
      headerName: "Cyber risk score",
      width: 160,
      renderCell: (params: GridRenderCellParams<CriticalAssetRow>) => (
        <CyberRiskScoreCell value={params.value as string} />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 200,
      renderCell: (params: GridRenderCellParams<CriticalAssetRow>) => (
        <AssetStatusCell
          value={params.value as CriticalAssetRow["status"]}
        />
      ),
    },
  ];

  return (
    <Stack gap={2}>
      <Typography variant="h4" component="h2" fontWeight={600}>
        Top 5 critical assets
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
                "Top 5 critical assets table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
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

export default function CyberRiskOverviewPage() {
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

        {/* Top 5 critical assets */}
        <TopCriticalAssetsTable />
      </Stack>
    </Container>
  );
}
