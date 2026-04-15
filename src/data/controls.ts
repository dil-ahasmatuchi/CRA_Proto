import { padId } from "./types.js";
import type {
  MockControl,
  ControlStatus,
  ControlType,
  ControlFrequency,
} from "./types.js";

const STATUS: ControlStatus[] = ["Active", "Active", "Active", "Draft"];
const TYPES: ControlType[] = ["Preventive", "Detective"];
const FREQS: ControlFrequency[] = [
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "Quarterly",
  "Annually",
];

const OWNER_ROTATION = [7, 9, 14, 15, 20, 33, 39, 49, 1, 5, 28, 13, 17, 22, 40, 11, 36, 44, 6, 31];

/** 100 controls: each block of five maps to one cyber risk CR-001..CR-020. */
function buildControls(): MockControl[] {
  const out: MockControl[] = [];
  const prefixes = [
    "Multi-factor authentication",
    "Network intrusion detection",
    "Web application firewall",
    "Endpoint detection",
    "Data encryption",
    "Vulnerability scanning",
    "Privileged access management",
    "Security awareness",
    "Network segmentation",
    "Patch management",
    "Data loss prevention",
    "Backup testing",
    "Access certification",
    "Log monitoring",
    "Incident response",
    "Vendor assessment",
    "Change management",
    "Secure code review",
    "Database monitoring",
    "CSPM",
    "Container scanning",
    "API gateway",
    "Email filtering",
    "Certificate lifecycle",
    "Identity governance",
    "Physical access",
    "Mobile device management",
    "Disaster recovery test",
    "SIEM correlation",
    "Zero trust access",
    "Data classification",
    "Secrets management",
    "Compliance monitoring",
    "Application control",
    "DNS security",
    "Wireless hardening",
    "File integrity",
    "Browser isolation",
    "Supply chain verification",
    "CASB",
    "Dark web monitoring",
    "Tabletop exercises",
    "Compliance audit",
    "Data retention",
    "Threat intelligence",
    "Red team",
    "SOC monitoring",
    "Business continuity",
    "Key rotation",
    "UEBA",
  ];

  for (let i = 0; i < 100; i++) {
    const crNum = Math.floor(i / 5) + 1;
    const name = `${prefixes[i % prefixes.length]} — control ${i + 1}`;
    out.push({
      id: padId("CTL", i + 1),
      name,
      ownerId: padId("USR", OWNER_ROTATION[i % OWNER_ROTATION.length]!),
      status: STATUS[i % STATUS.length]!,
      controlType: TYPES[i % 2]!,
      keyControl: i % 3 !== 0,
      controlFrequency: FREQS[i % FREQS.length]!,
      cyberRiskIds: [padId("CR", crNum)],
    });
  }
  return out;
}

export const controls: MockControl[] = buildControls();

const controlById = new Map(controls.map((c) => [c.id, c]));

export function getControlById(id: string): MockControl | undefined {
  return controlById.get(id);
}
