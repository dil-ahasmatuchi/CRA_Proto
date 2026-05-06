/**
 * Mock Scoring Agent
 *
 * Rule-based implementation for testing and demonstration.
 * Uses heuristics from the specification to generate scores.
 */

import type {
  IScoringAgent,
  ScoringInput,
  ScoringOutput,
  BatchScoringInput,
  BatchScoringOutput,
  ScoringAgentConfig,
  SeverityScore,
  ConfidenceLevel,
} from "./scoringAgent.js";
import {
  getSeverityLabel,
  getLikelihoodLabel,
  getCyberRiskScoreLabel,
  calculateLikelihood,
  calculateCyberRiskScore,
  createTimestamp,
  validateInput,
} from "./scoringAgent.js";

export class MockScoringAgent implements IScoringAgent {
  private config: ScoringAgentConfig = {
    mode: "mock",
    version: "1.0.0",
    timeoutMs: 5000,
  };

  getConfig(): ScoringAgentConfig {
    return { ...this.config };
  }

  async scoreScenario(input: ScoringInput): Promise<ScoringOutput> {
    // Simulate processing delay (0.5-2s)
    await this.delay(500 + Math.random() * 1500);

    // Check if N/A
    if (input.isNotApplicable) {
      return this.createSkippedOutput(input);
    }

    // Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return this.createLowConfidenceOutput(input, validation.issues);
    }

    // Score threat severity
    const threatResult = this.scoreThreatSeverity(input);

    // Score vulnerability severity
    const vulnerabilityResult = this.scoreVulnerabilitySeverity(input);

    // Calculate derived values
    const likelihood = calculateLikelihood(
      threatResult.severity,
      vulnerabilityResult.severity
    );
    const cyberRiskScore = calculateCyberRiskScore(input.asset.criticality, likelihood);

    // Determine if review needed
    const needsReview =
      threatResult.confidence === "low" || vulnerabilityResult.confidence === "low";

    const reviewReason = needsReview
      ? this.buildReviewReason(threatResult, vulnerabilityResult)
      : undefined;

    // Generate combined summary
    const combinedSummary = this.generateCombinedSummary(
      input,
      threatResult,
      vulnerabilityResult,
      likelihood,
      cyberRiskScore
    );

