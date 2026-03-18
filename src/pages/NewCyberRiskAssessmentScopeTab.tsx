import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Link,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
  FilterPanelTrigger,
  QuickFilter,
  QuickFilterControl,
  Toolbar,
  gridPaginatedVisibleSortedGridRowIdsSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid-pro";

import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";

type ScopeViewFilter = "all" | "included" | "excluded";

export type ScopeAssetRow = {
  id: number;
  included: boolean;
  assetName: string;
  assetType: string;
  cyberRisks: number;
  criticality: 2 | 3 | 4 | 5;
  objectives: number;
  processes: number;
};

const CRITICALITY_META: Record<
  ScopeAssetRow["criticality"],
  { label: string; color: string }
> = {
  5: { label: "5 - Very high", color: "#7a1214" },
  4: { label: "4 - High", color: "#d3222a" },
  3: { label: "3 - Medium", color: "#e8a317" },
  2: { label: "2 - Low", color: "#26c926" },
};

const SEED_ROWS: Omit<ScopeAssetRow, "id">[] = [
  {
    included: false,
    assetName: "Vendor master database",
    assetType: "Database",
    cyberRisks: 5,
    criticality: 5,
    objectives: 4,
    processes: 20,
  },
  {
    included: false,
    assetName: "Payment gateway API",
    assetType: "API",
    cyberRisks: 4,
    criticality: 4,
    objectives: 8,
    processes: 14,
  },
  {
    included: false,
    assetName: "Customer database",
    assetType: "Data",
    cyberRisks: 3,
    criticality: 5,
    objectives: 12,
    processes: 16,
  },
  {
    included: false,
    assetName: "HR employee portal",
    assetType: "Software",
    cyberRisks: 2,
    criticality: 3,
    objectives: 6,
    processes: 9,
  },
  {
    included: false,
    assetName: "Email security gateway",
    assetType: "Infrastructure",
    cyberRisks: 6,
    criticality: 4,
    objectives: 3,
    processes: 11,
  },
  {
    included: false,
    assetName: "Backup storage cluster",
    assetType: "Data",
    cyberRisks: 1,
    criticality: 3,
    objectives: 2,
    processes: 5,
  },
  {
    included: false,
    assetName: "Identity provider service",
    assetType: "API",
    cyberRisks: 7,
    criticality: 5,
    objectives: 9,
    processes: 18,
  },
  {
    included: false,
    assetName: "Main data center servers",
    assetType: "Infrastructure",
    cyberRisks: 2,
    criticality: 2,
    objectives: 2,
    processes: 2,
  },
  {
    included: false,
    assetName: "Claims processing system",
    assetType: "Software",
    cyberRisks: 4,
    criticality: 4,
    objectives: 7,
    processes: 13,
  },
  {
    included: false,
    assetName: "Document management store",
    assetType: "Database",
    cyberRisks: 3,
    criticality: 3,
    objectives: 5,
    processes: 8,
  },
];

function buildScopeRows(): ScopeAssetRow[] {
  const types: ScopeAssetRow["assetType"][] = [
    "Database",
    "API",
    "Data",
    "Software",
    "Infrastructure",
  ];
  const criticalities: ScopeAssetRow["criticality"][] = [2, 3, 4, 5];
  const rows: ScopeAssetRow[] = SEED_ROWS.map((r, i) => ({ ...r, id: i + 1 }));

  for (let i = SEED_ROWS.length; i < 436; i++) {
    const id = i + 1;
    rows.push({
      id,
      included: false,
      assetName: `Asset service ${id}`,
      assetType: types[id % types.length],
      cyberRisks: (id % 8) + 1,
      criticality: criticalities[id % criticalities.length],
      objectives: (id % 15) + 1,
      processes: (id % 22) + 1,
    });
  }
  return rows;
}

function ScopeToolbar({
  view,
  onViewChange,
  totalCount,
  includedCount,
}: {
  view: ScopeViewFilter;
  onViewChange: (_e: React.MouseEvent<HTMLElement>, v: ScopeViewFilter | null) => void;
  totalCount: number;
  includedCount: number;
}) {
  return (
    <Toolbar sx={{ gap: 2, flexWrap: "wrap", py: 1.5, px: 0 }}>
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
                      <SearchIcon aria-hidden />
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
      <Box sx={{ flex: "1 1 120px" }} />
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={onViewChange}
        aria-label="Filter assets by inclusion"
        size="small"
        sx={({ tokens: t }) => ({
          "& .MuiToggleButton-root": {
            px: 2,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            borderColor: t.semantic.color.outline.default.value,
          },
          "& .Mui-selected": {
            backgroundColor: `${t.semantic.color.action.primary.default.value} !important`,
            color: `${t.semantic.color.action.primary.onPrimary.value} !important`,
          },
        })}
      >
        <ToggleButton value="all">All ({totalCount})</ToggleButton>
        <ToggleButton value="included">
          {includedCount > 0 ? `Included (${includedCount})` : "Included"}
        </ToggleButton>
        <ToggleButton value="excluded">Not included</ToggleButton>
      </ToggleButtonGroup>
    </Toolbar>
  );
}

