/**
 * GET /api/cyber-risk-assessments/:id/scope - Get assessment scope (assets)
 * PUT /api/cyber-risk-assessments/:id/scope - Update assessment scope (replace all assets)
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

  // Get assessment
  const assessment = db.prepare(`
    SELECT * FROM cyber_risk_assessments WHERE display_id = ?
  `).get(id) as any;

  if (!assessment) {
    return res.status(404).json({ error: "Assessment not found" });
  }

  // ============================================================================
  // GET - Get scoped assets
  // ============================================================================
  if (req.method === "GET") {
    try {
      const scopedAssets = db.prepare(`
        SELECT
          aas.*,
          a.name as asset_name,
          a.asset_type,
          a.criticality,
          a.criticality_label
        FROM assessment_scope_assets aas
        LEFT JOIN assets a ON a.display_id = aas.asset_id
        WHERE aas.assessment_id = ?
        AND aas.included = 1
        ORDER BY aas.added_at DESC
      `).all(assessment.id) as any[];

      return res.status(200).json({
        assessmentId: assessment.display_id,
        assets: scopedAssets.map((row) => ({
          assetId: row.asset_id,
          assetName: row.asset_name,
          assetType: row.asset_type,
          criticality: row.criticality,
          criticalityLabel: row.criticality_label,
          included: Boolean(row.included),
          addedAt: row.added_at
        }))
      });
    } catch (error) {
      console.error("Error fetching assessment scope:", error);
      return res.status(500).json({ error: "Failed to fetch assessment scope" });
    }
  }

  // ============================================================================
  // PUT - Replace entire scope and link all related entities
  // ============================================================================
  if (req.method === "PUT") {
    try {
      const { assetIds } = req.body;
      console.log(`[Scope PUT] Received request for ${id} with assetIds:`, assetIds);

      if (!Array.isArray(assetIds)) {
        return res.status(400).json({ error: "assetIds must be an array" });
      }

      // Transaction to update scope and link all related entities
      const updateScope = db.transaction((ids: string[]) => {
        // 1. Delete existing scope
        db.prepare("DELETE FROM assessment_scope_assets WHERE assessment_id = ?")
          .run(assessment.id);

        // 2. Insert new asset scope
        const insertAsset = db.prepare(`
          INSERT INTO assessment_scope_assets (id, assessment_id, asset_id, included)
          VALUES (?, ?, ?, 1)
        `);
        for (const assetId of ids) {
          insertAsset.run(randomUUID(), assessment.id, assetId);
        }

        // 3. Clear existing entity relationships
        db.prepare("DELETE FROM assessment_cyber_risks WHERE assessment_id = ?").run(assessment.id);
        db.prepare("DELETE FROM assessment_threats WHERE assessment_id = ?").run(assessment.id);
        db.prepare("DELETE FROM assessment_vulnerability_categories WHERE assessment_id = ?").run(assessment.id);
        db.prepare("DELETE FROM assessment_controls WHERE assessment_id = ?").run(assessment.id);

        // 4. Get all related cyber risks for these assets
        let cyberRisks: { display_id: string }[] = [];
        if (ids.length > 0) {
          cyberRisks = db.prepare(`
            SELECT DISTINCT cr.display_id
            FROM cyber_risks cr
            JOIN asset_cyber_risks acr ON acr.cyber_risk_id = cr.id
            JOIN assets a ON a.id = acr.asset_id
            WHERE a.display_id IN (${ids.map(() => '?').join(',')})
          `).all(...ids) as { display_id: string }[];
        }
        console.log(`[Scope] Found ${cyberRisks.length} cyber risks for ${ids.length} assets:`, ids);

        // 5. Get all related threats for these assets
        let threats: { display_id: string }[] = [];
        if (ids.length > 0) {
          threats = db.prepare(`
            SELECT DISTINCT t.display_id
            FROM threats t
            JOIN asset_threats at ON at.threat_id = t.id
            JOIN assets a ON a.id = at.asset_id
            WHERE a.display_id IN (${ids.map(() => '?').join(',')})
          `).all(...ids) as { display_id: string }[];
        }

        // 6. Get all related vulnerability categories for these assets
        let vulnCats: { display_id: string }[] = [];
        if (ids.length > 0) {
          vulnCats = db.prepare(`
            SELECT DISTINCT vc.display_id
            FROM vulnerability_categories vc
            JOIN asset_vulnerability_categories avc ON avc.vulnerability_category_id = vc.id
            JOIN assets a ON a.id = avc.asset_id
            WHERE a.display_id IN (${ids.map(() => '?').join(',')})
          `).all(...ids) as { display_id: string }[];
        }

        // 7. Get all related controls for these assets
        let controls: { display_id: string }[] = [];
        if (ids.length > 0) {
          controls = db.prepare(`
            SELECT DISTINCT c.display_id
            FROM controls c
            JOIN control_assets ca ON ca.control_id = c.id
            JOIN assets a ON a.id = ca.asset_id
            WHERE a.display_id IN (${ids.map(() => '?').join(',')})
          `).all(...ids) as { display_id: string }[];
        }

        // 8. Insert cyber risks
        const insertCR = db.prepare(`
          INSERT INTO assessment_cyber_risks (id, assessment_id, cyber_risk_id)
          VALUES (?, ?, ?)
        `);
        for (const cr of cyberRisks) {
          insertCR.run(randomUUID(), assessment.id, cr.display_id);
        }

        // 9. Insert threats
        const insertT = db.prepare(`
          INSERT INTO assessment_threats (id, assessment_id, threat_id)
          VALUES (?, ?, ?)
        `);
        for (const t of threats) {
          insertT.run(randomUUID(), assessment.id, t.display_id);
        }

        // 10. Insert vulnerability categories
        const insertVC = db.prepare(`
          INSERT INTO assessment_vulnerability_categories (id, assessment_id, vulnerability_category_id)
          VALUES (?, ?, ?)
        `);
        for (const vc of vulnCats) {
          insertVC.run(randomUUID(), assessment.id, vc.display_id);
        }

        // 11. Insert controls
        const insertC = db.prepare(`
          INSERT INTO assessment_controls (id, assessment_id, control_id)
          VALUES (?, ?, ?)
        `);
        for (const c of controls) {
          insertC.run(randomUUID(), assessment.id, c.display_id);
        }

        return {
          cyberRisks: cyberRisks.length,
          threats: threats.length,
          vulnerabilities: vulnCats.length,
          controls: controls.length
        };
      });

      const linkedCounts = updateScope(assetIds);

      // Update assessment updated_at
      db.prepare(`
        UPDATE cyber_risk_assessments
        SET updated_at = ?
        WHERE id = ?
      `).run(new Date().toISOString(), assessment.id);

      return res.status(200).json({
        assessmentId: assessment.display_id,
        scopedAssets: assetIds.length,
        linkedEntities: linkedCounts,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating assessment scope:", error);
      return res.status(500).json({ error: "Failed to update assessment scope" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
