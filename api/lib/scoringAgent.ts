/**
 * Real AI Scoring Agent using Anthropic Claude API
 *
 * Integrates with Claude to score cyber risk scenarios based on:
 * - Threat Severity (1-5)
 * - Vulnerability Severity (1-5)
 * - Provides rationale for each score
 */

import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

if (!ANTHROPIC_API_KEY) {
  console.warn("⚠️  ANTHROPIC_API_KEY not configured. AI scoring will fail.");
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

// Severity mapping
const SEVERITY_LABELS: Record<number, string> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

// Likelihood calculation
function calculateLikelihood(threatSeverity: number, vulnSeverity: number): number {
  return threatSeverity * vulnSeverity;
}

function getLikelihoodLabel(likelihood: number): string {
  if (likelihood <= 5) return "Very low";
  if (likelihood <= 10) return "Low";
  if (likelihood <= 15) return "Medium";
  if (likelihood <= 20) return "High";
  return "Very high";
}

// Cyber Risk Score calculation
function calculateCyberRiskScore(impact: number, likelihood: number): number {
  return impact * likelihood;
}

function getCyberRiskScoreLabel(score: number): string {
  if (score <= 2) return "Very low";
  if (score <= 8) return "Low";
  if (score <= 27) return "Medium";
  if (score <= 64) return "High";
  return "Very high";
}

interface ScenarioInput {
  scenarioId: string;
  scenarioName: string;
  asset: {
    name: string;
    assetType: string;
    criticality: number;
    criticalityLabel: string;
    description?: string;
  };
  threat: {
    name: string;
    description: string;
    domain: string;
    sources: string[];
    threatActors: string[];
    attackVectors: string[];
  };
  vulnerability?: {
    name: string;
    description?: string;
    domain: string;
    vulnerabilityType?: string;
  };
  controls?: Array<{
    name: string;
    description?: string;
    controlType?: string;
    effectiveness?: string;
  }>;
  cyberRiskName: string;
}

interface ScoringResult {
  scenarioId: string;
  threatSeverity: number;
  threatSeverityLabel: string;
  threatRationale: string;
  vulnerabilitySeverity: number;
  vulnerabilitySeverityLabel: string;
  vulnerabilityRationale: string;
  likelihood: number;
  likelihoodLabel: string;
  cyberRiskScore: number;
  cyberRiskScoreLabel: string;
  confidence: number; // 0-100
  confidenceLabel: string; // "High" | "Medium" | "Low"
}

/**
 * Score a single scenario using Claude API
 */
export async function scoreScenario(input: ScenarioInput): Promise<ScoringResult> {
  const prompt = buildScoringPrompt(input);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature: 0,
      system: SCORING_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Parse Claude's response
    const responseText = message.content[0]?.type === "text" ? message.content[0].text : "";
    const scores = parseClaudeResponse(responseText, input);

    return scores;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw new Error(`AI scoring failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Score multiple scenarios in batch
 */
export async function scoreScenarioBatch(
  scenarios: ScenarioInput[],
  onProgress?: (current: number, total: number) => void
): Promise<ScoringResult[]> {
  const results: ScoringResult[] = [];

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i]!;

    try {
      const result = await scoreScenario(scenario);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, scenarios.length);
      }
    } catch (error) {
      console.error(`Failed to score scenario ${scenario.scenarioId}:`, error);
      // Continue with next scenario even if one fails
    }
  }

  return results;
}

// System prompt for the scoring agent
const SCORING_SYSTEM_PROMPT = `You are an expert cyber risk assessment analyst. Your task is to score the severity of threats and vulnerabilities for specific scenarios.

For each scenario, you must provide:
1. Threat Severity Score (1-5) and rationale
2. Vulnerability Severity Score (1-5) and rationale
3. Confidence level (high/medium/low)

Scoring Scale (1-5):
- 1 (Very low): Minimal threat/vulnerability
- 2 (Low): Limited threat/vulnerability
- 3 (Medium): Moderate threat/vulnerability
- 4 (High): Significant threat/vulnerability
- 5 (Very high): Critical threat/vulnerability

When assessing severity, you MUST consider and evaluate:
- **Asset Context**: Asset type, criticality, business impact, and specific characteristics
- **Threat Severity**: Likelihood of the threat occurring, sophistication required, threat actor capabilities, attack vectors
- **Vulnerability Severity**: Ease of exploitation, prevalence of the vulnerability, attack surface exposure
- **Existing Controls**: Every control listed, their type (Preventive/Detective/Corrective/Recovery), effectiveness rating, and actual impact on risk reduction

CRITICAL REQUIREMENTS for your rationale:

1. **ALWAYS mention the asset's criticality rating** (e.g., "high-criticality (4/5) access control system")

2. **ALWAYS discuss controls** - For EACH rationale section:
   - If controls exist: Name specific controls, cite their effectiveness ratings, and explain their impact
   - If no controls: Explicitly state "no controls are in place" and explain the increased risk

3. **Be specific about control effectiveness**:
   - Preventive controls (effectiveness 4-5): "substantially reduce," "strongly mitigate," "significantly prevent"
   - Preventive controls (effectiveness 1-3): "partially reduce," "provide limited protection," "minimally prevent"
   - Detective controls: "enable detection," "provide visibility," "facilitate response"
   - If controls are ineffective for this threat: "do not address," "fail to mitigate," "provide no protection against"

4. **Structure your rationale**:
   - Threat Rationale: Asset criticality → Threat characteristics → How preventive/detective controls affect threat likelihood
   - Vulnerability Rationale: Asset exposure → Vulnerability exploitability → How controls reduce or fail to reduce exploitability

Respond in this EXACT JSON format:
{
  "threatSeverity": <1-5>,
  "threatRationale": "<3-4 sentences: asset criticality → threat details → specific controls and their impact on threat likelihood>",
  "vulnerabilitySeverity": <1-5>,
  "vulnerabilityRationale": "<3-4 sentences: asset exposure → vulnerability details → specific controls and their impact on exploitability>",
  "confidence": <0-100 integer representing your confidence in the assessment>
}

Confidence scoring guide:
- 90-100: High confidence - Clear threat/vulnerability with well-documented controls and standard scenarios
- 70-89: Medium-high confidence - Good information but some uncertainty about control effectiveness or threat likelihood
- 50-69: Medium confidence - Limited information or conflicting factors affecting assessment
- 30-49: Low-medium confidence - Significant gaps in information or highly variable factors
- 0-29: Low confidence - Insufficient information or highly speculative assessment`;

function buildScoringPrompt(input: ScenarioInput): string {
  let prompt = `Score this cyber risk scenario:

SCENARIO: ${input.scenarioName}
CYBER RISK: ${input.cyberRiskName}

ASSET:
- Name: ${input.asset.name}
- Type: ${input.asset.assetType}
- Criticality: ${input.asset.criticality}/5 (${input.asset.criticalityLabel})`;

  if (input.asset.description) {
    prompt += `\n- Description: ${input.asset.description}`;
  }

  prompt += `

THREAT:
- Name: ${input.threat.name}
- Description: ${input.threat.description}
- Domain: ${input.threat.domain}
- Sources: ${input.threat.sources.join(", ")}
- Threat Actors: ${input.threat.threatActors.join(", ")}
- Attack Vectors: ${input.threat.attackVectors.join(", ")}
`;

  if (input.vulnerability) {
    prompt += `
VULNERABILITY:
- Name: ${input.vulnerability.name}
- Description: ${input.vulnerability.description || "N/A"}
- Domain: ${input.vulnerability.domain}
- Type: ${input.vulnerability.vulnerabilityType || "N/A"}
`;
  } else {
    prompt += `
VULNERABILITY: Not specified
`;
  }

  if (input.controls && input.controls.length > 0) {
    prompt += `
EXISTING CONTROLS (${input.controls.length}):`;
    for (const control of input.controls) {
      prompt += `\n- ${control.name}`;
      if (control.controlType) {
        prompt += ` (${control.controlType})`;
      }
      if (control.description) {
        prompt += `\n  Description: ${control.description}`;
      }
      if (control.effectiveness) {
        prompt += `\n  Effectiveness: ${control.effectiveness}`;
      }
    }
  } else {
    prompt += `
EXISTING CONTROLS: None specified`;
  }

  prompt += `

Provide threat severity and vulnerability severity scores with detailed rationale that considers the asset context, threat characteristics, vulnerability details, and existing controls.`;

  return prompt;
}

function getConfidenceLabel(confidence: number): string {
  if (confidence >= 90) return "High";
  if (confidence >= 70) return "Medium-High";
  if (confidence >= 50) return "Medium";
  if (confidence >= 30) return "Low-Medium";
  return "Low";
}

function parseClaudeResponse(response: string, input: ScenarioInput): ScoringResult {
  try {
    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const threatSeverity = Math.max(1, Math.min(5, parsed.threatSeverity));
    const vulnerabilitySeverity = Math.max(1, Math.min(5, parsed.vulnerabilitySeverity));
    const impact = input.asset.criticality;
    const likelihood = calculateLikelihood(threatSeverity, vulnerabilitySeverity);
    const cyberRiskScore = calculateCyberRiskScore(impact, likelihood);

    // Parse confidence as number, default to 75 (medium-high) if not provided or invalid
    const confidenceNum = typeof parsed.confidence === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.confidence)))
      : 75;

    return {
      scenarioId: input.scenarioId,
      threatSeverity,
      threatSeverityLabel: SEVERITY_LABELS[threatSeverity]!,
      threatRationale: parsed.threatRationale || "No rationale provided",
      vulnerabilitySeverity,
      vulnerabilitySeverityLabel: SEVERITY_LABELS[vulnerabilitySeverity]!,
      vulnerabilityRationale: parsed.vulnerabilityRationale || "No rationale provided",
      likelihood,
      likelihoodLabel: getLikelihoodLabel(likelihood),
      cyberRiskScore,
      cyberRiskScoreLabel: getCyberRiskScoreLabel(cyberRiskScore),
      confidence: confidenceNum,
      confidenceLabel: getConfidenceLabel(confidenceNum),
    };
  } catch (error) {
    console.error("Failed to parse Claude response:", error);
    throw new Error("Failed to parse AI response");
  }
}
