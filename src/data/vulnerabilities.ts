/**
 * Vulnerability catalog. If you import this module without loading `threats.js` first,
 * `threatIds` / `relationships.threatIds` stay empty and assets lack threat links.
 * Import `../data/threats.js` (side effect) or use the data barrel that pulls in threats.
 */
import { padId } from "./types.js";
import type {
  AssetType,
  CIAImpact,
  MockVulnerability,
  VulnerabilityDomain,
  VulnerabilityStatus,
} from "./types.js";
import { assets } from "./assets.js";

type VulnTemplate = {
  title: string;
  domain: VulnerabilityDomain;
  status: VulnerabilityStatus;
  cia: CIAImpact;
};

/** Six rotating templates per asset class (names stay generic; asset is appended in the row). */
const TEMPLATES: Record<AssetType, VulnTemplate[]> = {
  Application: [
    {
      title: "Inadequate access control reviews",
      domain: "Process",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Missing security regression testing",
      domain: "Process",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Weak session timeout configuration",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Unpatched application dependencies",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Insufficient input validation",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Gaps in security logging coverage",
      domain: "Process",
      status: "Draft",
      cia: "Availability",
    },
  ],
  Database: [
    {
      title: "Weak database authentication configuration",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Missing encryption at rest",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Excessive privileged database accounts",
      domain: "People",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Immature backup and recovery testing",
      domain: "Process",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Incomplete data classification enforcement",
      domain: "Process",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Slow vulnerability patching cadence",
      domain: "Technology",
      status: "Draft",
      cia: "Integrity",
    },
  ],
  Server: [
    {
      title: "Delayed operating system patching",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Insecure default service configuration",
      domain: "Technology",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Weak administrative access governance",
      domain: "Process",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Missing host-based monitoring",
      domain: "Technology",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Insufficient hardening against lateral movement",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Inadequate separation of production and non-production",
      domain: "Process",
      status: "Draft",
      cia: "Integrity",
    },
  ],
  "Network device": [
    {
      title: "Outdated firmware on managed appliances",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Weak or shared administrative credentials",
      domain: "People",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Incomplete network segmentation design",
      domain: "Process",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Missing centralized configuration backup",
      domain: "Process",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Insufficient traffic inspection coverage",
      domain: "Technology",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Gaps in change approval documentation",
      domain: "Process",
      status: "Draft",
      cia: "Integrity",
    },
  ],
  "Cloud service": [
    {
      title: "Overly permissive identity and access policies",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Misconfigured public exposure settings",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Weak secrets and key rotation practices",
      domain: "Process",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Underused data loss prevention controls",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Immature SaaS governance and app approval",
      domain: "Process",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Limited visibility into provider-side incidents",
      domain: "Process",
      status: "Draft",
      cia: "Availability",
    },
  ],
  Endpoint: [
    {
      title: "Inconsistent endpoint protection coverage",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Weak local administrator controls",
      domain: "Process",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Outdated endpoint agent versions",
      domain: "Technology",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Insufficient lost-device response procedures",
      domain: "Process",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Gaps in removable media restrictions",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Weak patch compliance reporting",
      domain: "Process",
      status: "Draft",
      cia: "Integrity",
    },
  ],
  "IoT device": [
    {
      title: "Default or unchanged device credentials",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Limited firmware update channel",
      domain: "Technology",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Weak network isolation for device VLANs",
      domain: "Process",
      status: "Active",
      cia: "Availability",
    },
    {
      title: "Insufficient device inventory accuracy",
      domain: "Process",
      status: "Active",
      cia: "Integrity",
    },
    {
      title: "Missing anomaly detection for device traffic",
      domain: "Technology",
      status: "Active",
      cia: "Confidentiality",
    },
    {
      title: "Immature IoT vendor risk reviews",
      domain: "Process",
      status: "Draft",
      cia: "Integrity",
    },
  ],
};

function vulnerabilityCountForAssetIndex(assetIndex: number): number {
  return 2 + (assetIndex % 5);
}

function emptyRelationshipPlaceholders(assetId: string, cyberRiskIds: string[]) {
  return {
    assetId,
    cyberRiskIds,
    threatIds: [] as string[],
    controlIds: [] as string[],
    mitigationPlanIds: [] as string[],
    scenarioIds: [] as string[],
  };
}

function buildVulnerabilities(): MockVulnerability[] {
  const out: MockVulnerability[] = [];
  let vulnSeq = 0;

  for (let assetIndex = 0; assetIndex < assets.length; assetIndex++) {
    const asset = assets[assetIndex]!;
    const pool = TEMPLATES[asset.assetType];
    const count = vulnerabilityCountForAssetIndex(assetIndex);

    for (let j = 0; j < count; j++) {
      vulnSeq += 1;
      const template = pool[(assetIndex + j) % pool.length]!;
      const cyberRiskIds: string[] = [];
      out.push({
        id: padId("VUL", vulnSeq),
        name: `${template.title} (${asset.name})`,
        ownerId: asset.ownerId,
        domain: template.domain,
        status: template.status,
        primaryCIAImpact: template.cia,
        cyberRiskIds,
        assetIds: [asset.id],
        threatIds: [],
        relationships: emptyRelationshipPlaceholders(asset.id, cyberRiskIds),
      });
    }
  }

  return out;
}

export const vulnerabilities: MockVulnerability[] = buildVulnerabilities();

const vulnById = new Map(vulnerabilities.map((v) => [v.id, v]));

export function getVulnerabilityById(id: string): MockVulnerability | undefined {
  return vulnById.get(id);
}
