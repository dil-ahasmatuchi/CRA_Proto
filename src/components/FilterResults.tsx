import {
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";

import type { FivePointScaleLabel } from "../data/types.js";
import type { AssessmentCyberResultsRow } from "../pages/craAssessmentScopeRows.js";
import { CYBER_RISK_SCORE_FILTER_OPTIONS } from "../utils/cyberRiskTableRows.js";

const fieldLabelSx = {
  textTransform: "none" as const,
  fontVariant: "normal" as const,
  mb: 0,
};

export type FilterResultsValue = {
  /** Empty = no restriction. */
  impactLabels: FivePointScaleLabel[];
  threatSeverityLabels: FivePointScaleLabel[];
  vulnerabilitySeverityLabels: FivePointScaleLabel[];
  likelihoodLabels: FivePointScaleLabel[];
  cyberRiskScoreLabels: FivePointScaleLabel[];
};

export const EMPTY_FILTER_RESULTS: FilterResultsValue = {
  impactLabels: [],
  threatSeverityLabels: [],
  vulnerabilitySeverityLabels: [],
  likelihoodLabels: [],
  cyberRiskScoreLabels: [],
};

export function copyFilterResultsValue(f: FilterResultsValue): FilterResultsValue {
  return {
    impactLabels: [...f.impactLabels],
    threatSeverityLabels: [...f.threatSeverityLabels],
    vulnerabilitySeverityLabels: [...f.vulnerabilitySeverityLabels],
    likelihoodLabels: [...f.likelihoodLabels],
    cyberRiskScoreLabels: [...f.cyberRiskScoreLabels],
  };
}

export function countFilterResultsCriteria(f: FilterResultsValue): number {
  let n = 0;
  if (f.impactLabels.length > 0) n += 1;
  if (f.threatSeverityLabels.length > 0) n += 1;
  if (f.vulnerabilitySeverityLabels.length > 0) n += 1;
  if (f.likelihoodLabels.length > 0) n += 1;
  if (f.cyberRiskScoreLabels.length > 0) n += 1;
  return n;
}

export function filterResultsValueEquals(a: FilterResultsValue, b: FilterResultsValue): boolean {
  const norm = (xs: FivePointScaleLabel[]) => [...xs].sort().join("\0");
  return (
    norm(a.impactLabels) === norm(b.impactLabels) &&
    norm(a.threatSeverityLabels) === norm(b.threatSeverityLabels) &&
    norm(a.vulnerabilitySeverityLabels) === norm(b.vulnerabilitySeverityLabels) &&
    norm(a.likelihoodLabels) === norm(b.likelihoodLabels) &&
    norm(a.cyberRiskScoreLabels) === norm(b.cyberRiskScoreLabels)
  );
}

/**
 * Keeps tree shape: matching scenarios include their parent cyber risk row; matching risks stay without
 * scenarios that do not match.
 */
export function filterAssessmentCyberResultsRows(
  rows: AssessmentCyberResultsRow[],
  f: FilterResultsValue,
): AssessmentCyberResultsRow[] {
  const chipMatches = (selected: FivePointScaleLabel[], label: string): boolean =>
    selected.length === 0 || selected.includes(label as FivePointScaleLabel);

  const rowMatches = (r: AssessmentCyberResultsRow) =>
    chipMatches(f.impactLabels, r.impact.label) &&
    chipMatches(f.threatSeverityLabels, r.threat.label) &&
    chipMatches(f.vulnerabilitySeverityLabels, r.vulnerability.label) &&
    chipMatches(f.likelihoodLabels, r.likelihood.label) &&
    chipMatches(f.cyberRiskScoreLabels, r.cyberRiskScore.label);

  const visible = new Set<string>();
  for (const r of rows) {
    if (rowMatches(r)) visible.add(r.id);
  }
  for (const r of rows) {
    if (r.kind === "scenario" && visible.has(r.id)) visible.add(r.groupId);
  }
  return rows.filter((r) => visible.has(r.id));
}

function boundedFivePointOptions(
  rows: AssessmentCyberResultsRow[] | undefined,
  pick: (r: AssessmentCyberResultsRow) => string,
  selected: FivePointScaleLabel[],
): { value: FivePointScaleLabel; label: string }[] {
  if (rows == null || rows.length === 0) {
    return CYBER_RISK_SCORE_FILTER_OPTIONS.map((l) => ({ value: l, label: l }));
  }
  const seen = new Set<string>();
  for (const r of rows) seen.add(pick(r));
  const fromRows = CYBER_RISK_SCORE_FILTER_OPTIONS.filter((l) => seen.has(l));
  const extras = selected.filter((l) => !fromRows.includes(l));
  return [...fromRows, ...extras].map((l) => ({ value: l, label: l }));
}

type MultiSelectFieldProps<T extends string> = {
  label: string;
  value: T[];
  onChange: (next: T[]) => void;
  options: readonly { value: T; label: string }[];
  emptyPlaceholder: string;
};

function MultiSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  emptyPlaceholder,
}: MultiSelectFieldProps<T>) {
  const { tokens } = useTheme();
  const slug = label.replace(/\s+/g, "-").toLowerCase();

  return (
    <FormControl fullWidth margin="none">
      <InputLabel sx={fieldLabelSx} id={`filter-results-${slug}-label`}>
        {label}
      </InputLabel>
      <Select
        multiple
        displayEmpty
        labelId={`filter-results-${slug}-label`}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as T[])}
        renderValue={(selected) => {
          const vals = selected as T[];
          if (vals.length === 0) {
            return (
              <Box
                component="span"
                sx={{
                  color: tokens.semantic.color.type.muted.value,
                  pointerEvents: "none",
                }}
              >
                {emptyPlaceholder}
              </Box>
            );
          }
          const labels = vals.map((v) => options.find((o) => o.value === v)?.label ?? v);
          if (vals.length === 1) return labels[0];
          return (
            <>
              <Box component="span" sx={{ mr: 0.5 }}>
                ({vals.length})
              </Box>
              {labels.join(", ")}
            </>
          );
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value as string}>
            <Checkbox checked={value.includes(o.value)} size="small" disableRipple />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export type FilterResultsProps = {
  value: FilterResultsValue;
  onChange: (next: FilterResultsValue) => void;
  /**
   * When set, each multiselect lists only labels that appear on these assessment result rows (catalog order),
   * plus any currently selected values not present in the data.
   */
  boundedRows?: AssessmentCyberResultsRow[];
};

export default function FilterResults({ value, onChange, boundedRows }: FilterResultsProps) {
  const impactOptions = useMemo(
    () => boundedFivePointOptions(boundedRows, (r) => r.impact.label, value.impactLabels),
    [boundedRows, value.impactLabels],
  );
  const threatOptions = useMemo(
    () => boundedFivePointOptions(boundedRows, (r) => r.threat.label, value.threatSeverityLabels),
    [boundedRows, value.threatSeverityLabels],
  );
  const vulnerabilityOptions = useMemo(
    () =>
      boundedFivePointOptions(boundedRows, (r) => r.vulnerability.label, value.vulnerabilitySeverityLabels),
    [boundedRows, value.vulnerabilitySeverityLabels],
  );
  const likelihoodOptions = useMemo(
    () => boundedFivePointOptions(boundedRows, (r) => r.likelihood.label, value.likelihoodLabels),
    [boundedRows, value.likelihoodLabels],
  );
  const scoreOptions = useMemo(
    () => boundedFivePointOptions(boundedRows, (r) => r.cyberRiskScore.label, value.cyberRiskScoreLabels),
    [boundedRows, value.cyberRiskScoreLabels],
  );

  return (
    <Stack gap={3} component="form" aria-label="Assessment results filters" onSubmit={(e) => e.preventDefault()}>
      <MultiSelectField
        label="Impact"
        value={value.impactLabels}
        onChange={(next) => onChange({ ...value, impactLabels: next })}
        options={impactOptions}
        emptyPlaceholder="Choose multiple options"
      />
      <MultiSelectField
        label="Threat severity"
        value={value.threatSeverityLabels}
        onChange={(next) => onChange({ ...value, threatSeverityLabels: next })}
        options={threatOptions}
        emptyPlaceholder="Choose multiple options"
      />
      <MultiSelectField
        label="Vulnerability severity"
        value={value.vulnerabilitySeverityLabels}
        onChange={(next) => onChange({ ...value, vulnerabilitySeverityLabels: next })}
        options={vulnerabilityOptions}
        emptyPlaceholder="Choose multiple options"
      />
      <MultiSelectField
        label="Likelihood"
        value={value.likelihoodLabels}
        onChange={(next) => onChange({ ...value, likelihoodLabels: next })}
        options={likelihoodOptions}
        emptyPlaceholder="Choose multiple options"
      />
      <MultiSelectField
        label="Cyber risk score"
        value={value.cyberRiskScoreLabels}
        onChange={(next) => onChange({ ...value, cyberRiskScoreLabels: next })}
        options={scoreOptions}
        emptyPlaceholder="Choose multiple options"
      />
    </Stack>
  );
}
