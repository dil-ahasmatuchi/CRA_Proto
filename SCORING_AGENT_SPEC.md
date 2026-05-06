# Cyber Risk Assessment - Scoring Agent Specification

## Version: 1.1 (Inherent Risk Mode)

**Last Updated**: 2026-05-06  
**Changelog**: Added batch processing, dual rationale outputs, N/A handling, confidence integration

---

## 1. Overview

### Purpose
The Scoring Agent provides automated, context-aware severity scoring for cyber risk scenarios within assessments. Each scenario represents a **Threat + Vulnerability + Asset** combination that requires independent evaluation.

### Scope
- **Current Mode**: Inherent Risk Scoring (ignores existing controls)
- **Future**: Configurable for Residual Risk Scoring (considers control effectiveness)
- **Data Source**: Local database only (no external threat intelligence)

---

## 2. Core Concepts

### 2.1 Data Model Relationships

```
Cyber Risk: "SQL Injection threat"
  ├── Scenario 1: "SQL Injection Attack on Payment Processing Server"
  │   ├── Asset: Payment Processing Server (criticality: 5)
  │   ├── Threat: SQL Injection Attack
  │   └── Vulnerability: Application Security Defect
  │
  └── Scenario 2: "SQL Injection Attack on Customer Database"
      ├── Asset: Customer Database (criticality: 5)
      ├── Threat: SQL Injection Attack
      └── Vulnerability: Application Security Defect
```

**Key Insight**: The same Threat + Vulnerability pair can have **different severity scores** across scenarios based on **asset-specific context**.

### 2.2 Scoring Formula

```
Impact = Asset Criticality (1-5)
Likelihood = Threat Severity × Vulnerability Severity (1-25)
Cyber Risk Score = Impact × Likelihood (1-125)
```

**Agent Responsibility**: Score Threat Severity and Vulnerability Severity independently for each scenario.

---

## 3. Input Data Structure

### 3.1 Complete Scenario Input

```typescript
interface ScoringInput {
  // Scenario identity
  scenarioId: string;
  scenarioName: string;
  cyberRiskId: string;
  cyberRiskName: string;
  
  // Scenario flags
  isNotApplicable?: boolean;  // If true, skip scoring (return skipped=true)
  
  // Asset context
  asset: {
    id: string;
    name: string;
    assetType: "Application" | "Database" | "Server" | "Network device" 
              | "Cloud service" | "Endpoint" | "IoT device";
    criticality: 1 | 2 | 3 | 4 | 5;
    criticalityLabel: "Very low" | "Low" | "Medium" | "High" | "Very high";
    orgUnitId: string;
    status: "Active" | "Inactive" | "Decommissioned";
    // Note: controlIds provided for reference but NOT used in inherent scoring
    controlIds: string[];
  };
  
  // Threat context
  threat: {
    id: string;
    displayId: string; // e.g., "THR-001"
    name: string;
    domain: "Identity & Access Management" | "Endpoint & Device" 
          | "Network & Infrastructure" | "Application & API" 
          | "Data & Information" | "Cloud & Virtualisation" 
          | "Physical & Facilities" | "Supply Chain & Third Party" 
          | "Operational Technology (OT/ICS)" | "People & Workforce";
    description: string; // Scenario narrative
    sources: Array<"Deliberate" | "Accidental" | "Environmental">;
    threatActors: Array<
      "Nation-State / State-Sponsored Actor" |
      "Organised Cybercriminal Group" |
      "Hacktivist" |
      "Malicious Insider (employee, contractor)" |
      "Negligent / Untrained Employee" |
      "Opportunistic / Script Kiddie" |
      "Terrorist / Extremist Group" |
      "Competitor (corporate espionage)" |
      "Natural / Environmental Event" |
      "System / Process Failure (non-human)"
    >;
    attackVectors: Array<
      "Email & Messaging (phishing, BEC, malicious attachments)" |
      "Web Application & Browser" |
      "Network & Remote Access (VPN, RDP, open ports)" |
      "Physical Access & Removable Media" |
      "Insider / Privileged Access Abuse" |
      "Supply Chain & Third-Party Software" |
      "Cloud Services & APIs" |
      "Social Media & Public Channels" |
      "Wireless & Mobile (Wi-Fi, Bluetooth, SMS)" |
      "Operational Technology / Industrial Interfaces"
    >;
    status: "Draft" | "Active" | "Archived";
  };
  
  // Vulnerability context
  vulnerability: {
    id: string;
    displayId: string; // e.g., "VUL-001"
    name: string;
    description?: string;
    domain: "Technology" | "People" | "Process" | "Physical";
    vulnerabilityType?: string; // e.g., "Application Security Defect"
    primaryCIAImpact: Array<"Confidentiality" | "Integrity" | "Availability">;
    status: "Draft" | "Active" | "Archived";
  };
  
  // Related controls (for context/reference only - not scored in inherent mode)
  controls: Array<{
    id: string;
    name: string;
    controlType: "Preventive" | "Detective";
    effectiveness: 1 | 2 | 3 | 4 | 5;
    effectivenessLabel: string;
    keyControl: boolean;
    controlFrequency: "Daily" | "Weekly" | "Bi-weekly" | "Monthly" 
                    | "Quarterly" | "Annually";
    status: "Draft" | "Active" | "Archived";
  }>;
  
  // Organizational context
  orgUnit: {
    id: string;
    name: string;
  };
}
```

---

## 4. Output Data Structure

### 4.1 Scoring Output

