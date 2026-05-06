/**
 * scripts/seed.ts
 *
 * Populates the SQLite database with curated seed data.
 * Safe to run multiple times — all inserts use INSERT OR IGNORE.
 *
 * Run:  npm run seed   (after npm run migrate)
 */

import Database from "better-sqlite3";
import { randomUUID } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath =
  process.env.DB_PATH ?? path.join(__dirname, "..", "data.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log(`Seeding database at: ${dbPath}`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type CriticalityLabel = "Very low" | "Low" | "Medium" | "High" | "Very high";

const CRITICALITY_LABELS: Record<number, CriticalityLabel> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

function critLabel(n: number): CriticalityLabel {
  return CRITICALITY_LABELS[n] as CriticalityLabel;
}

function padId(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(3, "0")}`;
}

// ---------------------------------------------------------------------------
// Asset definitions
// ---------------------------------------------------------------------------

type AssetType =
  | "IT Asset - Hardware"
  | "IT Asset - Software"
  | "IT Asset - Information system"
  | "IT Asset - Cloud";

interface AssetSeed {
  name: string;
  description: string;
  asset_type: AssetType;
  /** 1 = Very low … 5 = Very high */
  criticality: 1 | 2 | 3 | 4 | 5;
}

const ASSETS: AssetSeed[] = [
  // -------------------------------------------------------------------------
  // IT Asset - Hardware  (18 assets)
  // -------------------------------------------------------------------------
  {
    name: "Corporate Data Centre Servers",
    description:
      "On-premises physical server fleet hosting core infrastructure workloads including virtualisation hosts and bare-metal databases.",
    asset_type: "IT Asset - Hardware",
    criticality: 5,
  },
  {
    name: "Perimeter Firewall Appliances",
    description:
      "Next-generation firewall cluster at the internet edge enforcing inbound and outbound traffic policy for all corporate and DMZ zones.",
    asset_type: "IT Asset - Hardware",
    criticality: 5,
  },
  {
    name: "Core Network Switches",
    description:
      "Layer-3 switching fabric connecting server subnets, storage networks, and distribution switches across primary data centre.",
    asset_type: "IT Asset - Hardware",
    criticality: 5,
  },
  {
    name: "Employee Laptop Fleet",
    description:
      "Managed Windows and macOS corporate laptops issued to all full-time employees and approved contractors.",
    asset_type: "IT Asset - Hardware",
    criticality: 3,
  },
  {
    name: "Corporate VPN Gateway Appliances",
    description:
      "SSL/IPsec VPN concentrators providing remote-access connectivity to internal resources for hybrid and remote workers.",
    asset_type: "IT Asset - Hardware",
    criticality: 4,
  },
  {
    name: "Wireless Access Point Infrastructure",
    description:
      "Enterprise Wi-Fi access points deployed across all office floors and campus buildings, managed via central controller.",
    asset_type: "IT Asset - Hardware",
    criticality: 3,
  },
  {
    name: "Internet Edge Routers",
    description:
      "BGP border routers providing multi-homed internet connectivity and peering with upstream transit providers.",
    asset_type: "IT Asset - Hardware",
    criticality: 5,
  },
  {
    name: "Network Load Balancer Appliances",
    description:
      "Hardware ADC/load-balancer cluster distributing inbound application traffic across web and API server tiers.",
    asset_type: "IT Asset - Hardware",
    criticality: 4,
  },
  {
    name: "Hardware Security Module (HSM) Cluster",
    description:
      "FIPS 140-2 Level 3 certified HSMs used for root CA key storage, code signing, and cryptographic offloading.",
    asset_type: "IT Asset - Hardware",
    criticality: 5,
  },
  {
    name: "Uninterruptible Power Supply (UPS) Units",
    description:
      "Rack-mounted UPS systems providing short-term power continuity for critical server and network equipment during outages.",
    asset_type: "IT Asset - Hardware",
    criticality: 4,
  },
  {
    name: "IP Security Camera System",
    description:
      "Network-connected CCTV cameras covering building entrances, server rooms, car parks, and loading bays.",
    asset_type: "IT Asset - Hardware",
    criticality: 3,
  },
  {
    name: "Badge Access Control Hardware",
    description:
      "Electronic door controllers, card readers, and locks restricting physical access to secure zones including data centre and executive floors.",
    asset_type: "IT Asset - Hardware",
    criticality: 4,
  },
  {
    name: "Building Management System Controllers",
    description:
      "Programmable logic controllers managing HVAC, lighting, and environmental conditions in server rooms and offices.",
    asset_type: "IT Asset - Hardware",
    criticality: 3,
  },
  {
    name: "Industrial SCADA Control Hardware",
    description:
      "OT/ICS hardware including PLCs and RTUs managing operational technology in manufacturing and facilities environments.",
    asset_type: "IT Asset - Hardware",
    criticality: 5,
  },
  {
    name: "Point of Sale Terminal Hardware",
    description:
      "PCI-compliant payment terminals and cash registers used in retail branches and canteens, including card readers and receipt printers.",
    asset_type: "IT Asset - Hardware",
    criticality: 4,
  },
  {
    name: "Warehouse Barcode Scanner Fleet",
    description:
      "Handheld and fixed-mount barcode/RFID scanners used in warehouse and logistics operations for inventory tracking.",
    asset_type: "IT Asset - Hardware",
    criticality: 2,
  },
  {
    name: "Environmental Monitoring Sensors",
    description:
      "IoT temperature, humidity, water, and smoke sensors deployed in data centre aisles and critical facilities areas.",
    asset_type: "IT Asset - Hardware",
    criticality: 3,
  },
  {
    name: "Printer and MFP Fleet",
    description:
      "Networked multifunction printers, scanners, and fax devices deployed in offices with managed print service integration.",
    asset_type: "IT Asset - Hardware",
    criticality: 2,
  },

  // -------------------------------------------------------------------------
  // IT Asset - Software  (16 assets)
  // -------------------------------------------------------------------------
  {
    name: "Active Directory Domain Services",
    description:
      "On-premises Microsoft AD providing identity, authentication, and group policy for all domain-joined endpoints and servers.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Endpoint Detection and Response (EDR) Platform",
    description:
      "Agent-based EDR solution deployed to all managed endpoints providing real-time threat detection, isolation, and forensic telemetry.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Security Information and Event Management (SIEM)",
    description:
      "Centralised log aggregation, correlation, and alerting platform ingesting events from network, endpoint, application, and cloud sources.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Patch Management System",
    description:
      "Automated OS and third-party software patching platform covering all Windows, Linux, and macOS endpoints and servers.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "DNS and DHCP Service Software",
    description:
      "Internal recursive DNS resolvers and DHCP servers providing name resolution and IP address management across all network segments.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "Enterprise Antivirus and Anti-Malware Platform",
    description:
      "Signature and behaviour-based malware protection deployed on servers and endpoints with centralised management console.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "Backup and Recovery Software",
    description:
      "Enterprise backup platform scheduling and verifying daily full and incremental backups for servers, databases, and endpoint data.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Mobile Device Management (MDM) Platform",
    description:
      "Unified endpoint management solution enforcing device policy, remote wipe, and application deployment on corporate and BYOD mobile devices.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "Privileged Access Management (PAM) Software",
    description:
      "Secrets vault and session-brokering platform controlling and auditing privileged administrator access to servers and network devices.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Network Access Control (NAC) Software",
    description:
      "Policy engine assessing device posture before granting network admission, enforcing quarantine for non-compliant or unmanaged endpoints.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "Web Application Firewall (WAF) Software",
    description:
      "Reverse-proxy WAF protecting public-facing web applications against OWASP Top 10 attacks, bot abuse, and DDoS layer-7 floods.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "Relational Database Management System (RDBMS)",
    description:
      "Licensed enterprise DBMS (e.g. Oracle, SQL Server) running all transactional and reporting databases for business applications.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Virtual Desktop Infrastructure (VDI) Software",
    description:
      "Hypervisor-based VDI platform delivering persistent and non-persistent virtual desktops to remote and kiosk users.",
    asset_type: "IT Asset - Software",
    criticality: 3,
  },
  {
    name: "Container Orchestration Platform (Kubernetes)",
    description:
      "On-premises Kubernetes cluster hosting containerised microservices and internal developer workloads.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },
  {
    name: "Certificate Authority (PKI) Software",
    description:
      "Internal two-tier PKI issuing TLS, code-signing, and client authentication certificates for all internal systems.",
    asset_type: "IT Asset - Software",
    criticality: 5,
  },
  {
    name: "Data Loss Prevention (DLP) Software",
    description:
      "Content-aware DLP engine monitoring and blocking unauthorised transfer of sensitive data via email, web, and removable media.",
    asset_type: "IT Asset - Software",
    criticality: 4,
  },

  // -------------------------------------------------------------------------
  // IT Asset - Information system  (16 assets)
  // -------------------------------------------------------------------------
  {
    name: "Enterprise Resource Planning (ERP) System",
    description:
      "Core ERP platform (e.g. SAP, Oracle EBS) managing finance, procurement, supply chain, manufacturing, and reporting across the organisation.",
    asset_type: "IT Asset - Information system",
    criticality: 5,
  },
  {
    name: "Customer Relationship Management (CRM) System",
    description:
      "Sales, marketing, and customer service platform managing the full customer lifecycle from lead through renewal and support.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },
  {
    name: "Human Resources Information System (HRIS)",
    description:
      "HR platform maintaining employee master data, organisational structure, performance reviews, and policy acknowledgements.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },
  {
    name: "Payroll Processing System",
    description:
      "Payroll engine calculating and disbursing employee compensation, deductions, and statutory returns for all jurisdictions.",
    asset_type: "IT Asset - Information system",
    criticality: 5,
  },
  {
    name: "Financial Management and Accounting System",
    description:
      "General ledger, accounts payable/receivable, and financial-close platform supporting statutory reporting and audit.",
    asset_type: "IT Asset - Information system",
    criticality: 5,
  },
  {
    name: "Document Management System (DMS)",
    description:
      "Enterprise content management platform storing, versioning, and controlling access to corporate documents and records.",
    asset_type: "IT Asset - Information system",
    criticality: 3,
  },
  {
    name: "Learning Management System (LMS)",
    description:
      "e-Learning platform delivering mandatory compliance training, professional development courses, and certification tracking for all staff.",
    asset_type: "IT Asset - Information system",
    criticality: 2,
  },
  {
    name: "E-Commerce Storefront Platform",
    description:
      "Customer-facing online store processing orders, payments, and returns with integration to ERP inventory and fulfilment systems.",
    asset_type: "IT Asset - Information system",
    criticality: 5,
  },
  {
    name: "Customer Self-Service Portal",
    description:
      "Authenticated web portal allowing customers to view accounts, raise service requests, download invoices, and manage subscriptions.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },
  {
    name: "IT Service Management (ITSM) Platform",
    description:
      "ITIL-aligned platform managing incidents, problems, change requests, service catalogue, and asset relationships.",
    asset_type: "IT Asset - Information system",
    criticality: 3,
  },
  {
    name: "Configuration Management Database (CMDB)",
    description:
      "Authoritative repository of IT configuration items, their attributes, and inter-relationships supporting change impact analysis.",
    asset_type: "IT Asset - Information system",
    criticality: 3,
  },
  {
    name: "Data Warehouse and BI Platform",
    description:
      "Enterprise data warehouse, ETL pipelines, and BI reporting layer consolidating operational data for executive and regulatory reporting.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },
  {
    name: "Contract Lifecycle Management (CLM) System",
    description:
      "End-to-end platform managing contract authoring, negotiation, approval workflows, obligations, and renewals with counterparties.",
    asset_type: "IT Asset - Information system",
    criticality: 3,
  },
  {
    name: "Regulatory Compliance Management System",
    description:
      "GRC platform tracking regulatory obligations, control mappings, evidence collection, and audit-readiness across all frameworks.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },
  {
    name: "Legal Hold and eDiscovery System",
    description:
      "Platform placing custodian data on litigation hold, preserving emails and files, and producing defensible exports for legal proceedings.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },
  {
    name: "Supply Chain Management (SCM) System",
    description:
      "System coordinating supplier onboarding, purchase orders, logistics tracking, and inventory replenishment across the supply network.",
    asset_type: "IT Asset - Information system",
    criticality: 4,
  },

  // -------------------------------------------------------------------------
  // IT Asset - Cloud  (15 assets)
  // -------------------------------------------------------------------------
  {
    name: "Microsoft 365 Tenant (M365)",
    description:
      "Cloud productivity suite including Exchange Online, SharePoint, Teams, OneDrive, and Defender services for all employees.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "AWS Production Cloud Account",
    description:
      "Primary AWS account hosting production workloads including EC2, RDS, S3, EKS, and supporting managed services via landing zone.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "Microsoft Azure / Entra ID Tenant",
    description:
      "Azure Active Directory (Entra ID) providing cloud identity, MFA, conditional access, and SSO for all SaaS applications.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "Salesforce CRM (SaaS)",
    description:
      "Cloud CRM platform hosting customer account data, opportunity pipelines, cases, and marketing campaign execution.",
    asset_type: "IT Asset - Cloud",
    criticality: 4,
  },
  {
    name: "ServiceNow ITSM (SaaS)",
    description:
      "Cloud-hosted ITSM and workflow automation platform managing IT service delivery, HR cases, and operational workflows.",
    asset_type: "IT Asset - Cloud",
    criticality: 3,
  },
  {
    name: "Workday HCM and Finance (SaaS)",
    description:
      "Cloud human capital management and financial management suite covering HR, payroll, expenses, and workforce planning.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "GitHub Enterprise Cloud",
    description:
      "Cloud-hosted source code management and CI/CD platform storing all proprietary application code, infrastructure-as-code, and pipeline configurations.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "Splunk Cloud (SaaS SIEM)",
    description:
      "Cloud SIEM and observability platform ingesting security and operational telemetry, providing SOC detection and investigation capabilities.",
    asset_type: "IT Asset - Cloud",
    criticality: 4,
  },
  {
    name: "Cloudflare CDN and DDoS Mitigation",
    description:
      "Cloud-based content delivery network and volumetric DDoS scrubbing service protecting all internet-facing web properties.",
    asset_type: "IT Asset - Cloud",
    criticality: 4,
  },
  {
    name: "AWS S3 Data Lake",
    description:
      "Centralised cloud object storage lake holding raw, curated, and analytics-ready datasets; source for BI and ML workloads.",
    asset_type: "IT Asset - Cloud",
    criticality: 4,
  },
  {
    name: "Okta Identity Platform (Cloud IdP)",
    description:
      "Cloud identity provider delivering SSO, adaptive MFA, lifecycle management, and API access management for SaaS and internal apps.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "Zscaler Zero Trust Network Access (ZTNA)",
    description:
      "Cloud-delivered ZTNA and secure web gateway replacing legacy VPN, enforcing least-privilege access to applications from any location.",
    asset_type: "IT Asset - Cloud",
    criticality: 4,
  },
  {
    name: "CrowdStrike Falcon (Cloud EDR/XDR)",
    description:
      "Cloud-native EDR/XDR platform providing real-time threat intelligence, device visibility, and automated response across all managed endpoints.",
    asset_type: "IT Asset - Cloud",
    criticality: 5,
  },
  {
    name: "Snowflake Cloud Data Platform",
    description:
      "Multi-cloud data warehousing and sharing platform used for analytics, data science model training, and cross-organisation data exchange.",
    asset_type: "IT Asset - Cloud",
    criticality: 3,
  },
  {
    name: "Azure DevOps (CI/CD Pipelines)",
    description:
      "Cloud-hosted DevOps platform managing build pipelines, release orchestration, test automation, and work item tracking for development teams.",
    asset_type: "IT Asset - Cloud",
    criticality: 4,
  },
];

// ---------------------------------------------------------------------------
// Insert assets
// ---------------------------------------------------------------------------

const insertAsset = db.prepare(`
  INSERT OR IGNORE INTO assets
    (id, display_id, name, description, asset_type, criticality, criticality_label, status)
  VALUES
    (@id, @display_id, @name, @description, @asset_type, @criticality, @criticality_label, @status)
`);

const seedAssets = db.transaction(() => {
  let inserted = 0;
  let skipped = 0;

  ASSETS.forEach((asset, index) => {
    const displayId = padId("AST", index + 1);
    const result = insertAsset.run({
      id: randomUUID(),
      display_id: displayId,
      name: asset.name,
      description: asset.description,
      asset_type: asset.asset_type,
      criticality: asset.criticality,
      criticality_label: critLabel(asset.criticality),
      status: "Active",
    });
    if (result.changes > 0) {
      inserted++;
    } else {
      skipped++;
    }
  });

  return { inserted, skipped };
});

const { inserted, skipped } = seedAssets();
console.log(`Assets: ${inserted} inserted, ${skipped} already existed.`);
console.log("Seed complete.");
db.close();