    return {
      scenarioId: input.scenarioId,
      timestamp: createTimestamp(),
      scoringMode: "inherent",

      threatSeverity: threatResult.severity,
      threatSeverityLabel: getSeverityLabel(threatResult.severity),
      threatConfidence: threatResult.confidence,
      threatConfidenceReason: threatResult.confidenceReason,
      threatRationale: threatResult.rationale,

      vulnerabilitySeverity: vulnerabilityResult.severity,
      vulnerabilitySeverityLabel: getSeverityLabel(vulnerabilityResult.severity),
      vulnerabilityConfidence: vulnerabilityResult.confidence,
      vulnerabilityConfidenceReason: vulnerabilityResult.confidenceReason,
      vulnerabilityRationale: vulnerabilityResult.rationale,

      combinedRationaleSummary: combinedSummary,

      calculatedLikelihood: likelihood,
      calculatedLikelihoodLabel: getLikelihoodLabel(likelihood),
      calculatedCyberRiskScore: cyberRiskScore,
      calculatedCyberRiskScoreLabel: getCyberRiskScoreLabel(cyberRiskScore),

      needsReview,
      reviewReason,
    };
  }

  async scoreBatch(input: BatchScoringInput): Promise<BatchScoringOutput> {
    const results: ScoringOutput[] = [];
    const errors: BatchScoringOutput["errors"] = [];

    for (const scenario of input.scenarios) {
      try {
        const result = await this.scoreScenario(scenario);
        results.push(result);
      } catch (error) {
        errors.push({
          scenarioId: scenario.scenarioId,
          scenarioName: scenario.scenarioName,
          error: error instanceof Error ? error.message : String(error),
          errorCode: "SCORING_ERROR",
        });
      }
    }

    const succeeded = results.filter((r) => !r.skipped).length;
    const skipped = results.filter((r) => r.skipped).length;
    const flaggedForReview = results.filter((r) => r.needsReview).length;

    return {
      assessmentId: input.assessmentId,
      timestamp: createTimestamp(),
      results,
      summary: {
        total: input.scenarios.length,
        succeeded,
        failed: errors.length,
        flaggedForReview,
        skipped,
      },
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ========================================================================
  // Private Scoring Logic
  // ========================================================================

  private scoreThreatSeverity(input: ScoringInput): {
    severity: SeverityScore;
    confidence: ConfidenceLevel;
    confidenceReason?: string;
    rationale: string;
  } {
    const { threat, asset } = input;

    // Check data quality
    const dataQuality = this.assessThreatDataQuality(threat);
    if (dataQuality.confidence === "low") {
      return {
        severity: 2,
        confidence: "low",
        confidenceReason: dataQuality.reason,
        rationale: this.generateThreatRationale(input, 2, "low", dataQuality.reason),
      };
    }

    // Calculate base severity from threat actor
    let baseSeverity = this.getThreatActorSeverity(threat.threatActors);

    // Adjust for attack vector accessibility
    const vectorAdjustment = this.getAttackVectorAdjustment(threat.attackVectors);
    baseSeverity += vectorAdjustment;

    // Adjust for asset criticality
    const assetAdjustment = this.getAssetCriticalityAdjustment(asset.criticality);
    baseSeverity += assetAdjustment;

    // Adjust for domain-asset alignment
    const alignmentAdjustment = this.getThreatDomainAlignmentAdjustment(
      threat.domain,
      asset.assetType
    );
    baseSeverity += alignmentAdjustment;

    // Clamp to 1-5
    const severity = Math.max(1, Math.min(5, Math.round(baseSeverity))) as SeverityScore;

    // Determine confidence
    const confidence = dataQuality.confidence;

    return {
      severity,
      confidence,
      confidenceReason: dataQuality.reason,
      rationale: this.generateThreatRationale(input, severity, confidence, dataQuality.reason),
    };
  }

  private scoreVulnerabilitySeverity(input: ScoringInput): {
    severity: SeverityScore;
    confidence: ConfidenceLevel;
    confidenceReason?: string;
    rationale: string;
  } {
    const { vulnerability, asset } = input;

    // Check data quality
    const dataQuality = this.assessVulnerabilityDataQuality(vulnerability);
    if (dataQuality.confidence === "low") {
      return {
        severity: 2,
        confidence: "low",
        confidenceReason: dataQuality.reason,
        rationale: this.generateVulnerabilityRationale(input, 2, "low", dataQuality.reason),
      };
    }

    // Base severity from CIA impact
    let baseSeverity = this.getCIAImpactSeverity(vulnerability.primaryCIAImpact);

    // Adjust for domain-asset alignment
    const alignmentAdjustment = this.getVulnerabilityDomainAlignmentAdjustment(
      vulnerability.domain,
      asset.assetType
    );
    baseSeverity += alignmentAdjustment;

    // Adjust for asset criticality
    const assetAdjustment = this.getAssetCriticalityAdjustment(asset.criticality);
    baseSeverity += assetAdjustment;

    // Clamp to 1-5
    const severity = Math.max(1, Math.min(5, Math.round(baseSeverity))) as SeverityScore;

    // Determine confidence
    const confidence = dataQuality.confidence;

    return {
      severity,
      confidence,
      confidenceReason: dataQuality.reason,
      rationale: this.generateVulnerabilityRationale(
        input,
        severity,
        confidence,
        dataQuality.reason
      ),
    };
  }

  // ========================================================================
  // Heuristic Functions
  // ========================================================================

  private getThreatActorSeverity(actors: string[]): number {
    if (actors.length === 0) return 2;

    const severities = actors.map((actor) => {
      if (actor.includes("Nation-State")) return 5;
      if (actor.includes("Organised Cybercriminal")) return 4;
      if (actor.includes("Hacktivist")) return 3;
      if (actor.includes("Malicious Insider")) return 4;
      if (actor.includes("Negligent")) return 2;
      if (actor.includes("Opportunistic") || actor.includes("Script Kiddie")) return 1;
      return 2;
    });

    return Math.max(...severities);
  }

  private getAttackVectorAdjustment(vectors: string[]): number {
    if (vectors.length === 0) return -0.5;

    const accessible = vectors.some(
      (v) => v.includes("Email") || v.includes("Web Application") || v.includes("Cloud")
    );
    const physical = vectors.some((v) => v.includes("Physical"));

    if (accessible) return 0.5;
    if (physical) return -0.5;
    return 0;
  }

  private getAssetCriticalityAdjustment(criticality: number): number {
    if (criticality === 5) return 1.0;
    if (criticality === 4) return 0.5;
    if (criticality === 3) return 0;
    if (criticality === 2) return -0.5;
    return -1.0;
  }

  private getThreatDomainAlignmentAdjustment(domain: string, assetType: string): number {
    const alignments: Record<string, string[]> = {
      "Application & API": ["Application", "Cloud service", "Server"],
      "Data & Information": ["Database", "Cloud service"],
      "Endpoint & Device": ["Endpoint", "IoT device"],
      "Network & Infrastructure": ["Network device", "Server"],
      "Cloud & Virtualisation": ["Cloud service", "Server"],
    };

    for (const [threatDomain, assetTypes] of Object.entries(alignments)) {
      if (domain.includes(threatDomain) && assetTypes.includes(assetType)) {
        return 0.5;
      }
    }

    return 0;
  }

  private getCIAImpactSeverity(impacts: string[]): number {
    const count = impacts.length;
    if (count === 3) return 5;
    if (count === 2) return 3.5;
    return 2.5;
  }

  private getVulnerabilityDomainAlignmentAdjustment(
    domain: string,
    assetType: string
  ): number {
    if (domain === "Technology") return 0.5;
    if (domain === "People") return 0.25;
    return 0;
  }

  // ========================================================================
  // Data Quality Assessment
  // ========================================================================

  private assessThreatDataQuality(threat: ScoringInput["threat"]): {
    confidence: ConfidenceLevel;
    reason?: string;
  } {
    const issues: string[] = [];

    if (!threat.description || threat.description.length < 10) {
      issues.push("Missing or insufficient threat description");
    }

    if (threat.threatActors.length === 0) {
      issues.push("No threat actors specified");
    }

    if (threat.attackVectors.length === 0) {
      issues.push("No attack vectors specified");
    }

    if (threat.status === "Draft") {
      issues.push("Threat status is Draft");
    }

    if (issues.length >= 2) {
      return {
        confidence: "low",
        reason: issues.join(". "),
      };
    }

    if (issues.length === 1) {
      return {
        confidence: "medium",
        reason: issues[0],
      };
    }

    return { confidence: "high" };
  }

  private assessVulnerabilityDataQuality(vulnerability: ScoringInput["vulnerability"]): {
    confidence: ConfidenceLevel;
    reason?: string;
  } {
    const issues: string[] = [];

    if (!vulnerability.description || vulnerability.description.length < 10) {
      issues.push("Missing or insufficient vulnerability description");
    }

    if (!vulnerability.vulnerabilityType) {
      issues.push("No vulnerability type specified");
    }

    if (vulnerability.status === "Draft") {
      issues.push("Vulnerability status is Draft");
    }

    if (issues.length >= 2) {
      return {
        confidence: "low",
        reason: issues.join(". "),
      };
    }

    if (issues.length === 1) {
      return {
        confidence: "medium",
        reason: issues[0],
      };
    }

    return { confidence: "high" };
  }

  // ========================================================================
  // Rationale Generation
  // ========================================================================

  private generateThreatRationale(
    input: ScoringInput,
    severity: SeverityScore,
    confidence: ConfidenceLevel,
    confidenceReason?: string
  ): string {
    const { threat, asset, orgUnit } = input;
    const label = getSeverityLabel(severity);

    let rationale = `**Threat Severity: ${severity} - ${label}**\n\n`;
    rationale += `**Confidence: ${confidence.charAt(0).toUpperCase() + confidence.slice(1)}**\n`;

    if (confidenceReason) {
      rationale += `${confidenceReason}\n`;
    }

    rationale += `\n**Scoring Basis:** Inherent Risk (without controls)\n\n`;
    rationale += `**Analysis:**\n\n`;

    rationale += `**1. Threat Actor Capability**\n`;
    if (threat.threatActors.length > 0) {
      rationale += `Primary actors: ${threat.threatActors.join(", ")}. `;
      rationale += `These actors represent varying levels of sophistication and motivation.\n\n`;
    } else {
      rationale += `No threat actors specified - unable to assess capability.\n\n`;
    }

    rationale += `**2. Asset Context**\n`;
    rationale += `Asset: ${asset.name} (${asset.assetType}, Criticality: ${asset.criticality}/5)\n`;
    rationale += `Org Unit: ${orgUnit.name}\n`;
    rationale += `Asset criticality influences threat severity assessment.\n\n`;

    rationale += `**3. Threat Characteristics**\n`;
    rationale += `• Domain: ${threat.domain}\n`;
    rationale += `• Sources: ${threat.sources.join(", ")}\n`;
    rationale += `• Attack Vectors: ${threat.attackVectors.length > 0 ? threat.attackVectors.join(", ") : "Not specified"}\n\n`;

    rationale += `**4. Domain-Asset Type Alignment**\n`;
    rationale += `Threat Domain: ${threat.domain}\n`;
    rationale += `Asset Type: ${asset.assetType}\n`;
    rationale += `Alignment assessment factored into scoring.\n\n`;

    rationale += `**Severity Determination:**\n`;
    rationale += `${label} severity (${severity}) reflects the combination of threat actor capabilities, `;
    rationale += `attack vector accessibility, asset criticality (${asset.criticality}/5), and domain-asset alignment. `;
    rationale += `This is an inherent risk assessment without considering existing controls.\n`;

    if (confidence === "low") {
      rationale += `\n**Review Recommended:** ${confidenceReason}`;
    }

    return rationale;
  }

  private generateVulnerabilityRationale(
    input: ScoringInput,
    severity: SeverityScore,
    confidence: ConfidenceLevel,
    confidenceReason?: string
  ): string {
    const { vulnerability, asset, orgUnit } = input;
    const label = getSeverityLabel(severity);

    let rationale = `**Vulnerability Severity: ${severity} - ${label}**\n\n`;
    rationale += `**Confidence: ${confidence.charAt(0).toUpperCase() + confidence.slice(1)}**\n`;

    if (confidenceReason) {
      rationale += `${confidenceReason}\n`;
    }

    rationale += `\n**Scoring Basis:** Inherent Risk (without controls)\n\n`;
    rationale += `**Analysis:**\n\n`;

    rationale += `**1. Exploitability Assessment**\n`;
    if (vulnerability.vulnerabilityType) {
      rationale += `Vulnerability type: ${vulnerability.vulnerabilityType}. `;
      rationale += `Exploitability assessed based on type and asset context.\n\n`;
    } else {
      rationale += `No vulnerability type specified - exploitability cannot be precisely assessed.\n\n`;
    }

    rationale += `**2. Asset Context**\n`;
    rationale += `Asset: ${asset.name} (${asset.assetType}, Criticality: ${asset.criticality}/5)\n`;
    rationale += `Org Unit: ${orgUnit.name}\n`;
    rationale += `High criticality assets amplify vulnerability severity.\n\n`;

    rationale += `**3. Vulnerability Characteristics**\n`;
    rationale += `• Domain: ${vulnerability.domain}\n`;
    rationale += `• Type: ${vulnerability.vulnerabilityType || "Not specified"}\n`;
    rationale += `• Status: ${vulnerability.status}\n\n`;

    rationale += `**4. CIA Impact Analysis**\n`;
    if (vulnerability.primaryCIAImpact.length > 0) {
      rationale += `Impacts: ${vulnerability.primaryCIAImpact.join(", ")} (${vulnerability.primaryCIAImpact.length} pillar${vulnerability.primaryCIAImpact.length > 1 ? "s" : ""})\n`;
      rationale += `Multiple CIA impacts increase severity.\n\n`;
    } else {
      rationale += `No CIA impacts specified.\n\n`;
    }

    rationale += `**Severity Determination:**\n`;
    rationale += `${label} severity (${severity}) based on exploitability assessment, `;
    rationale += `CIA impact scope (${vulnerability.primaryCIAImpact.length} pillar${vulnerability.primaryCIAImpact.length > 1 ? "s" : ""}), `;
    rationale += `and asset criticality (${asset.criticality}/5). `;
    rationale += `This is an inherent risk assessment without considering existing controls.\n`;

    if (confidence === "low") {
      rationale += `\n**Review Recommended:** ${confidenceReason}`;
    }

    return rationale;
  }

  private generateCombinedSummary(
    input: ScoringInput,
    threatResult: { severity: SeverityScore; confidence: ConfidenceLevel; confidenceReason?: string },
    vulnResult: { severity: SeverityScore; confidence: ConfidenceLevel; confidenceReason?: string },
    likelihood: number,
    cyberRiskScore: number
  ): string {
    const { asset, threat, vulnerability, orgUnit } = input;

    let summary = `## Threat Severity: ${threatResult.severity} - ${getSeverityLabel(threatResult.severity)} | Confidence: ${threatResult.confidence.charAt(0).toUpperCase() + threatResult.confidence.slice(1)}\n\n`;

    summary += `${threat.name} represents a ${getSeverityLabel(threatResult.severity).toLowerCase()} severity threat to ${asset.name}. `;
    summary += `The threat involves ${threat.threatActors.length > 0 ? threat.threatActors[0] : "unspecified actors"} `;
    summary += `targeting this ${asset.assetType.toLowerCase()} (criticality ${asset.criticality}/5) `;
    summary += `through ${threat.attackVectors.length > 0 ? threat.attackVectors[0].toLowerCase() : "unspecified vectors"}.\n\n`;

    if (threatResult.confidence !== "high" && threatResult.confidenceReason) {
      summary += `⚠️ *Confidence Note: ${threatResult.confidenceReason}*\n\n`;
    }

    summary += `---\n\n`;

    summary += `## Vulnerability Severity: ${vulnResult.severity} - ${getSeverityLabel(vulnResult.severity)} | Confidence: ${vulnResult.confidence.charAt(0).toUpperCase() + vulnResult.confidence.slice(1)}\n\n`;

    summary += `${vulnerability.name} scores ${getSeverityLabel(vulnResult.severity).toLowerCase()} severity `;
    summary += `with ${vulnerability.primaryCIAImpact.length} CIA pillar${vulnerability.primaryCIAImpact.length > 1 ? "s" : ""} affected `;
    summary += `(${vulnerability.primaryCIAImpact.join(", ")}). `;
    summary += `This ${vulnerability.domain.toLowerCase()} vulnerability on a criticality ${asset.criticality}/5 asset creates significant exposure.\n\n`;

    if (vulnResult.confidence !== "high" && vulnResult.confidenceReason) {
      summary += `⚠️ *Confidence Note: ${vulnResult.confidenceReason}*\n\n`;
    }

    summary += `---\n\n`;

    summary += `## Calculated Risk Metrics\n\n`;
    summary += `**Likelihood:** ${likelihood} - ${getLikelihoodLabel(likelihood)} (Threat ${threatResult.severity} × Vulnerability ${vulnResult.severity})\n`;
    summary += `**Cyber Risk Score:** ${cyberRiskScore} - ${getCyberRiskScoreLabel(cyberRiskScore)} (Impact ${asset.criticality} × Likelihood ${likelihood})\n\n`;

    summary += `This scenario represents a ${getLikelihoodLabel(likelihood).toLowerCase()} likelihood, ${getCyberRiskScoreLabel(cyberRiskScore).toLowerCase()} impact risk to ${orgUnit.name}.\n\n`;

    summary += `---\n\n`;

    summary += `## Scoring Context\n\n`;
    summary += `**Asset:** ${asset.name} (${asset.assetType}, Criticality: ${asset.criticality}/5)\n`;
    summary += `**Org Unit:** ${orgUnit.name}\n`;
    summary += `**Scoring Mode:** Inherent Risk (without controls)`;

    // Add review notes for low confidence
    if (threatResult.confidence === "low" || vulnResult.confidence === "low") {
      summary += `\n\n---\n\n## Review Notes\n\n`;
      summary += `This scenario requires review before finalizing assessment:\n\n`;

      if (threatResult.confidenceReason) {
        summary += `• **Threat**: ${threatResult.confidenceReason}\n`;
      }
      if (vulnResult.confidenceReason) {
        summary += `• **Vulnerability**: ${vulnResult.confidenceReason}\n`;
      }

      summary += `\nRecommended actions:\n`;
      summary += `1. Complete missing threat and vulnerability catalog data\n`;
      summary += `2. Validate domain-asset type alignments\n`;
      summary += `3. Re-run scoring after data completion\n`;
    }

    return summary;
  }

  // ========================================================================
  // Helper Methods
  // ========================================================================

  private createSkippedOutput(input: ScoringInput): ScoringOutput {
    return {
      scenarioId: input.scenarioId,
      timestamp: createTimestamp(),
      scoringMode: "inherent",
      skipped: true,
      skipReason: "Scenario marked as Not Applicable to this assessment",
      threatSeverity: null,
      threatSeverityLabel: null,
      threatConfidence: "high",
      threatRationale: "",
      vulnerabilitySeverity: null,
      vulnerabilitySeverityLabel: null,
      vulnerabilityConfidence: "high",
      vulnerabilityRationale: "",
      combinedRationaleSummary: `This scenario has been marked as Not Applicable to this assessment and was not scored.\n\n**Reason**: The assessment team determined this scenario is not relevant to the current assessment scope.\n\n---\n\n## Scoring Context\n\n**Asset:** ${input.asset.name} (${input.asset.assetType}, Criticality: ${input.asset.criticality}/5)\n**Org Unit:** ${input.orgUnit.name}\n**Status:** Not Applicable`,
      calculatedLikelihood: null,
      calculatedLikelihoodLabel: null,
      calculatedCyberRiskScore: null,
      calculatedCyberRiskScoreLabel: null,
      needsReview: false,
    };
  }

  private createLowConfidenceOutput(
    input: ScoringInput,
    issues: string[]
  ): ScoringOutput {
    const severity: SeverityScore = 2;
    const confidence: ConfidenceLevel = "low";
    const reason = issues.join(". ");

    return {
      scenarioId: input.scenarioId,
      timestamp: createTimestamp(),
      scoringMode: "inherent",
      threatSeverity: severity,
      threatSeverityLabel: getSeverityLabel(severity),
      threatConfidence: confidence,
      threatConfidenceReason: reason,
      threatRationale: `**Threat Severity: ${severity} - Low**\n\n**Confidence: Low**\nCritical validation errors: ${reason}\n\nUnable to score reliably due to data quality issues.`,
      vulnerabilitySeverity: severity,
      vulnerabilitySeverityLabel: getSeverityLabel(severity),
      vulnerabilityConfidence: confidence,
      vulnerabilityConfidenceReason: reason,
      vulnerabilityRationale: `**Vulnerability Severity: ${severity} - Low**\n\n**Confidence: Low**\nCritical validation errors: ${reason}\n\nUnable to score reliably due to data quality issues.`,
      combinedRationaleSummary: `## Scoring Error\n\n⚠️ **Unable to score this scenario due to data quality issues:**\n\n${issues.map((i) => `• ${i}`).join("\n")}\n\nPlease correct these issues and re-run scoring.`,
      calculatedLikelihood: 4,
      calculatedLikelihoodLabel: getLikelihoodLabel(4),
      calculatedCyberRiskScore: input.asset.criticality * 4,
      calculatedCyberRiskScoreLabel: getCyberRiskScoreLabel(input.asset.criticality * 4),
      needsReview: true,
      reviewReason: reason,
    };
  }

  private buildReviewReason(
    threatResult: { confidence: ConfidenceLevel; confidenceReason?: string },
    vulnResult: { confidence: ConfidenceLevel; confidenceReason?: string }
  ): string {
    const reasons: string[] = [];

    if (threatResult.confidence === "low" && threatResult.confidenceReason) {
      reasons.push(`Threat: ${threatResult.confidenceReason}`);
    }

    if (vulnResult.confidence === "low" && vulnResult.confidenceReason) {
      reasons.push(`Vulnerability: ${vulnResult.confidenceReason}`);
    }

    return reasons.join(". ");
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockScoringAgent = new MockScoringAgent();