```typescript
interface ScoringOutput {
  scenarioId: string;
  timestamp: string; // ISO 8601
  scoringMode: "inherent"; // Future: "inherent" | "residual"
  
  // Skip flag for N/A scenarios
  skipped?: boolean;  // True if isNotApplicable was true in input
  skipReason?: string;  // "Scenario marked as Not Applicable to this assessment"
  
  // Threat severity scoring
  threatSeverity: 1 | 2 | 3 | 4 | 5 | null;  // null if skipped
  threatSeverityLabel: "Very low" | "Low" | "Medium" | "High" | "Very high" | null;
  threatRationale: string;  // Full detailed format (250-350 words)
  threatConfidence: "high" | "medium" | "low";
  threatConfidenceReason?: string; // Required if medium/low
  
  // Vulnerability severity scoring
  vulnerabilitySeverity: 1 | 2 | 3 | 4 | 5 | null;  // null if skipped
  vulnerabilitySeverityLabel: "Very low" | "Low" | "Medium" | "High" | "Very high" | null;
  vulnerabilityRationale: string;  // Full detailed format (250-350 words)
  vulnerabilityConfidence: "high" | "medium" | "low";
  vulnerabilityConfidenceReason?: string; // Required if medium/low
  
  // Combined UI rationale
  combinedRationaleSummary: string;  // Concise format for WYSIWYG editor (200-300 words)
  
  // Calculated values
  calculatedLikelihood: number | null; // threatSeverity × vulnerabilitySeverity (1-25)
  calculatedLikelihoodLabel: string | null; // Based on DEFAULT_LIKELIHOOD_BANDS
  calculatedCyberRiskScore: number | null; // asset.criticality × calculatedLikelihood (1-125)
  calculatedCyberRiskScoreLabel: string | null; // Based on DEFAULT_CYBER_RISK_SCORE_BANDS
  
  // Flags
  needsReview: boolean; // True if ANY confidence is "low"
  reviewReason?: string; // Summary of why review is needed
}
```

### 4.2 Confidence Scoring Guidelines

**High Confidence**: All required data present, clear threat-vulnerability-asset relationship, unambiguous severity indicators

**Medium Confidence**: Some data gaps but sufficient context for reasonable scoring, or moderate complexity requiring assumptions

**Low Confidence** (triggers `needsReview: true`):
- Missing critical threat/vulnerability descriptions
- Ambiguous asset type or unclear exposure
- Unusual threat-vulnerability-asset combination
- Conflicting severity indicators
- Novel or rare threat/vulnerability types without clear precedent

---

## 5. Scoring Methodology (Inherent Risk Mode)

### 5.1 Key Principle
**Inherent Risk = Risk WITHOUT considering any controls**

The agent must score as if NO controls exist, regardless of control data provided in the input.

### 5.2 Threat Severity Scoring (1-5)

#### Factors to Consider:

**1. Threat Actor Capability & Motivation**
- **Nation-State / State-Sponsored Actor**: Sophisticated, well-resourced (bias toward 4-5)
- **Organised Cybercriminal Group**: Professional, motivated by profit (bias toward 3-5)
- **Hacktivist**: Variable skill, motivated by ideology (bias toward 2-4)
- **Malicious Insider**: High access, variable skill (bias toward 3-5)
- **Negligent Employee**: Unintentional, common (bias toward 2-4)
- **Opportunistic / Script Kiddie**: Low skill, opportunistic (bias toward 1-3)
- **Natural / Environmental Event**: Based on frequency/predictability (bias toward 1-4)
- **System Failure**: Based on system maturity/complexity (bias toward 2-4)

**2. Attack Vector Accessibility**
- **Email & Messaging**: Highly accessible (increases severity)
- **Web Application & Browser**: Broadly accessible (increases severity)
- **Physical Access**: Requires proximity (moderates severity)
- **Supply Chain**: Indirect but high impact (context-dependent)
- **OT/ICS Interfaces**: Specialized but critical (asset-dependent)

**3. Threat Domain vs. Asset Type Alignment**
Match threat domain to asset type for severity adjustment:

| Threat Domain | High Severity Asset Types |
|---------------|---------------------------|
| Identity & Access Management | All types (universal concern) |
| Endpoint & Device | Endpoint, IoT device |
| Network & Infrastructure | Network device, Server |
| Application & API | Application, Cloud service |
| Data & Information | Database, Cloud service |
| Cloud & Virtualisation | Cloud service, Server |
| Physical & Facilities | All types (physical security) |
| Supply Chain & Third Party | Application, Cloud service |
| OT/ICS | Server, Network device, IoT device |
| People & Workforce | All types (human element) |

**4. Asset Criticality Context**
Higher criticality assets amplify threat severity:
- Criticality 5: +1 severity adjustment consideration
- Criticality 4: +0.5 severity adjustment consideration
- Criticality 1-3: No adjustment or -0.5 for low-value targets

**5. Threat Source Type**
- **Deliberate**: Intentional, repeatable (higher severity)
- **Accidental**: Unintentional, preventable (moderate severity)
- **Environmental**: External, less controllable (variable severity)

#### Severity Scale Definitions:

**1 - Very Low**
- Opportunistic, low-skill actors OR rare environmental events
- Attack vector difficult to access for this asset type
- Minimal threat domain/asset type alignment
- Low asset criticality (1-2)
- Accidental or rare deliberate sources

**2 - Low**
- Script kiddies or negligent employees
- Attack vector requires some access/effort
- Weak threat domain/asset type alignment
- Low to medium asset criticality (1-3)
- Primarily accidental sources with some deliberate potential

**3 - Medium**
- Hacktivists or opportunistic criminals
- Attack vector moderately accessible
- Moderate threat domain/asset type alignment
- Medium to high asset criticality (3-4)
- Mixed deliberate and accidental sources

**4 - High**
- Organised cybercriminal groups or malicious insiders
- Attack vector highly accessible
- Strong threat domain/asset type alignment
- High asset criticality (4-5)
- Primarily deliberate sources
- Established attack patterns in threat description

**5 - Very High**
- Nation-state actors or sophisticated organised groups
- Attack vector trivially accessible or unavoidable
- Perfect threat domain/asset type alignment
- Critical asset (5)
- Deliberate sources with high motivation
- Active/prevalent threats in threat description

---

### 5.3 Vulnerability Severity Scoring (1-5)

#### Factors to Consider:

