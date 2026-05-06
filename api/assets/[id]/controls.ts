/**
 * GET /api/assets/:id/controls
 *
 * Returns the full control objects (with linked cyber_risk_ids)
 * that are linked to the given asset via the control_assets junction table.
 *
 * Query params:
 *   control_type – filter by type       (e.g. "Preventive", "Detective")
 *   status       – filter by status     (e.g. "Active")
 *   key_control  – "true" to return only key controls
 *   search       – substring match on name or description
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db.js";

type ControlRow = {
  id: string;
  display_id: string;
  name: string;
  description: string | null;
  control_type: string;
  key_control: number;
  control_frequency: string | null;
  effectiveness: number | null;
  effectiveness_label: string | null;
  status: string;
  owner: string | null;
  created_at: string;
  updated_at: string;
};

function enrichControl(db: ReturnType<typeof getDb>, control: ControlRow) {
  const cyber_risk_ids = (
    db.prepare("SELECT cyber_risk_id FROM control_cyber_risks WHERE control_id = ?").all(control.id) as { cyber_risk_id: string }[]
  ).map((r) => r.cyber_risk_id);

  return {
    ...control,
    key_control: control.key_control === 1,
    cyber_risk_ids,
  };
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

  const { control_type, status, key_control, search } = req.query;

  const conditions: string[] = ["ca.asset_id = ?"];
  const params: unknown[] = [id];

  if (control_type && typeof control_type === "string") {
    conditions.push("c.control_type = ?");
    params.push(control_type);
  }
  if (status && typeof status === "string") {
    conditions.push("c.status = ?");
    params.push(status);
  }
  if (key_control === "true") {
    conditions.push("c.key_control = 1");
  }
  if (search && typeof search === "string") {
    conditions.push("(c.name LIKE ? OR c.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.join(" AND ");
  const sql = `
    SELECT c.*
    FROM controls c
    JOIN control_assets ca ON ca.control_id = c.id
    WHERE ${where}
    ORDER BY c.key_control DESC, c.control_type ASC, c.name ASC
  `;

  const rows = db.prepare(sql).all(...params) as ControlRow[];
  const enriched = rows.map((r) => enrichControl(db, r));

  return res.status(200).json(enriched);
}
