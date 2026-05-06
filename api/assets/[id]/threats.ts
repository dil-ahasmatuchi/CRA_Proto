/**
 * GET /api/assets/:id/threats
 *
 * Returns the full threat objects (with sources, actors, attack_vectors)
 * that are linked to the given asset via the asset_threats junction table.
 *
 * Query params:
 *   status   – filter by threat status   (e.g. "Active")
 *   domain   – filter by threat domain   (e.g. "Cloud & Virtualisation")
 *   search   – case-insensitive substring match on threat name or description
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../../lib/db.js";

type ThreatRow = {
  id: string;
  display_id: string;
  name: string;
  domain: string;
  description: string | null;
  status: string;
  owner: string | null;
  severity_level: number | null;
  created_at: string;
  updated_at: string;
};

function enrichThreat(db: ReturnType<typeof getDb>, threat: ThreatRow) {
  const sources = (
    db.prepare("SELECT source_type FROM threat_sources WHERE threat_id = ?").all(threat.id) as { source_type: string }[]
  ).map((r) => r.source_type);

  const actors = (
    db.prepare("SELECT actor_type FROM threat_actors WHERE threat_id = ?").all(threat.id) as { actor_type: string }[]
  ).map((r) => r.actor_type);

  const attack_vectors = (
    db.prepare("SELECT attack_vector FROM threat_attack_vectors WHERE threat_id = ?").all(threat.id) as { attack_vector: string }[]
  ).map((r) => r.attack_vector);

  return { ...threat, sources, actors, attack_vectors };
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

  const conditions: string[] = ["at.asset_id = ?"];
  const params: unknown[] = [id];

  if (status && typeof status === "string") {
    conditions.push("t.status = ?");
    params.push(status);
  }
  if (domain && typeof domain === "string") {
    conditions.push("t.domain = ?");
    params.push(domain);
  }
  if (search && typeof search === "string") {
    conditions.push("(t.name LIKE ? OR t.description LIKE ?)");
    params.push(`%${search}%`, `%${search}%`);
  }

  const where = conditions.join(" AND ");
  const sql = `
    SELECT t.*
    FROM threats t
    JOIN asset_threats at ON at.threat_id = t.id
    WHERE ${where}
    ORDER BY t.severity_level DESC, t.name ASC
  `;

  const rows = db.prepare(sql).all(...params) as ThreatRow[];
  const enriched = rows.map((r) => enrichThreat(db, r));

  return res.status(200).json(enriched);
}
