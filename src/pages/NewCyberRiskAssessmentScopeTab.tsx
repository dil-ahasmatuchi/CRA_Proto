import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
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
import { assets } from "../data/assets.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { threats } from "../data/threats.js";
import { vulnerabilities } from "../data/vulnerabilities.js";
import { getUserById } from "../data/users.js";
import type {
  FivePointScaleValue,
  MockCyberRisk,
  MockThreat,
  MockVulnerability,
} from "../data/types.js";
import {
  scopedCyberRisks,
  scopedThreats,
  scopedVulnerabilities,
  SCOPE_CATALOG_TOTALS,
} from "./scopeAssessmentRollup.js";

export type ScopeSubView =
  | "overview"
  | "assets"
  | "scopedCyberRisks"
  | "scopedThreats"
  | "scopedVulnerabilities";

type ScopeViewFilter = "all" | "included" | "excluded";

export type ScopeAssetRow = {
  id: number;
  assetId: string;
  included: boolean;
  assetName: string;
  assetType: string;
  cyberRisks: number;
  threats: number;
  vulnerabilities: number;
  criticality: FivePointScaleValue;
  objectives: number;
  processes: number;
};

const CRITICALITY_META: Record<
  FivePointScaleValue,
  { label: string; rag: RagDataVizKey }
> = {
  5: { label: "5 - Very high", rag: "neg05" },
  4: { label: "4 - High", rag: "neg03" },
  3: { label: "3 - Medium", rag: "neu03" },
  2: { label: "2 - Low", rag: "pos04" },
  1: { label: "1 - Very low", rag: "pos05" },
};

function buildScopeRows(): ScopeAssetRow[] {
  const crCountByAsset = new Map<string, number>();
  for (const cr of cyberRisks) {
    for (const aid of cr.assetIds) {
      crCountByAsset.set(aid, (crCountByAsset.get(aid) ?? 0) + 1);
    }
  }

  const threatCountByAsset = new Map<string, number>();
  for (const t of threats) {
    for (const aid of t.assetIds) {
      threatCountByAsset.set(aid, (threatCountByAsset.get(aid) ?? 0) + 1);
    }
  }

  const vulnCountByAsset = new Map<string, number>();
  for (const v of vulnerabilities) {
    for (const aid of v.assetIds) {
      vulnCountByAsset.set(aid, (vulnCountByAsset.get(aid) ?? 0) + 1);
    }
  }

  return assets.map((a, i) => ({
    id: i + 1,
    assetId: a.id,
    included: false,
    assetName: a.name,
    assetType: a.assetType,
    cyberRisks: crCountByAsset.get(a.id) ?? 0,
    threats: threatCountByAsset.get(a.id) ?? 0,
    vulnerabilities: vulnCountByAsset.get(a.id) ?? 0,
    criticality: a.criticality,
    objectives: ((i + 3) % 12) + 1,
    processes: ((i + 5) % 20) + 1,
  }));
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

function ScopeEntitySlimToolbar({ ariaLabel }: { ariaLabel: string }) {
  return (
    <Toolbar aria-label={ariaLabel}>
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
    </Toolbar>
  );
}

function CriticalityCell({ level }: { level: FivePointScaleValue }) {
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
  onBulkRowIdsIncluded,
}: {
  rows: ScopeAssetRow[];
  onBulkRowIdsIncluded: (dataGridRowIds: number[], included: boolean) => void;
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
    const everyOnPageIncluded = ids.every(
      (id) => rows.find((r) => r.id === id)?.included === true,
    );
    const nextIncluded = !everyOnPageIncluded;
    onBulkRowIdsIncluded(ids, nextIncluded);
  }, [apiRef, rows, onBulkRowIdsIncluded]);

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
  onCardClick,
  cardActionAriaLabel,
}: {
  title: string;
  icon: React.ReactNode;
  includedCount: number;
  totalCount: number;
  /** Shown after the fraction, e.g. “Assets” → “0 / 124 Assets”. */
  countNoun: string;
  trailingAction?: React.ReactNode;
  onCardClick?: () => void;
  cardActionAriaLabel?: string;
}) {
  const inner = (
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
  );

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
      {onCardClick ? (
        <CardActionArea
          onClick={onCardClick}
          aria-label={cardActionAriaLabel ?? `View ${title} included in this assessment`}
          sx={{
            alignItems: "stretch",
            justifyContent: "flex-start",
            "& .MuiCardActionArea-focusHighlight": {
              opacity: 0,
            },
          }}
        >
          {inner}
        </CardActionArea>
      ) : (
        inner
      )}
    </Card>
  );
}

