export type CraRagKey = "neg05" | "neg03" | "neu03" | "pos04" | "pos05";

export type CraScoreValue = {
  numeric: string;
  label: string;
  rag: CraRagKey;
} | null;

export type CraTitleSegment = { text: string; emphasize?: boolean };

export type CraScoringGroupId = "rw" | "ph" | "dd" | "ie";

export type CraScenarioDefinition = {
  id: string;
  groupId: CraScoringGroupId;
  tag: string;
  /** Plain title for breadcrumbs, document title, and search. */
  titlePlain: string;
  titleSegments: CraTitleSegment[];
  impact: CraScoreValue;
  threat: CraScoreValue;
  vulnerability: CraScoreValue;
  likelihood: CraScoreValue;
  cyberRiskScore: CraScoreValue;
  rationale: string;
};

export type CraCyberRiskDefinition = {
  kind: "cyberRisk";
  id: string;
  groupId: CraScoringGroupId;
  tag: string;
  titleLinkText: string;
  impact: CraScoreValue;
  threat: CraScoreValue;
  vulnerability: CraScoreValue;
  likelihood: CraScoreValue;
  cyberRiskScore: CraScoreValue;
};

export type CraScoringRowDefinition = CraCyberRiskDefinition | ({ kind: "scenario" } & CraScenarioDefinition);

