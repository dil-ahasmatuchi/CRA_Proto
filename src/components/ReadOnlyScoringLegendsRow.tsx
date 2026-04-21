import { Box, Stack, Typography } from "@mui/material";

import { RagSwatch, type ScoreValue } from "./ScoringMetricField.js";
import type { ScenarioScoringInitialScores } from "./ScenarioScoringDropdownsBlock.js";

const METRICS: {
  key: keyof ScenarioScoringInitialScores;
  label: string;
}[] = [
  { key: "impact", label: "Asset criticality" },
  { key: "threat", label: "Threat severity" },
  { key: "vulnerability", label: "Vulnerability severity" },
  { key: "likelihood", label: "Likelihood" },
  { key: "cyberRiskScore", label: "Cyber risk score" },
];

function ReadOnlyMetricLegend({ label, value }: { label: string; value: ScoreValue }) {
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
      {value ? (
        <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
          <RagSwatch rag={value.rag} />
          <Typography
            variant="body1"
            sx={({ tokens: t }) => ({
              color: t.semantic.color.type.default.value,
              fontSize: t.semantic.font.text.md.fontSize.value,
            })}
          >
            {value.numeric} - {value.label}
          </Typography>
        </Stack>
      ) : (
        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({
            color: t.semantic.color.type.muted.value,
            fontSize: t.semantic.font.text.md.fontSize.value,
          })}
        >
          Not scored
        </Typography>
      )}
    </Stack>
  );
}

/**
 * Read-only row of risk legends (no dropdowns), matching the labels used in {@link ScoringRationaleDropdowns}.
 */
export default function ReadOnlyScoringLegendsRow({ scores }: { scores: ScenarioScoringInitialScores }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        width: "100%",
        boxSizing: "border-box",
        p: 3,
        borderRadius: t.semantic.radius.lg.value,
        bgcolor: t.semantic.color.surface.variant.value,
        border: "none",
      })}
    >
      <Stack direction="row" gap={2} sx={{ flexWrap: "wrap", alignItems: "flex-start" }}>
        {METRICS.map(({ key, label }) => (
          <ReadOnlyMetricLegend key={String(key)} label={label} value={scores[key]} />
        ))}
      </Stack>
    </Box>
  );
}
