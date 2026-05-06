# Scoring Agent - Quick Reference Card

## 🎯 One-Page Cheat Sheet

---

## Formula

```
Impact = Asset Criticality (1-5)
Likelihood = Threat Severity × Vulnerability Severity (1-25)
Cyber Risk Score = Impact × Likelihood (1-125)
```

---

## Scoring Scales

### Threat Severity (1-5)
| Score | Label | Actor | Vector | Asset | Alignment |
|-------|-------|-------|--------|-------|-----------|
| 5 | Very high | Nation-state | Trivial | Critical (5) | Perfect |
| 4 | High | Org. crime | Easy | High (4-5) | Strong |
| 3 | Medium | Hacktivist | Moderate | Medium (3-4) | Moderate |
| 2 | Low | Negligent | Difficult | Low (1-3) | Weak |
| 1 | Very low | Opportunistic | Rare | Low (1-2) | Minimal |

### Vulnerability Severity (1-5)
| Score | Label | Exploit | CIA Impact | Asset | Notes |
|-------|-------|---------|-----------|-------|-------|
| 5 | Very high | Trivial | All 3 | Critical (5) | Known exploits |
| 4 | High | Easy | 2 pillars | High (4-5) | Common weakness |
| 3 | Medium | Moderate | 1-2 pillars | Medium (3-4) | Standard |
| 2 | Low | Difficult | 1 pillar | Low (1-3) | Rare conditions |
| 1 | Very low | Very hard | Minor | Low (1-2) | Theoretical |

---

## Confidence Levels

| Level | Criteria | Action | Review |
|-------|----------|--------|--------|
| **High** | All data, clear alignment | None | No |
| **Medium** | Minor gaps, some ambiguity | Add ⚠️ callout | Optional |
| **Low** | Critical missing, mismatch | Add Review Notes | **YES** |

**Rule**: If ANY confidence is low → `needsReview: true`

---

## Output Structure

```typescript
{
  scenarioId: "SCN-001",
  threatSeverity: 4,
  threatSeverityLabel: "High",
  threatConfidence: "high",
  threatRationale: "...",          // 250-350 words
  
  vulnerabilitySeverity: 4,
  vulnerabilityConfidence: "high",
  vulnerabilityRationale: "...",   // 250-350 words
  
  combinedRationaleSummary: "...", // 200-300 words (UI)
  
  calculatedLikelihood: 16,        // T × V
  calculatedLikelihoodLabel: "High",
  calculatedCyberRiskScore: 80,    // I × L
  calculatedCyberRiskScoreLabel: "High",
  
  needsReview: false
}
```

---

## Rationale Word Counts

| Type | High/Med | Low |
|------|----------|-----|
| Threat | 250-350 | 250-400 |
| Vulnerability | 250-350 | 250-400 |
| Combined Summary | 200-300 | 300-500 |

---

## Label Mappings

### Severity
```
1 → "Very low"
2 → "Low"
3 → "Medium"
4 → "High"
5 → "Very high"
```

### Likelihood (T × V)
```
1-5   → "Very low"
6-10  → "Low"
11-15 → "Medium"
16-20 → "High"
21-25 → "Very high"
```

### Cyber Risk Score (I × L)
```
1-25   → "Very low"
26-50  → "Low"
51-75  → "Medium"
76-100 → "High"
101-125 → "Very high"
```

---

## Special Cases

| Case | Action |
|------|--------|
| **isNotApplicable: true** | Return `skipped: true`, all scores null |
| **Empty description** | Score conservatively (2-3), low confidence |
| **Missing actors/vectors** | Low confidence, needsReview: true |
| **Draft status** | Low confidence, flag in rationale |
| **Decommissioned asset** | Score 1/1, low confidence, question validity |

---

## Rationale Templates

### High Confidence (Combined Summary)
```markdown
## Threat Severity: 4 - High | Confidence: High

[2-3 sentences: actor capability, vector accessibility, why this severity]

---

## Vulnerability Severity: 4 - High | Confidence: High

[2-3 sentences: exploitability, CIA impact, why this severity]

---

## Calculated Risk Metrics

**Likelihood:** 16 - High
**Cyber Risk Score:** 80 - High

[1-2 sentences on overall risk]

---

## Scoring Context

**Asset:** Payment Server (Server, Criticality: 5/5)
**Org Unit:** Finance Ops
**Scoring Mode:** Inherent Risk (without controls)
```

### Medium Confidence - Add:
```markdown
⚠️ *Confidence Note: [Specific reason]*
```

### Low Confidence - Add:
```markdown
⚠️ *Confidence Note: **Critical data missing** - [specific gaps]*

---

## Review Notes

### Critical Data Gaps:
• **[Field]**: [What's missing]

### Recommended Actions:
1. [Action 1]
2. [Action 2]

**DO NOT PROCEED** until data complete.
```

---

## Validation Checklist

- [ ] Scores are 1-5 (never 0 or >5)
- [ ] Labels match scores exactly
- [ ] L = T × V calculated correctly
- [ ] Confidence in all rationales
- [ ] ⚠️ callouts for med/low confidence
- [ ] Review Notes for low confidence
- [ ] needsReview = true if ANY low
- [ ] Word counts in target range
- [ ] No placeholder text
- [ ] "Inherent Risk" mentioned
- [ ] Asset name/criticality included

---

## Common Mistakes

| ❌ Don't | ✅ Do |
|---------|-------|
| Consider controls | Ignore controls (inherent risk!) |
| Use asterisks (*) | Use bullets (•) |
| Vague confidence | Specific: "Missing attack vectors" |
| Forget confidence in summary | Always include in headers |
| Score without data | Flag for review |

---

## Batch Processing

```typescript
{
  assessmentId: "ASM-001",
  scenarios: [...],  // All scenarios at once
}
↓
{
  results: [...],    // All outputs
  summary: {
    total: 50,
    succeeded: 48,
    failed: 1,
    flaggedForReview: 5,
    skipped: 1
  },
  errors: [...]      // Any failures
}
```

---

## Files Reference

| Need | File |
|------|------|
| Full spec | `SCORING_AGENT_SPEC.md` |
| UI alignment | `SCORING_AGENT_UI_REVIEW.md` |
| Rationale guide | `RATIONALE_FORMAT_GUIDE.md` |
| LLM prompt | `SCORING_AGENT_PROMPT.md` |
| Examples | `scoring_agent_examples.json` |
| Validator | `scoring_agent_validator.ts` |
| This card | `SCORING_AGENT_QUICK_REF.md` |

---

## Quick Examples

### High Confidence
```json
{
  "threatSeverity": 4,
  "threatConfidence": "high",
  "needsReview": false
}
```

### Medium Confidence
```json
{
  "threatSeverity": 3,
  "threatConfidence": "medium",
  "threatConfidenceReason": "Multiple actor types create ambiguity",
  "needsReview": false
}
```

### Low Confidence
```json
{
  "threatSeverity": 2,
  "threatConfidence": "low",
  "threatConfidenceReason": "Missing description, actors, and vectors",
  "needsReview": true,
  "reviewReason": "Complete threat catalog before assessment"
}
```

---

**Print this page and keep it handy during development!** 📄
