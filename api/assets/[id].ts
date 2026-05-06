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
};

function enrichAsset(db: ReturnType<typeof getDb>, asset: AssetRow) {
  const threat_ids = (
    db.prepare("SELECT threat_id FROM asset_threats WHERE asset_id = ?").all(asset.id) as { threat_id: string }[]
  ).map((r) => r.threat_id);

  const vulnerability_category_ids = (
    db.prepare("SELECT vulnerability_category_id FROM asset_vulnerability_categories WHERE asset_id = ?").all(asset.id) as { vulnerability_category_id: string }[]
  ).map((r) => r.vulnerability_category_id);

  const cyber_risk_ids = (
    db.prepare("SELECT cyber_risk_id FROM asset_cyber_risks WHERE asset_id = ?").all(asset.id) as { cyber_risk_id: string }[]
  ).map((r) => r.cyber_risk_id);

  const control_ids = (
    db.prepare("SELECT control_id FROM control_assets WHERE asset_id = ?").all(asset.id) as { control_id: string }[]
  ).map((r) => r.control_id);

  return {
    ...asset,
    threat_ids,
    vulnerability_category_ids,
    cyber_risk_ids,
    control_ids,
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const id = req.query.id as string;

  if (!id) return res.status(400).json({ error: "Missing id" });

  const asset = db.prepare("SELECT * FROM assets WHERE id = ?").get(id) as AssetRow | undefined;

  if (!asset) return res.status(404).json({ error: `Asset not found: ${id}` });

  return res.status(200).json(enrichAsset(db, asset));
}
