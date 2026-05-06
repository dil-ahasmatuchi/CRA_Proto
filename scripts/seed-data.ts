/**
 * Seed script for threats, vulnerability categories, and assets.
 * Clears existing data and repopulates from canonical library.
 *
 * Run: npx tsx scripts/seed-data.ts
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
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function padId(prefix: string, n: number, width = 3): string {
  return `${prefix}-${String(n).padStart(width, "0")}`;
}

const FIVE_POINT_LABELS = ["Very low", "Low", "Medium", "High", "Very high"];
function fivePointLabel(n: number): string {
  return FIVE_POINT_LABELS[n - 1] ?? "Unknown";
}

// ─────────────────────────────────────────────────────────────────────────────
// THREATS
// ─────────────────────────────────────────────────────────────────────────────
type ThreatSeed = { title: string; sources: string[]; status: string; domain: string };

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
  { title: "Loss of devices, storage media, and documents", sources: ["Accidental", "Deliberate"], status: "Active", domain: "Physical & Facilities" },
  { title: "Firmware-level ransomware and pre-encryption persistence", sources: ["Deliberate"], status: "Active", domain: "Endpoint & Device" },
  { title: "SMS and OTT phishing targeting mobile-first users", sources: ["Deliberate"], status: "Active", domain: "People & Workforce" },
  { title: "Voice phishing and callback fraud against service desks", sources: ["Deliberate"], status: "Active", domain: "People & Workforce" },
  { title: "Application-layer denial of service against business APIs", sources: ["Deliberate", "Environmental"], status: "Active", domain: "Application & API" },
  { title: "Resource exhaustion via slow connection and protocol abuse", sources: ["Deliberate"], status: "Active", domain: "Network & Infrastructure" },
  { title: "Unauthorized data exfiltration via removable media", sources: ["Deliberate"], status: "Active", domain: "Data & Information" },
  { title: "Negligent exposure of secrets in public source repositories", sources: ["Accidental"], status: "Active", domain: "People & Workforce" },
  { title: "Invoice and payment fraud via compromised supplier communications", sources: ["Deliberate"], status: "Active", domain: "Application & API" },
  { title: "Failure to meet regulatory breach notification deadlines", sources: ["Accidental", "Environmental"], status: "Active", domain: "Data & Information" },
  { title: "Compromise through counterfeit or substituted hardware", sources: ["Deliberate"], status: "Active", domain: "Supply Chain & Third Party" },
  { title: "Tampered third-party packages in CI/CD pipelines", sources: ["Deliberate"], status: "Active", domain: "Supply Chain & Third Party" },
  { title: "Mass assignment and excessive data exposure in APIs", sources: ["Deliberate", "Accidental"], status: "Active", domain: "Application & API" },
  { title: "Broken authentication on internet-facing microservices", sources: ["Deliberate"], status: "Active", domain: "Application & API" },
  { title: "Polymorphic malware and evasive packers on endpoints", sources: ["Deliberate"], status: "Active", domain: "Endpoint & Device" },
  { title: "Illicit cryptomining on compromised virtual machines", sources: ["Deliberate"], status: "Active", domain: "Cloud & Virtualisation" },
  { title: "Long-lived account takeover after credential or session reuse", sources: ["Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "OAuth consent phishing and token theft for cloud services", sources: ["Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "Cloud control-plane API abuse and quota exhaustion", sources: ["Deliberate"], status: "Active", domain: "Cloud & Virtualisation" },
  { title: "Regional or zone-wide dependency outage of cloud services", sources: ["Environmental", "Accidental"], status: "Active", domain: "Cloud & Virtualisation" },
  { title: "Covert exfiltration via browser extensions and copilot tools", sources: ["Deliberate"], status: "Active", domain: "Data & Information" },
  { title: "Model poisoning and backdoors in training data", sources: ["Deliberate"], status: "Draft", domain: "Application & API" },
  { title: "Supply-chain compromise of open-source dependencies", sources: ["Deliberate", "Accidental"], status: "Active", domain: "Supply Chain & Third Party" },
  { title: "BGP and routing manipulation affecting service reachability", sources: ["Deliberate"], status: "Active", domain: "Network & Infrastructure" },
  { title: "Adversary-in-the-middle on unmanaged guest and public networks", sources: ["Deliberate"], status: "Active", domain: "Network & Infrastructure" },
  { title: "Credential stuffing and password spraying at scale", sources: ["Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "Theft of trade secrets via departing employees and contractors", sources: ["Deliberate"], status: "Active", domain: "Data & Information" },
  { title: "Unauthorized secondary use and resale of personal data", sources: ["Deliberate", "Accidental"], status: "Active", domain: "Data & Information" },
  { title: "Undocumented shadow IT integrations bridging trust zones", sources: ["Accidental"], status: "Active", domain: "Cloud & Virtualisation" },
  { title: "Critical exposure on unpatchable or legacy infrastructure", sources: ["Environmental", "Accidental"], status: "Active", domain: "Network & Infrastructure" },
  { title: "API rate-limit bypass and unsanctioned bulk data export", sources: ["Deliberate"], status: "Active", domain: "Application & API" },
  { title: "Fraudulent onboarding with synthetic identities", sources: ["Deliberate"], status: "Active", domain: "Identity & Access Management" },
  { title: "Long-term bit rot and loss of readable legacy archives", sources: ["Accidental", "Environmental"], status: "Active", domain: "Data & Information" },
  { title: "Improper cross-border transfer without adequate safeguards", sources: ["Accidental", "Deliberate"], status: "Active", domain: "Data & Information" },
  { title: "Inability to produce audit evidence due to logging or clock failures", sources: ["Accidental", "Environmental"], status: "Active", domain: "Application & API" },
];

function pickActors(seq: number, sources: string[]): string[] {
  const pool = [
    "Organised Cybercriminal Group",
    "Nation-State / State-Sponsored Actor",
    "Malicious Insider (employee, contractor)",
    "Hacktivist",
    "Opportunistic / Script Kiddie",
    "Competitor (corporate espionage)",
  ];
  const out = new Set<string>();
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

function pickVectors(seq: number, domain: string): string[] {
  const byDomain: Record<string, string[]> = {
    "Identity & Access Management": ["Insider / Privileged Access Abuse", "Network & Remote Access (VPN, RDP, open ports)"],
    "Endpoint & Device": ["Physical Access & Removable Media", "Email & Messaging (phishing, BEC, malicious attachments)"],
    "Network & Infrastructure": ["Network & Remote Access (VPN, RDP, open ports)", "Wireless & Mobile (Wi-Fi, Bluetooth, SMS)"],
    "Application & API": ["Web Application & Browser", "Cloud Services & APIs"],
    "Data & Information": ["Insider / Privileged Access Abuse", "Cloud Services & APIs"],
    "Cloud & Virtualisation": ["Cloud Services & APIs", "Supply Chain & Third-Party Software"],
    "Physical & Facilities": ["Physical Access & Removable Media"],
    "Supply Chain & Third Party": ["Supply Chain & Third-Party Software", "Email & Messaging (phishing, BEC, malicious attachments)"],
    "Operational Technology (OT/ICS)": ["Operational Technology / Industrial Interfaces", "Network & Remote Access (VPN, RDP, open ports)"],
    "People & Workforce": ["Email & Messaging (phishing, BEC, malicious attachments)", "Social Media & Public Channels"],
  };
  const extra = ["Email & Messaging (phishing, BEC, malicious attachments)", "Web Application & Browser"];
  const primary = byDomain[domain] ?? ["Web Application & Browser", "Network & Remote Access (VPN, RDP, open ports)"];
  return [...new Set([...primary, extra[seq % extra.length]!])];
}

function buildDescription(title: string, domain: string, sources: string[]): string {
  const srcSummary = sources.length === 0
    ? "unspecified source drivers"
    : sources.length === 1
    ? `${sources[0]!.toLowerCase()} drivers`
    : `${sources.map((s) => s.toLowerCase()).join(", ")} drivers`;
  return `${title} is a curated enterprise threat category in the ${domain} domain. It describes how loss scenarios can manifest across in-scope assets. Source profile: ${srcSummary}. Aligned with ISO 27005 / NIST CSF-style libraries.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSETS
// ─────────────────────────────────────────────────────────────────────────────
// Map to the 4 asset type values enforced by the existing schema CHECK constraint
const ASSET_TYPE_MAP: Record<string, string> = {
  Application: "IT Asset - Software",
  Database: "IT Asset - Information system",
  Server: "IT Asset - Hardware",
  "Network device": "IT Asset - Hardware",
  "Cloud service": "IT Asset - Cloud",
  Endpoint: "IT Asset - Hardware",
  "IoT device": "IT Asset - Hardware",
};

const ASSET_TYPES_RAW = ["Application", "Database", "Server", "Network device", "Cloud service", "Endpoint", "IoT device"];

const ASSET_NAMES = [
  "Customer Database Server", "Active Directory Service", "ERP System", "Corporate VPN Gateway",
  "Employee Laptops", "Payment Processing Service", "Microsoft 365 Tenant", "Data Warehouse",
  "Kubernetes Cluster", "Web Application Tier", "DNS and DHCP Services", "SIEM Platform",
  "Backup Vault", "Privileged Access Workstations", "CRM System", "HRIS", "Code Repository",
  "Warehouse Management System", "Access Control System", "SCADA Network Segment", "File Shares",
  "Cloud Landing Zone", "Certificate Authority", "Video Conferencing", "Secrets Vault",
  "Mainframe LPAR", "Mobile Device Management", "API Gateway", "Data Lake", "Perimeter Firewalls",
  "Wireless Controllers", "IT Service Desk Platform", "Vendor Jump Service", "Reporting Database",
  "E-commerce Storefront", "Print Servers", "IoT Sensors", "Disaster Recovery Site",
  "Identity Federation", "Patch Servers", "EDR Console", "Intrusion Detection System",
  "Network Load Balancers", "Bastion Host Farm", "Container Registry", "Artifact Repository",
  "CI Runner Pool", "Test Automation Service", "Staging Web Cluster", "Production Web Cluster",
  "Marketing Website", "Partner Portal", "Customer Portal", "Licensing Server",
  "Antivirus Management", "Email Archiving", "Spam Filter Appliance", "Web Application Firewall",
  "DDoS Mitigation Service", "CDN Edge Nodes", "Internet Edge Routers", "Core Network Switches",
  "Data Center Interconnect", "MPLS Routers", "SD-WAN Orchestrator", "NAC Service",
  "Guest Wi-Fi Portal", "Room Booking System", "Visitor Management Kiosk", "Physical Security Cameras",
  "BMS Controllers", "UPS Management", "Environmental Monitoring", "Network Time Service",
  "IP Address Management", "Network Analytics", "VoIP Call Manager", "Contact Center Platform",
  "Collaboration Rooms", "Screen Sharing Service", "File Transfer Service", "Secure File Exchange",
  "Data Loss Prevention", "Cloud Access Security Broker", "Remote Browser Isolation",
  "Enterprise Password Manager", "Key Management Service", "HSM Cluster", "Log Shipper Pool",
  "Metrics Collection Service", "APM Platform", "Incident Response Toolkit", "Forensic Workstation Pool",
  "Legal Hold Archive", "Records Management System", "Document Management System",
  "Contract Lifecycle System", "Procurement Portal", "Travel and Expense System",
  "Time Tracking System", "Learning Management System", "Benefits Administration", "Payroll Engine",
  "Equity Management Platform", "Investor Relations Website", "Press Release Distribution",
  "Brand Asset Library", "Digital Asset Management", "Product Information Management",
  "Release Engineering Service", "Feature Flag Service", "Configuration Management Database",
  "Service Discovery", "Message Queue Cluster", "Event Streaming Platform",
  "Workflow Orchestration", "RPA Bot Farm", "OCR Document Service", "Translation Service",
  "Customer Data Platform", "Marketing Automation", "Sales Engagement Tool",
  "Subscription Billing Engine", "Usage Metering Service", "Tax Calculation Engine",
  "Fraud Detection Service", "Credit Check Integration", "KYC Verification Service",
  "Sanctions Screening", "Trade Compliance System", "ERP Sandbox Environment",
  "Data Science Workbench", "Model Training Cluster", "BI Reporting Server",
  "Executive Dashboard", "Regulatory Filing Archive", "Audit Evidence Vault",
  "Privacy Request Portal", "Consent Management Platform", "Cookie Compliance Scanner",
  "Endpoint Backup Fleet", "VDI Farm", "Thin Client Pool", "Mac Management Service",
  "Linux Standard Image Build", "Retail Kiosk Fleet", "Point of Sale Terminals",
  "Warehouse Handheld Scanners", "Lab Instruments Network", "Dev Test IoT Devices",
];

// ─────────────────────────────────────────────────────────────────────────────
// VULNERABILITY CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
type VulnCatSeed = {
  name: string;
  description: string;
  domain: string;
  vulnerability_type: string;
  cia_impacts: string[];
};

const VULNERABILITY_CATEGORIES: VulnCatSeed[] = [
  // Application
  { name: "SQL injection and input validation failure", description: "Insufficient sanitization of user-supplied input allows attackers to manipulate backend database queries, potentially reading, modifying, or deleting data.", domain: "Technology", vulnerability_type: "Application Security Defect", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Broken access control and authorization gaps", description: "Incorrectly enforced access controls allow users to act outside their intended permissions, exposing sensitive functionality or data.", domain: "Technology", vulnerability_type: "Authentication and Access Control", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Outdated or vulnerable third-party libraries", description: "Dependency on unpatched open-source or commercial libraries introduces known exploitable vulnerabilities into the application runtime.", domain: "Technology", vulnerability_type: "Patch / Update Management", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Missing or weak multi-factor authentication", description: "Absence of MFA on application login flows allows credential-based attacks (phishing, stuffing) to succeed without a second factor.", domain: "Technology", vulnerability_type: "Authentication and Access Control", cia_impacts: ["Confidentiality"] },
  { name: "Sensitive data exposure in transit or at rest", description: "Failure to encrypt sensitive data using strong, current cryptographic standards leaves data readable if intercepted or accessed without authorization.", domain: "Technology", vulnerability_type: "Cryptographic Weakness", cia_impacts: ["Confidentiality"] },
  // Database
  { name: "Misconfigured database access controls", description: "Overly permissive database user accounts, schemas, or network rules allow unauthorized parties to query or modify sensitive records.", domain: "Technology", vulnerability_type: "Security Configuration", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Unencrypted data at rest", description: "Database files, tablespaces, or backups stored without encryption expose sensitive information if physical or logical access is obtained.", domain: "Technology", vulnerability_type: "Data Protection Weakness", cia_impacts: ["Confidentiality"] },
  { name: "Excessive database privilege grants", description: "Service accounts or user roles with DBA-level or broad table privileges violate least privilege and amplify the blast radius of a compromise.", domain: "Technology", vulnerability_type: "Identity and Privilege Management", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Inadequate database audit logging", description: "Insufficient logging of queries, privilege changes, and failed logins prevents detection of unauthorized access and hinders forensic investigation.", domain: "Technology", vulnerability_type: "Logging, Monitoring and Detection Gap", cia_impacts: ["Confidentiality", "Integrity"] },
  // Server
  { name: "Unpatched operating system or middleware", description: "Failure to apply security patches to the host OS, web servers, or runtime environments leaves publicly disclosed vulnerabilities open to exploitation.", domain: "Technology", vulnerability_type: "Patch / Update Management", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Default or weak system credentials", description: "Servers deployed with factory or weak credentials on admin interfaces, SSH, or management agents are trivially compromised via automated scanning.", domain: "Technology", vulnerability_type: "Authentication and Access Control", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Exposed management ports and services", description: "Administrative services (RDP, SSH, IPMI, iDRAC) accessible from untrusted networks without MFA or allowlisting expand the attack surface significantly.", domain: "Technology", vulnerability_type: "Network Security Weakness", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Absent or misconfigured endpoint detection", description: "Servers lacking EDR, antivirus, or host-based IDS cannot detect or contain malware, ransomware deployment, or lateral movement activity.", domain: "Technology", vulnerability_type: "Logging, Monitoring and Detection Gap", cia_impacts: ["Integrity", "Availability"] },
  // Network device
  { name: "Open management interfaces on network devices", description: "Network equipment (routers, switches, firewalls) with Telnet, HTTP, or SNMP v1/v2 management exposed to untrusted segments can be hijacked or enumerated.", domain: "Technology", vulnerability_type: "Network Security Weakness", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Weak or default SNMP community strings", description: "Using default or guessable SNMP community strings allows attackers to read device configuration data or trigger disruptive operations remotely.", domain: "Technology", vulnerability_type: "Security Configuration", cia_impacts: ["Confidentiality", "Availability"] },
  { name: "Unencrypted network management traffic", description: "Using cleartext protocols (Telnet, HTTP, SNMPv1) for device management allows network-layer interception of credentials and configuration commands.", domain: "Technology", vulnerability_type: "Cryptographic Weakness", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Outdated firmware on network infrastructure", description: "Routers, switches, and firewalls running end-of-life or unpatched firmware expose the network to known, publicly exploited vulnerabilities.", domain: "Technology", vulnerability_type: "Patch / Update Management", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  // Cloud service
  { name: "Publicly accessible storage buckets or containers", description: "Cloud object storage (S3, Blob, GCS) buckets misconfigured with public read or write access expose sensitive data to unauthenticated internet access.", domain: "Technology", vulnerability_type: "Cloud Security Misconfiguration", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Over-permissive IAM roles and service accounts", description: "Cloud identities with wildcard permissions or admin roles assigned to workloads violate least privilege and amplify compromise blast radius.", domain: "Technology", vulnerability_type: "Identity and Privilege Management", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Disabled or insufficient cloud audit logging", description: "Cloud control plane logging (CloudTrail, Audit Logs, Activity Log) disabled or not forwarded to SIEM prevents detection of malicious API calls and configuration changes.", domain: "Technology", vulnerability_type: "Logging, Monitoring and Detection Gap", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Unpatched or outdated container images", description: "Container workloads built on base images with known CVEs run vulnerable code in production, increasing the risk of container escape or data theft.", domain: "Technology", vulnerability_type: "Patch / Update Management", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  // Endpoint
  { name: "Missing full-disk encryption on endpoints", description: "Endpoint devices without BitLocker, FileVault, or equivalent disk encryption expose all stored data if the device is lost, stolen, or physically accessed.", domain: "Technology", vulnerability_type: "Data Protection Weakness", cia_impacts: ["Confidentiality"] },
  { name: "Outdated or disabled antivirus and EDR", description: "Endpoint protection platforms with outdated definitions or disabled real-time protection cannot detect commodity malware, ransomware, or fileless attacks.", domain: "Technology", vulnerability_type: "Patch / Update Management", cia_impacts: ["Integrity", "Availability"] },
  { name: "Unmanaged BYOD and personal device access", description: "Personal devices connecting to corporate resources without MDM enrollment bypass security baselines, creating uncontrolled data egress paths.", domain: "Process", vulnerability_type: "Policy and Governance Gap", cia_impacts: ["Confidentiality"] },
  // IoT device
  { name: "Default credentials on IoT devices", description: "IoT and OT devices shipped with factory-default usernames and passwords that are never changed are trivially compromised by automated internet scanners.", domain: "Technology", vulnerability_type: "Authentication and Access Control", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Unencrypted IoT firmware and update channels", description: "Firmware transmitted or stored without integrity verification and encryption can be tampered with, enabling persistent backdoor implantation.", domain: "Technology", vulnerability_type: "Cryptographic Weakness", cia_impacts: ["Integrity", "Availability"] },
  { name: "Lack of network segmentation for IoT devices", description: "IoT devices sharing the same network segment as critical business systems allow lateral movement if a device is compromised, with no containment boundary.", domain: "Technology", vulnerability_type: "Network Security Weakness", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  // Cross-cutting
  { name: "Insufficient security awareness and training", description: "Staff and contractors without regular, role-specific security training are significantly more susceptible to phishing, social engineering, and policy violations.", domain: "People", vulnerability_type: "Security Awareness and Training Gap", cia_impacts: ["Confidentiality", "Integrity"] },
  { name: "Inadequate third-party and vendor risk management", description: "Suppliers and service providers with access to systems or data are not subject to security assessments, contractual controls, or continuous monitoring.", domain: "Process", vulnerability_type: "Third-Party and Vendor Risk", cia_impacts: ["Confidentiality", "Integrity", "Availability"] },
  { name: "Incomplete or untested incident response plan", description: "Absence of a tested, current incident response plan means the organization cannot coordinate an effective response, prolonging breach impact and recovery time.", domain: "Process", vulnerability_type: "Incident Response Readiness Gap", cia_impacts: ["Availability"] },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED
// ─────────────────────────────────────────────────────────────────────────────
const domainSeverity: Record<string, number> = {
  "Identity & Access Management": 4, "Endpoint & Device": 4, "Network & Infrastructure": 3,
  "Application & API": 4, "Data & Information": 3, "Cloud & Virtualisation": 3,
  "Physical & Facilities": 2, "Supply Chain & Third Party": 3, "Operational Technology (OT/ICS)": 3,
  "People & Workforce": 5,
};

const seedAll = db.transaction(() => {
  // Clear existing junction + entity data (order matters for FK constraints)
  db.exec(`
    DELETE FROM scenario_vulnerability_categories;
    DELETE FROM scenario_threats;
    DELETE FROM threat_attack_vectors;
    DELETE FROM threat_actors;
    DELETE FROM threat_sources;
    DELETE FROM threats;
    DELETE FROM vulnerability_category_cia_impacts;
    DELETE FROM vulnerability_categories;
    DELETE FROM assets;
  `);

  // ── Threats ──────────────────────────────────────────────────────────────
  const insertThreat = db.prepare(`
    INSERT INTO threats (id, display_id, name, domain, description, status, severity_level)
    VALUES (@id, @display_id, @name, @domain, @description, @status, @severity_level)
  `);
  const insertSource = db.prepare("INSERT OR IGNORE INTO threat_sources (threat_id, source_type) VALUES (?, ?)");
  const insertActor = db.prepare("INSERT OR IGNORE INTO threat_actors (threat_id, actor_type) VALUES (?, ?)");
  const insertVector = db.prepare("INSERT OR IGNORE INTO threat_attack_vectors (threat_id, attack_vector) VALUES (?, ?)");

  LIBRARY_THREATS.forEach((t, i) => {
    const seq = i + 1;
    const id = padId("THR", seq);
    insertThreat.run({
      id, display_id: padId("T", seq, 4), name: t.title, domain: t.domain,
      description: buildDescription(t.title, t.domain, t.sources),
      status: t.status, severity_level: domainSeverity[t.domain] ?? 3,
    });
    for (const src of t.sources) insertSource.run(id, src);
    for (const actor of pickActors(seq, t.sources)) insertActor.run(id, actor);
    for (const vec of pickVectors(seq, t.domain)) insertVector.run(id, vec);
  });
  console.log(`  ✓ ${LIBRARY_THREATS.length} threats seeded`);

  // ── Vulnerability Categories ──────────────────────────────────────────────
  const insertVulnCat = db.prepare(`
    INSERT INTO vulnerability_categories (id, display_id, name, description, domain, vulnerability_type, status)
    VALUES (@id, @display_id, @name, @description, @domain, @vulnerability_type, @status)
  `);
  const insertCIA = db.prepare("INSERT OR IGNORE INTO vulnerability_category_cia_impacts (vulnerability_category_id, cia_impact) VALUES (?, ?)");

  VULNERABILITY_CATEGORIES.forEach((v, i) => {
    const id = padId("VUL-CAT", i + 1);
    insertVulnCat.run({ id, display_id: id, name: v.name, description: v.description, domain: v.domain, vulnerability_type: v.vulnerability_type, status: "Active" });
    for (const cia of v.cia_impacts) insertCIA.run(id, cia);
  });
  console.log(`  ✓ ${VULNERABILITY_CATEGORIES.length} vulnerability categories seeded`);

  // ── Assets ────────────────────────────────────────────────────────────────
  const insertAsset = db.prepare(`
    INSERT INTO assets (id, display_id, name, asset_type, criticality, criticality_label, status)
    VALUES (@id, @display_id, @name, @asset_type, @criticality, @criticality_label, @status)
  `);

  ASSET_NAMES.forEach((name, i) => {
    const id = padId("AST", i + 1);
    const criticality = 2 + (i % 4);
    const rawType = ASSET_TYPES_RAW[i % ASSET_TYPES_RAW.length]!;
    const asset_type = ASSET_TYPE_MAP[rawType]!;
    insertAsset.run({
      id, display_id: id, name,
      asset_type,
      criticality, criticality_label: fivePointLabel(criticality),
      status: i % 23 === 0 ? "Inactive" : "Active",
    });
  });
  console.log(`  ✓ ${ASSET_NAMES.length} assets seeded`);
});

console.log("Seeding database...");
seedAll();
console.log(`\nDone. Database: ${DB_PATH}`);
db.close();