function CriticalityCell({ level }: { level: ScopeAssetRow["criticality"] }) {
  const meta = CRITICALITY_META[level];
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Box
        sx={{
          width: 14,
          height: 14,
          flexShrink: 0,
          bgcolor: meta.color,
          borderRadius: 0.5,
        }}
        aria-hidden
      />
      <Typography variant="body1" component="span" sx={{ fontSize: 14, lineHeight: "20px" }}>
        {meta.label}
      </Typography>
    </Stack>
  );
}

function NumericLink({ value, ariaLabel }: { value: number; ariaLabel: string }) {
  return (
    <Link
      component="button"
      type="button"
      underline="always"
      onClick={(e: React.MouseEvent) => e.preventDefault()}
      sx={{ cursor: "pointer", fontWeight: 400, fontSize: 16, lineHeight: "24px" }}
      aria-label={ariaLabel}
    >
      {value}
    </Link>
  );
}

/** Uses grid state so “this page” = same rows as on screen (sort, filter, pagination). */
function ScopeIncludedColumnHeader({
  rows,
  setRows,
}: {
  rows: ScopeAssetRow[];
  setRows: Dispatch<SetStateAction<ScopeAssetRow[]>>;
}) {
  const apiRef = useGridApiContext();
  const rowIdsOnPage = useGridSelector(apiRef, gridPaginatedVisibleSortedGridRowIdsSelector);

  const idsOnPage = useMemo(
    () => rowIdsOnPage.map((id) => (typeof id === "number" ? id : Number(id))),
    [rowIdsOnPage],
  );

  const allPageRowsIncluded =
    idsOnPage.length > 0 &&
    idsOnPage.every((id) => rows.find((r) => r.id === id)?.included === true);

  const pageIncludedCount = useMemo(
    () => idsOnPage.filter((id) => rows.find((r) => r.id === id)?.included).length,
    [idsOnPage, rows],
  );

  const headerIncludeIntermediate =
    idsOnPage.length > 0 &&
    pageIncludedCount > 0 &&
    pageIncludedCount < idsOnPage.length;

  const handleHeaderToggle = useCallback(() => {
    const ids = gridPaginatedVisibleSortedGridRowIdsSelector(apiRef).map((id) =>
      typeof id === "number" ? id : Number(id),
    );
    if (ids.length === 0) return;
    setRows((prev) => {
      const idSet = new Set(ids);
      const everyOnPageIncluded = ids.every(
        (id) => prev.find((r) => r.id === id)?.included === true,
      );
      const nextIncluded = !everyOnPageIncluded;
      return prev.map((r) =>
        idSet.has(r.id) ? { ...r, included: nextIncluded } : { ...r },
      );
    });
  }, [apiRef, setRows]);

  const headerAriaLabel = headerIncludeIntermediate
    ? "Some assets on this page are in scope. Click to include all on this page."
    : allPageRowsIncluded
      ? "All assets on this page are in scope. Click to exclude all on this page."
      : "Click to include or exclude all assets shown on this page.";

  return (
    <Box
      role="button"
      tabIndex={0}
      aria-label={headerAriaLabel}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          handleHeaderToggle();
        }
      }}
      sx={({ tokens: t }) => ({
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "calc(100% + 20px)",
        minHeight: "var(--DataGrid-headerHeight, 48px)",
        m: 0,
        mx: "-10px",
        px: "10px",
        py: 0,
        boxSizing: "border-box",
        color: "inherit",
        cursor: "pointer",
        border: "none",
        background: "none",
        outline: "none",
        "&:focus-visible": {
          outline: `2px solid ${t.semantic.color.action.primary.default.value}`,
          outlineOffset: -2,
        },
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", pointerEvents: "none" }}>
        <Switch
          size="small"
          // @ts-expect-error Lens Switch color union is "default" only; primary required for indeterminate theme rules
          color="primary"
          checked={allPageRowsIncluded}
          tabIndex={-1}
          slotProps={{
            input: {
              tabIndex: -1,
              "aria-hidden": true,
              ...(headerIncludeIntermediate ? { "aria-checked": "mixed" as const } : {}),
            },
          }}
        />
      </Box>
      <Box
        aria-hidden
        onClick={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          handleHeaderToggle();
        }}
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: "pointer",
        }}
      />
    </Box>
  );
}

