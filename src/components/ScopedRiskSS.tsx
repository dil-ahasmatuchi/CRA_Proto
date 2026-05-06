import { Footer } from "@diligentcorp/atlas-react-bundle";
import { Box, Drawer, Stack, Typography, useTheme, Button, CircularProgress } from "@mui/material";

import { fivePointLabelToRag } from "../data/types.js";
import type { CyberRiskStatus, FivePointScaleLabel } from "../data/types.js";
import type { LabelScoreLegendValue } from "./LabelScoreLegend.js";
import LabelScoreLegend from "./LabelScoreLegend.js";
import LabelValueMd from "./LabelValueMd.js";
import RiskStatus from "./RiskStatus.js";

/**
 * Minimal shape the drawer needs — a subset of MockCyberRisk, also compatible
 * with DB cyber risk responses mapped from the /api/assets/:id/cyber-risks endpoint.
 */
export type DrawerCyberRisk = {
  id: string;
  name: string;
  status: CyberRiskStatus;
  cyberRiskScore: number;
  cyberRiskScoreLabel: FivePointScaleLabel;
};

export type ScopedRiskSSProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  loading?: boolean;
  /** Cyber risks to list (e.g. all risks linked to an asset). */
  cyberRisks?: DrawerCyberRisk[];
};

function cyberRiskToLegendValue(cr: DrawerCyberRisk): LabelScoreLegendValue {
  return {
    numeric: String(cr.cyberRiskScore),
    label: cr.cyberRiskScoreLabel,
    rag: fivePointLabelToRag(cr.cyberRiskScoreLabel),
  };
}

export default function ScopedRiskSS({
  open,
  onClose,
  title = "Cyber risks",
  loading = false,
  cyberRisks = [],
}: ScopedRiskSSProps) {
  const { presets } = useTheme();
  const { SideSheetPresets } = presets;
  const { size, components } = SideSheetPresets;
  const { Header, Content } = components;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ ...size.large.sx }}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-labelledby": "scoped-risk-ss-title",
        },
      }}
    >
      <Header
        variant="default"
        onClose={onClose}
        title={title}
        componentProps={{
          closeButton: { "aria-label": "Close side sheet" },
          title: { component: "h2", id: "scoped-risk-ss-title" },
        }}
      />

      <Content ariaLabel="Cyber risks content">
        <Stack
          sx={({ tokens: t }) => ({
            width: "100%",
            alignItems: "stretch",
            gap: t.core.spacing["1_5"].value,
          })}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={32} aria-label="Loading cyber risks" />
            </Box>
          ) : cyberRisks.length === 0 ? (
            <Typography
              sx={({ tokens: t }) => ({
                fontSize: t.semantic.font.text.md.fontSize.value,
                lineHeight: t.semantic.font.text.md.lineHeight.value,
                color: t.semantic.color.type.default.value,
              })}
            >
              No cyber risks linked to this asset.
            </Typography>
          ) : (
            cyberRisks.map((cr) => (
              <Box key={cr.id} sx={{ display: "flex" }}>
                <Stack
                  sx={({ tokens: t }) => ({
                    alignItems: "flex-start",
                    gap: t.core.spacing["2"].value,
                    width: "100%",
                  })}
                >
                  <Typography
                    component="span"
                    sx={({ tokens: t }) => ({
                      m: 0,
                      fontFamily: "inherit",
                      fontSize: t.semantic.font.text.md.fontSize.value,
                      lineHeight: t.semantic.font.text.md.lineHeight.value,
                      letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      fontWeight: 600,
                      color: t.semantic.color.type.default.value,
                    })}
                  >
                    {cr.name}
                  </Typography>
                  <Stack
                    direction="row"
                    flexWrap="nowrap"
                    alignItems="flex-start"
                    sx={({ tokens: t }) => ({
                      gap: t.core.spacing["3"].value,
                      width: "100%",
                      minWidth: 0,
                    })}
                  >
                    <Box sx={{ flexShrink: 0 }}>
                      <LabelValueMd label="ID" value={cr.id} />
                    </Box>
                    <Stack
                      alignItems="flex-start"
                      sx={({ tokens: t }) => ({
                        gap: t.core.spacing["0_5"].value,
                        flex: "1 1 0",
                        minWidth: 0,
                      })}
                    >
                      <Box
                        sx={({ tokens: t }) => ({
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          minHeight: t.semantic.font.text.md.lineHeight.value,
                        })}
                      >
                        <Typography
                          component="span"
                          sx={({ tokens: t }) => ({
                            m: 0,
                            fontFamily: "inherit",
                            fontSize: t.semantic.font.text.md.fontSize.value,
                            lineHeight: t.semantic.font.text.md.lineHeight.value,
                            letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                            fontWeight: 400,
                            color: t.semantic.color.type.muted.value,
                          })}
                        >
                          Status
                        </Typography>
                      </Box>
                      <RiskStatus status={cr.status} />
                    </Stack>
                    <LabelScoreLegend
                      label="Cyber risk score"
                      value={cyberRiskToLegendValue(cr)}
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Content>

      <Footer
        horizontalPadding="medium"
        secondaryAction={<span />}
        tertiaryAction={
          <Button variant="text" onClick={onClose}>
            Close
          </Button>
        }
      />
    </Drawer>
  );
}
