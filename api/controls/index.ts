import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../lib/db.js";

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
    db
      .prepare("SELECT cyber_risk_id FROM control_cyber_risks WHERE control_id = ?")
      .all(control.id) as { cyber_risk_id: string }[]
  ).map((r) => r.cyber_risk_id);

  const asset_ids = (
    db
      .prepare("SELECT asset_id FROM control_assets WHERE control_id = ?")
      .all(control.id) as { asset_id: string }[]
  ).map((r) => r.asset_id);

  return {
    ...control,
    key_control: control.key_control === 1,
    cyber_risk_ids,
    asset_ids,
  };
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const db = getDb();

  // ── GET /api/controls ─────────────────────────────────────────────────────
  if (req.method === "GET") {
    const { asset_id, cyber_risk_id, status, key_control, search } = req.query;

    // asset_id filter uses the control_assets junction table
    if (asset_id && typeof asset_id === "string") {
      const assetExists = db.prepare("SELECT id FROM assets WHERE id = ?").get(asset_id);
      if (!assetExists) {
        return res.status(404).json({ error: `Asset not found: ${asset_id}` });
      }

      const conditions: string[] = ["ca.asset_id = ?"];
      const params: unknown[] = [asset_id];

      if (status && typeof status === "string") {
        conditions.push("c.status = ?");
        params.push(status);
      }
      if (key_control !== undefined) {
        conditions.push("c.key_control = ?");
        params.push(key_control === "true" ? 1 : 0);
      }
      if (search && typeof search === "string") {
        conditions.push("(c.name LIKE ? OR c.description LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      const sql = `
        SELECT DISTINCT c.*
        FROM controls c
        JOIN control_assets ca ON c.id = ca.control_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY c.name ASC
      `;
      const controls = db.prepare(sql).all(...params) as ControlRow[];
      return res.status(200).json(controls.map((c) => enrichControl(db, c)));
    }

    // cyber_risk_id filter uses the control_cyber_risks junction table
    if (cyber_risk_id && typeof cyber_risk_id === "string") {
      const conditions: string[] = ["ccr.cyber_risk_id = ?"];
      const params: unknown[] = [cyber_risk_id];

      if (status && typeof status === "string") {
        conditions.push("c.status = ?");
        params.push(status);
      }
      if (key_control !== undefined) {
        conditions.push("c.key_control = ?");
        params.push(key_control === "true" ? 1 : 0);
      }
      if (search && typeof search === "string") {
        conditions.push("(c.name LIKE ? OR c.description LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }

      const sql = `
        SELECT DISTINCT c.*
        FROM controls c
        JOIN control_cyber_risks ccr ON c.id = ccr.control_id
        WHERE ${conditions.join(" AND ")}
        ORDER BY c.name ASC
      `;
      const controls = db.prepare(sql).all(...params) as ControlRow[];
      return res.status(200).json(controls.map((c) => enrichControl(db, c)));
    }

    // No junction filter — standard column filters
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (status && typeof status === "string") {
      conditions.push("status = ?");
      params.push(status);
    }
    if (key_control !== undefined) {
      conditions.push("key_control = ?");
      params.push(key_control === "true" ? 1 : 0);
    }
    if (search && typeof search === "string") {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const controls = db
      .prepare(`SELECT * FROM controls ${where} ORDER BY name ASC`)
      .all(...params) as ControlRow[];

    return res.status(200).json(controls.map((c) => enrichControl(db, c)));
  }

  // ── POST /api/controls ────────────────────────────────────────────────────
  if (req.method === "POST") {
    const {
      name,
      description,
      control_type,
      key_control,
      control_frequency,
      effectiveness,
      status,
      owner,
      cyber_risk_ids,
      asset_ids,
    } = req.body as {
      name?: string;
      description?: string;
      control_type?: string;
      key_control?: boolean;
      control_frequency?: string;
      effectiveness?: number;
      status?: string;
      owner?: string;
      cyber_risk_ids?: string[];
      asset_ids?: string[];
    };

    if (!name || !control_type) {
      return res.status(400).json({ error: "name and control_type are required" });
    }

    const countRow = db.prepare("SELECT COUNT(*) as count FROM controls").get() as {
      count: number;
    };
    const seq = countRow.count + 1;
    const id = `CTL-${String(seq).padStart(3, "0")}`;

    const effectiveness_label =
      effectiveness != null
        ? (["Very low", "Low", "Medium", "High", "Very high"][effectiveness - 1] ?? null)
        : null;

    const insert = db.transaction(() => {
      db.prepare(`
        INSERT INTO controls (id, display_id, name, description, control_type, key_control,
          control_frequency, effectiveness, effectiveness_label, status, owner)
        VALUES (@id, @id, @name, @description, @control_type, @key_control,
          @control_frequency, @effectiveness, @effectiveness_label, @status, @owner)
      `).run({
        id,
        name,
        description: description ?? null,
        control_type,
        key_control: key_control ? 1 : 0,
        control_frequency: control_frequency ?? null,
        effectiveness: effectiveness ?? null,
        effectiveness_label,
        status: status ?? "Draft",
        owner: owner ?? null,
      });

      for (const riskId of cyber_risk_ids ?? []) {
        db.prepare(
          "INSERT OR IGNORE INTO control_cyber_risks (control_id, cyber_risk_id) VALUES (?, ?)"
        ).run(id, riskId);
      }
      for (const assetId of asset_ids ?? []) {
        db.prepare(
          "INSERT OR IGNORE INTO control_assets (control_id, asset_id) VALUES (?, ?)"
        ).run(id, assetId);
      }
    });

    insert();

    const created = db
      .prepare("SELECT * FROM controls WHERE id = ?")
      .get(id) as ControlRow;
    return res.status(201).json(enrichControl(db, created));
  }

  return res.status(405).json({ error: "Method not allowed" });
}
