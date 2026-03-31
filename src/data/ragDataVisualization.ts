/**
 * Data visualization RAG tokens: `semantic.color.dataVisualization.rag`.
 *
 * 5-point scale (prototype):
 * - Very low → Positive/05
 * - Low → Positive/04
 * - Medium → Neutral/03
 * - High → Negative/03
 * - Very high → Negative/05
 */

export type RagDataVizKey = "pos05" | "pos04" | "neu03" | "neg03" | "neg04" | "neg05";

export type RagPaletteTokens = {
  semantic: {
    color: {
      dataVisualization: {
        rag: {
          negative: Record<"03" | "04" | "05", { value: string }>;
          neutral: Record<"03", { value: string }>;
          positive: Record<"04" | "05", { value: string }>;
        };
      };
    };
  };
};

export function ragDataVizColor(tokens: RagPaletteTokens, key: RagDataVizKey): string {
  const r = tokens.semantic.color.dataVisualization.rag;
  switch (key) {
    case "pos05":
      return r.positive["05"].value;
    case "pos04":
      return r.positive["04"].value;
    case "neu03":
      return r.neutral["03"].value;
    case "neg03":
      return r.negative["03"].value;
    case "neg04":
      return r.negative["04"].value;
    case "neg05":
      return r.negative["05"].value;
    default:
      return r.neutral["03"].value;
  }
}

/** Heatmap / matrix band index 0 = very low … 4 = very high */
export const RAG_FIVE_POINT_BAND_KEYS: readonly RagDataVizKey[] = [
  "pos05",
  "pos04",
  "neu03",
  "neg03",
  "neg05",
] as const;

export type RiskHeatmapLevel = "veryLow" | "low" | "medium" | "high" | "veryHigh";

export const RISK_HEATMAP_LEVEL_TO_RAG: Record<RiskHeatmapLevel, RagDataVizKey> = {
  veryLow: "pos05",
  low: "pos04",
  medium: "neu03",
  high: "neg03",
  veryHigh: "neg05",
};

/** Chart.js canvas cannot rely on unresolved CSS variables — Lens literal fallbacks. */
export const RAG_DATA_VIZ_CANVAS_FALLBACK: Record<RagDataVizKey, string> = {
  pos05: "#15a015",
  pos04: "#26c926",
  neu03: "#ffbf00",
  neg03: "#f63734",
  neg04: "#c92624",
  neg05: "#a01516",
};

export function resolveColorForCanvas(cssColor: string, fallbackHex: string): string {
  const trimmed = (cssColor ?? "").trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed;
  }
  if (/^rgba?\(/i.test(trimmed)) {
    return trimmed;
  }
  if (typeof document === "undefined") {
    return fallbackHex;
  }
  const el = document.createElement("div");
  el.style.cssText =
    "position:absolute;clip:rect(0,0,0,0);pointer-events:none;left:0;top:0;width:1px;height:1px;background-color:" +
    trimmed;
  document.body.appendChild(el);
  const resolved = getComputedStyle(el).backgroundColor;
  document.body.removeChild(el);
  if (!resolved || resolved === "rgba(0, 0, 0, 0)" || resolved === "transparent") {
    return fallbackHex;
  }
  return resolved;
}
