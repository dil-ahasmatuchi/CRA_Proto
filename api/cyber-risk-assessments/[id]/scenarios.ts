/**
 * GET  /api/cyber-risk-assessments/:id/scenarios - Get all scenarios for assessment
 * POST /api/cyber-risk-assessments/:id/scenarios - Generate scenarios from scope
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("./data.db");

function generateScenarioDisplayId(): string {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM scenarios").get() as { cnt: number };
  return `SC-${String(count.cnt + 1).padStart(3, "0")}`;
}

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
  // GET - Get all scenarios for this assessment
  // ============================================================================
  if (req.method === "GET") {
    try {
      const { status, scored, notApplicable } = req.query;

      let query = `
        SELECT
          s.*,
          a.name as asset_name,
          a.criticality as asset_criticality,
          a.criticality_label as asset_criticality_label,
          cr.name as cyber_risk_name,
          cr.display_id as cyber_risk_display_id
        FROM scenarios s
        LEFT JOIN assets a ON a.display_id = s.asset_id
        LEFT JOIN cyber_risks cr ON cr.display_id = s.cyber_risk_id
        WHERE s.assessment_id = ?
      `;
      const params: any[] = [assessment.id];

      if (status && typeof status === "string") {
        query += " AND s.status = ?";
        params.push(status);
      }

      if (scored === "true") {
        query += " AND s.threat_severity IS NOT NULL";
      } else if (scored === "false") {
        query += " AND s.threat_severity IS NULL";
      }

      if (notApplicable === "true") {
        query += " AND s.is_not_applicable = 1";
      } else if (notApplicable === "false") {
        query += " AND s.is_not_applicable = 0";
      }

      query += " ORDER BY s.cyber_risk_id, s.created_at";

      const rows = db.prepare(query).all(...params) as any[];

      const scenarios = rows.map((row) => ({
        id: row.id,
        displayId: row.display_id,
        assessmentId: assessment.display_id,
        name: row.name,
        assetId: row.asset_id,
        assetName: row.asset_name,
        assetCriticality: row.asset_criticality ?? null,
        assetCriticalityLabel: row.asset_criticality_label ?? null,
        cyberRiskId: row.cyber_risk_id,
        cyberRiskName: row.cyber_risk_name ?? null,
        threatId: row.threat_id,
        vulnerabilityId: row.vulnerability_id,
        impact: row.impact,
        impactLabel: row.impact_label,
        threatSeverity: row.threat_severity,
        threatSeverityLabel: row.threat_severity_label,
        vulnerabilitySeverity: row.vulnerability_severity,
        vulnerabilitySeverityLabel: row.vulnerability_severity_label,
        likelihood: row.likelihood,
        likelihoodLabel: row.likelihood_label,
        cyberRiskScore: row.cyber_risk_score,
        cyberRiskScoreLabel: row.cyber_risk_score_label,
        scoringRationale: row.scoring_rationale,
        status: row.status,
        isNotApplicable: Boolean(row.is_not_applicable),
        isExcluded: Boolean(row.is_excluded),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        scoredAt: row.scored_at,
        scoredBy: row.scored_by
      }));

      return res.status(200).json(scenarios);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      return res.status(500).json({ error: "Failed to fetch scenarios" });
    }
  }

  // ============================================================================
  // POST - Generate scenarios from scoped assets
  // ============================================================================
  if (req.method === "POST") {
    try {
      // Get scoped assets
      const scopedAssets = db.prepare(`
        SELECT asset_id FROM assessment_scope_assets
        WHERE assessment_id = ? AND included = 1
      `).all(assessment.id) as { asset_id: string }[];

      if (scopedAssets.length === 0) {
        return res.status(400).json({ error: "No assets in scope. Add assets first." });
      }

      const assetIds = scopedAssets.map((a) => a.asset_id);

      // Get exclusions
      const exclusions = db.prepare(`
        SELECT entity_type, entity_id FROM assessment_exclusions
        WHERE assessment_id = ?
      `).all(assessment.id) as { entity_type: string; entity_id: string }[];

      const excludedCyberRisks = new Set(
        exclusions.filter((e) => e.entity_type === "cyber_risk").map((e) => e.entity_id)
      );
      const excludedThreats = new Set(
        exclusions.filter((e) => e.entity_type === "threat").map((e) => e.entity_id)
      );

      // For each asset, find related cyber risks and threats
      const scenariosToCreate: any[] = [];

      for (const assetId of assetIds) {
        // Get asset details
        const asset = db.prepare(`
          SELECT * FROM assets WHERE display_id = ?
        `).get(assetId) as any;

        if (!asset) continue;

        // Get cyber risks directly linked to this asset
        const relatedRisks = db.prepare(`
          SELECT DISTINCT cr.display_id as risk_id, cr.name as risk_name
          FROM cyber_risks cr
          JOIN asset_cyber_risks acr ON acr.cyber_risk_id = cr.id
          JOIN assets a ON a.id = acr.asset_id
          WHERE a.display_id = ?
        `).all(assetId) as any[];

        for (const risk of relatedRisks) {
          if (excludedCyberRisks.has(risk.risk_id)) continue;

          // Get threats directly linked to this asset
          const threats = db.prepare(`
            SELECT DISTINCT t.display_id as threat_id, t.name as threat_name
            FROM threats t
            JOIN asset_threats at2 ON at2.threat_id = t.id
            JOIN assets a ON a.id = at2.asset_id
            WHERE a.display_id = ?
            LIMIT 3
          `).all(assetId) as any[];

          for (const threat of threats) {
            if (excludedThreats.has(threat.threat_id)) continue;

            // Get first vulnerability category linked to this asset
            const vuln = db.prepare(`
              SELECT vc.display_id as vuln_id
              FROM vulnerability_categories vc
              JOIN asset_vulnerability_categories avc ON avc.vulnerability_category_id = vc.id
              JOIN assets a ON a.id = avc.asset_id
              WHERE a.display_id = ?
              LIMIT 1
            `).get(assetId) as any;

            scenariosToCreate.push({
              name: `${threat.threat_name} on ${asset.name}`,
              assetId: assetId,
              cyberRiskId: risk.risk_id,
              threatId: threat.threat_id,
              vulnerabilityId: vuln?.vuln_id ?? null,
              impact: asset.criticality,
              impactLabel: asset.criticality_label,
            });
          }
        }
      }

      // Delete existing scenarios for this assessment
      db.prepare("DELETE FROM scenarios WHERE assessment_id = ?").run(assessment.id);

      // Insert new scenarios
      const insert = db.prepare(`
        INSERT INTO scenarios (
          id, display_id, assessment_id, name,
          asset_id, cyber_risk_id, threat_id, vulnerability_id,
          impact, impact_label, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `);

      const insertMany = db.transaction((scenarios: any[]) => {
        for (const s of scenarios) {
          insert.run(
            randomUUID(),
            generateScenarioDisplayId(),
            assessment.id,
            s.name,
            s.assetId,
            s.cyberRiskId,
            s.threatId,
            s.vulnerabilityId,
            s.impact,
            s.impactLabel
          );
        }
      });

      insertMany(scenariosToCreate);

      // Update assessment
      db.prepare(`
        UPDATE cyber_risk_assessments
        SET updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), assessment.id);

      return res.status(201).json({
        assessmentId: assessment.display_id,
        scenariosCreated: scenariosToCreate.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating scenarios:", error);
      return res.status(500).json({ error: "Failed to generate scenarios" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
