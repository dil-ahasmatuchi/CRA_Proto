import { padId } from "./types.js";
import type { MockCyberRiskAssessment, AssessmentStatus } from "./types.js";
import { cyberRisks } from "./cyberRisks.js";
import { threats } from "./threats.js";
import { vulnerabilities } from "./vulnerabilities.js";
import { scenarios } from "./scenarios.js";

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

/** 3–7 asset indices in 1..150, deterministic per assessment index. */
function pickAssetIdxs(i: number): number[] {
  const n = 3 + (i % 5);
  const acc = new Set<number>();
  let k = 0;
  while (acc.size < n) {
    acc.add(1 + ((i * 19 + k * 41) % 150));
    k += 1;
  }
  return [...acc].sort((a, b) => a - b);
}

type Meta = {
  name: string;
  ownerIdx: number;
  status: AssessmentStatus;
  assessmentType: string;
  startDate: string;
  dueDate: string;
};

const ASSESSMENT_META: Meta[] = [
  { name: "Q1 2026 enterprise risk assessment", ownerIdx: 7, status: "Approved", assessmentType: "Full assessment", startDate: "2026-01-06", dueDate: "2026-03-31" },
  { name: "Annual cybersecurity review 2026", ownerIdx: 14, status: "Scoring", assessmentType: "Annual review", startDate: "2026-01-15", dueDate: "2026-06-30" },
  { name: "Payment systems security assessment", ownerIdx: 9, status: "Approved", assessmentType: "Targeted assessment", startDate: "2025-11-01", dueDate: "2026-01-31" },
  { name: "Cloud infrastructure risk evaluation", ownerIdx: 29, status: "Overdue", assessmentType: "Infrastructure review", startDate: "2026-02-01", dueDate: "2026-04-30" },
  { name: "Third-party vendor risk assessment", ownerIdx: 9, status: "Scoring", assessmentType: "Vendor assessment", startDate: "2026-01-20", dueDate: "2026-05-15" },
  { name: "Data privacy compliance audit", ownerIdx: 33, status: "Approved", assessmentType: "Compliance audit", startDate: "2025-10-01", dueDate: "2025-12-31" },
  { name: "Network security penetration test", ownerIdx: 15, status: "Approved", assessmentType: "Penetration test", startDate: "2026-02-15", dueDate: "2026-03-15" },
  { name: "Application security review", ownerIdx: 27, status: "Overdue", assessmentType: "Code review", startDate: "2026-03-01", dueDate: "2026-05-31" },
  { name: "Incident response readiness assessment", ownerIdx: 49, status: "Scoping", assessmentType: "Tabletop exercise", startDate: "2026-04-01", dueDate: "2026-06-30" },
  { name: "Business continuity risk evaluation", ownerIdx: 20, status: "Scoring", assessmentType: "BCP review", startDate: "2026-02-01", dueDate: "2026-04-15" },
  { name: "Endpoint security assessment", ownerIdx: 39, status: "Approved", assessmentType: "Technical assessment", startDate: "2025-12-01", dueDate: "2026-02-28" },
  { name: "Identity and access management review", ownerIdx: 7, status: "Scoring", assessmentType: "IAM review", startDate: "2026-03-01", dueDate: "2026-05-31" },
  { name: "Database security assessment", ownerIdx: 17, status: "Approved", assessmentType: "Technical assessment", startDate: "2025-09-15", dueDate: "2025-11-30" },
  { name: "Supply chain security review", ownerIdx: 9, status: "Draft", assessmentType: "Vendor assessment", startDate: "2026-04-15", dueDate: "2026-07-31" },
  { name: "Q2 2026 risk assessment cycle", ownerIdx: 14, status: "Draft", assessmentType: "Full assessment", startDate: "2026-04-01", dueDate: "2026-06-30" },
  { name: "Mobile application security test", ownerIdx: 13, status: "Approved", assessmentType: "Penetration test", startDate: "2026-01-10", dueDate: "2026-02-10" },
  { name: "Email system security evaluation", ownerIdx: 3, status: "Approved", assessmentType: "Targeted assessment", startDate: "2025-08-01", dueDate: "2025-10-31" },
  { name: "Financial systems risk assessment", ownerIdx: 16, status: "Scoring", assessmentType: "Full assessment", startDate: "2026-02-15", dueDate: "2026-05-15" },
  { name: "Regulatory compliance assessment", ownerIdx: 33, status: "Scoring", assessmentType: "Compliance audit", startDate: "2026-01-01", dueDate: "2026-03-31" },
  { name: "Container security review", ownerIdx: 29, status: "Draft", assessmentType: "Technical assessment", startDate: "2026-04-01", dueDate: "2026-06-15" },
  { name: "API security assessment", ownerIdx: 13, status: "Approved", assessmentType: "Penetration test", startDate: "2025-11-15", dueDate: "2026-01-15" },
  { name: "Physical security review", ownerIdx: 38, status: "Scoring", assessmentType: "Physical assessment", startDate: "2026-03-01", dueDate: "2026-04-30" },
  { name: "Social engineering resilience test", ownerIdx: 36, status: "Approved", assessmentType: "Penetration test", startDate: "2025-10-15", dueDate: "2025-12-15" },
  { name: "Disaster recovery assessment", ownerIdx: 10, status: "Overdue", assessmentType: "BCP review", startDate: "2026-02-01", dueDate: "2026-04-30" },
  { name: "Encryption standards review", ownerIdx: 40, status: "Approved", assessmentType: "Technical assessment", startDate: "2025-12-15", dueDate: "2026-02-15" },
  { name: "Insider threat assessment", ownerIdx: 20, status: "Scoring", assessmentType: "Full assessment", startDate: "2026-03-15", dueDate: "2026-06-15" },
  { name: "Web application security review", ownerIdx: 27, status: "Approved", assessmentType: "Penetration test", startDate: "2025-09-01", dueDate: "2025-11-30" },
  { name: "Cloud storage security audit", ownerIdx: 8, status: "Approved", assessmentType: "Technical assessment", startDate: "2026-01-01", dueDate: "2026-02-28" },
  { name: "Zero trust architecture assessment", ownerIdx: 15, status: "Draft", assessmentType: "Architecture review", startDate: "2026-05-01", dueDate: "2026-08-31" },
  { name: "GDPR readiness assessment", ownerIdx: 33, status: "Approved", assessmentType: "Compliance audit", startDate: "2025-07-01", dueDate: "2025-09-30" },
  { name: "Ransomware preparedness review", ownerIdx: 7, status: "Scoring", assessmentType: "Tabletop exercise", startDate: "2026-03-01", dueDate: "2026-04-30" },
  { name: "DevOps pipeline security assessment", ownerIdx: 28, status: "Scoring", assessmentType: "Technical assessment", startDate: "2026-02-15", dueDate: "2026-04-30" },
  { name: "Customer data protection review", ownerIdx: 7, status: "Approved", assessmentType: "Full assessment", startDate: "2025-10-01", dueDate: "2025-12-31" },
  { name: "Network perimeter assessment", ownerIdx: 15, status: "Approved", assessmentType: "Penetration test", startDate: "2026-01-15", dueDate: "2026-02-15" },
  { name: "Wireless network security assessment", ownerIdx: 37, status: "Overdue", assessmentType: "Technical assessment", startDate: "2026-03-15", dueDate: "2026-04-30" },
];

