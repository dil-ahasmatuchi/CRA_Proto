import {
  padId,
  getFivePointLabel,
  getLikelihoodLabel,
  getCyberRiskScoreLabel,
} from "./types.js";
import type { MockCyberRisk, CyberRiskStatus, FivePointScaleValue } from "./types.js";
import { threats } from "./threats.js";
import { vulnerabilities } from "./vulnerabilities.js";
import { assets } from "./assets.js";

const OWNER_ROTATION = [7, 9, 14, 15, 20, 33, 39, 49, 1, 5] as const;

/** Exactly 20 library cyber risks. Threats THR-001..020 each anchor one risk; THR-021..025 pair with THR-001..005 respectively. */
const RISK_SEEDS: { name: string; status: CyberRiskStatus }[] = [
  { name: "Ransomware and extortion disrupting critical operations and data availability", status: "Mitigation" },
  { name: "Phishing and impersonation compromising workforce and customer credentials", status: "Monitoring" },
  { name: "Denial-of-service events impairing service availability and revenue", status: "Assessment" },
  { name: "Insider actions or negligence leading to unauthorized data exfiltration", status: "Mitigation" },
  { name: "Business email compromise and payment fraud against the organization", status: "Monitoring" },
  { name: "Cyber incidents triggering regulatory non-compliance and enforcement action", status: "Assessment" },
  { name: "Supply chain compromise through vendors, software, or managed services", status: "Identification" },
  { name: "Application-layer attacks compromising confidentiality and integrity of data", status: "Mitigation" },
  { name: "Malware infection, illicit cryptomining, and lateral movement across systems", status: "Monitoring" },
  { name: "Account takeover enabling unauthorized access to systems and privileged functions", status: "Assessment" },
  { name: "Cloud or SaaS dependency failures causing extended operational outage", status: "Identification" },
  { name: "Sophisticated and AI-assisted cyber threats maintaining covert, long-term access", status: "Mitigation" },
  { name: "Exploitation of unpatched or zero-day vulnerabilities before remediations deploy", status: "Assessment" },
  { name: "Adversary-in-the-middle attacks intercepting or altering sensitive communications", status: "Monitoring" },
  { name: "Sophisticated cyber threats and AI-related security vulnerabilities", status: "Identification" },
  { name: "Credential stuffing and password reuse breaching customer or workforce accounts", status: "Mitigation" },
  { name: "Theft or leakage of trade secrets and competitively sensitive information", status: "Assessment" },
  { name: "Cyber incidents compromising confidential information and data subject privacy", status: "Monitoring" },
  { name: "Cyber resilience gap — IT infrastructure vulnerability exposure", status: "Assessment" },
  { name: "API abuse and excessive access undermining data protection and service integrity", status: "Identification" },
];

const threatById = new Map(threats.map((t) => [t.id, t]));

function dedupePush(arr: string[], id: string): void {
  if (!arr.includes(id)) arr.push(id);
}

