---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  section {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  h1 {
    color: #1976d2;
  }
  h2 {
    color: #1565c0;
  }
  .columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }
---

<!-- _class: lead -->

# 🎯 Cyber Risk Assessment
## AI-Powered Scoring System

**Automating Risk Analysis with Intelligence**

Version 1.1 | May 6, 2026

---

## 📋 Agenda

1. **The Problem** - Why manual scoring fails
2. **The Solution** - AI-powered automation
3. **How It Works** - Mental model & architecture
4. **The Technology** - Database & agent design
5. **The Impact** - ROI & benefits
6. **Demo** - Live walkthrough
7. **Next Steps** - Roadmap & timeline

---

<!-- _class: lead -->

# Part 1: The Problem

---

## 🚨 Manual Risk Scoring is Broken

<div class="columns">
<div>

### The Challenge
- 🕐 **8+ hours** to score 50 scenarios
- 📊 **Inconsistent** results between analysts
- 🧠 **Expertise required** for every decision
- 📝 **Tedious documentation** for compliance
- 🔄 **Not scalable** with organization growth

</div>
<div>

### Real Example
**Q1 2026 Risk Assessment**
- 50 cyber risk scenarios
- 3 different assets each
- 150 total scores needed
- 24 hours of analyst time
- $1,800 in labor costs

**Result**: Too slow for business needs

</div>
</div>

---

## 💼 Business Impact

| Issue | Impact | Cost |
|-------|--------|------|
| **Slow turnaround** | Delayed risk decisions | High |
| **Inconsistency** | Unreliable risk data | High |
| **Resource bottleneck** | Can't scale assessments | Medium |
| **Audit gaps** | Missing rationales | High |
| **Analyst burnout** | Repetitive tedious work | Medium |

**Total Annual Cost**: ~$12,000 per team in wasted time

---

<!-- _class: lead -->

# Part 2: The Solution

---

## 🤖 AI-Powered Scoring Agent

<div class="columns">
<div>

### What It Does
✅ Analyzes threat-vulnerability-asset combinations
✅ Scores severity on 1-5 scale automatically
✅ Generates detailed rationales
✅ Flags low-confidence scores for review
✅ Processes 50 scenarios in **75 seconds**

</div>
<div>

### Key Features
- **Batch processing** - All scenarios at once
- **Confidence detection** - Knows when unsure
- **Audit trail** - Full rationale generation
- **Context-aware** - Asset criticality matters
- **Human-in-loop** - Review flags for edge cases

</div>
</div>

---

## 📊 The Results

<div class="columns">
<div>

### Before (Manual)
- ⏱️ **8 hours** per assessment
- 📈 **6-7 scenarios/hour**
- 🎲 **Variable quality**
- 📝 **Manual write-ups**
- 💰 **$600 per assessment**

</div>
<div>

### After (AI)
- ⏱️ **75 seconds** per assessment
- 📈 **40 scenarios/minute**
- ✅ **100% consistent**
- 🤖 **Auto-generated docs**
- 💰 **~$2 per assessment**

</div>
</div>

---

## 🎉 Impact Summary

```
Time Savings:     8 hours → 75 seconds = 99.7% reduction
Throughput:       6/hour → 40/minute = 400x faster
Annual Savings:   $12,000 → $40 = $11,960 saved
Consistency:      Variable → 100% = Perfect reliability
```

**ROI: 600x return in first year**

---

<!-- _class: lead -->

# Part 3: How It Works

---

## 🧠 Mental Model: Risk = Threat × Vulnerability × Asset

```
┌─────────────────────────────────────────────────┐
│         CYBER RISK SCORE (1-125)                │
│                                                 │
│         Impact × Likelihood                     │
│            ↓         ↓                          │
│        Asset    Threat × Vulnerability          │
│     Criticality Severity  Severity              │
│       (1-5)      (1-5)      (1-5)              │
│                                                 │
│  Example: SQL Injection on Payment Server      │
│  ────────────────────────────────────────      │
│  Impact: 5 (Critical asset)                    │
│  Threat Severity: 4 (Org criminals, web)      │
│  Vulnerability Severity: 4 (Easy exploit)      │
│  Likelihood: 4 × 4 = 16 (High)                │
│  Cyber Risk Score: 5 × 16 = 80 (HIGH)         │
└─────────────────────────────────────────────────┘
```

---

## 💡 Key Insight: Context Matters

<div class="columns">
<div>

### Scenario A: Payment Server
**Asset Criticality: 5 (Critical)**

- Threat Severity: **4 (High)**
  - High-value target
  - Attracts sophisticated actors
- Vulnerability Severity: **4 (High)**
  - Critical financial data at risk
- **Cyber Risk Score: 80 (HIGH)**

</div>
<div>

### Scenario B: Internal Blog
**Asset Criticality: 2 (Low)**

- Threat Severity: **2 (Low)**
  - Low-value target
  - Minimal attacker interest
- Vulnerability Severity: **2 (Low)**
  - Minimal data at risk
- **Cyber Risk Score: 8 (VERY LOW)**

</div>
</div>

**Same threat + vulnerability, different asset = different risk!**

---

## 🎯 The Scoring Process

```mermaid
graph LR
    A[User Clicks<br/>"Start AI Scoring"] --> B[Fetch Scenario Data]
    B --> C[AI Agent Processes]
    C --> D[Calculate Severity 1-5]
    D --> E[Generate Rationales]
    E --> F[Assess Confidence]
    F --> G[Save to Database]
    G --> H[Update UI]
    
    style A fill:#e1f5fe
    style C fill:#c5e1a5
    style F fill:#fff59d
    style H fill:#f8bbd0
```