**1. Exploitability**
Assess how easily the vulnerability can be exploited:
- **Trivial**: Known exploits, automated tools available (5)
- **Easy**: Basic technical knowledge required (4)
- **Moderate**: Intermediate skills, some reconnaissance needed (3)
- **Difficult**: Advanced skills, specific conditions required (2)
- **Very Difficult**: Expert-level, rare conditions (1)

**2. CIA Impact Scope**
Multiple impacts increase severity:
- **All 3 (C+I+A)**: Maximum impact, +1 severity
- **2 impacts**: High impact, +0.5 severity
- **1 impact**: Standard impact, no adjustment

**3. Vulnerability Domain vs. Asset Type**

| Vulnerability Domain | High Severity Asset Types |
|---------------------|---------------------------|
| Technology | All (universal) |
| People | All (human factor) |
| Process | Application, Cloud service |
| Physical | Server, Network device, Endpoint |

**4. Vulnerability Type Specificity**
Match vulnerability type to threat vector and asset:
- **Patch Management + Deliberate Threat**: High severity
- **Authentication Weakness + High-value Asset**: High severity
- **Security Awareness Gap + Phishing Threat**: High severity
- **Physical Security Gap + Remote Asset**: Low severity

**5. Asset Type Vulnerability Exposure**

| Asset Type | High-Risk Vulnerability Types |
|------------|-------------------------------|
| Application | Application Security Defect, Authentication/Access, API weaknesses |
| Database | Data Protection Weakness, Access Control, Cryptographic Weakness |
| Server | Patch Management, Security Configuration, Network Security |
| Network device | Network Security Weakness, Security Configuration |
| Cloud service | Cloud Security Misconfiguration, Identity Management |
| Endpoint | Patch Management, Endpoint Security, Physical Security |
| IoT device | Unsupported Technology, Physical Security, Network Security |

**6. Asset Criticality Amplification**
- Criticality 5: +1 severity adjustment consideration
- Criticality 4: +0.5 severity adjustment consideration
- Criticality 1-3: No adjustment

#### Severity Scale Definitions:

**1 - Very Low**
- Very difficult to exploit
- Single, low-impact CIA pillar (Availability only, minor disruption)
- Weak vulnerability domain/asset type alignment
- Low asset criticality (1-2)
- Rare or theoretical exploitation scenarios

**2 - Low**
- Difficult to exploit, requires specific conditions
- Single CIA impact with limited scope
- Weak to moderate vulnerability domain/asset type alignment
- Low to medium asset criticality (1-3)
- Uncommon exploitation scenarios

**3 - Medium**
- Moderately exploitable with intermediate skills
- Single high-impact OR dual CIA impact
- Moderate vulnerability domain/asset type alignment
- Medium to high asset criticality (3-4)
- Credible exploitation scenarios

**4 - High**
- Easily exploitable with basic skills
- Dual CIA impact OR single critical impact
- Strong vulnerability domain/asset type alignment
- High asset criticality (4-5)
- Well-established exploitation patterns

**5 - Very High**
- Trivially exploitable, known exploits exist
- Triple CIA impact OR critical single impact
- Perfect vulnerability domain/asset type alignment
- Critical asset (5)
- Active exploitation in the wild (if mentioned in description)

---

### 5.4 Rationale Format

Each rationale must be **detailed, structured, and data-driven**.

#### Template Structure:

```markdown
**[Threat/Vulnerability] Severity: [Score] - [Label]**

**Scoring Basis: Inherent Risk (without controls)**

**Key Factors Analyzed:**

1. **[Primary Factor Category]**
   - [Specific data point from input]
   - [Impact on severity]: [Explanation]

2. **Asset Context**
   - Asset: [Name] ([Type], Criticality: [X]/5)
   - Org Unit: [Name]
   - [Why this asset context matters]

3. **[Threat/Vulnerability] Characteristics**
   - [Attribute 1]: [Value] → [Impact on severity]
   - [Attribute 2]: [Value] → [Impact on severity]
   - [Attribute 3]: [Value] → [Impact on severity]

4. **Domain-Asset Type Alignment**
   - [Threat/Vulnerability] Domain: [Domain]
   - Asset Type: [Type]
   - Alignment Assessment: [Strong/Moderate/Weak]
   - [Explanation of alignment impact]

5. **CIA Impact / Attack Vector Analysis** (as applicable)
   - [Relevant analysis based on threat or vulnerability]

**Severity Determination:**
[2-4 sentences synthesizing the above factors into the final score. Must clearly explain why this score (not higher or lower) was chosen based on the inherent risk without controls.]

**Confidence Level: [High/Medium/Low]**
[If Medium/Low: Brief explanation of uncertainty or data gaps]
```

---

## 5A. Rationale Output Formats

### 5A.1 Overview

Each scenario requires **THREE rationale outputs**:

1. **Threat Rationale** (full) - Detailed analysis for audit trail (250-350 words)
2. **Vulnerability Rationale** (full) - Detailed analysis for audit trail (250-350 words)
3. **Combined Summary** - Concise user-facing rationale for UI display (200-300 words)

All three MUST include confidence levels integrated into the text.

### 5A.2 Full Detailed Rationale Format (Threat & Vulnerability)

**Purpose**: Audit trail, compliance, history panel  
**Target Length**: 250-350 words per metric  
**Storage**: Database, shown in collapsible history panel

**Template**:
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

**5. [Additional Analysis]**
[CIA Impact for vulnerability OR Attack Vector for threat]

**Severity Determination:**
[2-3 sentences synthesizing factors into final score. Must explain why this score (not higher or lower) based on inherent risk.]

