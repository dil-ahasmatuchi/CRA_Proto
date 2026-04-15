---

## name: analyze-sme-interview
description: >-
  Analyze SME or customer interview transcripts (VTT files) against a set of
  validation questions. Maps quotes with timestamps to each question, summarizes
  insights, and produces a structured analysis. Use when the user attaches
  interview transcripts, meeting recordings, VTT files, or asks to analyze an
  SME interview, customer interview, or validation session.

# Analyze SME Interview

## Overview

Produces a structured analysis of customer/SME interview transcripts mapped
against a set of validation questions. Output is dense, quote-heavy, and
designed for product teams to extract actionable insights.

## Inputs

The user provides:kjnkjnkj

1. **Transcript(s)** — one or more `.vtt` files (WebVTT format from Teams/Zoom recordings)
2. **Validation questions** — either tagged as a file or described inline. If none provided, ask the user which questions to validate against.
3. **Interviewer notes** — optional plain-text notes pasted in the message

## Workflow

### Step 1: Parse transcripts

- Read all attached `.vtt` files
- Identify speakers from `<v Name>` tags
- Treat multiple files as one continuous interview (note which part each quote comes from)
- The interviewee (non-interviewer) is the primary source of quotes

### Step 2: Load validation questions

- Read the tagged question file or extract questions from the user's message
- Number each question and note its sub-questions

### Step 3: Map quotes to questions

For each validation question that the interview addressed:

1. Find all relevant statements from the interviewee
2. Extract direct quotes with timestamps
3. Write a dense summary

For questions NOT addressed in the interview, list them separately.

### Step 4: Capture overflow insights

Any significant interviewee statements that don't map to a specific question
go into an "Additional Insights" section, also with quotes and timestamps.

### Step 5: Produce key takeaways table

Prioritized table of insights with must-have assessment.

## Output Format

Use this exact structure:

```markdown
# SME Interview Analysis: [Interviewee Name] ([Topic])

**Interview date:** [if known]
**Parts:** [number of transcript files, duration if known]

---

## Question N: [Question Title from cheatsheet]
*"[Short version of the question]"*

### Quotes

> "Direct quote from interviewee."
> — Part X, MM:SS–MM:SS

> "Another quote."
> — Part X, MM:SS

### Summary

[Dense bullet points or short paragraph. Tables where useful.]

---

[Repeat for each addressed question]

---

## Questions Not Addressed

- **Question N: [Title]** — Not covered (reason if obvious, e.g. "ran out of time")

---

## Additional Insights

### [Insight Topic]

> "Quote"
> — Part X, MM:SS

**Summary:** [Dense explanation]

[Repeat for each additional insight]

---

## Key Takeaways

| Priority | Insight | Must-Have? |
|----------|---------|------------|
| 1 | ... | Yes / No / Future |
| 2 | ... | ... |
```

## Rules

- **Always include timestamps** on quotes (format: `Part X, MM:SS` or just `MM:SS` for single-file interviews)
- **Quotes first, then summary** for each question — the raw voice of the customer matters most
- **Keep summaries dense** — bullet points and tables over paragraphs
- **Use tables** for comparisons, segmented insights, or prioritization
- **Flag must-haves explicitly** — if the interviewee says something is critical, essential, or a dealbreaker, mark it
- **Note speaker context** — if the interviewee references specific customer segments, industries, or deal examples, capture that context
- **Preserve nuance** — distinguish between "this is what I think" vs "this is what clients tell me" vs "this is a must-have"
- **If multiple transcript files**, indicate which part each quote comes from
- **Include interviewer notes** — if the user provided notes, cross-reference them with transcript content. Notes may capture things said off-record or summarize key points.

