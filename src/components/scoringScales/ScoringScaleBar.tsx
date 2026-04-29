import { Box, Stack, Typography, useTheme } from "@mui/material";

import { ragDataVizColor, type RagDataVizKey } from "../../data/ragDataVisualization.js";

export type ScoringRangeSegment = {
  bandLabel: string;
  from: number;
  to: number;
  rag: RagDataVizKey;
};

export type ScoringScaleBarProps = {
  segments: ScoringRangeSegment[];
  /** Inclusive lower bound of the full scale (e.g. 1 for cyber 1–125). */
  scaleMin: number;
  /** Inclusive upper bound of the full scale (e.g. 125 for cyber). */
  scaleMax: number;
};

function segmentWidthUnits(seg: ScoringRangeSegment): number {
  if (seg.from <= seg.to) {
    return Math.max(1, seg.to - seg.from + 1);
  }
  return 1;
}

/**
 * Range summary above band cards: column widths match each band’s share of [scaleMin, scaleMax].
 */
export default function ScoringScaleBar({ segments, scaleMin, scaleMax }: ScoringScaleBarProps) {
  const { tokens: t } = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        width: "100%",
        alignItems: "flex-start",
        minWidth: 0,
        isolation: "isolate",
      }}
      aria-label={`Scale from ${scaleMin} to ${scaleMax}`}
    >
      {segments.map((seg, index) => {
        const isFirst = index === 0;
        const isLast = index === segments.length - 1;
        const weight = segmentWidthUnits(seg);
        return (
          <Box
            key={seg.bandLabel}
            sx={{
              flexGrow: weight,
              flexShrink: 1,
              flexBasis: 0,
              minWidth: 0,
              zIndex: segments.length - index,
            }}
          >
            <Stack gap={0.5} alignItems="flex-start" sx={{ width: "100%" }}>
              <Typography
                component="p"
                sx={{
                  m: 0,
                  color: t.semantic.color.type.muted.value,
                  fontSize: 11,
                  lineHeight: "16px",
                  letterSpacing: 0.4,
                  fontWeight: 400,
                }}
              >
                {seg.bandLabel}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 12,
                  borderRadius: 0.5,
                  borderTopLeftRadius: isFirst ? 4 : 0,
                  borderBottomLeftRadius: isFirst ? 4 : 0,
                  borderTopRightRadius: isLast ? 4 : 0,
                  borderBottomRightRadius: isLast ? 4 : 0,
                  bgcolor: ragDataVizColor(t, seg.rag),
                }}
                aria-hidden
              />
              <Typography
                component="p"
                sx={{
                  m: 0,
                  color: t.semantic.color.type.default.value,
                  fontSize: 11,
                  lineHeight: "16px",
                  letterSpacing: 0.4,
                  fontWeight: 600,
                }}
              >
                {seg.from} to {seg.to}
              </Typography>
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