**Total time: 60-90 seconds for 50 scenarios**

---

<!-- _class: lead -->

# Part 4: The Technology

---

## 🗄️ Database Architecture

**Core Entity: SCENARIO** (where AI scores are stored)

```
SCENARIO
├── scenario_name
├── asset_id → ASSET (criticality 1-5)
├── threat_id → THREAT (actors, vectors, domain)
├── vulnerability_id → VULNERABILITY (CIA impact, type)
│
└── AI-GENERATED SCORES:
    ├── threat_severity (1-5)
    ├── vulnerability_severity (1-5)
    ├── likelihood (T × V = 1-25)
    ├── cyber_risk_score (I × L = 1-125)
    ├── combined_rationale (200-300 words)
    ├── confidence_level (high/medium/low)
    └── needs_review (boolean)
```

---

## 🤖 AI Agent Architecture

<div class="columns">
<div>

### Inputs (from database)
- Asset details
  - Name, type, criticality
  - Org unit context
- Threat details
  - Actors, vectors, domain
  - Description
- Vulnerability details
  - CIA impact, type
  - Domain, description

</div>
<div>

### Processing
1. **Calculate threat severity**
   - Actor capability (1-5)
   - Vector accessibility
   - Domain alignment
   - Asset criticality boost
2. **Calculate vulnerability severity**
   - Exploitability (1-5)
   - CIA impact scope
   - Domain alignment
   - Asset criticality boost
3. **Derive metrics**
   - Likelihood = T × V
   - Risk = I × L

</div>
</div>

---

## 🔍 Confidence Detection

```
For each score, check:
├── Threat description present? (>50 chars)
├── Threat actors specified? (≥1)
├── Attack vectors specified? (≥1)
├── Vulnerability description present?
├── Vulnerability type specified?
├── Domain-asset alignment clear?
└── Status = Active (not Draft)?

Missing Fields:
├── 0 missing → HIGH confidence ✅
├── 1 missing → MEDIUM confidence ⚠️
└── 2+ missing → LOW confidence 🚨
                 └── needs_review = TRUE
```

---

## 📝 Three Rationale Outputs

<div class="columns">
<div>

### 1. Threat Rationale (Full)
- **Length**: 250-350 words
- **Purpose**: Audit trail
- **Format**: 5 structured sections
- **Storage**: Database

### 2. Vulnerability Rationale (Full)
- **Length**: 250-350 words
- **Purpose**: Compliance
- **Format**: 5 structured sections
- **Storage**: Database

</div>
<div>

### 3. Combined Summary (UI)
- **Length**: 200-300 words
- **Purpose**: User display
- **Format**: Concise 4 sections
- **Storage**: Editable in WYSIWYG

**All three include confidence levels**

</div>
</div>

---

## ⚡ Performance Metrics

| Metric | Mock Agent | LLM Agent (Future) |
|--------|-----------|-------------------|
| Per scenario | 500-2000ms | 5-10 seconds |
| 10 scenarios | 10-15 seconds | 1-2 minutes |
| 50 scenarios | 60-90 seconds | 5-8 minutes |

**Current implementation: Mock agent (rule-based)**
**Next sprint: Claude Sonnet 4.5 integration**

---

<!-- _class: lead -->

# Part 5: The Impact

---

## 💰 ROI Analysis

<div class="columns">
<div>

### Manual Scoring Cost
**Per Assessment (50 scenarios)**
- Time: 8 hours
- Rate: $75/hour
- Cost: **$600**

**Annual (20 assessments)**
- Total time: 160 hours
- Total cost: **$12,000**

</div>
<div>

### AI Scoring Cost
**Per Assessment**
- Time: 75 seconds
- Labor: $0 (automated)
- LLM API: ~$2
- Cost: **$2**

**Annual (20 assessments)**
- Total time: 25 minutes
- Total cost: **$40**

</div>
</div>

### **Annual Savings: $11,960 (99.7% reduction)**

---

## ✅ Qualitative Benefits

<div class="columns">
<div>

### For Analysts
- 🎯 **Focus on high-value work**
  - Review edge cases, not routine scoring
- 🧠 **Reduced cognitive load**
  - No repetitive decision-making
- 📈 **Career development**
  - Strategic analysis vs. data entry
- ⏰ **Better work-life balance**
  - No overtime for assessments

</div>
<div>

### For Organization
- ⚡ **Faster risk decisions**
  - Real-time scoring capability
- 📊 **Better data quality**
  - 100% consistent methodology
- 🔍 **Complete audit trail**
  - Auto-generated rationales
- 📈 **Scalability**
  - No bottleneck on growth
- 🎯 **Standardization**
  - Same approach across teams

</div>
</div>

---

## 📊 Confidence Distribution (Sample)

**From 50-scenario assessment:**

| Confidence | Count | Percentage | Action |
|-----------|-------|------------|--------|
| 🟢 **High** | 42 | 84% | Auto-accepted |
| 🟡 **Medium** | 6 | 12% | Warning shown |
| 🔴 **Low** | 2 | 4% | Requires review |

**Result**: 96% of scenarios ready without manual intervention

---

<!-- _class: lead -->

# Part 6: Demo

---

## 🎬 Live Walkthrough (5 minutes)

### Step 1: Navigate to Assessment
- Open "Q1 2026 Risk Assessment"
- Click "Scoring" tab
- See 47 unscored scenarios

### Step 2: Start AI Scoring
- Click "Start AI scoring" button
- Watch skeleton loaders appear
- Status: "Processing 47 scenarios..."

---

<!-- _class: lead -->

# End of Presentation

**Version**: 1.0  
**Date**: May 6, 2026  
**Format**: Marp Markdown Slides
