import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
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
import { useApiList } from "../hooks/useApiList.js";

import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";
import AvatarIcon from "@diligentcorp/atlas-react-bundle/icons/Avatar";

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

interface ApiControlRow {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  control_type: string;
  key_control: number;
  control_frequency: string | null;
  effectiveness: number | null;
  effectiveness_label: string | null;
  status: "Active" | "Archived" | "Draft";
  owner: string | null;
  created_at: string;
  updated_at: string;
}

interface ControlRow {
  id: string;
  controlId: string;
  name: string;
  status: "Active" | "Archived" | "Draft";
  preventDetect: string;
  ownerName: string;
  ownerInitials: string;
  keyControl: "Yes" | "No";
  controlFrequency: string;
  effectiveness: string;
}

const AVATAR_COLORS = ["red", "blue", "green", "purple", "yellow"] as const;

function getInitials(name: string | null): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapApiControl(row: ApiControlRow, idx: number): ControlRow {
  return {
    id: row.display_id,
    controlId: row.display_id,
    name: row.name,
    status: row.status,
    preventDetect: row.control_type,
    ownerName: row.owner ?? "Unassigned",
    ownerInitials: getInitials(row.owner),
    keyControl: row.key_control ? "Yes" : "No",
    controlFrequency: row.control_frequency ?? "—",
    effectiveness: row.effectiveness_label ?? "—",
  };
  void idx;
}

// ---------------------------------------------------------------------------
// Custom cell renderers
// ---------------------------------------------------------------------------

const STATUS_COLOR_MAP: Record<ControlRow["status"], "success" | "generic" | "subtle"> = {
  Active: "success",
  Archived: "generic",
  Draft: "subtle",
};

function StatusCell({ value }: { value: ControlRow["status"] }) {
  const { presets } = useTheme();
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator;

  return <StatusIndicator color={STATUS_COLOR_MAP[value]} label={value} />;
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;
  const isUnassigned = name === "Unassigned";
  const colorIndex = initials
    ? initials.charCodeAt(0) % AVATAR_COLORS.length
    : 0;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Avatar
        {...getAvatarProps({
          size: "small",
          color: AVATAR_COLORS[colorIndex],
        })}
        aria-label={name}
        role="img"
      >
        {isUnassigned ? <AvatarIcon aria-hidden /> : initials}
      </Avatar>
      <Typography variant="textMd">{name}</Typography>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Data grid
// ---------------------------------------------------------------------------

function ControlsDataGrid({ rows }: { rows: ControlRow[] }) {
  const columns: GridColDef<ControlRow>[] = [
    {
      field: "controlId",
      headerName: "ID",
      width: 110,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams<ControlRow>) => (
        <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
          {params.value}
        </Link>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams<ControlRow>) => (
        <StatusCell value={params.value as ControlRow["status"]} />
      ),
    },
    {
      field: "preventDetect",
      headerName: "Prevent / Detect",
      width: 140,
    },
    {
      field: "ownerName",
      headerName: "Owner",
      width: 200,
      renderCell: (params: GridRenderCellParams<ControlRow>) => (
        <OwnerCell
          name={params.row.ownerName}
          initials={params.row.ownerInitials}
        />
      ),
    },
    {
      field: "keyControl",
      headerName: "Key control",
      width: 120,
    },
    {
      field: "controlFrequency",
      headerName: "Control frequency",
      width: 160,
    },
    {
      field: "effectiveness",
      headerName: "Effectiveness",
      width: 130,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        pagination
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: { paginationModel: { pageSize: 25 } },
        }}
        disableRowSelectionOnClick
        showToolbar
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
          main: {
            "aria-label":
              "Controls table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ControlsPage() {
  const api = useApiList<ApiControlRow>("/api/controls");
  const rows = api.status === "ok" ? api.data.map(mapApiControl) : [];

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
        <PageHeader
          pageTitle="Controls"
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
                  id: "controls",
                  label: "Controls",
                  url: "/cyber-risk/controls",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
        />

        {api.status === "loading" && (
          <Stack alignItems="center" py={4}>
            <CircularProgress />
          </Stack>
        )}
        {api.status === "error" && (
          <Alert severity="error">Failed to load controls: {api.error}</Alert>
        )}
        {api.status === "ok" && <ControlsDataGrid rows={rows} />}
      </Stack>
    </Container>
  );
}
