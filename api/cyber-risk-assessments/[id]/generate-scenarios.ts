/**
 * POST /api/cyber-risk-assessments/:id/generate-scenarios
 * Auto-generates scenarios for an assessment based on asset × cyber_risk × threat combinations
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";
import { randomUUID } from "crypto";

const db = new Database("./data.db");

function generateScenarioDisplayId(): string {
  const count = db.prepare("SELECT COUNT(*) as cnt FROM scenarios").get() as { cnt: number };
  return `SCN-${String(count.cnt + 1).padStart(3, "0")}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Assessment ID is required" });
  }

  try {
    // Get assessment
    const assessment = db.prepare(`
      SELECT * FROM cyber_risk_assessments WHERE display_id = ?
    `).get(id) as any;

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Get scoped assets for this assessment
    const scopedAssets = db.prepare(`
      SELECT a.id, a.display_id, a.name, a.criticality, a.criticality_label
      FROM assets a
      INNER JOIN assessment_scope_assets asa ON asa.asset_id = a.display_id
      WHERE asa.assessment_id = ?
    `).all(assessment.id) as any[];

    if (scopedAssets.length === 0) {
      return res.status(400).json({
        error: "No assets in scope. Please add assets before generating scenarios."
      });
    }

    // Get excluded entities
    const exclusions = db.prepare(`
      SELECT entity_type, entity_id
      FROM assessment_exclusions
      WHERE assessment_id = ?
    `).all(assessment.id) as Array<{ entity_type: string; entity_id: string }>;

    const excludedCyberRisks = new Set(
      exclusions.filter(e => e.entity_type === 'cyber_risk').map(e => e.entity_id)
    );
    const excludedThreats = new Set(
      exclusions.filter(e => e.entity_type === 'threat').map(e => e.entity_id)
    );

    // Delete existing scenarios for this assessment
    db.prepare("DELETE FROM scenarios WHERE assessment_id = ?").run(assessment.id);

    const scenariosToCreate: any[] = [];

    // For each asset in scope
    for (const asset of scopedAssets) {
      // Get cyber risks related to this asset
      const assetCyberRisks = db.prepare(`
        SELECT cr.id, cr.display_id, cr.name
        FROM cyber_risks cr
        INNER JOIN asset_cyber_risks acr ON acr.cyber_risk_id = cr.display_id
        WHERE acr.asset_id = ?
      `).all(asset.display_id) as any[];

      // For each cyber risk
      for (const cyberRisk of assetCyberRisks) {
        // Skip if excluded
        if (excludedCyberRisks.has(cyberRisk.display_id)) {
          continue;
        }

        // Get threats related to this asset
        const assetThreats = db.prepare(`
          SELECT t.id, t.display_id, t.name
          FROM threats t
          INNER JOIN asset_threats at ON at.threat_id = t.display_id
          WHERE at.asset_id = ?
        `).all(asset.display_id) as any[];

        // For each threat, create a scenario
        for (const threat of assetThreats) {
          // Skip if excluded
          if (excludedThreats.has(threat.display_id)) {
            continue;
          }

          const scenarioName = `${asset.name} - ${cyberRisk.name} - ${threat.name}`;

          scenariosToCreate.push({
            id: randomUUID(),
            displayId: generateScenarioDisplayId(),
            name: scenarioName,
            assetId: asset.display_id,
            assetName: asset.name,
            cyberRiskId: cyberRisk.display_id,
            cyberRiskName: cyberRisk.name,
            threatId: threat.display_id,
            threatName: threat.name,
            impact: asset.criticality,
            impactLabel: asset.criticality_label,
          });
        }
      }
    }

    // Insert scenarios in a transaction
    const insertScenario = db.prepare(`
      INSERT INTO scenarios (
        id, display_id, assessment_id, name,
        asset_id, cyber_risk_id, threat_id,
        vulnerability_id, is_not_applicable,
        impact, impact_label,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, 0, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const insertMany = db.transaction((scenarios: any[]) => {
      for (const s of scenarios) {
        insertScenario.run(
          s.id,
          s.displayId,
          assessment.id,
          s.name,
          s.assetId,
          s.cyberRiskId,
          s.threatId,
          s.impact,
          s.impactLabel
        );
      }
    });

    insertMany(scenariosToCreate);

    // Update assessment phase to inProgress and timestamp
    db.prepare(`
      UPDATE cyber_risk_assessments
      SET phase = 'inProgress', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(assessment.id);

    return res.status(200).json({
      message: "Scenarios generated successfully",
      count: scenariosToCreate.length,
      scenarios: scenariosToCreate.map(s => ({
        id: s.id,
        displayId: s.displayId,
        name: s.name,
        assetName: s.assetName,
        cyberRiskName: s.cyberRiskName,
        threatName: s.threatName,
      }))
    });

  } catch (error) {
    console.error("Error generating scenarios:", error);
    return res.status(500).json({
      error: "Failed to generate scenarios",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
