import { padId } from "./types.js";
import type {
  MockThreat,
  MockThreatAttachment,
  ThreatActor,
  ThreatAttackVector,
  ThreatSource,
  ThreatStatus,
  ThreatDomain,
  MockVulnerability,
  MockAsset,
} from "./types.js";
import { assets } from "./assets.js";
import { vulnerabilities } from "./vulnerabilities.js";
import { users } from "./users.js";

/**
 * One row per asset vulnerability chunk (1–2 threats per asset). Each threat is scoped to a single
 * asset. Titles include the asset name so catalog rows stay distinct.
 * `applyCrossEntityLinks` syncs asset ↔ vulnerability ↔ threat.
 */

type ThreatTemplate = {
  title: string;
  sources: ThreatSource[];
  status: ThreatStatus;
  domain: ThreatDomain;
};

function buildThreatDescription(
  title: string,
  assetName: string,
  domain: ThreatDomain,
  sources: ThreatSource[],
): string {
  const sourceSummary =
    sources.length === 0
      ? "unspecified source drivers"
      : sources.length === 1
        ? `${sources[0]!.toLowerCase()} drivers`
        : `${sources.map((s) => s.toLowerCase()).join(", ")} drivers`;
  return (
    `${title} (${assetName}) is a curated threat category in the ${domain} domain. ` +
    `It covers what can go wrong, how the scenario typically manifests, and which systems, data, or services are most exposed. ` +
    `Source profile: ${sourceSummary}. Use this entry for top-down risk assessment (ISO 27005 / NIST CSF–aligned libraries).`
  );
}

function pickThreatActors(seq: number, sources: ThreatSource[]): ThreatActor[] {
  const pool: ThreatActor[] = [
    "Organised Cybercriminal Group",
    "Nation-State / State-Sponsored Actor",
    "Malicious Insider (employee, contractor)",
    "Hacktivist",
    "Opportunistic / Script Kiddie",
    "Competitor (corporate espionage)",
  ];
  const out = new Set<ThreatActor>();
  if (sources.includes("Deliberate")) {
    out.add(pool[seq % pool.length]!);
    if (seq % 5 === 0) out.add("Malicious Insider (employee, contractor)");
  }
  if (sources.includes("Accidental")) out.add("Negligent / Untrained Employee");
  if (sources.includes("Environmental")) {
    out.add("Natural / Environmental Event");
    out.add("System / Process Failure (non-human)");
  }
  if (out.size === 0) out.add("System / Process Failure (non-human)");
  return [...out];
}

function pickAttackVectors(seq: number, domain: ThreatDomain): ThreatAttackVector[] {
  const byDomain: Partial<Record<ThreatDomain, ThreatAttackVector[]>> = {
    "Identity & Access Management": [
      "Insider / Privileged Access Abuse",
      "Network & Remote Access (VPN, RDP, open ports)",
    ],
    "Endpoint & Device": [
      "Physical Access & Removable Media",
      "Email & Messaging (phishing, BEC, malicious attachments)",
    ],
    "Network & Infrastructure": [
      "Network & Remote Access (VPN, RDP, open ports)",
      "Wireless & Mobile (Wi-Fi, Bluetooth, SMS)",
    ],
    "Application & API": [
      "Web Application & Browser",
      "Cloud Services & APIs",
    ],
    "Data & Information": [
      "Insider / Privileged Access Abuse",
      "Cloud Services & APIs",
    ],
    "Cloud & Virtualisation": [
      "Cloud Services & APIs",
      "Supply Chain & Third-Party Software",
    ],
    "Physical & Facilities": ["Physical Access & Removable Media"],
    "Supply Chain & Third Party": [
      "Supply Chain & Third-Party Software",
      "Email & Messaging (phishing, BEC, malicious attachments)",
    ],
    "Operational Technology (OT/ICS)": [
      "Operational Technology / Industrial Interfaces",
      "Network & Remote Access (VPN, RDP, open ports)",
    ],
    "People & Workforce": [
      "Email & Messaging (phishing, BEC, malicious attachments)",
      "Social Media & Public Channels",
    ],
  };
  const primary = byDomain[domain] ?? [
    "Web Application & Browser",
    "Network & Remote Access (VPN, RDP, open ports)",
  ];
  const extra: ThreatAttackVector[] = [
    "Email & Messaging (phishing, BEC, malicious attachments)",
    "Web Application & Browser",
  ];
  const merged = [...primary];
  merged.push(extra[seq % extra.length]!);
  return [...new Set(merged)];
}

function mockAttachmentsForSeq(seq: number): MockThreatAttachment[] {
  if (seq % 7 !== 0) return [];
  return [
    { id: `thr-att-${seq}-1`, fileName: "Threat intelligence bulletin (sample).pdf" },
    { id: `thr-att-${seq}-2`, fileName: "Internal incident summary — redacted.docx" },
  ];
}

