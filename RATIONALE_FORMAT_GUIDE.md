# Scoring Agent Rationale Format Guide

## Overview

Each scenario requires **three rationale outputs**:

1. **Threat Rationale** (detailed) - Full analysis for audit trail
2. **Vulnerability Rationale** (detailed) - Full analysis for audit trail  
3. **Combined Summary** - Concise user-facing rationale for WYSIWYG editor

All three should include the **confidence level** and reasoning.

---

## Format 1: Individual Metric Rationale (Full Detailed)

### Purpose
- Stored in database for audit/compliance
- Shown in history panel (collapsible)
- Comprehensive reasoning trail
- **Target Length**: 250-350 words per metric

### Template Structure

```markdown
**[Threat/Vulnerability] Severity: [Score] - [Label]**

**Confidence: [High/Medium/Low]**
[If Medium/Low: 1 sentence explaining why confidence is not high]

**Scoring Basis:** Inherent Risk (without controls)

**Analysis:**

**1. [Primary Factor Category]**
[Key observations and their impact on severity]

**2. Asset Context**
Asset: [Name] ([Type], Criticality: [X]/5)  
Org Unit: [Name]  
[Why this context matters for scoring]

**3. [Threat/Vulnerability] Characteristics**
• [Attribute 1]: [Value] → [Impact statement]
• [Attribute 2]: [Value] → [Impact statement]
• [Attribute 3]: [Value] → [Impact statement]

**4. Domain-Asset Type Alignment**
[Threat/Vulnerability] Domain: [Domain]  
Asset Type: [Type]  
Alignment: [Strong/Moderate/Weak]  
[Explanation of alignment impact]

**5. [Additional Analysis Category]**
[CIA Impact analysis for vulnerability OR Attack Vector analysis for threat]

**Severity Determination:**
[2-3 sentences synthesizing factors into final score. Must explain why this score (not higher or lower) based on inherent risk.]

[If Medium/Low confidence: **Review Recommended:** [Specific items to verify]]
```

---

## Format 2: Combined Summary Rationale (Concise UI Display)

### Purpose
- Displayed in WYSIWYG editor on Scenario Rationale Page
- User can edit/augment
- Balances detail with readability
- **Target Length**: 200-300 words total

### Template Structure

```markdown
## Threat Severity: [Score] - [Label] | Confidence: [High/Medium/Low]

[2-3 sentences covering:]
• Primary threat actor capability and motivation
• Attack vector accessibility in this asset context  
• Why this severity level (key deciding factor)

[If Medium/Low confidence:]
⚠️ *Confidence Note: [Brief reason, e.g., "Limited threat description data"]*

---

## Vulnerability Severity: [Score] - [Label] | Confidence: [High/Medium/Low]

[2-3 sentences covering:]
• Exploitability level
• CIA impact scope
• Why this severity level in this asset context

[If Medium/Low confidence:]
⚠️ *Confidence Note: [Brief reason, e.g., "Generic vulnerability type classification"]*

---

## Calculated Risk Metrics

**Likelihood:** [T×V Score] - [Label]  
**Cyber Risk Score:** [I×L Score] - [Label]

[1-2 sentences on overall risk picture and business implications]

---

## Scoring Context

**Asset:** [Name] ([Type], Criticality: [X]/5)  
**Org Unit:** [Org Unit Name]  
**Scoring Mode:** Inherent Risk (without controls)

[If ANY confidence is Medium/Low:]

---

## Review Notes

[Bulleted list of specific items needing validation before finalizing assessment]
```

---

## Examples by Confidence Level

### Example 1: HIGH CONFIDENCE

#### Threat Rationale (Full)

