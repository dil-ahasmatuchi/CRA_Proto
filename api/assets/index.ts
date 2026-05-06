import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../lib/db.js";

type AssetRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  asset_type: string;
  criticality: number;
  criticality_label: string;
  status: string;
  created_at: string;
  updated_at: string;
  threat_count: number;
  vuln_count: number;
  cyber_risk_count: number;
  control_count: number;
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const { status, asset_type, search } = req.query;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && typeof status === "string") {
    conditions.push("a.status = ?");
    params.push(status);
  }
  if (asset_type && typeof asset_type === "string") {
    conditions.push("a.asset_type = ?");
    params.push(asset_type);
  }
  if (search && typeof search === "string") {
    conditions.push("(a.name LIKE ? OR a.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      a.*,
      (SELECT COUNT(*) FROM asset_threats              WHERE asset_id = a.id) AS threat_count,
      (SELECT COUNT(*) FROM asset_vulnerability_categories WHERE asset_id = a.id) AS vuln_count,
      (SELECT COUNT(*) FROM asset_cyber_risks          WHERE asset_id = a.id) AS cyber_risk_count,
      (SELECT COUNT(*) FROM control_assets             WHERE asset_id = a.id) AS control_count
    FROM assets a
    ${where}
    ORDER BY a.display_id ASC
  `;

  const rows = db.prepare(sql).all(...params) as AssetRow[];
  return res.status(200).json(rows);
}