const THREAT_TEMPLATES: Record<MockAsset["assetType"], ThreatTemplate[]> = {
  Application: [
    {
      title: "Account takeover attempts",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "Automated credential attacks",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "API abuse and scraping",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Application & API",
    },
    {
      title: "Malware delivery via trusted channels",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Application & API",
    },
    {
      title: "Supply chain dependency compromise",
      sources: ["Accidental"],
      status: "Active",
      domain: "Supply Chain & Third Party",
    },
  ],
  Database: [
    {
      title: "Unauthorized data extraction",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Data & Information",
    },
    {
      title: "Privilege escalation via shared accounts",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "Ransomware encryption attempts",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Data & Information",
    },
    {
      title: "Backup and replica exfiltration",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Data & Information",
    },
    {
      title: "SQL and query-layer exploitation",
      sources: ["Deliberate"],
      status: "Draft",
      domain: "Application & API",
    },
  ],
  Server: [
    {
      title: "Remote code execution attempts",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Network & Infrastructure",
    },
    {
      title: "Lateral movement via shared credentials",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "Cryptojacking and resource abuse",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Denial-of-service against hosted services",
      sources: ["Deliberate", "Environmental"],
      status: "Active",
      domain: "Network & Infrastructure",
    },
    {
      title: "Misconfiguration exploitation",
      sources: ["Accidental"],
      status: "Active",
      domain: "Cloud & Virtualisation",
    },
  ],
  "Network device": [
    {
      title: "Device firmware exploitation",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Network & Infrastructure",
    },
    {
      title: "Routing and control-plane manipulation",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Network & Infrastructure",
    },
    {
      title: "Unauthorized configuration changes",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "Traffic interception attempts",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Network & Infrastructure",
    },
    {
      title: "Recruitment of appliances into botnets",
      sources: ["Deliberate"],
      status: "Draft",
      domain: "Network & Infrastructure",
    },
  ],
  "Cloud service": [
    {
      title: "IAM policy abuse and token theft",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "Misconfiguration and public exposure exploitation",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "SaaS session hijacking",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Cloud metadata service abuse",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Cloud & Virtualisation",
    },
    {
      title: "Unauthorized workloads and cryptomining",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Cloud & Virtualisation",
    },
  ],
  Endpoint: [
    {
      title: "Endpoint malware deployment",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Endpoint & Device",
    },
    {
      title: "Credential theft from endpoints",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "USB and removable media borne attacks",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Endpoint & Device",
    },
    {
      title: "Lost or stolen device abuse",
      sources: ["Accidental", "Deliberate"],
      status: "Active",
      domain: "People & Workforce",
    },
    {
      title: "Local privilege escalation",
      sources: ["Deliberate"],
      status: "Draft",
      domain: "Endpoint & Device",
    },
  ],
  "IoT device": [
    {
      title: "IoT botnet recruitment",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Operational Technology (OT/ICS)",
    },
    {
      title: "Weak default credential abuse",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Identity & Access Management",
    },
    {
      title: "Firmware exploitation",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Operational Technology (OT/ICS)",
    },
    {
      title: "Sensor data interception",
      sources: ["Deliberate"],
      status: "Active",
      domain: "Data & Information",
    },
    {
      title: "Physical tampering and side-channel access",
      sources: ["Deliberate"],
      status: "Draft",
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

      const sources = template.sources;
      out.push({
        id: padId("THR", seq),
        displayId: `T-${String(seq).padStart(4, "0")}`,
        name: `${template.title} (${asset.name})`,
        ownerIds: [asset.ownerId],
        domain: template.domain,
        description: buildThreatDescription(template.title, asset.name, template.domain, sources),
        sources,
        threatActors: pickThreatActors(seq, sources),
        attackVectors: pickAttackVectors(seq, template.domain),
        status: template.status,
        attachments: mockAttachmentsForSeq(seq),
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

const NEW_THREAT_NAME_RE = /^New threat (\d+)$/i;

function nextThreatNumericId(): number {
  let max = 0;
  for (const t of threats) {
    const m = /^THR-(\d+)$/.exec(t.id);
    if (m) max = Math.max(max, Number.parseInt(m[1]!, 10));
  }
  return max + 1;
}

function nextNewThreatDisplayName(): string {
  let max = 0;
  for (const t of threats) {
    const m = NEW_THREAT_NAME_RE.exec(t.name.trim());
    if (m) max = Math.max(max, Number.parseInt(m[1]!, 10));
  }
  const n = max + 1;
  return `New threat ${String(n).padStart(3, "0")}`;
}

const threatListeners = new Set<() => void>();
let threatsSnapshotVersion = 0;

function notifyThreatListeners(): void {
  threatsSnapshotVersion += 1;
  for (const cb of threatListeners) cb();
}

/** Subscribe to catalog mutations (e.g. `addThreat`). For `useSyncExternalStore`. */
export function subscribeThreats(onStoreChange: () => void): () => void {
  threatListeners.add(onStoreChange);
  return () => {
    threatListeners.delete(onStoreChange);
  };
}

/** Version bump when `threats` is mutated; pair with `subscribeThreats`. */
export function getThreatsSnapshotVersion(): number {
  return threatsSnapshotVersion;
}

const DEFAULT_NEW_THREAT_DOMAIN: ThreatDomain = "Identity & Access Management";

/**
 * Appends a draft threat to the in-memory catalog (prototype).
 * Syncs cross-entity mirrors and notifies subscribers.
 */
export function addThreat(): MockThreat {
  const defaultOwnerId = users[0]?.id ?? "USR-001";
  const nextNum = nextThreatNumericId();
  const newThreat: MockThreat = {
    id: padId("THR", nextNum),
    displayId: `T-${String(nextNum).padStart(4, "0")}`,
    name: nextNewThreatDisplayName(),
    ownerIds: [defaultOwnerId],
    domain: DEFAULT_NEW_THREAT_DOMAIN,
    description: "",
    sources: ["Deliberate"],
    threatActors: [],
    attackVectors: [],
    status: "Draft",
    attachments: [],
    cyberRiskIds: [],
    assetIds: [],
    vulnerabilityIds: [],
    relationships: buildThreatRelationships([], [], []),
  };
  threats.push(newThreat);
  threatById.set(newThreat.id, newThreat);
  applyCrossEntityLinks(threats);
  notifyThreatListeners();
  return newThreat;
}

export function getThreatById(id: string): MockThreat | undefined {
  return threatById.get(id);
}
