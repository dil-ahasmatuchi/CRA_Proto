import { scoreScenario } from "./api/lib/scoringAgent.js";

// Test a cloud misconfiguration scenario WITH highly relevant CSPM control
const scenarioWithRelevantControl = {
  scenarioId: "TEST-001",
  scenarioName: "Cloud misconfiguration exposes Access Control System",
  asset: {
    name: "Access Control System",
    assetType: "IT Asset - Cloud",
    criticality: 4,
    criticalityLabel: "High",
    description: "Critical cloud-based access control system managing authentication and authorization",
  },
  threat: {
    name: "Cloud misconfiguration and public exposure",
    description: "Accidental exposure of cloud resources due to misconfiguration",
    domain: "Configuration",
    sources: ["Internal"],
    threatActors: ["Negligent employees", "Untrained staff"],
    attackVectors: ["API exposure", "Public bucket access", "Open ports"],
  },
  vulnerability: {
    name: "Weak Access Controls",
    description: "Insufficient cloud configuration validation",
    domain: "Access Control",
    vulnerabilityType: "Configuration",
  },
  controls: [
    {
      name: "Cloud security posture management",
      description: "Continuously scan cloud configurations against CIS benchmarks and auto-remediate drifts.",
      controlType: "Detective",
      effectiveness: "5",
    },
    {
      name: "Cloud access security broker",
      description: "Enforce data security policies and visibility for cloud applications accessed by users.",
      controlType: "Preventive",
      effectiveness: "4",
    },
  ],
  cyberRiskName: "Unauthorized access to critical systems",
};

async function test() {
  console.log("Testing cloud misconfiguration with CSPM control...\n");
  console.log("Controls:");
  scenarioWithRelevantControl.controls.forEach((c) => {
    console.log(`- ${c.name} (${c.controlType}, effectiveness: ${c.effectiveness})`);
    console.log(`  ${c.description}`);
  });
  console.log();

  const result = await scoreScenario(scenarioWithRelevantControl);

  console.log("=== THREAT RATIONALE ===");
  console.log(result.threatRationale);
  console.log("\n=== VULNERABILITY RATIONALE ===");
  console.log(result.vulnerabilityRationale);

  const mentionsCSPM = result.threatRationale.toLowerCase().includes("posture") ||
                       result.vulnerabilityRationale.toLowerCase().includes("posture") ||
                       result.threatRationale.toLowerCase().includes("cspm") ||
                       result.vulnerabilityRationale.toLowerCase().includes("cspm");

  const mentionsControls = result.threatRationale.toLowerCase().includes("control") ||
                          result.vulnerabilityRationale.toLowerCase().includes("control");

  console.log("\n=== ANALYSIS ===");
  console.log(`Mentions CSPM/posture: ${mentionsCSPM ? '✓ YES' : '✗ NO'}`);
  console.log(`Mentions controls: ${mentionsControls ? '✓ YES' : '✗ NO'}`);
  console.log(`\nScores: T=${result.threatSeverity}, V=${result.vulnerabilitySeverity}, Risk=${result.cyberRiskScore}`);
}

test().catch(console.error);
