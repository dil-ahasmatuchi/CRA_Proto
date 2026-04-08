import {
  Avatar,
  Box,
  Button,
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

import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";

import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";
import type { AssessmentStatus } from "../data/types.js";
import {
  buildThreatAssessmentGridRows,
  type ThreatAssessmentGridRow,
} from "../utils/threatAssessmentsTableRows.js";

const ASSESSMENTS_LIST_PATH = "/cyber-risk/cyber-risk-assessments";

function StatusCell({ status }: { status: AssessmentStatus }) {
  const { presets } = useTheme();
  const StatusIndicator = presets.StatusIndicatorPresets?.components.StatusIndicator;

  const colorMap: Record<AssessmentStatus, "generic" | "information" | "success"> = {
    Draft: "generic",
    "In progress": "information",
    Approved: "success",
  };

  return <StatusIndicator color={colorMap[status]} label={status} />;
}

function UserStackCell({ name, initials }: { name: string; initials: string }) {
  const { presets } = useTheme();
  const { getAvatarProps } = presets.AvatarPresets;

  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, py: 0.5 }}>
      <Avatar {...getAvatarProps({ size: "small", color: "blue" })}>{initials}</Avatar>
      <Typography variant="textMd" noWrap>
        {name}
      </Typography>
    </Stack>
  );
}

function RagMetricCell({
  label,
  ragKey,
}: {
  label: string | null;
  ragKey: RagDataVizKey | null;
}) {
  const { tokens } = useTheme();

  if (!label || !ragKey) {
    return (
      <Typography variant="textMd" sx={({ tokens: t }) => ({ color: t.semantic.color.type.muted.value })}>
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ py: 0.5 }}>
      <Box
        sx={{
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: ({ tokens: t }) => t.semantic.radius.sm.value,
          bgcolor: ragDataVizColor(tokens, ragKey),
        }}
      />
      <Typography variant="textMd" noWrap>
        {label}
      </Typography>
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
              sx={{ minWidth: { xs: 1, sm: 300 }, maxWidth: 400 }}
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

export type ThreatDetailAssessmentsTabProps = {
  threatId: string;
  threatAssetIds: string[];
};

export default function ThreatDetailAssessmentsTab({
  threatId,
  threatAssetIds,
}: ThreatDetailAssessmentsTabProps) {
  const rows = useMemo(
    () => buildThreatAssessmentGridRows(threatId, threatAssetIds),
    [threatId, threatAssetIds],
  );

  const columns: GridColDef<ThreatAssessmentGridRow>[] = useMemo(
    () => [
      {
        field: "displayId",
        headerName: "ID",
        width: 110,
        sortable: true,
      },
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 260,
        sortable: true,
        renderCell: (params: GridRenderCellParams<ThreatAssessmentGridRow>) => (
          <Link
            component={NavLink}
            to={ASSESSMENTS_LIST_PATH}
            underline="hover"
            sx={({ tokens: t }) => ({
              fontWeight: 600,
              fontSize: 14,
              lineHeight: "20px",
              letterSpacing: "0.2px",
              color: t.semantic.color.type.default.value,
              alignSelf: "center",
            })}
          >
            {params.value as string}
          </Link>
        ),
      },
      {
        field: "assetLabel",
        headerName: "Asset",
        width: 200,
        sortable: true,
      },
      {
        field: "status",
        headerName: "Status",
        width: 150,
        sortable: true,
        renderCell: (params: GridRenderCellParams<ThreatAssessmentGridRow>) => (
          <StatusCell status={params.value as AssessmentStatus} />
        ),
      },
      {
        field: "threatSeverityLabel",
        headerName: "Threat severity",
        width: 160,
        sortable: false,
        renderCell: (params: GridRenderCellParams<ThreatAssessmentGridRow>) => (
          <RagMetricCell
            label={params.row.threatSeverityLabel}
            ragKey={params.row.threatRagKey}
          />
        ),
      },
      {
        field: "cyberRiskScoreLabel",
        headerName: "Cyber risk score",
        width: 180,
        sortable: false,
        renderCell: (params: GridRenderCellParams<ThreatAssessmentGridRow>) => (
          <RagMetricCell
            label={params.row.cyberRiskScoreLabel}
            ragKey={params.row.cyberRagKey}
          />
        ),
      },
      {
        field: "dueDateDisplay",
        headerName: "Due date",
        width: 130,
        sortable: true,
      },
      {
        field: "assessorName",
        headerName: "Assessor",
        width: 220,
        sortable: true,
        valueGetter: (_value, row) => row.assessorName,
        renderCell: (params: GridRenderCellParams<ThreatAssessmentGridRow>) => (
          <UserStackCell name={params.row.assessorName} initials={params.row.assessorInitials} />
        ),
      },
      {
        field: "ownerName",
        headerName: "Owner",
        width: 220,
        sortable: true,
        valueGetter: (_value, row) => row.ownerName,
        renderCell: (params: GridRenderCellParams<ThreatAssessmentGridRow>) => (
          <UserStackCell name={params.row.ownerName} initials={params.row.ownerInitials} />
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Box sx={{ width: "100%" }}>
        <DataGridPro<ThreatAssessmentGridRow>
          rows={rows}
          columns={columns}
          pagination
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
            pinnedColumns: { left: ["displayId", "name"] },
          }}
          disableRowSelectionOnClick
          showToolbar
          slots={{ toolbar: CustomToolbar }}
          slotProps={{
            main: {
              "aria-label":
                "Cyber risk assessments that include this threat. Column headers may include action menus.",
            },
            basePagination: {
              material: { labelRowsPerPage: "Rows" },
            },
          }}
          sx={({ tokens: t }) => ({
            border: "none",
            borderRadius: t.semantic.radius.md.value,
            bgcolor: t.semantic.color.background.base.value,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: t.semantic.color.background.container.value,
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.3px",
            },
            "& .MuiDataGrid-withBorderColor": {
              borderColor: t.semantic.color.outline.default.value,
            },
          })}
          showColumnVerticalBorder
          showCellVerticalBorder
        />
      </Box>
    </Stack>
  );
}
