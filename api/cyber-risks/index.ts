import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../lib/db.js";

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
    db
      .prepare("SELECT control_id FROM control_cyber_risks WHERE cyber_risk_id = ?")
      .all(risk.id) as { control_id: string }[]
  ).map((r) => r.control_id);

  return { ...risk, control_ids };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  // ── GET /api/cyber-risks ──────────────────────────────────────────────────
  if (req.method === "GET") {
    const { asset_id, status, domain, search } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];

    // asset_id → join asset_cyber_risks junction for precise per-asset links
    if (asset_id && typeof asset_id === "string") {
      const assetExists = db.prepare("SELECT id FROM assets WHERE id = ?").get(asset_id);
      if (!assetExists) {
        return res.status(404).json({ error: `Asset not found: ${asset_id}` });
      }
      conditions.push("id IN (SELECT cyber_risk_id FROM asset_cyber_risks WHERE asset_id = ?)");
      params.push(asset_id);
    }

    if (status && typeof status === "string") {
      conditions.push("status = ?");
      params.push(status);
    }
    if (domain && typeof domain === "string") {
      conditions.push("domain = ?");
      params.push(domain);
    }
    if (search && typeof search === "string") {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const risks = db
      .prepare(`SELECT * FROM cyber_risks ${where} ORDER BY display_id ASC`)
      .all(...params) as CyberRiskRow[];

    return res.status(200).json(risks.map((r) => enrichRisk(db, r)));
  }

  // ── POST /api/cyber-risks ─────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name, domain, description, status, inherent_score, residual_score } =
      req.body as {
        name?: string;
        domain?: string;
        description?: string;
        status?: string;
        inherent_score?: number;
        residual_score?: number;
      };

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const SCORE_LABELS = ["Very low", "Low", "Medium", "High", "Very high"];

    const countRow = db
      .prepare("SELECT COUNT(*) as count FROM cyber_risks")
      .get() as { count: number };
    const seq = countRow.count + 1;
    const id = `CR-${String(seq).padStart(3, "0")}`;

    db.prepare(`
      INSERT INTO cyber_risks (id, display_id, name, domain, description, status,
        inherent_score, inherent_score_label, residual_score, residual_score_label)
      VALUES (@id, @id, @name, @domain, @description, @status,
        @inherent_score, @inherent_score_label, @residual_score, @residual_score_label)
    `).run({
      id,
      name,
      domain: domain ?? null,
      description: description ?? null,
      status: status ?? "Draft",
      inherent_score: inherent_score ?? null,
      inherent_score_label: inherent_score != null ? (SCORE_LABELS[inherent_score - 1] ?? null) : null,
      residual_score: residual_score ?? null,
      residual_score_label: residual_score != null ? (SCORE_LABELS[residual_score - 1] ?? null) : null,
    });

    const created = db
      .prepare("SELECT * FROM cyber_risks WHERE id = ?")
      .get(id) as CyberRiskRow;
    return res.status(201).json(enrichRisk(db, created));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
