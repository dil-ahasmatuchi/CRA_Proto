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

ChartJS.register(ArcElement, Tooltip, Legend);

interface AssessmentRow {
  id: number;
  assessmentId: string;
  name: string;
  status: "Draft" | "In progress" | "Concluded";
  cyberRisks: number;
  assets: number;
  threats: number;
  vulnerabilities: number;
  scenarios: number;
  owner: string;
  ownerInitials: string;
}

const assessmentRows: AssessmentRow[] = [
  {
    id: 1,
    assessmentId: "CRA-001",
    name: "Cyber risk assessment Q1 - 2026",
    status: "In progress",
    cyberRisks: 4,
    assets: 18,
    threats: 3,
    vulnerabilities: 5,
    scenarios: 2,
    owner: "Alexandru Hasmatuchi",
    ownerInitials: "AH",
  },
  {
    id: 2,
    assessmentId: "CRA-002",
    name: "Annual infrastructure review 2025",
    status: "Concluded",
    cyberRisks: 5,
    assets: 27,
    threats: 4,
    vulnerabilities: 3,
    scenarios: 5,
    owner: "Maria Ionescu",
    ownerInitials: "MI",
  },
  {
    id: 3,
    assessmentId: "CRA-003",
    name: "Cloud migration risk assessment",
    status: "Concluded",
    cyberRisks: 3,
    assets: 12,
    threats: 2,
    vulnerabilities: 4,
    scenarios: 3,
    owner: "James Patterson",
    ownerInitials: "JP",
  },
  {
    id: 4,
    assessmentId: "CRA-004",
    name: "Third-party vendor risk evaluation",
    status: "In progress",
    cyberRisks: 2,
    assets: 8,
    threats: 5,
    vulnerabilities: 2,
    scenarios: 1,
    owner: "Elena Vasquez",
    ownerInitials: "EV",
  },
  {
    id: 5,
    assessmentId: "CRA-005",
    name: "SOC 2 compliance gap analysis",
    status: "Draft",
    cyberRisks: 1,
    assets: 22,
    threats: 3,
    vulnerabilities: 1,
    scenarios: 4,
    owner: "David Chen",
    ownerInitials: "DC",
  },
  {
    id: 6,
    assessmentId: "CRA-006",
    name: "Ransomware resilience assessment",
    status: "Concluded",
    cyberRisks: 5,
    assets: 30,
    threats: 5,
    vulnerabilities: 4,
    scenarios: 5,
    owner: "Sarah Thompson",
    ownerInitials: "ST",
  },
  {
    id: 7,
    assessmentId: "CRA-007",
    name: "Supply chain cybersecurity review",
    status: "In progress",
    cyberRisks: 3,
    assets: 15,
    threats: 4,
    vulnerabilities: 3,
    scenarios: 2,
    owner: "Alexandru Hasmatuchi",
    ownerInitials: "AH",
  },
  {
    id: 8,
    assessmentId: "CRA-008",
    name: "Remote workforce security assessment",
    status: "Draft",
    cyberRisks: 2,
    assets: 10,
    threats: 2,
    vulnerabilities: 2,
    scenarios: 1,
    owner: "Olivia Martinez",
    ownerInitials: "OM",
  },
  {
    id: 9,
    assessmentId: "CRA-009",
    name: "Data privacy impact assessment Q4",
    status: "Concluded",
    cyberRisks: 4,
    assets: 19,
    threats: 3,
    vulnerabilities: 5,
    scenarios: 4,
    owner: "James Patterson",
    ownerInitials: "JP",
  },
  {
    id: 10,
    assessmentId: "CRA-010",
    name: "OT/ICS network segmentation review",
    status: "Draft",
    cyberRisks: 1,
    assets: 6,
    threats: 1,
    vulnerabilities: 3,
    scenarios: 1,
    owner: "Maria Ionescu",
    ownerInitials: "MI",
  },
];

const STATUS_COLORS = {
  draft: "#a0a2a5",
  inProgress: "#0086fa",
  concluded: "#26c926",
};

const statusData = {
  draft: assessmentRows.filter((r) => r.status === "Draft").length,
  inProgress: assessmentRows.filter((r) => r.status === "In progress").length,
  concluded: assessmentRows.filter((r) => r.status === "Concluded").length,
};

const businessUnitData = [
  { label: "Information Technology", value: 4, color: "#0086fa" },
  { label: "Finance & Accounting", value: 3, color: "#26c926" },
  { label: "Operations", value: 2, color: "#f5a623" },
  { label: "Human Resources", value: 1, color: "#a855f7" },
  { label: "Legal & Compliance", value: 3, color: "#e22e33" },
  { label: "Sales & Marketing", value: 2, color: "#06b6d4" },
];

function AssessmentsByStatusCard() {
  const total = statusData.draft + statusData.inProgress + statusData.concluded;

  const chartData = {
    labels: ["Draft", "In progress", "Concluded"],
    datasets: [
      {
        data: [statusData.draft, statusData.inProgress, statusData.concluded],
        backgroundColor: [
          STATUS_COLORS.draft,
          STATUS_COLORS.inProgress,
          STATUS_COLORS.concluded,
        ],
        borderWidth: 0,
        cutout: "72%",
      },
    ],
  };

  const legendItems = [
    { label: "Draft", value: statusData.draft, color: STATUS_COLORS.draft },
    { label: "In progress", value: statusData.inProgress, color: STATUS_COLORS.inProgress },
    { label: "Concluded", value: statusData.concluded, color: STATUS_COLORS.concluded },
  ];

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
        <Box sx={{ position: "relative", width: 220, height: 220 }}>
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
              {total}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.muted.value,
              })}
            >
              Assessments
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(1, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: 2,
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
  const total = businessUnitData.reduce((sum, bu) => sum + bu.value, 0);

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
    <Card sx={{ flex: 1, minWidth: 0, border: "none", width: "100%" }}>
      <CardHeader
        title={
          <Typography variant="h4" component="h3" fontWeight="600">
            Assessments by business unit
          </Typography>
        }
        action={
          <Button
            variant="text"
            size="small"
            aria-label="More options for assessments by business unit"
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
          gap: "51px",
          height: "100%",
          pt: 0,
        }}
      >
        <Box sx={{ position: "relative", width: 220, height: 220 }}>
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
              {total}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.muted.value,
              })}
            >
              Assessments
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            width: "100%",
          }}
        >
          {businessUnitData.map((item) => (
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

function StatusCell({ status }: { status: AssessmentRow["status"] }) {
  const { presets } = useTheme();
  const StatusIndicator = presets.StatusIndicatorPresets?.components.StatusIndicator;

  const colorMap: Record<AssessmentRow["status"], "generic" | "information" | "success"> = {
    Draft: "generic",
    "In progress": "information",
    Concluded: "success",
  };

  return <StatusIndicator color={colorMap[status]} label={status} />;
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Avatar {...getAvatarProps({ size: "xSmall", color: "blue" })}>{initials}</Avatar>
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
        <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
          {params.value}
        </Link>
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

export default function CyberRiskAssessmentsPage() {
  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
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
            <Button variant="contained">New risk assessment</Button>
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