export default function NewCyberRiskAssessmentScopeTab() {
  const [rows, setRows] = useState<ScopeAssetRow[]>(buildScopeRows);
  const [view, setView] = useState<ScopeViewFilter>("all");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const includedCount = useMemo(() => rows.filter((r) => r.included).length, [rows]);

  const filteredRows = useMemo(() => {
    if (view === "included") return rows.filter((r) => r.included);
    if (view === "excluded") return rows.filter((r) => !r.included);
    return rows;
  }, [rows, view]);

  const setIncluded = useCallback((id: number, included: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, included } : { ...r })),
    );
  }, []);

  const handleViewChange = useCallback(
    (_e: React.MouseEvent<HTMLElement>, v: ScopeViewFilter | null) => {
      if (v) {
        setView(v);
        setPaginationModel((m) => ({ ...m, page: 0 }));
      }
    },
    [],
  );

  const columns: GridColDef<ScopeAssetRow>[] = useMemo(
    () => [
      {
        field: "included",
        headerName: "",
        width: 200,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        editable: false,
        renderHeader: () => (
          <ScopeIncludedColumnHeader rows={rows} setRows={setRows} />
        ),
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => {
          const included = params.row.included;
          const label = included ? "Included" : "Not included";
          return (
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              role="button"
              tabIndex={0}
              aria-label={`${label}. Click to ${included ? "exclude" : "include"} ${params.row.assetName} from scope.`}
              aria-pressed={included}
              onClick={() => setIncluded(params.row.id, !included)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIncluded(params.row.id, !included);
                }
              }}
              sx={({ tokens: t }) => ({
                height: "100%",
                width: "100%",
                minWidth: 0,
                py: 0.5,
                cursor: "pointer",
                boxSizing: "border-box",
                "&:focus-visible": {
                  outline: `2px solid ${t.semantic.color.action.primary.default.value}`,
                  outlineOffset: -2,
                },
              })}
            >
              <Switch
                size="small"
                checked={included}
                tabIndex={-1}
                sx={{ pointerEvents: "none" }}
                slotProps={{
                  input: {
                    tabIndex: -1,
                    "aria-hidden": true,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                  whiteSpace: "nowrap",
                })}
              >
                {label}
              </Typography>
            </Stack>
          );
        },
      },
      {
        field: "assetName",
        headerName: "Asset name",
        flex: 1,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <Link
            href="#"
            underline="hover"
            onClick={(e: React.MouseEvent) => e.preventDefault()}
            sx={{ fontSize: 16, lineHeight: "24px" }}
          >
            {params.value as string}
          </Link>
        ),
      },
      {
        field: "assetType",
        headerName: "Asset type",
        width: 140,
      },
      {
        field: "cyberRisks",
        headerName: "Cyber risks",
        width: 120,
        type: "number",
        align: "left",
        headerAlign: "left",
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <NumericLink
            value={params.value as number}
            ariaLabel={`Cyber risks for ${params.row.assetName}: ${params.value}`}
          />
        ),
      },
      {
        field: "criticality",
        headerName: "Criticality",
        width: 180,
        sortable: true,
        valueGetter: (_v, row) => row.criticality,
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <CriticalityCell level={params.row.criticality} />
        ),
      },
      {
        field: "objectives",
        headerName: "Objectives",
        width: 110,
        type: "number",
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <NumericLink
            value={params.value as number}
            ariaLabel={`Objectives for ${params.row.assetName}`}
          />
        ),
      },
      {
        field: "processes",
        headerName: "Processes",
        width: 110,
        type: "number",
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <NumericLink
            value={params.value as number}
            ariaLabel={`Processes for ${params.row.assetName}`}
          />
        ),
      },
    ],
    [rows, setRows, setIncluded],
  );

  return (
    <Box sx={{ width: "100%", pt: 2, pb: 3, minHeight: 520 }}>
      <DataGridPro
        rows={filteredRows}
        columns={columns}
        pagination
        autoHeight
        pinnedColumnsSectionSeparator="border"
        pinnedRowsSectionSeparator="border"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50]}
        showToolbar
        slots={{
          toolbar: () => (
            <ScopeToolbar
              view={view}
              onViewChange={handleViewChange}
              totalCount={rows.length}
              includedCount={includedCount}
            />
          ),
        }}
        disableRowSelectionOnClick
        getRowId={(r) => r.id}
        slotProps={{
          main: {
            "aria-label":
              "Assessment scope assets. Use the first column to include or exclude assets.",
          },
          basePagination: {
            material: { labelRowsPerPage: "Rows" },
          },
        }}
        initialState={{
          sorting: {
            sortModel: [{ field: "assetName", sort: "asc" }],
          },
        }}
        sx={({ tokens: t }) => ({
          border: "none",
          borderRadius: t.semantic.radius.md.value,
          // DataGrid Pro defaults add inset scroll shadows; match flat grids elsewhere in the app.
          "& .MuiDataGrid-scrollShadow": {
            display: "none",
          },
          "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": {
            boxShadow: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: t.semantic.color.surface.variant.value,
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
  );
}
