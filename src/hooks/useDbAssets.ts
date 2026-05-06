import { useEffect, useState } from "react";
import type { FivePointScaleValue } from "../data/types.js";

/** Shape returned by GET /api/assets (includes relationship counts) */
type ApiAssetRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  asset_type: string;
  criticality: number;
  criticality_label: string;
  status: string;
  threat_count: number;
  vuln_count: number;
  cyber_risk_count: number;
  control_count: number;
};

/**
 * An asset from the database, shaped to be compatible with the fields that
 * AssessmentScopeTab's buildScopeRows() expects from MockAsset.
 */
export type DbAsset = {
  /** display_id from DB, e.g. "AST-001" — used as the scope identifier */
  id: string;
  name: string;
  assetType: string;
  criticality: FivePointScaleValue;
  criticalityLabel: string;
  /** Not stored in DB yet; empty string keeps org-unit filter inactive */
  orgUnitId: string;
  status: string;
  /** Relationship counts — used by the scope grid in place of mock data lookups */
  threatCount: number;
  vulnCount: number;
  cyberRiskCount: number;
  controlCount: number;
};

function mapRow(row: ApiAssetRow): DbAsset {
  return {
    id: row.display_id,
    name: row.name,
    assetType: row.asset_type,
    criticality: row.criticality as FivePointScaleValue,
    criticalityLabel: row.criticality_label,
    orgUnitId: "",
    status: row.status,
    threatCount: row.threat_count ?? 0,
    vulnCount: row.vuln_count ?? 0,
    cyberRiskCount: row.cyber_risk_count ?? 0,
    controlCount: row.control_count ?? 0,
  };
}

export type UseDbAssetsResult =
  | { status: "loading"; assets: null }
  | { status: "error"; assets: null; message: string }
  | { status: "ok"; assets: DbAsset[] };

/**
 * Fetches assets from the local /api/assets endpoint (SQLite-backed).
 * Only returns Active assets.
 */
export function useDbAssets(): UseDbAssetsResult {
  const [result, setResult] = useState<UseDbAssetsResult>({ status: "loading", assets: null });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/assets?status=Active")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ApiAssetRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          setResult({ status: "ok", assets: rows.map(mapRow) });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ status: "error", assets: null, message: String(err) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return result;
}