[If Medium/Low confidence: **Review Recommended:** [Specific items to verify]]
```

### 5A.3 Combined Summary Format (UI Display)

**Purpose**: WYSIWYG editor on Scenario Rationale Page  
**Target Length**: 200-300 words total (350-500 for low confidence with review notes)  
**Storage**: Database, editable by users

**Template**:
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
⚠️ *Confidence Note: [Brief reason, e.g., "Generic vulnerability type"]*

---

## Calculated Risk Metrics

**Likelihood:** [T×V Score] - [Label]  
**Cyber Risk Score:** [I×L Score] - [Label]

[1-2 sentences on overall risk and business implications]

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

### 5A.4 Confidence Level Integration

#### High Confidence
- **Header**: `## Threat Severity: 4 - High | Confidence: High`
- **No warnings needed** - confidence implicit in analysis
- **No review section** - ready for use

#### Medium Confidence
- **Header**: `| Confidence: Medium`
- **Warning callout** after main paragraph:  
  `⚠️ *Confidence Note: [specific reason]*`
- **Tone**: Informative (not alarming)
- **Review section**: Optional, only if specific validations needed

#### Low Confidence
- **Header**: `| Confidence: Low`
- **Prominent warning** after main paragraph:  
  `⚠️ *Confidence Note: **Critical data missing** - [specific gaps]*`
- **Mandatory review section** at bottom with:
  - Critical Data Gaps subsection
  - Data Quality Issues subsection
  - Recommended Actions subsection
- **Tone**: Clear warning, actionable items

### 5A.5 Word Count Targets

| Output Type | Target Words | Max Words | Purpose |
|-------------|--------------|-----------|---------|
| `threatRationale` | 250-350 | 400 | Audit trail |
| `vulnerabilityRationale` | 250-350 | 400 | Audit trail |
| `combinedRationaleSummary` | 200-300 | 350 | UI display (high/medium) |
| `combinedRationaleSummary` (low confidence) | 300-500 | 600 | UI display with review notes |

### 5A.6 Markdown Formatting Rules

**Headers**:
- `## [Metric] Severity: [Score] - [Label] | Confidence: [Level]` for main sections
- `**Confidence: [Level]**` within detailed analysis

**Emphasis**:
- `⚠️ *Confidence Note: [text]*` for medium confidence
- `⚠️ *Confidence Note: **Critical data missing** - [text]*` for low (bold inside italic)

**Lists**:
- `• [Item]` for bullets (use bullet character •, not asterisks)
- `**1. [Category]**` for numbered sections in full format

**Sections**:
- `---` for horizontal rules between summary sections
- `**[Label]:**` for bold section labels

### 5A.7 Example Output Structure

```typescript
{
  "scenarioId": "SCN-001",
  
  // Full detailed rationales (250-350 words each)
  "threatRationale": "**Threat Severity: 4 - High**\n\n**Confidence: High**\n\n**Scoring Basis:** Inherent Risk (without controls)\n\n**Analysis:**\n\n**1. Threat Actor Capability**\n...",
  "vulnerabilityRationale": "**Vulnerability Severity: 4 - High**\n\n**Confidence: High**\n\n**Scoring Basis:** Inherent Risk (without controls)\n\n**Analysis:**\n\n**1. Exploitability Assessment**\n...",
  
  // Concise summary for UI (200-300 words total)
  "combinedRationaleSummary": "## Threat Severity: 4 - High | Confidence: High\n\nSQL injection attacks pose a high-severity threat...\n\n---\n\n## Vulnerability Severity: 4 - High | Confidence: High\n\nThe application security defect...\n\n---\n\n## Calculated Risk Metrics\n\n**Likelihood:** 16 - High\n**Cyber Risk Score:** 80 - High\n\nThis scenario represents...",
  
  // Metadata
  "threatConfidence": "high",
  "vulnerabilityConfidence": "high",
  "needsReview": false
}
```

### 5A.8 Validation Checklist

Before returning rationale output, verify:

- [ ] Confidence level in header line for summary format
- [ ] Confidence level in body for full format
- [ ] Warning callout included for medium/low confidence
- [ ] Review Notes section for low confidence
- [ ] Word counts within target ranges
- [ ] All scores match calculated values
- [ ] Asset name, type, criticality mentioned
- [ ] Markdown formatting correct
- [ ] No placeholder text
- [ ] "Inherent Risk (without controls)" stated
- [ ] Rationale explains WHY this score

**See `RATIONALE_FORMAT_GUIDE.md` for detailed examples of all confidence levels.**

---

## 6. Edge Cases & Special Scenarios

### 6.0 Not Applicable Scenarios

**Input**: `isNotApplicable: true`

**Agent Behavior**:
- Skip all scoring logic immediately
- Return early with `skipped: true`
- Set all score fields to `null`
- Provide skip reason

**Output Example**:
```typescript
{
  scenarioId: "SCN-XXX",
  skipped: true,
  skipReason: "Scenario marked as Not Applicable to this assessment",
  threatSeverity: null,
  vulnerabilitySeverity: null,
  threatRationale: "",
  vulnerabilityRationale: "",
  combinedRationaleSummary: "This scenario has been marked as Not Applicable to this assessment and was not scored.",
  calculatedLikelihood: null,
  calculatedLikelihoodLabel: null,
  calculatedCyberRiskScore: null,
  calculatedCyberRiskScoreLabel: null,
  needsReview: false
}
```

### 6.1 Archived or Draft Status
- Threat/Vulnerability status = "Archived": Still score based on characteristics, note in rationale
- Status = "Draft": May have incomplete data, flag for review if critical fields missing

### 6.2 Multiple Threat Actors or Attack Vectors
- Use the **highest severity** actor/vector for scoring
- Mention all relevant actors/vectors in rationale

### 6.3 Environmental or Accidental Threats
- Score based on frequency and predictability
- "Natural / Environmental Event": Consider geographic/environmental factors from org unit context
- "System / Process Failure": Consider asset type complexity

### 6.4 Inactive or Decommissioned Assets
- Asset status = "Inactive": Reduce severity by 1 level (still score for historical context)
- Asset status = "Decommissioned": Score as 1/Very Low, flag for review (should this scenario exist?)

