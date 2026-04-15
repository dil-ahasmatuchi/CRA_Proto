import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { assessmentStatusLabel } from "../data/assessmentStatusLabels.js";
import { resolveColorForCanvas } from "../data/ragDataVisualization.js";
import type { AssessmentStatus as AssessmentStatusValue } from "../data/types.js";

export type AssessmentStatusProps = {
  status: AssessmentStatusValue;
  /** Optional override; defaults to {@link assessmentStatusLabel}(status). */
  label?: string;
};

type Tokens = Theme extends { tokens: infer T } ? T : never;

type TokenPick = (tokens: Tokens) => string;

/** Color/Status/Neutral/Content variant (`semantic.color.status.neutral.textDefault`). */
const neutralStatusContentVariant: TokenPick = (t) =>
  t.semantic.color.status.neutral.textDefault.value;

const STATUS_BACKGROUND: Record<AssessmentStatusValue, TokenPick> = {
  Draft: (t) => t.semantic.color.status.neutral.backgroundVariant.value,
  Scoping: (t) => t.semantic.color.status.notification.default.value,
  Scoring: (t) => t.core.color.purple["70"].value,
  Approved: (t) => t.semantic.color.status.success.default.value,
  Overdue: (t) => t.semantic.color.status.error.default.value,
};

/** Solid fill for status swatches (e.g. dropdown dots) — matches pill backgrounds. */
export function assessmentStatusDotBackground(
  status: AssessmentStatusValue,
  tokens: Tokens,
): string {
  return STATUS_BACKGROUND[status](tokens);
}

/**
 * Same hues as {@link assessmentStatusDotBackground}, but resolved to rgb/hex for Chart.js
 * canvas (CSS variables from tokens do not paint on canvas).
 */
const ASSESSMENT_STATUS_CANVAS_FALLBACK: Record<AssessmentStatusValue, string> = {
  Draft: "#e8e9ea",
  Scoping: "#1DD9F9",
  Scoring: "#db8bff",
  Approved: "#8EE400",
  Overdue: "#d32f2f",
};

export function assessmentStatusColorForCanvas(
  status: AssessmentStatusValue,
  tokens: Tokens,
): string {
  return resolveColorForCanvas(
    assessmentStatusDotBackground(status, tokens),
    ASSESSMENT_STATUS_CANVAS_FALLBACK[status],
  );
}

const STATUS_FOREGROUND: Record<AssessmentStatusValue, TokenPick> = {
  Draft: neutralStatusContentVariant,
  Scoping: neutralStatusContentVariant,
  Scoring: neutralStatusContentVariant,
  Approved: neutralStatusContentVariant,
  Overdue: (t) => t.semantic.color.type.inverse.value,
};

/**
 * Renders assessment lifecycle status with Atlas semantic colors aligned to CRA data
 * (`MockCyberRiskAssessment.status` / `riskAssessments`).
 */
export default function AssessmentStatus({ status, label }: AssessmentStatusProps) {
  return (
    <Box
      sx={({ tokens }) => ({
        display: "inline-flex",
        alignItems: "center",
        px: 1.5,
        py: 0.25,
        borderRadius: 9999,
        minHeight: 24,
        backgroundColor: STATUS_BACKGROUND[status](tokens),
      })}
    >
      <Typography
        variant="textSm"
        sx={({ tokens }) => ({
          color: STATUS_FOREGROUND[status](tokens),
          fontWeight: 600,
          lineHeight: "16px",
          letterSpacing: "0.3px",
        })}
      >
        {label ?? assessmentStatusLabel(status)}
      </Typography>
    </Box>
  );
}
