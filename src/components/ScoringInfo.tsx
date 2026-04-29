import { Box } from "@mui/material";

import AggregationMethodRadio, {
  type AggregationMethodRadioProps,
} from "./AggregationMethodRadio.js";
import ShowFormula, { type ShowFormulaProps } from "./ShowFormula.js";
import ShowScale, { type ShowScaleProps } from "./ShowScale.js";

export type ScoringInfoProps = {
  aggregationMethodRadio?: AggregationMethodRadioProps;
  showFormula?: ShowFormulaProps;
  showScale?: ShowScaleProps;
};

/**
 * Horizontal row: aggregation method, scoring formulas, and scoring scale (activity / assessment previews).
 */
export default function ScoringInfo({
  aggregationMethodRadio,
  showFormula,
  showScale,
}: ScoringInfoProps = {}) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        width: "100%",
        gap: t.core.spacing["7"].value,
        flexWrap: "nowrap",
        minWidth: 0,
        paddingLeft: t.core.spacing["3"].value,
        paddingRight: t.core.spacing["3"].value,
      })}
    >
      <Box
        sx={{
          flex: "1 1 0",
          minWidth: 0,
          alignSelf: "stretch",
        }}
      >
        <AggregationMethodRadio {...aggregationMethodRadio} />
      </Box>
      <Box
        sx={{
          flex: "0 0 auto",
          minWidth: 0,
          maxWidth: "100%",
        }}
      >
        <ShowFormula {...{ shrinkToContent: true, ...showFormula }} />
      </Box>
      <Box
        sx={{
          flex: "0 0 200px",
          width: 200,
          minWidth: 200,
          maxWidth: 200,
          boxSizing: "border-box",
        }}
      >
        <ShowScale {...showScale} />
      </Box>
    </Box>
  );
}
