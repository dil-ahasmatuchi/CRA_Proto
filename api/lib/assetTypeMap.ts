/**
 * Maps IT Asset types to the threat domains, vulnerability types, and
 * cyber-risk domains that are relevant to each asset type.
 *
 * Used by /api/threats, /api/vulnerability-categories, and /api/cyber-risks
 * to support the `?asset_id=` filter for the Scoping UI.
 */

/** Threat domains (same taxonomy used by cyber_risks.domain) relevant to each asset type. */
export const ASSET_THREAT_DOMAINS: Record<string, string[]> = {
  "IT Asset - Software": [
    "Application & API",
    "Identity & Access Management",
    "Supply Chain & Third Party",
    "People & Workforce",
  ],
  "IT Asset - Hardware": [
    "Endpoint & Device",
    "Network & Infrastructure",
    "Physical & Facilities",
    "Operational Technology (OT/ICS)",
  ],
  "IT Asset - Cloud": [
    "Cloud & Virtualisation",
    "Data & Information",
    "Identity & Access Management",
    "Supply Chain & Third Party",
  ],
  "IT Asset - Information system": [
    "Data & Information",
    "Application & API",
    "People & Workforce",
    "Supply Chain & Third Party",
  ],
};

/** Vulnerability category types relevant to each asset type. */
export const ASSET_VULN_TYPES: Record<string, string[]> = {
  "IT Asset - Software": [
    "Application Security Defect",
    "Authentication and Access Control",
    "Identity and Privilege Management",
    "Security Configuration",
    "Third-Party and Vendor Risk",
  ],
  "IT Asset - Hardware": [
    "Network Security Weakness",
    "Patch / Update Management",
    "Security Configuration",
    "Incident Response Readiness Gap",
  ],
  "IT Asset - Cloud": [
    "Cloud Security Misconfiguration",
    "Data Protection Weakness",
    "Identity and Privilege Management",
    "Authentication and Access Control",
  ],
  "IT Asset - Information system": [
    "Data Protection Weakness",
    "Patch / Update Management",
    "Policy and Governance Gap",
    "Logging, Monitoring and Detection Gap",
    "Cryptographic Weakness",
  ],
};

/**
 * Given an asset_id, look up the asset type and return the relevant
 * threat/cyber-risk domains and vulnerability types for that asset.
 * Returns null if the asset is not found.
 */
export function getAssetFilters(
  db: import("better-sqlite3").Database,
  assetId: string
): { domains: string[]; vulnTypes: string[] } | null {
  const row = db
    .prepare("SELECT asset_type FROM assets WHERE id = ?")
    .get(assetId) as { asset_type: string } | undefined;

  if (!row) return null;

  return {
    domains: ASSET_THREAT_DOMAINS[row.asset_type] ?? [],
    vulnTypes: ASSET_VULN_TYPES[row.asset_type] ?? [],
  };
}
