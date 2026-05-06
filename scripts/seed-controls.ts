/**
 * Seed: Controls + Cyber Risk Scores
 *
 * 1. Updates 15 cyber risks with inherent/residual scores (1–5 scale)
 * 2. Seeds 35 curated controls with realistic links to:
 *    - Cyber risks they mitigate
 *    - Asset types they apply to (resolved to actual asset IDs from DB)
 *
 * Run: npx tsx scripts/seed-controls.ts
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

const SCORE_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

// ---------------------------------------------------------------------------
// Step 1: Update cyber_risks with inherent / residual scores
// ---------------------------------------------------------------------------
const RISK_SCORES: Array<{
  display_id: string;
  inherent: number;
  residual: number;
}> = [
  { display_id: "CR-001", inherent: 5, residual: 3 }, // Unauthorised privileged access
  { display_id: "CR-002", inherent: 5, residual: 3 }, // Ransomware / destructive malware
  { display_id: "CR-003", inherent: 4, residual: 2 }, // Network / remote-access compromise
  { display_id: "CR-004", inherent: 4, residual: 3 }, // Application & API attack
  { display_id: "CR-005", inherent: 5, residual: 3 }, // Sensitive data exfiltration
  { display_id: "CR-006", inherent: 4, residual: 2 }, // Cloud misconfiguration & over-privilege
  { display_id: "CR-007", inherent: 3, residual: 2 }, // Physical asset theft / tampering
  { display_id: "CR-008", inherent: 4, residual: 3 }, // Supply-chain & third-party attack
  { display_id: "CR-009", inherent: 3, residual: 2 }, // OT / ICS / IoT disruption
  { display_id: "CR-010", inherent: 5, residual: 3 }, // Social engineering & insider threat
  { display_id: "CR-011", inherent: 4, residual: 3 }, // Denial-of-service / business continuity
  { display_id: "CR-012", inherent: 3, residual: 2 }, // Regulatory & privacy non-compliance
  { display_id: "CR-013", inherent: 4, residual: 2 }, // Unpatched vulnerabilities & technical debt
  { display_id: "CR-014", inherent: 3, residual: 2 }, // Cryptographic weakness & key mismanagement
  { display_id: "CR-015", inherent: 3, residual: 2 }, // Security monitoring gap
];

const updateRiskScore = db.prepare(`
  UPDATE cyber_risks
  SET inherent_score = @inherent,
      inherent_score_label = @inherent_label,
      residual_score = @residual,
      residual_score_label = @residual_label
  WHERE display_id = @display_id
`);

const updateScores = db.transaction(() => {
  for (const r of RISK_SCORES) {
    const changes = updateRiskScore.run({
      display_id: r.display_id,
      inherent: r.inherent,
      inherent_label: SCORE_LABELS[r.inherent],
      residual: r.residual,
      residual_label: SCORE_LABELS[r.residual],
    });
    if (changes.changes === 0) {
      console.warn(`  ⚠  No row found for ${r.display_id}`);
    }
  }
});

updateScores();
console.log(`  ✓ Cyber risk scores updated (${RISK_SCORES.length} rows)`);

// ---------------------------------------------------------------------------
// Step 2: Resolve asset IDs by type
// ---------------------------------------------------------------------------
const assetsByType = (
  db
    .prepare(
      "SELECT id, asset_type FROM assets WHERE status != 'Decommissioned'"
    )
    .all() as { id: string; asset_type: string }[]
).reduce<Record<string, string[]>>((acc, row) => {
  const key = row.asset_type.replace("IT Asset - ", "").toLowerCase(); // software, hardware, cloud, information system
  (acc[key] ??= []).push(row.id);
  return acc;
}, {});

/** Pick up to `n` asset IDs for the given type labels */
function pickAssets(typeKeys: string[], n: number): string[] {
  const ids: string[] = [];
  for (const key of typeKeys) {
    const pool = assetsByType[key] ?? [];
    for (let i = 0; i < pool.length && ids.length < n; i++) {
      ids.push(pool[i]!);
    }
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Step 3: Control definitions
// Each control specifies which cyber risks it mitigates (by display_id)
// and which asset type keys map to relevant assets.
// ---------------------------------------------------------------------------
const CONTROLS_DEF = [
  {
    name: "Multi-factor authentication",
    description: "Require a second authentication factor for all privileged and remote access.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-001", "CR-004", "CR-010"],
    assetTypes: ["software", "cloud"],
  },
  {
    name: "Privileged access management",
    description: "Vault, rotate, and audit all privileged credentials via a PAM solution.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-001", "CR-005", "CR-010"],
    assetTypes: ["software", "hardware"],
  },
  {
    name: "Identity governance and access certification",
    description: "Quarterly access reviews to revoke stale or excessive permissions.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Quarterly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-001", "CR-006", "CR-012"],
    assetTypes: ["software", "cloud"],
  },
  {
    name: "Endpoint detection and response",
    description: "Deploy EDR agents on all endpoints to detect and contain malware in real time.",
    control_type: "Detective",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-002", "CR-013"],
    assetTypes: ["hardware"],
  },
  {
    name: "Patch management program",
    description: "Apply OS and application patches within SLA: critical within 72 hours, high within 14 days.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Weekly",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-002", "CR-013", "CR-004"],
    assetTypes: ["hardware", "software"],
  },
  {
    name: "Backup and recovery testing",
    description: "Take daily encrypted backups and test restore procedures monthly.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Monthly",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-002", "CR-011"],
    assetTypes: ["hardware", "information system"],
  },
  {
    name: "Network segmentation and micro-segmentation",
    description: "Isolate network zones so a compromise in one cannot propagate laterally.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-003", "CR-009", "CR-011"],
    assetTypes: ["hardware"],
  },
  {
    name: "VPN and zero trust network access",
    description: "Enforce device posture checks before granting remote access via zero trust gateway.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-003", "CR-001"],
    assetTypes: ["hardware", "cloud"],
  },
  {
    name: "Network intrusion detection and prevention",
    description: "Deploy IDS/IPS at network perimeter and core switches to detect anomalous traffic.",
    control_type: "Detective",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-003", "CR-011"],
    assetTypes: ["hardware"],
  },
  {
    name: "DNS security filtering",
    description: "Block malicious domains at the DNS layer before connections are established.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 3,
    status: "Active",
    risks: ["CR-003", "CR-002"],
    assetTypes: ["hardware"],
  },
  {
    name: "Web application firewall",
    description: "Filter and monitor HTTP traffic to protect applications from OWASP Top 10 attacks.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-004"],
    assetTypes: ["software"],
  },
  {
    name: "Secure code review and SAST",
    description: "Run static analysis on every pull request and conduct peer code reviews.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Weekly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-004", "CR-014"],
    assetTypes: ["software"],
  },
  {
    name: "API gateway with rate limiting",
    description: "Route all API traffic through a gateway enforcing auth, rate limits, and schema validation.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-004", "CR-005"],
    assetTypes: ["software", "cloud"],
  },
  {
    name: "Data loss prevention",
    description: "Monitor and block unauthorised transfer of sensitive data across endpoints, email, and cloud.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-005", "CR-012"],
    assetTypes: ["cloud", "information system"],
  },
  {
    name: "Data encryption at rest and in transit",
    description: "Encrypt sensitive data using AES-256 at rest and TLS 1.2+ in transit.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-005", "CR-012", "CR-014"],
    assetTypes: ["information system", "cloud"],
  },
  {
    name: "Database activity monitoring",
    description: "Log and alert on abnormal database queries, bulk exports, and privileged access.",
    control_type: "Detective",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-005", "CR-001"],
    assetTypes: ["information system"],
  },
  {
    name: "Cloud security posture management",
    description: "Continuously scan cloud configurations against CIS benchmarks and auto-remediate drifts.",
    control_type: "Detective",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-006", "CR-005"],
    assetTypes: ["cloud"],
  },
  {
    name: "Cloud access security broker",
    description: "Enforce data security policies and visibility for cloud applications accessed by users.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-006", "CR-005"],
    assetTypes: ["cloud"],
  },
  {
    name: "Container image scanning",
    description: "Scan container images in CI/CD pipeline for vulnerabilities and enforce admission policies.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Weekly",
    effectiveness: 3,
    status: "Active",
    risks: ["CR-006", "CR-013"],
    assetTypes: ["cloud", "software"],
  },
  {
    name: "Physical access control and CCTV",
    description: "Restrict data-centre access with badge readers and monitor with CCTV reviewed weekly.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-007"],
    assetTypes: ["hardware"],
  },
  {
    name: "Mobile device management",
    description: "Enrol corporate and BYOD devices in MDM to enforce encryption and remote-wipe capability.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-007", "CR-002"],
    assetTypes: ["hardware"],
  },
  {
    name: "Third-party vendor risk assessment",
    description: "Perform security questionnaires and audits for critical vendors annually.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Annually",
    effectiveness: 3,
    status: "Active",
    risks: ["CR-008", "CR-012"],
    assetTypes: ["software", "cloud"],
  },
  {
    name: "Software supply chain verification",
    description: "Verify software integrity via checksums and SBOM for all third-party components.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Weekly",
    effectiveness: 3,
    status: "Active",
    risks: ["CR-008", "CR-013"],
    assetTypes: ["software"],
  },
  {
    name: "OT/ICS network isolation",
    description: "Air-gap or strictly firewall OT networks; prohibit direct internet connectivity.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-009"],
    assetTypes: ["hardware"],
  },
  {
    name: "Security awareness and phishing simulation",
    description: "Monthly simulated phishing exercises and mandatory annual security awareness training.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Monthly",
    effectiveness: 3,
    status: "Active",
    risks: ["CR-010", "CR-002"],
    assetTypes: ["software", "hardware"],
  },
  {
    name: "Email filtering and anti-phishing",
    description: "Block malicious emails using SPF/DKIM/DMARC plus AI-based phishing detection.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-010"],
    assetTypes: ["software", "hardware"],
  },
  {
    name: "User and entity behaviour analytics",
    description: "Detect anomalous insider behaviour by baselining and alerting on UEBA deviations.",
    control_type: "Detective",
    key_control: false,
    control_frequency: "Continuous",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-010", "CR-005"],
    assetTypes: ["software", "cloud"],
  },
  {
    name: "Disaster recovery planning and testing",
    description: "Maintain and test DR playbooks bi-annually to meet RTO/RPO targets.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Bi-weekly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-011", "CR-007"],
    assetTypes: ["hardware", "information system"],
  },
  {
    name: "Business continuity management",
    description: "Define and exercise BCP across critical functions; integrate with DR planning.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Annually",
    effectiveness: 3,
    status: "Active",
    risks: ["CR-011"],
    assetTypes: ["information system", "cloud"],
  },
  {
    name: "Privacy and data governance program",
    description: "Maintain a data inventory, DPIA process, and enforce data retention / deletion policies.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Quarterly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-012", "CR-005"],
    assetTypes: ["information system"],
  },
  {
    name: "Vulnerability management and scanning",
    description: "Run authenticated vulnerability scans weekly; prioritise remediation by CVSS severity.",
    control_type: "Detective",
    key_control: true,
    control_frequency: "Weekly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-013", "CR-006"],
    assetTypes: ["hardware", "software", "cloud"],
  },
  {
    name: "Certificate lifecycle management",
    description: "Auto-renew TLS certificates and alert 30 days before expiry; prohibit SHA-1/RC4.",
    control_type: "Preventive",
    key_control: false,
    control_frequency: "Monthly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-014"],
    assetTypes: ["software", "cloud"],
  },
  {
    name: "Cryptographic standards and key rotation",
    description: "Enforce AES-256, RSA-2048+, rotate encryption keys annually and on staff departure.",
    control_type: "Preventive",
    key_control: true,
    control_frequency: "Annually",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-014"],
    assetTypes: ["information system", "cloud"],
  },
  {
    name: "SIEM and SOC monitoring",
    description: "Aggregate logs into SIEM; SOC analysts investigate high/critical alerts within 1 hour.",
    control_type: "Detective",
    key_control: true,
    control_frequency: "Continuous",
    effectiveness: 5,
    status: "Active",
    risks: ["CR-015", "CR-005", "CR-003"],
    assetTypes: ["hardware", "software", "cloud"],
  },
  {
    name: "Incident response plan and tabletop exercises",
    description: "Maintain IR playbooks per scenario type; run tabletop exercises quarterly.",
    control_type: "Detective",
    key_control: true,
    control_frequency: "Quarterly",
    effectiveness: 4,
    status: "Active",
    risks: ["CR-015", "CR-002", "CR-011"],
    assetTypes: ["hardware", "software", "information system", "cloud"],
  },
] as const;

