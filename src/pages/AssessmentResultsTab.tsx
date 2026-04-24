import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { SectionHeader } from "@diligentcorp/atlas-react-bundle";

import AssessmentScopeEmptyState from "../components/AssessmentScopeEmptyState.js";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Link,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { Chart as ChartJS, ArcElement, Legend as ChartLegend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import MitigationPlanSideSheet from "../components/MitigationPlanSideSheet.js";
import RisksMatrix from "../components/RisksMatrix.js";
import { assets } from "../data/assets.js";
import { type CraRagKey } from "../data/craScoringScenarioLibrary.js";
import {
  buildAssetResultRowsForScope,
  buildCyberResultsRowsForScope,
  type AssessmentAssetResultRow,
  type AssessmentCyberResultsRow,
} from "./craAssessmentScopeRows.js";
import {
  RAG_DATA_VIZ_CANVAS_FALLBACK,
  ragDataVizColor,
  resolveColorForCanvas,
} from "../data/ragDataVisualization.js";
import { assessmentScopedCyberRisks } from "../data/assessmentScopeRollup.js";

ChartJS.register(ArcElement, Tooltip, ChartLegend);

/** Solid white gaps between arcs; theme tokens can resolve to hues that read as yellow on canvas. */
const DONUT_SEGMENT_BORDER = "#ffffff";

type ScoreChip = { numeric: string; label: string; rag: CraRagKey };

function ResultsRiskChip({ value }: { value: ScoreChip }) {
  return (
    <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16, py: 1 }}>
      <Box
        sx={({ tokens: t }) => ({
          width: 16,
          height: 16,
          borderRadius: t.semantic.radius.sm.value,
          flexShrink: 0,
          bgcolor: ragDataVizColor(t, value.rag),
        })}
      />
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.label.xs.fontSize.value,
          lineHeight: t.semantic.font.label.xs.lineHeight.value,
          letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
          fontWeight: t.semantic.font.label.xs.fontWeight.value,
          color: t.semantic.color.type.default.value,
          whiteSpace: "nowrap",
        })}
      >
        {value.numeric} - {value.label}
      </Typography>
    </Stack>
  );
}

const DONUT_SEGMENTS = [
  { range: "101 - 125", label: "Very high", count: null, colorKey: "neg05" as CraRagKey },
  { range: "76 - 100", label: "High", count: 2, colorKey: "neg03" as CraRagKey },
  { range: "51 - 75", label: "Medium", count: 1, colorKey: "neu03" as CraRagKey },
  { range: "26 - 50", label: "Low", count: 2, colorKey: "pos04" as CraRagKey },
  { range: "1 - 25", label: "Very low", count: null, colorKey: "pos05" as CraRagKey },
];

type CyberResultsRow = AssessmentCyberResultsRow;
type AssetResultRow = AssessmentAssetResultRow;

function ResultsNameCell({
  row,
  expanded,
  onToggle,
}: {
  row: CyberResultsRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isGroup = row.kind === "cyberRisk";
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        py: 1,
        minHeight: 56,
        pl: isGroup ? 0 : 4,
      }}
    >
      {isGroup ? (
        <IconButton
          size="small"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse cyber risk" : "Expand cyber risk"}
          sx={{ mt: 0.25, p: 0.5 }}
        >
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
              transition: "transform 0.2s",
            }}
          >
            <ExpandDownIcon aria-hidden />
          </Box>
        </IconButton>
      ) : null}
      <Typography
        sx={({ tokens: t }) => ({
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          color: t.semantic.color.type.default.value,
          fontWeight: isGroup ? 600 : 400,
          minWidth: 0,
        })}
      >
        {row.name}
      </Typography>
    </Stack>
  );
}

