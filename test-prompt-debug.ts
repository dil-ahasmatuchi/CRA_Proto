import Database from "better-sqlite3";

const db = new Database("./data.db");

// Get SC-109 details
const scenario = db.prepare(`
  SELECT
    s.*,
    a.name as asset_name,
    a.asset_type,
    a.criticality,
    a.criticality_label,
    a.description as asset_description,
    a.owner as asset_owner,
    a.location as asset_location,
    t.name as threat_name,
    t.description as threat_description,
    t.domain as threat_domain,
    cr.name as cyber_risk_name
  FROM scenarios s
  LEFT JOIN assets a ON a.display_id = s.asset_id
  LEFT JOIN threats t ON t.display_id = s.threat_id
  LEFT JOIN cyber_risks cr ON cr.display_id = s.cyber_risk_id
  WHERE s.display_id = 'SC-109'
`).get() as any;

// Get threat details
const threatSources = db.prepare(`
  SELECT source_type FROM threat_sources
  WHERE threat_id = (SELECT id FROM threats WHERE display_id = ?)
`).all(scenario.threat_id) as any[];

const threatActors = db.prepare(`
  SELECT actor_type FROM threat_actors
  WHERE threat_id = (SELECT id FROM threats WHERE display_id = ?)
`).all(scenario.threat_id) as any[];

const attackVectors = db.prepare(`
  SELECT attack_vector FROM threat_attack_vectors
  WHERE threat_id = (SELECT id FROM threats WHERE display_id = ?)
`).all(scenario.threat_id) as any[];

// Get controls
const controls = db.prepare(`
  SELECT c.name, c.description, c.control_type, c.effectiveness
  FROM controls c
  JOIN control_assets ca ON ca.control_id = c.id
  JOIN assets a ON a.id = ca.asset_id
  WHERE a.display_id = ?
`).all(scenario.asset_id) as any[];

// Get vulnerability
let vulnerability = undefined;
if (scenario.vulnerability_id) {
  const vulnDetails = db.prepare(`
    SELECT v.name, v.description, v.domain, v.vulnerability_type
    FROM vulnerability_categories v
    WHERE v.display_id = ?
  `).get(scenario.vulnerability_id) as any;

  if (vulnDetails) {
    vulnerability = {
      name: vulnDetails.name,
      description: vulnDetails.description || "",
      domain: vulnDetails.domain || "",
      vulnerabilityType: vulnDetails.vulnerability_type || "",
    };
  }
}

// Build the scenario input object
const scenarioInput = {
  scenarioId: scenario.display_id,
  scenarioName: scenario.name,
  asset: {
    name: scenario.asset_name,
    assetType: scenario.asset_type,
    criticality: scenario.criticality,
    criticalityLabel: scenario.criticality_label,
    description: scenario.asset_description || undefined,
    owner: scenario.asset_owner || undefined,
    location: scenario.asset_location || undefined,
  },
  threat: {
    name: scenario.threat_name,
    description: scenario.threat_description || "",
    domain: scenario.threat_domain || "",
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
  cyberRiskName: scenario.cyber_risk_name || "",
};

console.log("=== SCENARIO INPUT ===");
console.log(JSON.stringify(scenarioInput, null, 2));
console.log("\n=== CONTROLS ===");
console.log(`Found ${controls.length} controls:`);
controls.forEach((c: any) => {
  console.log(`- ${c.name} (${c.control_type}, effectiveness: ${c.effectiveness})`);
});
