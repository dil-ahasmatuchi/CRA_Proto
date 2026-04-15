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
import { NavLink } from "react-router";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";

import AssessmentStatus, {
  assessmentStatusColorForCanvas,
} from "../components/AssessmentStatus.js";
import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";
import { riskAssessments } from "../data/riskAssessments.js";
import { getUserById } from "../data/users.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AssessmentRow {
  id: string;
  assessmentId: string;
  name: string;
  status: AssessmentStatusValue;
  cyberRisks: number;
  assets: number;
  threats: number;
  vulnerabilities: number;
  scenarios: number;
  owner: string;
  ownerInitials: string;
}

const assessmentRows: AssessmentRow[] = riskAssessments.map((a) => {
  const u = getUserById(a.ownerId);
  return {
    id: a.id,
    assessmentId: a.id,
    name: a.name,
    status: a.status,
    cyberRisks: a.cyberRiskIds.length,
    assets: a.assetIds.length,
    threats: a.threatIds.length,
    vulnerabilities: a.vulnerabilityIds.length,
    scenarios: a.scenarioIds.length,
    owner: u?.fullName ?? "—",
    ownerInitials: u?.initials ?? "—",
  };
});

const statusData = {
  draft: assessmentRows.filter((r) => r.status === "Draft").length,
  scoping: assessmentRows.filter((r) => r.status === "Scoping").length,
  inProgress: assessmentRows.filter((r) => r.status === "Scoring").length,
  approved: assessmentRows.filter((r) => r.status === "Approved").length,
  overdue: assessmentRows.filter((r) => r.status === "Overdue").length,
};

const STATUS_CHART_ORDER: AssessmentStatusValue[] = [
  "Draft",
  "Scoping",
  "Scoring",
  "Approved",
  "Overdue",
];

function countForAssessmentStatus(status: AssessmentStatusValue): number {
  switch (status) {
    case "Draft":
      return statusData.draft;
    case "Scoping":
      return statusData.scoping;
    case "Scoring":
      return statusData.inProgress;
    case "Approved":
      return statusData.approved;
    case "Overdue":
      return statusData.overdue;
  }
}

/** Figma: Assessments by business unit — moss scale + orange for zero-coverage BU */
const businessUnitData = [
  { label: "Information Technology", value: 3, color: "#00894f" },
  { label: "Finance & Accounting", value: 2, color: "#00a661" },
  { label: "Operations", value: 2, color: "#2ec377" },
  { label: "Human Resources", value: 2, color: "#53df90" },
  { label: "Legal & Compliance", value: 1, color: "#72fcaa" },
  { label: "Sales & Marketing", value: 0, color: "#ffb780" },
];

const BUSINESS_UNIT_COUNT = businessUnitData.length;

