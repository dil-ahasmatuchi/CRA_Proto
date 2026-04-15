import { padId, getFivePointLabel } from "./types.js";
import type {
  MockMitigationPlan,
  MitigationPlanStatus,
  FivePointScaleValue,
} from "./types.js";

type PlanRow = [
  name: string,
  ownerIdx: number,
  status: MitigationPlanStatus,
  dueDate: string,
  buIdx: number,
  severity: FivePointScaleValue,
  ctlIdxs: number[],
  crIdxs: number[],
  craIdxs: number[],
];

/** 15 mitigation plans; each links to ≥1 cyber risk and ≥1 control; optional CRA references. */
const raw: PlanRow[] = [
  ["Ransomware recovery enhancement", 7, "In progress", "2026-06-30", 15, 5, [1, 2, 3], [1, 2], [1, 2, 31]],
  ["Phishing defense improvement", 9, "In progress", "2026-05-31", 15, 4, [6, 7, 8], [2, 3], [3, 4, 17]],
  ["DDoS mitigation deployment", 15, "In progress", "2026-04-30", 4, 4, [11, 12, 13], [3, 4], [5, 7, 34]],
  ["Insider threat prevention", 20, "In progress", "2026-07-31", 10, 5, [16, 17, 18], [4, 5], [6, 26, 28]],
  ["BEC awareness program", 7, "Completed", "2025-12-31", 2, 4, [21, 22, 23], [5, 6], [17, 23, 33]],
  ["Regulatory compliance remediation", 33, "In progress", "2026-09-30", 9, 3, [26, 27, 28], [6, 7], [19, 30]],
  ["Supply chain risk reduction", 9, "In progress", "2026-08-31", 12, 4, [31, 32, 33], [7, 8], [5, 14, 22]],
  ["Cloud security hardening", 29, "In progress", "2026-05-31", 4, 4, [36, 37, 38], [8, 9], [4, 10, 24]],
  ["Data exfiltration prevention", 20, "In progress", "2026-08-31", 10, 5, [41, 42, 43], [9, 10], [6, 12, 35]],
  ["Malware defense upgrade", 39, "Completed", "2026-01-31", 4, 3, [46, 47, 48], [10, 11], [11, 13, 21]],
  ["APT detection program", 14, "In progress", "2026-09-30", 15, 5, [51, 52, 53], [11, 12], [2, 15, 35]],
  ["Zero-day preparedness", 14, "In progress", "2026-07-31", 5, 5, [56, 57, 58], [12, 13], [8, 16, 27]],
  ["Vendor breach response", 9, "In progress", "2026-06-30", 12, 4, [61, 62, 63], [14, 15], [5, 9, 29]],
  ["Encryption upgrade program", 40, "In progress", "2026-07-31", 15, 5, [66, 67, 68], [16, 17], [1, 12, 25]],
  ["Session security upgrade", 9, "In progress", "2026-04-30", 2, 3, [71, 72, 73], [18, 19], [11, 18, 32]],
];

export const mitigationPlans: MockMitigationPlan[] = raw.map(
  ([name, ownerIdx, status, dueDate, buIdx, severity, ctlIdxs, crIdxs, craIdxs], i) => ({
    id: padId("MP", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    status,
    dueDate,
    businessUnitId: padId("BU", buIdx),
    severity,
    severityLabel: getFivePointLabel(severity),
    controlIds: ctlIdxs.map((n) => padId("CTL", n)),
    cyberRiskIds: crIdxs.map((n) => padId("CR", n)),
    assessmentIds: craIdxs.map((n) => padId("CRA", n)),
  }),
);

const planById = new Map(mitigationPlans.map((p) => [p.id, p]));

export function getMitigationPlanById(id: string): MockMitigationPlan | undefined {
  return planById.get(id);
}
