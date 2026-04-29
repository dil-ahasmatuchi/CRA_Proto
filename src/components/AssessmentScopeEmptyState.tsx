import { Box, Button, Stack, Typography } from "@mui/material";

import emptyStateIllustration from "../assets/cra-assessment-empty-state.png";

const LEGACY_COPY = {
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

export type AssessmentScopeEmptyStateLegacyVariant = keyof typeof LEGACY_COPY;

export type AssessmentScopeEmptyStateProps =
  | {
      variant: AssessmentScopeEmptyStateLegacyVariant;
      onPrimaryAction: () => void;
    }
  | {
      variant: "scopeEntity";
      /** e.g. "Cyber risks", "Threats" — used in title copy. */
      entityTitle: string;
      reason: "needAssets";
      /** Navigates to the Scoped assets view. */
      onNavigateToScopedAssets: () => void;
    }
  | {
      variant: "scopeEntity";
      entityTitle: string;
      reason: "noLinks";
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

function scopeEntityNoLinksTitle(entityTitle: string): string {
  const rest = entityTitle.slice(1);
  const first = entityTitle.charAt(0).toLowerCase();
  return `No ${first}${rest} are linked to the assets in scope.`;
}

/** Empty state when Scoring or Results has nothing to show (ITRM Figma), or Scope entity grids need assets / have no catalog links. */
export default function AssessmentScopeEmptyState(props: AssessmentScopeEmptyStateProps) {
  let title: string;
  let subtitle: string | null;
  let buttonLabel: string | null = null;
  let onPrimary: (() => void) | undefined;

  if (props.variant === "scopeEntity") {
    if (props.reason === "needAssets") {
      title = `${props.entityTitle} related to the included assets will be displayed here.`;
      subtitle = "Please include assets first.";
      buttonLabel = "Include assets";
      onPrimary = props.onNavigateToScopedAssets;
    } else {
      title = scopeEntityNoLinksTitle(props.entityTitle);
      subtitle = null;
      buttonLabel = null;
      onPrimary = undefined;
    }
  } else {
    const c = LEGACY_COPY[props.variant];
    title = c.title;
    subtitle = c.subtitle;
    buttonLabel = c.buttonLabel;
    onPrimary = props.onPrimaryAction;
  }

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
          {subtitle ? (
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
          ) : null}
        </Stack>
        {buttonLabel != null && onPrimary ? (
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button variant="contained" color="primary" size="medium" onClick={onPrimary}>
              {buttonLabel}
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Stack>
  );
}
