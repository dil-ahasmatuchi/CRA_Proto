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
  const { id } = req.query as { id: string };

  if (!id) return res.status(400).json({ error: "Missing id" });

  // ── GET /api/threats/:id ──────────────────────────────────────────────────
  if (req.method === "GET") {
    const threat = db.prepare("SELECT * FROM threats WHERE id = ?").get(id) as ThreatRow | undefined;
    if (!threat) return res.status(404).json({ error: "Threat not found" });
    return res.status(200).json(enrichThreat(db, threat));
  }

  // ── PUT /api/threats/:id ──────────────────────────────────────────────────
  if (req.method === "PUT") {
    const existing = db.prepare("SELECT id FROM threats WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Threat not found" });

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

    const update = db.transaction(() => {
      db.prepare(`
        UPDATE threats SET
          name           = COALESCE(@name, name),
          domain         = COALESCE(@domain, domain),
          description    = COALESCE(@description, description),
          status         = COALESCE(@status, status),
          owner          = COALESCE(@owner, owner),
          severity_level = COALESCE(@severity_level, severity_level),
          updated_at     = datetime('now')
        WHERE id = @id
      `).run({ id, name: name ?? null, domain: domain ?? null, description: description ?? null, status: status ?? null, owner: owner ?? null, severity_level: severity_level ?? null });

      // Replace junction data if provided
      if (sources !== undefined) {
        db.prepare("DELETE FROM threat_sources WHERE threat_id = ?").run(id);
        for (const src of sources) {
          db.prepare("INSERT OR IGNORE INTO threat_sources (threat_id, source_type) VALUES (?, ?)").run(id, src);
        }
      }
      if (actors !== undefined) {
        db.prepare("DELETE FROM threat_actors WHERE threat_id = ?").run(id);
        for (const actor of actors) {
          db.prepare("INSERT OR IGNORE INTO threat_actors (threat_id, actor_type) VALUES (?, ?)").run(id, actor);
        }
      }
      if (attack_vectors !== undefined) {
        db.prepare("DELETE FROM threat_attack_vectors WHERE threat_id = ?").run(id);
        for (const vec of attack_vectors) {
          db.prepare("INSERT OR IGNORE INTO threat_attack_vectors (threat_id, attack_vector) VALUES (?, ?)").run(id, vec);
        }
      }
    });

    update();

    const updated = db.prepare("SELECT * FROM threats WHERE id = ?").get(id) as ThreatRow;
    return res.status(200).json(enrichThreat(db, updated));
  }

  // ── DELETE /api/threats/:id ───────────────────────────────────────────────
  if (req.method === "DELETE") {
    const existing = db.prepare("SELECT id FROM threats WHERE id = ?").get(id);
    if (!existing) return res.status(404).json({ error: "Threat not found" });

    db.prepare("DELETE FROM threats WHERE id = ?").run(id);
    return res.status(200).json({ deleted: id });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
