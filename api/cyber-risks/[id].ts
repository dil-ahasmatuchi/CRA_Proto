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

const SCORE_LABELS = ["Very low", "Low", "Medium", "High", "Very high"];

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
  const id = req.query.id as string;

  const risk = db
    .prepare("SELECT * FROM cyber_risks WHERE id = ?")
    .get(id) as CyberRiskRow | undefined;

  if (!risk) {
    return res.status(404).json({ error: `Cyber risk not found: ${id}` });
  }

  // ── GET /api/cyber-risks/:id ──────────────────────────────────────────────
  if (req.method === "GET") {
    return res.status(200).json(enrichRisk(db, risk));
  }

  // ── PUT /api/cyber-risks/:id ──────────────────────────────────────────────
  if (req.method === "PUT") {
    const { name, domain, description, status, inherent_score, residual_score } =
      req.body as {
        name?: string;
        domain?: string;
        description?: string;
        status?: string;
        inherent_score?: number;
        residual_score?: number;
      };

    db.prepare(`
      UPDATE cyber_risks SET
        name = COALESCE(@name, name),
        domain = COALESCE(@domain, domain),
        description = COALESCE(@description, description),
        status = COALESCE(@status, status),
        inherent_score = COALESCE(@inherent_score, inherent_score),
        inherent_score_label = COALESCE(@inherent_score_label, inherent_score_label),
        residual_score = COALESCE(@residual_score, residual_score),
        residual_score_label = COALESCE(@residual_score_label, residual_score_label),
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id,
      name: name ?? null,
      domain: domain ?? null,
      description: description ?? null,
      status: status ?? null,
      inherent_score: inherent_score ?? null,
      inherent_score_label:
        inherent_score != null ? (SCORE_LABELS[inherent_score - 1] ?? null) : null,
      residual_score: residual_score ?? null,
      residual_score_label:
        residual_score != null ? (SCORE_LABELS[residual_score - 1] ?? null) : null,
    });

    const updated = db
      .prepare("SELECT * FROM cyber_risks WHERE id = ?")
      .get(id) as CyberRiskRow;
    return res.status(200).json(enrichRisk(db, updated));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
