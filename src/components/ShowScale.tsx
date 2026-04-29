import { Box, Link, Stack, Typography, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router";

import { ragDataVizColor, type RagDataVizKey } from "../data/ragDataVisualization.js";

/** Left-to-right segments for the CRA 5-point criticality bar (matches Figma ITRM scoring scale). */
const SCALE_SEGMENT_RAG: readonly RagDataVizKey[] = ["pos05", "pos04", "neu03", "neg04", "neg05"] as const;

const BAR_HEIGHT_PX = 12;
const MARKER_HEIGHT_PX = 14;
const MARKER_WIDTH_PX = 2;

export type ShowScaleProps = {
  /** Which segment (0–4) the vertical marker centers on; default 2 (medium / yellow). */
  markerBandIndex?: number;
  /** Router path for “View scoring scales”. */
  scalesHref?: string;
};

/**
 * Scoring scale summary: five-band RAG bar, marker, description, and link to settings (Figma: ITRM — Scoring scale).
 */
export default function ShowScale({
  markerBandIndex = 2,
  scalesHref = "/settings/cyber-risk-settings",
}: ShowScaleProps) {
  const { tokens: t } = useTheme();
  const clampedIndex = Math.min(Math.max(markerBandIndex, 0), SCALE_SEGMENT_RAG.length - 1);
  const markerCenterPercent = ((clampedIndex + 0.5) / SCALE_SEGMENT_RAG.length) * 100;

  return (
    <Box
      component="section"
      aria-labelledby="show-scale-heading"
      sx={({ tokens: tok }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: tok.core.spacing["1_5"].value,
        width: "100%",
      })}
    >
      <Typography
        id="show-scale-heading"
        component="h2"
        variant="caption"
        sx={({ tokens: tok }) => ({
          m: 0,
          fontFamily: tok.semantic.font.label.sm.fontFamily.value,
          fontSize: tok.semantic.font.label.sm.fontSize.value,
          lineHeight: tok.semantic.font.label.sm.lineHeight.value,
          letterSpacing: tok.semantic.font.label.sm.letterSpacing.value,
          fontWeight: tok.semantic.fontWeight.emphasis.value,
          color: tok.semantic.color.type.default.value,
        })}
      >
        Scoring scale
      </Typography>

      <Box
        sx={{
          position: "relative",
          width: "120px",
          alignSelf: "flex-start",
          pt: `${(MARKER_HEIGHT_PX - BAR_HEIGHT_PX) / 2}px`,
          pb: `${(MARKER_HEIGHT_PX - BAR_HEIGHT_PX) / 2}px`,
        }}
      >
        <Stack
          direction="row"
          aria-hidden
          sx={{
            width: "100%",
            height: BAR_HEIGHT_PX,
            borderRadius: t.semantic.radius.full.value,
            overflow: "hidden",
          }}
        >
          {SCALE_SEGMENT_RAG.map((rag) => (
            <Box
              key={rag}
              sx={{
                flex: "1 1 0",
                minWidth: 0,
                height: "100%",
                bgcolor: ragDataVizColor(t, rag),
              }}
            />
          ))}
        </Stack>
        <Box
          aria-hidden
          sx={({ tokens: tok }) => ({
            position: "absolute",
            left: `${markerCenterPercent}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: MARKER_WIDTH_PX,
            height: MARKER_HEIGHT_PX,
            borderRadius: tok.semantic.radius.full.value,
            bgcolor: tok.semantic.color.action.primary.default.value,
          })}
        />
      </Box>

      <Typography
        component="p"
        sx={({ tokens: tok }) => ({
          m: 0,
          maxWidth: 480,
          fontFamily: tok.semantic.font.label.sm.fontFamily.value,
          fontSize: tok.semantic.font.label.sm.fontSize.value,
          lineHeight: tok.semantic.font.label.sm.lineHeight.value,
          letterSpacing: tok.semantic.font.label.sm.letterSpacing.value,
          fontWeight: 400,
          color: tok.semantic.color.type.default.value,
        })}
      >
        Your company scoring is mapped on a 5 point criticality scale.
      </Typography>

      <Link
        component={RouterLink}
        to={scalesHref}
        underline="always"
        sx={({ tokens: tok }) => ({
          fontFamily: tok.semantic.font.label.sm.fontFamily.value,
          fontSize: tok.semantic.font.label.sm.fontSize.value,
          lineHeight: tok.semantic.font.label.sm.lineHeight.value,
          letterSpacing: tok.semantic.font.label.sm.letterSpacing.value,
          fontWeight: tok.semantic.fontWeight.emphasis.value,
          color: tok.semantic.color.type.default.value,
          textDecorationColor: "currentcolor",
        })}
      >
        View scoring scales
      </Link>
    </Box>
  );
}