function ScopeOverviewCards({
  totalAssets,
  includedAssets,
  includedCyberRisks,
  includedThreats,
  includedVulnerabilities,
  onEditAssetsScope,
  onOpenCyberRisks,
  onOpenThreats,
  onOpenVulnerabilities,
}: {
  totalAssets: number;
  includedAssets: number;
  includedCyberRisks: number;
  includedThreats: number;
  includedVulnerabilities: number;
  onEditAssetsScope: () => void;
  onOpenCyberRisks: () => void;
  onOpenThreats: () => void;
  onOpenVulnerabilities: () => void;
}) {
  const { presets } = useTheme();
  const CardHeaderIcon = presets.CardComponentsPresets?.components?.CardHeaderIcon;

  const wrapHeaderIcon = (icon: React.ReactElement) =>
    CardHeaderIcon ? <CardHeaderIcon icon={icon} /> : icon;

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
          includedCount={includedCyberRisks}
          totalCount={SCOPE_CATALOG_TOTALS.cyberRisks}
          countNoun="Cyber risks"
          onCardClick={onOpenCyberRisks}
          cardActionAriaLabel="View cyber risks included in this assessment"
        />
        <ScopeObjectTypeCard
          title="Threats"
          icon={wrapHeaderIcon(<HistoryIcon size="lg" aria-hidden />)}
          includedCount={includedThreats}
          totalCount={SCOPE_CATALOG_TOTALS.threats}
          countNoun="Threats"
          onCardClick={onOpenThreats}
          cardActionAriaLabel="View threats included in this assessment"
        />
        <ScopeObjectTypeCard
          title="Vulnerabilities"
          icon={wrapHeaderIcon(<DocumentIcon size="lg" aria-hidden />)}
          includedCount={includedVulnerabilities}
          totalCount={SCOPE_CATALOG_TOTALS.vulnerabilities}
          countNoun="Vulnerabilities"
          onCardClick={onOpenVulnerabilities}
          cardActionAriaLabel="View vulnerabilities included in this assessment"
        />
      </Box>
    </Stack>
  );
}

