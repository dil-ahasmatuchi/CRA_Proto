import { useId, useState, type ReactNode } from "react";
import { Card } from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import AiSparkleIcon from "@diligentcorp/atlas-react-bundle/icons/AiSparkle";

const AI_TEXT_GRADIENT =
  "linear-gradient(128.4deg, #BE0C1E 17.49%, #AB48DA 58.74%, #4069FE 100%)";

export type AiContentCardProps = {
  /** Main body: any layout or components */
  children: ReactNode;
  /** When false, omit divider and footer action row */
  showFooter?: boolean;
  /** Footer primary action label (only when `showFooter`) */
  actionLabel?: string;
  /** Invoked when the footer action is activated (only when `showFooter`) */
  onAction?: () => void;
  /** When true, footer button shows loading state (hides sparkle start icon) */
  footerLoading?: boolean;
};

export type AiContentCardAssessmentPresetProps = {
  /** Gradient heading next to the AI sparkle icon */
  title?: string;
  /** Supporting body copy */
  description?: string;
  /** Label above the radio group */
  assessmentTypeLabel?: string;
  /** When true, only the gradient title and description are shown (no radio group). */
  omitAssessmentType?: boolean;
  /** Row of radio options: value and user-visible label */
  assessmentOptions?: { value: string; label: string }[];
  /** Initially selected option `value` (uncontrolled only) */
  defaultAssessmentValue?: string;
  /** Controlled selection; use with `onAssessmentChange` */
  assessmentValue?: string;
  onAssessmentChange?: (value: string) => void;
};

const DEFAULT_OPTIONS = [
  { value: "quick", label: "Quick scan" },
  { value: "standard", label: "Standard" },
  { value: "full", label: "Full evaluation" },
] as const;

/**
 * AI-themed card shell: Atlas `Card` with AI start accent, a padded main slot for
 * arbitrary content, and an optional divider + AI footer button.
 */
export default function AiContentCard({
  children,
  showFooter = true,
  actionLabel = "Generate with AI",
  onAction,
  footerLoading = false,
}: AiContentCardProps) {
  const {
    presets,
    presets: { CircularProgressPresets },
  } = useTheme();
  const { Divider } = presets.DividerPresets.components;

  return (
    <Card
      color="ai-start"
      sx={{
        position: "relative",
        isolation: "isolate",
        width: "100%",
        maxWidth: 1280,
        alignSelf: "stretch",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        pt: 0,
        px: 0,
        borderRadius: ({ tokens: t }) => t.semantic.radius.md.value,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Stack
          sx={{
            pt: 2,
            pb: 0,
            gap: 3,
          }}
        >
          <Box sx={{ px: 3, width: "100%", boxSizing: "border-box" }}>{children}</Box>
          {showFooter && (
            <Stack sx={{ border: "none", background: "unset" }}>
              <Divider color="default" />
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                sx={{
                  boxSizing: "content-box",
                  px: 3,
                  pt: 2,
                  pb: ({ tokens: t }) => t.core.spacing["2"].value,
                  gap: 1.5,
                  minHeight: 40,
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  color="ai"
                  size="medium"
                  startIcon={footerLoading ? undefined : <AiSparkleIcon aria-hidden />}
                  loading={footerLoading}
                  loadingPosition="start"
                  loadingIndicator={
                    <CircularProgress color="inherit" {...CircularProgressPresets.size.sm} />
                  }
                  onClick={onAction}
                  aria-busy={footerLoading}
                >
                  {actionLabel}
                </Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Box>
    </Card>
  );
}

/**
 * Default assessment UI for {@link AiContentCard}: gradient title, description,
 * and assessment type radio group.
 */
export function AiContentCardAssessmentPreset({
  title = "Choose how AI helps",
  description = "Pick an assessment type so we can tailor AI suggestions to your workflow.",
  assessmentTypeLabel = "Assessment type",
  omitAssessmentType = false,
  assessmentOptions = [...DEFAULT_OPTIONS],
  defaultAssessmentValue = "full",
  assessmentValue: controlledValue,
  onAssessmentChange,
}: AiContentCardAssessmentPresetProps) {
  const groupId = useId();
  const sectionTitleId = `${groupId}-heading`;
  const labelId = `${groupId}-label`;
  const [uncontrolled, setUncontrolled] = useState(defaultAssessmentValue);
  const isControlled = controlledValue !== undefined && onAssessmentChange !== undefined;
  const assessment = isControlled ? controlledValue : uncontrolled;
  const setAssessment = isControlled ? onAssessmentChange : setUncontrolled;

  return (
    <Stack
      component="section"
      aria-labelledby={sectionTitleId}
      gap={3}
      alignItems="flex-start"
      sx={{ width: "100%" }}
    >
      <Stack gap={2} alignItems="flex-start" sx={{ width: "100%" }}>
        <Stack direction="row" alignItems="center" gap={1} sx={{ width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              flexShrink: 0,
            }}
            aria-hidden
          >
            <AiSparkleIcon size="lg" />
          </Box>
          <Typography
            id={sectionTitleId}
            component="h2"
            sx={({ tokens: t }) => ({
              m: 0,
              fontFamily: t.semantic.font.title.h4Md.fontFamily.value,
              fontSize: t.semantic.font.title.h4Md.fontSize.value,
              lineHeight: t.semantic.font.title.h4Md.lineHeight.value,
              letterSpacing: t.semantic.font.title.h4Md.letterSpacing.value,
              fontWeight: t.semantic.fontWeight.emphasis.value,
              background: AI_TEXT_GRADIENT,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            })}
          >
            {title}
          </Typography>
        </Stack>

        <Typography
          variant="body1"
          sx={({ tokens: t }) => ({
            m: 0,
            fontSize: t.semantic.font.text.md.fontSize.value,
            lineHeight: t.semantic.font.text.md.lineHeight.value,
            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
            color: t.semantic.color.type.default.value,
          })}
        >
          {description}
        </Typography>
      </Stack>

      {omitAssessmentType ? null : (
        <Stack gap={0} alignItems="flex-start" sx={{ width: "100%" }}>
          <Typography
            id={labelId}
            component="p"
            variant="labelSm"
            sx={({ tokens: t }) => ({
              m: 0,
              fontWeight: t.semantic.fontWeight.emphasis.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            {assessmentTypeLabel}
          </Typography>

          <FormControl sx={{ width: "100%" }}>
            <RadioGroup
              row
              name={`${groupId}-assessment`}
              value={assessment}
              onChange={(_, v) => setAssessment(v)}
              aria-labelledby={labelId}
              sx={{
                flexWrap: "wrap",
                gap: 2,
                columnGap: 2,
                rowGap: 1,
              }}
            >
              {assessmentOptions.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  value={opt.value}
                  control={<Radio />}
                  label={opt.label}
                  sx={{
                    mr: 0,
                    ml: 0,
                    "& .MuiFormControlLabel-label": ({ tokens: t }) => ({
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      color: t.semantic.color.type.default.value,
                    }),
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Stack>
      )}
    </Stack>
  );
}
