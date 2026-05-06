import { scoreScenario } from "./api/lib/scoringAgent.js";

const testScenario = {
  scenarioId: "SC-092",
  scenarioName: "Phishing and business email compromise on Access Control System",
  asset: {
    name: "Access Control System",
    assetType: "Application",
    criticality: 4,
    criticalityLabel: "High",
  },
  threat: {
    name: "Phishing and business email compromise",
    description: "Fraudulent attempt to obtain sensitive information through deceptive communications",
    domain: "Social Engineering",
    sources: ["External", "Email"],
    threatActors: ["Cybercriminals", "Nation-state actors"],
    attackVectors: ["Email phishing", "Spear phishing", "Credential theft"],
  },
  vulnerability: {
    name: "Weak Access Controls",
    description: "Insufficient authentication and authorization mechanisms",
    domain: "Access Control",
    vulnerabilityType: "Configuration",
  },
  cyberRiskName: "Unauthorized access to critical systems",
};

async function test() {
  try {
    console.log("Testing AI scoring for scenario SC-092...\n");
    const result = await scoreScenario(testScenario);
    console.log("✓ Scoring successful!");
    console.log("\nResults:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("✗ Scoring failed:");
    console.error(error);
    process.exit(1);
  }
}

test();