function CyberRisksResultsTable({
  visibleRows,
  expanded,
  onToggleGroup,
  onOpenMitigationPlan,
}: {
  visibleRows: CyberResultsRow[];
  expanded: Record<string, boolean>;
  onToggleGroup: (groupId: string) => void;
  onOpenMitigationPlan: (row: CyberResultsRow) => void;
}) {
  return (
    <TableContainer
      sx={({ tokens: t }) => ({
        overflowX: "auto",
        borderRadius: t.semantic.radius.md.value,
        bgcolor: t.semantic.color.background.base.value,
      })}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          tableLayout: "fixed",
          width: "100%",
          minWidth: 1100,
          borderCollapse: "separate",
          borderSpacing: 0,
          "& .MuiTableCell-root": {
            borderBottom: ({ tokens: t }) => `1px solid ${t.semantic.color.ui.divider.default.value}`,
          },
          "& .MuiTableBody-root .MuiTableCell-root": {
            verticalAlign: "middle",
          },
        }}
      >
        <colgroup>
          <col style={{ width: 360 }} />
          <col style={{ width: 130 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 170 }} />
          <col style={{ width: 120 }} />
          <col style={{ width: 150 }} />
          <col style={{ width: 176 }} />
        </colgroup>
        <TableHead>
          <TableRow
            sx={({ tokens: t }) => ({
              "& .MuiTableCell-head": {
                bgcolor: t.semantic.color.background.container.value,
                fontSize: t.semantic.font.label.sm.fontSize.value,
                lineHeight: t.semantic.font.label.sm.lineHeight.value,
                letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
                fontWeight: 600,
                color: t.semantic.color.type.default.value,
                py: 0.5,
                px: 2,
                verticalAlign: "middle",
              },
            })}
          >
            <TableCell
              sx={({ tokens: t }) => ({
                position: "sticky",
                left: 0,
                zIndex: 3,
                bgcolor: t.semantic.color.background.container.value,
              })}
            >
              Name
            </TableCell>
            <TableCell>Impact</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>Threat severity</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>Vulnerability severity</TableCell>
            <TableCell>Likelihood</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>Cyber risk score</TableCell>
            <TableCell sx={{ whiteSpace: "nowrap" }}>Mitigation plan</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map((row) => (
            <TableRow key={row.id}>
              <TableCell
                sx={({ tokens: t }) => ({
                  position: "sticky",
                  left: 0,
                  zIndex: 2,
                  bgcolor: t.semantic.color.background.base.value,
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                })}
              >
                <ResultsNameCell
                  row={row}
                  expanded={expanded[row.groupId] !== false}
                  onToggle={() => onToggleGroup(row.groupId)}
                />
              </TableCell>
              <TableCell sx={{ px: 2, py: 0 }}>
                <ResultsRiskChip value={row.impact} />
              </TableCell>
              <TableCell sx={{ px: 2, py: 0 }}>
                <ResultsRiskChip value={row.threat} />
              </TableCell>
              <TableCell sx={{ px: 2, py: 0 }}>
                <ResultsRiskChip value={row.vulnerability} />
              </TableCell>
              <TableCell sx={{ px: 2, py: 0 }}>
                <ResultsRiskChip value={row.likelihood} />
              </TableCell>
              <TableCell sx={{ px: 2, py: 0 }}>
                <ResultsRiskChip value={row.cyberRiskScore} />
              </TableCell>
              <TableCell sx={{ px: 2, py: 0, verticalAlign: "middle" }}>
                {row.kind === "cyberRisk" ? (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onOpenMitigationPlan(row)}
                    sx={({ tokens: t }) => ({
                      fontWeight: 600,
                      textTransform: "none",
                      color: t.semantic.color.action.link.default.value,
                    })}
                  >
                    + Mitigation plan
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const ASSETS_DONUT_ACTIVE_SEGMENTS = DONUT_SEGMENTS.filter((s) => s.count != null && s.count > 0);

function AssetsRiskDonut() {
  const { tokens: t } = useMuiTheme();
  const totalAssets = useMemo(
    () => DONUT_SEGMENTS.reduce((sum, s) => sum + (s.count ?? 0), 0),
    [],
  );

  const [arcCanvasColors, setArcCanvasColors] = useState(() =>
    ASSETS_DONUT_ACTIVE_SEGMENTS.map((s) => RAG_DATA_VIZ_CANVAS_FALLBACK[s.colorKey]),
  );

  useLayoutEffect(() => {
    setArcCanvasColors(
      ASSETS_DONUT_ACTIVE_SEGMENTS.map((s) =>
        resolveColorForCanvas(ragDataVizColor(t, s.colorKey), RAG_DATA_VIZ_CANVAS_FALLBACK[s.colorKey]),
      ),
    );
  }, [t]);

  const chartData = useMemo(
    () => ({
      labels: ASSETS_DONUT_ACTIVE_SEGMENTS.map((s) => s.label),
      datasets: [
        {
          data: ASSETS_DONUT_ACTIVE_SEGMENTS.map((s) => s.count as number),
          backgroundColor: arcCanvasColors,
          borderColor: DONUT_SEGMENT_BORDER,
          borderWidth: 2,
          hoverBorderColor: DONUT_SEGMENT_BORDER,
        },
      ],
    }),
    [arcCanvasColors],
  );

  return (
    <Box sx={{ position: "relative", width: 256, height: 256 }}>
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          cutout: "72%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
          },
          elements: {
            arc: {
              borderWidth: 2,
              borderColor: DONUT_SEGMENT_BORDER,
            },
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
          pointerEvents: "none",
        }}
      >
        <Typography
          sx={({ tokens: th }) => ({
            fontSize: 26,
            lineHeight: "34px",
            display: "block",
            color: th.semantic.color.type.default.value,
          })}
        >
          {totalAssets}
        </Typography>
        <Typography
          variant="body1"
          sx={({ tokens: th }) => ({
            color: th.semantic.color.type.muted.value,
            lineHeight: "24px",
            letterSpacing: "0.2px",
          })}
        >
          Assets
        </Typography>
      </Box>
    </Box>
  );
}

function AssetsResultsGrid({ rows }: { rows: AssetResultRow[] }) {
  const columns: GridColDef<AssetResultRow>[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Name",
        flex: 1,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams<AssetResultRow>) => (
          <Link
            href="#"
            onClick={(e) => e.preventDefault()}
            underline="hover"
            sx={({ tokens: t }) => ({
              fontWeight: 600,
              fontSize: t.semantic.font.text.md.fontSize.value,
              color: t.semantic.color.action.link.default.value,
            })}
          >
            {params.value as string}
          </Link>
        ),
      },
      {
        field: "assetId",
        headerName: "ID",
        width: 120,
      },
      {
        field: "cyberRiskScore",
        headerName: "Cyber risk score",
        width: 150,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AssetResultRow>) => (
          <ResultsRiskChip value={params.row.cyberRiskScore} />
        ),
      },
      {
        field: "criticality",
        headerName: "Criticality level",
        width: 140,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AssetResultRow>) => (
          <ResultsRiskChip value={params.row.criticality} />
        ),
      },
      {
        field: "confidentiality",
        headerName: "Confidentiality",
        width: 130,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AssetResultRow>) => (
          <ResultsRiskChip value={params.row.confidentiality} />
        ),
      },
      {
        field: "integrity",
        headerName: "Integrity",
        width: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AssetResultRow>) => (
          <ResultsRiskChip value={params.row.integrity} />
        ),
      },
      {
        field: "availability",
        headerName: "Availability",
        width: 130,
        sortable: false,
        renderCell: (params: GridRenderCellParams<AssetResultRow>) => (
          <ResultsRiskChip value={params.row.availability} />
        ),
      },
    ],
    [],
  );

  return (
    <Box sx={{ width: "100%" }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        autoHeight
        disableRowSelectionOnClick
        pinnedColumns={{ left: ["name"] }}
        pinnedColumnsSectionSeparator="border"
        getRowId={(r) => r.id}
        hideFooter
        slotProps={{
          main: { "aria-label": "Assets in this assessment" },
        }}
        sx={({ tokens: t }) => ({
          border: "none",
          borderRadius: t.semantic.radius.md.value,
          "& .MuiDataGrid-scrollShadow": { display: "none" },
          "& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell": { boxShadow: "none" },
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
  );
}

type OverviewScope = "cyberRisks" | "riskScenarios";

const OVERVIEW_SCOPE_OPTIONS: { value: OverviewScope; label: string }[] = [
  { value: "cyberRisks", label: "Cyber risks" },
  { value: "riskScenarios", label: "Risk scenarios" },
];

export default function AssessmentResultsTab({
  includedAssetIds,
  excludedScopeCyberRiskIds,
  onGoToScoring,
}: {
  includedAssetIds: Set<string>;
  excludedScopeCyberRiskIds: Set<string>;
  onGoToScoring: () => void;
}) {
  const [overviewScope, setOverviewScope] = useState<OverviewScope>("cyberRisks");
  const [overviewMenuAnchor, setOverviewMenuAnchor] = useState<null | HTMLElement>(null);
  const overviewMenuOpen = Boolean(overviewMenuAnchor);
  const overviewScopeLabel =
    OVERVIEW_SCOPE_OPTIONS.find((o) => o.value === overviewScope)?.label ?? "Cyber risks";

  const cyberResultRows = useMemo(
    () => buildCyberResultsRowsForScope(includedAssetIds, excludedScopeCyberRiskIds),
    [includedAssetIds, excludedScopeCyberRiskIds],
  );
  const assetResultRows = useMemo(
    () => buildAssetResultRowsForScope(includedAssetIds, excludedScopeCyberRiskIds),
    [includedAssetIds, excludedScopeCyberRiskIds],
  );
  const relatedAssetNames = useMemo(
    () => assets.filter((a) => includedAssetIds.has(a.id)).map((a) => a.name),
    [includedAssetIds],
  );

  const [cyberSectionExpanded, setCyberSectionExpanded] = useState(true);
  const [assetsSectionExpanded, setAssetsSectionExpanded] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const riskIds = cyberResultRows.filter((r) => r.kind === "cyberRisk").map((r) => r.id);
    setExpandedGroups(Object.fromEntries(riskIds.map((id) => [id, true])));
  }, [cyberResultRows]);

  const [sideSheetOpen, setSideSheetOpen] = useState(false);
  const [sideSheetCyberRiskName, setSideSheetCyberRiskName] = useState("");

  const handleOpenMitigationPlan = useCallback((row: CyberResultsRow) => {
    setSideSheetCyberRiskName(row.name);
    setSideSheetOpen(true);
  }, []);

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !(prev[groupId] !== false) }));
  }, []);

  const visibleCyberRows = useMemo(() => {
    const out: CyberResultsRow[] = [];
    let currentGroup = "";
    let groupOpen = true;
    for (const row of cyberResultRows) {
      if (row.kind === "cyberRisk") {
        currentGroup = row.groupId;
        groupOpen = expandedGroups[row.groupId] !== false;
        out.push(row);
        continue;
      }
      if (row.groupId === currentGroup && groupOpen) {
        out.push(row);
      }
    }
    return out;
  }, [expandedGroups, cyberResultRows]);

  const scopedCyberRisks = useMemo(
    () => assessmentScopedCyberRisks(includedAssetIds, excludedScopeCyberRiskIds),
    [includedAssetIds, excludedScopeCyberRiskIds],
  );

  if (includedAssetIds.size === 0) {
    return (
      <Stack sx={{ pt: 3, pb: 4, width: "100%" }}>
        <AssessmentScopeEmptyState variant="results" onPrimaryAction={onGoToScoring} />
      </Stack>
    );
  }

  return (
    <Stack gap={6} sx={{ pt: 3, pb: 4, width: "100%" }}>
      <Box
        sx={({ tokens: t }) => ({
          borderRadius: t.semantic.radius.md.value,
          bgcolor: t.semantic.color.surface.variant.value,
          p: 3,
          width: "100%",
        })}
      >
        <Stack gap={2}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            gap={2}
          >
            <Typography
              component="h2"
              sx={({ tokens: t }) => ({
                fontSize: 22,
                fontWeight: 600,
                lineHeight: "28px",
                color: t.semantic.color.type.default.value,
              })}
            >
              Overview
            </Typography>
            <>
              <Button
                id="results-overview-scope-button"
                variant="outlined"
                color="inherit"
                endIcon={<ExpandDownIcon />}
                aria-controls={overviewMenuOpen ? "results-overview-scope-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={overviewMenuOpen ? "true" : undefined}
                onClick={(e) => setOverviewMenuAnchor(e.currentTarget)}
                sx={({ tokens: t }) => ({
                  minWidth: 182,
                  bgcolor: t.semantic.color.surface.variant.value,
                  borderColor: t.semantic.color.outline.default.value,
                })}
              >
                Show {overviewScopeLabel}
              </Button>
              <Menu
                id="results-overview-scope-menu"
                anchorEl={overviewMenuAnchor}
                open={overviewMenuOpen}
                onClose={() => setOverviewMenuAnchor(null)}
                slotProps={{
                  list: {
                    "aria-labelledby": "results-overview-scope-button",
                  },
                }}

              >
                {OVERVIEW_SCOPE_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    selected={overviewScope === opt.value}
                    onClick={() => {
                      setOverviewScope(opt.value);
                      setOverviewMenuAnchor(null);
                    }}
                  >
                    <ListItemText>{opt.label}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          </Stack>

          <Stack
            direction={{ xs: "column", lg: "row" }}
            gap={3}
            alignItems="stretch"
            sx={{ width: "100%" }}
          >
            <RisksMatrix
              risks={scopedCyberRisks}
              sx={({ tokens: t }) => ({
                flex: { lg: "1.5 1 0" },
                minWidth: 0,
                width: "100%",
                border: "none",
                bgcolor: t.semantic.color.background.base.value,
                borderRadius: "16px",
                boxShadow: "none",
              })}
            />

            <Card
              sx={({ tokens: t }) => ({
                flex: { lg: "1 1 480px" },
                minWidth: { lg: 320 },
                width: "100%",
                maxWidth: { lg: 480 },
                border: "none",
                bgcolor: t.semantic.color.background.base.value,
                borderRadius: "16px",
                boxShadow: "none",
              })}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                  p: 0,
                  pb: 3,
                  flex: 1,
                }}
              >
                <Stack direction="row" alignItems="center" sx={{ width: "100%", minHeight: 32 }}>
                  <Typography variant="h4" component="h3" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
                    Assets by cyber risk score
                  </Typography>
                  <IconButton size="small" aria-label="More options for assets chart">
                    <MoreIcon aria-hidden />
                  </IconButton>
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
                  <AssetsRiskDonut />
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                    gridTemplateRows: { xs: "none", sm: "repeat(2, minmax(0, auto))" },
                    columnGap: 2,
                    rowGap: 2,
                    width: "100%",
                  }}
                >
                  {DONUT_SEGMENTS.map((item) => (
                    <Stack key={item.range} gap={0} alignItems="flex-start">
                      <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
                        <Box
                          sx={({ tokens: t }) => ({
                            width: 16,
                            height: 16,
                            borderRadius: t.semantic.radius.sm.value,
                            flexShrink: 0,
                            bgcolor: ragDataVizColor(t, item.colorKey),
                          })}
                        />
                        <Typography
                          variant="textSm"
                          sx={({ tokens: t }) => ({
                            color: t.semantic.color.type.default.value,
                            letterSpacing: "0.3px",
                            lineHeight: "16px",
                          })}
                        >
                          {item.range} {item.label}
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" sx={{ pl: 3 }}>
                        {item.count != null ? (
                          <Link
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            underline="always"
                            sx={({ tokens: t }) => ({
                              fontWeight: 600,
                              fontSize: t.semantic.font.text.md.fontSize.value,
                              lineHeight: t.semantic.font.text.md.lineHeight.value,
                              letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                              color: t.semantic.color.type.default.value,
                            })}
                          >
                            {item.count}
                          </Link>
                        ) : (
                          <Typography
                            component="span"
                            sx={({ tokens: t }) => ({
                              fontSize: t.semantic.font.text.md.fontSize.value,
                              lineHeight: t.semantic.font.text.md.lineHeight.value,
                              letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                              color: t.semantic.color.type.default.value,
                            })}
                          >
                            -
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Box>

      <SectionHeader
        title="Cyber risks"
        headingLevel="h2"
        isExpandable
        isExpanded={cyberSectionExpanded}
        expandButtonAriaLabel={cyberSectionExpanded ? "Collapse cyber risks section" : "Expand cyber risks section"}
        onExpand={() => setCyberSectionExpanded(true)}
        onCollapse={() => setCyberSectionExpanded(false)}
      >
        {cyberSectionExpanded ? (
          <CyberRisksResultsTable
            visibleRows={visibleCyberRows}
            expanded={expandedGroups}
            onToggleGroup={toggleGroup}
            onOpenMitigationPlan={handleOpenMitigationPlan}
          />
        ) : null}
      </SectionHeader>

      <SectionHeader
        title="Assets"
        headingLevel="h2"
        isExpandable
        isExpanded={assetsSectionExpanded}
        expandButtonAriaLabel={assetsSectionExpanded ? "Collapse assets section" : "Expand assets section"}
        onExpand={() => setAssetsSectionExpanded(true)}
        onCollapse={() => setAssetsSectionExpanded(false)}
      >
        {assetsSectionExpanded ? <AssetsResultsGrid rows={assetResultRows} /> : null}
      </SectionHeader>

      <MitigationPlanSideSheet
        open={sideSheetOpen}
        onClose={() => setSideSheetOpen(false)}
        cyberRiskName={sideSheetCyberRiskName}
        relatedAssetNames={relatedAssetNames}
      />
    </Stack>
  );
}
