import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Link,
  Stack,
  Typography,
  type SxProps,
  type Theme,
} from "@mui/material";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

import {
  ragDataVizColor,
  type RiskHeatmapLevel,
  RISK_HEATMAP_LEVEL_TO_RAG,
} from "../data/ragDataVisualization.js";

export interface RiskHeatmapLegendItem {
  label: string;
  level: RiskHeatmapLevel;
  count: number;
}

export interface ResidualRisksMatrixProps {
  title: string;
  grid: number[][];
  legend: RiskHeatmapLegendItem[];
  yAxisLabel?: string;
  xAxisLabel?: string;
  moreButtonAriaLabel?: string;
  sx?: SxProps<Theme>;
}

/** Position-based risk level for a 5x5 matrix: green (bottom-left) to red (top-right). */
export function getCellLevel(rowIdx: number, colIdx: number): RiskHeatmapLevel {
  const sum = (4 - rowIdx) + colIdx;
  if (sum <= 1) return "veryLow";
  if (sum <= 3) return "low";
  if (sum === 4) return "medium";
  if (sum <= 6) return "high";
  return "veryHigh";
}

export default function ResidualRisksMatrix({
  title,
  grid,
  legend,
  yAxisLabel = "Likelihood",
  xAxisLabel = "Impact",
  moreButtonAriaLabel,
  sx,
}: ResidualRisksMatrixProps) {
  const gridRows = grid.length;
  const gridCols = grid[0]?.length ?? 0;
  const r = 6;

  return (
    <Card sx={sx}>
      <CardHeader
        sx={{ display: "flex" }}
        title={
          <Typography variant="h4" component="h2" fontWeight={600}>
            {title}
          </Typography>
        }
        action={
          <Button
            variant="text"
            size="small"
            aria-label={moreButtonAriaLabel ?? `More options for ${title.toLowerCase()}`}
          >
            <MoreIcon aria-hidden />
          </Button>
        }
      />
      <CardContent sx={{ pt: 0 }}>
        <Stack gap={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `auto repeat(${gridCols}, 1fr)`,
              gridTemplateRows: `repeat(${gridRows}, 1fr) auto`,
              gap: "4px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                gridColumn: 1,
                gridRow: `1 / ${gridRows + 1}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pr: 1,
              }}
            >
              <Typography
                variant="textSm"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  whiteSpace: "nowrap",
                })}
              >
                {yAxisLabel}
              </Typography>
            </Box>

            {grid.map((row, rowIdx) =>
              row.map((count, colIdx) => {
                const level = getCellLevel(rowIdx, colIdx);
                const isVeryHigh = level === "veryHigh";
                const lastRow = gridRows - 1;
                const lastCol = row.length - 1;
                const tl = rowIdx === 0 && colIdx === 0 ? r : 0;
                const tr = rowIdx === 0 && colIdx === lastCol ? r : 0;
                const br = rowIdx === lastRow && colIdx === lastCol ? r : 0;
                const bl = rowIdx === lastRow && colIdx === 0 ? r : 0;
                const cellBorderRadius =
                  tl || tr || br || bl
                    ? `${tl}px ${tr}px ${br}px ${bl}px`
                    : 0;
                return (
                  <Box
                    key={`${rowIdx}-${colIdx}`}
                    sx={({ tokens: t }) => ({
                      gridColumn: colIdx + 2,
                      gridRow: rowIdx + 1,
                      backgroundColor: ragDataVizColor(t, RISK_HEATMAP_LEVEL_TO_RAG[level]),
                      borderRadius: cellBorderRadius,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 48,
                      minWidth: 48,
                    })}
                  >
                    <Typography
                      component="span"
                      sx={({ tokens: t }) => ({
                        fontFamily: t.semantic.font.text.sm.fontFamily.value,
                        fontSize: t.semantic.font.text.sm.fontSize.value,
                        lineHeight: t.semantic.font.text.sm.lineHeight.value,
                        letterSpacing: t.semantic.font.text.sm.letterSpacing.value,
                        fontWeight: 800,
                        color: isVeryHigh
                          ? t.semantic.color.type.inverse.value
                          : level === "low" || level === "medium" || level === "high"
                            ? t.core.color.gray["1000"].value
                            : "rgba(255, 255, 255, 1)",
                      })}
                    >
                      {count}
                    </Typography>
                  </Box>
                );
              })
            )}

            <Box
              sx={{
                gridColumn: `2 / ${gridCols + 2}`,
                gridRow: gridRows + 1,
                display: "flex",
                justifyContent: "flex-end",
                pt: 0.5,
              }}
            >
              <Typography
                variant="textSm"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.muted.value,
                })}
              >
                {xAxisLabel}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              columnGap: 2,
              rowGap: 2,
              height: "88px",
            }}
          >
            {legend.map((item) => (
              <Stack key={item.label} gap={0}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Box
                    sx={({ tokens: t }) => ({
                      width: 16,
                      height: 16,
                      borderRadius: 0.5,
                      backgroundColor: ragDataVizColor(t, RISK_HEATMAP_LEVEL_TO_RAG[item.level]),
                      flexShrink: 0,
                    })}
                  />
                  <Typography
                    variant="textSm"
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                    })}
                  >
                    {item.label}
                  </Typography>
                </Stack>
                <Typography variant="textMd" sx={{ pl: 3, fontWeight: 600 }}>
                  <Link href="#" underline="hover">
                    {item.count}
                  </Link>
                </Typography>
              </Stack>
            ))}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