function buildAssessmentRow(meta: Meta, index: number): MockCyberRiskAssessment {
  const assetIdxs = pickAssetIdxs(index);
  const assetIds = assetIdxs.map((n) => padId("AST", n));
  const assetSet = new Set(assetIds);

  const cyberRiskIds = dedupeIdsPreserveOrder(
    cyberRisks.filter((cr) => cr.assetIds.some((a) => assetSet.has(a))).map((cr) => cr.id),
  );
  const threatIds = dedupeIdsPreserveOrder(
    threats.filter((t) => t.assetIds.some((a) => assetSet.has(a))).map((t) => t.id),
  );
  const vulnerabilityIds = dedupeIdsPreserveOrder(
    vulnerabilities.filter((v) => assetSet.has(v.relationships.assetId)).map((v) => v.id),
  );
  const crSet = new Set(cyberRiskIds);
  const scenarioIds = dedupeIdsPreserveOrder(
    scenarios.filter((s) => assetSet.has(s.assetId) && crSet.has(s.cyberRiskId)).map((s) => s.id),
  );

  return {
    id: padId("CRA", index + 1),
    name: meta.name,
    ownerId: padId("USR", meta.ownerIdx),
    status: meta.status,
    assessmentType: meta.assessmentType,
    startDate: meta.startDate,
    dueDate: meta.dueDate,
    assetIds,
    cyberRiskIds,
    threatIds,
    vulnerabilityIds,
    scenarioIds,
  };
}

export const riskAssessments: MockCyberRiskAssessment[] = ASSESSMENT_META.map((m, i) =>
  buildAssessmentRow(m, i),
);

const assessmentById = new Map(riskAssessments.map((a) => [a.id, a]));

export function getRiskAssessmentById(id: string): MockCyberRiskAssessment | undefined {
  return assessmentById.get(id);
}

/**
 * CRA assessments that actually include this threat in their in-scope scenarios: at least one
 * assessment `scenarioIds` entry references a scenario whose `threatIds` contains `threatId`.
 *
 * (Assessments also carry a broad `threatIds` list from asset overlap alone; that is almost every
 * threat for many assessments, so it must not drive this list.)
 */
export function getRiskAssessmentsForThreatId(threatId: string): MockCyberRiskAssessment[] {
  const scenarioIdsForThreat = new Set(
    scenarios.filter((s) => s.threatIds.includes(threatId)).map((s) => s.id),
  );
  return riskAssessments.filter((a) =>
    a.scenarioIds.some((sid) => scenarioIdsForThreat.has(sid)),
  );
}
