import { Box, Stack, TextField, Typography, useTheme } from "@mui/material";
import { useId } from "react";

import type { ScoringBandRow } from "../../data/cyberRiskScoringScales.js";
import { RagSwatch } from "../ScoringMetricField.js";

export type ScoringScaleCardProps = {
  row: ScoringBandRow;
  readOnly: boolean;
  onChange: (update: Partial<Pick<ScoringBandRow, "from" | "to" | "description">>) => void;
  /** Shown for invalid from/to in edit mode */
  error?: string;
};

/**
 * One grey card: legend, description, From/To (Figma: concrete/98 + inputs).
 */
export default function ScoringScaleCard({
  row,
  readOnly,
  onChange,
  error,
}: ScoringScaleCardProps) {
  const { tokens: t } = useTheme();
  const base = useId();
  const fromId = `${base}-from`;
  const toId = `${base}-to`;
  const descId = `${base}-desc`;

  return (
    <Box
      sx={({ tokens: th }) => ({
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        alignItems: "flex-start",
        p: 2,
        borderRadius: th.semantic.radius.lg.value,
        width: "100%",
        minWidth: 0,
        bgcolor: th.semantic.color.background.container.value,
      })}
    >
      <Stack
        flex={1}
        gap={1.5}
        direction="row"
        alignItems="flex-start"
        sx={{ minWidth: 0, flex: "1 1 200px" }}
      >
        <RagSwatch rag={row.rag} />
        <Stack alignItems="flex-start" sx={{ gap: "12px", minWidth: 0, width: "100%" }}>
          <Typography
            component="p"
            variant="body1"
            fontWeight={600}
            sx={{
              m: 0,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              fontSize: t.semantic.font.text.md.fontSize.value,
            }}
          >
            {row.level} – {row.name}
          </Typography>
          {readOnly ? (
            <Typography
              id={descId}
              component="p"
              sx={{
                m: 0,
                color: t.semantic.color.type.default.value,
                lineHeight: t.semantic.font.text.md.lineHeight.value,
                fontSize: t.semantic.font.text.md.fontSize.value,
                letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                fontWeight: 400,
              }}
            >
              {row.description}
            </Typography>
          ) : (
            <TextField
              id={descId}
              multiline
              minRows={2}
              fullWidth
              label="Description"
              value={row.description}
              onChange={(e) => onChange({ description: e.target.value })}
              margin="none"
            />
          )}
        </Stack>
      </Stack>

      <Stack
        direction="row"
        gap={1.5}
        sx={{ width: 200, maxWidth: "100%", flexShrink: 0, pt: "32px" }}
        alignItems="flex-start"
      >
        <TextField
          id={fromId}
          type="number"
          label="From"
          value={row.from}
          onChange={(e) => onChange({ from: Number(e.target.value) })}
          size="small"
          disabled={readOnly}
          error={!!error}
          fullWidth
          inputProps={{ "aria-label": "From" }}
        />
        <TextField
          id={toId}
          type="number"
          label="To"
          value={row.to}
          onChange={(e) => onChange({ to: Number(e.target.value) })}
          size="small"
          disabled={readOnly}
          error={!!error}
          fullWidth
          inputProps={{ "aria-label": "To" }}
        />
      </Stack>
      {error ? (
        <Typography
          role="alert"
          color="error"
          sx={{ width: "100%", m: 0, mt: -1, fontSize: 12 }}
        >
          {error}
        </Typography>
      ) : null}
    </Box>
  );
}
