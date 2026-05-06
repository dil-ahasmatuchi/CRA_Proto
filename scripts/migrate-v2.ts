/**
 * Migration v2 — additive changes only (safe to run on top of existing DB).
 *
 * Changes:
 *   1. Add inherent_score / residual_score columns to cyber_risks
 *   2. Create controls table
 *   3. Create control_cyber_risks junction table (control ↔ cyber risk)
 *   4. Create control_assets junction table (control ↔ asset)
 *
 * Run: npx tsx scripts/migrate-v2.ts
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? path.join(__dirname, "..", "data.db");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---------------------------------------------------------------------------
// 1. Add score columns to cyber_risks (idempotent via IF NOT EXISTS simulation)
// ---------------------------------------------------------------------------
const existingCols = (
  db.prepare("PRAGMA table_info(cyber_risks)").all() as { name: string }[]
).map((r) => r.name);

if (!existingCols.includes("inherent_score")) {
  db.exec("ALTER TABLE cyber_risks ADD COLUMN inherent_score INTEGER");
  console.log("  + cyber_risks.inherent_score added");
}
if (!existingCols.includes("inherent_score_label")) {
  db.exec("ALTER TABLE cyber_risks ADD COLUMN inherent_score_label TEXT");
  console.log("  + cyber_risks.inherent_score_label added");
}
if (!existingCols.includes("residual_score")) {
  db.exec("ALTER TABLE cyber_risks ADD COLUMN residual_score INTEGER");
  console.log("  + cyber_risks.residual_score added");
}
if (!existingCols.includes("residual_score_label")) {
  db.exec("ALTER TABLE cyber_risks ADD COLUMN residual_score_label TEXT");
  console.log("  + cyber_risks.residual_score_label added");
}

// ---------------------------------------------------------------------------
// 2. Controls + junction tables
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS controls (
    id                  TEXT PRIMARY KEY,
    display_id          TEXT UNIQUE NOT NULL,
    name                TEXT NOT NULL,
    description         TEXT,
    control_type        TEXT NOT NULL DEFAULT 'Preventive' CHECK (control_type IN ('Preventive', 'Detective')),
    key_control         INTEGER NOT NULL DEFAULT 0,
    control_frequency   TEXT CHECK (control_frequency IN (
                          'Continuous', 'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually'
                        )),
    effectiveness       INTEGER CHECK (effectiveness BETWEEN 1 AND 5),
    effectiveness_label TEXT,
    status              TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Active', 'Archived')),
    owner               TEXT,
    created_at          TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS control_cyber_risks (
    control_id    TEXT NOT NULL REFERENCES controls(id)    ON DELETE CASCADE,
    cyber_risk_id TEXT NOT NULL REFERENCES cyber_risks(id) ON DELETE CASCADE,
    PRIMARY KEY (control_id, cyber_risk_id)
  );

  CREATE TABLE IF NOT EXISTS control_assets (
    control_id TEXT NOT NULL REFERENCES controls(id) ON DELETE CASCADE,
    asset_id   TEXT NOT NULL REFERENCES assets(id)   ON DELETE CASCADE,
    PRIMARY KEY (control_id, asset_id)
  );

  CREATE INDEX IF NOT EXISTS idx_control_assets_asset  ON control_assets(asset_id);
  CREATE INDEX IF NOT EXISTS idx_control_risks_risk    ON control_cyber_risks(cyber_risk_id);
`);

console.log("  + controls table ready");
console.log("  + control_cyber_risks junction table ready");
console.log("  + control_assets junction table ready");
console.log(`\nMigration v2 complete. Database: ${DB_PATH}`);
db.close();
