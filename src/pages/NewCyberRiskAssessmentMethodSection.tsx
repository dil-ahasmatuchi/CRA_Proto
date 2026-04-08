import { useCallback, useId, useRef, useState } from "react";
import { SectionHeader } from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  FormControl,
  FormControlLabel,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";

import AssessmentWysiwygEditor from "../components/AssessmentWysiwygEditor.js";

const QUALITATIVE_DESCRIPTION = (
  <>
    Assessments are scored using (
    <Box component="span" sx={{ fontWeight: 600 }}>
      Impact
    </Box>
    {" x "}
    <Box component="span" sx={{ fontWeight: 600 }}>
      Likelihood
    </Box>
    ). Impact is determined by Asset criticality and Likelihood is determined by (
    <Box component="span" sx={{ fontWeight: 600 }}>
      Vulnerability severity
    </Box>
    {" x "}
    <Box component="span" sx={{ fontWeight: 600 }}>
      Threat severity
    </Box>
    ).
  </>
);

const QUANTITATIVE_DESCRIPTION = (
  <>
    Assessments are scored using numerical data, typically calculated as (Financial consequence x Frequency of
    occurrence). Financial consequence is determined by the specific monetary value of the loss, and frequency
    is determined by the probability of the event occurring within a given timeframe. <br />
    The calculation often results in an Annualized loss expectancy (ALE)
  </>
);

/**
 * Assessment method, instructions, and attachments — embedded on the Details tab (formerly the Method tab).
 */
export default function NewCyberRiskAssessmentMethodSection() {
  const groupLabelId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [assessmentMethod, setAssessmentMethod] = useState<"qualitative" | "quantitative">("qualitative");
  const [instructions, setInstructions] = useState("");

  const handleMethodChange = useCallback((_event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    if (value === "quantitative") return;
    setAssessmentMethod(value as "qualitative");
  }, []);

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <Stack gap={3} sx={{ width: "100%" }}>
      <Stack gap={2}>
        <Typography
          id={groupLabelId}
          variant="caption"
          fontWeight={600}
          component="p"
          sx={({ tokens: t }) => ({
            color: t.semantic.color.type.default.value,
            letterSpacing: "0.3px",
            m: 0,
            fontSize: "24px",
            lineHeight: 1.3,
          })}
        >
          Select assessment method
        </Typography>

        <FormControl variant="standard" fullWidth>
          <RadioGroup
            aria-labelledby={groupLabelId}
            name="new-cra-assessment-method"
            value={assessmentMethod}
            onChange={handleMethodChange}
          >
            <Stack gap={3}>
              <Stack gap={1}>
                <FormControlLabel
                  value="qualitative"
                  control={<Radio />}
                  label="Qualitative"
                  slotProps={{
                    typography: {
                      sx: ({ tokens: t }) => ({
                        fontSize: t.semantic.font.text.md.fontSize.value,
                        lineHeight: t.semantic.font.text.md.lineHeight.value,
                        letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                        color: t.semantic.color.type.default.value,
                      }),
                    },
                  }}
                />
                <Box sx={{ pl: 4.5 }}>
                  <Typography
                    variant="body1"
                    component="p"
                    sx={({ tokens: t }) => ({
                      m: 0,
                      color: t.semantic.color.type.default.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      fontSize: t.semantic.font.text.md.fontSize.value,
                    })}
                  >
                    {QUALITATIVE_DESCRIPTION}
                  </Typography>
                </Box>
              </Stack>

              <Tooltip title="Currently not available." placement="top" arrow>
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    width: "100%",
                    cursor: "not-allowed",
                  }}
                >
                  <Stack gap={1}>
                    <FormControlLabel
                      value="quantitative"
                      disabled
                      control={<Radio disabled />}
                      label="Quantitative"
                      slotProps={{
                        typography: {
                          sx: ({ tokens: t }) => ({
                            fontSize: t.semantic.font.text.md.fontSize.value,
                            lineHeight: t.semantic.font.text.md.lineHeight.value,
                            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                          }),
                        },
                      }}
                    />
                    <Box sx={{ pl: 4.5 }}>
                      <Typography
                        variant="body1"
                        component="p"
                        sx={({ tokens: t }) => ({
                          m: 0,
                          color: t.semantic.color.type.default.value,
                          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                          lineHeight: t.semantic.font.text.md.lineHeight.value,
                          fontSize: t.semantic.font.text.md.fontSize.value,
                        })}
                      >
                        {QUANTITATIVE_DESCRIPTION}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Tooltip>
            </Stack>
          </RadioGroup>
        </FormControl>
      </Stack>

      <Stack gap={3} sx={{ pt: 2 }}>
        <SectionHeader title="Instructions" headingLevel="h2" />

        <Stack gap={3}>
          <AssessmentWysiwygEditor
            fieldId="new-cra-assessment-instructions"
            label="Assessment instructions"
            required
            placeholder="Insert description"
            value={instructions}
            onChange={setInstructions}
            minRows={10}
            aria-label="Assessment instructions"
          />

          <Stack gap={1}>
            <Typography
              variant="caption"
              fontWeight={600}
              component="p"
              sx={({ tokens: t }) => ({
                color: t.semantic.color.type.default.value,
                letterSpacing: "0.3px",
                m: 0,
                maxWidth: 600,
              })}
            >
              Attachments
            </Typography>

            <input ref={fileInputRef} type="file" hidden multiple accept=".jpg,.jpeg,.pdf,.xls,.xlsx" />

            <Box
              sx={({ tokens: t }) => ({
                borderStyle: "dashed",
                borderWidth: t.semantic.borderWidth.thin.value,
                borderColor: t.semantic.color.outline.default.value,
                borderRadius: t.semantic.radius.lg.value,
                px: 3,
                py: 3,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                "&:hover": {
                  borderColor: t.semantic.color.outline.hover.value,
                  backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                },
              })}
            >
              <Stack alignItems="center" gap={0.5} sx={{ width: "100%" }}>
                <UploadIcon aria-hidden size="lg" />
                <Typography
                  component="p"
                  variant="body1"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    textAlign: "center",
                    color: t.semantic.color.type.default.value,
                    letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                  })}
                >
                  Drag files here or{" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={openFilePicker}
                    sx={({ tokens: t }) => ({
                      verticalAlign: "baseline",
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      fontWeight: 600,
                      textDecoration: "underline",
                      color: t.semantic.color.action.link.default.value,
                      cursor: "pointer",
                      border: "none",
                      background: "none",
                      padding: 0,
                      fontFamily: "inherit",
                    })}
                  >
                    select files to upload
                  </Link>
                </Typography>
              </Stack>
              <Stack alignItems="center" gap={0.5} sx={{ width: "100%" }}>
                <Typography
                  variant="caption"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    textAlign: "center",
                    color: t.semantic.color.type.muted.value,
                    letterSpacing: "0.3px",
                    width: "100%",
                  })}
                >
                  Formats: JPG, PDF, XLS
                </Typography>
                <Typography
                  variant="caption"
                  sx={({ tokens: t }) => ({
                    m: 0,
                    textAlign: "center",
                    color: t.semantic.color.type.muted.value,
                    letterSpacing: "0.3px",
                    width: "100%",
                  })}
                >
                  Max. file size: 5 MB
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
