import { Box, Button, Stack, Typography } from "@mui/material";

import emptyStateIllustration from "../assets/cra-assessment-empty-state.png";

const COPY = {
  scoring: {
    title: "Your scoped Cyber risks and scenarios will be displayed here.",
    subtitle: "Please add assets to Scope first.",
    buttonLabel: "Go to scope",
  },
  results: {
    title: "Your results will be displayed here.",
    subtitle: "Please finish scoring all your scoped scenarios first.",
    buttonLabel: "Go to scoring",
  },
} as const;

export type AssessmentScopeEmptyStateVariant = keyof typeof COPY;

type AssessmentScopeEmptyStateProps = {
  variant: AssessmentScopeEmptyStateVariant;
  onPrimaryAction: () => void;
};

const ILLUSTRATION_SCALE = 0.5;
const ILLUSTRATION_MAX_WIDTH_PX = 280 * ILLUSTRATION_SCALE;
const ILLUSTRATION_WRAPPER_MAX_WIDTH_PX = 320 * ILLUSTRATION_SCALE;

/** Full composite illustration (document icon, card, diagonal accents) for both variants. */
function EmptyStateIllustration() {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: ILLUSTRATION_WRAPPER_MAX_WIDTH_PX,
        display: "flex",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Box
        component="img"
        src={emptyStateIllustration}
        alt=""
        sx={{
          width: "100%",
          height: "auto",
          maxWidth: ILLUSTRATION_MAX_WIDTH_PX,
          display: "block",
        }}
      />
    </Box>
  );
}

/** Empty state when Scoring or Results has nothing to show (ITRM Figma). */
export default function AssessmentScopeEmptyState({
  variant,
  onPrimaryAction,
}: AssessmentScopeEmptyStateProps) {
  const { title, subtitle, buttonLabel } = COPY[variant];

  return (
    <Stack
      alignItems="center"
      sx={{
        width: "100%",
        py: 7,
        px: 2,
      }}
    >
      <Stack
        alignItems="center"
        sx={{
          width: "100%",
          maxWidth: 712,
          gap: 6,
        }}
      >
        <EmptyStateIllustration />
        <Stack
          alignItems="center"
          sx={{
            textAlign: "center",
            gap: 1,
            width: "100%",
            maxWidth: 688,
          }}
        >
          <Typography
            component="h2"
            sx={({ tokens: t }) => ({
              fontFamily: t.semantic.font.text.md.fontFamily.value,
              fontSize: 26,
              lineHeight: "34px",
              fontWeight: t.core.fontWeight.semiBold.value,
              letterSpacing: 0,
              color: t.semantic.color.type.default.value,
              width: "100%",
            })}
          >
            {title}
          </Typography>
          <Typography
            sx={({ tokens: t }) => ({
              fontFamily: t.semantic.font.text.md.fontFamily.value,
              fontSize: t.semantic.font.text.md.fontSize.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              letterSpacing: t.semantic.font.text.md.letterSpacing.value,
              fontWeight: 400,
              color: t.semantic.color.type.default.value,
              width: "100%",
            })}
          >
            {subtitle}
          </Typography>
        </Stack>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="contained" color="primary" size="medium" onClick={onPrimaryAction}>
            {buttonLabel}
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
}
