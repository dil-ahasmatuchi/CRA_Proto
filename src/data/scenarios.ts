import {
  padId,
  getFivePointLabel,
  getLikelihoodLabel,
  getCyberRiskScoreLabel,
} from "./types.js";
import type { MockScenario, FivePointScaleValue, FivePointScaleLabel } from "./types.js";
import { cyberRisks } from "./cyberRisks.js";
import { assets } from "./assets.js";
import { threats as allThreats } from "./threats.js";
import { vulnerabilities as allVulnerabilities } from "./vulnerabilities.js";

type ScenarioRow = [
  crIdx: number,
  astIdx: number,
  threatSev: FivePointScaleValue,
  vulnSev: FivePointScaleValue,
  ownerIdx: number,
  thrIdxs: number[],
  vulnIdxs: number[],
];

const raw: ScenarioRow[] = [
  [1, 1, 4, 5, 7, [1], [1]],
  [1, 2, 4, 5, 7, [1], [10]],
  [2, 3, 3, 4, 9, [2], [35]],
  [2, 43, 4, 4, 9, [10], [35]],
  [3, 1, 5, 4, 15, [4], [6]],
  [3, 11, 4, 3, 15, [4], [11]],
  [4, 2, 4, 4, 20, [5], [7]],
  [4, 17, 3, 4, 20, [5], [36]],
  [5, 3, 4, 5, 7, [22], [35]],
  [5, 16, 4, 4, 7, [22], [35]],
  [7, 24, 3, 4, 9, [9], [43]],
  [7, 29, 3, 3, 9, [9], [19]],
  [8, 13, 4, 4, 14, [3], [3]],
  [8, 2, 5, 5, 14, [3], [47]],
  [9, 3, 3, 3, 39, [12], [12]],
  [9, 39, 2, 3, 39, [12], [37]],
  [10, 43, 3, 3, 36, [10], [35]],
  [10, 21, 2, 3, 36, [38], [44]],
  [11, 8, 3, 4, 29, [23], [32]],
  [11, 29, 3, 3, 29, [23], [48]],
  [12, 2, 5, 5, 14, [13], [8]],
  [12, 28, 5, 4, 14, [13], [9]],
  [13, 9, 5, 4, 14, [8], [19]],
  [13, 28, 4, 4, 14, [8], [37]],
  [14, 6, 3, 3, 6, [6], [5]],
  [14, 13, 3, 4, 6, [6], [17]],
  [15, 29, 2, 3, 15, [20], [46]],
  [16, 7, 4, 4, 7, [7], [2]],
  [16, 14, 4, 4, 7, [11], [30]],
  [17, 2, 4, 3, 5, [5], [7]],
  [19, 9, 5, 4, 14, [8], [19]],
  [19, 36, 4, 4, 14, [25], [37]],
  [20, 13, 3, 4, 13, [24], [13]],
  [20, 18, 3, 3, 13, [47], [23]],
  [22, 39, 3, 3, 39, [12], [37]],
  [23, 24, 4, 3, 9, [36], [43]],
  [23, 4, 3, 4, 9, [36], [19]],
  [24, 21, 2, 3, 27, [15], [21]],
  [25, 8, 3, 4, 29, [23], [32]],
  [25, 29, 4, 4, 29, [23], [48]],
  [26, 2, 5, 5, 7, [1], [1]],
  [26, 40, 4, 5, 7, [49], [40]],
  [27, 50, 3, 3, 10, [30], [14]],
  [28, 7, 4, 4, 7, [16], [8]],
  [29, 28, 5, 4, 14, [13], [8]],
  [30, 2, 5, 4, 33, [2], [35]],
  [32, 1, 3, 4, 9, [17], [20]],
  [33, 2, 5, 5, 7, [1], [3]],
  [33, 26, 4, 3, 7, [2], [35]],
  [34, 10, 3, 3, 20, [30], [14]],
];

const vulnsByAssetId = new Map<string, typeof allVulnerabilities>();
for (const v of allVulnerabilities) {
  for (const aid of v.assetIds) {
    const list = vulnsByAssetId.get(aid);
    if (list) list.push(v);
    else vulnsByAssetId.set(aid, [v]);
  }
}

const threatById = new Map(allThreats.map((t) => [t.id, t]));
const vulnById = new Map(allVulnerabilities.map((v) => [v.id, v]));

const IMPACT_CONSEQUENCE: Record<FivePointScaleLabel, string> = {
  "Very high": "severe and far-reaching",
  High: "significant",
  Medium: "moderate but notable",
  Low: "limited",
  "Very low": "minimal",
};

