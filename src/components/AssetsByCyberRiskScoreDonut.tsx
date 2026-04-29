import { useLayoutEffect, useMemo, useState } from "react";
import { Box, Button, Card, CardContent, CardHeader, Link, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Doughnut } from "react-chartjs-2";
import { ArcElement, Chart as ChartJS, Legend as ChartLegend, Tooltip } from "chart.js";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import {
  RAG_DATA_VIZ_CANVAS_FALLBACK,
  ragDataVizColor,
  resolveColorForCanvas,
} from "../data/ragDataVisualization.js";
import {
  buildAssetCyberRiskDonutSegments,
  type AssetCyberRiskDonutSegment,
} from "../utils/assetsByCyberRiskScoreDonutData.js";

ChartJS.register(ArcElement, Tooltip, ChartLegend);

const DONUT_SEGMENT_BORDER = "#ffffff";

function segmentsWithArcData(segments: readonly AssetCyberRiskDonutSegment[]) {
  return segments.filter((s) => s.count != null && s.count > 0);
}

export type AssetsByCyberRiskScoreDonutProps = {
  /**
   * When set, `orgUnitId` is ignored and this segment set is used (e.g. assessment results preview).
   */
  segmentsOverride?: readonly AssetCyberRiskDonutSegment[] | null;
  orgUnitId?: string | null;
  /** Spread onto the root `Card` (e.g. `flex: 1`). */
  sx?: object;
};

export default function AssetsByCyberRiskScoreDonut({
  segmentsOverride = null,
  orgUnitId = null,
  sx: sxProp,
}: AssetsByCyberRiskScoreDonutProps) {
  const { tokens } = useTheme();
  const segments = useMemo(
    () => segmentsOverride ?? buildAssetCyberRiskDonutSegments(orgUnitId),
    [orgUnitId, segmentsOverride],
  );
  const active = useMemo(() => segmentsWithArcData(segments), [segments]);

  const totalAssets = useMemo(
    () => segments.reduce((sum, s) => sum + (s.count ?? 0), 0),
    [segments],
  );

  const [arcCanvasColors, setArcCanvasColors] = useState(() =>
    active.map((s) => RAG_DATA_VIZ_CANVAS_FALLBACK[s.colorKey]),
  );

  useLayoutEffect(() => {
    setArcCanvasColors(
      active.map((s) =>
        resolveColorForCanvas(
          ragDataVizColor(tokens, s.colorKey),
          RAG_DATA_VIZ_CANVAS_FALLBACK[s.colorKey],
        ),
      ),
    );
  }, [tokens, active]);

  const chartData = useMemo(
    () => ({
      labels: active.map((s) => s.label),
      datasets: [
        {
          data: active.map((s) => s.count as number),
          backgroundColor: arcCanvasColors,
          borderColor: DONUT_SEGMENT_BORDER,
          borderWidth: 2,
          hoverBorderColor: DONUT_SEGMENT_BORDER,
        },
      ],
    }),
    [active, arcCanvasColors],
  );

  return (
    <Card
      sx={{
        width: 360,
        maxWidth: 360,
        minWidth: 0,
        border: "none",
        ...sxProp,
      }}
    >
      <CardHeader
        title={
          <Typography variant="h4" component="h2" fontWeight={600}>
            Assets by cyber risk score
          </Typography>
        }
        action={
          <Button
            variant="text"
            size="small"
            aria-label="More options for assets by cyber risk score"
          >
            <MoreIcon aria-hidden />
          </Button>
        }
        sx={{ display: "flex" }}
      />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          pt: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 256,
            height: 256,
          }}
        >
          {active.length > 0 ? (
            <Doughnut
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: "72%",
                plugins: {
                  legend: { display: false },
                  tooltip: { enabled: true },
                },
                elements: {
                  arc: {
                    borderWidth: 2,
                    borderColor: DONUT_SEGMENT_BORDER,
                  },
                },
              }}
            />
          ) : null}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <Typography
              sx={({ tokens: th }) => ({
                fontSize: 26,
                lineHeight: "34px",
                display: "block",
                color: th.semantic.color.type.default.value,
              })}
            >
              {totalAssets}
            </Typography>
            <Typography
              variant="body1"
              sx={({ tokens: th }) => ({
                color: th.semantic.color.type.muted.value,
                lineHeight: "24px",
                letterSpacing: "0.2px",
              })}
            >
              Assets
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            columnGap: 2,
            rowGap: 2,
            width: "100%",
          }}
        >
          {segments.map((item) => (
            <Stack key={item.range} gap={0} alignItems="flex-start">
              <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
                <Box
                  sx={({ tokens: tks }) => ({
                    width: 16,
                    height: 16,
                    borderRadius: tks.semantic.radius.sm.value,
                    flexShrink: 0,
                    bgcolor: ragDataVizColor(tks, item.colorKey),
                  })}
                />
                <Typography
                  variant="textSm"
                  sx={({ tokens: tks }) => ({
                    color: tks.semantic.color.type.default.value,
                    letterSpacing: "0.3px",
                    lineHeight: "16px",
                  })}
                >
                  {item.range} {item.label}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" sx={{ pl: 3 }}>
                {item.count != null ? (
                  <Link
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    underline="always"
                    sx={({ tokens: tks }) => ({
                      fontWeight: 600,
                      fontSize: tks.semantic.font.text.md.fontSize.value,
                      lineHeight: tks.semantic.font.text.md.lineHeight.value,
                      letterSpacing: tks.semantic.font.text.md.letterSpacing.value,
                      color: tks.semantic.color.type.default.value,
                    })}
                  >
                    {item.count}
                  </Link>
                ) : (
                  <Typography
                    component="span"
                    sx={({ tokens: tks }) => ({
                      fontSize: tks.semantic.font.text.md.fontSize.value,
                      lineHeight: tks.semantic.font.text.md.lineHeight.value,
                      letterSpacing: tks.semantic.font.text.md.letterSpacing.value,
                      color: tks.semantic.color.type.default.value,
                    })}
                  >
                    -
                  </Typography>
                )}
              </Stack>
            </Stack>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
