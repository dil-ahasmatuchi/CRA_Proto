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

import RadioButtonArray from "./RadioButtonArray.js";

const AI_TEXT_GRADIENT =
  "linear-gradient(128.4deg, #BE0C1E 17.49%, #AB48DA 58.74%, #4069FE 100%)";

export type AICardProps = {
  /** Main body: any layout or components */
  children: ReactNode;
};

export type AICardAssessmentPresetProps = {
  /** Main heading (AI gradient in all {@link AICardAssessmentPreset} title rows). */
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
        gap: t.core.spacing["2"].value,
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

/** Default route for cyber risk settings (`CyberRiskSettingsPage` in App). */
const DEFAULT_SCORING_LOGIC_PATH = "/settings/cyber-risk-settings";

export type AICardScoringDescriptionProps = {
  /** Destination for “View scoring logic and aggregation details”. Placeholder `#` is inert (click prevented). */
  scoringLogicHref?: string;
  /**
   * `before` — future tense (default). `after` — includes review guidance and past tense
   * for completed AI scoring.
   */
  variant?: "before" | "after";
};

export type AICardAggregationMethodRowProps = {
  /** Destination for “View scoring logic and aggregation details”. Defaults to cyber risk settings. Placeholder `#` is inert (click prevented). */
  scoringLogicHref?: string;
  /** Controlled value (use with `onValueChange`). When omitted, selection is stored locally. */
  value?: "highest" | "average";
  /** Fired when the user changes the aggregation method (controlled mode). */
  onValueChange?: (value: "highest" | "average") => void;
  /** Passed to the underlying `RadioGroup` `name` (e.g. to pair with a second group sharing the same React state). */
  name?: string;
  /** When true, radios are not interactive. */
  disabled?: boolean;
};

/** Aggregation radios + scoring logic link (sibling to formulas block under the AI scoring section). */
export function AICardAggregationMethodRow({
  scoringLogicHref = DEFAULT_SCORING_LOGIC_PATH,
  value: controlledValue,
  onValueChange,
  name: radioName,
  disabled = false,
}: AICardAggregationMethodRowProps = {}) {
  const [internal, setInternal] = useState<"highest" | "average">("highest");
  const isControlled = controlledValue !== undefined && onValueChange !== undefined;
  const aggregationMethod = isControlled ? controlledValue : internal;

  const handleChange = (v: string) => {
    if (v !== "highest" && v !== "average") return;
    if (isControlled) {
      onValueChange(v);
    } else {
      setInternal(v);
    }
  };

  return (
    <RadioButtonArray
      label="Aggregation method"
      options={[
        { value: "highest", label: "Highest" },
        { value: "average", label: "Weighted average" },
      ]}
      name={radioName}
      value={aggregationMethod}
      onChange={handleChange}
      disabled={disabled}
      showAction
      showIcon
      showActionText
      actionHref={scoringLogicHref}
      actionText="View scoring logic and aggregation details"
    />
  );
}

/** Intro copy and formula chips for the CRA scoring tab AI card. */
export function AICardScoringDescription({ variant = "before" }: AICardScoringDescriptionProps = {}) {
  const intro =
    variant === "after"
      ? "You can review and edit each individual scenario scoring and rationale. Assessments were scored using all available data in your library and the following formulas:"
      : "Assessments will be scored using all available data in your library and the following formulas:";

  return (
    <Stack sx={{ width: "100%", color: "inherit", gap: "8px" }}>
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
        {intro}
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
        display: "flex",
        flexDirection: "column",
        gap: t.core.spacing["1_5"].value,
      })}
    >
      {children}
    </Box>
  );
}

/**
 * Default assessment UI for {@link AICard}: gradient title, description,
 * optional inline AI action, and assessment type radio group.
 * When `omitAssessmentType` and `onAction` are both set, uses the scoring header
 * (AI gradient title and action on one row).
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
        display: "flex",
        flexDirection: "column",
        gap: t.core.spacing["3"].value,
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
      sx={{
        flexShrink: 0,
        alignSelf: useFigmaScoringHeader ? "center" : "flex-start",
      }}
    >
      {actionLabel}
    </Button>
  ) : null;

  /**
   * Gradient text: clip must live on an `inline-block` span. Atlas / global
   * `h2` rules and Emotion `sx` merge can override `color` on a single node, so
   * we set the clip + fill on a child via the React `style` prop (highest
   * specificity for these properties) and keep typography in `sx`.
   */
  const gradientTitleTypography = (
    <Box
      component="h2"
      id={sectionTitleId}
      sx={({ tokens: t }) => ({
        m: 0,
        p: 0,
        minWidth: 0,
        maxWidth: "100%",
        border: "none",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        ...(useFigmaScoringHeader
          ? {
              flex: "1 1 auto",
            }
          : {}),
      })}
    >
      <Box
        component="span"
        // Inline style beats Atlas `h2` and MUI `sx` merge for background-clip text.
        style={{
          display: "inline-block",
          maxWidth: "100%",
          backgroundImage: AI_TEXT_GRADIENT,
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundColor: "transparent",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
        sx={({ tokens: t }) => ({
          fontFamily: t.semantic.font.title.h4Md.fontFamily.value,
          fontSize: t.semantic.font.title.h4Md.fontSize.value,
          lineHeight: t.semantic.font.title.h4Md.lineHeight.value,
          letterSpacing: t.semantic.font.title.h4Md.letterSpacing.value,
          fontWeight: t.semantic.fontWeight.emphasis.value,
        })}
      >
        {title}
      </Box>
    </Box>
  );

  return (
    <Stack
      component="section"
      aria-labelledby={sectionTitleId}
      alignItems="flex-start"
      sx={({ tokens: t }) => ({
        width: "100%",
        gap: t.core.spacing["3"].value,
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
            {gradientTitleTypography}
            {primaryActionButton}
          </Stack>
          {typeof description === "string" ? (
            <Box
              sx={({ tokens: t }) => ({
                m: 0,
                color: t.semantic.color.type.default.value,
                width: "100%",
              })}
            >
              <Typography variant="body1" component="p" sx={{ m: 0 }}>
                {description}
              </Typography>
            </Box>
          ) : (
            description
          )}
        </>
      ) : (
        <>
          <Stack gap={2} alignItems="flex-start" sx={{ width: "100%" }}>
            {gradientTitleTypography}

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
