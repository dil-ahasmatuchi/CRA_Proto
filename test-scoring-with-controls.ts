import { scoreScenario } from "./api/lib/scoringAgent.js";

const testScenario = {
  scenarioId: "SC-TEST",
  scenarioName: "Test scenario with controls",
  asset: {
    name: "Payment Processing System",
    assetType: "Application",
    criticality: 5,
    criticalityLabel: "Very high",
    description: "Core payment processing application handling customer transactions",
    owner: "Finance Team",
    location: "AWS us-east-1",
  },
  threat: {
    name: "Ransomware attack",
    description: "Malicious encryption of data with ransom demand",
    domain: "Malware",
    sources: ["External", "Email"],
    threatActors: ["Cybercriminals", "Organized crime"],
    attackVectors: ["Email phishing", "Remote access", "Exploit kits"],
  },
  vulnerability: {
    name: "Unpatched systems",
    description: "Systems running outdated software versions",
    domain: "Configuration",
    vulnerabilityType: "Missing patches",
  },
  controls: [
    {
      name: "Endpoint detection and response",
      description: "Real-time monitoring and response to endpoint threats",
      controlType: "Detective",
      effectiveness: "4",
    },
    {
      name: "Email security gateway",
      description: "Scans and blocks malicious emails and attachments",
      controlType: "Preventive",
      effectiveness: "5",
    },
    {
      name: "Regular backup procedures",
      description: "Daily encrypted backups with offline storage",
      controlType: "Recovery",
      effectiveness: "5",
    },
  ],
  cyberRiskName: "Business disruption from ransomware",
};

async function test() {
  try {
    console.log("Testing AI scoring with controls...\n");
    console.log("Controls provided:");
    testScenario.controls.forEach((c) => {
      console.log(`- ${c.name} (${c.controlType}, effectiveness: ${c.effectiveness})`);
    });
    console.log();

    const result = await scoreScenario(testScenario);
    console.log("✓ Scoring successful!\n");
    console.log("Threat Rationale:");
    console.log(result.threatRationale);
    console.log("\nVulnerability Rationale:");
    console.log(result.vulnerabilityRationale);
    console.log("\nScores:");
    console.log(`- Threat: ${result.threatSeverity} (${result.threatSeverityLabel})`);
    console.log(`- Vulnerability: ${result.vulnerabilitySeverity} (${result.vulnerabilitySeverityLabel})`);
    console.log(`- Cyber Risk Score: ${result.cyberRiskScore} (${result.cyberRiskScoreLabel})`);
    console.log(`- Confidence: ${result.confidence}`);
  } catch (error) {
    console.error("✗ Scoring failed:");
    console.error(error);
    process.exit(1);
  }
}

test();
