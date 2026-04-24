import { useId, useState, type ReactNode } from "react";
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

export type AICardProps = {
  /** Main body: any layout or components */
  children: ReactNode;
};

export type AICardAssessmentPresetProps = {
  /** Main heading (plain text in scoring layout; gradient when the legacy AI header is used). */
  title?: string;
  /** Supporting body copy (plain string or rich layout). */
  description?: ReactNode;
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
  /** Primary AI action label (shown to the right of the description when `onAction` is set). */
  actionLabel?: string;
  /** Invoked when the primary AI action is activated */
  onAction?: () => void;
  /** When true, the action button shows a loading state (hides sparkle start icon). */
  actionLoading?: boolean;
};

const DEFAULT_OPTIONS = [
  { value: "quick", label: "Quick scan" },
  { value: "standard", label: "Standard" },
  { value: "full", label: "Full evaluation" },
] as const;

type FormulaTagVariant = "label" | "operator" | "value";

function FormulaTag({ children, variant }: { children: ReactNode; variant: FormulaTagVariant }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        borderRadius: "4px",
        pt: variant === "operator" ? 0 : "2px",
        px: variant === "label" ? 0 : "4px",
        pb: "2px",
        minWidth: variant === "operator" ? 16 : undefined,
        width: variant === "operator" ? 16 : undefined,
        flexShrink: 0,
        bgcolor:
          variant === "operator"
            ? "#FFFFFF"
            : variant === "value"
              ? "var(--lens-core-color-purple-95)"
              : "var(--lens-component-ai-chat-box-container-background-color)",
      }}
    >
      <Typography
        component="span"
        sx={({ tokens: t }) => ({
          m: 0,
          fontFamily: t.semantic.font.text.sm.fontFamily.value,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: "16px",
          letterSpacing: "0.3px",
          color: "#282E37",
        })}
      >
        {children}
      </Typography>
    </Box>
  );
}

/** 1px-wide column; 10px-tall gray divider between formula groups. */
function FormulaGroupSeparator() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "relative",
        flex: "0 0 1px",
        width: 1,
        minHeight: 18,
        flexShrink: 0,
        alignSelf: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        bgcolor: "transparent",
      }}
    >
      <Box
        sx={{
          width: 1,
          height: 10,
          flexShrink: 0,
          boxSizing: "border-box",
          bgcolor: "#DADADA",
        }}
      />
    </Box>
  );
}

function FormulaGroup({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        flexWrap: "nowrap",
        gap: "2px",
        width: "100%",
        minWidth: 0,
        height: 18,
      }}
    >
      {children}
    </Stack>
  );
}

function FormulasRow({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 0,
        width: "100%",
        minWidth: 0,
        height: 18,
        boxSizing: "border-box",
        bgcolor: t.semantic.color.background.base.value,
      })}
    >
      {children}
    </Box>
  );
}

/** Body copy and formula chips for the CRA scoring tab AI card. */
export function AICardScoringDescription() {
  return (
    <Stack spacing={1} sx={{ width: "100%", color: "inherit" }}>
      <Typography
        component="p"
        sx={({ tokens: t }) => ({
          m: 0,
          color: "var(--lens-component-accordion-active-color)",
          fontFamily: t.semantic.font.text.md.fontFamily.value,
          fontSize: t.semantic.font.text.md.fontSize.value,
          lineHeight: t.semantic.font.text.md.lineHeight.value,
          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
          fontWeight: t.core.fontWeight.regular.value,
        })}
      >
        Assessments will be scored using all available data in your library and the following formulas:
      </Typography>
      <FormulasRow>
        <Box sx={{ flex: "0 0 264px", minWidth: 0 }}>
          <FormulaGroup>
            <FormulaTag variant="label">Cyber risk score</FormulaTag>
            <FormulaTag variant="operator">=</FormulaTag>
            <FormulaTag variant="value">Impact</FormulaTag>
            <FormulaTag variant="operator">×</FormulaTag>
            <FormulaTag variant="value">Likelihood</FormulaTag>
          </FormulaGroup>
        </Box>
        <FormulaGroupSeparator />
        <Box sx={{ flex: "0 0 165px", minWidth: 0 }}>
          <FormulaGroup>
            <FormulaTag variant="label">Impact</FormulaTag>
            <FormulaTag variant="operator">=</FormulaTag>
            <FormulaTag variant="value">Asset criticality</FormulaTag>
          </FormulaGroup>
        </Box>
        <FormulaGroupSeparator />
        <Box sx={{ flex: "0 0 340px", minWidth: 0 }}>
          <FormulaGroup>
            <FormulaTag variant="label">Likelihood</FormulaTag>
            <FormulaTag variant="operator">=</FormulaTag>
            <FormulaTag variant="value">Threat severity</FormulaTag>
            <FormulaTag variant="operator">×</FormulaTag>
            <FormulaTag variant="value">Vulnerability severity</FormulaTag>
          </FormulaGroup>
        </Box>
      </FormulasRow>
    </Stack>
  );
}