```markdown
**Threat Severity: 4 - High**

**Confidence: High**

**Scoring Basis:** Inherent Risk (without controls)

**Analysis:**

**1. Threat Actor Capability**
Primary actor identified as Organised Cybercriminal Group, representing professional, profit-motivated adversaries with established attack patterns and specialized tooling. These actors possess intermediate-to-advanced capabilities and target high-value financial systems. Secondary actor (Hacktivist) adds ideological motivation vector, though typically lower sophistication.

**2. Asset Context**
Asset: Payment Processing Server (Server, Criticality: 5/5)  
Org Unit: Finance Operations  
This is mission-critical financial infrastructure handling sensitive payment data with strict regulatory requirements (PCI-DSS). High asset criticality amplifies threat severity as successful attack would cause maximum business impact including financial loss, regulatory penalties, and reputational damage.

**3. Threat Characteristics**
• Attack Vector: Web Application & Browser → Highly accessible, no physical proximity required, supports both automated and manual exploitation
• Threat Source: Deliberate → Intentional, repeatable attack pattern indicating persistent threat
• Description Content: "Common in web applications" confirms this is an established, prevalent threat with known exploitation patterns
• Status: Active → Threat is currently relevant and poses immediate risk

**4. Domain-Asset Type Alignment**
Threat Domain: Application & API  
Asset Type: Server (hosting web applications with database connectivity)  
Alignment: Strong  
Servers running web applications are primary targets for application-layer attacks. The threat domain directly maps to the asset's function and exposure, maximizing exploitability.

**5. Attack Vector Analysis**
Web Application & Browser vector provides universal accessibility to any internet-connected attacker. No specialized access requirements or physical controls create barriers. Automated reconnaissance and exploitation tools (e.g., SQLMap, Burp Suite) are freely available, lowering the skill threshold for successful attacks.

**Severity Determination:**
High severity (4) is warranted based on organized, financially-motivated threat actors, highly accessible attack vectors, critical asset value (criticality 5/5), and strong threat domain/asset type alignment. The threat is active, deliberate, and targets financial systems matching this asset profile. Not scored as Very High (5) because this represents organized crime rather than nation-state level threat, and the attack requires some application interaction rather than passive exploitation.
```

#### Vulnerability Rationale (Full)

```markdown
**Vulnerability Severity: 4 - High**

**Confidence: High**

**Scoring Basis:** Inherent Risk (without controls)

**Analysis:**

**1. Exploitability Assessment**
Application Security Defects, specifically SQL injection flaws, are classified as easily exploitable with only basic SQL knowledge required. Automated scanning tools (SQLMap, Havij, jSQL Injection) are freely available and capable of detecting and exploiting these vulnerabilities with minimal user intervention. The OWASP Top 10 consistently ranks injection flaws in the highest severity category, indicating widespread exploitability.

**2. Asset Context**
Asset: Payment Processing Server (Server, Criticality: 5/5)  
Org Unit: Finance Operations  
Critical server hosting payment applications with direct database connectivity. Successful exploitation provides immediate access to sensitive financial records, customer payment information, and transaction data. The asset's role in financial operations creates severe consequences for any confidentiality or integrity breach.

**3. Vulnerability Characteristics**
• Type: Application Security Defect (code-level weakness in input validation)
• Domain: Technology (systematic technical vulnerability)
• Description: "injection flaws, broken authentication, insecure deserialization, insufficient input validation" - comprehensive list indicating multiple exploitation paths
• Status: Active → Vulnerability is present and exploitable in current system state

**4. Domain-Asset Type Alignment**
Vulnerability Domain: Technology  
Asset Type: Server (running web applications with database backend)  
Alignment: Strong  
Application security defects are highly relevant to servers hosting web-facing applications. The vulnerability type directly enables the identified SQL injection threat through inadequate input sanitization and validation at the application layer.

**5. CIA Impact Analysis**
• Confidentiality: Payment data extraction, customer PII exposure (HIGH impact)
• Integrity: Transaction manipulation, data modification, authentication bypass (HIGH impact)
• Availability: Not primary impact vector (database locks possible but not main concern)

Dual CIA impact (Confidentiality + Integrity) significantly increases severity. Both pillars are critical for financial systems where data accuracy and privacy are regulatory requirements.

**Severity Determination:**
High severity (4) is justified by easy exploitability through well-known SQL injection techniques, dual CIA impact on critical data pillars, and the critical nature of the payment processing server (criticality 5/5). Strong domain-asset alignment and documented exploitation methods in the description confirm significant vulnerability. Not scored as Very High (5) because the vulnerability lacks the third CIA pillar (Availability is not critically impacted) and requires some application-level interaction rather than being a passive network-level exploit.
```

