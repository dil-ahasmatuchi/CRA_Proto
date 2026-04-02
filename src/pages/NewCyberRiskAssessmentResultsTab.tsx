import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SectionHeader, Footer } from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Drawer,
  FormControl,
  FormLabel,
  IconButton,
  Link,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  DataGridPro,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid-pro";
import { Chart as ChartJS, ArcElement, Legend as ChartLegend, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers-pro/AdapterDateFns";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { format } from "date-fns";

import ClearIcon from "@diligentcorp/atlas-react-bundle/icons/Clear";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";

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
  RAG_FIVE_POINT_BAND_KEYS,
  ragDataVizColor,
  resolveColorForCanvas,
} from "../data/ragDataVisualization.js";

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

/** Heatmap band 0 = very low … 4 = very high */
const HEATMAP_BAND_COLORS = RAG_FIVE_POINT_BAND_KEYS;

type HeatCell = { band: number; count: number | null };

/** 5×5 matrix: rows = likelihood high → low, cols = impact low → high */
const HEATMAP_DATA: HeatCell[][] = [
  [
    { band: 3, count: null },
    { band: 3, count: null },
    { band: 4, count: null },
    { band: 4, count: null },
    { band: 4, count: 1 },
  ],
  [
    { band: 2, count: null },
    { band: 3, count: null },
    { band: 3, count: null },
    { band: 4, count: null },
    { band: 4, count: null },
  ],
  [
    { band: 2, count: null },
    { band: 2, count: 1 },
    { band: 3, count: 1 },
    { band: 3, count: null },
    { band: 4, count: null },
  ],
  [
    { band: 1, count: null },
    { band: 2, count: null },
    { band: 2, count: null },
    { band: 3, count: null },
    { band: 3, count: null },
  ],
  [
    { band: 0, count: null },
    { band: 1, count: null },
    { band: 2, count: null },
    { band: 2, count: null },
    { band: 3, count: null },
  ],
];

const HEATMAP_LEGEND = [
  { range: "101 - 125", label: "Very high", count: 1, rag: "neg05" as CraRagKey },
  { range: "76 - 100", label: "High", count: 1, rag: "neg03" as CraRagKey },
  { range: "51 - 75", label: "Medium", count: 1, rag: "neu03" as CraRagKey },
  { range: "26 - 50", label: "Low", count: null, rag: "pos04" as CraRagKey },
  { range: "1 - 25", label: "Very low", count: null, rag: "pos05" as CraRagKey },
];

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

const ISSUE_TYPE_OPTIONS = ["Issue", "Risk", "Control gap", "Finding"];
const SEVERITY_OPTIONS = [
  "1 - Very low",
  "2 - Low",
  "3 - Medium",
  "4 - High",
  "5 - Very high",
];
const ORG_UNIT_OPTIONS = [
  "Chicago - Operations division - Incident response implementation",
  "New York - IT division - Security operations",
  "London - Engineering - Cloud infrastructure",
];
const RELATED_CONTROLS_OPTIONS = [
  "Role-based access",
  "Communication protocols",
  "Performance metrics",
  "Business continuity plans",
  "Vendor Risk Management",
  "Data Loss Prevention",
  "Network Security Monitoring",
  "Physical Security Controls",
  "Third-Party Risk Assessment",
  "Business Impact Analysis",
];

function PlaceholderText({ text = "Choose an option" }: { text?: string }) {
  const {
    tokens: {
      component: { input },
    },
  } = useTheme();
  return (
    <Box
      component="span"
      sx={{ color: input.outlined.default.placeholder.color.value, pointerEvents: "none" }}
    >
      {text}
    </Box>
  );
}

