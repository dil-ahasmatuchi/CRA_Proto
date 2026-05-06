/**
 * Migration: Create Cyber Risk Assessment tables
 *
 * Run: node --import tsx/esm scripts/migrate-assessments.ts
 */

import Database from "better-sqlite3";

const db = new Database("./data.db");

console.log("Creating Cyber Risk Assessment tables...\n");

// Check if scenarios table already exists
const existingScenarios = db.prepare(`
  SELECT name FROM sqlite_master WHERE type='table' AND name='scenarios'
`).get() as any;

if (existingScenarios) {
  console.log("⚠️  Existing 'scenarios' table detected. Renaming to 'scenarios_old'...");
  db.exec("ALTER TABLE scenarios RENAME TO scenarios_old");
}

try {
  db.exec(`
    -- ============================================================================
    -- CYBER RISK ASSESSMENTS TABLE
    -- ============================================================================
    CREATE TABLE IF NOT EXISTS cyber_risk_assessments (
      id TEXT PRIMARY KEY,
      display_id TEXT UNIQUE NOT NULL,

      -- Basic info
      name TEXT NOT NULL,
      assessment_type TEXT DEFAULT 'cyber_risk',

      -- Dates
      start_date TEXT,
      due_date TEXT,
      completed_at TEXT,

      -- Phase/Status
      phase TEXT NOT NULL DEFAULT 'draft',  -- draft, scoping, inProgress, review, overdue, assessmentApproved

      -- Owners (comma-separated user IDs for simplicity)
      owner_ids TEXT,  -- "user-1,user-2,user-3"

      -- Scoring settings
      scoring_type TEXT DEFAULT 'inherent',  -- inherent, residual
      aggregation_method TEXT DEFAULT 'highest',  -- highest, average

      -- AI Scoring tracking
      ai_scoring_phase TEXT DEFAULT 'idle',  -- idle, processing, complete
      ai_scoring_completed_at TEXT,

      -- Metadata
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- ============================================================================
    -- ASSESSMENT SCOPE: Assets included in this assessment
    -- ============================================================================
    CREATE TABLE IF NOT EXISTS assessment_scope_assets (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      asset_id TEXT NOT NULL,  -- References assets.display_id (e.g., "AST-001")
      included BOOLEAN DEFAULT 1,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE,
      UNIQUE(assessment_id, asset_id)
    );

    CREATE INDEX IF NOT EXISTS idx_scope_assets_assessment
      ON assessment_scope_assets(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_scope_assets_asset
      ON assessment_scope_assets(asset_id);

    -- ============================================================================
    -- ASSESSMENT EXCLUSIONS: Explicitly excluded catalog items
    -- ============================================================================
    CREATE TABLE IF NOT EXISTS assessment_exclusions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,  -- 'cyber_risk', 'threat', 'vulnerability', 'control', 'scenario'
      entity_id TEXT NOT NULL,    -- Display ID of excluded entity
      reason TEXT,
      excluded_at TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE,
      UNIQUE(assessment_id, entity_type, entity_id)
    );

    CREATE INDEX IF NOT EXISTS idx_exclusions_assessment
      ON assessment_exclusions(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_exclusions_entity
      ON assessment_exclusions(entity_type, entity_id);

    -- ============================================================================
    -- SCENARIOS: Generated from scope, scored by AI (NEW VERSION)
    -- ============================================================================
    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      display_id TEXT UNIQUE NOT NULL,
      assessment_id TEXT NOT NULL,

      -- Core relationships (display IDs)
      name TEXT NOT NULL,
      asset_id TEXT NOT NULL,              -- AST-001
      cyber_risk_id TEXT NOT NULL,         -- CRK-001
      threat_id TEXT,                      -- THR-001
      vulnerability_id TEXT,               -- VUL-001 (can be NULL)

      -- Scores (NULL until scored)
      impact INTEGER,                      -- 1-5 (from asset criticality)
      impact_label TEXT,                   -- "High"
      threat_severity INTEGER,             -- 1-5 (from AI or manual)
      threat_severity_label TEXT,
      vulnerability_severity INTEGER,      -- 1-5 (from AI or manual)
      vulnerability_severity_label TEXT,
      likelihood INTEGER,                  -- 1-25 (calculated: T×V)
      likelihood_label TEXT,
      cyber_risk_score INTEGER,            -- 1-125 (calculated: I×L)
      cyber_risk_score_label TEXT,

      -- Rationale
      scoring_rationale TEXT,              -- Markdown rationale from AI

      -- Status flags
      status TEXT DEFAULT 'active',        -- active, archived
      is_not_applicable BOOLEAN DEFAULT 0, -- Marked as N/A by user
      is_excluded BOOLEAN DEFAULT 0,       -- Explicitly excluded from assessment

      -- Metadata
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      scored_at TEXT,                      -- When AI/manual scoring completed
      scored_by TEXT,                      -- 'ai' or 'manual' or user ID

      FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_scenarios_assessment ON scenarios(assessment_id);
    CREATE INDEX IF NOT EXISTS idx_scenarios_asset ON scenarios(asset_id);
    CREATE INDEX IF NOT EXISTS idx_scenarios_cyber_risk ON scenarios(cyber_risk_id);
    CREATE INDEX IF NOT EXISTS idx_scenarios_threat ON scenarios(threat_id);
    CREATE INDEX IF NOT EXISTS idx_scenarios_vulnerability ON scenarios(vulnerability_id);

    -- ============================================================================
    -- SCENARIO RELATIONSHIPS: Track which threats/vulns/controls relate to scenario
    -- ============================================================================
    CREATE TABLE IF NOT EXISTS scenario_relationships (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,  -- 'threat', 'vulnerability', 'control'
      entity_id TEXT NOT NULL,    -- Display ID (THR-001, VUL-001, CTL-001)

      FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
      UNIQUE(scenario_id, entity_type, entity_id)
    );

    CREATE INDEX IF NOT EXISTS idx_scenario_rels_scenario
      ON scenario_relationships(scenario_id);
    CREATE INDEX IF NOT EXISTS idx_scenario_rels_entity
      ON scenario_relationships(entity_type, entity_id);
  `);

  console.log("✅ Cyber Risk Assessment tables created successfully");

  // Show table summary
  const tables = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table'
    AND (name LIKE '%assessment%' OR name LIKE 'scenario%')
    ORDER BY name
  `).all();

  console.log("\n📊 Assessment tables:");
  tables.forEach((t: any) => {
    const count = db.prepare(`SELECT COUNT(*) as cnt FROM ${t.name}`).get() as { cnt: number };
    console.log(`  - ${t.name} (${count.cnt} rows)`);
  });

  console.log("\n✅ Migration complete");
  console.log("\n📝 Note: Old scenarios table backed up as 'scenarios_old'");
  console.log("   You can drop it with: sqlite3 data.db 'DROP TABLE scenarios_old'");

} catch (error) {
  console.error("\n❌ Migration failed:", error);
  if (existingScenarios) {
    console.log("Rolling back: restoring scenarios_old...");
    db.exec("DROP TABLE IF EXISTS scenarios");
    db.exec("ALTER TABLE scenarios_old RENAME TO scenarios");
  }
  throw error;
} finally {
  db.close();
}
