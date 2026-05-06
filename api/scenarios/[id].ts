/**
 * GET   /api/scenarios/:id - Get single scenario
 * PATCH /api/scenarios/:id - Update scenario (scores, status, etc.)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";

const db = new Database("./data.db");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Scenario ID is required" });
  }

  // ============================================================================
  // GET - Get single scenario
  // ============================================================================
  if (req.method === "GET") {
    try {
      const scenario = db.prepare(`
        SELECT
          s.*,
          a.name as asset_name,
          a.asset_type,
          a.criticality as asset_criticality,
          cr.name as cyber_risk_name,
          t.name as threat_name,
          v.name as vulnerability_name
        FROM scenarios s
        LEFT JOIN assets a ON a.display_id = s.asset_id
        LEFT JOIN cyber_risks cr ON cr.display_id = s.cyber_risk_id
        LEFT JOIN threats t ON t.display_id = s.threat_id
        LEFT JOIN vulnerability_categories v ON v.display_id = s.vulnerability_id
        WHERE s.display_id = ?
      `).get(id) as any;

      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }

      return res.status(200).json({
        id: scenario.id,
        displayId: scenario.display_id,
        assessmentId: scenario.assessment_id,
        name: scenario.name,
        assetId: scenario.asset_id,
        assetName: scenario.asset_name,
        assetType: scenario.asset_type,
        cyberRiskId: scenario.cyber_risk_id,
        cyberRiskName: scenario.cyber_risk_name,
        threatId: scenario.threat_id,
        threatName: scenario.threat_name,
        vulnerabilityId: scenario.vulnerability_id,
        vulnerabilityName: scenario.vulnerability_name,
        impact: scenario.impact,
        impactLabel: scenario.impact_label,
        threatSeverity: scenario.threat_severity,
        threatSeverityLabel: scenario.threat_severity_label,
        vulnerabilitySeverity: scenario.vulnerability_severity,
        vulnerabilitySeverityLabel: scenario.vulnerability_severity_label,
        likelihood: scenario.likelihood,
        likelihoodLabel: scenario.likelihood_label,
        cyberRiskScore: scenario.cyber_risk_score,
        cyberRiskScoreLabel: scenario.cyber_risk_score_label,
        scoringRationale: scenario.scoring_rationale,
        status: scenario.status,
        isNotApplicable: Boolean(scenario.is_not_applicable),
        isExcluded: Boolean(scenario.is_excluded),
        createdAt: scenario.created_at,
        updatedAt: scenario.updated_at,
        scoredAt: scenario.scored_at,
        scoredBy: scenario.scored_by
      });
    } catch (error) {
      console.error("Error fetching scenario:", error);
      return res.status(500).json({ error: "Failed to fetch scenario" });
    }
  }

  // ============================================================================
  // PATCH - Update scenario
  // ============================================================================
  if (req.method === "PATCH") {
    try {
      const scenario = db.prepare(`
        SELECT * FROM scenarios WHERE display_id = ?
      `).get(id) as any;

      if (!scenario) {
        return res.status(404).json({ error: "Scenario not found" });
      }

      const {
        name,
        threatSeverity,
        threatSeverityLabel,
        vulnerabilitySeverity,
        vulnerabilitySeverityLabel,
        likelihood,
        likelihoodLabel,
        cyberRiskScore,
        cyberRiskScoreLabel,
        scoringRationale,
        status,
        isNotApplicable,
        isExcluded,
        scoredBy
      } = req.body;

      const updates: string[] = [];
      const params: any[] = [];

      if (name !== undefined) {
        updates.push("name = ?");
        params.push(name);
      }
      if (threatSeverity !== undefined) {
        updates.push("threat_severity = ?");
        params.push(threatSeverity);
      }
      if (threatSeverityLabel !== undefined) {
        updates.push("threat_severity_label = ?");
        params.push(threatSeverityLabel);
      }
      if (vulnerabilitySeverity !== undefined) {
        updates.push("vulnerability_severity = ?");
        params.push(vulnerabilitySeverity);
      }
      if (vulnerabilitySeverityLabel !== undefined) {
        updates.push("vulnerability_severity_label = ?");
        params.push(vulnerabilitySeverityLabel);
      }
      if (likelihood !== undefined) {
        updates.push("likelihood = ?");
        params.push(likelihood);
      }
      if (likelihoodLabel !== undefined) {
        updates.push("likelihood_label = ?");
        params.push(likelihoodLabel);
      }
      if (cyberRiskScore !== undefined) {
        updates.push("cyber_risk_score = ?");
        params.push(cyberRiskScore);
      }
      if (cyberRiskScoreLabel !== undefined) {
        updates.push("cyber_risk_score_label = ?");
        params.push(cyberRiskScoreLabel);
      }
      if (scoringRationale !== undefined) {
        updates.push("scoring_rationale = ?");
        params.push(scoringRationale);
      }
      if (status !== undefined) {
        updates.push("status = ?");
        params.push(status);
      }
      if (isNotApplicable !== undefined) {
        updates.push("is_not_applicable = ?");
        params.push(isNotApplicable ? 1 : 0);
      }
      if (isExcluded !== undefined) {
        updates.push("is_excluded = ?");
        params.push(isExcluded ? 1 : 0);
      }
      if (scoredBy !== undefined) {
        updates.push("scored_by = ?");
        params.push(scoredBy);
      }

      // Set scored_at if scoring fields are being updated
      if (
        threatSeverity !== undefined ||
        vulnerabilitySeverity !== undefined
      ) {
        if (!scenario.scored_at) {
          updates.push("scored_at = ?");
          params.push(new Date().toISOString());
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      updates.push("updated_at = ?");
      params.push(new Date().toISOString());
      params.push(scenario.id);

      db.prepare(`
        UPDATE scenarios
        SET ${updates.join(", ")}
        WHERE id = ?
      `).run(...params);

      // Fetch updated scenario
      const updated = db.prepare(`
        SELECT * FROM scenarios WHERE id = ?
      `).get(scenario.id) as any;

      return res.status(200).json({
        id: updated.id,
        displayId: updated.display_id,
        assessmentId: updated.assessment_id,
        name: updated.name,
        assetId: updated.asset_id,
        cyberRiskId: updated.cyber_risk_id,
        threatId: updated.threat_id,
        vulnerabilityId: updated.vulnerability_id,
        impact: updated.impact,
        impactLabel: updated.impact_label,
        threatSeverity: updated.threat_severity,
        threatSeverityLabel: updated.threat_severity_label,
        vulnerabilitySeverity: updated.vulnerability_severity,
        vulnerabilitySeverityLabel: updated.vulnerability_severity_label,
        likelihood: updated.likelihood,
        likelihoodLabel: updated.likelihood_label,
        cyberRiskScore: updated.cyber_risk_score,
        cyberRiskScoreLabel: updated.cyber_risk_score_label,
        scoringRationale: updated.scoring_rationale,
        status: updated.status,
        isNotApplicable: Boolean(updated.is_not_applicable),
        isExcluded: Boolean(updated.is_excluded),
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
        scoredAt: updated.scored_at,
        scoredBy: updated.scored_by
      });
    } catch (error) {
      console.error("Error updating scenario:", error);
      return res.status(500).json({ error: "Failed to update scenario" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
