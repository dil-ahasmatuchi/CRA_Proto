-- Migration 004: Add tables for explicit assessment entity relationships
-- These tables store which cyber risks, threats, vulnerabilities, and controls
-- are explicitly included in an assessment (derived from asset relationships)

-- Assessment Cyber Risks (many-to-many)
CREATE TABLE IF NOT EXISTS assessment_cyber_risks (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    cyber_risk_id TEXT NOT NULL,  -- Display ID (e.g., "CR-001")
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE,
    UNIQUE(assessment_id, cyber_risk_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_cyber_risks_assessment
    ON assessment_cyber_risks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_cyber_risks_risk
    ON assessment_cyber_risks(cyber_risk_id);

-- Assessment Threats (many-to-many)
CREATE TABLE IF NOT EXISTS assessment_threats (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    threat_id TEXT NOT NULL,  -- Display ID (e.g., "THR-001")
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE,
    UNIQUE(assessment_id, threat_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_threats_assessment
    ON assessment_threats(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_threats_threat
    ON assessment_threats(threat_id);

-- Assessment Vulnerability Categories (many-to-many)
CREATE TABLE IF NOT EXISTS assessment_vulnerability_categories (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    vulnerability_category_id TEXT NOT NULL,  -- Display ID (e.g., "VC-001")
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE,
    UNIQUE(assessment_id, vulnerability_category_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_vuln_cats_assessment
    ON assessment_vulnerability_categories(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_vuln_cats_vuln
    ON assessment_vulnerability_categories(vulnerability_category_id);

-- Assessment Controls (many-to-many)
CREATE TABLE IF NOT EXISTS assessment_controls (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL,
    control_id TEXT NOT NULL,  -- Display ID (e.g., "CTL-001")
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES cyber_risk_assessments(id) ON DELETE CASCADE,
    UNIQUE(assessment_id, control_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_controls_assessment
    ON assessment_controls(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_controls_control
    ON assessment_controls(control_id);
