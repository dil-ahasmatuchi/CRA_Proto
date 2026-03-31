export type CraRagKey = "neg05" | "neg03" | "neu03" | "pos04" | "pos05";

export type CraScoreValue = {
  numeric: string;
  label: string;
  rag: CraRagKey;
} | null;

export type CraTitleSegment = { text: string; emphasize?: boolean };

export type CraScenarioDefinition = {
  id: string;
  groupId: "rw" | "ph";
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
  groupId: "rw" | "ph";
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
  {
    kind: "cyberRisk",
    id: "cr-rw",
    groupId: "rw",
    tag: "Cyber risk",
    titleLinkText: "Loss of revenue due to Ransomware attack",
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
      "Loss of revenue due to Ransomware attack exploiting Unpatched web server on Payment gateway.",
    titleSegments: [
      { text: "Loss of revenue due to " },
      { text: "Ransomware attack", emphasize: true },
      { text: " exploiting " },
      { text: "Unpatched web server", emphasize: true },
      { text: " on " },
      { text: "Payment gateway", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerability: { numeric: "5", label: "Very high", rag: "neg05" },
    likelihood: { numeric: "11–15", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "51–75", label: "Medium", rag: "neu03" },
    rationale: `Update: Scores reflect the latest assessment pass for this scenario.

Threat — Ransomware attack (severity: Medium): Ransomware is treated as a credible threat against revenue systems when delivery paths exist. The Medium rating reflects that execution still depends on user action or exposed services, not an always-on automated path.

Vulnerability — Unpatched web server (severity: Very high): Missing patches on an internet-facing web tier materially increase the chance of initial access. A Very high vulnerability score is appropriate because exploitation is often well documented and scanners can find the weakness quickly.

Asset — Payment gateway (criticality: High): The payment gateway is a high-value asset. Disruption or encryption of this system directly affects collections and customer trust, so we assign High asset criticality (impact).

Scoring rationale for the cyber risk
Likelihood determination: Likelihood combines threat and vulnerability. A serious, exploitable weakness on a sensitive integration point supports a High likelihood outcome even when the threat actor must still complete a short chain of steps.

Impact determination: Impact is driven by asset criticality. Loss of the payment gateway implies immediate revenue and operational impact, which keeps the impact side of the equation elevated.

Risk calculation: Together, elevated likelihood and high impact produce a Medium overall cyber risk score in this qualitative model. Mitigations should prioritize patching and hardening the web tier, tightening access paths to the gateway, and validating backup and recovery for payment flows.`,
  },
  {
    kind: "scenario",
    id: "rw-s2",
    groupId: "rw",
    tag: "Scenario 2",
    titlePlain:
      "Loss of revenue due to Ransomware attack exploiting Missing Multi-Factor Authentication on Customer database.",
    titleSegments: [
      { text: "Loss of revenue due to " },
      { text: "Ransomware attack", emphasize: true },
      { text: " exploiting " },
      { text: "Missing Multi-Factor Authentication", emphasize: true },
      { text: " on " },
      { text: "Customer database", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "5", label: "Very high", rag: "neg05" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Update: This scenario carries the highest composite score in the ransomware branch because both impact and exploitability are at the top of the scale.

Threat — Ransomware attack (severity: High): Ransomware against customer data stores is a High-severity threat given common double-extortion tactics and the speed at which operators move laterally after first access.

Vulnerability — Missing MFA (severity: Very high): Absence of MFA on paths that can reach the customer database removes a basic control that stops credential stuffing and session hijack from turning into bulk data access. That gap warrants a Very high vulnerability score.

Asset — Customer database (criticality: Very high): The customer database is classified as Very high criticality because it holds regulated and sensitive personal data where breach costs are structural, not one-time.

Scoring rationale for the cyber risk
Likelihood determination: High threat paired with Very high vulnerability produces a High likelihood: attackers have both motive and a straightforward path through weak authentication.

Impact determination: Very high asset criticality means any successful encryption or exfiltration event has severe customer, legal, and financial consequences.

Risk calculation: The model therefore surfaces a Very high cyber risk score. Remediation should start with enforced MFA, privileged access review, segmentation between workstations and the database tier, and immutable backups with tested restores.`,
  },
  {
    kind: "scenario",
    id: "rw-s3",
    groupId: "rw",
    tag: "Scenario 3",
    titlePlain: "Data breach due to phishing attack.",
    titleSegments: [{ text: "Data breach due to phishing attack" }],
    impact: null,
    threat: null,
    vulnerability: null,
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Update: Several factor scores are not populated yet; the row still shows a High likelihood from phishing prevalence and a High cyber risk score driven by the available inputs.

Threat — Phishing (severity: not scored in this row): Phishing is a common initial access vector. Once full threat scoring is completed, we expect at least a Medium to High rating based on campaign volume against your industry.

Vulnerability — User awareness and controls (severity: not scored): Until phishing-resistant authentication and mail filtering outcomes are recorded, vulnerability remains an open item. Early evidence often lands in security awareness metrics rather than a single CVE-style score.

Asset — Affected systems (criticality: not scored): Impact cannot be fully anchored until we identify which repositories or applications the phished account can reach.

Scoring rationale for the cyber risk
Likelihood determination: The High likelihood value reflects that employees regularly receive malicious messages and that a single successful click can start an incident chain.

Impact determination: Impact is pending formal asset mapping; treat current results as directional until impact factors are added.

Risk calculation: With likelihood High and incomplete impact data, the displayed cyber risk score should be revalidated after you attach assets and vulnerability context. Immediate actions: phishing simulations, MFA everywhere, and clear reporting paths for suspicious mail.`,
  },
  {
    kind: "scenario",
    id: "rw-s4",
    groupId: "rw",
    tag: "Scenario 4",
    titlePlain:
      "Loss of revenue due to Ransomware attack exploiting Missing Multi-Factor Authentication on Social media accounts.",
    titleSegments: [
      { text: "Loss of revenue due to " },
      { text: "Ransomware attack", emphasize: true },
      { text: " exploiting " },
      { text: "Missing Multi-Factor Authentication", emphasize: true },
      { text: " on " },
      { text: "Social media accounts", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "51–75", label: "Medium", rag: "neu03" },
    rationale: `Update: All four factor inputs are aligned around High, which moderates to a Medium composite in this assessment methodology.

Threat — Ransomware attack (severity: High): Social and marketing endpoints can be leveraged for credential theft that later maps to corporate SSO. The threat remains High even though the first hop is a social platform.

Vulnerability — Missing MFA (severity: High): Social accounts without MFA are routinely compromised via reused passwords and push bombing. High is appropriate until MFA and recovery options are hardened.

Asset — Social media accounts (criticality: High): Accounts are High criticality because they influence brand trust and can redirect customers or publish fraud; revenue and reputation effects are direct.

Scoring rationale for the cyber risk
Likelihood determination: Uniform High scores on threat, vulnerability, and likelihood indicate a credible, repeatable attack path that does not require exotic tooling.

Impact determination: High criticality keeps losses meaningful but slightly below the customer-database scenario where regulated data volume is larger.

Risk calculation: The blended outcome is a Medium cyber risk score. Next steps: enforce MFA, remove shared credentials, monitor OAuth grants to marketing tools, and document an account takeover runbook.`,
  },
  {
    kind: "cyberRisk",
    id: "cr-ph",
    groupId: "ph",
    tag: "Cyber risk",
    titleLinkText: "Loss of revenue due to Phishing attack on Social media accounts.",
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
      "Data breach due to Phishing attack exploiting SQL Injection on Social media accounts.",
    titleSegments: [
      { text: "Data breach due to " },
      { text: "Phishing attack", emphasize: true },
      { text: " exploiting " },
      { text: "SQL Injection", emphasize: true },
      { text: " on " },
      { text: "Social media accounts", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "3", label: "Medium", rag: "neu03" },
    likelihood: { numeric: "11–15", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "51–75", label: "Medium", rag: "neu03" },
    rationale: `Update: Scores emphasize very high business impact if an injected social integration reaches internal APIs.

Threat — Phishing attack (severity: High): Targeted phishing against operators of social properties is a High threat because it pairs social engineering with technical follow-through.

Vulnerability — SQL injection (severity: Medium): Injection on a connected component is Medium here only where WAFs and parameterization partially contain risk; if proven on a production path, revisit and raise the score.

Asset — Social media accounts (criticality: Very high): Brand-facing breach channels are Very high criticality when they can leak followers' data or spread malware.

Scoring rationale for the cyber risk
Likelihood determination: Medium likelihood reflects that both phishing and injection must line up; either control gap alone is serious, together they are plausible in integrated stacks.

Impact determination: Very high impact dominates the narrative—any confirmed data breach through this channel triggers broad notification obligations.

Risk calculation: Net outcome is Medium cyber risk pending code fixes. Prioritize parameterized queries, least-privilege DB roles, and phishing-resistant MFA for anyone who can deploy or configure integrations.`,
  },
  {
    kind: "scenario",
    id: "ph-s2",
    groupId: "ph",
    tag: "Scenario 2",
    titlePlain: "Account takeover via phishing email.",
    titleSegments: [{ text: "Account takeover via phishing email" }],
    impact: { numeric: "3", label: "Medium", rag: "neu03" },
    threat: { numeric: "3", label: "Medium", rag: "neu03" },
    vulnerability: { numeric: "2", label: "Low", rag: "pos04" },
    likelihood: { numeric: "6–10", label: "Low", rag: "pos04" },
    cyberRiskScore: { numeric: "1–25", label: "Very low", rag: "pos05" },
    rationale: `Update: Very high likelihood is driven by phishing volume even though single-account impact is only Medium today.

Threat — Phishing email (severity: Medium): Generic phishing is Medium severity relative to targeted APT activity, but still sufficient to capture credentials at scale.

Vulnerability — User and mail controls (severity: Low): Low vulnerability indicates baseline controls (filtering, MFA on mail) are partly effective but not phishing-resistant everywhere.

Asset — Employee mailboxes (criticality: Medium): Compromise is Medium criticality when mail alone cannot reach crown-jewel systems without additional steps.

Scoring rationale for the cyber risk
Likelihood determination: Very high likelihood follows from ubiquitous campaigns and human click risk, even with decent filtering.

Impact determination: Medium impact caps the composite because the scenario stops short of immediate large-scale data loss.

Risk calculation: Overall Medium cyber risk suggests continuous training, reporting buttons, and moving to FIDO2 or equivalent MFA for privileged users.`,
  },
  {
    kind: "scenario",
    id: "ph-s3",
    groupId: "ph",
    tag: "Scenario 3",
    titlePlain:
      "Data breach due to Phishing attack exploiting SQL Injection on Social media accounts.",
    titleSegments: [
      { text: "Data breach due to " },
      { text: "Phishing attack", emphasize: true },
      { text: " exploiting " },
      { text: "SQL Injection", emphasize: true },
      { text: " on " },
      { text: "Social media accounts", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "4", label: "High", rag: "neg03" },
    threat: { numeric: "4", label: "High", rag: "neg03" },
    vulnerability: { numeric: "3", label: "Medium", rag: "neu03" },
    likelihood: { numeric: "11–15", label: "Medium", rag: "neu03" },
    cyberRiskScore: { numeric: "26–50", label: "Low", rag: "pos04" },
    rationale: `Update: Compared with the first phishing + SQL scenario, likelihood is now High, pushing the composite toward High cyber risk.

Threat — Phishing attack (severity: High): Higher reported click rates or successful tests justify raising phishing from Medium to High.

Vulnerability — SQL injection (severity: Medium): Same injection class as ph-s1; confirm whether this instance is reachable from externally influenced content—if yes, consider raising vulnerability.

Asset — Social media accounts (criticality: High): High criticality acknowledges large follower datasets and marketing automation hooks.

Scoring rationale for the cyber risk
Likelihood determination: High likelihood means the phishing-to-injection chain is no longer theoretical—telemetry or tests showed feasible paths.

Impact determination: High impact aligns with substantive data exposure if queries return more than marketing identifiers.

Risk calculation: Cyber risk score is High. Response: emergency code review, WAF tuning, credential rotation for integration accounts, and executive comms readiness.`,
  },
  {
    kind: "scenario",
    id: "ph-s4",
    groupId: "ph",
    tag: "Scenario 4",
    titlePlain: "Data breach due to Phishing attack exploiting SQL Injection on Customer database.",
    titleSegments: [
      { text: "Data breach due to " },
      { text: "Phishing attack", emphasize: true },
      { text: " exploiting " },
      { text: "SQL Injection", emphasize: true },
      { text: " on " },
      { text: "Customer database", emphasize: true },
      { text: "." },
    ],
    impact: { numeric: "5", label: "Very high", rag: "neg05" },
    threat: { numeric: "5", label: "Very high", rag: "neg05" },
    vulnerability: { numeric: "4", label: "High", rag: "neg03" },
    likelihood: { numeric: "16–20", label: "High", rag: "neg03" },
    cyberRiskScore: { numeric: "76–100", label: "High", rag: "neg03" },
    rationale: `Update: This is the maximum-severity phishing variant because it ends on the customer database with Very high threat and impact.

Threat — Phishing attack (severity: Very high): Very high reflects credible, targeted lures against staff who can reach database tooling or VPNs that expose SQL services.

Vulnerability — SQL injection (severity: High): Injection flaws that can reach customer PII are High until proven fully remediated and retested.

Asset — Customer database (criticality: Very high): Very high criticality is mandatory for regulated customer data stores.

Scoring rationale for the cyber risk
Likelihood determination: High likelihood is appropriate when phishing success has been observed in sibling scenarios and technical vulnerabilities remain open.

Impact determination: Very high impact is non-negotiable for wholesale customer data exposure.

Risk calculation: Cyber risk score is Very high. Treat as top-priority: incident readiness, zero-trust segmentation, database activity monitoring, and executive escalation for funding a fix.`,
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
