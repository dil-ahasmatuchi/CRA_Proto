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
  Container,
  InputAdornment,
  Link,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import type { SnackbarCloseReason } from "@mui/material/Snackbar";
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
import { NavLink, useLocation, useNavigate } from "react-router";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
import { assessmentStatusLabel } from "../data/assessmentStatusLabels.js";
import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";
import {
  addRiskAssessment,
  getRiskAssessmentsSnapshotVersion,
  riskAssessments,
  subscribeRiskAssessments,
} from "../data/riskAssessments.js";
import { getUserById } from "../data/users.js";
import { ASSESSMENT_DELETED_TOAST_STATE_KEY } from "../constants/assessmentNavigationState.js";
import { useAssessments, type Assessment } from "../hooks/useAssessments.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface AssessmentRow {
  id: string;
  displayId: string;
  name: string;
  phase: string;
  startDate: string | null;
  dueDate: string | null;
  scoringType: string;
  scenarios: number;
  scopedAssets: number;
  scenariosScored: number;
  owner: string;
  ownerInitials: string;
  aiScoringPhase: string;
}

type AssessmentStatusCounts = {
  draft: number;
  scoping: number;
  inProgress: number;
  review: number;
  approved: number;
  overdue: number;
};

function buildAssessmentRows(assessments: Assessment[]): AssessmentRow[] {
  return assessments.map((a) => {
    // Get first owner for display
    const ownerId = a.ownerIds[0];
    const u = ownerId ? getUserById(ownerId) : null;

    return {
      id: a.id,
      displayId: a.displayId,
      name: a.name,
      phase: a.phase,
      startDate: a.startDate,
      dueDate: a.dueDate,
      scoringType: a.scoringType,
      scenarios: a.stats.scenarios,
      scopedAssets: a.stats.scopedAssets,
      scenariosScored: a.stats.scenariosScored,
      owner: u?.fullName ?? "—",
      ownerInitials: u?.initials ?? "—",
      aiScoringPhase: a.aiScoringPhase,
    };
  });
}

function buildAssessmentStatusCounts(rows: AssessmentRow[]): AssessmentStatusCounts {
  return {
    draft: rows.filter((r) => r.phase === "draft").length,
    scoping: rows.filter((r) => r.phase === "scoping").length,
    inProgress: rows.filter((r) => r.phase === "inProgress").length,
    review: rows.filter((r) => r.phase === "review").length,
    approved: rows.filter((r) => r.phase === "assessmentApproved").length,
    overdue: rows.filter((r) => r.phase === "overdue").length,
  };
}

const STATUS_CHART_ORDER: AssessmentStatusValue[] = [
  "Draft",
  "Scoping",
  "Scoring",
  "Review",
  "Overdue",
  "Approved",
];

function countForAssessmentStatus(
  status: AssessmentStatusValue,
  statusData: AssessmentStatusCounts,
): number {
  switch (status) {
    case "Draft":
      return statusData.draft;
    case "Scoping":
      return statusData.scoping;
    case "Scoring":
      return statusData.inProgress;
    case "Review":
      return statusData.review;
    case "Overdue":
      return statusData.overdue;
    case "Approved":
      return statusData.approved;
  }
}

/** Figma: Assessments by org. unit — moss scale + orange for zero-coverage org. unit */
const orgUnitChartData = [
  { label: "Information Technology", value: 3, color: "#00894f" },
  { label: "Finance & Accounting", value: 2, color: "#00a661" },
  { label: "Operations", value: 2, color: "#2ec377" },
  { label: "Human Resources", value: 2, color: "#53df90" },
  { label: "Legal & Compliance", value: 1, color: "#72fcaa" },
  { label: "Sales & Marketing", value: 0, color: "#ffb780" },
];

const ORG_UNIT_CHART_COUNT = orgUnitChartData.length;

