import type { MockOrgUnit } from "./types.js";

const raw: [string, string][] = [
  ["Human Resources", "San Francisco"],
  ["Finance", "New York"],
  ["Legal", "London"],
  ["IT Operations", "Singapore"],
  ["Engineering", "Austin"],
  ["Marketing", "Chicago"],
  ["Sales", "Toronto"],
  ["Customer Support", "Dublin"],
  ["Compliance", "Frankfurt"],
  ["Risk Management", "Boston"],
  ["Product Development", "Seattle"],
  ["Procurement", "Sydney"],
  ["Internal Audit", "Amsterdam"],
  ["Data Analytics", "Berlin"],
  ["Security Operations", "San Francisco"],
  ["Corporate Strategy", "New York"],
  ["Investor Relations", "London"],
  ["Business Development", "Tokyo"],
  ["Research", "Singapore"],
  ["Facilities Management", "Chicago"],
  ["Human Resources", "London"],
  ["Finance", "Singapore"],
  ["Legal", "New York"],
  ["IT Operations", "Austin"],
  ["Engineering", "Berlin"],
  ["Marketing", "Toronto"],
  ["Sales", "Sydney"],
  ["Customer Support", "San Francisco"],
  ["Compliance", "Boston"],
  ["Risk Management", "Dublin"],
  ["Product Development", "Amsterdam"],
  ["Procurement", "Tokyo"],
  ["Internal Audit", "Frankfurt"],
  ["Data Analytics", "Seattle"],
  ["Security Operations", "London"],
  ["Corporate Strategy", "Singapore"],
  ["Investor Relations", "Chicago"],
  ["Business Development", "Austin"],
  ["Research", "New York"],
  ["Facilities Management", "Sydney"],
  ["Human Resources", "Toronto"],
  ["Finance", "Dublin"],
  ["Legal", "Frankfurt"],
  ["IT Operations", "Berlin"],
  ["Engineering", "Amsterdam"],
  ["Marketing", "Tokyo"],
  ["Sales", "San Francisco"],
  ["Customer Support", "Seattle"],
  ["Compliance", "London"],
  ["Risk Management", "New York"],
];

export const orgUnits: MockOrgUnit[] = raw.map(
  ([dept, location], i) => ({
    id: `BU-${String(i + 1).padStart(3, "0")}`,
    name: `${dept} \u2013 ${location}`,
  }),
);

const orgUnitById = new Map(orgUnits.map((ou) => [ou.id, ou]));

function rebuildOrgUnitIndex(): void {
  orgUnitById.clear();
  for (const ou of orgUnits) {
    orgUnitById.set(ou.id, ou);
  }
}

export function replaceOrgUnitsFromPersistence(next: MockOrgUnit[]): void {
  orgUnits.length = 0;
  orgUnits.push(...next);
  rebuildOrgUnitIndex();
}

export function getOrgUnitById(id: string): MockOrgUnit | undefined {
  return orgUnitById.get(id);
}