// ---------------------------------------------------------------------------
// Step 4: Resolve cyber risk IDs (display_id → id)
// ---------------------------------------------------------------------------
const riskRows = db
  .prepare("SELECT id, display_id FROM cyber_risks")
  .all() as { id: string; display_id: string }[];

const riskIdByDisplayId = new Map(riskRows.map((r) => [r.display_id, r.id]));

// ---------------------------------------------------------------------------
// Step 5: Seed controls
// ---------------------------------------------------------------------------
const insertControl = db.prepare(`
  INSERT INTO controls (id, display_id, name, description, control_type, key_control,
    control_frequency, effectiveness, effectiveness_label, status)
  VALUES (@id, @display_id, @name, @description, @control_type, @key_control,
    @control_frequency, @effectiveness, @effectiveness_label, @status)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    description = excluded.description,
    control_type = excluded.control_type,
    key_control = excluded.key_control,
    control_frequency = excluded.control_frequency,
    effectiveness = excluded.effectiveness,
    effectiveness_label = excluded.effectiveness_label,
    status = excluded.status
`);

const insertControlRisk = db.prepare(`
  INSERT OR IGNORE INTO control_cyber_risks (control_id, cyber_risk_id)
  VALUES (@control_id, @cyber_risk_id)
`);

const insertControlAsset = db.prepare(`
  INSERT OR IGNORE INTO control_assets (control_id, asset_id)
  VALUES (@control_id, @asset_id)
`);

