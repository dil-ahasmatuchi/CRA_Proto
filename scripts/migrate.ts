/**
 * scripts/migrate.ts
 *
 * Creates (or migrates) the SQLite schema for the CRA backend.
 * Safe to run multiple times — all statements use CREATE TABLE IF NOT EXISTS.
 *
 * Run:  npm run migrate
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath =
  process.env.DB_PATH ?? path.join(__dirname, "..", "data.db");

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

console.log(`Migrating database at: ${dbPath}`);

// ---------------------------------------------------------------------------
// Core tables
// ---------------------------------------------------------------------------

db.exec(`
  CREATE TABLE IF NOT EXISTS assets (
    id                TEXT PRIMARY KEY,
    display_id        TEXT UNIQUE NOT NULL,
    name              TEXT NOT NULL,
    description       TEXT,
    asset_type        TEXT NOT NULL CHECK (asset_type IN (
                        'IT Asset - Hardware',
                        'IT Asset - Software',
                        'IT Asset - Information system',
                        'IT Asset - Cloud'
                      )),
    criticality       INTEGER NOT NULL CHECK (criticality BETWEEN 1 AND 5),
    criticality_label TEXT NOT NULL CHECK (criticality_label IN (
                        'Very low', 'Low', 'Medium', 'High', 'Very high'
                      )),
    status            TEXT NOT NULL DEFAULT 'Active' CHECK (status IN (
                        'Active', 'Inactive', 'Decommissioned'
                      )),
    created_at        TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS threats (
    id              TEXT PRIMARY KEY,
    display_id      TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    domain          TEXT NOT NULL,
    description     TEXT,
    status          TEXT NOT NULL DEFAULT 'Active' CHECK (status IN (
                      'Draft', 'Active', 'Archived'
                    )),
    owner           TEXT,
    severity_level  INTEGER CHECK (severity_level BETWEEN 1 AND 5),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS vulnerability_categories (
    id                 TEXT PRIMARY KEY,
    display_id         TEXT UNIQUE NOT NULL,
    name               TEXT NOT NULL,
    description        TEXT,
    domain             TEXT NOT NULL CHECK (domain IN (
                         'Technology', 'People', 'Process', 'Physical'
                       )),
    vulnerability_type TEXT,
    status             TEXT NOT NULL DEFAULT 'Active' CHECK (status IN (
                         'Draft', 'Active', 'Archived'
                       )),
    owner              TEXT,
    created_at         TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS cyber_risks (
    id          TEXT PRIMARY KEY,
    display_id  TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    domain      TEXT,
    description TEXT,
    status      TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN (
                  'Draft', 'Identification', 'Assessment', 'Mitigation', 'Monitoring'
                )),
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS scenarios (
    id                       TEXT PRIMARY KEY,
    display_id               TEXT UNIQUE NOT NULL,
    name                     TEXT NOT NULL,
    asset_id                 TEXT NOT NULL REFERENCES assets(id),
    cyber_risk_id            TEXT NOT NULL REFERENCES cyber_risks(id),
    impact                   INTEGER CHECK (impact BETWEEN 1 AND 5),
    impact_label             TEXT,
    threat_severity          INTEGER CHECK (threat_severity BETWEEN 1 AND 5),
    threat_severity_label    TEXT,
    vulnerability_severity   INTEGER CHECK (vulnerability_severity BETWEEN 1 AND 5),
    vulnerability_severity_label TEXT,
    likelihood               INTEGER,
    likelihood_label         TEXT,
    cyber_risk_score         INTEGER,
    cyber_risk_score_label   TEXT,
    scoring_rationale        TEXT,
    ai_scored                INTEGER NOT NULL DEFAULT 0,
    scored_at                TEXT,
    created_at               TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ---------------------------------------------------------------------------
// Junction tables
// ---------------------------------------------------------------------------

db.exec(`
  CREATE TABLE IF NOT EXISTS threat_sources (
    threat_id   TEXT NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN (
                  'Deliberate', 'Accidental', 'Environmental'
                )),
    PRIMARY KEY (threat_id, source_type)
  );

  CREATE TABLE IF NOT EXISTS threat_actors (
    threat_id  TEXT NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    actor_type TEXT NOT NULL,
    PRIMARY KEY (threat_id, actor_type)
  );

  CREATE TABLE IF NOT EXISTS threat_attack_vectors (
    threat_id     TEXT NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    attack_vector TEXT NOT NULL,
    PRIMARY KEY (threat_id, attack_vector)
  );

  CREATE TABLE IF NOT EXISTS vulnerability_category_cia_impacts (
    vulnerability_category_id TEXT NOT NULL REFERENCES vulnerability_categories(id) ON DELETE CASCADE,
    cia_impact                TEXT NOT NULL CHECK (cia_impact IN (
                                'Confidentiality', 'Integrity', 'Availability'
                              )),
    PRIMARY KEY (vulnerability_category_id, cia_impact)
  );

  CREATE TABLE IF NOT EXISTS scenario_threats (
    scenario_id TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    threat_id   TEXT NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    PRIMARY KEY (scenario_id, threat_id)
  );

  CREATE TABLE IF NOT EXISTS scenario_vulnerability_categories (
    scenario_id               TEXT NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    vulnerability_category_id TEXT NOT NULL REFERENCES vulnerability_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (scenario_id, vulnerability_category_id)
  );

  CREATE TABLE IF NOT EXISTS asset_threats (
    asset_id  TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    threat_id TEXT NOT NULL REFERENCES threats(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, threat_id)
  );

  CREATE TABLE IF NOT EXISTS asset_vulnerability_categories (
    asset_id                  TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    vulnerability_category_id TEXT NOT NULL REFERENCES vulnerability_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, vulnerability_category_id)
  );

  CREATE TABLE IF NOT EXISTS asset_cyber_risks (
    asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    cyber_risk_id TEXT NOT NULL REFERENCES cyber_risks(id) ON DELETE CASCADE,
    PRIMARY KEY (asset_id, cyber_risk_id)
  );
`);

// ---------------------------------------------------------------------------
// Indexes for common query paths
// ---------------------------------------------------------------------------

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_assets_asset_type          ON assets(asset_type);
  CREATE INDEX IF NOT EXISTS idx_assets_criticality         ON assets(criticality);
  CREATE INDEX IF NOT EXISTS idx_scenarios_asset_id         ON scenarios(asset_id);
  CREATE INDEX IF NOT EXISTS idx_scenarios_risk_id          ON scenarios(cyber_risk_id);
  CREATE INDEX IF NOT EXISTS idx_scenarios_ai_scored        ON scenarios(ai_scored);
  CREATE INDEX IF NOT EXISTS idx_asset_threats_asset        ON asset_threats(asset_id);
  CREATE INDEX IF NOT EXISTS idx_asset_threats_threat       ON asset_threats(threat_id);
  CREATE INDEX IF NOT EXISTS idx_asset_vulns_asset          ON asset_vulnerability_categories(asset_id);
  CREATE INDEX IF NOT EXISTS idx_asset_vulns_vuln           ON asset_vulnerability_categories(vulnerability_category_id);
  CREATE INDEX IF NOT EXISTS idx_asset_risks_asset          ON asset_cyber_risks(asset_id);
  CREATE INDEX IF NOT EXISTS idx_asset_risks_risk           ON asset_cyber_risks(cyber_risk_id);
`);

console.log("Migration complete.");
db.close();
