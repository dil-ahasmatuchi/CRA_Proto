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
  ragDataVizColor,
  type RagDataVizKey,
} from "../data/ragDataVisualization.js";
import type { FivePointScaleValue, FivePointScaleLabel, MitigationPlanStatus } from "../data/types.js";
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

import AddIcon from "@diligentcorp/atlas-react-bundle/icons/Add";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";
import AvatarIcon from "@diligentcorp/atlas-react-bundle/icons/Avatar";

interface MitigationPlanRow {
  id: number;
  planId: string;
  name: string;
  status: MitigationPlanStatus;
  severityScore: FivePointScaleValue;
  ownerName: string;
  ownerInitials: string;
  relatedRiskName: string;
  dueDate: string;
  assets: number;
}

const AVATAR_COLORS = ["red", "blue", "green", "purple", "yellow"] as const;

const SEVERITY_LABELS: Record<FivePointScaleValue, FivePointScaleLabel> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

const SEVERITY_RAG: Record<FivePointScaleValue, RagDataVizKey> = {
  1: "pos05",
  2: "pos04",
  3: "neu03",
  4: "neg03",
  5: "neg05",
};

import MitigationPlanStatusChip from "../components/MitigationPlanStatusChip.js";

const mitigationPlanRows: MitigationPlanRow[] = [
  {
    id: 1,
    planId: "MP-001",
    name: "Patch critical firewall vulnerabilities",
    status: "In progress",
    severityScore: 5,
    ownerName: "Sarah Chen",
    ownerInitials: "SC",
    relatedRiskName: "Unauthorized network access",
    dueDate: "Apr 30, 2026",
    assets: 12,
  },
  {
    id: 2,
    planId: "MP-002",
    name: "Implement MFA for privileged accounts",
    status: "In progress",
    severityScore: 4,
    ownerName: "James Okoro",
    ownerInitials: "JO",
    relatedRiskName: "Credential compromise",
    dueDate: "May 15, 2026",
    assets: 8,
  },
  {
    id: 3,
    planId: "MP-003",
    name: "Encrypt data at rest in legacy databases",
    status: "Completed",
    severityScore: 5,
    ownerName: "Maria Lopez",
    ownerInitials: "ML",
    relatedRiskName: "Sensitive data exposure",
    dueDate: "Jun 1, 2026",
    assets: 3,
  },
  {
    id: 4,
    planId: "MP-004",
    name: "Remediate third-party API exposure",
    status: "Overdue",
    severityScore: 4,
    ownerName: "Alex Novak",
    ownerInitials: "AN",
    relatedRiskName: "Supply chain vulnerability",
    dueDate: "Apr 15, 2026",
    assets: 5,
  },
  {
    id: 5,
    planId: "MP-005",
    name: "Segmentation of OT network",
    status: "In progress",
    severityScore: 5,
    ownerName: "Priya Sharma",
    ownerInitials: "PS",
    relatedRiskName: "Lateral movement in OT systems",
    dueDate: "Jul 31, 2026",
    assets: 21,
  },
  {
    id: 6,
    planId: "MP-006",
    name: "Phishing simulation and training",
    status: "Completed",
    severityScore: 3,
    ownerName: "David Kim",
    ownerInitials: "DK",
    relatedRiskName: "Social engineering attacks",
    dueDate: "May 1, 2026",
    assets: 2,
  },
  {
    id: 7,
    planId: "MP-007",
    name: "Harden cloud storage permissions",
    status: "Overdue",
    severityScore: 4,
    ownerName: "Rachel Torres",
    ownerInitials: "RT",
    relatedRiskName: "Cloud misconfiguration",
    dueDate: "Apr 20, 2026",
    assets: 9,
  },
  {
    id: 8,
    planId: "MP-008",
    name: "Deploy endpoint detection and response",
    status: "In progress",
    severityScore: 3,
    ownerName: "Michael Bryant",
    ownerInitials: "MB",
    relatedRiskName: "Malware propagation",
    dueDate: "Jun 15, 2026",
    assets: 34,
  },
  {
    id: 9,
    planId: "MP-009",
    name: "Disaster recovery tabletop exercise",
    status: "In progress",
    severityScore: 2,
    ownerName: "Linda Zhao",
    ownerInitials: "LZ",
    relatedRiskName: "Business continuity failure",
    dueDate: "May 30, 2026",
    assets: 15,
  },
  {
    id: 10,
    planId: "MP-010",
    name: "Rotate and vault service credentials",
    status: "Completed",
    severityScore: 4,
    ownerName: "Ethan Patel",
    ownerInitials: "EP",
    relatedRiskName: "Credential theft via exposed secrets",
    dueDate: "Apr 25, 2026",
    assets: 7,
  },
  {
    id: 11,
    planId: "MP-011",
    name: "Legacy system access controls upgrade",
    status: "Overdue",
    severityScore: 5,
    ownerName: "Sarah Chen",
    ownerInitials: "SC",
    relatedRiskName: "Unauthorized access to legacy systems",
    dueDate: "Feb 28, 2026",
    assets: 14,
  },
  {
    id: 12,
    planId: "MP-012",
    name: "Network intrusion detection rollout",
    status: "Overdue",
    severityScore: 3,
    ownerName: "James Okoro",
    ownerInitials: "JO",
    relatedRiskName: "Undetected lateral movement",
    dueDate: "Mar 15, 2026",
    assets: 18,
  },
  {
    id: 13,
    planId: "MP-013",
    name: "Vendor security assessment backlog",
    status: "Overdue",
    severityScore: 4,
    ownerName: "Priya Sharma",
    ownerInitials: "PS",
    relatedRiskName: "Third-party data breach",
    dueDate: "Jan 31, 2026",
    assets: 6,
  },
];