const seedAll = db.transaction(() => {
  // Clear existing control links first so we can re-seed cleanly
  db.prepare("DELETE FROM control_cyber_risks").run();
  db.prepare("DELETE FROM control_assets").run();
  db.prepare("DELETE FROM controls").run();

  let controlNum = 1;
  for (const def of CONTROLS_DEF) {
    const id = pad("CTL", controlNum);
    const display_id = id;

    insertControl.run({
      id,
      display_id,
      name: def.name,
      description: def.description,
      control_type: def.control_type,
      key_control: def.key_control ? 1 : 0,
      control_frequency: def.control_frequency,
      effectiveness: def.effectiveness,
      effectiveness_label: SCORE_LABELS[def.effectiveness],
      status: def.status,
    });

    // Link to cyber risks
    for (const displayId of def.risks) {
      const riskId = riskIdByDisplayId.get(displayId);
      if (riskId) {
        insertControlRisk.run({ control_id: id, cyber_risk_id: riskId });
      } else {
        console.warn(`  ⚠  Risk not found: ${displayId} (for control ${id})`);
      }
    }

    // Link to assets (sample first 5 assets per type)
    const assetIds = pickAssets(def.assetTypes as unknown as string[], 5);
    for (const assetId of assetIds) {
      insertControlAsset.run({ control_id: id, asset_id: assetId });
    }

    controlNum++;
  }
});

seedAll();

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------
const counts = {
  controls: (db.prepare("SELECT COUNT(*) as n FROM controls").get() as { n: number }).n,
  control_cyber_risks: (
    db.prepare("SELECT COUNT(*) as n FROM control_cyber_risks").get() as { n: number }
  ).n,
  control_assets: (db.prepare("SELECT COUNT(*) as n FROM control_assets").get() as { n: number })
    .n,
  risks_with_scores: (
    db
      .prepare("SELECT COUNT(*) as n FROM cyber_risks WHERE inherent_score IS NOT NULL")
      .get() as { n: number }
  ).n,
};

console.log(`\n  Controls seeded       : ${counts.controls}`);
console.log(`  Control ↔ Risk links  : ${counts.control_cyber_risks}`);
console.log(`  Control ↔ Asset links : ${counts.control_assets}`);
console.log(`  Risks with scores     : ${counts.risks_with_scores}`);
console.log("\nSeed controls complete.");
db.close();
