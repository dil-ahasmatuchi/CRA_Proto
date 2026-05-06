/**
 * POST /api/scenarios/score - Score scenarios using AI
 *
 * Body: {
 *   scenarioIds: string[]  // Array of scenario display IDs to score
 * }
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";
import { scoreScenarioBatch } from "../lib/scoringAgent.js";

const db = new Database("./data.db");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { scenarioIds } = req.body;

    if (!Array.isArray(scenarioIds) || scenarioIds.length === 0) {
      return res.status(400).json({ error: "scenarioIds array is required" });
    }

    // Fetch scenarios from database
    const placeholders = scenarioIds.map(() => "?").join(",");
    const scenarios = db
      .prepare(
        `
      SELECT
        s.*,
        a.name as asset_name,
        a.asset_type,
        a.criticality,
        a.criticality_label,
        t.name as threat_name,
        t.description as threat_description,
        t.domain as threat_domain,
        cr.name as cyber_risk_name
      FROM scenarios s
      LEFT JOIN assets a ON a.display_id = s.asset_id
      LEFT JOIN threats t ON t.display_id = s.threat_id
      LEFT JOIN cyber_risks cr ON cr.display_id = s.cyber_risk_id
      WHERE s.display_id IN (${placeholders})
    `
      )
      .all(...scenarioIds) as any[];

    if (scenarios.length === 0) {
      return res.status(404).json({ error: "No scenarios found" });
    }

    // Get threat details and controls for each scenario
    const scenariosWithDetails = scenarios.map((s) => {
      // Get threat sources
      const threatSources = db
        .prepare(
          `
        SELECT source_type FROM threat_sources
        WHERE threat_id = (SELECT id FROM threats WHERE display_id = ?)
      `
        )
        .all(s.threat_id) as any[];

      // Get threat actors
      const threatActors = db
        .prepare(
          `
        SELECT actor_type FROM threat_actors
        WHERE threat_id = (SELECT id FROM threats WHERE display_id = ?)
      `
        )
        .all(s.threat_id) as any[];

      // Get threat attack vectors
      const attackVectors = db
        .prepare(
          `
        SELECT attack_vector FROM threat_attack_vectors
        WHERE threat_id = (SELECT id FROM threats WHERE display_id = ?)
      `
        )
        .all(s.threat_id) as any[];

      // Get asset details
      const assetDetails = db
        .prepare(
          `
        SELECT description FROM assets WHERE display_id = ?
      `
        )
        .get(s.asset_id) as any;

      // Get controls for this asset
      const controls = db
        .prepare(
          `
        SELECT c.name, c.description, c.control_type, c.effectiveness
        FROM controls c
        JOIN control_assets ca ON ca.control_id = c.id
        JOIN assets a ON a.id = ca.asset_id
        WHERE a.display_id = ?
      `
        )
        .all(s.asset_id) as any[];

      // Get vulnerability details if present
      let vulnerability = undefined;
      if (s.vulnerability_id) {
        const vulnDetails = db
          .prepare(
            `
          SELECT v.name, v.description, v.domain, v.vulnerability_type
          FROM vulnerability_categories v
          WHERE v.display_id = ?
        `
          )
          .get(s.vulnerability_id) as any;

        if (vulnDetails) {
          vulnerability = {
            name: vulnDetails.name,
            description: vulnDetails.description || "",
            domain: vulnDetails.domain || "",
            vulnerabilityType: vulnDetails.vulnerability_type || "",
          };
        }
      }

      return {
        scenarioId: s.display_id,
        scenarioName: s.name,
        asset: {
          name: s.asset_name,
          assetType: s.asset_type,
          criticality: s.criticality,
          criticalityLabel: s.criticality_label,
          description: assetDetails?.description || undefined,
        },
        threat: {
          name: s.threat_name,
          description: s.threat_description || "",
          domain: s.threat_domain || "",
          sources: threatSources.map((ts) => ts.source_type),
          threatActors: threatActors.map((ta) => ta.actor_type),
          attackVectors: attackVectors.map((av) => av.attack_vector),
        },
        vulnerability,
        controls: controls.map((c) => ({
          name: c.name,
          description: c.description || undefined,
          controlType: c.control_type || undefined,
          effectiveness: c.effectiveness || undefined,
        })),
        cyberRiskName: s.cyber_risk_name || "",
      };
    });

    // Score scenarios using AI
    const results = await scoreScenarioBatch(scenariosWithDetails);

    // Update scenarios in database
    const updateStmt = db.prepare(`
      UPDATE scenarios
      SET
        threat_severity = ?,
        threat_severity_label = ?,
        vulnerability_severity = ?,
        vulnerability_severity_label = ?,
        likelihood = ?,
        likelihood_label = ?,
        cyber_risk_score = ?,
        cyber_risk_score_label = ?,
        scoring_rationale = ?,
        scored_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE display_id = ?
    `);

    const updateMany = db.transaction((scoringResults: any[]) => {
      for (const result of scoringResults) {
        const rationale = `**Threat:** ${result.threatRationale}\n\n**Vulnerability:** ${result.vulnerabilityRationale}\n\n**Confidence:** ${result.confidence}/100 (${result.confidenceLabel})`;

        updateStmt.run(
          result.threatSeverity,
          result.threatSeverityLabel,
          result.vulnerabilitySeverity,
          result.vulnerabilitySeverityLabel,
          result.likelihood,
          result.likelihoodLabel,
          result.cyberRiskScore,
          result.cyberRiskScoreLabel,
          rationale,
          result.scenarioId
        );
      }
    });

    updateMany(results);

    return res.status(200).json({
      message: "Scenarios scored successfully",
      count: results.length,
      results: results.map((r) => ({
        scenarioId: r.scenarioId,
        threatSeverity: r.threatSeverity,
        vulnerabilitySeverity: r.vulnerabilitySeverity,
        cyberRiskScore: r.cyberRiskScore,
        confidence: r.confidence,
      })),
    });
  } catch (error) {
    console.error("Error scoring scenarios:", error);
    return res.status(500).json({
      error: "Failed to score scenarios",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}