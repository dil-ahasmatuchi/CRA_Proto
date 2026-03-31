import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Avatar,
  Box,
  Button,
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

import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";
import AvatarIcon from "@diligentcorp/atlas-react-bundle/icons/Avatar";

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

interface ControlRow {
  id: number;
  controlId: string;
  name: string;
  status: "Active" | "Archived" | "Draft";
  preventDetect: string;
  linkedOrgUnits: string;
  ownerName: string;
  ownerInitials: string;
  assets: number;
  cyberRisks: number;
  keyControl: "Yes" | "No";
  controlFrequency: string;
}

const AVATAR_COLORS = ["red", "blue", "green", "purple", "yellow"] as const;

const controlRows: ControlRow[] = [
  {
    id: 1,
    controlId: "C-123456",
    name: "Role-based access",
    status: "Active",
    preventDetect: "Detective",
    linkedOrgUnits: "Human Resources \u2013 San Francisco",
    ownerName: "Cody Fisher",
    ownerInitials: "CF",
    assets: 12,
    cyberRisks: 3,
    keyControl: "Yes",
    controlFrequency: "As needed",
  },
  {
    id: 2,
    controlId: "C-123456",
    name: "Communication protocols",
    status: "Archived",
    preventDetect: "Preventive",
    linkedOrgUnits: "2",
    ownerName: "Jacob Jones",
    ownerInitials: "JJ",
    assets: 8,
    cyberRisks: 5,
    keyControl: "No",
    controlFrequency: "Annually",
  },
  {
    id: 3,
    controlId: "C-123456",
    name: "Performance metrics",
    status: "Active",
    preventDetect: "Detective",
    linkedOrgUnits: "4",
    ownerName: "Ralph Edwards",
    ownerInitials: "RE",
    assets: 24,
    cyberRisks: 7,
    keyControl: "Yes",
    controlFrequency: "Quarterly",
  },
  {
    id: 4,
    controlId: "C-123456",
    name: "Business continuity plans",
    status: "Draft",
    preventDetect: "Preventive",
    linkedOrgUnits: "17",
    ownerName: "Alexander Konstantinop\u2026",
    ownerInitials: "AK",
    assets: 15,
    cyberRisks: 2,
    keyControl: "Yes",
    controlFrequency: "Monthly",
  },
  {
    id: 5,
    controlId: "C-123456",
    name: "Vendor Risk Management",
    status: "Draft",
    preventDetect: "-",
    linkedOrgUnits: "Finance \u2013 Melbourne",
    ownerName: "Unassigned",
    ownerInitials: "",
    assets: 6,
    cyberRisks: 1,
    keyControl: "No",
    controlFrequency: "Semi-annually",
  },
  {
    id: 6,
    controlId: "C-123456",
    name: "Data Loss Prevention",
    status: "Active",
    preventDetect: "Preventive",
    linkedOrgUnits: "2",
    ownerName: "Nathaniel Ribbon",
    ownerInitials: "NR",
    assets: 19,
    cyberRisks: 4,
    keyControl: "No",
    controlFrequency: "Daily",
  },
  {
    id: 7,
    controlId: "C-123456",
    name: "Network Security Monitoring",
    status: "Active",
    preventDetect: "Detective",
    linkedOrgUnits: "7",
    ownerName: "Gavin Belson",
    ownerInitials: "GB",
    assets: 31,
    cyberRisks: 9,
    keyControl: "Yes",
    controlFrequency: "Bi-weekly",
  },
  {
    id: 8,
    controlId: "C-123456",
    name: "Physical Security Controls",
    status: "Archived",
    preventDetect: "Preventive",
    linkedOrgUnits: "24",
    ownerName: "Derek Donner",
    ownerInitials: "DD",
    assets: 10,
    cyberRisks: 6,
    keyControl: "No",
    controlFrequency: "Continuously",
  },
  {
    id: 9,
    controlId: "C-123456",
    name: "Third-Party Risk Assessment",
    status: "Active",
    preventDetect: "Detective",
    linkedOrgUnits: "3",
    ownerName: "Sarah Mitchell",
    ownerInitials: "SM",
    assets: 14,
    cyberRisks: 3,
    keyControl: "Yes",
    controlFrequency: "Annually",
  },
  {
    id: 10,
    controlId: "C-123456",
    name: "Business Impact Analysis",
    status: "Draft",
    preventDetect: "Preventive",
    linkedOrgUnits: "Finance \u2013 New York",
    ownerName: "Tom Bradley",
    ownerInitials: "TB",
    assets: 7,
    cyberRisks: 2,
    keyControl: "No",
    controlFrequency: "Quarterly",
  },
];

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

function LinkedOrgUnitsCell({ value }: { value: string }) {
  const isNumeric = /^\d+$/.test(value);

  if (isNumeric) {
    return <Typography variant="textMd">{value}</Typography>;
  }

  return (
    <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
      {value}
    </Link>
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

function ControlsDataGrid() {
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
      field: "linkedOrgUnits",
      headerName: "Linked org units",
      width: 240,
      renderCell: (params: GridRenderCellParams<ControlRow>) => (
        <LinkedOrgUnitsCell value={params.value as string} />
      ),
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
      field: "assets",
      headerName: "Assets",
      width: 100,
      type: "number",
    },
    {
      field: "cyberRisks",
      headerName: "Cyber risks",
      width: 120,
      type: "number",
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
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={controlRows}
        columns={columns}
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
        <ControlsDataGrid />
      </Stack>
    </Container>
  );
}
