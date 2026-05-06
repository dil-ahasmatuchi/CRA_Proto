/**
 * Seed Cyber Risks — 15 domain-based risks aligned to IT asset context.
 * Run: npx tsx scripts/seed-cyber-risks.ts
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function padId(prefix: string, n: number, width = 3): string {
  return `${prefix}-${String(n).padStart(width, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CYBER RISKS
// One risk per major threat domain, grounded in IT asset context.
// Each links to the asset types most exposed to that domain.
// Status lifecycle reflects a realistic spread across the risk register.
// ─────────────────────────────────────────────────────────────────────────────
type RiskSeed = {
  name: string;
  domain: string;
  description: string;
  status: "Draft" | "Identification" | "Assessment" | "Mitigation" | "Monitoring";
  primaryAssetTypes: string[];  // informational — links established via Scenarios
};

const CYBER_RISKS: RiskSeed[] = [
  // ── Identity & Access Management ──────────────────────────────────────────
  {
    name: "Unauthorized privileged access and credential compromise",
    domain: "Identity & Access Management",
    description:
      "Risk that threat actors gain unauthorized access to privileged accounts, admin consoles, or sensitive systems through credential theft, stuffing, or abuse of identity and access management weaknesses. Affects all asset types that authenticate users or services.",
    status: "Monitoring",
    primaryAssetTypes: ["IT Asset - Software", "IT Asset - Information system", "IT Asset - Cloud"],
  },

  // ── Endpoint & Device ─────────────────────────────────────────────────────
  {
    name: "Ransomware and destructive malware across endpoint fleet",
    domain: "Endpoint & Device",
    description:
      "Risk that ransomware or wiper malware encrypts or destroys data and systems across the enterprise endpoint and server estate, causing business disruption, data loss, and costly recovery. Hardware-based assets (servers, laptops, workstations) are the primary targets.",
    status: "Mitigation",
    primaryAssetTypes: ["IT Asset - Hardware"],
  },

  // ── Network & Infrastructure ──────────────────────────────────────────────
  {
    name: "Network infrastructure compromise and traffic interception",
    domain: "Network & Infrastructure",
    description:
      "Risk that network devices (routers, switches, firewalls, VPN gateways) are compromised through exploitation of management interfaces, weak credentials, or unpatched firmware — enabling traffic interception, lateral movement, or service disruption.",
    status: "Assessment",
    primaryAssetTypes: ["IT Asset - Hardware"],
  },

  // ── Application & API ─────────────────────────────────────────────────────
  {
    name: "Application-layer attack and API exploitation",
    domain: "Application & API",
    description:
      "Risk that internet-facing or internal applications and APIs are exploited through injection attacks, broken authentication, excessive data exposure, or insecure design — enabling unauthorized data access, account takeover, or business logic abuse.",
    status: "Monitoring",
    primaryAssetTypes: ["IT Asset - Software"],
  },

  // ── Data & Information ────────────────────────────────────────────────────
  {
    name: "Sensitive data exfiltration and data breach",
    domain: "Data & Information",
    description:
      "Risk that confidential, regulated, or business-critical data is exfiltrated by external attackers or malicious insiders through compromised systems, misconfigured storage, or inadequate data loss prevention controls. Affects databases, data lakes, and cloud repositories.",
    status: "Mitigation",
    primaryAssetTypes: ["IT Asset - Information system", "IT Asset - Cloud"],
  },

  // ── Cloud & Virtualisation ────────────────────────────────────────────────
  {
    name: "Cloud misconfiguration and unauthorized cloud resource access",
    domain: "Cloud & Virtualisation",
    description:
      "Risk that misconfigured cloud services — including overly permissive IAM roles, publicly exposed storage buckets, disabled audit logging, or unpatched container images — allow unauthorized parties to access, modify, or disrupt cloud-hosted workloads and data.",
    status: "Assessment",
    primaryAssetTypes: ["IT Asset - Cloud"],
  },

  // ── Physical & Facilities ──────────────────────────────────────────────────
  {
    name: "Physical theft and environmental damage to IT assets",
    domain: "Physical & Facilities",
    description:
      "Risk that IT hardware (laptops, servers, removable media, access control systems) is physically stolen, tampered with, or destroyed — or that environmental events (fire, flood, power failure) cause irreversible damage to on-premise systems and data.",
    status: "Identification",
    primaryAssetTypes: ["IT Asset - Hardware"],
  },

  // ── Supply Chain & Third Party ─────────────────────────────────────────────
  {
    name: "Third-party software compromise and vendor supply chain attack",
    domain: "Supply Chain & Third Party",
    description:
      "Risk that malicious code or backdoors are introduced through compromised third-party software libraries, SaaS integrations, or managed service provider access — propagating into the organization's software, cloud, and on-premise environments without detection.",
    status: "Identification",
    primaryAssetTypes: ["IT Asset - Software", "IT Asset - Cloud"],
  },

  // ── Operational Technology (OT/ICS) ───────────────────────────────────────
  {
    name: "OT and industrial control system disruption",
    domain: "Operational Technology (OT/ICS)",
    description:
      "Risk that operational technology systems — including SCADA, industrial control systems, IoT sensors, and building management systems — are compromised or disrupted through network-reachable interfaces, resulting in physical process failures or safety incidents.",
    status: "Draft",
    primaryAssetTypes: ["IT Asset - Hardware"],
  },

  // ── People & Workforce ─────────────────────────────────────────────────────
  {
    name: "Social engineering, phishing, and insider threat",
    domain: "People & Workforce",
    description:
      "Risk that employees, contractors, or service desk staff are manipulated through phishing, vishing, or AI-enhanced social engineering into disclosing credentials, approving fraudulent transactions, or installing malicious software — or that malicious insiders deliberately exfiltrate data.",
    status: "Monitoring",
    primaryAssetTypes: ["IT Asset - Software", "IT Asset - Hardware", "IT Asset - Cloud"],
  },

  // ── Cross-cutting risks ────────────────────────────────────────────────────
  {
    name: "Denial of service and business continuity disruption",
    domain: "Network & Infrastructure",
    description:
      "Risk that volumetric or application-layer denial-of-service attacks, ransomware-induced outages, or infrastructure failures render critical IT services unavailable — disrupting business operations, breaching SLA commitments, and causing reputational or financial harm.",
    status: "Mitigation",
    primaryAssetTypes: ["IT Asset - Software", "IT Asset - Cloud", "IT Asset - Hardware"],
  },

  {
    name: "Regulatory non-compliance and data privacy breach",
    domain: "Data & Information",
    description:
      "Risk that the organization fails to comply with data protection regulations (GDPR, CCPA, HIPAA, PCI-DSS) due to inadequate controls over personal data, insufficient breach notification processes, or inability to evidence compliance — resulting in regulatory fines and reputational damage.",
    status: "Monitoring",
    primaryAssetTypes: ["IT Asset - Information system", "IT Asset - Cloud", "IT Asset - Software"],
  },

  {
    name: "Unpatched vulnerability exploitation and zero-day attack",
    domain: "Endpoint & Device",
    description:
      "Risk that attackers exploit known unpatched vulnerabilities or undisclosed zero-day weaknesses in operating systems, middleware, or applications across the asset estate — enabling initial access, privilege escalation, or lateral movement before patches are available or deployed.",
    status: "Mitigation",
    primaryAssetTypes: ["IT Asset - Hardware", "IT Asset - Software"],
  },

  {
    name: "Cryptographic weakness and certificate management failure",
    domain: "Application & API",
    description:
      "Risk that weak encryption algorithms, hardcoded secrets, expired certificates, or poorly managed cryptographic keys are exploited to decrypt sensitive communications, forge authentication tokens, or conduct man-in-the-middle attacks against internal and external systems.",
    status: "Identification",
    primaryAssetTypes: ["IT Asset - Software", "IT Asset - Information system"],
  },

  {
    name: "Security monitoring gap and delayed incident detection",
    domain: "Data & Information",
    description:
      "Risk that insufficient logging, SIEM coverage, or alerting capabilities mean that active compromises, data exfiltration, or policy violations go undetected for extended periods — increasing breach impact, dwell time, and regulatory exposure.",
    status: "Assessment",
    primaryAssetTypes: ["IT Asset - Software", "IT Asset - Cloud", "IT Asset - Hardware"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────
const seedRisks = db.transaction(() => {
  // Remove existing (safe to re-run — scenarios depend on these but are empty)
  db.prepare("DELETE FROM cyber_risks").run();

  const insert = db.prepare(`
    INSERT INTO cyber_risks (id, display_id, name, domain, description, status)
    VALUES (@id, @display_id, @name, @domain, @description, @status)
  `);

  CYBER_RISKS.forEach((r, i) => {
    const id = padId("CR", i + 1);
    insert.run({
      id,
      display_id: id,
      name: r.name,
      domain: r.domain,
      description: r.description,
      status: r.status,
    });
  });
});

console.log("Seeding cyber risks...");
seedRisks();

const counts = db.prepare(`
  SELECT
    status,
    COUNT(*) as count
  FROM cyber_risks
  GROUP BY status
  ORDER BY status
`).all() as { status: string; count: number }[];

console.log(`\n  ✓ ${CYBER_RISKS.length} cyber risks seeded`);
console.log("\n  Status breakdown:");
for (const row of counts) {
  console.log(`    ${row.status.padEnd(16)} ${row.count}`);
}
console.log(`\nDone. Database: ${DB_PATH}`);
db.close();
