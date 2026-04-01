import {
  PageHeader,
  OverflowBreadcrumbs,
} from "@diligentcorp/atlas-react-bundle";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  InputAdornment,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
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
import { useMemo, useState } from "react";
import { NavLink } from "react-router";

import "../data/threats.js";
import { vulnerabilities } from "../data/vulnerabilities.js";
import { getUserById } from "../data/users.js";
import {
  ragDataVizColor,
  type RagDataVizKey,
} from "../data/ragDataVisualization.js";
import type { FivePointScaleValue, FivePointScaleLabel } from "../data/types.js";
import ImportIcon from "@diligentcorp/atlas-react-bundle/icons/Import";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";
import AvatarIcon from "@diligentcorp/atlas-react-bundle/icons/Avatar";

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

const AVATAR_COLORS = ["red", "blue", "green", "purple", "yellow"] as const;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface VulnerabilityRow {
  id: string;
  name: string;
  vulnerabilityId: string;
  severityScore: FivePointScaleValue;
  assessments: number;
  findings: number;
  cves: number;
  aggregatedAssets: number;
  vulnerabilityDomain: string;
  created: string;
  createdByName: string;
  createdByInitials: string;
  lastUpdated: string;
  lastUpdatedByName: string;
  lastUpdatedByInitials: string;
}

const vulnerabilityRows: VulnerabilityRow[] = vulnerabilities.map((v, i) => {
  const owner = getUserById(v.ownerId);
  const seed = i + 1;
  const severityScore = (Math.floor(seededRandom(seed * 7) * 5) + 1) as FivePointScaleValue;
  const findings = Math.floor(seededRandom(seed * 13) * 200) + 100;
  const cves = Math.floor(seededRandom(seed * 17) * 200) + 100;
  const assessments = Math.floor(seededRandom(seed * 23) * 8) + 1;

  return {
    id: v.id,
    name: v.name,
    vulnerabilityId: v.id,
    severityScore,
    assessments,
    findings,
    cves,
    aggregatedAssets: v.assetIds.length,
    vulnerabilityDomain: v.domain,
    created: "23 Jan 2025",
    createdByName: owner?.fullName ?? "Unassigned",
    createdByInitials: owner?.initials ?? "",
    lastUpdated: "23 Jan 2025",
    lastUpdatedByName: owner?.fullName ?? "Unassigned",
    lastUpdatedByInitials: owner?.initials ?? "",
  };
});

function SeverityScoreCell({ value }: { value: FivePointScaleValue }) {
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

function VulnerabilitiesDataGrid() {
  const columns: GridColDef<VulnerabilityRow>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 250,
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "vulnerabilityId",
        headerName: "ID",
        width: 100,
      },
      {
        field: "severityScore",
        headerName: "Severity score",
        width: 140,
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <SeverityScoreCell value={params.value as FivePointScaleValue} />
        ),
      },
      {
        field: "assessments",
        headerName: "Assessments",
        width: 118,
        type: "number",
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "findings",
        headerName: "Findings",
        width: 118,
        type: "number",
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "cves",
        headerName: "CVEs",
        width: 118,
        type: "number",
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "aggregatedAssets",
        headerName: "Aggregated assets",
        width: 153,
        type: "number",
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <Link href="#" underline="hover" sx={{ cursor: "pointer" }}>
            {params.value}
          </Link>
        ),
      },
      {
        field: "vulnerabilityDomain",
        headerName: "Vulnerability domain",
        width: 160,
      },
      {
        field: "created",
        headerName: "Created",
        width: 120,
      },
      {
        field: "createdByName",
        headerName: "Created by",
        width: 160,
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <OwnerCell
            name={params.row.createdByName}
            initials={params.row.createdByInitials}
          />
        ),
      },
      {
        field: "lastUpdated",
        headerName: "Last updated",
        width: 120,
      },
      {
        field: "lastUpdatedByName",
        headerName: "Last updated by",
        width: 160,
        renderCell: (params: GridRenderCellParams<VulnerabilityRow>) => (
          <OwnerCell
            name={params.row.lastUpdatedByName}
            initials={params.row.lastUpdatedByInitials}
          />
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={vulnerabilityRows}
        columns={columns}
        pagination
        pageSizeOptions={[10, 25, 50]}
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
              "Vulnerability categories table. Column headers contain action menus. Press CTRL + ENTER to open the action menu.",
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

export default function VulnerabilitiesPage() {
  const [activeTab, setActiveTab] = useState(1);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ py: 2 }}>
      <Stack gap={3}>
        <Stack gap={0}>
          <PageHeader
            pageTitle="Vulnerabilities"
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
                    id: "vulnerabilities",
                    label: "Vulnerabilities",
                    url: "/cyber-risk/vulnerabilities",
                  },
                ]}
                hideLastItem={true}
                aria-label="Breadcrumbs"
              >
                {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
              </OverflowBreadcrumbs>
            }
            moreButton={
              <Button variant="contained" startIcon={<ImportIcon />}>
                Import vulnerabilities
              </Button>
            }
          />
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="atlas-size-large"
            aria-label="Vulnerability page tabs"
          >
            <Tab label="Overview" id="vuln-tab-0" aria-controls="vuln-tabpanel-0" />
            <Tab label="Vulnerability categories" id="vuln-tab-1" aria-controls="vuln-tabpanel-1" />
            <Tab label="Discrete assets" id="vuln-tab-2" aria-controls="vuln-tabpanel-2" />
            <Tab label="Findings" id="vuln-tab-3" aria-controls="vuln-tabpanel-3" />
            <Tab label="CVEs" id="vuln-tab-4" aria-controls="vuln-tabpanel-4" />
          </Tabs>
        </Stack>

        <div role="tabpanel" id="vuln-tabpanel-1" aria-labelledby="vuln-tab-1" hidden={activeTab !== 1}>
          <Stack gap={3}>
            <Alert
              severity="info"
              action={
                <Button variant="text" size="medium">
                  View asset linking rules
                </Button>
              }
            >
              <Box sx={visuallyHidden}>Info</Box>
              You have <strong>3</strong> discrete assets that are not yet linked to aggregated assets. You can automate the linking process with asset linking rules.
            </Alert>

            <VulnerabilitiesDataGrid />
          </Stack>
        </div>

        {activeTab === 0 && (
          <div role="tabpanel" id="vuln-tabpanel-0" aria-labelledby="vuln-tab-0">
            <Typography
              variant="body1"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
            >
              Overview content
            </Typography>
          </div>
        )}

        {activeTab === 2 && (
          <div role="tabpanel" id="vuln-tabpanel-2" aria-labelledby="vuln-tab-2">
            <Typography
              variant="body1"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
            >
              Discrete assets content
            </Typography>
          </div>
        )}

        {activeTab === 3 && (
          <div role="tabpanel" id="vuln-tabpanel-3" aria-labelledby="vuln-tab-3">
            <Typography
              variant="body1"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
            >
              Findings content
            </Typography>
          </div>
        )}

        {activeTab === 4 && (
          <div role="tabpanel" id="vuln-tabpanel-4" aria-labelledby="vuln-tab-4">
            <Typography
              variant="body1"
              sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
            >
              CVEs content
            </Typography>
          </div>
        )}
      </Stack>
    </Container>
  );
}