function MitigationPlanSideSheet({
  open,
  onClose,
  cyberRiskName,
  relatedAssetNames,
}: {
  open: boolean;
  onClose: () => void;
  cyberRiskName: string;
  relatedAssetNames: string[];
}) {
  const { presets } = useTheme();
  const { SideSheetPresets } = presets;
  const { size, components } = SideSheetPresets;
  const { Header, Content } = components;

  const [name, setName] = useState("");
  const [issueType, setIssueType] = useState("");
  const [severity, setSeverity] = useState("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [owners, setOwners] = useState("");
  const [orgUnit, setOrgUnit] = useState("");
  const [relatedAssets, setRelatedAssets] = useState<string[]>([]);
  const [relatedControls, setRelatedControls] = useState<string[]>([]);
  const [actionPlan, setActionPlan] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    setName("");
    setIssueType("");
    setSeverity("");
    setDueDate(null);
    setOwners("");
    setOrgUnit("");
    setRelatedAssets([]);
    setRelatedControls([]);
    setActionPlan("");
    onClose();
  }, [onClose]);

  const handleRelatedAssetsChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      setRelatedAssets(typeof value === "string" ? value.split(",") : value);
    },
    [],
  );

  const handleDeleteAsset = useCallback((assetToDelete: string) => {
    setRelatedAssets((prev) => prev.filter((a) => a !== assetToDelete));
  }, []);

  const handleRelatedControlsChange = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value = event.target.value;
      setRelatedControls(typeof value === "string" ? value.split(",") : value);
    },
    [],
  );

  const handleDeleteControl = useCallback(
    (controlToDelete: string) => {
      setRelatedControls((prev) => prev.filter((c) => c !== controlToDelete));
    },
    [],
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      sx={{ ...size.large.sx }}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-labelledby": "mitigation-side-sheet-title",
        },
      }}
    >
      <Header
        variant="default"
        onClose={handleClose}
        title="Add issue ticket"
        componentProps={{
          closeButton: { "aria-label": "Close side sheet" },
          title: { component: "h2", id: "mitigation-side-sheet-title" },
        }}
      >
        <Typography
          sx={({ tokens: t }) => ({
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
            color: t.semantic.color.type.default.value,
          })}
        >
          {cyberRiskName}
        </Typography>
      </Header>

      <Content ariaLabel="Mitigation plan form">
        <Stack gap={3}>
          {/* Row 1: Name + Issue type */}
          <Stack direction="row" gap={3}>
            <FormControl sx={{ flex: 7 }}>
              <FormLabel htmlFor="mp-name">Name</FormLabel>
              <TextField
                placeholder="Enter issue name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{ input: { id: "mp-name" } }}
              />
            </FormControl>
            <FormControl sx={{ flex: 5 }}>
              <FormLabel id="mp-issue-type-label">Issue type</FormLabel>
              <Select
                displayEmpty
                value={issueType}
                onChange={(e: SelectChangeEvent) => setIssueType(e.target.value)}
                labelId="mp-issue-type-label"
                renderValue={(selected) => {
                  if (!selected) return <PlaceholderText />;
                  return selected;
                }}
              >
                {ISSUE_TYPE_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Row 2: Severity + Due date */}
          <Stack direction="row" gap={3}>
            <FormControl sx={{ flex: 7 }}>
              <FormLabel id="mp-severity-label">Severity</FormLabel>
              <Select
                displayEmpty
                value={severity}
                onChange={(e: SelectChangeEvent) => setSeverity(e.target.value)}
                labelId="mp-severity-label"
                renderValue={(selected) => {
                  if (!selected) return <PlaceholderText />;
                  return selected;
                }}
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: 5 }}>
              <FormLabel htmlFor="mp-due-date">Due date</FormLabel>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DesktopDatePicker
                  value={dueDate}
                  onChange={setDueDate}
                  dayOfWeekFormatter={(day: Date) => format(day, "EEEEEE")}
                  slotProps={{
                    textField: {
                      placeholder: "MM/DD/YYYY",
                      id: "mp-due-date",
                    },
                  }}
                />
              </LocalizationProvider>
            </FormControl>
          </Stack>

          {/* Row 3: Owner(s) */}
          <FormControl fullWidth>
            <FormLabel htmlFor="mp-owners">Owner(s)</FormLabel>
            <TextField
              placeholder="Search for owners"
              value={owners}
              onChange={(e) => setOwners(e.target.value)}
              slotProps={{ input: { id: "mp-owners" } }}
            />
          </FormControl>

          {/* Row 4: Related Org. unit */}
          <FormControl fullWidth>
            <FormLabel id="mp-org-unit-label">Related Org. unit</FormLabel>
            <Select
              displayEmpty
              value={orgUnit}
              onChange={(e: SelectChangeEvent) => setOrgUnit(e.target.value)}
              labelId="mp-org-unit-label"
              renderValue={(selected) => {
                if (!selected) return <PlaceholderText />;
                return selected;
              }}
            >
              {ORG_UNIT_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Row 5: Assets */}
          <FormControl fullWidth>
            <FormLabel id="mp-related-assets-label">Assets</FormLabel>
            <Select
              multiple
              displayEmpty
              value={relatedAssets}
              onChange={handleRelatedAssetsChange}
              labelId="mp-related-assets-label"
              IconComponent={ExpandDownIcon}
              endAdornment={
                relatedAssets.length > 0 ? (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRelatedAssets([]);
                    }}
                    aria-label="Clear all selected assets"
                    sx={{ mr: 2 }}
                  >
                    <ClearIcon aria-hidden />
                  </IconButton>
                ) : null
              }
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <PlaceholderText text="Choose assets" />;
                }
                return (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        variant="outlined"
                        size="small"
                        onDelete={() => handleDeleteAsset(value)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Stack>
                );
              }}
              sx={{
                "& .MuiSelect-select": {
                  whiteSpace: "normal",
                  height: "auto !important",
                  minHeight: 92,
                  display: "flex",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  pt: 1,
                  pb: 1,
                },
              }}
            >
              {relatedAssetNames.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  <Checkbox checked={relatedAssets.includes(opt)} />
                  <ListItemText primary={opt} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Row 6: Related controls */}
          <FormControl fullWidth>
            <FormLabel id="mp-related-controls-label">Related controls</FormLabel>
            <Select
              multiple
              displayEmpty
              value={relatedControls}
              onChange={handleRelatedControlsChange}
              labelId="mp-related-controls-label"
              IconComponent={ExpandDownIcon}
              endAdornment={
                relatedControls.length > 0 ? (
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRelatedControls([]);
                    }}
                    aria-label="Clear all selected controls"
                    sx={{ mr: 2 }}
                  >
                    <ClearIcon aria-hidden />
                  </IconButton>
                ) : null
              }
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <PlaceholderText text="Choose controls" />;
                }
                return (
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        variant="outlined"
                        size="small"
                        onDelete={() => handleDeleteControl(value)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Stack>
                );
              }}
              sx={{
                "& .MuiSelect-select": {
                  whiteSpace: "normal",
                  height: "auto !important",
                  minHeight: 92,
                  display: "flex",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  pt: 1,
                  pb: 1,
                },
              }}
            >
              {RELATED_CONTROLS_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  <Checkbox checked={relatedControls.includes(opt)} />
                  <ListItemText primary={opt} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Row 7: Action plan */}
          <FormControl fullWidth>
            <FormLabel htmlFor="mp-action-plan">Action plan</FormLabel>
            <TextField
              multiline
              minRows={3}
              placeholder="Describe the action plan"
              value={actionPlan}
              onChange={(e) => setActionPlan(e.target.value)}
              slotProps={{ input: { id: "mp-action-plan" } }}
            />
          </FormControl>

          {/* Row 8: File uploader */}
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept=".jpg,.jpeg,.pdf,.xls,.xlsx"
            />
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={({ tokens: t }) => ({
                borderStyle: "dashed",
                borderWidth: t.semantic.borderWidth.thin.value,
                borderColor: t.semantic.color.outline.default.value,
                borderRadius: t.semantic.radius.lg.value,
                px: 3,
                py: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": {
                  borderColor: t.semantic.color.outline.hover.value,
                  backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                },
              })}
            >
              <Stack direction="row" alignItems="center" gap={1}>
                <UploadIcon aria-hidden />
                <Typography
                  sx={({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.md.fontSize.value,
                    lineHeight: t.semantic.font.text.md.lineHeight.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  Drag files here or{" "}
                  <Link component="span" underline="always" sx={{ fontWeight: 600, cursor: "pointer" }}>
                    select files to upload
                  </Link>
                </Typography>
              </Stack>
              <Stack direction="row" gap={2}>
                <Typography
                  sx={({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.sm.fontSize.value,
                    lineHeight: t.semantic.font.text.sm.lineHeight.value,
                    letterSpacing: t.semantic.font.text.sm.letterSpacing.value,
                    color: t.semantic.color.type.muted.value,
                  })}
                >
                  Formats: JPG, PDF, XLS
                </Typography>
                <Typography
                  sx={({ tokens: t }) => ({
                    fontSize: t.semantic.font.text.sm.fontSize.value,
                    lineHeight: t.semantic.font.text.sm.lineHeight.value,
                    letterSpacing: t.semantic.font.text.sm.letterSpacing.value,
                    color: t.semantic.color.type.muted.value,
                  })}
                >
                  Max. file size: 5 MB
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Content>

      <Footer
        horizontalPadding="medium"
        secondaryAction={<span />}
        tertiaryAction={
          <Button variant="text" onClick={handleClose}>
            Discard
          </Button>
        }
        primaryAction={
          <Button variant="contained" onClick={handleClose}>
            Add issue
          </Button>
        }
      />
    </Drawer>
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
        maxWidth: 1280,
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
    <Box sx={{ width: "100%", maxWidth: 1280 }}>
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

export default function NewCyberRiskAssessmentResultsTab({
  includedAssetIds,
}: {
  includedAssetIds: Set<string>;
}) {
  const [overviewScope, setOverviewScope] = useState<OverviewScope>("cyberRisks");
  const [overviewMenuAnchor, setOverviewMenuAnchor] = useState<null | HTMLElement>(null);
  const overviewMenuOpen = Boolean(overviewMenuAnchor);
  const overviewScopeLabel =
    OVERVIEW_SCOPE_OPTIONS.find((o) => o.value === overviewScope)?.label ?? "Cyber risks";

  const cyberResultRows = useMemo(
    () => buildCyberResultsRowsForScope(includedAssetIds),
    [includedAssetIds],
  );
  const assetResultRows = useMemo(
    () => buildAssetResultRowsForScope(includedAssetIds),
    [includedAssetIds],
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

  return (
    <Stack gap={6} sx={{ pt: 3, pb: 4, maxWidth: 1280 }}>
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
            <Card
              sx={({ tokens: t }) => ({
                flex: { lg: "1.5 1 0" },
                minWidth: 0,
                width: "100%",
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
                  flex: 1,
                }}
              >
                <Stack direction="row" alignItems="center" sx={{ width: "100%", minHeight: 32 }}>
                  <Typography variant="h4" component="h3" fontWeight={600} sx={{ flex: 1, minWidth: 0 }}>
                    Cyber risks
                  </Typography>
                  <IconButton size="small" aria-label="More options for cyber risks chart">
                    <MoreIcon aria-hidden />
                  </IconButton>
                </Stack>

                <Stack direction="row" gap={1} alignItems="stretch" sx={{ width: "100%" }}>
                  <Typography
                    variant="caption"
                    sx={({ tokens: th }) => ({
                      color: th.semantic.color.type.muted.value,
                      fontWeight: 600,
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                      textAlign: "center",
                      alignSelf: "center",
                      flexShrink: 0,
                    })}
                  >
                    Likelihood
                  </Typography>
                  <Box sx={{ flex: 1, overflowX: "auto", minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, minmax(44px, 1fr))",
                        gridTemplateRows: "repeat(5, 52px)",
                        gap: 0.5,
                        alignItems: "stretch",
                        minWidth: 260,
                      }}
                    >
                      {HEATMAP_DATA.map((row, ri) =>
                        row.map((cell, ci) => (
                          <Box
                            key={`cell-${5 - ri}-${ci + 1}`}
                            sx={({ tokens: th }) => ({
                              gridColumn: ci + 1,
                              gridRow: ri + 1,
                              borderRadius: th.semantic.radius.sm.value,
                              bgcolor: ragDataVizColor(th, HEATMAP_BAND_COLORS[cell.band] ?? "neu03"),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minHeight: 48,
                              opacity: cell.count != null ? 1 : 0.3,
                            })}
                          >
                            {cell.count != null ? (
                              <Typography
                                sx={({ tokens: th }) => ({
                                  fontWeight: 800,
                                  fontSize: 12,
                                  color: th.semantic.color.type.inverse.value,
                                })}
                              >
                                {cell.count}
                              </Typography>
                            ) : null}
                          </Box>
                        )),
                      )}
                    </Box>
                  </Box>
                </Stack>

                <Stack direction="row" justifyContent="center" sx={{ width: "100%" }}>
                  <Typography
                    variant="caption"
                    sx={({ tokens: t }) => ({ color: t.semantic.color.type.muted.value, fontWeight: 600 })}
                  >
                    Impact
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                    gap: 2,
                    width: "100%",
                  }}
                >
                  {HEATMAP_LEGEND.map((item) => (
                    <Stack key={item.range} gap={0} alignItems="flex-start">
                      <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
                        <Box
                          sx={({ tokens: t }) => ({
                            width: 16,
                            height: 16,
                            borderRadius: t.semantic.radius.sm.value,
                            flexShrink: 0,
                            bgcolor: ragDataVizColor(t, item.rag),
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
                              fontWeight: 800,
                              fontSize: 12,
                              lineHeight: "16px",
                              color: t.semantic.color.type.default.value,
                            })}
                          >
                            {item.count}
                          </Link>
                        ) : (
                          <Typography
                            component="span"
                            sx={({ tokens: t }) => ({
                              fontSize: 12,
                              color: t.semantic.color.type.muted.value,
                            })}
                          >
                            —
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  ))}
                </Box>
              </CardContent>
            </Card>

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
