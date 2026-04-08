import { Box, Typography, useTheme } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

export type MetaTagProps = {
  /** Label text without a trailing colon; the component normalizes and appends `:`. */
  label: string;
  value: ReactNode;
  /** Use when `value` is not plain text (e.g. links) so assistive tech gets a full phrase. */
  ariaLabel?: string;
  sx?: SxProps<Theme>;
};

function normalizeLabel(label: string): string {
  return label.replace(/:\s*$/, "").trim();
}

export default function MetaTag({ label, value, ariaLabel, sx }: MetaTagProps) {
  const { tokens } = useTheme();
  const labelWithColon = `${normalizeLabel(label)}:`;

  return (
    <Box
      component="span"
      aria-label={ariaLabel}
      data-name="Page header / Heading + Metadata / Tag"
      sx={[
        ({ tokens: t }) => ({
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          paddingInline: t.core.spacing["1"].value,
          py: 0.25,
          borderRadius: t.semantic.radius.sm.value,
          whiteSpace: "nowrap",
          bgcolor: t.semantic.color.surface.variant.value,
          color: t.semantic.color.type.default.value,
        }),
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Typography
        component="span"
        variant="textSm"
        sx={{
          color: tokens.semantic.color.type.default.value,
        }}
      >
        {labelWithColon}
      </Typography>
      <Typography
        component="span"
        variant="textSm"
        fontWeight={tokens.core.fontWeight.semiBold.value}
        sx={{
          color: tokens.semantic.color.type.default.value,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
