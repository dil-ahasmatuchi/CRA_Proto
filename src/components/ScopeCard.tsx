import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

/** Scope overview card: icon + title + optional header action; “Included in this assessment” + count (Figma). */
export type ScopeCardProps = {
  title: string;
  icon: ReactNode;
  includedCount: number;
  totalCount: number;
  /** Shown after the fraction, e.g. “Assets” → “0 / 124 Assets”. */
  countNoun: string;
  headerAction?: ReactNode;
  onCardClick?: () => void;
  cardActionAriaLabel?: string;
};

export function ScopeCard({
  title,
  icon,
  includedCount,
  totalCount,
  countNoun,
  headerAction,
  onCardClick,
  cardActionAriaLabel,
}: ScopeCardProps) {
  const isEmpty = includedCount === 0;

  const inner = (
    <CardContent
      sx={({ tokens: t }) => ({
        flex: 1,
        width: "100%",
        boxSizing: "border-box",
        pt: t.core.spacing["3"].value,
        px: t.core.spacing["3"].value,
        pb: t.core.spacing["3"].value,
        "&:last-child": { pb: t.core.spacing["3"].value },
      })}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto minmax(0, 1fr) auto",
          gridTemplateRows: "auto auto",
          columnGap: 1.5,
          rowGap: 2,
          alignItems: "start",
        }}
      >
        <Box
          sx={({ tokens: t }) => {
            const iconWellRadius = t.semantic.radius.md.value;
            return {
              gridRow: "1 / 3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: iconWellRadius,
              bgcolor: isEmpty
                ? t.semantic.color.surface.variant.value
                : t.semantic.color.accent.green.background.value,
              color: isEmpty
                ? t.semantic.color.type.default.value
                : t.semantic.color.accent.green.content.value,
              flexShrink: 0,
              /**
               * `CardHeaderIcon` adds nested boxes with their own surface background.
               * Empty: one transparent direct child is enough.
               * Filled: strip backgrounds on all descendants so only this green well shows (no gray cap).
               */
              ...(isEmpty
                ? {
                    "& > *": {
                      bgcolor: "transparent",
                      borderRadius: iconWellRadius,
                      boxShadow: "none",
                    },
                  }
                : {
                    "& *": {
                      backgroundColor: "transparent !important",
                      background: "none !important",
                      boxShadow: "none !important",
                    },
                  }),
            };
          }}
        >
          {icon}
        </Box>
        <Typography
          component="h3"
          variant="h3"
          fontWeight={600}
          sx={({ tokens: t }) => ({
            gridColumn: 2,
            gridRow: 1,
            color: t.semantic.color.type.default.value,
            alignSelf: "center",
          })}
        >
          {title}
        </Typography>
        {headerAction ? (
          <Box
            sx={{
              gridColumn: 3,
              gridRow: 1,
              justifySelf: "end",
              alignSelf: "center",
            }}
          >
            {headerAction}
          </Box>
        ) : null}
        <Stack
          gap={0.5}
          sx={{ gridColumn: "2 / 4", gridRow: 2, minWidth: 0 }}
          aria-label={`${title} scope counts`}
        >
          <Typography
            variant="caption"
            component="p"
            sx={({ tokens: t }) => ({
              m: 0,
              color: t.semantic.color.type.muted.value,
              letterSpacing: "0.3px",
              fontSize: t.semantic.font.label.sm.fontSize.value,
              lineHeight: t.semantic.font.label.sm.lineHeight.value,
            })}
          >
            Included in this assessment
          </Typography>
          <Typography
            component="p"
            variant="body1"
            sx={({ tokens: t }) => ({
              m: 0,
              color: t.semantic.color.type.default.value,
              letterSpacing: t.semantic.font.text.md.letterSpacing.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              fontSize: t.semantic.font.text.md.fontSize.value,
            })}
          >
            <Box component="span" sx={{ fontWeight: 700 }}>
              {includedCount}
            </Box>
            <Box component="span" sx={{ fontWeight: 400 }}>
              {` / ${totalCount} ${countNoun}`}
            </Box>
          </Typography>
        </Stack>
      </Box>
    </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={({ tokens: t }) => ({
        minWidth: 0,
        width: "100%",
        p: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        borderRadius: t.semantic.radius.lg.value,
        borderStyle: "solid",
        borderColor: t.semantic.color.ui.divider.default.value,
        borderWidth: t.semantic.borderWidth.thin.value,
        bgcolor: t.semantic.color.background.base.value,
        boxShadow: "none",
      })}
    >
      {onCardClick ? (
        <CardActionArea
          onClick={onCardClick}
          aria-label={cardActionAriaLabel ?? `View ${title} included in this assessment`}
          sx={{
            flex: 1,
            alignSelf: "stretch",
            width: "100%",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "flex-start",
            "& .MuiCardActionArea-focusHighlight": {
              opacity: 0,
            },
          }}
        >
          {inner}
        </CardActionArea>
      ) : (
        inner
      )}
    </Card>
  );
}
