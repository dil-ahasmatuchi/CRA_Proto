import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../lib/db.js";

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
  const sources = (db.prepare("SELECT source_type FROM threat_sources WHERE threat_id = ?").all(threat.id) as { source_type: string }[]).map((r) => r.source_type);
  const actors = (db.prepare("SELECT actor_type FROM threat_actors WHERE threat_id = ?").all(threat.id) as { actor_type: string }[]).map((r) => r.actor_type);
  const attack_vectors = (db.prepare("SELECT attack_vector FROM threat_attack_vectors WHERE threat_id = ?").all(threat.id) as { attack_vector: string }[]).map((r) => r.attack_vector);
  return { ...threat, sources, actors, attack_vectors };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  // ── GET /api/threats ──────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { asset_id, status, domain, search } = req.query;

    const conditions: string[] = [];
    const params: unknown[] = [];

    // asset_id → join asset_threats junction for precise per-asset links
    if (asset_id && typeof asset_id === "string") {
      const assetExists = db.prepare("SELECT id FROM assets WHERE id = ?").get(asset_id);
      if (!assetExists) {
        return res.status(404).json({ error: `Asset not found: ${asset_id}` });
      }
      conditions.push("id IN (SELECT threat_id FROM asset_threats WHERE asset_id = ?)");
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
    const sql = `SELECT * FROM threats ${where} ORDER BY name ASC`;

    const threats = db.prepare(sql).all(...params) as ThreatRow[];
    const enriched = threats.map((t) => enrichThreat(db, t));

    return res.status(200).json(enriched);
  }

  // ── POST /api/threats ─────────────────────────────────────────────────────
  if (req.method === "POST") {
    const { name, domain, description, status, owner, severity_level, sources, actors, attack_vectors } = req.body as {
      name?: string;
      domain?: string;
      description?: string;
      status?: string;
      owner?: string;
      severity_level?: number;
      sources?: string[];
      actors?: string[];
      attack_vectors?: string[];
    };

    if (!name || !domain) {
      return res.status(400).json({ error: "name and domain are required" });
    }

    const countRow = db.prepare("SELECT COUNT(*) as count FROM threats").get() as { count: number };
    const seq = countRow.count + 1;
    const id = `THR-${String(seq).padStart(3, "0")}`;
    const display_id = `T-${String(seq).padStart(4, "0")}`;

    const insert = db.transaction(() => {
      db.prepare(`
        INSERT INTO threats (id, display_id, name, domain, description, status, owner, severity_level)
        VALUES (@id, @display_id, @name, @domain, @description, @status, @owner, @severity_level)
      `).run({
        id,
        display_id,
        name,
        domain,
        description: description ?? null,
        status: status ?? "Draft",
        owner: owner ?? null,
        severity_level: severity_level ?? null,
      });

      for (const src of sources ?? []) {
        db.prepare("INSERT OR IGNORE INTO threat_sources (threat_id, source_type) VALUES (?, ?)").run(id, src);
      }
      for (const actor of actors ?? []) {
        db.prepare("INSERT OR IGNORE INTO threat_actors (threat_id, actor_type) VALUES (?, ?)").run(id, actor);
      }
      for (const vec of attack_vectors ?? []) {
        db.prepare("INSERT OR IGNORE INTO threat_attack_vectors (threat_id, attack_vector) VALUES (?, ?)").run(id, vec);
      }
    });

    insert();

    const created = db.prepare("SELECT * FROM threats WHERE id = ?").get(id) as ThreatRow;
    return res.status(201).json(enrichThreat(db, created));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