function linkCyberRiskToEntities(risk: MockCyberRisk): void {
  const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));
  const tById = new Map(threats.map((t) => [t.id, t]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  for (const tid of risk.threatIds) {
    const t = tById.get(tid);
    if (t) {
      dedupePush(t.cyberRiskIds, risk.id);
      dedupePush(t.relationships.cyberRiskIds, risk.id);
    }
  }

  for (const vid of risk.vulnerabilityIds) {
    const v = vulnById.get(vid);
    if (v) {
      dedupePush(v.cyberRiskIds, risk.id);
      dedupePush(v.relationships.cyberRiskIds, risk.id);
    }
  }

  for (const aid of risk.assetIds) {
    const a = assetById.get(aid);
    if (a) dedupePush(a.relationships.cyberRiskIds, risk.id);
  }
}

/** Primary threat THR-(i+1); first five risks also include THR-(21..25) for full threat coverage. */
function threatIdsForRiskIndex(i: number): string[] {
  const primary = padId("THR", i + 1);
  if (i < 5) {
    return [primary, padId("THR", 21 + i)];
  }
  return [primary];
}

function unionAssetIdsForThreats(threatIds: string[]): string[] {
  const s = new Set<string>();
  for (const tid of threatIds) {
    const t = threatById.get(tid);
    if (t) {
      for (const a of t.assetIds) s.add(a);
    }
  }
  return [...s].sort();
}

function vulnerabilityIdsForAssets(assetIds: string[]): string[] {
  const set = new Set<string>();
  for (const v of vulnerabilities) {
    if (assetIds.includes(v.relationships.assetId)) set.add(v.id);
  }
  return [...set].sort();
}

/** Five controls per cyber risk → CTL (5*i+1)..(5*i+5) covers CTL-001..CTL-100. */
function controlIdsForRiskIndex(i: number): string[] {
  const base = 5 * i;
  return [1, 2, 3, 4, 5].map((k) => padId("CTL", base + k));
}

function mitigationPlanIdsForRiskIndex(i: number): string[] {
  return [padId("MP", 1 + (i % 15)), padId("MP", 1 + ((i + 7) % 15))];
}

function buildCyberRisks(): MockCyberRisk[] {
  for (const v of vulnerabilities) {
    v.cyberRiskIds.length = 0;
    v.relationships.cyberRiskIds.length = 0;
  }
  for (const t of threats) {
    t.cyberRiskIds.length = 0;
    t.relationships.cyberRiskIds.length = 0;
  }
  for (const a of assets) {
    a.relationships.cyberRiskIds.length = 0;
  }

  const out: MockCyberRisk[] = [];

  for (let i = 0; i < 20; i++) {
    const seed = RISK_SEEDS[i]!;
    const threatIds = threatIdsForRiskIndex(i);
    const assetIds = unionAssetIdsForThreats(threatIds);
    const vulnerabilityIds = vulnerabilityIdsForAssets(assetIds);
    const scenarioIds: string[] = [];

    const buIdx = Number(assets.find((a) => a.id === assetIds[0])?.businessUnitId.replace(/^BU-0*/, "") || "4");
    const ownerIdx = OWNER_ROTATION[i % OWNER_ROTATION.length]!;
    const impact = (2 + (i % 4)) as FivePointScaleValue;
    const likelihood = 6 + ((i * 5) % 20);
    const score = impact * likelihood;

    const controlIds = controlIdsForRiskIndex(i);
    const mitigationPlanIds = mitigationPlanIdsForRiskIndex(i);

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

/** Propagate control and mitigation plan ids from linked cyber risks onto threats and vulnerabilities. */
function syncIndirectLinksFromCyberRisks(): void {
  for (const t of threats) {
    t.relationships.controlIds.length = 0;
    t.relationships.mitigationPlanIds.length = 0;
    for (const crid of t.cyberRiskIds) {
      const r = riskById.get(crid);
      if (!r) continue;
      for (const cid of r.controlIds) {
        if (!t.relationships.controlIds.includes(cid)) t.relationships.controlIds.push(cid);
      }
      for (const mid of r.mitigationPlanIds) {
        if (!t.relationships.mitigationPlanIds.includes(mid)) t.relationships.mitigationPlanIds.push(mid);
      }
    }
  }
  for (const v of vulnerabilities) {
    v.relationships.controlIds.length = 0;
    v.relationships.mitigationPlanIds.length = 0;
    for (const crid of v.cyberRiskIds) {
      const r = riskById.get(crid);
      if (!r) continue;
      for (const cid of r.controlIds) {
        if (!v.relationships.controlIds.includes(cid)) v.relationships.controlIds.push(cid);
      }
      for (const mid of r.mitigationPlanIds) {
        if (!v.relationships.mitigationPlanIds.includes(mid)) v.relationships.mitigationPlanIds.push(mid);
      }
    }
  }
}

syncIndirectLinksFromCyberRisks();

export function getCyberRiskById(id: string): MockCyberRisk | undefined {
  return riskById.get(id);
}