#### Combined Summary (UI Display)

```markdown
## Threat Severity: 4 - High | Confidence: High

SQL injection attacks pose a high-severity threat to this payment processing server due to organized cybercriminal actors who are financially motivated and possess established attack tools. The web application vector is highly accessible, requiring no physical proximity, and the strong alignment between the Application & API threat domain and this server's function creates significant exposure. This server's critical role in financial operations (criticality 5/5) amplifies the threat as successful attacks would cause severe business impact including data breaches, financial loss, and regulatory penalties.

---

## Vulnerability Severity: 4 - High | Confidence: High

The application security defect representing SQL injection vulnerabilities scores high severity due to easy exploitability using freely available automated tools and widespread documentation of exploitation techniques. This vulnerability impacts both confidentiality (payment data extraction) and integrity (transaction manipulation), affecting critical security pillars for financial systems. Given the payment processing server's criticality (5/5) and its direct database connectivity, this weakness provides attackers with immediate access to sensitive financial records and transaction data.

---

## Calculated Risk Metrics

**Likelihood:** 16 - High (Threat Severity 4 × Vulnerability Severity 4)  
**Cyber Risk Score:** 80 - High (Impact 5 × Likelihood 16)

This scenario represents a high-probability, high-impact risk requiring immediate attention and mitigation planning. The combination of motivated threat actors, easily exploitable vulnerabilities, and critical asset value creates substantial organizational exposure.

---

## Scoring Context

**Asset:** Payment Processing Server (Server, Criticality: 5/5)  
**Org Unit:** Finance Operations  
**Scoring Mode:** Inherent Risk (without controls)
```

---

### Example 2: MEDIUM CONFIDENCE

#### Combined Summary (UI Display)

```markdown
## Threat Severity: 3 - Medium | Confidence: Medium

Ransomware attacks represent a moderate threat to this file server, with threat actors ranging from organized groups to opportunistic attackers. The email phishing vector is accessible but requires social engineering success rather than technical exploitation. While the threat domain (Endpoint & Device) has moderate alignment with file servers, the asset's medium criticality (3/5) and standard business function reduce overall severity compared to critical infrastructure.

⚠️ *Confidence Note: Limited attack vector details and multiple threat actor types (ranging from sophisticated to opportunistic) create scoring ambiguity. Recommend validating threat actor profiles specific to your organization's threat landscape.*

---

## Vulnerability Severity: 3 - Medium | Confidence: Medium

The patch management gap shows moderate exploitability depending on specific unpatched systems and known CVEs. Single CIA impact (Availability through ransomware encryption) limits maximum severity. The Technology domain aligns with the Server asset type, but the generic "Patch Management" classification without specific CVE details prevents precise severity assessment.

⚠️ *Confidence Note: Vulnerability type is generic without specific patch details or CVE identifiers. Actual severity may vary based on specific unpatched systems and available exploits.*

---

## Calculated Risk Metrics

**Likelihood:** 9 - Low (Threat Severity 3 × Vulnerability Severity 3)  
**Cyber Risk Score:** 27 - Low (Impact 3 × Likelihood 9)

This scenario presents moderate risk requiring scheduled remediation within standard patch management cycles. The combination of medium-confidence scores suggests additional investigation would improve accuracy.

---

## Scoring Context

**Asset:** Corporate File Server (Server, Criticality: 3/5)  
**Org Unit:** IT Operations  
**Scoring Mode:** Inherent Risk (without controls)

---

## Review Notes

• **Threat Actor Clarification**: Validate which threat actor profile is most relevant to this asset and organization
• **Patch Inventory**: Identify specific missing patches and associated CVEs to refine vulnerability severity
• **Attack Vector Detail**: Confirm email phishing is the primary vector or if other vectors apply (RDP, VPN, etc.)
• **Historical Context**: Check if this asset type has been targeted previously in your environment
```

---

### Example 3: LOW CONFIDENCE (Flagged for Review)

#### Combined Summary (UI Display)

