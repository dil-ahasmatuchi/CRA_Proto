import type { RelationLinkedObjectRowProps } from "../components/RelationLinkedObjectRow.js";
import type { MockThreat, ThreatStatus } from "../data/types.js";
import { getThreatById } from "../data/threats.js";

function threatStatusColor(
  status: ThreatStatus,
): NonNullable<RelationLinkedObjectRowProps["status"]>["color"] {
  if (status === "Active") return "success";
  if (status === "Draft") return "subtle";
  return "generic";
}

function threatToRow(t: MockThreat): RelationLinkedObjectRowProps {
  const base = `/cyber-risk/threats/${encodeURIComponent(t.id)}`;
  return {
    itemKey: t.id,
    objectId: t.displayId,
    objectName: t.name,
    idHref: base,
    nameHref: base,
    status: { label: t.status, color: threatStatusColor(t.status) },
  };
}

/** Linked threats for a cyber risk, in ID order. */
export function rowsForCyberRiskThreatIds(threatIds: string[]): RelationLinkedObjectRowProps[] {
  const out: RelationLinkedObjectRowProps[] = [];
  for (const id of threatIds) {
    const t = getThreatById(id);
    if (t) out.push(threatToRow(t));
  }
  return out;
}
