/**
 * GET  /api/cyber-risk-assessments - List all assessments
 * POST /api/cyber-risk-assessments - Create new assessment
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("./data.db");

function generateDisplayId(): string {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM cyber_risk_assessments").get() as { cnt: number };
  return `ASM-${String(count.cnt + 1).padStart(3, "0")}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ============================================================================
  // POST - Create new assessment
  // ============================================================================
  if (req.method === "POST") {
    try {
      const {
        name,
        assessmentType = "cyber_risk",
        startDate,
        dueDate,
        ownerIds = [],
        scoringType = "inherent",
        aggregationMethod = "highest"
      } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Name is required" });
      }

      const id = randomUUID();
      const displayId = generateDisplayId();
      const ownerIdsStr = Array.isArray(ownerIds) ? ownerIds.join(",") : "";

      db.prepare(`
        INSERT INTO cyber_risk_assessments (
          id, display_id, name, assessment_type,
          start_date, due_date, owner_ids,
          phase, scoring_type, aggregation_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)
      `).run(
        id, displayId, name, assessmentType,
        startDate || null, dueDate || null, ownerIdsStr,
        scoringType, aggregationMethod
      );

      const created = db.prepare(`
        SELECT * FROM cyber_risk_assessments WHERE id = ?
      `).get(id) as any;

      return res.status(201).json({
        id: created.id,
        displayId: created.display_id,
        name: created.name,
        assessmentType: created.assessment_type,
        phase: created.phase,
        startDate: created.start_date,
        dueDate: created.due_date,
        ownerIds: created.owner_ids ? created.owner_ids.split(",") : [],
        scoringType: created.scoring_type,
        aggregationMethod: created.aggregation_method,
        aiScoringPhase: created.ai_scoring_phase,
        createdAt: created.created_at,
        updatedAt: created.updated_at
      });
    } catch (error) {
      console.error("Error creating assessment:", error);
      return res.status(500).json({ error: "Failed to create assessment" });
    }
  }

  // ============================================================================
  // GET - List all assessments
  // ============================================================================
  if (req.method === "GET") {
    try {
      const { phase, owner, status } = req.query;

      let query = `
        SELECT
          a.*,
          COUNT(DISTINCT s.id) as scenario_count,
          COUNT(DISTINCT aas.asset_id) as scoped_asset_count,
          SUM(CASE WHEN s.threat_severity IS NOT NULL THEN 1 ELSE 0 END) as scored_scenario_count
        FROM cyber_risk_assessments a
        LEFT JOIN scenarios s ON s.assessment_id = a.id
        LEFT JOIN assessment_scope_assets aas ON aas.assessment_id = a.id
        WHERE 1=1
      `;

      const params: any[] = [];

      if (phase && typeof phase === "string") {
        query += " AND a.phase = ?";
        params.push(phase);
      }

      if (owner && typeof owner === "string") {
        query += " AND a.owner_ids LIKE ?";
        params.push(`%${owner}%`);
      }

      query += `
        GROUP BY a.id
        ORDER BY a.created_at DESC
      `;

      const rows = db.prepare(query).all(...params) as any[];

      const assessments = rows.map((row) => ({
        id: row.id,
        displayId: row.display_id,
        name: row.name,
        assessmentType: row.assessment_type,
        phase: row.phase,
        startDate: row.start_date,
        dueDate: row.due_date,
        completedAt: row.completed_at,
        ownerIds: row.owner_ids ? row.owner_ids.split(",") : [],
        scoringType: row.scoring_type,
        aggregationMethod: row.aggregation_method,
        aiScoringPhase: row.ai_scoring_phase,
        aiScoringCompletedAt: row.ai_scoring_completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        stats: {
          scenarios: row.scenario_count || 0,
          scopedAssets: row.scoped_asset_count || 0,
          scenariosScored: row.scored_scenario_count || 0
        }
      }));

      return res.status(200).json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      return res.status(500).json({ error: "Failed to fetch assessments" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
