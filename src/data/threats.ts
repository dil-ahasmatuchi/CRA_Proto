import { padId } from "./types.js";
import type {
  MockThreat,
  ThreatSource,
  ThreatStatus,
  ControlFrequency,
  ThreatDomain,
  MockVulnerability,
  MockAsset,
} from "./types.js";
import { assets } from "./assets.js";
import { vulnerabilities } from "./vulnerabilities.js";

/**
 * One row per asset vulnerability chunk (1–2 threats per asset). Each threat is scoped to a single
 * asset. Titles include the asset name so catalog rows stay distinct.
 * `applyCrossEntityLinks` syncs asset ↔ vulnerability ↔ threat.
 */

type ThreatTemplate = {
  title: string;
  source: ThreatSource;
  status: ThreatStatus;
  controlFrequency: ControlFrequency;
  domain: ThreatDomain;
};

const THREAT_TEMPLATES: Record<MockAsset["assetType"], ThreatTemplate[]> = {
  Application: [
    {
      title: "Account takeover attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "Automated credential attacks",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "API abuse and scraping",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Application & API",
    },
    {
      title: "Malware delivery via trusted channels",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Application & API",
    },
    {
      title: "Supply chain dependency compromise",
      source: "Accidental",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Supply Chain & Third Party",
    },
  ],
  Database: [
    {
      title: "Unauthorized data extraction",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Data & Information",
    },
    {
      title: "Privilege escalation via shared accounts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Identity & Access Management",
    },
    {
      title: "Ransomware encryption attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Data & Information",
    },
    {
      title: "Backup and replica exfiltration",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Data & Information",
    },
    {
      title: "SQL and query-layer exploitation",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Weekly",
      domain: "Application & API",
    },
  ],
  Server: [
    {
      title: "Remote code execution attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Network & Infrastructure",
    },
    {
      title: "Lateral movement via shared credentials",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Identity & Access Management",
    },
    {
      title: "Cryptojacking and resource abuse",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Denial-of-service against hosted services",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Network & Infrastructure",
    },
    {
      title: "Misconfiguration exploitation",
      source: "Accidental",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Cloud & Virtualisation",
    },
  ],
  "Network device": [
    {
      title: "Device firmware exploitation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Network & Infrastructure",
    },
    {
      title: "Routing and control-plane manipulation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Network & Infrastructure",
    },
    {
      title: "Unauthorized configuration changes",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Identity & Access Management",
    },
    {
      title: "Traffic interception attempts",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Network & Infrastructure",
    },
    {
      title: "Recruitment of appliances into botnets",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Monthly",
      domain: "Network & Infrastructure",
    },
  ],
  "Cloud service": [
    {
      title: "IAM policy abuse and token theft",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "Misconfiguration and public exposure exploitation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "SaaS session hijacking",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Cloud metadata service abuse",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Unauthorized workloads and cryptomining",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Cloud & Virtualisation",
    },
  ],
  Endpoint: [
    {
      title: "Endpoint malware deployment",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Endpoint & Device",
    },
    {
      title: "Credential theft from endpoints",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "USB and removable media borne attacks",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Endpoint & Device",
    },
    {
      title: "Lost or stolen device abuse",
      source: "Accidental",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "People & Workforce",
    },
    {
      title: "Local privilege escalation",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Weekly",
      domain: "Endpoint & Device",
    },
  ],
  "IoT device": [
    {
      title: "IoT botnet recruitment",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Operational Technology (OT/ICS)",
    },
    {
      title: "Weak default credential abuse",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Daily",
      domain: "Identity & Access Management",
    },
    {
      title: "Firmware exploitation",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Monthly",
      domain: "Operational Technology (OT/ICS)",
    },
    {
      title: "Sensor data interception",
      source: "Deliberate",
      status: "Active",
      controlFrequency: "Weekly",
      domain: "Data & Information",
    },
    {
      title: "Physical tampering and side-channel access",
      source: "Deliberate",
      status: "Draft",
      controlFrequency: "Quarterly",
      domain: "Physical & Facilities",
    },
  ],
};