export const CRA_SCORING_ROW_DEFINITIONS: CraScoringRowDefinition[] = [
  // ── Cyber risk 1: Ransomware deployment ─────────────────────────────────
  {
    kind: "cyberRisk",
    id: "cr-rw",
    groupId: "rw",
    tag: "Cyber risk",
    titleLinkText: "Ransomware deployment",
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: null,
    cyberRiskScore: null,
  },
  {
    kind: "scenario",
    id: "rw-s1",
    groupId: "rw",
    tag: "Scenario 1",
    titlePlain:
      "Ransomware deployment exploiting Unpatched web server on Payment gateway.",
    titleSegments: [
      { text: "Ransomware deployment", emphasize: true },
      { text: " exploiting " },
      { text: "Unpatched web server", emphasize: true },
      { text: " on " },
      { text: "Payment gateway", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "5", label: "Very high", rag: "neg05" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Threat — Ransomware deployment (severity: High): Ransomware operators actively target internet-facing payment infrastructure. The High rating reflects documented toolkits and initial-access brokers selling footholds in financial-services networks.

Vulnerability — Unpatched web server (severity: Very high): Missing patches on the web tier provide a well-documented entry point. Exploitation is often automated and scannable, making the window between disclosure and compromise short.

Asset — Payment gateway (criticality: Very high): The payment gateway processes all customer transactions. Encryption or disruption of this system halts revenue collection and erodes customer trust immediately.

Likelihood determination: High threat combined with Very high vulnerability produces a High likelihood — attackers have both motive and a straightforward exploitation path.

Impact determination: Very high asset criticality means any successful ransomware event directly interrupts revenue and triggers regulatory reporting.

Risk calculation: The resulting High cyber risk score warrants priority remediation: accelerate patching cadence for the web tier, harden network paths to the gateway, and validate immutable backups for payment data.`,
  },
  {
    kind: "scenario",
    id: "rw-s2",
    groupId: "rw",
    tag: "Scenario 2",
    titlePlain:
      "Ransomware deployment exploiting Lack of network segmentation on Customer database.",
    titleSegments: [
      { text: "Ransomware deployment", emphasize: true },
      { text: " exploiting " },
      { text: "Lack of network segmentation", emphasize: true },
      { text: " on " },
      { text: "Customer database", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "5", label: "Very high", rag: "neg05" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Threat — Ransomware deployment (severity: High): Ransomware against customer data stores is a High-severity threat given common double-extortion tactics and the speed at which operators move laterally after first access.

Vulnerability — Lack of network segmentation (severity: Very high): Flat network architecture allows an attacker who gains any foothold to reach the customer database without additional barriers, making lateral movement trivial.

Asset — Customer database (criticality: Very high): The customer database holds regulated personal data. Encryption or exfiltration triggers mandatory breach notification and significant financial exposure.

Likelihood determination: High threat paired with Very high vulnerability produces High likelihood — once inside the network, the path to the database is unobstructed.

Impact determination: Very high criticality ensures any successful attack has severe customer, legal, and financial consequences.

Risk calculation: High cyber risk score. Remediation should prioritize network segmentation, micro-segmentation around the database tier, privilege access management, and tested offline backups.`,
  },

  // ── Cyber risk 2: Phishing ─────────────────────────────────
  {
    kind: "cyberRisk",
    id: "cr-ph",
    groupId: "ph",
    tag: "Cyber risk",
    titleLinkText: "Phishing",
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: null,
    cyberRiskScore: null,
  },
  {
    kind: "scenario",
    id: "ph-s1",
    groupId: "ph",
    tag: "Scenario 1",
    titlePlain:
      "Phishing exploiting Insufficient employee security training on Email server.",
    titleSegments: [
      { text: "Phishing", emphasize: true },
      { text: " exploiting " },
      { text: "Insufficient employee security training", emphasize: true },
      { text: " on " },
      { text: "Email server", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "11–15", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "26–50", label: "Low", rag: "pos04" },
    rationale: `Threat — Phishing (severity: Medium): Broad phishing campaigns are a common initial access vector. The Medium rating reflects that execution still depends on user interaction and the campaign is not narrowly targeted.

Vulnerability — Insufficient employee security training (severity: High): Gaps in security awareness training leave employees susceptible to credential harvesting and malicious attachments, increasing the odds of successful initial compromise.

Asset — Email server (criticality: High): The email server is a central communications hub. Compromise grants access to sensitive correspondence, internal credentials, and potential pivot points into other systems.

Likelihood determination: Medium threat combined with High vulnerability produces Medium likelihood — phishing is frequent but requires the human element to succeed.

Impact determination: High asset criticality means a compromised email server exposes confidential communications and can serve as a launchpad for further attacks.

Risk calculation: Low cyber risk score reflects moderate likelihood against a high-value target. Prioritize phishing simulations, mandatory security awareness training, and phishing-resistant MFA for mail access.`,
  },
  {
    kind: "scenario",
    id: "ph-s2",
    groupId: "ph",
    tag: "Scenario 2",
    titlePlain:
      "Phishing exploiting Insufficient employee security training on Social media accounts.",
    titleSegments: [
      { text: "Phishing", emphasize: true },
      { text: " exploiting " },
      { text: "Insufficient employee security training", emphasize: true },
      { text: " on " },
      { text: "Social media accounts", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "3", label: "Medium", rag: "neu03" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "26–50", label: "Low", rag: "pos04" },
    rationale: `Threat — Phishing (severity: High): Targeted phishing against social media operators is High severity because compromised brand accounts can be weaponized to distribute malware or fraudulent content to followers.

Vulnerability — Insufficient employee security training (severity: High): Marketing and social media staff without adequate training are prime targets for credential harvesting through impersonation of platform support or partner accounts.

Asset — Social media accounts (criticality: Medium): Social media accounts have Medium criticality — compromise damages brand reputation and may spread disinformation, but does not directly expose regulated data.

Likelihood determination: High threat paired with High vulnerability produces High likelihood — social media credentials are actively targeted and training gaps make success probable.

Impact determination: Medium criticality limits the blast radius to reputational damage and potential follower exposure rather than direct data breach.

Risk calculation: Low cyber risk score despite High likelihood, constrained by the Medium impact ceiling. Enforce MFA on all social accounts, establish a takeover response playbook, and include social engineering scenarios in training.`,
  },

  // ── Cyber risk 3: DDoS attack ───────────────────────────────────────
  {
    kind: "cyberRisk",
    id: "cr-dd",
    groupId: "dd",
    tag: "Cyber risk",
    titleLinkText: "DDoS attack",
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: null,
    cyberRiskScore: null,
  },
  {
    kind: "scenario",
    id: "dd-s1",
    groupId: "dd",
    tag: "Scenario 1",
    titlePlain:
      "DDoS attack exploiting Open network ports on Payment gateway.",
    titleSegments: [
      { text: "DDoS attack", emphasize: true },
      { text: " exploiting " },
      { text: "Open network ports", emphasize: true },
      { text: " on " },
      { text: "Payment gateway", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Threat — DDoS attack (severity: Very high): DDoS attacks against payment infrastructure are Very high severity due to commoditized botnets and the direct revenue impact of even brief outages.

Vulnerability — Open network ports (severity: High): Unnecessary open ports increase the attack surface and amplification potential. High severity reflects that the exposure is detectable and exploitable without sophisticated tooling.

Asset — Payment gateway (criticality: Very high): Downtime on the payment gateway halts all transaction processing, causing immediate revenue loss and SLA violations with merchant partners.

Likelihood determination: Very high threat combined with High vulnerability produces High likelihood — DDoS-for-hire services make attacks affordable and repeatable.

Impact determination: Very high criticality ensures any sustained outage has severe business and contractual consequences.

Risk calculation: High cyber risk score. Deploy rate limiting, close unnecessary ports, implement DDoS mitigation services, and maintain a volumetric attack response runbook with ISP escalation contacts.`,
  },
  {
    kind: "scenario",
    id: "dd-s2",
    groupId: "dd",
    tag: "Scenario 2",
    titlePlain:
      "DDoS attack exploiting Missing intrusion detection system on DNS server.",
    titleSegments: [
      { text: "DDoS attack", emphasize: true },
      { text: " exploiting " },
      { text: "Missing intrusion detection system", emphasize: true },
      { text: " on " },
      { text: "DNS server", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "3", label: "Medium", rag: "neu03" },
    likelihood: { numeric: "11–15", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "51–75", label: "Medium", rag: "neu03" },
    rationale: `Threat — DDoS attack (severity: High): DNS amplification and reflection attacks are a well-known vector. High severity reflects the ease of execution against resolvers and authoritative servers.

Vulnerability — Missing intrusion detection system (severity: Medium): Without IDS, anomalous traffic patterns go undetected until service degradation is reported by users, delaying response and increasing blast radius.

Asset — DNS server (criticality: Very high): The DNS server is foundational infrastructure. Loss of name resolution renders all dependent services unreachable regardless of their individual health.

Likelihood determination: High threat with Medium vulnerability yields Medium likelihood — the attack vector is viable but partial compensating controls exist.

Impact determination: Very high criticality because DNS failure cascades across the entire service portfolio.

Risk calculation: Medium cyber risk score. Deploy DNS-specific IDS rules, enable response rate limiting, diversify DNS providers, and pre-stage anycast failover configurations.`,
  },

  // ── Cyber risk 4: Insider data exfiltration ─────────────────────────
  {
    kind: "cyberRisk",
    id: "cr-ie",
    groupId: "ie",
    tag: "Cyber risk",
    titleLinkText: "Insider data exfiltration",
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: null,
    cyberRiskScore: null,
  },
  {
    kind: "scenario",
    id: "ie-s1",
    groupId: "ie",
    tag: "Scenario 1",
    titlePlain:
      "Insider data exfiltration exploiting Missing data encryption at rest on Customer database.",
    titleSegments: [
      { text: "Insider data exfiltration", emphasize: true },
      { text: " exploiting " },
      { text: "Missing data encryption at rest", emphasize: true },
      { text: " on " },
      { text: "Customer database", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Threat — Insider data exfiltration (severity: High): Privileged insiders with database access represent a High threat because they already possess legitimate credentials and knowledge of where sensitive data resides.

Vulnerability — Missing data encryption at rest (severity: High): Unencrypted data at rest means a malicious insider can copy raw data files or backups without triggering decryption-layer controls or key audit events.

Asset — Customer database (criticality: Very high): The customer database holds regulated personal information. Bulk exfiltration triggers mandatory breach notification and significant legal exposure.

Likelihood determination: High threat combined with High vulnerability produces High likelihood — the insider already has access and no encryption barrier stands in the way.

Impact determination: Very high criticality ensures any confirmed exfiltration event has severe customer, regulatory, and financial consequences.

Risk calculation: High cyber risk score. Implement encryption at rest with hardware-backed key management, enable database activity monitoring, enforce least-privilege access reviews, and deploy DLP controls on egress paths.`,
  },
  {
    kind: "scenario",
    id: "ie-s2",
    groupId: "ie",
    tag: "Scenario 2",
    titlePlain:
      "Insider data exfiltration exploiting Missing data loss prevention controls on Data warehouse.",
    titleSegments: [
      { text: "Insider data exfiltration", emphasize: true },
      { text: " exploiting " },
      { text: "Missing data loss prevention controls", emphasize: true },
      { text: " on " },
      { text: "Data warehouse", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "11–15", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "26–50", label: "Low", rag: "pos04" },
    rationale: `Threat — Insider data exfiltration (severity: Medium): Analysts and data engineers routinely access the warehouse for legitimate purposes. The Medium rating reflects that while insider risk exists, the threat population is smaller and less motivated than for the customer database.

Vulnerability — Missing data loss prevention controls (severity: High): Without DLP, large data exports via queries, API calls, or direct file copies go undetected, providing a clear exfiltration path.

Asset — Data warehouse (criticality: High): The data warehouse aggregates business intelligence including financial metrics, operational KPIs, and derived customer insights. Exposure is damaging but less directly regulated than raw customer PII.

Likelihood determination: Medium threat with High vulnerability yields Medium likelihood — the path exists but the threat actor pool is constrained.

Impact determination: High criticality reflects competitive and strategic harm from exposure of aggregated business intelligence.

Risk calculation: Low cyber risk score. Implement DLP policies on warehouse egress, enforce query-level audit logging, restrict bulk export permissions, and review access grants quarterly.`,
  },
];

const scenarioById = new Map<string, CraScenarioDefinition>();
for (const def of CRA_SCORING_ROW_DEFINITIONS) {
  if (def.kind === "scenario") {
    scenarioById.set(def.id, def);
  }
}

export function getCraScenarioById(id: string): CraScenarioDefinition | undefined {
  return scenarioById.get(id);
}

export function listCraScenarioIds(): string[] {
  return [...scenarioById.keys()];
}