```markdown
## Threat Severity: 2 - Low | Confidence: Low

Limited threat data prevents confident severity assessment. The threat is classified under Operational Technology (OT/ICS) domain targeting a mainframe server, which represents an unusual domain-asset pairing. With no threat actors specified, no attack vectors documented, and an empty threat description, this score defaults to Low (2) as a conservative baseline, adjusted upward slightly from Very Low due to the asset's high criticality (4/5).

⚠️ *Confidence Note: **Critical data missing** - No threat description, actors, or attack vectors provided. Threat status is Draft indicating incomplete catalog entry. OT/ICS domain classification for a mainframe appears misaligned.*

---

## Vulnerability Severity: 2 - Low | Confidence: Low

Generic Technology domain classification with no specific vulnerability type prevents accurate exploitability assessment. Single CIA impact (Confidentiality only) and absence of exploitation details force conservative Low (2) scoring. The lack of vulnerability description and empty vulnerability type field indicate incomplete catalog data rather than actual low severity.

⚠️ *Confidence Note: **Critical data missing** - No vulnerability type or description provided. Generic domain classification and Draft status indicate incomplete data entry.*

---

## Calculated Risk Metrics

**Likelihood:** 4 - Very Low (Threat Severity 2 × Vulnerability Severity 2)  
**Cyber Risk Score:** 16 - Very Low (Impact 4 × Likelihood 4)

**⚠️ WARNING: These scores are based on incomplete data and should NOT be used for risk decisions without completing the threat and vulnerability catalog entries.**

---

## Scoring Context

**Asset:** Legacy Mainframe (Server, Criticality: 4/5)  
**Org Unit:** IT Operations  
**Scoring Mode:** Inherent Risk (without controls)

---

## Review Notes - **REQUIRED BEFORE ASSESSMENT**

### Critical Data Gaps:
• **Threat Description**: Add detailed threat scenario narrative
• **Threat Actors**: Specify applicable threat actor types
• **Attack Vectors**: Document attack vector(s) relevant to mainframe systems
• **Vulnerability Type**: Specify vulnerability classification beyond generic "Technology"
• **Vulnerability Description**: Add exploitability and impact details

### Data Quality Issues:
• **Domain Mismatch**: Verify OT/ICS classification for mainframe (typically classified under Network & Infrastructure or Data & Information)
• **Draft Status**: Complete catalog entries and change status to Active before including in assessment
• **CIA Impact**: Validate if only Confidentiality is impacted or if Integrity/Availability should be included

### Recommended Actions:
1. Consult with threat intelligence team to complete threat profile
2. Perform vulnerability scan/assessment to identify specific weaknesses
3. Reclassify threat domain to match mainframe asset type
4. Update catalog entries from Draft to Active with complete data
5. Re-run scoring agent after data completion

**DO NOT PROCEED WITH ASSESSMENT** using these scores until catalog data is complete.
```

---

## Confidence Level Integration Guidelines

### High Confidence
- **Where to mention**: Once in header line
- **No additional callouts needed** - confidence is implicit in detailed analysis
- **Example**: `## Threat Severity: 4 - High | Confidence: High`

### Medium Confidence
- **Where to mention**: 
  1. Header line: `| Confidence: Medium`
  2. Warning callout after main paragraph: `⚠️ *Confidence Note: [reason]*`
- **Callout should explain**: Specific ambiguity or data limitation
- **Tone**: Informative, not alarming

### Low Confidence
- **Where to mention**:
  1. Header line: `| Confidence: Low`
  2. Prominent warning after main paragraph: `⚠️ *Confidence Note: **Critical data missing** - [specific gaps]*`
  3. Full "Review Notes" section at bottom
- **Callout should**: Use bold text for emphasis, list specific missing data
- **Review Notes section**: Detailed checklist of what needs validation

---

## Rationale Length Targets

| Format | Target Words | Max Words | Purpose |
|--------|--------------|-----------|---------|
| Threat Rationale (Full) | 250-350 | 400 | Audit trail |
| Vulnerability Rationale (Full) | 250-350 | 400 | Audit trail |
| Combined Summary | 200-300 | 350 | UI display |
| Low Confidence Summary | 300-400 | 500 | Includes review section |

---

## Output Structure in Code

