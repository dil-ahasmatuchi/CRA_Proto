import { useCallback, useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@diligentcorp/atlas-react-bundle";
import { useNavigate } from "react-router";

import AssessmentScopeEmptyState from "../components/AssessmentScopeEmptyState.js";
import {
  Box,
  Button,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MitigationPlanPageSideSheet from "../components/MitigationPlanPageSideSheet.js";
import ResultsHero from "../components/ResultsHero.js";
import { assets } from "../data/assets.js";
import { type CraRagKey } from "../data/craScoringScenarioLibrary.js";
import {
  buildAssetResultRowsForScope,
  buildCyberResultsRowsForScope,
  type AssessmentAssetResultRow,
  type AssessmentCyberResultsRow,
} from "./craAssessmentScopeRows.js";
import { ragDataVizColor } from "../data/ragDataVisualization.js";
import { assessmentScopedCyberRisks } from "../data/assessmentScopeRollup.js";
import { scenarioRationaleReadOnlyPath } from "./craScenarioRoutes.js";
import {
  NEW_CRA_RESULTS_TAB_INDEX,
  type AiScoringPhase,
  type AssessmentPhase,
  type CraScoringTypeChoice,
} from "./craNewAssessmentDraftStorage.js";

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
  onScenarioRowClick,
}: {
  visibleRows: CyberResultsRow[];
  expanded: Record<string, boolean>;
  onToggleGroup: (groupId: string) => void;
  onOpenMitigationPlan: (row: CyberResultsRow) => void;
  /** When set, scenario rows are clickable (e.g. approved assessment → read-only rationale). */
  onScenarioRowClick?: (scenarioId: string) => void;
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
          {visibleRows.map((row) => {
            const isScenario = row.kind === "scenario";
            const scenarioRowClickable = isScenario && onScenarioRowClick != null;
            return (
            <TableRow
              key={row.id}
              hover={scenarioRowClickable}
              tabIndex={scenarioRowClickable ? 0 : undefined}
              aria-label={
                scenarioRowClickable
                  ? `Open ${row.name}. Press Enter to view scenario rationale (read-only).`
                  : undefined
              }
              onClick={() => {
                if (scenarioRowClickable) onScenarioRowClick!(row.id);
              }}
              onKeyDown={(e) => {
                if (!scenarioRowClickable) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onScenarioRowClick!(row.id);
                }
              }}
              sx={
                scenarioRowClickable
                  ? ({ tokens: t }) => ({
                      cursor: "pointer",
                      "&.MuiTableRow-hover:hover": {
                        backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                      },
                      "&.MuiTableRow-hover:hover .MuiTableCell-root": {
                        backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                      },
                      "&:focus-visible": {
                        outline: `2px solid ${t.semantic.color.action.primary.default.value}`,
                        outlineOffset: -2,
                      },
                    })
                  : undefined
              }
            >
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
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

export default function AssessmentResultsTab({
  includedAssetIds,
  excludedScopeCyberRiskIds,
  onGoToScoring,
  assessmentName = "",
  returnToAssessmentPath = "",
  assessmentPhase,
  scoringType,
  aiScoringPhase,
}: {
  includedAssetIds: Set<string>;
  excludedScopeCyberRiskIds: Set<string>;
  onGoToScoring: () => void;
  /** Matches {@link AssessmentScoringTab} — used when navigating to scenario read-only rationale. */
  assessmentName?: string;
  returnToAssessmentPath?: string;
  assessmentPhase: AssessmentPhase;
  scoringType: CraScoringTypeChoice;
  aiScoringPhase: AiScoringPhase;
}) {
  const navigate = useNavigate();

  const goToScenarioReadOnly = useCallback(
    (scenarioId: string) => {
      navigate(scenarioRationaleReadOnlyPath(scenarioId), {
        state: {
          assessmentName: assessmentName.trim() || undefined,
          scoringType,
          aiScoringPhase,
          returnToAssessmentPath: returnToAssessmentPath.trim() || undefined,
          craReturnToTabIndex: NEW_CRA_RESULTS_TAB_INDEX,
        },
      });
    },
    [navigate, assessmentName, scoringType, aiScoringPhase, returnToAssessmentPath],
  );

  const onScenarioRowClick =
    assessmentPhase === "assessmentApproved" ? goToScenarioReadOnly : undefined;
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
      <ResultsHero
        scopedRisks={scopedCyberRisks}
        assetResultRows={assetResultRows}
        scoringType={scoringType}
      />

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
            onScenarioRowClick={onScenarioRowClick}
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

      <MitigationPlanPageSideSheet
        open={sideSheetOpen}
        onClose={() => setSideSheetOpen(false)}
        cyberRiskName={sideSheetCyberRiskName}
        relatedAssetNames={relatedAssetNames}
      />
    </Stack>
  );
}