function buildScoringRationale(
  riskName: string,
  assetName: string,
  assetType: string,
  impactLabel: FivePointScaleLabel,
  threatSevLabel: FivePointScaleLabel,
  vulnSevLabel: FivePointScaleLabel,
  likelihoodLabel: FivePointScaleLabel,
  cyberRiskScoreLabel: FivePointScaleLabel,
  scenarioThreatIds: string[],
  scenarioVulnIds: string[],
  assetId: string,
): string {
  const threatNames = scenarioThreatIds
    .map((id) => threatById.get(id)?.name)
    .filter(Boolean)
    .join(", ");

  const vulnNames = scenarioVulnIds
    .map((id) => vulnById.get(id)?.name)
    .filter(Boolean)
    .join(", ");

  const assetVulns = vulnsByAssetId.get(assetId) ?? [];
  const vulnBullets = assetVulns
    .map((v) => `• ${v.name} (${v.domain}, ${v.primaryCIAImpact})`)
    .join("\n");

  const sections: string[] = [
    `Threat — ${riskName} (severity: ${threatSevLabel}): The ${riskName.toLowerCase()} threat targeting ${assetType.toLowerCase()} assets represents a ${threatSevLabel.toLowerCase()} severity concern. The primary threat vectors are: ${threatNames || "N/A"}.`,

    `Vulnerability assessment (severity: ${vulnSevLabel}): The vulnerability exposure is rated ${vulnSevLabel.toLowerCase()}. The vulnerabilities directly associated with this scenario are: ${vulnNames || "N/A"}.`,

    `Asset — ${assetName} (criticality: ${impactLabel}): ${assetName} is classified as a ${impactLabel.toLowerCase()} criticality ${assetType.toLowerCase()} asset. Compromise or disruption would have ${IMPACT_CONSEQUENCE[impactLabel]} consequences for the organization.`,

    `Likelihood: ${likelihoodLabel} — A ${threatSevLabel.toLowerCase()} threat severity combined with ${vulnSevLabel.toLowerCase()} vulnerability severity results in a ${likelihoodLabel.toLowerCase()} likelihood of exploitation.`,

    `Cyber risk score: ${cyberRiskScoreLabel} — With ${impactLabel.toLowerCase()} asset criticality and ${likelihoodLabel.toLowerCase()} likelihood, the overall cyber risk score is ${cyberRiskScoreLabel.toLowerCase()}.`,
  ];

  if (assetVulns.length > 0) {
    sections.push(
      `Related vulnerabilities on ${assetName}:\n${vulnBullets}`,
    );
  }

  return sections.join("\n\n");
}

export const scenarios: MockScenario[] = raw.map(
  ([crIdx, astIdx, threatSeverity, vulnerabilitySeverity, ownerIdx, thrIdxs, vulnIdxs], i) => {
    const risk = cyberRisks[crIdx - 1];
    const asset = assets[astIdx - 1];
    const impact = asset.criticality;
    const likelihood = threatSeverity * vulnerabilitySeverity;
    const cyberRiskScore = impact * likelihood;
    const impactLabel = getFivePointLabel(impact);
    const threatSeverityLabel = getFivePointLabel(threatSeverity);
    const vulnerabilitySeverityLabel = getFivePointLabel(vulnerabilitySeverity);
    const likelihoodLabel = getLikelihoodLabel(likelihood);
    const cyberRiskScoreLabel = getCyberRiskScoreLabel(cyberRiskScore);
    const scenarioThreatIds = thrIdxs.map((n) => padId("THR", n));
    const scenarioVulnIds = vulnIdxs.map((n) => padId("VUL", n));
    const assetId = padId("AST", astIdx);

    return {
      id: padId("SC", i + 1),
      name: `${risk.name} on ${asset.name}`,
      ownerId: padId("USR", ownerIdx),
      cyberRiskId: padId("CR", crIdx),
      assetId,
      impact,
      impactLabel,
      threatSeverity,
      threatSeverityLabel,
      vulnerabilitySeverity,
      vulnerabilitySeverityLabel,
      likelihood,
      likelihoodLabel,
      cyberRiskScore,
      cyberRiskScoreLabel,
      threatIds: scenarioThreatIds,
      vulnerabilityIds: scenarioVulnIds,
      scoringRationale: buildScoringRationale(
        risk.name,
        asset.name,
        asset.assetType,
        impactLabel,
        threatSeverityLabel,
        vulnerabilitySeverityLabel,
        likelihoodLabel,
        cyberRiskScoreLabel,
        scenarioThreatIds,
        scenarioVulnIds,
        assetId,
      ),
    };
  },
);

const scenarioById = new Map(scenarios.map((s) => [s.id, s]));

export function getScenarioById(id: string): MockScenario | undefined {
  return scenarioById.get(id);
}
