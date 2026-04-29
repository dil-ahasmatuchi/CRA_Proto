import { useState } from "react";

import RadioButtonArray from "./RadioButtonArray.js";

import type { CraScenarioScoreAggregationMethod } from "../data/craAssessmentDraftTypes.js";

const AGGREGATION_SCORING_LOGIC_DESCRIPTION: Record<
  CraScenarioScoreAggregationMethod,
  string
> = {
  highest:
    "The scenario with the highest cyber risk score determines the overall risk level. Use when a single worst-case scenario should drive the outcome.",
  average:
    "Combines all scenario scores into a single risk level, giving more influence to scenarios affecting higher-criticality assets. Use when the overall risk should reflect the full picture across all scenarios.",
};

export type AggregationMethodRadioProps = {
  /**
   * Controlled value (use with `onValueChange`). When omitted, selection is stored locally.
   * `average` is Impact-weighted aggregation in the Scoring tab (not a simple mean).
   */
  value?: CraScenarioScoreAggregationMethod;
  /** Fired when the user changes the aggregation method (controlled mode). */
  onValueChange?: (value: CraScenarioScoreAggregationMethod) => void;
  /** Passed to the underlying `RadioGroup` `name` (e.g. to pair with a second group sharing the same React state). */
  name?: string;
  /** When true, radios are not interactive. */
  disabled?: boolean;
};

/** Aggregation radios + aggregation method description (sibling to formulas block under the AI scoring section). */
export default function AggregationMethodRadio({
  value: controlledValue,
  onValueChange,
  name: radioName,
  disabled = false,
}: AggregationMethodRadioProps = {}) {
  const [internal, setInternal] = useState<CraScenarioScoreAggregationMethod>("highest");
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
      showIcon={false}
      showActionText
      actionTextPlain
      actionText={AGGREGATION_SCORING_LOGIC_DESCRIPTION[aggregationMethod]}
    />
  );
}
