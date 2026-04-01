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

/**
 * One scenario per (cyber risk × threat × asset row) for threats in that risk.
 * Name: "{threat} on {asset}"; vulnerabilityIds = that threat’s vulns on the asset.
 */

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
const assetById = new Map(assets.map((a) => [a.id, a]));
const riskById = new Map(cyberRisks.map((r) => [r.id, r]));

const IMPACT_CONSEQUENCE: Record<FivePointScaleLabel, string> = {
  "Very high": "severe and far-reaching",
  High: "significant",
  Medium: "moderate but notable",
  Low: "limited",
  "Very low": "minimal",
};

function formatThreatPhrase(names: string[]): string {
  const n = names.filter(Boolean);
  if (n.length === 0) return "";
  if (n.length === 1) return n[0]!;
  if (n.length === 2) return `${n[0]!} and ${n[1]!}`;
  return `${n.slice(0, -1).join(", ")}, and ${n[n.length - 1]!}`;
}

function buildScenarioName(
  cyberRiskName: string,
  threatPhrase: string,
  assetName: string,
): string {
  if (threatPhrase) return `${threatPhrase} on ${assetName}`;
  return `${cyberRiskName} on ${assetName}`;
}

function buildScoringRationale(
  cyberRiskName: string,
  scenarioThreatPhrase: string,
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
  const threatNamesList = scenarioThreatIds
    .map((id) => threatById.get(id)?.name)
    .filter(Boolean) as string[];

  const vulnDetails = scenarioVulnIds
    .map((id) => vulnById.get(id))
    .filter((v): v is NonNullable<typeof v> => v != null);

  const vulnNamesSentence = vulnDetails.map((v) => v.name).join("; ") || "N/A";

  const assetVulns = vulnsByAssetId.get(assetId) ?? [];
  const vulnBullets = assetVulns
    .map((v) => `• ${v.name} (${v.domain}, ${v.primaryCIAImpact})`)
    .join("\n");

  const threatFocus =
    scenarioThreatPhrase ||
    (threatNamesList.length ? formatThreatPhrase(threatNamesList) : "the modeled threat");

  const sections: string[] = [
    `Cyber risk (library) — ${cyberRiskName}: This scenario sits under the ${cyberRiskName} cyber risk in the library. Here we assess ${threatFocus} against ${assetName} (${assetType.toLowerCase()}).`,

    `Threat level (${threatSevLabel}): The threat severity is ${threatSevLabel.toLowerCase()} for this scenario’s threat vector${threatNamesList.length ? ` (${formatThreatPhrase(threatNamesList)})` : ""}.`,

    `Vulnerability level (${vulnSevLabel}): The vulnerability severity is ${vulnSevLabel.toLowerCase()}. All vulnerabilities scoped to this scenario were evaluated together; the rating reflects their combined exposure. Contributing items: ${vulnNamesSentence}.`,

    `Impact (${impactLabel}): ${assetName} is ${impactLabel.toLowerCase()}-criticality. Compromise or disruption would have ${IMPACT_CONSEQUENCE[impactLabel]} consequences for the organization.`,

    `Likelihood (${likelihoodLabel}): ${threatSevLabel} threat severity together with ${vulnSevLabel} vulnerability severity yields ${likelihoodLabel.toLowerCase()} likelihood of this scenario materializing.`,

    `Cyber risk score (${cyberRiskScoreLabel}): Given ${impactLabel.toLowerCase()} impact and ${likelihoodLabel.toLowerCase()} likelihood, the scenario cyber risk score is ${cyberRiskScoreLabel.toLowerCase()}.`,
  ];

  if (assetVulns.length > 0) {
    sections.push(
      `Other vulnerabilities recorded on ${assetName} (context):\n${vulnBullets}`,
    );
  }

  return sections.join("\n\n");
}

