/**
 * Scoring Agent Output Validator
 *
 * Validates ScoringOutput objects to ensure they meet specification requirements.
 * Use this to verify agent outputs before persisting to database or displaying in UI.
 */

export interface ScoringOutput {
  scenarioId: string;
  timestamp: string;
  scoringMode: "inherent";

  skipped?: boolean;
  skipReason?: string;

  threatSeverity: 1 | 2 | 3 | 4 | 5 | null;
  threatSeverityLabel: "Very low" | "Low" | "Medium" | "High" | "Very high" | null;
  threatConfidence: "high" | "medium" | "low";
  threatConfidenceReason?: string;
  threatRationale: string;

  vulnerabilitySeverity: 1 | 2 | 3 | 4 | 5 | null;
  vulnerabilitySeverityLabel: "Very low" | "Low" | "Medium" | "High" | "Very high" | null;
  vulnerabilityConfidence: "high" | "medium" | "low";
  vulnerabilityConfidenceReason?: string;
  vulnerabilityRationale: string;

  combinedRationaleSummary: string;

  calculatedLikelihood: number | null;
  calculatedLikelihoodLabel: string | null;
  calculatedCyberRiskScore: number | null;
  calculatedCyberRiskScoreLabel: string | null;

  needsReview: boolean;
  reviewReason?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "critical" | "error";
}

export interface ValidationWarning {
  field: string;
  message: string;
  severity: "warning" | "info";
}

// Label mappings from spec
const SEVERITY_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high",
};

const LIKELIHOOD_BANDS = [
  { from: 1, to: 5, label: "Very low" },
  { from: 6, to: 10, label: "Low" },
  { from: 11, to: 15, label: "Medium" },
  { from: 16, to: 20, label: "High" },
  { from: 21, to: 25, label: "Very high" },
];

const CYBER_RISK_SCORE_BANDS = [
  { from: 1, to: 25, label: "Very low" },
  { from: 26, to: 50, label: "Low" },
  { from: 51, to: 75, label: "Medium" },
  { from: 76, to: 100, label: "High" },
  { from: 101, to: 125, label: "Very high" },
];

/**
 * Main validation function
 */
