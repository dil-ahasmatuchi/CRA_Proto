# AI Scoring Integration Setup Guide

## ✅ Implementation Complete

The AI scoring button is now integrated with Anthropic Claude API for real-time cyber risk scenario scoring.

---

## 🔧 Setup Instructions

### 1. Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### 2. Add Your API Token

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-api-key-here
DATABASE_PATH=./data.db
API_PORT=3001
```

**Where to get your API key:**
1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to "API Keys" section
4. Create a new key or copy existing one
5. Paste it in the `.env` file

### 3. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🎯 How It Works

### User Flow:

1. **Create Assessment** → Add assets in Scope tab
2. **Move to Scoring** → Auto-generates scenarios (asset × cyber_risk × threat)
3. **Click "Start AI Scoring"** → Triggers Claude API to score all scenarios
4. **View Results** → Scored scenarios appear with threat/vulnerability severity

### API Flow:

```
Frontend Button Click
    ↓
GET /api/cyber-risk-assessments/:id/scenarios (fetch scenario IDs)
    ↓
POST /api/scenarios/score { scenarioIds: [...] }
    ↓
For each scenario:
  - Fetch asset, threat, vulnerability details from DB
  - Call Anthropic Claude API with scoring prompt
  - Parse Claude's response (threat severity, vulnerability severity, rationale)
  - Calculate: likelihood = threat × vulnerability
  - Calculate: cyber_risk_score = impact × likelihood
  - Save scores to database
    ↓
Return results to frontend
    ↓
UI refreshes with scored scenarios
```

---

## 📁 Files Changed/Created

### New API Files:
- **`/api/lib/scoringAgent.ts`** - Real AI scoring logic using Claude
- **`/api/scenarios/score.ts`** - REST endpoint for batch scoring
- **`/api/cyber-risk-assessments/[id]/generate-scenarios.ts`** - Auto-generate scenarios

### Updated Files:
- **`/scripts/api-server.ts`** - Registered new API routes
- **`/src/pages/AssessmentDetailsTab.tsx`** - Updated AI scoring button handler
- **`.env.example`** - API key configuration template

---

## 🧪 Testing the Integration

### 1. Test Scenario Generation:
```bash
# Create assessment ASM-001 with assets
# Click "Move to Scoring" button
# Check console for: "Generated X scenarios"
```

### 2. Test AI Scoring:
```bash
# Click "Start AI Scoring" button
# Watch for:
#   - "processing" phase indicator
#   - API calls in network tab
#   - Console log: "AI scored X scenarios"
#   - Phase changes to "complete"
```

### 3. Verify Scores in Database:
```bash
sqlite3 data.db "SELECT display_id, name, threat_severity, vulnerability_severity, cyber_risk_score FROM scenarios LIMIT 5;"
```

---

## 🔍 Scoring Details

### What Claude Evaluates:

**Threat Severity (1-5):**
- Likelihood of threat occurring
- Sophistication required
- Threat actor capabilities
- Attack vector complexity

**Vulnerability Severity (1-5):**
- Ease of exploitation
- Prevalence of vulnerability
- Attack surface exposure
- Technical controls effectiveness

### Scoring Formula:

```
Impact = Asset Criticality (1-5)
Likelihood = Threat Severity × Vulnerability Severity (1-25)
Cyber Risk Score = Impact × Likelihood (1-125)
```

### Example Claude Prompt:

```
Score this cyber risk scenario:

SCENARIO: Customer Database Server - SQL Injection Attack
ASSET: Customer Database Server (Criticality: 5/5 - Very high)
THREAT: SQL Injection Attack
  - Domain: Application & API
  - Actors: Organised Cybercriminal Group
  - Vectors: Web Application & Browser
VULNERABILITY: Application Security Defect
  - Domain: Technology
```

---

## 📊 Cost Estimation

**Model:** Claude 3.5 Sonnet  
**Average tokens per scenario:** ~1,500 tokens (prompt + response)  
**Pricing:** ~$3 per million tokens

**Example:**
- 100 scenarios = 150,000 tokens = ~$0.45
- 1,000 scenarios = 1,500,000 tokens = ~$4.50

---

## 🚨 Troubleshooting

### Error: "ANTHROPIC_API_KEY not configured"
- ✅ Check `.env` file exists
- ✅ Verify key format: `sk-ant-api03-...`
- ✅ Restart dev server after adding key

### Error: "Failed to fetch scenarios"
- ✅ Ensure scenarios were generated (click "Move to Scoring" first)
- ✅ Check network tab for API errors

### Error: "AI scoring failed"
- ✅ Check API key is valid (test in Anthropic console)
- ✅ Check API quota/limits
- ✅ Check server logs for detailed error

### Scores not appearing in UI:
- ✅ Refresh the page
- ✅ Check browser console for errors
- ✅ Verify database has scores: `SELECT * FROM scenarios WHERE threat_severity IS NOT NULL LIMIT 5;`

---

## 🔐 Security Notes

- **Never commit `.env` file** (already in `.gitignore`)
- **Rotate API keys** periodically
- **Use separate keys** for dev/staging/production
- **Monitor API usage** in Anthropic console

---

## 🎉 What's Next?

- ✅ Scenarios auto-generated on "Move to Scoring"
- ✅ AI scores all scenarios via Claude API
- ✅ Results displayed in Scoring tab
- ✅ Scores saved to database
- 🔜 Add progress indicator during scoring
- 🔜 Add retry logic for failed scenarios
- 🔜 Add batch size limits for large assessments
- 🔜 Add cost estimation before scoring

---

## 📞 Support

If you encounter issues:
1. Check this guide's Troubleshooting section
2. Check server logs: `npm run dev` output
3. Check browser console for frontend errors
4. Verify API key is valid in Anthropic console
