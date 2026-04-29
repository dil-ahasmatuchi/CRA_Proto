import { orgUnits } from "../data/orgUnits.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { objectives } from "../data/objectives.js";
import { processes } from "../data/processes.js";
import { threats } from "../data/threats.js";
import {
  isVulnerabilityActiveForAssessment,
  vulnerabilities,
} from "../data/vulnerabilities.js";
import type { AssetType, FivePointScaleValue } from "../data/types.js";

/** Same set as [`src/data/assets.ts`](../../data/assets.ts) `ASSET_TYPES` and `AssetType` union. */
export const ASSET_TYPE_FILTER_OPTIONS: readonly AssetType[] = [
  "Application",
  "Database",
  "Server",
  "Network device",
  "Cloud service",
  "Endpoint",
  "IoT device",
] as const;

/** Aligns with scope grid criticality display (Assessment scope assets table). */
export const SCOPE_CRITICALITY_FILTER_OPTIONS: readonly {
  value: FivePointScaleValue;
  label: string;
}[] = [
  { value: 5, label: "5 - Very high" },
  { value: 4, label: "4 - High" },
  { value: 3, label: "3 - Medium" },
  { value: 2, label: "2 - Low" },
  { value: 1, label: "1 - Very low" },
];

export type ScopeAssetTableFilters = {
  assetTypes: AssetType[];
  /** Library cyber risk ids: row matches if the asset is linked to at least one selected risk. */
  cyberRiskIds: string[];
  threatIds: string[];
  vulnerabilityIds: string[];
  criticality: FivePointScaleValue[];
  /** Library objective ids: row matches if the asset appears in that objective’s `relationships.assetIds`. */
  objectiveIds: string[];
  /** Library process ids: row matches if the asset appears in that process’s `relationships.assetIds`. */
  processIds: string[];
  orgUnitIds: string[];
};

export const EMPTY_SCOPE_ASSET_TABLE_FILTERS: ScopeAssetTableFilters = {
  assetTypes: [],
  cyberRiskIds: [],
  threatIds: [],
  vulnerabilityIds: [],
  criticality: [],
  objectiveIds: [],
  processIds: [],
  orgUnitIds: [],
};

export function hasAnyScopeAssetFilterSelected(
  f: ScopeAssetTableFilters,
): boolean {
  return countScopeAssetFilterCriteria(f) > 0;
}

/**
 * Number of filter **categories** with at least one selection (not total selected values).
 * Categories: asset types, cyber risks, threats, vulnerabilities, criticality, objectives, processes, org. units.
 */
export function countScopeAssetFilterCriteria(f: ScopeAssetTableFilters): number {
  let n = 0;
  if (f.assetTypes.length > 0) n += 1;
  if (f.cyberRiskIds.length > 0) n += 1;
  if (f.threatIds.length > 0) n += 1;
  if (f.vulnerabilityIds.length > 0) n += 1;
  if (f.criticality.length > 0) n += 1;
  if (f.objectiveIds.length > 0) n += 1;
  if (f.processIds.length > 0) n += 1;
  if (f.orgUnitIds.length > 0) n += 1;
  return n;
}

export type ScopeAssetFilterableRow = {
  assetId: string;
  assetType: string;
  orgUnitId: string;
  criticality: FivePointScaleValue;
  objectives: number;
  processes: number;
};

function assetTouchedByCyberRiskId(assetId: string, crId: string): boolean {
  const cr = cyberRisks.find((r) => r.id === crId);
  return cr != null && cr.assetIds.includes(assetId);
}

function assetTouchedByThreatId(assetId: string, threatId: string): boolean {
  const t = threats.find((x) => x.id === threatId);
  return t != null && t.assetIds.includes(assetId);
}

function assetTouchedByVulnerabilityId(
  assetId: string,
  vulnerabilityId: string,
): boolean {
  const v = vulnerabilities.find((x) => x.id === vulnerabilityId);
  return v != null && isVulnerabilityActiveForAssessment(v) && v.assetIds.includes(assetId);
}

function assetTouchedByObjectiveId(assetId: string, objectiveId: string): boolean {
  const o = objectives.find((x) => x.id === objectiveId);
  return o != null && o.relationships.assetIds.includes(assetId);
}

function assetTouchedByProcessId(assetId: string, processId: string): boolean {
  const p = processes.find((x) => x.id === processId);
  return p != null && p.relationships.assetIds.includes(assetId);
}

export function applyScopeAssetFilters<T extends ScopeAssetFilterableRow>(
  rows: T[],
  filters: ScopeAssetTableFilters,
): T[] {
  const typeSet =
    filters.assetTypes.length > 0 ? new Set(filters.assetTypes) : null;
  const buSet =
    filters.orgUnitIds.length > 0
      ? new Set(filters.orgUnitIds)
      : null;
  const critSet =
    filters.criticality.length > 0
      ? new Set(filters.criticality)
      : null;

  return rows.filter((row) => {
    if (typeSet && !typeSet.has(row.assetType as AssetType)) return false;
    if (buSet && !buSet.has(row.orgUnitId)) return false;
    if (critSet && !critSet.has(row.criticality)) return false;
    if (
      filters.objectiveIds.length > 0 &&
      !filters.objectiveIds.some((id) => assetTouchedByObjectiveId(row.assetId, id))
    ) {
      return false;
    }
    if (
      filters.processIds.length > 0 &&
      !filters.processIds.some((id) => assetTouchedByProcessId(row.assetId, id))
    ) {
      return false;
    }
    if (
      filters.cyberRiskIds.length > 0 &&
      !filters.cyberRiskIds.some((id) => assetTouchedByCyberRiskId(row.assetId, id))
    ) {
      return false;
    }
    if (
      filters.threatIds.length > 0 &&
      !filters.threatIds.some((id) => assetTouchedByThreatId(row.assetId, id))
    ) {
      return false;
    }
    if (
      filters.vulnerabilityIds.length > 0 &&
      !filters.vulnerabilityIds.some((id) =>
        assetTouchedByVulnerabilityId(row.assetId, id),
      )
    ) {
      return false;
    }
    return true;
  });
}

export function getScopeAssetCyberRiskFilterOptions(): { id: string; name: string }[] {
  return cyberRisks
    .map((r) => ({ id: r.id, name: r.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getScopeAssetThreatFilterOptions(): { id: string; name: string }[] {
  return threats
    .map((t) => ({ id: t.id, name: t.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getScopeAssetVulnerabilityFilterOptions(): { id: string; name: string }[] {
  return vulnerabilities
    .filter(isVulnerabilityActiveForAssessment)
    .map((v) => ({ id: v.id, name: v.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getScopeAssetOrgUnitFilterOptions(): { id: string; name: string }[] {
  return orgUnits
    .map((bu) => ({ id: bu.id, name: bu.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getScopeAssetObjectiveFilterOptions(): { id: string; name: string }[] {
  return objectives
    .map((o) => ({ id: o.id, name: o.title }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getScopeAssetProcessFilterOptions(): { id: string; name: string }[] {
  return processes
    .map((p) => ({ id: p.id, name: p.title }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
