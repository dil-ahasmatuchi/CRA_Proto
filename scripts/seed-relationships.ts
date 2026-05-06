/**
 * scripts/seed-relationships.ts
 *
 * Seeds the three asset-level junction tables with logically meaningful data:
 *   - asset_threats               (Assets ↔ Threat categories)
 *   - asset_vulnerability_categories  (Assets ↔ Vulnerability categories)
 *   - asset_cyber_risks           (Assets ↔ Cyber risks)
 *
 * Strategy:
 *   1. Base mappings per asset type (4 buckets)
 *   2. Keyword-enrichment per asset name (domain-specific extras)
 *   3. Cross-cutting additions applied to every asset
 *
 * Run:  npm run seed:relations
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
// BASE MAPPINGS BY ASSET TYPE
// ─────────────────────────────────────────────────────────────────────────────

const BASE_THREATS: Record<string, string[]> = {
  "IT Asset - Hardware": [
    "THR-003", // Ransomware and destructive malware
    "THR-006", // DDoS attacks
    "THR-010", // Physical intrusion and device theft
    "THR-017", // Natural disaster / site loss
    "THR-022", // Legacy protocol / cleartext credential exposure
    "THR-027", // Firmware-level ransomware
    "THR-036", // Compromise through counterfeit hardware
    "THR-040", // Polymorphic malware on endpoints
  ],
  "IT Asset - Software": [
    "THR-001", // Account takeover and session abuse
    "THR-003", // Ransomware
    "THR-005", // API abuse and data harvesting
    "THR-007", // Supply chain / third-party software compromise
    "THR-014", // SQL injection and injection-style attacks
    "THR-015", // Privilege escalation via misconfiguration
    "THR-039", // Broken authentication on internet-facing microservices
  ],
  "IT Asset - Information system": [
    "THR-001", // Account takeover
    "THR-004", // Phishing and business email compromise
    "THR-009", // Insider data exfiltration
    "THR-014", // SQL injection
    "THR-016", // Data loss through misdelivery / human error
    "THR-021", // Payment fraud and invoice manipulation
    "THR-025", // Nation-state espionage and long dwell time
    "THR-035", // Failure to meet regulatory breach notification deadlines
    "THR-052", // Theft of trade secrets via departing employees
  ],
  "IT Asset - Cloud": [
    "THR-007", // Supply chain / third-party software compromise
    "THR-008", // Cloud misconfiguration and public exposure
    "THR-009", // Insider data exfiltration
    "THR-012", // Cryptojacking and resource hijacking
    "THR-019", // Container escape and host breakout
    "THR-024", // SaaS tenant isolation failure
    "THR-041", // Illicit cryptomining on VMs
    "THR-043", // OAuth consent phishing and token theft
    "THR-044", // Cloud control-plane API abuse
    "THR-045", // Regional / zone-wide cloud dependency outage
  ],
};

const BASE_VULNS: Record<string, string[]> = {
  "IT Asset - Hardware": [
    "VUL-CAT-010", // Unpatched OS or middleware
    "VUL-CAT-011", // Default or weak system credentials
    "VUL-CAT-012", // Exposed management ports and services
    "VUL-CAT-013", // Absent or misconfigured endpoint detection
  ],
  "IT Asset - Software": [
    "VUL-CAT-001", // SQL injection and input validation failure
    "VUL-CAT-002", // Broken access control and authorization gaps
    "VUL-CAT-003", // Outdated or vulnerable third-party libraries
    "VUL-CAT-004", // Missing or weak multi-factor authentication
    "VUL-CAT-005", // Sensitive data exposure in transit or at rest
  ],
  "IT Asset - Information system": [
    "VUL-CAT-002", // Broken access control and authorization gaps
    "VUL-CAT-006", // Misconfigured database access controls
    "VUL-CAT-007", // Unencrypted data at rest
    "VUL-CAT-008", // Excessive database privilege grants
    "VUL-CAT-009", // Inadequate database audit logging
  ],
  "IT Asset - Cloud": [
    "VUL-CAT-004", // Missing or weak MFA
    "VUL-CAT-018", // Publicly accessible storage buckets
    "VUL-CAT-019", // Over-permissive IAM roles and service accounts
    "VUL-CAT-020", // Disabled or insufficient cloud audit logging
    "VUL-CAT-021", // Unpatched or outdated container images
  ],
};

const BASE_CYBER_RISKS: Record<string, string[]> = {
  "IT Asset - Hardware": [
    "CR-002", // Ransomware and destructive malware across endpoint fleet
    "CR-003", // Network infrastructure compromise and traffic interception
    "CR-007", // Physical theft and environmental damage to IT assets
    "CR-013", // Unpatched vulnerability exploitation and zero-day attack
  ],
  "IT Asset - Software": [
    "CR-001", // Unauthorized privileged access and credential compromise
    "CR-004", // Application-layer attack and API exploitation
    "CR-013", // Unpatched vulnerability exploitation
    "CR-014", // Cryptographic weakness and certificate management failure
    "CR-015", // Security monitoring gap and delayed incident detection
  ],
  "IT Asset - Information system": [
    "CR-001", // Unauthorized privileged access
    "CR-004", // Application-layer attack
    "CR-005", // Sensitive data exfiltration and data breach
    "CR-010", // Social engineering, phishing, and insider threat
    "CR-012", // Regulatory non-compliance and data privacy breach
    "CR-015", // Security monitoring gap
  ],
  "IT Asset - Cloud": [
    "CR-001", // Unauthorized privileged access
    "CR-005", // Sensitive data exfiltration
    "CR-006", // Cloud misconfiguration and unauthorized cloud resource access
    "CR-008", // Third-party software compromise and vendor supply chain attack
    "CR-011", // Denial of service and business continuity disruption
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORD-BASED ENRICHMENT  (pattern matched against asset name, case-insensitive)
// ─────────────────────────────────────────────────────────────────────────────

type KwMap = [RegExp, string[]][];

const KW_THREATS: KwMap = [
  // OT / SCADA
  [/scada|ot\b|industrial|plc\b|ics\b|bms controller|ups manag/i,
    ["THR-011", "THR-023"]],
  // IoT devices, kiosks, handheld, POS
  [/iot|sensor|scanner|kiosk|handheld|point of sale|retail kiosk/i,
    ["THR-023", "THR-027"]],
  // Wireless / Wi-Fi
  [/wireless|wi.?fi|wlan|access point|guest wi.?fi/i,
    ["THR-013", "THR-050"]],
  // Network routing / DNS
  [/dns|dhcp|routing|bgp|mpls|sd.wan|internet edge|core network|perimeter/i,
    ["THR-018", "THR-049", "THR-006"]],
  // Containers / Kubernetes / CI-CD
  [/kubernetes|container|docker|k8s|registry|artifact|ci runner|pipeline|release engineer/i,
    ["THR-019", "THR-037", "THR-048"]],
  // Payment / billing / finance
  [/payment|billing|pos\b|point of sale|payroll|subscription billing|usage meter|tax calc/i,
    ["THR-021", "THR-034"]],
  // Identity / PAM / PKI
  [/active directory|identity|ldap|sso|federation|oauth|privileged|secrets vault|certificate authority|hsm|key management|enterprise password|pam\b/i,
    ["THR-001", "THR-002", "THR-015", "THR-042", "THR-043", "THR-051"]],
  // Email / collaboration
  [/email|mail|spam|exchange|phishing|video conferenc|voip|call manager|contact center|screen sharing/i,
    ["THR-004", "THR-016", "THR-020", "THR-029"]],
  // Databases / data lakes / warehouses
  [/database|data warehouse|data lake|datalake|data science|reporting database|bi report|executive dashboard/i,
    ["THR-009", "THR-014", "THR-046", "THR-058"]],
  // Endpoints / desktops / VDI
  [/endpoint|laptop|workstation|thin client|vdi|mac management|linux standard|remote browser/i,
    ["THR-027", "THR-040", "THR-004"]],
  // Mobile / BYOD
  [/mobile|mdm|byod|visitor management/i,
    ["THR-028", "THR-046"]],
  // CDN / DDoS / WAF / load balancer
  [/cdn|ddos|load balanc|web application firewall|waf|ddos mitigation/i,
    ["THR-006", "THR-030", "THR-031"]],
  // Code / source / CI
  [/code repo|source code|github|code review|sast|feature flag|config.*database|service.*discovery/i,
    ["THR-033", "THR-037", "THR-048"]],
  // Supply chain / vendor
  [/vendor|third.party|supply chain|supplier|procurement|partner portal|sanctions|trade compliance|kyc/i,
    ["THR-007", "THR-036", "THR-048"]],
  // Backup / DR / archive
  [/backup|recovery|disaster|archive|legal hold|audit evidence vault/i,
    ["THR-017", "THR-058", "THR-060"]],
  // Cloud SaaS / CASB / IAM
  [/cloud|saas|casb|cloud access|cloud landing|microsoft 365|m365/i,
    ["THR-008", "THR-044", "THR-054"]],
  // AI / ML / model training
  [/ai\b|machine learn|model train|data science workbench|model|nlp|ocr/i,
    ["THR-047", "THR-046", "THR-025"]],
  // Monitoring / SIEM / SOC / forensics
  [/siem|edr console|ids|ips|forensic|log shipper|metrics|apm|monitoring/i,
    ["THR-060", "THR-009"]],
  // Compliance / privacy
  [/compliance|regulatory|privacy|gdpr|consent|cookie|kyc|sanctions|trade compliance/i,
    ["THR-035", "THR-053", "THR-059"]],
  // VPN / remote access / zero trust
  [/vpn|zero trust|remote access|ztna|bastion/i,
    ["THR-015", "THR-050"]],
];

const KW_VULNS: KwMap = [
  [/scada|ot\b|industrial|plc\b|ics\b|bms controller|ups manag/i,
    ["VUL-CAT-027"]],
  [/iot|sensor|scanner|kiosk|handheld|point of sale|retail kiosk/i,
    ["VUL-CAT-025", "VUL-CAT-026", "VUL-CAT-027"]],
  [/wireless|wi.?fi|wlan|access point|guest wi.?fi/i,
    ["VUL-CAT-015", "VUL-CAT-016"]],
  [/router|switch|firewall|network device|network load|core network|internet edge|perimeter|mpls|sd.wan|nac\b|dns|dhcp/i,
    ["VUL-CAT-014", "VUL-CAT-015", "VUL-CAT-016", "VUL-CAT-017"]],
  [/kubernetes|container|docker|k8s|registry/i,
    ["VUL-CAT-021"]],
  [/endpoint|laptop|workstation|thin client|vdi|mac management|linux/i,
    ["VUL-CAT-022", "VUL-CAT-023", "VUL-CAT-024"]],
  [/mobile|mdm|byod/i,
    ["VUL-CAT-024"]],
  [/database|data warehouse|data lake|datalake|reporting database/i,
    ["VUL-CAT-006", "VUL-CAT-007", "VUL-CAT-008", "VUL-CAT-009"]],
  [/vendor|third.party|supply chain|supplier|procurement/i,
    ["VUL-CAT-029"]],
  [/compliance|regulatory|privacy|gdpr|consent|sanctions/i,
    ["VUL-CAT-029"]],
  [/email|mail|voip|video conferenc|collaboration|screen sharing|file transfer/i,
    ["VUL-CAT-028"]],
  [/cloud|saas|casb|cloud access|microsoft 365|m365|cloud landing/i,
    ["VUL-CAT-018", "VUL-CAT-019", "VUL-CAT-020"]],
  [/identity|ldap|sso|federation|oauth|pam\b|privileged|secrets vault|certificate authority|hsm|key management/i,
    ["VUL-CAT-004", "VUL-CAT-011"]],
];

const KW_CYBER_RISKS: KwMap = [
  [/scada|ot\b|industrial|plc\b|ics\b|bms controller|ups manag/i,
    ["CR-009"]],
  [/iot|sensor|scanner|kiosk|handheld|retail kiosk/i,
    ["CR-009", "CR-007"]],
  [/router|switch|firewall|perimeter|network|dns|dhcp|mpls|sd.wan|internet edge|core network|vpn gateway/i,
    ["CR-003", "CR-011"]],
  [/payment|billing|payroll|subscription billing|point of sale|pos\b/i,
    ["CR-012", "CR-005"]],
  [/active directory|identity|sso|federation|oauth|pam\b|privileged access/i,
    ["CR-001", "CR-010"]],
  [/email|mail|spam|voip|video conferenc|screen sharing|collaboration/i,
    ["CR-010"]],
  [/database|data warehouse|data lake|datalake|reporting database|executive dashboard/i,
    ["CR-005", "CR-015"]],
  [/endpoint|laptop|workstation|thin client|vdi/i,
    ["CR-002"]],
  [/vendor|third.party|supply chain|partner portal|procurement/i,
    ["CR-008"]],
  [/kubernetes|container|docker|k8s|cloud|saas|casb|cloud access|microsoft 365|m365/i,
    ["CR-006"]],
  [/compliance|regulatory|privacy|gdpr|consent|sanctions|kyc/i,
    ["CR-012"]],
  [/physical|camera|cctv|access control|visitor|ups/i,
    ["CR-007"]],
  [/backup|recovery|disaster|archive|legal hold/i,
    ["CR-007", "CR-015"]],
  [/siem|monitoring|edr console|log|metrics|apm|forensic/i,
    ["CR-015"]],
  [/ai\b|machine learn|model train|data science workbench/i,
    ["CR-005"]],
  [/ddos|cdn|load balanc|waf|ddos mitigation/i,
    ["CR-011"]],
  [/certificate authority|hsm|key management|cryptograph|pki/i,
    ["CR-014"]],
];

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-CUTTING (applied to EVERY asset regardless of type or name)
// ─────────────────────────────────────────────────────────────────────────────

const GLOBAL_THREATS = [
  "THR-004", // Phishing and business email compromise
  "THR-016", // Data loss through misdelivery and human error
];

const GLOBAL_VULNS = [
  "VUL-CAT-028", // Insufficient security awareness and training
  "VUL-CAT-030", // Incomplete or untested incident response plan
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function unique(arr: string[]): string[] {
  return [...new Set(arr)];
}

function enrichFromKeywords(name: string, kwMap: KwMap): string[] {
  const extra: string[] = [];
  for (const [pattern, ids] of kwMap) {
    if (pattern.test(name)) extra.push(...ids);
  }
  return extra;
}

function buildRelations(
  assets: { id: string; name: string; asset_type: string }[],
  validThreatIds: Set<string>,
  validVulnIds: Set<string>,
  validRiskIds: Set<string>,
) {
  const threatRows: { asset_id: string; threat_id: string }[] = [];
  const vulnRows: { asset_id: string; vulnerability_category_id: string }[] = [];
  const riskRows: { asset_id: string; cyber_risk_id: string }[] = [];

  for (const asset of assets) {
    const type = asset.asset_type;
    const name = asset.name;

    // Threats
    const threats = unique([
      ...(BASE_THREATS[type] ?? []),
      ...enrichFromKeywords(name, KW_THREATS),
      ...GLOBAL_THREATS,
    ]).filter((id) => validThreatIds.has(id));

    // Vulnerability categories
    const vulns = unique([
      ...(BASE_VULNS[type] ?? []),
      ...enrichFromKeywords(name, KW_VULNS),
      ...GLOBAL_VULNS,
    ]).filter((id) => validVulnIds.has(id));

    // Cyber risks
    const risks = unique([
      ...(BASE_CYBER_RISKS[type] ?? []),
      ...enrichFromKeywords(name, KW_CYBER_RISKS),
    ]).filter((id) => validRiskIds.has(id));

    for (const tid of threats)  threatRows.push({ asset_id: asset.id, threat_id: tid });
    for (const vid of vulns)    vulnRows.push({ asset_id: asset.id, vulnerability_category_id: vid });
    for (const rid of risks)    riskRows.push({ asset_id: asset.id, cyber_risk_id: rid });
  }

  return { threatRows, vulnRows, riskRows };
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────

const seedRelations = db.transaction(() => {
  // Collect valid IDs from DB to guard against stale references
  const validThreatIds   = new Set((db.prepare("SELECT id FROM threats").all() as { id: string }[]).map((r) => r.id));
  const validVulnIds     = new Set((db.prepare("SELECT id FROM vulnerability_categories").all() as { id: string }[]).map((r) => r.id));
  const validRiskIds     = new Set((db.prepare("SELECT id FROM cyber_risks").all() as { id: string }[]).map((r) => r.id));
  const assets           = db.prepare("SELECT id, name, asset_type FROM assets ORDER BY id").all() as { id: string; name: string; asset_type: string }[];

  // Clear existing relationship rows (idempotent re-seed)
  db.exec(`
    DELETE FROM asset_threats;
    DELETE FROM asset_vulnerability_categories;
    DELETE FROM asset_cyber_risks;
  `);

  const { threatRows, vulnRows, riskRows } = buildRelations(assets, validThreatIds, validVulnIds, validRiskIds);

  const insThreat = db.prepare("INSERT OR IGNORE INTO asset_threats (asset_id, threat_id) VALUES (@asset_id, @threat_id)");
  const insVuln   = db.prepare("INSERT OR IGNORE INTO asset_vulnerability_categories (asset_id, vulnerability_category_id) VALUES (@asset_id, @vulnerability_category_id)");
  const insRisk   = db.prepare("INSERT OR IGNORE INTO asset_cyber_risks (asset_id, cyber_risk_id) VALUES (@asset_id, @cyber_risk_id)");

  for (const row of threatRows) insThreat.run(row);
  for (const row of vulnRows)   insVuln.run(row);
  for (const row of riskRows)   insRisk.run(row);

  const avgThreats = (threatRows.length / assets.length).toFixed(1);
  const avgVulns   = (vulnRows.length  / assets.length).toFixed(1);
  const avgRisks   = (riskRows.length  / assets.length).toFixed(1);

  console.log(`  ✓ asset_threats:                ${threatRows.length.toString().padStart(4)} rows  (avg ${avgThreats} per asset)`);
  console.log(`  ✓ asset_vulnerability_categories: ${vulnRows.length.toString().padStart(4)} rows  (avg ${avgVulns} per asset)`);
  console.log(`  ✓ asset_cyber_risks:            ${riskRows.length.toString().padStart(4)} rows  (avg ${avgRisks} per asset)`);
});

console.log("Seeding asset relationships...");
seedRelations();
console.log(`\nDone. Database: ${DB_PATH}`);
db.close();
