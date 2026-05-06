/**
 * GET  /api/cyber-risk-assessments/:id/exclusions - Get all exclusions
 * POST /api/cyber-risk-assessments/:id/exclusions - Add exclusion
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("./data.db");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Assessment ID is required" });
  }

  const assessment = db.prepare(`
    SELECT * FROM cyber_risk_assessments WHERE display_id = ?
  `).get(id) as any;

  if (!assessment) {
    return res.status(404).json({ error: "Assessment not found" });
  }

  // ============================================================================
  // GET - Get all exclusions for this assessment
  // ============================================================================
  if (req.method === "GET") {
    try {
      const { entityType } = req.query;

      let query = "SELECT * FROM assessment_exclusions WHERE assessment_id = ?";
      const params: any[] = [assessment.id];

      if (entityType && typeof entityType === "string") {
        query += " AND entity_type = ?";
        params.push(entityType);
      }

      query += " ORDER BY excluded_at DESC";

      const exclusions = db.prepare(query).all(...params) as any[];

      return res.status(200).json({
        assessmentId: assessment.display_id,
        exclusions: exclusions.map((row) => ({
          id: row.id,
          entityType: row.entity_type,
          entityId: row.entity_id,
          reason: row.reason,
          excludedAt: row.excluded_at
        }))
      });
    } catch (error) {
      console.error("Error fetching exclusions:", error);
      return res.status(500).json({ error: "Failed to fetch exclusions" });
    }
  }

  // ============================================================================
  // POST - Add new exclusion
  // ============================================================================
  if (req.method === "POST") {
    try {
      const { entityType, entityId, reason } = req.body;

      if (!entityType || !entityId) {
        return res.status(400).json({ error: "entityType and entityId are required" });
      }

      const validTypes = ["cyber_risk", "threat", "vulnerability", "control", "scenario"];
      if (!validTypes.includes(entityType)) {
        return res.status(400).json({
          error: `Invalid entityType. Must be one of: ${validTypes.join(", ")}`
        });
      }

      const exclusionId = randomUUID();

      db.prepare(`
        INSERT OR REPLACE INTO assessment_exclusions (
          id, assessment_id, entity_type, entity_id, reason
        ) VALUES (?, ?, ?, ?, ?)
      `).run(exclusionId, assessment.id, entityType, entityId, reason || null);

      const created = db.prepare("SELECT * FROM assessment_exclusions WHERE id = ?")
        .get(exclusionId) as any;

      return res.status(201).json({
        id: created.id,
        entityType: created.entity_type,
        entityId: created.entity_id,
        reason: created.reason,
        excludedAt: created.excluded_at
      });
    } catch (error) {
      console.error("Error adding exclusion:", error);
      return res.status(500).json({ error: "Failed to add exclusion" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