function scenarioSeverityValues(seq: number): {
  threatSeverity: FivePointScaleValue;
  vulnerabilitySeverity: FivePointScaleValue;
} {
  const threatSeverity = ((seq % 4) + 2) as FivePointScaleValue;
  const vulnerabilitySeverity = (((seq * 7) % 4) + 2) as FivePointScaleValue;
  return { threatSeverity, vulnerabilitySeverity };
}

function buildScenarios(): MockScenario[] {
  const list: MockScenario[] = [];
  let seq = 0;

  for (const risk of cyberRisks) {
    for (const tid of risk.threatIds) {
      const threat = threatById.get(tid);
      if (!threat) continue;

      for (const assetId of threat.assetIds) {
        const asset = assetById.get(assetId);
        if (!asset) continue;

        seq += 1;
        const scenarioThreatIds = [tid];
        const scenarioVulnIds = threat.vulnerabilityIds.filter((vid) => {
          const v = vulnById.get(vid);
          return v?.relationships.assetId === assetId;
        });

        const { threatSeverity, vulnerabilitySeverity } = scenarioSeverityValues(seq);
        const impact = asset.criticality;
        const likelihood = threatSeverity * vulnerabilitySeverity;
        const cyberRiskScore = impact * likelihood;
        const impactLabel = getFivePointLabel(impact);
        const threatSeverityLabel = getFivePointLabel(threatSeverity);
        const vulnerabilitySeverityLabel = getFivePointLabel(vulnerabilitySeverity);
        const likelihoodLabel = getLikelihoodLabel(likelihood);
        const cyberRiskScoreLabel = getCyberRiskScoreLabel(cyberRiskScore);

        const threatNamesForTitle = scenarioThreatIds
          .map((id) => threatById.get(id)?.name)
          .filter(Boolean) as string[];
        const scenarioThreatPhrase = formatThreatPhrase(threatNamesForTitle);

        list.push({
          id: padId("SC", seq),
          name: buildScenarioName(risk.name, scenarioThreatPhrase, asset.name),
          ownerId: asset.ownerId,
          cyberRiskId: risk.id,
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
            scenarioThreatPhrase,
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
          relationships: {
            cyberRiskId: risk.id,
            assetId,
            threatIds: scenarioThreatIds,
            vulnerabilityIds: scenarioVulnIds,
            controlIds: risk.controlIds,
            mitigationPlanIds: risk.mitigationPlanIds,
          },
        });
      }
    }
  }

  return list;
}

function dedupePush(arr: string[], id: string): void {
  if (!arr.includes(id)) arr.push(id);
}

/** Wire scenario ids into cyber risks, threats, vulnerabilities, and assets (relationship mirrors). */
function applyScenarioEntityLinks(scenarioList: MockScenario[]): void {
  for (const r of cyberRisks) {
    r.scenarioIds.length = 0;
  }
  for (const t of allThreats) {
    t.relationships.scenarioIds.length = 0;
  }
  for (const v of allVulnerabilities) {
    v.relationships.scenarioIds.length = 0;
  }
  for (const a of assets) {
    a.relationships.scenarioIds.length = 0;
  }

  for (const s of scenarioList) {
    const risk = riskById.get(s.cyberRiskId);
    if (risk) dedupePush(risk.scenarioIds, s.id);

    for (const tid of s.threatIds) {
      const t = threatById.get(tid);
      if (t) dedupePush(t.relationships.scenarioIds, s.id);
    }
    for (const vid of s.vulnerabilityIds) {
      const v = vulnById.get(vid);
      if (v) dedupePush(v.relationships.scenarioIds, s.id);
    }
    const a = assetById.get(s.assetId);
    if (a) dedupePush(a.relationships.scenarioIds, s.id);
  }
}

export const scenarios: MockScenario[] = buildScenarios();
applyScenarioEntityLinks(scenarios);

const scenarioById = new Map(scenarios.map((s) => [s.id, s]));

export function getScenarioById(id: string): MockScenario | undefined {
  return scenarioById.get(id);
}