### 6.5 Missing Descriptions
- If threat.description or vulnerability.description is missing/empty:
  - Rely on domain, type, actors, vectors for scoring
  - Set confidence to "low"
  - Flag: "Limited description data available for comprehensive assessment"

### 6.6 Conflicting Signals
Example: High-sophistication threat actor but low-complexity attack vector
- Weight toward the **higher severity** indicator
- Explain the conflict in rationale
- Set confidence to "medium"

---

## 7. Confidence Scoring Rules

### 7.1 High Confidence Criteria
ALL of the following must be true:
- Threat description present and detailed (>50 characters)
- Vulnerability description present OR clear vulnerabilityType
- Asset type clearly aligns with threat domain
- At least 1 threat actor and 1 attack vector specified
- Clear CIA impact specified
- Standard threat-vulnerability-asset combination

### 7.2 Medium Confidence Criteria
At least ONE of the following:
- Threat/vulnerability description minimal (10-50 characters)
- Threat domain/asset type alignment is ambiguous
- Multiple conflicting severity indicators
- Uncommon but plausible threat-vulnerability pairing
- Asset type is "IoT device" or "Cloud service" (broad categories)

### 7.3 Low Confidence Criteria (MUST FLAG)
At least ONE of the following:
- Missing threat description AND missing key threat attributes
- Missing vulnerability description AND missing vulnerabilityType
- Asset type/threat domain mismatch is severe (e.g., Physical threat on Cloud service)
- Threat actor = "System / Process Failure" with Deliberate source (contradiction)
- Novel threat-vulnerability pairing with no clear precedent
- Asset status = "Decommissioned" (should scenario exist?)

### 7.4 Confidence Reason Guidelines
When confidence is Medium or Low, provide specific reason:
- **Low Example**: "Limited threat description and unusual pairing of Environmental threat source with Organised Cybercriminal actor. Recommend review of threat catalog data quality."
- **Medium Example**: "Threat domain (People & Workforce) with highly technical vulnerability type (Application Security Defect) creates ambiguity. Scoring based on asset context but recommend validation."

---

## 8. Validation Rules

### 8.1 Input Validation
Agent must verify:
- `asset.criticality` is 1-5
- `threatSeverity` output is 1-5
- `vulnerabilitySeverity` output is 1-5
- `scenarioId` matches input
- All required fields present in output

### 8.2 Logical Consistency
- If asset.criticality = 5 AND strong threat-asset alignment → threatSeverity should be ≥ 3
- If CIA impact includes all 3 pillars AND high exploitability → vulnerabilitySeverity should be ≥ 4
- If confidence = "low" → `needsReview` MUST be `true`

### 8.3 Label Mapping
Use these exact mappings:
```typescript
const SEVERITY_LABELS = {
  1: "Very low",
  2: "Low",
  3: "Medium",
  4: "High",
  5: "Very high"
};

// Likelihood bands (threatSeverity × vulnerabilitySeverity)
const LIKELIHOOD_BANDS = [
  { from: 1, to: 5, label: "Very low" },
  { from: 6, to: 10, label: "Low" },
  { from: 11, to: 15, label: "Medium" },
  { from: 16, to: 20, label: "High" },
  { from: 21, to: 25, label: "Very high" }
];

// Cyber Risk Score bands (impact × likelihood)
const CYBER_RISK_SCORE_BANDS = [
  { from: 1, to: 25, label: "Very low" },
  { from: 26, to: 50, label: "Low" },
  { from: 51, to: 75, label: "Medium" },
  { from: 76, to: 100, label: "High" },
  { from: 101, to: 125, label: "Very high" }
];
```

---

## 9. Example Scenarios

### 9.1 Complete Example: High Severity Scenario

**Input:**
```json
{
  "scenarioId": "SCN-001",
  "scenarioName": "SQL Injection Attack on Payment Processing Server",
  "cyberRiskId": "RISK-042",
  "cyberRiskName": "SQL Injection threat",
  
  "asset": {
    "id": "AST-101",
    "name": "Payment Processing Server",
    "assetType": "Server",
    "criticality": 5,
    "criticalityLabel": "Very high",
    "orgUnitId": "ORG-001",
    "status": "Active",
    "controlIds": ["CTL-201", "CTL-202"]
  },
  
  "threat": {
    "id": "THR-023",
    "displayId": "THR-023",
    "name": "SQL Injection Attack",
    "domain": "Application & API",
    "description": "Malicious SQL statements injected into application entry fields to manipulate or extract database contents, bypass authentication, or execute administrative operations. Common in web applications with inadequate input validation.",
    "sources": ["Deliberate"],
    "threatActors": ["Organised Cybercriminal Group", "Hacktivist"],
    "attackVectors": ["Web Application & Browser"],
    "status": "Active"
  },
  
  "vulnerability": {
    "id": "VUL-045",
    "displayId": "VUL-045",
    "name": "Application Security Defect",
    "description": "Software vulnerabilities including injection flaws, broken authentication, insecure deserialization, and insufficient input validation that can be exploited to compromise application integrity and data.",
    "domain": "Technology",
    "vulnerabilityType": "Application Security Defect",
    "primaryCIAImpact": ["Confidentiality", "Integrity"],
    "status": "Active"
  },
  
  "controls": [
    {
      "id": "CTL-201",
      "name": "Web Application Firewall",
      "controlType": "Preventive",
      "effectiveness": 3,
      "effectivenessLabel": "Medium",
      "keyControl": true,
      "controlFrequency": "Daily",
      "status": "Active"
    }
  ],
  
  "orgUnit": {
    "id": "ORG-001",
    "name": "Finance Operations"
  }
}
```

