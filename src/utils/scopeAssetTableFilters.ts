import { businessUnits } from "../data/businessUnits.js";
import { cyberRisks } from "../data/cyberRisks.js";
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

/**
 * Display names for scope asset objectives column (1–12); each index maps to that objective value.
 */
export const SCOPE_OBJECTIVE_NAME_OPTIONS: readonly string[] = Array.from(
  { length: 12 },
  (_, i) => `Objective ${i + 1}`,
);

/**
 * Display names for scope asset processes column (1–20); each index maps to that process value.
 */
export const SCOPE_PROCESS_NAME_OPTIONS: readonly string[] = Array.from(
  { length: 20 },
  (_, i) => `Process ${i + 1}`,
);

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
  /** Subset of [`SCOPE_OBJECTIVE_NAME_OPTIONS`]. */
  objectiveNames: string[];
  processNames: string[];
  businessUnitIds: string[];
};

export const EMPTY_SCOPE_ASSET_TABLE_FILTERS: ScopeAssetTableFilters = {
  assetTypes: [],
  cyberRiskIds: [],
  threatIds: [],
  vulnerabilityIds: [],
  criticality: [],
  objectiveNames: [],
  processNames: [],
  businessUnitIds: [],
};

const objectiveNameToValue = new Map(
  SCOPE_OBJECTIVE_NAME_OPTIONS.map((n, i) => [n, i + 1] as const),
);
const processNameToValue = new Map(
  SCOPE_PROCESS_NAME_OPTIONS.map((n, i) => [n, i + 1] as const),
);

export function hasAnyScopeAssetFilterSelected(
  f: ScopeAssetTableFilters,
): boolean {
  if (f.assetTypes.length > 0) return true;
  if (f.cyberRiskIds.length > 0) return true;
  if (f.threatIds.length > 0) return true;
  if (f.vulnerabilityIds.length > 0) return true;
  if (f.criticality.length > 0) return true;
  if (f.objectiveNames.length > 0) return true;
  if (f.processNames.length > 0) return true;
  if (f.businessUnitIds.length > 0) return true;
  return false;
}

export type ScopeAssetFilterableRow = {
  assetId: string;
  assetType: string;
  businessUnitId: string;
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

export function applyScopeAssetFilters<T extends ScopeAssetFilterableRow>(
  rows: T[],
  filters: ScopeAssetTableFilters,
): T[] {
  const typeSet =
    filters.assetTypes.length > 0 ? new Set(filters.assetTypes) : null;
  const buSet =
    filters.businessUnitIds.length > 0
      ? new Set(filters.businessUnitIds)
      : null;
  const critSet =
    filters.criticality.length > 0
      ? new Set(filters.criticality)
      : null;
  const objAllowed =
    filters.objectiveNames.length > 0
      ? new Set(
          filters.objectiveNames
            .map((n) => objectiveNameToValue.get(n))
            .filter((n): n is number => n != null),
        )
      : null;
  const procAllowed =
    filters.processNames.length > 0
      ? new Set(
          filters.processNames
            .map((n) => processNameToValue.get(n))
            .filter((n): n is number => n != null),
        )
      : null;

  return rows.filter((row) => {
    if (typeSet && !typeSet.has(row.assetType as AssetType)) return false;
    if (buSet && !buSet.has(row.businessUnitId)) return false;
    if (critSet && !critSet.has(row.criticality)) return false;
    if (objAllowed && !objAllowed.has(row.objectives)) return false;
    if (procAllowed && !procAllowed.has(row.processes)) return false;
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

export function getScopeAssetBusinessUnitFilterOptions(): { id: string; name: string }[] {
  return businessUnits
    .map((bu) => ({ id: bu.id, name: bu.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