function SeverityLevelCell({ value }: { value: FivePointScaleValue }) {
  const { tokens } = useTheme();
  const ragKey = SEVERITY_RAG[value];
  const label = SEVERITY_LABELS[value];

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box
        sx={{
          width: 16,
          height: 16,
          borderRadius: 0.5,
          backgroundColor: ragDataVizColor(tokens, ragKey),
          flexShrink: 0,
        }}
      />
      <Typography variant="labelXs">
        {value} - {label}
      </Typography>
    </Stack>
  );
}

function OwnerCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;
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
        {initials || <AvatarIcon aria-hidden />}
      </Avatar>
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
          <Button
            {...props}
            startIcon={<FilterIcon />}
            aria-label="Show filters"
          >
            Filter
          </Button>
        )}
      />
      <ColumnsPanelTrigger
        render={(props) => (
          <Button
            {...props}
            startIcon={<ColumnsIcon />}
            aria-label="Select columns"
          >
            Columns
          </Button>
        )}
      />
    </Toolbar>
  );
}

function MitigationPlansDataGrid() {
  const columns: GridColDef<MitigationPlanRow>[] = [
    {
      field: "planId",
      headerName: "ID",
      width: 100,
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 250,
      renderCell: (params: GridRenderCellParams<MitigationPlanRow>) => (
        <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
          {params.value}
        </Link>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params: GridRenderCellParams<MitigationPlanRow>) => (
        <MitigationPlanStatusChip status={params.value as MitigationPlanStatus} />
      ),
    },
    {
      field: "severityScore",
      headerName: "Severity level",
      width: 150,
      renderCell: (params: GridRenderCellParams<MitigationPlanRow>) => (
        <SeverityLevelCell value={params.value as FivePointScaleValue} />
      ),
    },
    {
      field: "ownerName",
      headerName: "Owner",
      width: 200,
      renderCell: (params: GridRenderCellParams<MitigationPlanRow>) => (
        <OwnerCell
          name={params.row.ownerName}
          initials={params.row.ownerInitials}
        />
      ),
    },
    {
      field: "relatedRiskName",
      headerName: "Related risk",
      width: 260,
    },
    {
      field: "assets",
      headerName: "Assets",
      width: 100,
      type: "number",
    },
    {
      field: "dueDate",
      headerName: "Due date",
      width: 140,
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={mitigationPlanRows}
        columns={columns}
        pagination
        pageSizeOptions={[5, 10, 25]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        showToolbar
        slots={{
          toolbar: CustomToolbar,
        }}
        slotProps={{
          main: {
            "aria-label":
              "Mitigation plans table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
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

export default function MitigationPlansPage() {
  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
        <PageHeader
          pageTitle="Mitigation plans"
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
                  id: "mitigation-plans",
                  label: "Mitigation plans",
                  url: "/cyber-risk/mitigation-plans",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
          moreButton={
            <Button variant="contained" startIcon={<AddIcon />}>
              New mitigation plan
            </Button>
          }
        />
        <MitigationPlansDataGrid />
      </Stack>
    </Container>
  );
}