**Expected Output:**
```json
{
  "scenarioId": "SCN-001",
  "timestamp": "2026-05-06T15:30:00Z",
  "scoringMode": "inherent",
  
  "threatSeverity": 4,
  "threatSeverityLabel": "High",
  "threatRationale": "**Threat Severity: 4 - High**\n\n**Scoring Basis: Inherent Risk (without controls)**\n\n**Key Factors Analyzed:**\n\n1. **Threat Actor Capability**\n   - Primary Actor: Organised Cybercriminal Group\n   - Impact on severity: High-capability, profit-motivated actors with established attack patterns and tooling\n   - Secondary Actor: Hacktivist (variable skill, ideologically motivated)\n\n2. **Asset Context**\n   - Asset: Payment Processing Server (Server, Criticality: 5/5)\n   - Org Unit: Finance Operations\n   - Critical financial infrastructure handling sensitive payment data with regulatory requirements (PCI-DSS)\n   - High-value target for financially motivated attackers\n\n3. **Threat Characteristics**\n   - Attack Vector: Web Application & Browser → Highly accessible vector, no physical proximity required\n   - Threat Source: Deliberate → Intentional, repeatable attack pattern\n   - Description indicates: \"Common in web applications\" suggesting established threat pattern\n\n4. **Domain-Asset Type Alignment**\n   - Threat Domain: Application & API\n   - Asset Type: Server (hosting web applications)\n   - Alignment Assessment: Strong - servers running web applications are primary targets for application-layer attacks\n\n5. **Attack Vector Analysis**\n   - Web Application & Browser: Broadly accessible to any internet-connected attacker\n   - No specialized access or proximity required\n   - Supports automated attack tools and manual exploitation\n\n**Severity Determination:**\nHigh severity (4) is warranted based on the combination of organized, financially-motivated threat actors, highly accessible attack vectors, and a critical asset (criticality 5/5) in the financial domain. The threat domain/asset type alignment is strong, and the deliberate attack source indicates intentional, repeatable exploitation attempts. Not scored as Very High (5) because this is not a nation-state level threat, though the organized cybercriminal capability is substantial.\n\n**Confidence Level: High**",
  "threatConfidence": "high",
  
  "vulnerabilitySeverity": 4,
  "vulnerabilitySeverityLabel": "High",
  "vulnerabilityRationale": "**Vulnerability Severity: 4 - High**\n\n**Scoring Basis: Inherent Risk (without controls)**\n\n**Key Factors Analyzed:**\n\n1. **Exploitability Assessment**\n   - SQL injection is easily exploitable with basic SQL knowledge\n   - Automated scanning tools (SQLMap, Havij) widely available\n   - Well-documented exploitation techniques (OWASP Top 10)\n   - Impact: High exploitability, minimal technical barrier\n\n2. **Asset Context**\n   - Asset: Payment Processing Server (Server, Criticality: 5/5)\n   - Org Unit: Finance Operations\n   - Critical server hosting payment applications with direct database connectivity\n   - Successful exploitation leads to immediate financial data breach\n\n3. **Vulnerability Characteristics**\n   - Type: Application Security Defect (code-level weakness)\n   - Domain: Technology\n   - Description: \"injection flaws, broken authentication, insecure deserialization, insufficient input validation\"\n   - These are fundamental security weaknesses that directly enable the threat\n\n4. **Domain-Asset Type Alignment**\n   - Vulnerability Domain: Technology\n   - Asset Type: Server (running web applications with database access)\n   - Alignment Assessment: Strong - application security defects are highly relevant to servers hosting web applications\n\n5. **CIA Impact**\n   - Confidentiality: Payment data extraction\n   - Integrity: Transaction data manipulation, authentication bypass\n   - Dual CIA impact (C+I) increases severity (+0.5 adjustment consideration)\n\n**Severity Determination:**\nHigh severity (4) is justified by the easy exploitability of application security defects via SQL injection, dual CIA impact (confidentiality + integrity), and the critical nature of the payment processing server (criticality 5/5). Strong domain-asset alignment and well-known exploitation techniques make this a significant vulnerability. Not scored as Very High (5) because it lacks the third CIA pillar (Availability) and requires some application interaction (not a passive network-level exploit).\n\n**Confidence Level: High**",
  "vulnerabilityConfidence": "high",
  
  "calculatedLikelihood": 16,
  "calculatedLikelihoodLabel": "High",
  "calculatedCyberRiskScore": 80,
  "calculatedCyberRiskScoreLabel": "High",
  
  "needsReview": false
}
```

---

### 9.2 Low Confidence Example (Flagged for Review)

**Input:**
```json
{
  "scenarioId": "SCN-099",
  "scenarioName": "Unknown Threat on Legacy System",
  "cyberRiskId": "RISK-099",
  "cyberRiskName": "Legacy system compromise",
  
  "asset": {
    "id": "AST-999",
    "name": "Legacy Mainframe",
    "assetType": "Server",
    "criticality": 4,
    "criticalityLabel": "High",
    "orgUnitId": "ORG-002",
    "status": "Active",
    "controlIds": []
  },
  
  "threat": {
    "id": "THR-999",
    "displayId": "THR-999",
    "name": "Emerging Threat",
    "domain": "Operational Technology (OT/ICS)",
    "description": "",
    "sources": ["Deliberate"],
    "threatActors": [],
    "attackVectors": [],
    "status": "Draft"
  },
  
  "vulnerability": {
    "id": "VUL-999",
    "displayId": "VUL-999",
    "name": "Unknown Vulnerability",
    "description": "",
    "domain": "Technology",
    "vulnerabilityType": "",
    "primaryCIAImpact": ["Confidentiality"],
    "status": "Draft"
  },
  
  "controls": [],
  
  "orgUnit": {
    "id": "ORG-002",
    "name": "IT Operations"
  }
}
```