function ScopeAssetsDataGrid({
  rows,
  onToggleAssetIncluded,
  onBulkRowIdsIncluded,
}: {
  rows: ScopeAssetRow[];
  onToggleAssetIncluded: (assetId: string, included: boolean) => void;
  onBulkRowIdsIncluded: (dataGridRowIds: number[], included: boolean) => void;
}) {
  const [view, setView] = useState<ScopeViewFilter>("all");
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const includedCount = useMemo(() => rows.filter((r) => r.included).length, [rows]);

  const filteredRows = useMemo(() => {
    if (view === "included") return rows.filter((r) => r.included);
    if (view === "excluded") return rows.filter((r) => !r.included);
    return rows;
  }, [rows, view]);

  const setIncluded = useCallback(
    (id: number, included: boolean) => {
      const row = rows.find((r) => r.id === id);
      if (row) onToggleAssetIncluded(row.assetId, included);
    },
    [rows, onToggleAssetIncluded],
  );

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
          <ScopeIncludedColumnHeader rows={rows} onBulkRowIdsIncluded={onBulkRowIdsIncluded} />
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
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <NumericLink
            value={params.value as number}
            ariaLabel={`Threats for ${params.row.assetName}: ${params.value}`}
          />
        ),
      },
      {
        field: "vulnerabilities",
        headerName: "Vulnerabilities",
        width: 140,
        type: "number",
        align: "left",
        headerAlign: "left",
        renderCell: (params: GridRenderCellParams<ScopeAssetRow>) => (
          <NumericLink
            value={params.value as number}
            ariaLabel={`Vulnerabilities for ${params.row.assetName}: ${params.value}`}
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
    [rows, onBulkRowIdsIncluded, setIncluded],
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

function ScopeScopedCyberRisksGrid({
  rows,
  hasIncludedAssets,
}: {
  rows: MockCyberRisk[];
  hasIncludedAssets: boolean;
}) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const columns: GridColDef<MockCyberRisk>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 240,
        renderCell: (params: GridRenderCellParams<MockCyberRisk>) => (
          <Link href="#" underline="hover" onClick={(e: React.MouseEvent) => e.preventDefault()}>
            {params.value as string}
          </Link>
        ),
      },
      { field: "id", headerName: "ID", width: 110 },
      { field: "status", headerName: "Workflow status", width: 140 },
      {
        field: "cyberRiskScoreCombined",
        headerName: "Cyber risk score",
        width: 180,
        valueGetter: (_v, row) => `${row.cyberRiskScore} - ${row.cyberRiskScoreLabel}`,
      },
      {
        field: "ownerId",
        headerName: "Owner",
        width: 200,
        valueGetter: (_v, row) => getUserById(row.ownerId)?.fullName ?? "Unassigned",
      },
    ],
    [],
  );

  return (
    <Stack gap={2} sx={{ width: "100%", pt: 2, pb: 3 }}>
      {rows.length === 0 ? (
        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({ color: t.semantic.color.type.muted.value })}
        >
          {hasIncludedAssets
            ? "No cyber risks are linked to the assets in scope."
            : "Include assets in this assessment to see related cyber risks."}
        </Typography>
      ) : null}
      <Box sx={{ width: "100%", minHeight: 400 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          pagination
          autoHeight
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          showToolbar
          slots={{
            toolbar: () => (
              <ScopeEntitySlimToolbar ariaLabel="Scoped cyber risks toolbar" />
            ),
          }}
          disableRowSelectionOnClick
          slotProps={{
            main: { "aria-label": "Cyber risks linked to assets in assessment scope." },
            basePagination: { material: { labelRowsPerPage: "Rows" } },
          }}
          initialState={{
            sorting: { sortModel: [{ field: "name", sort: "asc" }] },
          }}
          sx={({ tokens: t }) => ({
            border: "none",
            borderRadius: t.semantic.radius.md.value,
            "& .MuiDataGrid-scrollShadow": { display: "none" },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": { boxShadow: "none" },
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
    </Stack>
  );
}

function ScopeScopedThreatsGrid({
  rows,
  hasIncludedAssets,
}: {
  rows: MockThreat[];
  hasIncludedAssets: boolean;
}) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const columns: GridColDef<MockThreat>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 240,
        renderCell: (params: GridRenderCellParams<MockThreat>) => (
          <Link href="#" underline="hover" onClick={(e: React.MouseEvent) => e.preventDefault()}>
            {params.value as string}
          </Link>
        ),
      },
      { field: "id", headerName: "ID", width: 110 },
      {
        field: "domain",
        headerName: "Threat domain",
        flex: 1,
        minWidth: 200,
      },
      { field: "source", headerName: "Source", width: 130 },
      { field: "status", headerName: "Status", width: 120 },
      {
        field: "ownerId",
        headerName: "Owner",
        width: 200,
        valueGetter: (_v, row) => getUserById(row.ownerId)?.fullName ?? "Unassigned",
      },
    ],
    [],
  );

  return (
    <Stack gap={2} sx={{ width: "100%", pt: 2, pb: 3 }}>
      {rows.length === 0 ? (
        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({ color: t.semantic.color.type.muted.value })}
        >
          {hasIncludedAssets
            ? "No threats are linked to the assets in scope."
            : "Include assets in this assessment to see related threats."}
        </Typography>
      ) : null}
      <Box sx={{ width: "100%", minHeight: 400 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          pagination
          autoHeight
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          showToolbar
          slots={{
            toolbar: () => <ScopeEntitySlimToolbar ariaLabel="Scoped threats toolbar" />,
          }}
          disableRowSelectionOnClick
          slotProps={{
            main: { "aria-label": "Threats linked to assets in assessment scope." },
            basePagination: { material: { labelRowsPerPage: "Rows" } },
          }}
          initialState={{
            sorting: { sortModel: [{ field: "name", sort: "asc" }] },
          }}
          sx={({ tokens: t }) => ({
            border: "none",
            borderRadius: t.semantic.radius.md.value,
            "& .MuiDataGrid-scrollShadow": { display: "none" },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": { boxShadow: "none" },
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
    </Stack>
  );
}

function ScopeScopedVulnerabilitiesGrid({
  rows,
  hasIncludedAssets,
}: {
  rows: MockVulnerability[];
  hasIncludedAssets: boolean;
}) {
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const columns: GridColDef<MockVulnerability>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 240,
        renderCell: (params: GridRenderCellParams<MockVulnerability>) => (
          <Link href="#" underline="hover" onClick={(e: React.MouseEvent) => e.preventDefault()}>
            {params.value as string}
          </Link>
        ),
      },
      { field: "id", headerName: "ID", width: 110 },
      { field: "domain", headerName: "Domain", width: 130 },
      { field: "status", headerName: "Status", width: 120 },
      { field: "primaryCIAImpact", headerName: "Primary CIA impact", width: 160 },
      {
        field: "ownerId",
        headerName: "Owner",
        width: 200,
        valueGetter: (_v, row) => getUserById(row.ownerId)?.fullName ?? "Unassigned",
      },
    ],
    [],
  );

  return (
    <Stack gap={2} sx={{ width: "100%", pt: 2, pb: 3 }}>
      {rows.length === 0 ? (
        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({ color: t.semantic.color.type.muted.value })}
        >
          {hasIncludedAssets
            ? "No vulnerabilities are linked to the assets in scope."
            : "Include assets in this assessment to see related vulnerabilities."}
        </Typography>
      ) : null}
      <Box sx={{ width: "100%", minHeight: 400 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          getRowId={(r) => r.id}
          pagination
          autoHeight
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          showToolbar
          slots={{
            toolbar: () => (
              <ScopeEntitySlimToolbar ariaLabel="Scoped vulnerabilities toolbar" />
            ),
          }}
          disableRowSelectionOnClick
          slotProps={{
            main: { "aria-label": "Vulnerabilities linked to assets in assessment scope." },
            basePagination: { material: { labelRowsPerPage: "Rows" } },
          }}
          initialState={{
            sorting: { sortModel: [{ field: "name", sort: "asc" }] },
          }}
          sx={({ tokens: t }) => ({
            border: "none",
            borderRadius: t.semantic.radius.md.value,
            "& .MuiDataGrid-scrollShadow": { display: "none" },
            "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": { boxShadow: "none" },
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
    </Stack>
  );
}

type NewCyberRiskAssessmentScopeTabProps = {
  scopeSubView: ScopeSubView;
  onScopeSubViewChange: (view: ScopeSubView) => void;
  includedAssetIds: Set<string>;
  onToggleAssetIncluded: (assetId: string, included: boolean) => void;
  onBulkAssetIdsIncluded: (assetIds: string[], included: boolean) => void;
};

export default function NewCyberRiskAssessmentScopeTab({
  scopeSubView,
  onScopeSubViewChange,
  includedAssetIds,
  onToggleAssetIncluded,
  onBulkAssetIdsIncluded,
}: NewCyberRiskAssessmentScopeTabProps) {
  const rows = useMemo(
    () =>
      buildScopeRows().map((r) => ({
        ...r,
        included: includedAssetIds.has(r.assetId),
      })),
    [includedAssetIds],
  );

  const includedCount = includedAssetIds.size;

  const handleBulkRowIdsIncluded = useCallback(
    (rowIds: number[], included: boolean) => {
      const assetIds = rowIds
        .map((id) => rows.find((r) => r.id === id)?.assetId)
        .filter((x): x is string => Boolean(x));
      onBulkAssetIdsIncluded(assetIds, included);
    },
    [rows, onBulkAssetIdsIncluded],
  );

  const scopedCrRows = useMemo(
    () => scopedCyberRisks(includedAssetIds),
    [includedAssetIds],
  );
  const scopedThreatRows = useMemo(() => scopedThreats(includedAssetIds), [includedAssetIds]);
  const scopedVulnRows = useMemo(
    () => scopedVulnerabilities(includedAssetIds),
    [includedAssetIds],
  );

  if (scopeSubView === "assets") {
    return (
      <ScopeAssetsDataGrid
        rows={rows}
        onToggleAssetIncluded={onToggleAssetIncluded}
        onBulkRowIdsIncluded={handleBulkRowIdsIncluded}
      />
    );
  }

  if (scopeSubView === "scopedCyberRisks") {
    return (
      <ScopeScopedCyberRisksGrid rows={scopedCrRows} hasIncludedAssets={includedCount > 0} />
    );
  }

  if (scopeSubView === "scopedThreats") {
    return (
      <ScopeScopedThreatsGrid rows={scopedThreatRows} hasIncludedAssets={includedCount > 0} />
    );
  }

  if (scopeSubView === "scopedVulnerabilities") {
    return (
      <ScopeScopedVulnerabilitiesGrid
        rows={scopedVulnRows}
        hasIncludedAssets={includedCount > 0}
      />
    );
  }

  return (
    <ScopeOverviewCards
      totalAssets={rows.length}
      includedAssets={includedCount}
      includedCyberRisks={scopedCrRows.length}
      includedThreats={scopedThreatRows.length}
      includedVulnerabilities={scopedVulnRows.length}
      onEditAssetsScope={() => onScopeSubViewChange("assets")}
      onOpenCyberRisks={() => onScopeSubViewChange("scopedCyberRisks")}
      onOpenThreats={() => onScopeSubViewChange("scopedThreats")}
      onOpenVulnerabilities={() => onScopeSubViewChange("scopedVulnerabilities")}
    />
  );
}