function AssessmentsByStatusCard() {
  const { tokens } = useTheme();

  const total =
    statusData.draft +
    statusData.scoping +
    statusData.inProgress +
    statusData.approved +
    statusData.overdue;

  const legendItems = STATUS_CHART_ORDER.map((status) => ({
    label: status,
    value: countForAssessmentStatus(status),
    color: assessmentStatusColorForCanvas(status, tokens),
  }));

  const chartData = {
    labels: [...STATUS_CHART_ORDER],
    datasets: [
      {
        data: legendItems.map((item) => item.value),
        backgroundColor: legendItems.map((item) => item.color),
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  return (
    <Card sx={{ flex: "0 1 360px", minWidth: 280, border: "none" }}>
      <CardHeader
        title={
          <Typography variant="h4" component="h3" fontWeight="600">
            Assessments by status
          </Typography>
        }
        action={
          <Button variant="text" size="small" aria-label="More options for assessments by status">
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
          gap: "51px",
          height: "100%",
          pt: 0,
        }}
      >
        <Box sx={{ position: "relative", width: 256, height: 256 }}>
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
              {total}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.muted.value,
                lineHeight: "24px",
                letterSpacing: "0.2px",
              })}
            >
              Assessments
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            columnGap: 2,
            rowGap: 2,
            width: "100%",
          }}
        >
          {legendItems.map((item) => (
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

function AssessmentCoverageCard() {
  const chartData = {
    labels: businessUnitData.map((bu) => bu.label),
    datasets: [
      {
        data: businessUnitData.map((bu) => bu.value),
        backgroundColor: businessUnitData.map((bu) => bu.color),
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  return (
    <Card
      sx={({ tokens: t }) => ({
        flex: 1,
        minWidth: 0,
        width: "100%",
        border: "none",
        backgroundColor: t.semantic.color.background.base.value,
        borderRadius: "16px",
        boxShadow: "none",
      })}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          height: "100%",
          minHeight: 474,
          p: 3,
          pt: 0,
          "&:last-child": { pb: 3 },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ width: "100%", minHeight: 28 }}
        >
          <Typography variant="h4" component="h3" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
            Assessments by business unit
          </Typography>
          <Button
            variant="text"
            size="small"
            aria-label="More options for assessments by business unit"
            sx={{ flexShrink: 0, p: 0.5, minWidth: 0 }}
          >
            <MoreIcon aria-hidden />
          </Button>
        </Stack>

        <Box
          sx={{
            position: "relative",
            flex: "1 1 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 260,
            width: "100%",
          }}
        >
          <Box sx={{ position: "relative", width: 256, height: 256 }}>
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
                {BUSINESS_UNIT_COUNT}
              </Typography>
              <Typography
                variant="body1"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                  lineHeight: "24px",
                  letterSpacing: "0.2px",
                })}
              >
                Business units
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gridTemplateRows: "repeat(2, auto)",
            columnGap: 2,
            rowGap: 2,
            width: "100%",
          }}
        >
          {businessUnitData.map((item) => (
            <Stack key={item.label} gap={0} alignItems="flex-start">
              <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
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
                    letterSpacing: "0.3px",
                    lineHeight: "16px",
                  })}
                >
                  {item.label}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" sx={{ pl: 3, pt: 0 }}>
                <Link
                  href="#"
                  underline="always"
                  sx={({ tokens: t }) => ({
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "0.2px",
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  {item.value}
                </Link>
              </Stack>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function StatusCell({ status }: { status: AssessmentRow["status"] }) {
  return <AssessmentStatus status={status} />;
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Avatar {...getAvatarProps({ size: "small", color: "blue" })}>{initials}</Avatar>
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
              label="Search by"
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

function AssessmentsDataGrid() {
  const columns: GridColDef<AssessmentRow>[] = [
    {
      field: "assessmentId",
      headerName: "ID",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 280,
      renderCell: (params: GridRenderCellParams<AssessmentRow>) => (
        <Typography
          component={NavLink}
          to={`/cyber-risk/cyber-risk-assessments/${params.row.assessmentId}`}
          variant="textMd"
          sx={({ tokens: t }) => ({
            color: t.semantic.color.accent.blue.content.value,
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "2px",
            "&:hover": {
              color: t.semantic.color.type.default.value,
            },
          })}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 140,
      renderCell: (params: GridRenderCellParams<AssessmentRow>) => (
        <StatusCell status={params.value as AssessmentRow["status"]} />
      ),
    },
    {
      field: "cyberRisks",
      headerName: "Cyber risks",
      width: 110,
      type: "number",
    },
    {
      field: "assets",
      headerName: "Assets",
      width: 90,
      type: "number",
    },
    {
      field: "threats",
      headerName: "Threats",
      width: 90,
      type: "number",
    },
    {
      field: "vulnerabilities",
      headerName: "Vulnerabilities",
      width: 120,
      type: "number",
    },
    {
      field: "scenarios",
      headerName: "Scenarios",
      width: 100,
      type: "number",
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 220,
      renderCell: (params: GridRenderCellParams<AssessmentRow>) => (
        <OwnerCell name={params.row.owner} initials={params.row.ownerInitials} />
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={assessmentRows}
        columns={columns}
        pagination
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        showToolbar
        slots={{ toolbar: CustomToolbar }}
        slotProps={{
          main: {
            "aria-label":
              "Cyber risk assessments table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
          },
          basePagination: {
            material: { labelRowsPerPage: "Rows" },
          },
        }}
        sx={{ border: 0 }}
      />
    </Box>
  );
}

export default function AssessmentsPage() {
  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={6}>
        <PageHeader
          pageTitle="Cyber risk assessments"
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset manager</span>}
              items={[
                {
                  id: "assessments",
                  label: "Cyber risk assessments",
                  url: "/cyber-risk/cyber-risk-assessments",
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
              component={NavLink}
              to="/cyber-risk/cyber-risk-assessments/new"
            >
              New cyber risk assessment
            </Button>
          }
        />

        <Box
          sx={({ tokens }) => ({
            backgroundColor: tokens.semantic.color.background.container.value,
            borderRadius: 2,
            p: 3,
          })}
        >
          <Stack direction="row" gap={3} sx={{ minHeight: 460, width: "100%" }}>
            <AssessmentsByStatusCard />
            <AssessmentCoverageCard />
          </Stack>
        </Box>

        <AssessmentsDataGrid />
      </Stack>
    </Container>
  );
}
