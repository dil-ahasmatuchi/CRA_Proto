import { useMemo } from "react";
import { Card, CardContent, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { useCyberRiskScoringConfig } from "../context/CyberRiskScoringConfigContext.js";
import CyberRisksByCyberRiskScoreDonut from "./CyberRisksByCyberRiskScoreDonut.js";
import RisksMatrix, { type AssessmentMatrixMode, type MatrixSelectionPayload } from "./RisksMatrix.js";
import type { MockCyberRisk } from "../data/types.js";
import type { CraScoringTypeChoice } from "../pages/craNewAssessmentDraftStorage.js";
import { buildCyberRiskDonutSegments } from "../utils/assetsByCyberRiskScoreDonutData.js";

function assessmentMatrixModeFromScoringType(scoringType: CraScoringTypeChoice): AssessmentMatrixMode {
  if (scoringType === "inherent") return "inherentOnly";
  return "residualPreferred";
}

export type ResultsHeroProps = {
  scopedRisks: readonly MockCyberRisk[];
  /** Details-tab scoring type: drives Inherent-only vs Residual-default matrix. */
  scoringType: CraScoringTypeChoice;
  /**
   * When set, matrix count clicks filter in-page (e.g. assessment Results table) instead of navigating
   * to the global cyber risks route.
   */
  onMatrixSelection?: (payload: MatrixSelectionPayload) => void;
};

/** Assessment results overview: scoped likelihood/impact matrix and cyber risks-by-score donut. */
export default function ResultsHero({
  scopedRisks,
  scoringType,
  onMatrixSelection,
}: ResultsHeroProps) {
  const { tokens: themeTokens } = useTheme();
  const { cyberScoreBands, likelihoodBands } = useCyberRiskScoringConfig();
  const donutSegments = useMemo(
    () => buildCyberRiskDonutSegments(scopedRisks),
    [scopedRisks, cyberScoreBands, likelihoodBands],
  );

  return (
    <Card
      sx={({ tokens }) => ({
        backgroundColor: tokens.semantic.color.surface.variant.value,
        border: "none",
      })}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={3}
          alignItems="stretch"
          sx={{ width: "100%" }}
        >
          <RisksMatrix
            risks={scopedRisks}
            assessmentMatrixMode={assessmentMatrixModeFromScoringType(scoringType)}
            onMatrixSelection={onMatrixSelection}
            sx={({ tokens: t }) => ({
              flex: { lg: "1.5 1 0" },
              minWidth: 0,
              width: "100%",
              border: "none",
              bgcolor: t.semantic.color.background.base.value,
              borderRadius: "16px",
              boxShadow: "none",
            })}
          />
          <CyberRisksByCyberRiskScoreDonut
            segments={donutSegments}
            sx={{
              flex: { lg: "1 1 480px" },
              minWidth: { lg: 320 },
              width: "100%",
              maxWidth: { lg: 480 },
              border: "none",
              bgcolor: themeTokens.semantic.color.background.base.value,
              borderRadius: "16px",
              boxShadow: "none",
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