export function validateScoringOutput(output: ScoringOutput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // If skipped, validate skip fields only
  if (output.skipped === true) {
    return validateSkippedScenario(output);
  }

  // Required fields
  if (!output.scenarioId || typeof output.scenarioId !== "string") {
    errors.push({
      field: "scenarioId",
      message: "scenarioId is required and must be a non-empty string",
      severity: "critical",
    });
  }

  if (!output.timestamp || !isValidISO8601(output.timestamp)) {
    errors.push({
      field: "timestamp",
      message: "timestamp must be valid ISO 8601 format (e.g., 2026-05-06T15:30:00Z)",
      severity: "error",
    });
  }

  if (output.scoringMode !== "inherent") {
    errors.push({
      field: "scoringMode",
      message: "scoringMode must be 'inherent' for current spec version",
      severity: "error",
    });
  }

  // Validate threat severity
  validateSeverityScore(output, "threat", errors, warnings);

  // Validate vulnerability severity
  validateSeverityScore(output, "vulnerability", errors, warnings);

  // Validate rationales
  validateRationales(output, errors, warnings);

  // Validate calculations
  validateCalculations(output, errors, warnings);

  // Validate confidence and review flags
  validateConfidenceAndReview(output, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate skipped scenarios
 */
function validateSkippedScenario(output: ScoringOutput): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!output.skipReason) {
    errors.push({
      field: "skipReason",
      message: "skipReason is required when skipped=true",
      severity: "error",
    });
  }

  if (output.threatSeverity !== null) {
    warnings.push({
      field: "threatSeverity",
      message: "threatSeverity should be null when skipped=true",
      severity: "warning",
    });
  }

  if (output.vulnerabilitySeverity !== null) {
    warnings.push({
      field: "vulnerabilitySeverity",
      message: "vulnerabilitySeverity should be null when skipped=true",
      severity: "warning",
    });
  }

  if (output.calculatedLikelihood !== null) {
    warnings.push({
      field: "calculatedLikelihood",
      message: "calculatedLikelihood should be null when skipped=true",
      severity: "warning",
    });
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate severity score and label
 */
function validateSeverityScore(
  output: ScoringOutput,
  metric: "threat" | "vulnerability",
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const severityField = `${metric}Severity` as keyof ScoringOutput;
  const labelField = `${metric}SeverityLabel` as keyof ScoringOutput;
  const confidenceField = `${metric}Confidence` as keyof ScoringOutput;

  const severity = output[severityField] as number | null;
  const label = output[labelField] as string | null;
  const confidence = output[confidenceField] as string;

  // Validate severity value
  if (severity !== null && ![1, 2, 3, 4, 5].includes(severity)) {
    errors.push({
      field: severityField as string,
      message: `${metric}Severity must be 1, 2, 3, 4, or 5 (got ${severity})`,
      severity: "critical",
    });
  }

  // Validate label matches severity
  if (severity !== null && label !== null) {
    const expectedLabel = SEVERITY_LABELS[severity as 1 | 2 | 3 | 4 | 5];
    if (label !== expectedLabel) {
      errors.push({
        field: labelField as string,
        message: `${metric}SeverityLabel must be "${expectedLabel}" for severity ${severity} (got "${label}")`,
        severity: "error",
      });
    }
  }

  // Validate confidence
  if (!["high", "medium", "low"].includes(confidence)) {
    errors.push({
      field: confidenceField as string,
      message: `${metric}Confidence must be "high", "medium", or "low" (got "${confidence}")`,
      severity: "error",
    });
  }

  // Validate confidence reason
  const confidenceReasonField = `${metric}ConfidenceReason` as keyof ScoringOutput;
  const confidenceReason = output[confidenceReasonField] as string | undefined;

  if (confidence === "medium" || confidence === "low") {
    if (!confidenceReason || confidenceReason.trim().length === 0) {
      errors.push({
        field: confidenceReasonField as string,
        message: `${metric}ConfidenceReason is required when confidence is "${confidence}"`,
        severity: "error",
      });
    } else if (confidenceReason.length < 10) {
      warnings.push({
        field: confidenceReasonField as string,
        message: `${metric}ConfidenceReason is very short (${confidenceReason.length} chars) - should explain specific issue`,
        severity: "warning",
      });
    }
  }
}

/**
 * Validate rationale fields
 */
function validateRationales(
  output: ScoringOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Threat rationale
  if (!output.skipped) {
    validateRationaleField(
      output.threatRationale,
      "threatRationale",
      "Threat",
      output.threatConfidence,
      250,
      400,
      errors,
      warnings
    );

    // Vulnerability rationale
    validateRationaleField(
      output.vulnerabilityRationale,
      "vulnerabilityRationale",
      "Vulnerability",
      output.vulnerabilityConfidence,
      250,
      400,
      errors,
      warnings
    );

    // Combined summary
    const minWords = output.threatConfidence === "low" || output.vulnerabilityConfidence === "low" ? 300 : 200;
    const maxWords = output.threatConfidence === "low" || output.vulnerabilityConfidence === "low" ? 600 : 350;

    validateRationaleField(
      output.combinedRationaleSummary,
      "combinedRationaleSummary",
      "Combined",
      output.threatConfidence === "low" || output.vulnerabilityConfidence === "low" ? "low" : "high",
      minWords,
      maxWords,
      errors,
      warnings
    );
  }
}

/**
 * Validate individual rationale field
 */
function validateRationaleField(
  rationale: string,
  fieldName: string,
  metricName: string,
  confidence: string,
  minWords: number,
  maxWords: number,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (!rationale || rationale.trim().length === 0) {
    errors.push({
      field: fieldName,
      message: `${fieldName} is required and cannot be empty`,
      severity: "critical",
    });
    return;
  }

  const wordCount = rationale.trim().split(/\s+/).length;

  // Check word count
  if (wordCount < minWords) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} is too short (${wordCount} words, target: ${minWords}-${maxWords})`,
      severity: "warning",
    });
  } else if (wordCount > maxWords) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} is too long (${wordCount} words, target: ${minWords}-${maxWords})`,
      severity: "warning",
    });
  }

  // Check for confidence mention (except for skipped scenarios)
  if (!rationale.includes("Confidence:") && fieldName !== "combinedRationaleSummary") {
    warnings.push({
      field: fieldName,
      message: `${fieldName} should include "Confidence: [High/Medium/Low]" section`,
      severity: "warning",
    });
  }

  // Check for confidence in combined summary header
  if (fieldName === "combinedRationaleSummary" && !rationale.match(/Confidence:\s+(High|Medium|Low)/)) {
    warnings.push({
      field: fieldName,
      message: "combinedRationaleSummary should include confidence in section headers",
      severity: "warning",
    });
  }

  // Check for "Inherent Risk" mention
  if (!rationale.includes("Inherent Risk") && !rationale.includes("inherent")) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} should mention "Inherent Risk (without controls)"`,
      severity: "info",
    });
  }

  // Check for confidence warning callouts
  if ((confidence === "medium" || confidence === "low") && !rationale.includes("⚠️")) {
    warnings.push({
      field: fieldName,
      message: `${fieldName} should include warning callout (⚠️) for ${confidence} confidence`,
      severity: "warning",
    });
  }

  // Check for Review Notes in low confidence
  if (confidence === "low" && fieldName === "combinedRationaleSummary" && !rationale.includes("## Review Notes")) {
    errors.push({
      field: fieldName,
      message: "combinedRationaleSummary must include '## Review Notes' section for low confidence",
      severity: "error",
    });
  }

  // Check for placeholder text
  if (rationale.includes("[TODO]") || rationale.includes("[FILL IN]") || rationale.includes("[X]")) {
    errors.push({
      field: fieldName,
      message: `${fieldName} contains placeholder text - must be complete`,
      severity: "error",
    });
  }
}

/**
 * Validate calculations
 */
function validateCalculations(
  output: ScoringOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (output.skipped) return;

  const { threatSeverity, vulnerabilitySeverity, calculatedLikelihood, calculatedCyberRiskScore } = output;

  if (threatSeverity !== null && vulnerabilitySeverity !== null) {
    // Validate likelihood calculation
    const expectedLikelihood = threatSeverity * vulnerabilitySeverity;
    if (calculatedLikelihood !== expectedLikelihood) {
      errors.push({
        field: "calculatedLikelihood",
        message: `calculatedLikelihood must equal threatSeverity × vulnerabilitySeverity (expected ${expectedLikelihood}, got ${calculatedLikelihood})`,
        severity: "critical",
      });
    }

    // Validate likelihood label
    if (calculatedLikelihood !== null) {
      const expectedLikelihoodLabel = getLikelihoodLabel(calculatedLikelihood);
      if (output.calculatedLikelihoodLabel !== expectedLikelihoodLabel) {
        errors.push({
          field: "calculatedLikelihoodLabel",
          message: `calculatedLikelihoodLabel must be "${expectedLikelihoodLabel}" for likelihood ${calculatedLikelihood} (got "${output.calculatedLikelihoodLabel}")`,
          severity: "error",
        });
      }
    }
  }

  // Note: Cannot validate cyber risk score without asset.criticality (not in output)
  // This would be validated by the calling code that has access to the input

  // Validate cyber risk score label
  if (calculatedCyberRiskScore !== null) {
    const expectedCRSLabel = getCyberRiskScoreLabel(calculatedCyberRiskScore);
    if (output.calculatedCyberRiskScoreLabel !== expectedCRSLabel) {
      errors.push({
        field: "calculatedCyberRiskScoreLabel",
        message: `calculatedCyberRiskScoreLabel must be "${expectedCRSLabel}" for score ${calculatedCyberRiskScore} (got "${output.calculatedCyberRiskScoreLabel}")`,
        severity: "error",
      });
    }
  }
}

/**
 * Validate confidence and review flags
 */
function validateConfidenceAndReview(
  output: ScoringOutput,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  if (output.skipped) return;

  const { threatConfidence, vulnerabilityConfidence, needsReview, reviewReason } = output;

  // If ANY confidence is low, needsReview MUST be true
  if ((threatConfidence === "low" || vulnerabilityConfidence === "low") && needsReview !== true) {
    errors.push({
      field: "needsReview",
      message: "needsReview must be true when ANY confidence level is 'low'",
      severity: "critical",
    });
  }

  // If needsReview is true, reviewReason should be provided
  if (needsReview === true && (!reviewReason || reviewReason.trim().length === 0)) {
    warnings.push({
      field: "reviewReason",
      message: "reviewReason should explain why review is needed when needsReview is true",
      severity: "warning",
    });
  }

  // If needsReview is false but confidence is low, that's inconsistent
  if (needsReview === false && (threatConfidence === "low" || vulnerabilityConfidence === "low")) {
    errors.push({
      field: "needsReview",
      message: "needsReview is false but confidence is low - this is inconsistent",
      severity: "error",
    });
  }
}

/**
 * Helper: Get likelihood label from score
 */
function getLikelihoodLabel(score: number): string {
  for (const band of LIKELIHOOD_BANDS) {
    if (score >= band.from && score <= band.to) {
      return band.label;
    }
  }
  return "Unknown";
}

/**
 * Helper: Get cyber risk score label from score
 */
function getCyberRiskScoreLabel(score: number): string {
  for (const band of CYBER_RISK_SCORE_BANDS) {
    if (score >= band.from && score <= band.to) {
      return band.label;
    }
  }
  return "Unknown";
}

/**
 * Helper: Validate ISO 8601 timestamp
 */
function isValidISO8601(timestamp: string): boolean {
  // Basic check for ISO 8601 format
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  if (!iso8601Regex.test(timestamp)) {
    return false;
  }

  // Try to parse
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

/**
 * Batch validation for multiple outputs
 */
export function validateBatchScoringOutput(outputs: ScoringOutput[]): {
  allValid: boolean;
  results: Array<{ scenarioId: string; validation: ValidationResult }>;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    totalErrors: number;
    totalWarnings: number;
  };
} {
  const results = outputs.map((output) => ({
    scenarioId: output.scenarioId,
    validation: validateScoringOutput(output),
  }));

  const allValid = results.every((r) => r.validation.valid);
  const totalErrors = results.reduce((sum, r) => sum + r.validation.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.validation.warnings.length, 0);

  return {
    allValid,
    results,
    summary: {
      total: outputs.length,
      valid: results.filter((r) => r.validation.valid).length,
      invalid: results.filter((r) => !r.validation.valid).length,
      totalErrors,
      totalWarnings,
    },
  };
}

/**
 * Format validation result as human-readable string
 */
export function formatValidationResult(result: ValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return "✅ Validation passed with no issues";
  }

  let output = "";

  if (result.errors.length > 0) {
    output += `❌ ${result.errors.length} Error(s):\n`;
    for (const error of result.errors) {
      output += `  [${error.severity}] ${error.field}: ${error.message}\n`;
    }
  }

  if (result.warnings.length > 0) {
    output += `⚠️  ${result.warnings.length} Warning(s):\n`;
    for (const warning of result.warnings) {
      output += `  [${warning.severity}] ${warning.field}: ${warning.message}\n`;
    }
  }

  if (result.valid) {
    output += "\n✅ Validation passed (with warnings above)";
  } else {
    output += "\n❌ Validation failed - fix errors above";
  }

  return output;
}

/**
 * Example usage:
 *
 * ```typescript
 * import { validateScoringOutput, formatValidationResult } from './scoring_agent_validator';
 *
 * const output: ScoringOutput = {
 *   scenarioId: "SCN-001",
 *   timestamp: "2026-05-06T15:30:00Z",
 *   scoringMode: "inherent",
 *   threatSeverity: 4,
 *   threatSeverityLabel: "High",
 *   // ... rest of output
 * };
 *
 * const result = validateScoringOutput(output);
 * console.log(formatValidationResult(result));
 *
 * if (!result.valid) {
 *   throw new Error("Invalid scoring output");
 * }
 * ```
 */