**Expected Output:**
```json
{
  "scenarioId": "SCN-099",
  "timestamp": "2026-05-06T15:35:00Z",
  "scoringMode": "inherent",
  
  "threatSeverity": 3,
  "threatSeverityLabel": "Medium",
  "threatRationale": "**Threat Severity: 3 - Medium**\n\n**Scoring Basis: Inherent Risk (without controls)**\n\n**Key Factors Analyzed:**\n\n1. **Threat Actor Capability**\n   - No threat actors specified\n   - Impact on severity: Unable to assess attacker sophistication, defaulting to moderate assumption based on deliberate source\n\n2. **Asset Context**\n   - Asset: Legacy Mainframe (Server, Criticality: 4/5)\n   - Org Unit: IT Operations\n   - High criticality asset suggests significant business value\n   - Legacy systems typically have known vulnerabilities due to age\n\n3. **Threat Characteristics**\n   - Attack Vector: None specified\n   - Threat Source: Deliberate (intentional attack)\n   - Description: MISSING - no scenario narrative available\n   - Status: Draft (incomplete threat definition)\n\n4. **Domain-Asset Type Alignment**\n   - Threat Domain: Operational Technology (OT/ICS)\n   - Asset Type: Server (described as \"Mainframe\")\n   - Alignment Assessment: WEAK - OT/ICS threats typically target industrial control systems, not mainframes; possible data misclassification\n\n5. **Attack Vector Analysis**\n   - No attack vectors specified - unable to assess accessibility\n   - Default assumption: Moderate accessibility for deliberate threats\n\n**Severity Determination:**\nMedium severity (3) assigned as a conservative baseline given the high asset criticality (4/5) and deliberate threat source, but significant data gaps prevent confident scoring. The domain-asset mismatch (OT/ICS threat on mainframe) suggests possible catalog inconsistency. Without threat actors, attack vectors, or description, precise severity assessment is not possible.\n\n**Confidence Level: Low**\nMissing critical threat description, no threat actors specified, no attack vectors defined, and unusual OT/ICS domain classification for a mainframe asset. Threat status is Draft indicating incomplete data entry. Recommend completing threat catalog entry before finalizing assessment.",
  "threatConfidence": "low",
  "threatConfidenceReason": "Missing critical threat description, no threat actors specified, no attack vectors defined, and unusual OT/ICS domain classification for a mainframe asset. Threat status is Draft indicating incomplete data entry.",
  
  "vulnerabilitySeverity": 2,
  "vulnerabilitySeverityLabel": "Low",
  "vulnerabilityRationale": "**Vulnerability Severity: 2 - Low**\n\n**Scoring Basis: Inherent Risk (without controls)**\n\n**Key Factors Analyzed:**\n\n1. **Exploitability Assessment**\n   - Unable to assess without vulnerability type or description\n   - Default assumption: Difficult to exploit without specifics\n\n2. **Asset Context**\n   - Asset: Legacy Mainframe (Server, Criticality: 4/5)\n   - Org Unit: IT Operations\n   - Legacy systems are inherently vulnerable, but specific vulnerability unknown\n\n3. **Vulnerability Characteristics**\n   - Type: NOT SPECIFIED\n   - Domain: Technology (generic)\n   - Description: MISSING - no vulnerability details available\n   - Status: Draft (incomplete vulnerability definition)\n\n4. **Domain-Asset Type Alignment**\n   - Vulnerability Domain: Technology (generic classification)\n   - Asset Type: Server\n   - Alignment Assessment: Moderate - technology vulnerabilities apply to servers but lack specificity\n\n5. **CIA Impact**\n   - Confidentiality only (single pillar)\n   - No Integrity or Availability impact specified\n   - Single CIA impact limits severity ceiling\n\n**Severity Determination:**\nLow severity (2) assigned conservatively due to significant data gaps. Single CIA impact (Confidentiality only) and lack of exploitability information prevent higher scoring. While legacy systems typically have vulnerabilities, without specific vulnerability type or description, scoring above Low would be speculative. The asset criticality (4/5) prevents scoring as Very Low (1).\n\n**Confidence Level: Low**\nNo vulnerability type specified, missing description, and generic domain classification prevent accurate severity assessment. Vulnerability status is Draft indicating incomplete data. Recommend completing vulnerability catalog entry with specific vulnerability type and exploitation details.",
  "vulnerabilityConfidence": "low",
  "vulnerabilityConfidenceReason": "No vulnerability type specified, missing description, and generic domain classification prevent accurate severity assessment. Vulnerability status is Draft indicating incomplete data.",
  
  "calculatedLikelihood": 6,
  "calculatedLikelihoodLabel": "Low",
  "calculatedCyberRiskScore": 24,
  "calculatedCyberRiskScoreLabel": "Very low",
  
  "needsReview": true,
  "reviewReason": "Low confidence in both threat severity and vulnerability severity due to missing critical data (threat description, actors, vectors, vulnerability type). Threat and vulnerability both in Draft status. Domain-asset type mismatch (OT/ICS on mainframe) suggests possible catalog errors. Complete threat and vulnerability catalog entries before proceeding with assessment."
}
```

---

## 10. Implementation Guidance

### 10.1 Agent Architecture
The scoring agent should be implemented as a **function or service** that:
1. Accepts a single `ScoringInput` object
2. Performs independent threat and vulnerability severity analysis
3. Calculates derived values (likelihood, cyber risk score)
4. Determines confidence levels
5. Returns a complete `ScoringOutput` object

### 10.2 Batch Processing

#### Overview
When the user triggers "Start AI scoring" from the Assessment Scoring Tab UI, the agent processes **ALL scenarios** in the assessment scope simultaneously.

#### Batch Input Structure
```typescript
interface BatchScoringInput {
  assessmentId: string;
  assessmentName?: string;
  scenarios: ScoringInput[];  // Array of all scenarios to score
}
```

#### Processing Requirements
1. **Independence**: Score each scenario independently with NO cross-scenario context
2. **Atomicity**: ALL scenarios must complete before UI updates (no partial results during processing)
3. **Error Handling**: If ANY scenario fails:
   - Continue processing remaining scenarios
   - Preserve successful scores
   - Flag failed scenarios for manual review
   - Return partial results with error list
4. **Progress**: Optionally report progress via callback (X of Y scenarios completed)
5. **Performance**: Target <5 seconds per scenario, total batch time depends on count