function AssessmentsByStatusCard({ statusData }: { statusData: AssessmentStatusCounts }) {
  const { tokens } = useTheme();

  const total =
    statusData.draft +
    statusData.scoping +
    statusData.inProgress +
    statusData.review +
    statusData.approved +
    statusData.overdue;

  const legendItems = STATUS_CHART_ORDER.map((status) => ({
    label: assessmentStatusLabel(status),
    value: countForAssessmentStatus(status, statusData),
    color: assessmentStatusColorForCanvas(status, tokens),
  }));

  const chartData = {
    labels: STATUS_CHART_ORDER.map((status) => assessmentStatusLabel(status)),
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
    labels: orgUnitChartData.map((ou) => ou.label),
    datasets: [
      {
        data: orgUnitChartData.map((ou) => ou.value),
        backgroundColor: orgUnitChartData.map((ou) => ou.color),
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
            Assessments by org. unit
          </Typography>
          <Button
            variant="text"
            size="small"
            aria-label="More options for assessments by org. unit"
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
                {ORG_UNIT_CHART_COUNT}
              </Typography>
              <Typography
                variant="body1"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                  lineHeight: "24px",
                  letterSpacing: "0.2px",
                })}
              >
                Org. units
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
          {orgUnitChartData.map((item) => (
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

function PhaseCell({ phase }: { phase: string }) {
  // Map database phase to UI status
  const statusMap: Record<string, AssessmentStatusValue> = {
    draft: "Draft",
    scoping: "Scoping",
    inProgress: "Scoring",
    review: "Review",
    assessmentApproved: "Approved",
    overdue: "Overdue",
  };

  const status = statusMap[phase] || "Draft";
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

function AssessmentsDataGrid({ rows }: { rows: AssessmentRow[] }) {
  const columns: GridColDef<AssessmentRow>[] = [
    {
      field: "displayId",
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
          to={`/cyber-risk/cyber-risk-assessments/${params.row.displayId}`}
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
      field: "phase",
      headerName: "Phase",
      width: 140,
      renderCell: (params: GridRenderCellParams<AssessmentRow>) => (
        <PhaseCell phase={params.value as string} />
      ),
    },
    {
      field: "scopedAssets",
      headerName: "Assets",
      width: 90,
      type: "number",
      description: "Number of assets in scope",
    },
    {
      field: "scenarios",
      headerName: "Scenarios",
      width: 100,
      type: "number",
      description: "Total scenarios generated",
    },
    {
      field: "scenariosScored",
      headerName: "Scored",
      width: 90,
      type: "number",
      description: "Scenarios scored by AI",
    },
    {
      field: "scoringType",
      headerName: "Type",
      width: 100,
      description: "Inherent or Residual risk",
    },
    {
      field: "aiScoringPhase",
      headerName: "AI Status",
      width: 110,
      description: "AI scoring progress",
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
        rows={rows}
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
  const navigate = useNavigate();
  const location = useLocation();
  const [assessmentDeletedToastOpen, setAssessmentDeletedToastOpen] = useState(false);
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch assessments from API
  const assessmentsResult = useAssessments();

  useEffect(() => {
    const raw = location.state;
    if (raw == null || typeof raw !== "object" || Array.isArray(raw)) return;
    const record = raw as Record<string, unknown>;
    if (!record[ASSESSMENT_DELETED_TOAST_STATE_KEY]) return;

    setAssessmentDeletedToastOpen(true);
    const { [ASSESSMENT_DELETED_TOAST_STATE_KEY]: _removed, ...rest } = record;
    const nextState = Object.keys(rest).length ? rest : undefined;
    void navigate(
      { pathname: location.pathname, search: location.search, hash: location.hash },
      { replace: true, state: nextState },
    );
  }, [location.pathname, location.search, location.hash, location.state, navigate]);

  const handleAssessmentDeletedToastClose = useCallback(
    (_event: unknown, reason: SnackbarCloseReason) => {
      if (reason === "clickaway") return;
      setAssessmentDeletedToastOpen(false);
    },
    [],
  );

  const { assessmentRows, statusData, loading, error } = useMemo(() => {
    if (assessmentsResult.status === "loading") {
      return {
        assessmentRows: [],
        statusData: {
          draft: 0,
          scoping: 0,
          inProgress: 0,
          review: 0,
          approved: 0,
          overdue: 0,
        },
        loading: true,
        error: null,
      };
    }

    if (assessmentsResult.status === "error") {
      return {
        assessmentRows: [],
        statusData: {
          draft: 0,
          scoping: 0,
          inProgress: 0,
          review: 0,
          approved: 0,
          overdue: 0,
        },
        loading: false,
        error: assessmentsResult.message,
      };
    }

    const rows = buildAssessmentRows(assessmentsResult.assessments);
    return {
      assessmentRows: rows,
      statusData: buildAssessmentStatusCounts(rows),
      loading: false,
      error: null,
    };
  }, [assessmentsResult]);

  const handleNewAssessment = async () => {
    setCreatingAssessment(true);
    setCreateError(null);

    try {
      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const res = await fetch("/api/cyber-risk-assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `New Assessment ${timestamp}`,
          ownerIds: ["user-1"], // TODO: Get from current user context
          scoringType: "inherent",
          aggregationMethod: "highest",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${res.status}`);
      }

      const created = await res.json();

      // Navigate to the new assessment detail page
      navigate(`/cyber-risk/cyber-risk-assessments/${created.displayId}`);
    } catch (error) {
      console.error("Error creating assessment:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setCreateError(`Failed to create assessment: ${errorMessage}`);
      setCreatingAssessment(false);
    }
  };

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
              onClick={handleNewAssessment}
              disabled={creatingAssessment}
            >
              {creatingAssessment ? "Creating..." : "New cyber risk assessment"}
            </Button>
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load assessments: {error}
          </Alert>
        )}

        {createError && (
          <Alert severity="error" onClose={() => setCreateError(null)} sx={{ mb: 2 }}>
            {createError}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body1">Loading assessments...</Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={({ tokens }) => ({
                backgroundColor: tokens.semantic.color.background.container.value,
                borderRadius: 2,
                p: 3,
              })}
            >
              <Stack direction="row" gap={3} sx={{ minHeight: 460, width: "100%" }}>
                <AssessmentsByStatusCard statusData={statusData} />
                <AssessmentCoverageCard />
              </Stack>
            </Box>

            <AssessmentsDataGrid rows={assessmentRows} />
          </>
        )}
      </Stack>

      <Snackbar
        open={assessmentDeletedToastOpen}
        autoHideDuration={5000}
        onClose={handleAssessmentDeletedToastClose}
      >
        <Alert severity="success" aria-live="polite">
          Assessment deleted
        </Alert>
      </Snackbar>
    </Container>
  );
}
