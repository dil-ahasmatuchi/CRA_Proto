import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Link,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
  gridPaginatedVisibleSortedGridRowIdsSelector,
  useGridApiContext,
  useGridSelector,
} from "@mui/x-data-grid-pro";

import CertCyberRiskStrategyIcon from "@diligentcorp/atlas-react-bundle/icons/CertCyberRiskStrategy";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";
import DocumentIcon from "@diligentcorp/atlas-react-bundle/icons/Document";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import FolderIcon from "@diligentcorp/atlas-react-bundle/icons/Folder";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";
import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";

import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";

export type ScopeSubView = "overview" | "assets";

type ScopeViewFilter = "all" | "included" | "excluded";

export type ScopeAssetRow = {
  id: number;
  included: boolean;
  assetName: string;
  assetType: string;
  cyberRisks: number;
  threats: number;
  vulnerabilities: number;
  criticality: 2 | 3 | 4 | 5;
  objectives: number;
  processes: number;
};

const CRITICALITY_META: Record<
  ScopeAssetRow["criticality"],
  { label: string; rag: RagDataVizKey }
> = {
  5: { label: "5 - Very high", rag: "neg05" },
  4: { label: "4 - High", rag: "neg03" },
  3: { label: "3 - Medium", rag: "neu03" },
  2: { label: "2 - Low", rag: "pos04" },
};

const SEED_ROWS: Omit<ScopeAssetRow, "id">[] = [
  {
    included: false,
    assetName: "Vendor master database",
    assetType: "Database",
    cyberRisks: 5,
    threats: 4,
    vulnerabilities: 6,
    criticality: 5,
    objectives: 4,
    processes: 20,
  },
  {
    included: false,
    assetName: "Payment gateway API",
    assetType: "API",
    cyberRisks: 4,
    threats: 3,
    vulnerabilities: 5,
    criticality: 4,
    objectives: 8,
    processes: 14,
  },
  {
    included: false,
    assetName: "Customer database",
    assetType: "Data",
    cyberRisks: 3,
    threats: 2,
    vulnerabilities: 4,
    criticality: 5,
    objectives: 12,
    processes: 16,
  },
  {
    included: false,
    assetName: "HR employee portal",
    assetType: "Software",
    cyberRisks: 2,
    threats: 2,
    vulnerabilities: 3,
    criticality: 3,
    objectives: 6,
    processes: 9,
  },
  {
    included: false,
    assetName: "Email security gateway",
    assetType: "Infrastructure",
    cyberRisks: 6,
    threats: 5,
    vulnerabilities: 7,
    criticality: 4,
    objectives: 3,
    processes: 11,
  },
  {
    included: false,
    assetName: "Backup storage cluster",
    assetType: "Data",
    cyberRisks: 1,
    threats: 1,
    vulnerabilities: 2,
    criticality: 3,
    objectives: 2,
    processes: 5,
  },
  {
    included: false,
    assetName: "Identity provider service",
    assetType: "API",
    cyberRisks: 7,
    threats: 6,
    vulnerabilities: 8,
    criticality: 5,
    objectives: 9,
    processes: 18,
  },
  {
    included: false,
    assetName: "Main data center servers",
    assetType: "Infrastructure",
    cyberRisks: 2,
    threats: 2,
    vulnerabilities: 2,
    criticality: 2,
    objectives: 2,
    processes: 2,
  },
  {
    included: false,
    assetName: "Claims processing system",
    assetType: "Software",
    cyberRisks: 4,
    threats: 3,
    vulnerabilities: 5,
    criticality: 4,
    objectives: 7,
    processes: 13,
  },
  {
    included: false,
    assetName: "Document management store",
    assetType: "Database",
    cyberRisks: 3,
    threats: 2,
    vulnerabilities: 4,
    criticality: 3,
    objectives: 5,
    processes: 8,
  },
];