function vulnsForAsset(assetId: string, all: MockVulnerability[]): MockVulnerability[] {
  return all.filter((v) => v.relationships.assetId === assetId);
}

/** Split asset vulnerabilities into 1–2 groups (2–3 items each) so each asset has 1–2 threats. */
function chunkVulnerabilitiesForThreats(vulns: MockVulnerability[]): MockVulnerability[][] {
  const n = vulns.length;
  if (n === 0) return [];
  if (n <= 3) return [vulns];
  if (n === 4) return [vulns.slice(0, 2), vulns.slice(2, 4)];
  if (n === 5) return [vulns.slice(0, 3), vulns.slice(3, 5)];
  if (n === 6) return [vulns.slice(0, 3), vulns.slice(3, 6)];
  throw new Error(`Unexpected vulnerability count per asset: ${n}`);
}

function buildThreatRelationships(
  cyberRiskIds: string[],
  assetIds: string[],
  vulnerabilityIds: string[],
): MockThreat["relationships"] {
  return {
    assetIds,
    vulnerabilityIds,
    cyberRiskIds,
    controlIds: [],
    mitigationPlanIds: [],
    scenarioIds: [],
  };
}

function buildThreats(): MockThreat[] {
  const out: MockThreat[] = [];
  let seq = 0;

  for (let assetIndex = 0; assetIndex < assets.length; assetIndex++) {
    const asset = assets[assetIndex]!;
    const pool = THREAT_TEMPLATES[asset.assetType];
    const assetVulns = vulnsForAsset(asset.id, vulnerabilities);
    const chunks = chunkVulnerabilitiesForThreats(assetVulns);

    chunks.forEach((chunk, chunkIndex) => {
      seq += 1;
      const template = pool[(assetIndex + chunkIndex) % pool.length]!;
      const vulnerabilityIds = chunk.map((v) => v.id);
      const assetIds = [asset.id];
      const cyberRiskIds: string[] = [];

      out.push({
        id: padId("THR", seq),
        name: `${template.title} (${asset.name})`,
        ownerId: asset.ownerId,
        source: template.source,
        status: template.status,
        controlFrequency: template.controlFrequency,
        domain: template.domain,
        cyberRiskIds,
        assetIds,
        vulnerabilityIds,
        relationships: buildThreatRelationships(cyberRiskIds, assetIds, vulnerabilityIds),
      });
    });
  }

  return out;
}

const threatsBuilt = buildThreats();

/** Maps assessment seed indices to `THR-###` ids. */
export function remapThreatIdFromLegacySequential(legacyIndex: number): string {
  return padId("THR", legacyIndex);
}

function applyCrossEntityLinks(threatList: MockThreat[]): void {
  const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));
  const assetById = new Map(assets.map((a) => [a.id, a]));

  for (const v of vulnerabilities) {
    v.threatIds.length = 0;
    v.relationships.threatIds.length = 0;
  }
  for (const a of assets) {
    a.vulnerabilityIds.length = 0;
    a.threatIds.length = 0;
    a.relationships.vulnerabilityIds.length = 0;
    a.relationships.threatIds.length = 0;
  }

  for (const v of vulnerabilities) {
    const a = assetById.get(v.relationships.assetId);
    if (a) {
      a.vulnerabilityIds.push(v.id);
      a.relationships.vulnerabilityIds.push(v.id);
    }
  }

  for (const t of threatList) {
    for (const vid of t.vulnerabilityIds) {
      const v = vulnById.get(vid);
      if (v && !v.threatIds.includes(t.id)) {
        v.threatIds.push(t.id);
        v.relationships.threatIds.push(t.id);
      }
    }
    for (const aid of t.assetIds) {
      const a = assetById.get(aid);
      if (a && !a.threatIds.includes(t.id)) {
        a.threatIds.push(t.id);
        a.relationships.threatIds.push(t.id);
      }
    }
  }
}

export const threats: MockThreat[] = threatsBuilt;
applyCrossEntityLinks(threats);

const threatById = new Map(threats.map((t) => [t.id, t]));

export function getThreatById(id: string): MockThreat | undefined {
  return threatById.get(id);
}
