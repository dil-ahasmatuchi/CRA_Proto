import { padId } from "./types.js";
import type {
  MockThreat,
  MockThreatAttachment,
  ThreatActor,
  ThreatAttackVector,
  ThreatSource,
  ThreatStatus,
  ThreatDomain,
} from "./types.js";
import { assets } from "./assets.js";
import { vulnerabilities } from "./vulnerabilities.js";
import { users } from "./users.js";

/**
 * 25 library threats with many-to-many links to assets (8–20 assets per threat, 2–5 threats per asset).
 * `applyCrossEntityLinks` syncs asset ↔ vulnerability ↔ threat. Cyber risk / control mirrors are filled later.
 */

type ThreatSeed = {
  title: string;
  sources: ThreatSource[];
  status: ThreatStatus;
  domain: ThreatDomain;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TOTAL_THREAT_ASSET_EDGES = 400;

type FlowEdge = { to: number; rev: number; cap: number };

function addFlowEdge(g: FlowEdge[][], from: number, to: number, cap: number): void {
  const fwd: FlowEdge = { to, rev: g[to].length, cap };
  const back: FlowEdge = { to: from, rev: g[from].length, cap: 0 };
  g[from].push(fwd);
  g[to].push(back);
}

/** Dinic max flow; graph is mutated (residual capacities). */
function dinicMaxFlow(g: FlowEdge[][], s: number, t: number): number {
  const n = g.length;
  let flow = 0;
  const level = new Int32Array(n);
  const ptr = new Int32Array(n);

  const bfs = (): boolean => {
    level.fill(-1);
    level[s] = 0;
    const q: number[] = [s];
    for (let qi = 0; qi < q.length; qi++) {
      const v = q[qi]!;
      for (const e of g[v]) {
        if (e.cap > 0 && level[e.to] < 0) {
          level[e.to] = level[v] + 1;
          q.push(e.to);
        }
      }
    }
    return level[t] >= 0;
  };

  const dfs = (v: number, f: number): number => {
    if (v === t) return f;
    for (; ptr[v]! < g[v].length; ptr[v]!++) {
      const e = g[v][ptr[v]!]!;
      if (e.cap > 0 && level[v]! < level[e.to]!) {
        const ret = dfs(e.to, Math.min(f, e.cap));
        if (ret > 0) {
          e.cap -= ret;
          g[e.to][e.rev]!.cap += ret;
          return ret;
        }
      }
    }
    return 0;
  };

  const INF = 1_000_000_000;
  while (bfs()) {
    ptr.fill(0);
    let pushed: number;
    while ((pushed = dfs(s, INF)) > 0) {
      flow += pushed;
    }
  }
  return flow;
}

/** Start at 16 edges per threat (sum 400); random pairwise transfers keep sum and keep each threat in 8–20. */
function variedThreatDegrees(): number[] {
  const rng = mulberry32(13579);
  const deg = new Array(25).fill(16);
  for (let iter = 0; iter < 400; iter++) {
    const i = Math.floor(rng() * 25);
    const j = Math.floor(rng() * 25);
    if (i === j) continue;
    if (deg[i]! > 8 && deg[j]! < 20) {
      deg[i]!--;
      deg[j]!++;
    } else if (deg[i]! < 20 && deg[j]! > 8) {
      deg[i]!++;
      deg[j]!--;
    }
  }
  const sum = deg.reduce((a, b) => a + b, 0);
  if (sum !== TOTAL_THREAT_ASSET_EDGES) {
    throw new Error(`Threat degree sum ${sum} !== ${TOTAL_THREAT_ASSET_EDGES}`);
  }
  for (const d of deg) {
    if (d < 8 || d > 20) {
      throw new Error(`Threat degree ${d} out of [8,20] range`);
    }
  }
  return deg;
}

/** Asset stubs sum to `totalEdges`; each asset degree in [2, 5]. */
function buildAssetDegrees(totalEdges: number, rng: () => number): number[] {
  const minSum = 300;
  const extra = totalEdges - minSum;
  if (extra < 0 || extra > 150 * 3) {
    throw new Error(`Cannot realize asset degrees for ${totalEdges} edges`);
  }
  const aDeg = new Array(150).fill(2);
  let rem = extra;
  let guard = 0;
  while (rem > 0 && guard < 50_000) {
    guard++;
    const j = Math.floor(rng() * 150);
    if (aDeg[j]! < 5) {
      aDeg[j]!++;
      rem--;
    }
  }
  for (let j = 0; j < 150 && rem > 0; j++) {
    while (aDeg[j]! < 5 && rem > 0) {
      aDeg[j]++;
      rem--;
    }
  }
  if (rem !== 0) {
    throw new Error("Could not assign asset degrees");
  }
  const s = aDeg.reduce((a, b) => a + b, 0);
  if (s !== totalEdges) {
    throw new Error(`Asset degree sum ${s} !== ${totalEdges}`);
  }
  return aDeg;
}

/**
 * Bipartite realization: each threat has 8–20 assets (varied); each asset has 2–5 threats.
 * Total edges fixed at 400. Uses a max-flow construction (simple bipartite graph) so a realization
 * is found whenever the degree sequences admit one (unlike random configuration pairing).
 */
function buildThreatAssetEdges(): Array<[number, number]> {
  const tDeg = variedThreatDegrees();
  const rngDeg = mulberry32(24680);
  const aDeg = buildAssetDegrees(TOTAL_THREAT_ASSET_EDGES, rngDeg);

  const S = 0;
  const T = 26 + 150;
  const n = T + 1;
  const g: FlowEdge[][] = Array.from({ length: n }, () => []);
  const tid = (t: number) => 1 + t;
  const aid = (a: number) => 26 + a;

  for (let t = 0; t < 25; t++) {
    addFlowEdge(g, S, tid(t), tDeg[t]!);
  }
  for (let t = 0; t < 25; t++) {
    for (let a = 0; a < 150; a++) {
      addFlowEdge(g, tid(t), aid(a), 1);
    }
  }
  for (let a = 0; a < 150; a++) {
    addFlowEdge(g, aid(a), T, aDeg[a]!);
  }

  const flow = dinicMaxFlow(g, S, T);
  if (flow !== TOTAL_THREAT_ASSET_EDGES) {
    throw new Error(
      `Threat↔asset max flow ${flow} !== ${TOTAL_THREAT_ASSET_EDGES}; degree sequences may be unrealizable`,
    );
  }

  const edges: Array<[number, number]> = [];
  for (let t = 0; t < 25; t++) {
    const v = tid(t);
    for (const e of g[v]) {
      if (e.to >= 26 && e.to < T && e.cap === 0) {
        edges.push([t, e.to - 26]);
      }
    }
  }
  if (edges.length !== TOTAL_THREAT_ASSET_EDGES) {
    throw new Error(`Expected ${TOTAL_THREAT_ASSET_EDGES} threat↔asset edges, got ${edges.length}`);
  }
  return edges;
}

const LIBRARY_THREATS: ThreatSeed[] = [
  { title: "Account takeover and session abuse", sources: ["Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "Automated credential stuffing campaigns", sources: ["Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "Ransomware and destructive malware", sources: ["Deliberate"], status: "Active", domain: "Endpoint & Device" },
  { title: "Phishing and business email compromise", sources: ["Deliberate"], status: "Active", domain: "People & Workforce" },
  { title: "API abuse and excessive data harvesting", sources: ["Deliberate"], status: "Active", domain: "Application & API" },
  { title: "Distributed denial-of-service attacks", sources: ["Deliberate", "Environmental"], status: "Active", domain: "Network & Infrastructure" },
  { title: "Supply chain and third-party software compromise", sources: ["Accidental", "Deliberate"], status: "Active", domain: "Supply Chain & Third Party" },
  { title: "Cloud misconfiguration and public exposure", sources: ["Accidental"], status: "Active", domain: "Cloud & Virtualisation" },
  { title: "Insider data exfiltration", sources: ["Deliberate"], status: "Active", domain: "Data & Information" },
  { title: "Physical intrusion and device theft", sources: ["Deliberate"], status: "Draft", domain: "Physical & Facilities" },
  { title: "OT and industrial protocol exploitation", sources: ["Deliberate"], status: "Active", domain: "Operational Technology (OT/ICS)" },
  { title: "Cryptojacking and resource hijacking", sources: ["Deliberate"], status: "Active", domain: "Cloud & Virtualisation" },
  { title: "Wireless and rogue access point abuse", sources: ["Deliberate"], status: "Active", domain: "Network & Infrastructure" },
  { title: "SQL injection and injection-style attacks", sources: ["Deliberate"], status: "Active", domain: "Application & API" },
  { title: "Privilege escalation via misconfiguration", sources: ["Accidental", "Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "Data loss through misdelivery and human error", sources: ["Accidental"], status: "Active", domain: "People & Workforce" },
  { title: "Natural disaster and site loss impacting systems", sources: ["Environmental"], status: "Active", domain: "Physical & Facilities" },
  { title: "DNS and routing manipulation", sources: ["Deliberate"], status: "Active", domain: "Network & Infrastructure" },
  { title: "Container escape and host breakout", sources: ["Deliberate"], status: "Draft", domain: "Cloud & Virtualisation" },
  { title: "AI-assisted social engineering at scale", sources: ["Deliberate"], status: "Active", domain: "People & Workforce" },
  { title: "Payment fraud and invoice manipulation", sources: ["Deliberate"], status: "Active", domain: "Application & API" },
  { title: "Legacy protocol and cleartext credential exposure", sources: ["Accidental"], status: "Active", domain: "Network & Infrastructure" },
  { title: "IoT botnet recruitment and lateral movement", sources: ["Deliberate"], status: "Active", domain: "Operational Technology (OT/ICS)" },
  { title: "SaaS tenant isolation failure", sources: ["Accidental"], status: "Draft", domain: "Cloud & Virtualisation" },
  { title: "Nation-state espionage and long dwell time", sources: ["Deliberate"], status: "Active", domain: "Data & Information" },
];

function buildThreatLibraryDescription(
  title: string,
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
    `${title} is a curated enterprise threat category in the ${domain} domain. ` +
    `It describes how loss scenarios can manifest across in-scope assets. ` +
    `Source profile: ${sourceSummary}. Aligned with ISO 27005 / NIST CSF–style libraries.`
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
    "Application & API": ["Web Application & Browser", "Cloud Services & APIs"],
    "Data & Information": ["Insider / Privileged Access Abuse", "Cloud Services & APIs"],
    "Cloud & Virtualisation": ["Cloud Services & APIs", "Supply Chain & Third-Party Software"],
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

function vulnIdsForAssets(assetIds: string[]): string[] {
  const set = new Set<string>();
  const byAsset = new Map<string, string[]>();
  for (const v of vulnerabilities) {
    const aid = v.relationships.assetId;
    const list = byAsset.get(aid) ?? [];
    list.push(v.id);
    byAsset.set(aid, list);
  }
  for (const aid of assetIds) {
    for (const vid of byAsset.get(aid) ?? []) set.add(vid);
  }
  return [...set];
}

function buildThreats(): MockThreat[] {
  const edges = buildThreatAssetEdges();
  const assetIdxByThreat: string[][] = Array.from({ length: 25 }, () => []);

  for (const [ti, ai] of edges) {
    assetIdxByThreat[ti]!.push(assets[ai]!.id);
  }

  const defaultOwnerId = users[0]?.id ?? "USR-001";
  const out: MockThreat[] = [];

  for (let i = 0; i < 25; i++) {
    const seed = LIBRARY_THREATS[i]!;
    const assetIds = [...assetIdxByThreat[i]!].sort();
    const vulnerabilityIds = vulnIdsForAssets(assetIds);
    const seq = i + 1;
    const description = buildThreatLibraryDescription(seed.title, seed.domain, seed.sources);

    out.push({
      id: padId("THR", seq),
      displayId: `T-${String(seq).padStart(4, "0")}`,
      name: seed.title,
      ownerIds: [defaultOwnerId],
      domain: seed.domain,
      description,
      sources: seed.sources,
      threatActors: pickThreatActors(seq, seed.sources),
      attackVectors: pickAttackVectors(seq, seed.domain),
      status: seed.status,
      attachments: mockAttachmentsForSeq(seq),
      cyberRiskIds: [],
      assetIds,
      vulnerabilityIds,
      relationships: buildThreatRelationships([], assetIds, vulnerabilityIds),
    });
  }

  return out;
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
    const aid = v.relationships.assetId;
    const a = assetById.get(aid);
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

const threatsBuilt = buildThreats();

/** Maps assessment seed indices to `THR-###` ids (1-based index). */
export function remapThreatIdFromLegacySequential(legacyIndex: number): string {
  return padId("THR", legacyIndex);
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

export function subscribeThreats(onStoreChange: () => void): () => void {
  threatListeners.add(onStoreChange);
  return () => {
    threatListeners.delete(onStoreChange);
  };
}

export function getThreatsSnapshotVersion(): number {
  return threatsSnapshotVersion;
}

const DEFAULT_NEW_THREAT_DOMAIN: ThreatDomain = "Identity & Access Management";

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