```typescript
interface ScoringOutput {
  scenarioId: string;
  
  // Threat scoring
  threatSeverity: 1 | 2 | 3 | 4 | 5;
  threatSeverityLabel: string;
  threatConfidence: "high" | "medium" | "low";
  threatConfidenceReason?: string;  // Required if medium/low
  threatRationale: string;          // Full detailed format (250-350 words)
  
  // Vulnerability scoring
  vulnerabilitySeverity: 1 | 2 | 3 | 4 | 5;
  vulnerabilitySeverityLabel: string;
  vulnerabilityConfidence: "high" | "medium" | "low";
  vulnerabilityConfidenceReason?: string;  // Required if medium/low
  vulnerabilityRationale: string;   // Full detailed format (250-350 words)
  
  // Combined UI rationale
  combinedRationaleSummary: string;  // Concise format (200-300 words)
  
  // Calculated values
  calculatedLikelihood: number;
  calculatedLikelihoodLabel: string;
  calculatedCyberRiskScore: number;
  calculatedCyberRiskScoreLabel: string;
  
  // Review flagging
  needsReview: boolean;              // True if ANY confidence is low
  reviewReason?: string;             // Summary of why review needed
}
```

---

## Markdown Formatting Rules

### Headers
```markdown
## [Level] | Confidence: [Level]    ✅ Use for main sections
**Confidence: [Level]**              ✅ Use within detailed analysis
```

### Emphasis
```markdown
⚠️ *Confidence Note: [text]*        ✅ For medium confidence
⚠️ *Confidence Note: **Critical     ✅ For low confidence (bold inside italic)
```

### Lists
```markdown
• [Item]                             ✅ Use bullet points (•) not asterisks
**1. [Category Name]**               ✅ Bold numbered sections in full format
```

### Sections
```markdown
---                                  ✅ Use horizontal rules between sections in summary
**[Section]:**                       ✅ Bold section labels in full format
```

---

## Validation Checklist

Before finalizing rationale output, verify:

- [ ] Confidence level appears in header
- [ ] If Medium/Low confidence: Warning callout included
- [ ] If Low confidence: Full "Review Notes" section included
- [ ] Word count within target ranges
- [ ] All scores referenced match calculated values
- [ ] Asset name, type, and criticality mentioned
- [ ] Markdown formatting correct (no extra asterisks, proper bullets)
- [ ] No placeholder text like "[TODO]" or "[FILL IN]"
- [ ] Scoring mode stated: "Inherent Risk (without controls)"
- [ ] Rationale explains WHY this score (not higher, not lower)

---

## Common Mistakes to Avoid

❌ **Don't**: Put confidence only at the end  
✅ **Do**: Include in header and callout if Medium/Low

❌ **Don't**: Use vague confidence reasons like "some uncertainty"  
✅ **Do**: Be specific: "Missing attack vector details"

❌ **Don't**: Write separate paragraphs for confidence  
✅ **Do**: Integrate into main analysis with callout boxes

❌ **Don't**: Omit confidence from summary rationale  
✅ **Do**: Always show confidence level in UI-facing text

❌ **Don't**: Use different confidence levels between full and summary  
✅ **Do**: Keep confidence consistent across all rationale outputs

---

## Example API Response

```json
{
  "scenarioId": "SCN-001",
  "threatSeverity": 4,
  "threatSeverityLabel": "High",
  "threatConfidence": "high",
  "threatRationale": "**Threat Severity: 4 - High**\n\n**Confidence: High**\n\n**Scoring Basis:** Inherent Risk...",
  
  "vulnerabilitySeverity": 4,
  "vulnerabilitySeverityLabel": "High", 
  "vulnerabilityConfidence": "high",
  "vulnerabilityRationale": "**Vulnerability Severity: 4 - High**\n\n**Confidence: High**\n\n**Scoring Basis:**...",
  
  "combinedRationaleSummary": "## Threat Severity: 4 - High | Confidence: High\n\nSQL injection attacks pose...",
  
  "calculatedLikelihood": 16,
  "calculatedLikelihoodLabel": "High",
  "calculatedCyberRiskScore": 80,
  "calculatedCyberRiskScoreLabel": "High",
  
  "needsReview": false
}
```

---

**End of Rationale Format Guide**
