/**
 * GET    /api/cyber-risk-assessments/:id - Get single assessment
 * PATCH  /api/cyber-risk-assessments/:id - Update assessment
 * DELETE /api/cyber-risk-assessments/:id - Delete assessment
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";

const db = new Database("./data.db");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Assessment ID is required" });
  }

  // ============================================================================
  // GET - Get single assessment with stats
  // ============================================================================
  if (req.method === "GET") {
    try {
      const assessment = db.prepare(`
        SELECT * FROM cyber_risk_assessments WHERE display_id = ?
      `).get(id) as any;

      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Get stats
      const stats = db.prepare(`
        SELECT
          COUNT(DISTINCT s.id) as total_scenarios,
          SUM(CASE WHEN s.threat_severity IS NOT NULL THEN 1 ELSE 0 END) as scored_scenarios,
          SUM(CASE WHEN s.is_not_applicable = 1 THEN 1 ELSE 0 END) as na_scenarios,
          COUNT(DISTINCT aas.asset_id) as scoped_assets
        FROM scenarios s
        LEFT JOIN assessment_scope_assets aas ON aas.assessment_id = s.assessment_id
        WHERE s.assessment_id = ?
      `).get(assessment.id) as any;

      return res.status(200).json({
        id: assessment.id,
        displayId: assessment.display_id,
        name: assessment.name,
        assessmentType: assessment.assessment_type,
        phase: assessment.phase,
        startDate: assessment.start_date,
        dueDate: assessment.due_date,
        completedAt: assessment.completed_at,
        ownerIds: assessment.owner_ids ? assessment.owner_ids.split(",") : [],
        scoringType: assessment.scoring_type,
        aggregationMethod: assessment.aggregation_method,
        aiScoringPhase: assessment.ai_scoring_phase,
        aiScoringCompletedAt: assessment.ai_scoring_completed_at,
        createdAt: assessment.created_at,
        updatedAt: assessment.updated_at,
        stats: {
          scenarios: stats?.total_scenarios || 0,
          scenariosScored: stats?.scored_scenarios || 0,
          scenariosNotApplicable: stats?.na_scenarios || 0,
          scopedAssets: stats?.scoped_assets || 0
        }
      });
    } catch (error) {
      console.error("Error fetching assessment:", error);
      return res.status(500).json({ error: "Failed to fetch assessment" });
    }
  }

  // ============================================================================
  // PATCH - Update assessment
  // ============================================================================
  if (req.method === "PATCH") {
    try {
      const assessment = db.prepare(`
        SELECT * FROM cyber_risk_assessments WHERE display_id = ?
      `).get(id) as any;

      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      const {
        name,
        assessmentType,
        startDate,
        dueDate,
        phase,
        ownerIds,
        scoringType,
        aggregationMethod,
        aiScoringPhase
      } = req.body;

      const updates: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
      }
      if (assessmentType !== undefined) {
        updates.push("assessment_type = ?");
        params.push(assessmentType);
      }
      if (startDate !== undefined) {
        updates.push("start_date = ?");
        params.push(startDate);
      }
      if (dueDate !== undefined) {
        updates.push("due_date = ?");
        params.push(dueDate);
      }
      if (phase !== undefined) {
        updates.push("phase = ?");
        params.push(phase);

        // Set completed_at when transitioning to assessmentApproved
        if (phase === "assessmentApproved" && !assessment.completed_at) {
          updates.push("completed_at = ?");
          params.push(new Date().toISOString());
        }
      }
      if (ownerIds !== undefined && Array.isArray(ownerIds)) {
        updates.push("owner_ids = ?");
        params.push(ownerIds.join(","));
      }
      if (scoringType !== undefined) {
        updates.push("scoring_type = ?");
        params.push(scoringType);
      }
      if (aggregationMethod !== undefined) {
        updates.push("aggregation_method = ?");
        params.push(aggregationMethod);
      }
      if (aiScoringPhase !== undefined) {
        updates.push("ai_scoring_phase = ?");
        params.push(aiScoringPhase);

        // Set ai_scoring_completed_at when completing
        if (aiScoringPhase === "complete" && !assessment.ai_scoring_completed_at) {
          updates.push("ai_scoring_completed_at = ?");
          params.push(new Date().toISOString());
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      updates.push("updated_at = ?");
      params.push(new Date().toISOString());
      params.push(assessment.id);

      db.prepare(`
        UPDATE cyber_risk_assessments
        SET ${updates.join(", ")}
        WHERE id = ?
      `).run(...params);

      // Fetch updated assessment
      const updated = db.prepare(`
        SELECT * FROM cyber_risk_assessments WHERE id = ?
      `).get(assessment.id) as any;

      return res.status(200).json({
        id: updated.id,
        displayId: updated.display_id,
        name: updated.name,
        assessmentType: updated.assessment_type,
        phase: updated.phase,
        startDate: updated.start_date,
        dueDate: updated.due_date,
        completedAt: updated.completed_at,
        ownerIds: updated.owner_ids ? updated.owner_ids.split(",") : [],
        scoringType: updated.scoring_type,
        aggregationMethod: updated.aggregation_method,
        aiScoringPhase: updated.ai_scoring_phase,
        aiScoringCompletedAt: updated.ai_scoring_completed_at,
        createdAt: updated.created_at,
        updatedAt: updated.updated_at
      });
    } catch (error) {
      console.error("Error updating assessment:", error);
      return res.status(500).json({ error: "Failed to update assessment" });
    }
  }

  // ============================================================================
  // DELETE - Delete assessment and all related data
  // ============================================================================
  if (req.method === "DELETE") {
    try {
      const assessment = db.prepare(`
        SELECT * FROM cyber_risk_assessments WHERE display_id = ?
      `).get(id) as any;

      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }

      // Delete assessment (cascades to scenarios, scope, exclusions)
      db.prepare("DELETE FROM cyber_risk_assessments WHERE id = ?").run(assessment.id);

      return res.status(204).send("");
    } catch (error) {
      console.error("Error deleting assessment:", error);
      return res.status(500).json({ error: "Failed to delete assessment" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
