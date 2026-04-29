import { useId, type ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
  type SxProps,
  type Theme,
} from "@mui/material";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

export type AIBannerProps = {
  /** Primary heading (Figma: AI scoring). */
  title?: string;
  /** Supporting copy below the title. */
  description?: ReactNode;
  /** Button label (Figma: Start AI scoring). */
  actionLabel?: string;
  /** Invoked when the primary action is activated. Omit to hide the button. */
  onAction?: () => void;
  /** When true, the action button shows a loading state (hides the sparkle start icon). */
  actionLoading?: boolean;
  /** Optional styles merged onto the root banner container. */
  sx?: SxProps<Theme>;
};

/**
 * Compact AI call-to-action banner: soft purple background, title + description on the left,
 * and an Atlas AI outlined button on the right. Matches ITRM Cyber Risk Management Figma
 * (Alert + AI button, node 11153:118957).
 */
export default function AIBanner({
  title = "AI scoring",
  description = "Our AI agent will automatically score all the scenarios.",
  actionLabel = "Start AI scoring",
  onAction,
  actionLoading = false,
  sx: sxProp,
}: AIBannerProps) {
  const {
    presets: { CircularProgressPresets },
  } = useTheme();
  const titleId = useId();

  return (
    <Box
      component="section"
      aria-labelledby={titleId}
      sx={[
        ({ tokens: t }) => ({
          width: "100%",
          minWidth: 0,
          maxWidth: "100%",
          boxSizing: "border-box",
          borderRadius: t.semantic.radius.lg.value,
          backgroundColor: t.core.color.purple["95"].value,
          px: t.core.spacing["3"].value,
          py: t.core.spacing["2"].value,
        }),
        ...(Array.isArray(sxProp) ? sxProp : sxProp != null ? [sxProp] : []),
      ]}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={({ tokens: t }) => ({
          width: "100%",
          minWidth: 0,
          flexWrap: "wrap",
          gap: t.core.spacing["2"].value,
        })}
      >
        <Stack
          sx={({ tokens: t }) => ({
            flex: "1 1 0",
            minWidth: 0,
            gap: t.core.spacing["0_5"].value,
            alignItems: "flex-start",
          })}
        >
          <Typography
            id={titleId}
            component="h2"
            variant="body1"
            sx={({ tokens: t }) => ({
              m: 0,
              width: "100%",
              fontFamily: t.semantic.font.text.body.fontFamily.value,
              fontSize: t.semantic.font.text.body.fontSize.value,
              lineHeight: t.semantic.font.text.body.lineHeight.value,
              letterSpacing: t.semantic.font.text.body.letterSpacing.value,
              fontWeight: t.semantic.fontWeight.emphasis.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            {title}
          </Typography>
          {typeof description === "string" ? (
            <Typography
              component="p"
              variant="textMd"
              sx={({ tokens: t }) => ({
                m: 0,
                width: "100%",
                fontFamily: t.semantic.font.text.md.fontFamily.value,
                fontSize: t.semantic.font.text.md.fontSize.value,
                lineHeight: t.semantic.font.text.md.lineHeight.value,
                letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                fontWeight: t.core.fontWeight.regular.value,
                color: t.semantic.color.type.default.value,
              })}
            >
              {description}
            </Typography>
          ) : (
            <Box
              sx={({ tokens: t }) => ({
                width: "100%",
                minWidth: 0,
                fontFamily: t.semantic.font.text.md.fontFamily.value,
                fontSize: t.semantic.font.text.md.fontSize.value,
                lineHeight: t.semantic.font.text.md.lineHeight.value,
                letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                fontWeight: t.core.fontWeight.regular.value,
                color: t.semantic.color.type.default.value,
              })}
            >
              {description}
            </Box>
          )}
        </Stack>

        {onAction ? (
          <Button
            type="button"
            variant="outlined"
            color="ai"
            size="medium"
            startIcon={actionLoading ? undefined : <AiSparkleIcon aria-hidden />}
            loading={actionLoading}
            loadingPosition="start"
            loadingIndicator={
              <CircularProgress color="inherit" {...CircularProgressPresets.size.sm} />
            }
            onClick={onAction}
            aria-busy={actionLoading}
            sx={({ tokens: t }) => ({
              flexShrink: 0,
              alignSelf: { xs: "stretch", sm: "center" },
              minHeight: 40,
              px: t.core.spacing["1_5"].value,
              py: t.core.spacing["0_5"].value,
              borderRadius: t.semantic.radius.md.value,
            })}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