/**
 * AI-themed card shell: AI chat container background, 1px neutral border, 12px corners.
 */
export default function AICard({ children }: AICardProps) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        width: "100%",
        minWidth: 0,
        alignSelf: "stretch",
        boxSizing: "border-box",
        borderRadius: t.semantic.radius.lg.value,
        backgroundColor: "var(--lens-component-ai-chat-box-container-background-color)",
        border: "1px solid rgba(218, 218, 218, 1)",
        px: t.core.spacing["3"].value,
        py: t.core.spacing["3"].value,
      })}
    >
      <Stack
        sx={({ tokens: t }) => ({
          gap: t.core.spacing["1_5"].value,
          width: "100%",
        })}
      >
        {children}
      </Stack>
    </Box>
  );
}

/**
 * Default assessment UI for {@link AICard}: gradient title, description,
 * optional inline AI action, and assessment type radio group.
 * When `omitAssessmentType` and `onAction` are both set, uses the scoring header
 * (plain title and action on one row).
 */
export function AICardAssessmentPreset({
  title = "Choose how AI helps",
  description = "Pick an assessment type so we can tailor AI suggestions to your workflow.",
  assessmentTypeLabel = "Assessment type",
  omitAssessmentType = false,
  assessmentOptions = [...DEFAULT_OPTIONS],
  defaultAssessmentValue = "full",
  assessmentValue: controlledValue,
  onAssessmentChange,
  actionLabel = "Generate with AI",
  onAction,
  actionLoading = false,
}: AICardAssessmentPresetProps) {
  const {
    presets: { CircularProgressPresets },
  } = useTheme();
  const groupId = useId();
  const sectionTitleId = `${groupId}-heading`;
  const labelId = `${groupId}-label`;
  const [uncontrolled, setUncontrolled] = useState(defaultAssessmentValue);
  const isControlled = controlledValue !== undefined && onAssessmentChange !== undefined;
  const assessment = isControlled ? controlledValue : uncontrolled;
  const setAssessment = isControlled ? onAssessmentChange : setUncontrolled;

  const useFigmaScoringHeader = Boolean(omitAssessmentType && onAction);

  const descriptionBody = (
    <Box
      sx={({ tokens: t }) => ({
        m: 0,
        color: t.semantic.color.type.default.value,
        ...(onAction && !useFigmaScoringHeader ? { flex: 1, minWidth: 0 } : {}),
        width: useFigmaScoringHeader ? "100%" : undefined,
      })}
    >
      {typeof description === "string" ? (
        <Typography variant="body1" component="p" sx={{ m: 0 }}>
          {description}
        </Typography>
      ) : (
        description
      )}
    </Box>
  );

  const primaryActionButton = onAction ? (
    <Button
      type="button"
      variant={useFigmaScoringHeader ? "text" : "outlined"}
      color="ai"
      size={useFigmaScoringHeader ? "small" : "medium"}
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
        alignSelf: useFigmaScoringHeader ? "center" : "flex-start",
        ...(useFigmaScoringHeader
          ? {
              px: t.core.spacing["1_5"].value,
              py: t.core.spacing["0_5"].value,
              minHeight: 32,
              gap: t.core.spacing["1"].value,
            }
          : {}),
      })}
    >
      {actionLabel}
    </Button>
  ) : null;

  const plainTitleTypography = (
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
        color: t.semantic.color.type.default.value,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        minWidth: 0,
      })}
    >
      {title}
    </Typography>
  );

  const gradientTitleTypography = (
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
  );

  return (
    <Stack
      component="section"
      aria-labelledby={sectionTitleId}
      alignItems="flex-start"
      sx={({ tokens: t }) => ({
        width: "100%",
        gap: useFigmaScoringHeader ? t.core.spacing["1_5"].value : t.core.spacing["3"].value,
      })}
    >
      {useFigmaScoringHeader ? (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            sx={{ width: "100%" }}
          >
            {plainTitleTypography}
            {primaryActionButton}
          </Stack>
          {descriptionBody}
        </>
      ) : (
        <>
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
              {gradientTitleTypography}
            </Stack>

            {onAction ? (
              <Stack
                direction="row"
                alignItems="flex-start"
                gap={2}
                sx={{ width: "100%", boxSizing: "border-box" }}
              >
                {descriptionBody}
                {primaryActionButton}
              </Stack>
            ) : (
              descriptionBody
            )}
          </Stack>
        </>
      )}

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