#### Batch Output Structure
```typescript
interface BatchScoringOutput {
  assessmentId: string;
  timestamp: string;  // ISO 8601
  results: ScoringOutput[];  // Array of individual scenario results
  
  summary: {
    total: number;              // Total scenarios in batch
    succeeded: number;          // Successfully scored
    failed: number;             // Failed to score (errors)
    flaggedForReview: number;   // needsReview === true
    skipped: number;            // isNotApplicable === true
  };
  
  errors?: Array<{
    scenarioId: string;
    scenarioName: string;
    error: string;              // Human-readable error message
    errorCode?: string;         // Optional: "MISSING_DATA", "VALIDATION_ERROR", etc.
  }>;
}
```

#### Error Handling Strategy
| Error Type | Agent Behavior | Return Value |
|------------|----------------|--------------|
| Missing scenario data | Skip, add to errors[] | skipped: true |
| Invalid asset criticality | Use default (3), flag for review | needsReview: true |
| Empty threat description | Score conservatively, low confidence | needsReview: true |
| Calculation error | Re-attempt once, then fail gracefully | Add to errors[] |
| Timeout (>10s per scenario) | Mark as failed, continue batch | Add to errors[] |

#### Example Batch Flow
```typescript
// UI triggers batch scoring
const batchInput: BatchScoringInput = {
  assessmentId: "ASM-001",
  assessmentName: "Q1 2026 Risk Assessment",
  scenarios: [
    { scenarioId: "SCN-001", ... },
    { scenarioId: "SCN-002", ... },
    { scenarioId: "SCN-003", ... },  // This one has missing data
    // ... 47 more scenarios
  ]
};

// Agent processes batch
const batchOutput: BatchScoringOutput = {
  assessmentId: "ASM-001",
  timestamp: "2026-05-06T15:30:00Z",
  results: [
    { scenarioId: "SCN-001", threatSeverity: 4, ... },
    { scenarioId: "SCN-002", threatSeverity: 3, ... },
    { scenarioId: "SCN-003", skipped: true, skipReason: "Missing threat description" },
    // ... 47 more results
  ],
  summary: {
    total: 50,
    succeeded: 48,
    failed: 1,
    flaggedForReview: 5,
    skipped: 1
  },
  errors: [
    {
      scenarioId: "SCN-003",
      scenarioName: "Unknown threat on legacy system",
      error: "Missing critical threat description and actor data",
      errorCode: "MISSING_DATA"
    }
  ]
};

// UI displays all results and shows warning for errors
```

### 10.3 Performance Considerations
- Target: <5 seconds per scenario scoring
- Rationale generation: Use structured templates for consistency
- Validation: Perform all output validation before returning

### 10.4 Logging & Auditing
Each scoring operation should log:
- `scenarioId`, `timestamp`, `scoringMode`
- Input asset/threat/vulnerability IDs
- Output scores and confidence levels
- Any validation warnings or errors
- Processing duration

### 10.5 Future Extensibility
Design for future addition of:
- **Residual Risk Mode**: Factor in control effectiveness
- **Custom Scoring Rules**: Organization-specific severity adjustments
- **Machine Learning**: Pattern recognition from historical scoring decisions
- **External Threat Intelligence**: Augment scoring with real-time threat data

---

## 11. Testing & Validation

### 11.1 Test Scenarios Required
1. **High severity pair** (Nation-state + Triple CIA impact + Critical asset)
2. **Low severity pair** (Opportunistic + Single CIA + Low criticality)
3. **Mixed severity** (High threat + Low vulnerability OR vice versa)
4. **Edge case**: Archived/Inactive assets
5. **Edge case**: Missing descriptions
6. **Edge case**: Domain-asset type mismatches
7. **Confidence flagging**: Multiple missing fields
8. **All asset types**: Test with each of the 7 asset types
9. **All threat domains**: Test with each of the 10 threat domains
10. **All vulnerability domains**: Test with each of the 4 vulnerability domains

### 11.2 Validation Checks
After implementation, validate:
- [ ] All scores are in range 1-5
- [ ] Calculated likelihood = threatSeverity × vulnerabilitySeverity
- [ ] Calculated cyberRiskScore = asset.criticality × calculatedLikelihood
- [ ] Labels match score values correctly
- [ ] `needsReview` is true when confidence is "low"
- [ ] Rationale follows specified template structure
- [ ] All required output fields are present
- [ ] Timestamp is valid ISO 8601 format

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-05-06 | Initial specification - Inherent Risk Mode |
| 1.1 | 2026-05-06 | Added: Batch processing (10.2), Dual rationale outputs (5A), N/A handling (6.0), Confidence integration in rationales, Updated output structure with `combinedRationaleSummary` |
| TBD | TBD | Add Residual Risk Mode (control-aware scoring) |
| TBD | TBD | Add configurable user preferences (conservative vs. aggressive scoring) |

---

## 13. Appendix: Quick Reference

### Threat Severity Quick Guide
- **5**: Nation-state + Trivial access + Critical asset + Deliberate
- **4**: Org. crime + Easy access + High asset + Deliberate
- **3**: Hacktivist + Moderate access + Medium asset + Mixed
- **2**: Negligent + Difficult access + Low asset + Accidental
- **1**: Opportunistic + Rare access + Low asset + Environmental

### Vulnerability Severity Quick Guide
- **5**: Trivial exploit + 3 CIA + Critical asset + Known exploits
- **4**: Easy exploit + 2 CIA + High asset + Common weakness
- **3**: Moderate exploit + 1-2 CIA + Medium asset + Standard type
- **2**: Difficult exploit + 1 CIA + Low asset + Rare conditions
- **1**: Very difficult + 1 CIA + Low asset + Theoretical

### Confidence Quick Guide
- **High**: Complete data + Clear alignment + Standard scenario
- **Medium**: Minor gaps + Some ambiguity + Uncommon pairing
- **Low**: Critical missing data + Severe mismatch + Novel pairing → **FLAG FOR REVIEW**

---

**End of Specification**