/** Backfill counts when row state predates threats/vulnerabilities fields (e.g. Fast Refresh). */
function withScopeCountFields(row: ScopeAssetRow): ScopeAssetRow {
  const threats = typeof row.threats === "number" ? row.threats : (row.id % 7) + 1;
  const vulnerabilities =
    typeof row.vulnerabilities === "number" ? row.vulnerabilities : (row.id % 9) + 1;
  return { ...row, threats, vulnerabilities };
}

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
      threats: (id % 7) + 1,
      vulnerabilities: (id % 9) + 1,
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
    <Toolbar
      aria-label="Scope assets toolbar"
    >
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
      <ColumnsPanelTrigger
        render={(props) => (
          <Button {...props} startIcon={<ColumnsIcon />} aria-label="Select columns">
            Columns
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
        sx={({ tokens: t }) => ({
          width: 14,
          height: 14,
          flexShrink: 0,
          bgcolor: ragDataVizColor(t, meta.rag),
          borderRadius: 0.5,
        })}
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
      sx={({ tokens: t }) => ({
        cursor: "pointer",
        fontWeight: 400,
        fontSize: 16,
        lineHeight: "24px",
        color: t.semantic.color.action.link.default.value,
        verticalAlign: "inherit",
      })}
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

/** Scope object card: icon + title + trailing action row; “Included in this assessment” + count (Figma). */
function ScopeObjectTypeCard({
  title,
  icon,
  includedCount,
  totalCount,
  countNoun,
  trailingAction,
}: {
  title: string;
  icon: React.ReactNode;
  includedCount: number;
  totalCount: number;
  /** Shown after the fraction, e.g. “Assets” → “0 / 124 Assets”. */
  countNoun: string;
  trailingAction?: React.ReactNode;
}) {
  return (
    <Card
      variant="outlined"
      sx={({ tokens: t }) => ({
        minWidth: 0,
        width: "100%",
        borderRadius: t.semantic.radius.lg.value,
        borderStyle: "solid",
        borderColor: t.semantic.color.ui.divider.default.value,
        borderWidth: t.semantic.borderWidth.thin.value,
        bgcolor: t.semantic.color.background.base.value,
        boxShadow: "none",
      })}
    >
      <CardContent
        sx={{
          pt: 0,
          px: 0,
          pb: 3,
          "&:last-child": { pb: 3 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto minmax(0, 1fr) auto",
            gridTemplateRows: "auto auto",
            columnGap: 1.5,
            rowGap: 2,
            alignItems: "start",
          }}
        >
          <Box
            sx={({ tokens: t }) => ({
              gridRow: "1 / 3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: t.semantic.radius.md.value,
              bgcolor: t.semantic.color.surface.variant.value,
              color: t.semantic.color.type.default.value,
              flexShrink: 0,
            })}
          >
            {icon}
          </Box>
          <Typography
            component="h3"
            variant="h3"
            fontWeight={600}
            sx={({ tokens: t }) => ({
              gridColumn: 2,
              gridRow: 1,
              color: t.semantic.color.type.default.value,
              alignSelf: "center",
            })}
          >
            {title}
          </Typography>
          {trailingAction ? (
            <Box
              sx={{
                gridColumn: 3,
                gridRow: 1,
                justifySelf: "end",
                alignSelf: "center",
              }}
            >
              {trailingAction}
            </Box>
          ) : null}
          <Stack
            gap={0.5}
            sx={{ gridColumn: "2 / 4", gridRow: 2, minWidth: 0 }}
            aria-label={`${title} scope counts`}
          >
            <Typography
              variant="caption"
              component="p"
              sx={({ tokens: t }) => ({
                m: 0,
                color: t.semantic.color.type.muted.value,
                letterSpacing: "0.3px",
                fontSize: t.semantic.font.label.sm.fontSize.value,
                lineHeight: t.semantic.font.label.sm.lineHeight.value,
              })}
            >
              Included in this assessment
            </Typography>
            <Typography
              component="p"
              variant="body1"
              sx={({ tokens: t }) => ({
                m: 0,
                color: t.semantic.color.type.default.value,
                letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                lineHeight: t.semantic.font.text.md.lineHeight.value,
                fontSize: t.semantic.font.text.md.fontSize.value,
              })}
            >
              <Box component="span" sx={{ fontWeight: 700 }}>
                {includedCount}
              </Box>
              <Box component="span" sx={{ fontWeight: 400 }}>
                {` / ${totalCount} ${countNoun}`}
              </Box>
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

function ScopeOverviewCards({
  totalAssets,
  includedAssets,
  onEditAssetsScope,
}: {
  totalAssets: number;
  includedAssets: number;
  onEditAssetsScope: () => void;
}) {
  const { presets } = useTheme();
  const CardHeaderIcon = presets.CardComponentsPresets?.components?.CardHeaderIcon;

  const wrapHeaderIcon = (icon: React.ReactElement) =>
    CardHeaderIcon ? <CardHeaderIcon icon={icon} /> : icon;

  const hasScopedAssets = includedAssets > 0;

  const editScopeAction = (
    <Button
      variant="text"
      size="medium"
      onClick={onEditAssetsScope}
      aria-label="Edit assets scope"
      sx={({ tokens: t }) => ({
        fontWeight: 600,
        color: t.semantic.color.type.default.value,
        textTransform: "none",
        whiteSpace: "nowrap",
      })}
    >
      Edit scope
    </Button>
  );

  return (
    <Stack gap={3} sx={{ pt: 3, pb: 4, width: "100%" }}>
      <Box
        sx={{
          display: "grid",
          width: "100%",
          gridTemplateColumns: "1fr",
          gap: 2,
          alignItems: "stretch",
        }}
      >
        <ScopeObjectTypeCard
          title="Assets"
          icon={wrapHeaderIcon(<FolderIcon size="lg" aria-hidden />)}
          includedCount={includedAssets}
          totalCount={totalAssets}
          countNoun="Assets"
          trailingAction={editScopeAction}
        />
        <ScopeObjectTypeCard
          title="Cyber risks"
          icon={wrapHeaderIcon(<CertCyberRiskStrategyIcon size="lg" aria-hidden />)}
          includedCount={hasScopedAssets ? 12 : 0}
          totalCount={12}
          countNoun="Cyber risks"
        />
        <ScopeObjectTypeCard
          title="Threats"
          icon={wrapHeaderIcon(<HistoryIcon size="lg" aria-hidden />)}
          includedCount={hasScopedAssets ? 8 : 0}
          totalCount={18}
          countNoun="Threats"
        />
        <ScopeObjectTypeCard
          title="Vulnerabilities"
          icon={wrapHeaderIcon(<DocumentIcon size="lg" aria-hidden />)}
          includedCount={hasScopedAssets ? 6 : 0}
          totalCount={24}
          countNoun="Vulnerabilities"
        />
      </Box>
    </Stack>
  );
}

function ScopeAssetsDataGrid({
  rows,
  setRows,
}: {
  rows: ScopeAssetRow[];
  setRows: Dispatch<SetStateAction<ScopeAssetRow[]>>;
}) {
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
  }, [setRows]);

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
        field: "threats",
        headerName: "Threats",
        width: 120,
        type: "number",
        align: "left",
        headerAlign: "left",
        valueGetter: (_value, row) => withScopeCountFields(row).threats,
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => {
          const n = withScopeCountFields(params.row).threats;
          return (
            <NumericLink
              value={n}
              ariaLabel={`Threats for ${params.row.assetName}: ${n}`}
            />
          );
        },
      },
      {
        field: "vulnerabilities",
        headerName: "Vulnerabilities",
        width: 140,
        type: "number",
        align: "left",
        headerAlign: "left",
        valueGetter: (_value, row) => withScopeCountFields(row).vulnerabilities,
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => {
          const n = withScopeCountFields(params.row).vulnerabilities;
          return (
            <NumericLink
              value={n}
              ariaLabel={`Vulnerabilities for ${params.row.assetName}: ${n}`}
            />
          );
        },
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

type NewCyberRiskAssessmentScopeTabProps = {
  scopeSubView: ScopeSubView;
  onScopeSubViewChange: (view: ScopeSubView) => void;
};

export default function NewCyberRiskAssessmentScopeTab({
  scopeSubView,
  onScopeSubViewChange,
}: NewCyberRiskAssessmentScopeTabProps) {
  const [rows, setRows] = useState<ScopeAssetRow[]>(() => buildScopeRows().map(withScopeCountFields));

  useEffect(() => {
    setRows((prev) => {
      if (!prev.some((r) => typeof r.threats !== "number" || typeof r.vulnerabilities !== "number")) {
        return prev;
      }
      return prev.map(withScopeCountFields);
    });
  }, []);

  const includedCount = useMemo(() => rows.filter((r) => r.included).length, [rows]);

  if (scopeSubView === "assets") {
    return <ScopeAssetsDataGrid rows={rows} setRows={setRows} />;
  }

  return (
    <ScopeOverviewCards
      totalAssets={rows.length}
      includedAssets={includedCount}
      onEditAssetsScope={() => onScopeSubViewChange("assets")}
    />
  );
}
