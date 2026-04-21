import { useCallback } from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";

import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";

/** Score payload for metric dropdowns (numeric band, label, RAG key). */
export type ScoreValue = {
  numeric: string;
  label: string;
  rag: RagDataVizKey;
} | null;

export const SCORE_OPTIONS: NonNullable<ScoreValue>[] = [
  { numeric: "1", label: "Very low", rag: "pos05" },
  { numeric: "2", label: "Low", rag: "pos04" },
  { numeric: "3", label: "Medium", rag: "neu03" },
  { numeric: "4", label: "High", rag: "neg03" },
  { numeric: "5", label: "Very high", rag: "neg05" },
];

export const LIKELIHOOD_OPTIONS: NonNullable<ScoreValue>[] = [
  { numeric: "1–5", label: "Very low", rag: "pos05" },
  { numeric: "6–10", label: "Low", rag: "pos04" },
  { numeric: "11–15", label: "Medium", rag: "neu03" },
  { numeric: "16–20", label: "High", rag: "neg03" },
  { numeric: "21–25", label: "Very high", rag: "neg05" },
];

export const CYBER_RISK_SCORE_OPTIONS: NonNullable<ScoreValue>[] = [
  { numeric: "1–25", label: "Very low", rag: "pos05" },
  { numeric: "26–50", label: "Low", rag: "pos04" },
  { numeric: "51–75", label: "Medium", rag: "neu03" },
  { numeric: "76–100", label: "High", rag: "neg03" },
  { numeric: "101–125", label: "Very high", rag: "neg05" },
];

export function likelihoodFromProduct(product: number): NonNullable<ScoreValue> {
  if (product <= 5) return LIKELIHOOD_OPTIONS[0];
  if (product <= 10) return LIKELIHOOD_OPTIONS[1];
  if (product <= 15) return LIKELIHOOD_OPTIONS[2];
  if (product <= 20) return LIKELIHOOD_OPTIONS[3];
  return LIKELIHOOD_OPTIONS[4];
}

export function cyberRiskFromProduct(product: number): NonNullable<ScoreValue> {
  if (product <= 25) return CYBER_RISK_SCORE_OPTIONS[0];
  if (product <= 50) return CYBER_RISK_SCORE_OPTIONS[1];
  if (product <= 75) return CYBER_RISK_SCORE_OPTIONS[2];
  if (product <= 100) return CYBER_RISK_SCORE_OPTIONS[3];
  return CYBER_RISK_SCORE_OPTIONS[4];
}

export function numericOf(v: ScoreValue): number {
  if (!v) return 0;
  const n = Number(v.numeric);
  return Number.isFinite(n) ? n : 0;
}

export function rangeUpperBound(v: ScoreValue): number {
  if (!v) return 0;
  const dashIdx = v.numeric.indexOf("–");
  if (dashIdx >= 0) {
    const n = Number(v.numeric.slice(dashIdx + 1));
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(v.numeric);
  return Number.isFinite(n) ? n : 0;
}

export function RagSwatch({ rag }: { rag: RagDataVizKey }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        width: 16,
        height: 16,
        borderRadius: t.semantic.radius.sm.value,
        flexShrink: 0,
        bgcolor: ragDataVizColor(t, rag),
      })}
      aria-hidden
    />
  );
}

export default function ScoringMetricField({
  label,
  value,
  onChange,
  options = SCORE_OPTIONS,
}: {
  label: string;
  value: ScoreValue;
  onChange: (next: ScoreValue) => void;
  options?: NonNullable<ScoreValue>[];
}) {
  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      const selected = options.find((o) => o.numeric === e.target.value) ?? null;
      onChange(selected);
    },
    [onChange, options],
  );

  return (
    <Stack gap={0.5} sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        component="p"
        sx={({ tokens: t }) => ({
          m: 0,
          fontWeight: 600,
          letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
          fontSize: t.semantic.font.label.sm.fontSize.value,
          lineHeight: t.semantic.font.label.sm.lineHeight.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        {label}
      </Typography>
      <FormControl fullWidth>
        <Select
          displayEmpty
          value={value?.numeric ?? ""}
          onChange={handleChange}
          inputProps={{ "aria-label": label }}
          renderValue={(selected) => {
            const opt = options.find((o) => o.numeric === selected);
            if (!opt) {
              return (
                <Typography
                  component="span"
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.muted.value,
                    fontSize: t.semantic.font.text.md.fontSize.value,
                  })}
                >
                  Not scored
                </Typography>
              );
            }
            return (
              <Stack direction="row" alignItems="center" gap={1}>
                <RagSwatch rag={opt.rag} />
                <span>
                  {opt.numeric} {opt.label}
                </span>
              </Stack>
            );
          }}
        >
          {options.map((opt) => (
            <MenuItem key={opt.numeric} value={opt.numeric}>
              <Stack direction="row" alignItems="center" gap={1}>
                <RagSwatch rag={opt.rag} />
                <span>
                  {opt.numeric} {opt.label}
                </span>
              </Stack>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  );
}
