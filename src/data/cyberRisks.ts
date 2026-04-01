import {
  padId,
  getFivePointLabel,
  getLikelihoodLabel,
  getCyberRiskScoreLabel,
} from "./types.js";
import type {
  MockCyberRisk,
  CyberRiskStatus,
  FivePointScaleValue,
} from "./types.js";
import { threats } from "./threats.js";
import { vulnerabilities } from "./vulnerabilities.js";
import { assets } from "./assets.js";

const CONTROL_COUNT = 50;
const MITIGATION_PLAN_COUNT = 50;
const RISK_COUNT = 40;

const OWNER_ROTATION = [7, 9, 14, 15, 20, 33, 39, 49, 1, 5] as const;

/** Each name describes a single malicious action (sentence case). */
const RISK_SEEDS: { name: string; status: CyberRiskStatus }[] = [
  { name: "Ransomware deployment", status: "Mitigation" },
  { name: "Phishing", status: "Monitoring" },
  { name: "DDoS attack", status: "Assessment" },
  { name: "Insider data exfiltration", status: "Mitigation" },
  { name: "Business email compromise", status: "Monitoring" },
  { name: "Compliance breach", status: "Assessment" },
  { name: "Supply chain compromise", status: "Identification" },
  { name: "Injection attack", status: "Mitigation" },
  { name: "Malware infection", status: "Monitoring" },
  { name: "Account takeover", status: "Assessment" },
  { name: "Cloud service outage", status: "Identification" },
  { name: "Advanced persistent threat", status: "Mitigation" },
  { name: "Zero-day exploitation", status: "Assessment" },
  { name: "Man-in-the-middle attack", status: "Monitoring" },
  { name: "Cryptojacking", status: "Identification" },
  { name: "Credential stuffing", status: "Mitigation" },
  { name: "Trade secret theft", status: "Assessment" },
  { name: "Privacy breach", status: "Monitoring" },
  { name: "Infrastructure attack", status: "Assessment" },
  { name: "API abuse", status: "Identification" },
  { name: "Data tampering", status: "Mitigation" },
  { name: "Unpatched system exploitation", status: "Assessment" },
  { name: "Vendor data breach", status: "Monitoring" },
  { name: "Website defacement", status: "Identification" },
  { name: "Cloud misconfiguration exploit", status: "Mitigation" },
  { name: "Double extortion", status: "Mitigation" },
  { name: "Extended outage", status: "Assessment" },
  { name: "Fraudulent data manipulation", status: "Identification" },
  { name: "Industrial espionage", status: "Assessment" },
  { name: "Regulatory penalty exposure", status: "Monitoring" },
  { name: "Vendor disruption", status: "Mitigation" },
  { name: "Session hijacking", status: "Assessment" },
  { name: "Customer PII exposure", status: "Mitigation" },
  { name: "System failure", status: "Identification" },
  { name: "Insecure API exploitation", status: "Mitigation" },
  { name: "Operational disruption", status: "Assessment" },
  { name: "IoT compromise", status: "Assessment" },
  { name: "USB-based intrusion", status: "Identification" },
  { name: "DNS hijacking", status: "Monitoring" },
  { name: "SIM swapping fraud", status: "Identification" },
];

function dedupePush(arr: string[], id: string): void {
  if (!arr.includes(id)) arr.push(id);
}

function linkCyberRiskToEntities(risk: MockCyberRisk): void {
  const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));
  const threatById = new Map(threats.map((t) => [t.id, t]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  for (const tid of risk.threatIds) {
    const t = threatById.get(tid);
    if (t) dedupePush(t.cyberRiskIds, risk.id);
  }

  for (const vid of risk.vulnerabilityIds) {
    const v = vulnById.get(vid);
    if (v) dedupePush(v.cyberRiskIds, risk.id);
  }

  for (const aid of risk.assetIds) {
    const a = assetById.get(aid);
    if (a) dedupePush(a.relationships.cyberRiskIds, risk.id);
  }
}

function buildCyberRisks(): MockCyberRisk[] {
  if (threats.length !== 80) {
    throw new Error(`Expected 80 threats to build ${RISK_COUNT} cyber risks`);
  }
  if (RISK_SEEDS.length !== RISK_COUNT) {
    throw new Error("RISK_SEEDS must match RISK_COUNT");
  }

  for (const v of vulnerabilities) {
    v.cyberRiskIds.length = 0;
  }
  for (const t of threats) {
    t.cyberRiskIds.length = 0;
  }
  for (const a of assets) {
    a.relationships.cyberRiskIds.length = 0;
  }

  const out: MockCyberRisk[] = [];

  for (let i = 0; i < RISK_COUNT; i++) {
    const t0 = threats[i * 2]!;
    const t1 = threats[i * 2 + 1]!;
    const seed = RISK_SEEDS[i]!;

    const threatIds = [t0.id, t1.id];
    const assetSet = new Set<string>([...t0.assetIds, ...t1.assetIds]);
    const vulnSet = new Set<string>([...t0.vulnerabilityIds, ...t1.vulnerabilityIds]);

    const assetIds = Array.from(assetSet);
    const vulnerabilityIds = Array.from(vulnSet);
    const scenarioIds: string[] = [];

    const primaryAssetId = assetIds[0]!;
    const primaryAsset = assets.find((a) => a.id === primaryAssetId);
    const buIdx = primaryAsset
      ? Number(primaryAsset.businessUnitId.replace(/^BU-0*/, "") || "4")
      : 4;

    const ownerIdx = OWNER_ROTATION[i % OWNER_ROTATION.length]!;
    const impact = (2 + (i % 4)) as FivePointScaleValue;
    const likelihood = 6 + ((i * 5) % 20);
    const score = impact * likelihood;

    const ctlA = 1 + (i % CONTROL_COUNT);
    const ctlB = 1 + ((i + 11) % CONTROL_COUNT);
    const mpA = 1 + (i % MITIGATION_PLAN_COUNT);
    const mpB = 1 + ((i + 5) % MITIGATION_PLAN_COUNT);
    const controlIds = [padId("CTL", ctlA), padId("CTL", ctlB)];
    const mitigationPlanIds = [padId("MP", mpA), padId("MP", mpB)];

    const risk: MockCyberRisk = {
      id: padId("CR", i + 1),
      name: seed.name,
      ownerId: padId("USR", ownerIdx),
      status: seed.status,
      businessUnitId: padId("BU", buIdx),
      impact,
      impactLabel: getFivePointLabel(impact),
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore: score,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(score),
      assetIds,
      threatIds,
      vulnerabilityIds,
      scenarioIds,
      controlIds,
      mitigationPlanIds,
      relationships: {
        assetIds,
        threatIds,
        vulnerabilityIds,
        scenarioIds,
        controlIds,
        mitigationPlanIds,
        assessmentIds: [],
      },
    };

    linkCyberRiskToEntities(risk);
    out.push(risk);
  }

  return out;
}

export const cyberRisks: MockCyberRisk[] = buildCyberRisks();

const riskById = new Map(cyberRisks.map((r) => [r.id, r]));

export function getCyberRiskById(id: string): MockCyberRisk | undefined {
  return riskById.get(id);
}
