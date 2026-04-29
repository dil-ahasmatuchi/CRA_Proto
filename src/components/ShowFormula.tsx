import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type FormulaTagVariant = "label" | "operator" | "value";

/**
 * Inline pill for the CRA scoring formulas (Figma: ITRM Cyber Risk Management — Formulas block).
 * Label = left-hand metric name (white); operator = = or × (white); value = right-hand terms (#f9f9fc).
 */
function FormulaTag({ children, variant }: { children: ReactNode; variant: FormulaTagVariant }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        borderRadius: t.semantic.radius.sm.value,
        py: "2px",
        ...(variant === "label"
          ? { pl: 0, pr: t.core.spacing["1"].value }
          : { px: t.core.spacing["0_5"].value }),
        flexShrink: 0,
        bgcolor:
          variant === "value"
            ? "#f9f9fc"
            : t.semantic.color.background.base.value,
      })}
    >
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          m: 0,
          fontFamily: t.semantic.font.text.sm.fontFamily.value,
          fontSize: t.semantic.font.text.sm.fontSize.value,
          lineHeight: t.semantic.font.text.sm.lineHeight.value,
          letterSpacing: t.semantic.font.text.sm.letterSpacing.value,
          fontWeight: variant === "label" ? 400 : 600,
          color: t.semantic.color.type.default.value,
          whiteSpace: "nowrap",
        })}
      >
        {children}
      </Typography>
    </Box>
  );
}

function FormulaRow({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      flexWrap="wrap"
      useFlexGap
      sx={({ tokens: t }) => ({
        gap: t.core.spacing["0_25"].value,
        rowGap: t.core.spacing["0_25"].value,
      })}
    >
      {children}
    </Stack>
  );
}

export type ShowFormulaProps = {
  /** When true, the section width follows formula content (for horizontal flex rows). */
  shrinkToContent?: boolean;
};

/** CRA scoring formula reference for activity / assessment surfaces. */
export default function ShowFormula({ shrinkToContent = false }: ShowFormulaProps = {}) {
  return (
    <Box
      component="section"
      aria-labelledby="show-formula-heading"
      sx={({ tokens: t }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: t.core.spacing["1_5"].value,
        width: shrinkToContent ? "fit-content" : "100%",
        maxWidth: shrinkToContent ? "100%" : undefined,
        boxSizing: "border-box",
      })}
    >
      <Typography
        id="show-formula-heading"
        component="h2"
        variant="caption"
        sx={({ tokens: t }) => ({
          m: 0,
          fontFamily: t.semantic.font.label.sm.fontFamily.value,
          fontSize: t.semantic.font.label.sm.fontSize.value,
          lineHeight: t.semantic.font.label.sm.lineHeight.value,
          letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
          fontWeight: t.semantic.fontWeight.emphasis.value,
          color: t.semantic.color.type.default.value,
        })}
      >
        Formulas
      </Typography>

      <Stack
        sx={({ tokens: t }) => ({
          width: shrinkToContent ? "fit-content" : "100%",
          maxWidth: shrinkToContent ? "100%" : undefined,
          alignItems: "flex-start",
          gap: t.core.spacing["1_5"].value,
        })}
      >
        <FormulaRow>
          <FormulaTag variant="label">Impact</FormulaTag>
          <FormulaTag variant="operator">=</FormulaTag>
          <FormulaTag variant="value">Asset criticality</FormulaTag>
        </FormulaRow>

        <FormulaRow>
          <FormulaTag variant="label">Likelihood</FormulaTag>
          <FormulaTag variant="operator">=</FormulaTag>
          <FormulaTag variant="value">Threat severity</FormulaTag>
          <FormulaTag variant="operator">x</FormulaTag>
          <FormulaTag variant="value">Vulnerability severity</FormulaTag>
        </FormulaRow>

        <FormulaRow>
          <FormulaTag variant="label">Cyber risk score</FormulaTag>
          <FormulaTag variant="operator">=</FormulaTag>
          <FormulaTag variant="value">Impact</FormulaTag>
          <FormulaTag variant="operator">x</FormulaTag>
          <FormulaTag variant="value">Likelihood</FormulaTag>
        </FormulaRow>
      </Stack>
    </Box>
  );
}
