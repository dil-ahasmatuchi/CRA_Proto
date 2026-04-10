import { padId } from "./types.js";
import type { MockCyberRiskAssessment, AssessmentStatus } from "./types.js";
import { remapThreatIdFromLegacySequential } from "./threats.js";

function dedupeIdsPreserveOrder(ids: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

type AssessmentRow = [
  name: string,
  ownerIdx: number,
  status: AssessmentStatus,
  assessmentType: string,
  startDate: string,
  dueDate: string,
  assetIdxs: number[],
  crIdxs: number[],
  thrIdxs: number[],
  vulnIdxs: number[],
  scIdxs: number[],
];

const raw: AssessmentRow[] = [
  ["Q1 2026 enterprise risk assessment", 7, "Approved", "Full assessment", "2026-01-06", "2026-03-31", [1, 2, 7], [1, 26], [1], [1, 10], [1, 2, 41, 42]],
  ["Annual cybersecurity review 2026", 14, "Scoring", "Annual review", "2026-01-15", "2026-06-30", [2, 3, 28, 43], [2, 8, 12], [2, 3, 13], [3, 35], [3, 4, 13, 14]],
  ["Payment systems security assessment", 9, "Approved", "Targeted assessment", "2025-11-01", "2026-01-31", [1, 5, 16], [1, 8, 32], [1, 3, 17], [1, 20], [1, 5, 47]],
  ["Cloud infrastructure risk evaluation", 29, "Overdue", "Infrastructure review", "2026-02-01", "2026-04-30", [8, 29, 50], [11, 25, 49], [23, 46], [31, 32, 48], [19, 20, 39, 40]],
  ["Third-party vendor risk assessment", 9, "Scoring", "Vendor assessment", "2026-01-20", "2026-05-15", [24, 4, 29], [7, 23, 31], [9, 36], [19, 43], [11, 12, 36, 37]],
  ["Data privacy compliance audit", 33, "Approved", "Compliance audit", "2025-10-01", "2025-12-31", [2, 17, 35], [4, 30, 48], [5], [7, 35, 36], [7, 8, 30]],
  ["Network security penetration test", 15, "Approved", "Penetration test", "2026-02-15", "2026-03-15", [6, 11, 12, 36], [3, 14, 41], [4, 14, 37], [6, 33], [5, 6, 25, 26]],
  ["Application security review", 27, "Overdue", "Code review", "2026-03-01", "2026-05-31", [13, 18, 21], [8, 24, 40], [3, 15, 24], [3, 18, 21], [13, 33, 38]],
  ["Incident response readiness assessment", 49, "Scoping", "Tabletop exercise", "2026-04-01", "2026-06-30", [49, 50, 7], [1, 36], [1, 30], [42], [1, 2]],
  ["Business continuity risk evaluation", 20, "Scoring", "BCP review", "2026-02-01", "2026-04-15", [10, 50], [27, 34, 36], [30, 33, 34], [14, 34, 42], [43, 50]],
  ["Endpoint security assessment", 39, "Approved", "Technical assessment", "2025-12-01", "2026-02-28", [39, 34, 3], [9, 22, 42], [12, 19, 42], [12, 37, 39], [15, 16, 35]],
  ["Identity and access management review", 7, "Scoring", "IAM review", "2026-03-01", "2026-05-31", [7, 14], [16, 28], [7, 11, 16], [2, 4, 30], [28, 29, 44]],
  ["Database security assessment", 17, "Approved", "Technical assessment", "2025-09-15", "2025-11-30", [2, 17, 31], [4, 8], [3, 5], [7, 47], [7, 14, 21, 30]],
  ["Supply chain security review", 9, "Draft", "Vendor assessment", "2026-04-15", "2026-07-31", [24, 27, 28], [7, 31], [9, 36], [19, 43, 45], [11, 12, 36, 37]],
  ["Q2 2026 risk assessment cycle", 14, "Draft", "Full assessment", "2026-04-01", "2026-06-30", [1, 2, 13, 21], [1, 3, 8, 12], [1, 4, 13], [1, 3, 6, 8], [1, 5, 13, 21]],
  ["Mobile application security test", 13, "Approved", "Penetration test", "2026-01-10", "2026-02-10", [18, 44, 45], [20, 35], [24, 47], [13, 23], [33, 34]],
  ["Email system security evaluation", 3, "Approved", "Targeted assessment", "2025-08-01", "2025-10-31", [3], [2, 5], [2, 22, 50], [35], [3, 4, 9, 10]],
  ["Financial systems risk assessment", 16, "Scoring", "Full assessment", "2026-02-15", "2026-05-15", [5, 16, 46], [1, 5, 32], [1, 17, 22], [1, 20], [1, 2, 10, 47]],
  ["Regulatory compliance assessment", 33, "Scoring", "Compliance audit", "2026-01-01", "2026-03-31", [33, 2, 16], [6, 18, 30], [], [15, 35], [46]],
  ["Container security review", 29, "Draft", "Technical assessment", "2026-04-01", "2026-06-15", [29, 27], [25, 49], [46], [31, 46], [19, 20, 39, 40]],
  ["API security assessment", 13, "Approved", "Penetration test", "2025-11-15", "2026-01-15", [13, 18], [20, 35], [24, 47], [13, 23, 29], [13, 26, 33, 34]],
  ["Physical security review", 38, "Scoring", "Physical assessment", "2026-03-01", "2026-04-30", [36, 10], [29, 39], [29, 31], [34], [50]],
  ["Social engineering resilience test", 36, "Approved", "Penetration test", "2025-10-15", "2025-12-15", [3, 43, 23], [2, 10, 42, 50], [2, 10, 22, 39], [35], [3, 4, 17, 18]],
  ["Disaster recovery assessment", 10, "Overdue", "BCP review", "2026-02-01", "2026-04-30", [50, 10], [27, 36, 37], [30, 31, 33], [14, 34], [43, 50]],
  ["Encryption standards review", 40, "Approved", "Technical assessment", "2025-12-15", "2026-02-15", [6, 40, 14], [14, 26], [6, 49], [5, 40, 49], [25, 26, 41, 42]],
  ["Insider threat assessment", 20, "Scoring", "Full assessment", "2026-03-15", "2026-06-15", [2, 7, 17, 28], [4, 17, 29], [5, 16], [7, 8, 26], [7, 8, 30, 44, 45]],
  ["Web application security review", 27, "Approved", "Penetration test", "2025-09-01", "2025-11-30", [13, 19, 21], [8, 24, 40], [3, 15, 18], [3, 18, 21], [13, 33, 38]],
  ["Cloud storage security audit", 8, "Approved", "Technical assessment", "2026-01-01", "2026-02-28", [8, 35], [11, 25], [23], [25, 32], [19, 39]],
  ["Zero trust architecture assessment", 15, "Draft", "Architecture review", "2026-05-01", "2026-08-31", [6, 7, 14, 36], [16, 21], [7, 11], [2, 5, 17], [25, 26, 28, 29]],
  ["GDPR readiness assessment", 33, "Approved", "Compliance audit", "2025-07-01", "2025-09-30", [2, 3, 26], [30, 33, 48], [2], [35], [46, 48, 49]],
  ["Ransomware preparedness review", 7, "Scoring", "Tabletop exercise", "2026-03-01", "2026-04-30", [1, 2, 7, 40], [1, 26], [1], [1, 10], [1, 2, 41, 42]],
  ["DevOps pipeline security assessment", 28, "Scoring", "Technical assessment", "2026-02-15", "2026-04-30", [27, 28, 29], [7, 49], [9, 46], [19, 25, 31, 45], [11, 12, 22, 24]],
  ["Customer data protection review", 7, "Approved", "Full assessment", "2025-10-01", "2025-12-31", [2, 26, 45], [33, 48], [1, 2, 50], [3, 35], [21, 41, 46, 48, 49]],
  ["Network perimeter assessment", 15, "Approved", "Penetration test", "2026-01-15", "2026-02-15", [9, 11, 12, 36, 48], [3, 41], [4, 37, 40], [6, 10, 33], [5, 6]],
  ["IoT and OT security evaluation", 48, "Draft", "Technical assessment", "2026-05-01", "2026-07-31", [37, 48], [38, 45], [40, 41], [10, 50], []],
  ["HR systems security audit", 1, "Approved", "Targeted assessment", "2025-11-01", "2026-01-31", [15, 41, 46], [39, 42], [21, 42], [38], []],
  ["Executive cybersecurity briefing Q1", 7, "Approved", "Executive review", "2026-01-05", "2026-01-31", [1, 2, 7], [1, 12, 26, 33], [1, 13], [1, 8, 35], [1, 2, 21, 41]],
  ["Wireless network security assessment", 37, "Overdue", "Technical assessment", "2026-03-15", "2026-04-30", [37], [38, 45], [28, 41], [36, 38], []],
  ["Backup and restore validation", 10, "Approved", "Technical assessment", "2025-12-01", "2026-01-31", [10, 50], [27, 34, 37], [30], [14], [43, 50]],
  ["Certificate infrastructure review", 40, "Draft", "Technical assessment", "2026-05-15", "2026-07-15", [40, 6], [26, 49], [49], [5, 40, 49], [25, 42]],
  ["Security awareness program assessment", 1, "Scoring", "Program review", "2026-02-01", "2026-04-30", [3, 43], [2, 5, 10, 50], [2, 10, 22, 38, 39], [35], [3, 4, 17, 18]],
  ["Privilege access review Q1", 20, "Approved", "IAM review", "2026-01-15", "2026-02-28", [7, 14, 2], [4, 16, 28], [5, 16], [8, 9, 26], [7, 8, 28, 29, 44]],
  ["Patch compliance assessment", 39, "Overdue", "Technical assessment", "2026-03-01", "2026-04-15", [3, 39, 38, 34], [9, 22], [12, 19], [1, 12, 37], [15, 16, 35]],
  ["DDoS resilience test", 15, "Approved", "Penetration test", "2025-10-01", "2025-11-30", [1, 11, 12], [3], [4, 14], [6, 11, 23, 27], [5, 6]],
  ["Data governance review", 9, "Draft", "Compliance audit", "2026-06-01", "2026-08-31", [2, 17, 35], [4, 17, 48], [5], [7, 36], [7, 8, 30]],
  ["Cryptographic controls audit", 40, "Approved", "Technical assessment", "2025-08-15", "2025-10-15", [6, 14, 40], [14, 26], [6, 49], [5, 40, 49], [25, 26]],
  ["SOC maturity assessment", 49, "Scoring", "Program review", "2026-02-01", "2026-05-31", [20, 49], [1, 3, 12, 44], [1, 4, 13], [11, 15], [1, 5]],
  ["DNS infrastructure security review", 15, "Approved", "Technical assessment", "2026-01-01", "2026-02-15", [11], [3, 41], [14, 37], [33], [5, 6]],
  ["Session management security test", 9, "Scoring", "Penetration test", "2026-03-01", "2026-04-15", [1, 21, 14], [16, 32], [17, 48], [20, 24, 30], [28, 29, 47]],
  ["Annual executive risk report 2025", 7, "Approved", "Executive review", "2025-12-01", "2025-12-31", [1, 2, 7, 43], [1, 2, 12, 26, 33], [1, 2, 5, 13], [1, 3, 8, 35], [1, 2, 3, 21, 41, 46]],
];

export const riskAssessments: MockCyberRiskAssessment[] = raw.map(
  ([name, ownerIdx, status, assessmentType, startDate, dueDate, astIdxs, crIdxs, thrIdxs, vulnIdxs, scIdxs], i) => ({
    id: padId("CRA", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    status,
    assessmentType,
    startDate,
    dueDate,
    assetIds: astIdxs.map((n) => padId("AST", n)),
    cyberRiskIds: crIdxs.map((n) => padId("CR", n)),
    threatIds: dedupeIdsPreserveOrder(
      thrIdxs.map((n) => remapThreatIdFromLegacySequential(n)),
    ),
    vulnerabilityIds: vulnIdxs.map((n) => padId("VUL", n)),
    scenarioIds: scIdxs.map((n) => padId("SC", n)),
  }),
);

const assessmentById = new Map(riskAssessments.map((a) => [a.id, a]));

export function getRiskAssessmentById(id: string): MockCyberRiskAssessment | undefined {
  return assessmentById.get(id);
}
