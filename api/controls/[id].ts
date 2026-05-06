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
  const id = req.query.id as string;

  const control = db.prepare("SELECT * FROM controls WHERE id = ?").get(id) as
    | ControlRow
    | undefined;

  if (!control) {
    return res.status(404).json({ error: `Control not found: ${id}` });
  }

  // ── GET /api/controls/:id ─────────────────────────────────────────────────
  if (req.method === "GET") {
    return res.status(200).json(enrichControl(db, control));
  }

  // ── PUT /api/controls/:id ─────────────────────────────────────────────────
  if (req.method === "PUT") {
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

    const effectiveness_label =
      effectiveness != null
        ? (["Very low", "Low", "Medium", "High", "Very high"][effectiveness - 1] ?? null)
        : null;

    const update = db.transaction(() => {
      db.prepare(`
        UPDATE controls SET
          name = COALESCE(@name, name),
          description = COALESCE(@description, description),
          control_type = COALESCE(@control_type, control_type),
          key_control = COALESCE(@key_control, key_control),
          control_frequency = COALESCE(@control_frequency, control_frequency),
          effectiveness = COALESCE(@effectiveness, effectiveness),
          effectiveness_label = COALESCE(@effectiveness_label, effectiveness_label),
          status = COALESCE(@status, status),
          owner = COALESCE(@owner, owner),
          updated_at = datetime('now')
        WHERE id = @id
      `).run({
        id,
        name: name ?? null,
        description: description ?? null,
        control_type: control_type ?? null,
        key_control: key_control !== undefined ? (key_control ? 1 : 0) : null,
        control_frequency: control_frequency ?? null,
        effectiveness: effectiveness ?? null,
        effectiveness_label,
        status: status ?? null,
        owner: owner ?? null,
      });

      if (cyber_risk_ids !== undefined) {
        db.prepare("DELETE FROM control_cyber_risks WHERE control_id = ?").run(id);
        for (const riskId of cyber_risk_ids) {
          db.prepare(
            "INSERT OR IGNORE INTO control_cyber_risks (control_id, cyber_risk_id) VALUES (?, ?)"
          ).run(id, riskId);
        }
      }

      if (asset_ids !== undefined) {
        db.prepare("DELETE FROM control_assets WHERE control_id = ?").run(id);
        for (const assetId of asset_ids) {
          db.prepare(
            "INSERT OR IGNORE INTO control_assets (control_id, asset_id) VALUES (?, ?)"
          ).run(id, assetId);
        }
      }
    });

    update();

    const updated = db.prepare("SELECT * FROM controls WHERE id = ?").get(id) as ControlRow;
    return res.status(200).json(enrichControl(db, updated));
  }

  // ── DELETE /api/controls/:id ──────────────────────────────────────────────
  if (req.method === "DELETE") {
    db.prepare("DELETE FROM controls WHERE id = ?").run(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
}
