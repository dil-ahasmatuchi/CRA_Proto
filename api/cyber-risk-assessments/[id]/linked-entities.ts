/**
 * GET /api/cyber-risk-assessments/:id/linked-entities
 *
 * Returns all cyber risks, threats, vulnerabilities, and controls
 * that are explicitly linked to this assessment (via asset relationships)
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Database from "better-sqlite3";

const db = new Database("./data.db");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Assessment ID is required" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get assessment
    const assessment = db.prepare(`
      SELECT * FROM cyber_risk_assessments WHERE display_id = ?
    `).get(id) as any;

    if (!assessment) {
      return res.status(404).json({ error: "Assessment not found" });
    }

    // Get linked cyber risks
    const cyberRisks = db.prepare(`
      SELECT cr.*
      FROM cyber_risks cr
      JOIN assessment_cyber_risks acr ON acr.cyber_risk_id = cr.display_id
      WHERE acr.assessment_id = ?
      ORDER BY cr.domain ASC, cr.name ASC
    `).all(assessment.id) as any[];

    // Enrich with control IDs
    const enrichedCyberRisks = cyberRisks.map(cr => ({
      ...cr,
      control_ids: (db.prepare(`
        SELECT control_id FROM control_cyber_risks WHERE cyber_risk_id = ?
      `).all(cr.id) as any[]).map(r => r.control_id)
    }));

    // Get linked threats
    const threats = db.prepare(`
      SELECT t.*
      FROM threats t
      JOIN assessment_threats at ON at.threat_id = t.display_id
      WHERE at.assessment_id = ?
      ORDER BY t.severity_level DESC, t.name ASC
    `).all(assessment.id) as any[];

    // Enrich threats with arrays
    const enrichedThreats = threats.map(t => ({
      ...t,
      sources: (db.prepare(`
        SELECT source_type FROM threat_sources WHERE threat_id = ?
      `).all(t.id) as any[]).map(r => r.source_type),
      actors: (db.prepare(`
        SELECT actor_type FROM threat_actors WHERE threat_id = ?
      `).all(t.id) as any[]).map(r => r.actor_type),
      attack_vectors: (db.prepare(`
        SELECT attack_vector FROM threat_attack_vectors WHERE threat_id = ?
      `).all(t.id) as any[]).map(r => r.attack_vector)
    }));

    // Get linked vulnerability categories
    const vulnerabilities = db.prepare(`
      SELECT vc.*
      FROM vulnerability_categories vc
      JOIN assessment_vulnerability_categories avc ON avc.vulnerability_category_id = vc.display_id
      WHERE avc.assessment_id = ?
      ORDER BY vc.domain ASC, vc.name ASC
    `).all(assessment.id) as any[];

    // Enrich with CIA impacts
    const enrichedVulnerabilities = vulnerabilities.map(v => ({
      ...v,
      cia_impacts: (db.prepare(`
        SELECT cia_impact FROM vulnerability_category_cia_impacts WHERE vulnerability_category_id = ?
      `).all(v.id) as any[]).map(r => r.cia_impact)
    }));

    // Get linked controls
    const controls = db.prepare(`
      SELECT c.*
      FROM controls c
      JOIN assessment_controls ac ON ac.control_id = c.display_id
      WHERE ac.assessment_id = ?
      ORDER BY c.control_type ASC, c.name ASC
    `).all(assessment.id) as any[];

    return res.status(200).json({
      assessmentId: assessment.display_id,
      cyberRisks: enrichedCyberRisks,
      threats: enrichedThreats,
      vulnerabilities: enrichedVulnerabilities,
      controls: controls
    });
  } catch (error) {
    console.error("Error fetching linked entities:", error);
    return res.status(500).json({ error: "Failed to fetch linked entities" });
  }
}
