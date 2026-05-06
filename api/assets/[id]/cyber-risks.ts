/**
 * GET /api/assets/:id/cyber-risks
 *
 * Returns the full cyber risk objects (with linked control_ids)
 * that are linked to the given asset via asset_cyber_risks.
 *
 * Query params:
 *   status – filter by risk status  (e.g. "Assessment")
 *   domain – filter by risk domain  (e.g. "Data & Information")
 *   search – substring match on name or description
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db.js";

type CyberRiskRow = {
  id: string;
  display_id: string;
  name: string;
  domain: string | null;
  description: string | null;
  status: string;
  inherent_score: number | null;
  inherent_score_label: string | null;
  residual_score: number | null;
  residual_score_label: string | null;
  created_at: string;
  updated_at: string;
};

function enrichRisk(db: ReturnType<typeof getDb>, risk: CyberRiskRow) {
  const control_ids = (
    db.prepare("SELECT control_id FROM control_cyber_risks WHERE cyber_risk_id = ?").all(risk.id) as { control_id: string }[]
  ).map((r) => r.control_id);

  return { ...risk, control_ids };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = getDb();
  const id = req.query.id as string;

  if (!id) return res.status(400).json({ error: "Missing asset id" });

  const assetExists = db.prepare("SELECT id FROM assets WHERE id = ?").get(id);
  if (!assetExists) return res.status(404).json({ error: `Asset not found: ${id}` });

  const { status, domain, search } = req.query;

  const conditions: string[] = ["acr.asset_id = ?"];
  const params: unknown[] = [id];

  if (status && typeof status === "string") {
    conditions.push("cr.status = ?");
    params.push(status);
  }
  if (domain && typeof domain === "string") {
    conditions.push("cr.domain = ?");
    params.push(domain);
  }
  if (search && typeof search === "string") {
    conditions.push("(cr.name LIKE ? OR cr.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.join(" AND ");
  const sql = `
    SELECT cr.*
    FROM cyber_risks cr
    JOIN asset_cyber_risks acr ON acr.cyber_risk_id = cr.id
    WHERE ${where}
    ORDER BY cr.domain ASC, cr.name ASC
  `;

  const rows = db.prepare(sql).all(...params) as CyberRiskRow[];
  const enriched = rows.map((r) => enrichRisk(db, r));

  return res.status(200).json(enriched);
}
