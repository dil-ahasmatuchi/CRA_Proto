# CRA MVP Research: SME Interview Insights Report

**Date:** April 15, 2026
**Interviews Analyzed:** 10 interviewees across 12 transcript files
**Themes Evaluated:** 14 predefined + additional emergent themes

---

## Executive Summary

This report synthesizes findings from 10 SME and customer interviews conducted as part of the Cyber Risk Assessment (CRA) MVP research initiative. Interviewees span a wide range of organizational maturity, industry, and role—from municipal governments (City of Lethbridge) and mid-market SaaS companies (Brainloop, Diligent) to large enterprises (Qualtrics, Supermicro) and experienced consultants (Diego, Mark Harris, Tom Ryan, Anton Merk, Lina Maria Lainez).

Three cross-cutting findings dominate the research:

1. **Prescriptive defaults with configurable depth.** Every interviewee—regardless of maturity—wants the product to provide a best-practice starting point (pre-loaded risk libraries, scoring formulas, threat catalogs). Mature users then want configurability; immature users want to be guided. The MVP must ship with opinionated defaults.

2. **Scoring must be evidence-based and transparent.** Opaque or "magic number" scores are a dealbreaker. Interviewees demand clear rationale tying scores to real data (control test results, incidents, CVEs, pen test findings). AI-assisted scoring is welcomed enthusiastically, but only with visible reasoning and human override capability.

3. **The gap between assessment and action is the real pain point.** Tools that collect data without translating it into executive-ready narratives and investment decisions fail to gain adoption. The MVP must bridge from granular scenario scores to process-level or business-unit-level reporting that answers "where should we spend money?"

---

## Theme-by-Theme Analysis

### Theme 1: How Cyber Risk Assessment is Done Today

**Cross-Interview Synthesis:**

Current assessment practice is fragmented across every organization interviewed. The spectrum ranges from ad-hoc vendor-driven responses (City of Lethbridge) to comprehensive annual strategic assessments synthesizing internal incidents, external benchmarks, and business-unit surveys (Paulo/Diligent). A consistent theme: the process involves too many disconnected tools and manual effort.

**Key Quotes:**

> "How would you do that today? I'm going to go into Asset Manager. I'm going to try and document all of the assets... Now I'm going to jump over to Risk Manager and I'm going to try and write down all of the risks... And it's all just disconnected."
> — Tom Ryan

> "We start by gathering as much data as we can from the last 12 months. The baseline is the previous assessment."
> — Paulo Amaral

> "I wouldn't say we're really doing it great today."
> — Dave Schultz, City of Lethbridge

> "Risk at our company has been more of like a compliance-driven initiative than an actual risk-focused initiative."
> — Danny, Qualtrics

> "We don't use threat categories... Not much [using vulnerabilities when doing cyber risk assessments]."
> — Alfredo Villagomez, Supermicro

> "What we do on an engineering level is threat modeling. You start with critical business processes."
> — Christoph Burger-Scheidlin

**Summary:** Organizations fall on a spectrum from no formal framework to comprehensive multi-source annual assessments. Common pain: disconnected tools, manual data aggregation, and difficulty translating technical findings into business context. The compliance-to-risk transition is active at multiple organizations (Qualtrics, Supermicro).

---

### Theme 2: Prep Before an Assessment

**Cross-Interview Synthesis:**

Assessment preparation is universally seen as heavy and prerequisite-dependent. Organizations need asset inventories, control mappings, risk registers, and policy documentation in place before an assessment can begin. Smaller organizations (City of Lethbridge, Brainloop) prefer direct facilitation over self-service instructions; larger ones (Qualtrics) need hierarchical delegation structures.

**Key Quotes:**

> "Best practice is starting with identifying the most critical business processes in my business."
> — Tom Ryan

> "For a Diligent one platform approach, what would be fantastic is if rather than attaching stuff here, I would have access to Policy Manager."
> — Christoph Burger-Scheidlin

> "It doesn't seem like a very natural workflow to have everything gathered right at the beginning. I would start my risk assessment and part of that would then be collecting information."
> — Paulo Amaral

> "I think it fits great. There is definitely some setup work, especially around the relationships of different assets."
> — Dave Schultz, City of Lethbridge

> "What can we do to prevent a user from having to go in and put hands on keyboard?"
> — Anton Merk

**Summary:** Prep requirements scale with organizational complexity. The universal ask: minimize manual setup through pre-populated libraries, automated asset-control linking, and integration with existing platform modules (Policy Manager, Asset Manager). Evidence collection should be iterative throughout the assessment, not upfront-only.

---

### Theme 3: Mental Model Fit

**Cross-Interview Synthesis:**

The asset-centric risk model (asset + threat = scenario) resonates across most interviewees, but with important caveats. SaaS companies (Paulo, Christoph) think of "assets" as data categories or business processes—not individual servers. Enterprise users need multi-dimensional entry points (process, objective, criticality). The ISO 27005-aligned formula (Impact x Threat x Vulnerability) is validated by standards-focused interviewees (Anton, Mark Harris).

**Key Quotes:**

> "These are not my assets. My assets are customer data, credentials, corporate sensitive data."
> — Paulo Amaral

> "You don't start with assets. You start with critical business processes."
> — Christoph Burger-Scheidlin

> "What's more important than the assets, what's more important than the risk is always context. Context is absolutely king."
> — Tom Ryan

> "I love this structure. It's well thought through. My criticism would be, it's too much manual effort of things that are already there that I can pre-populate."
> — Anton Merk

> "A cyber risk could be linked to multiple threats. I totally agree with that, 100%."
> — Dave Schultz, City of Lethbridge

> "The vulnerability is actually the vulnerability. The threat is the scenario. And the cyber risk is more of like an overarching title."
> — Danny, Qualtrics

**Summary:** The scenario-based model works, but asset granularity must be flexible. SaaS and cloud-native organizations need data/system category scoping, not machine-level tracking. The tool should support multiple entry points (asset, process, objective, criticality) without forcing a single pathway. Terminology alignment (risk vs. vulnerability vs. scenario) requires clear documentation.

---

### Theme 4: Overview

**Cross-Interview Synthesis:**

Interviewees want a dashboard that shows overall cyber risk posture, critical assets, treatment status, and trends. Heat maps are visually appealing but only valuable when the underlying data is explainable. Drill-down from summary to asset-level detail is essential for executive storytelling.

**Key Quotes:**

> "That overall picture would be great for a group executive look. But if we could look at it at a specific application asset, it's going to help us tell a certain story."
> — City of Lethbridge

> "I think from a visualization of it, I always see the heat map being very attractive, but the value really comes from the data behind it."
> — Ankita Bandi, Supermicro

> "It looks really good, gets you excited to get in the system."
> — City of Lethbridge

**Summary:** Overview dashboards must balance visual appeal with data integrity. Heat maps, trend lines, and most-exposed-asset lists are expected. The real differentiator is drill-down capability and data explainability.

---

### Theme 5: New Assessment

**Cross-Interview Synthesis:**

Assessment creation should be low-friction: auto-generated IDs, clear naming, iterative evidence collection. Interviewees reject manual ID entry (Tom Ryan) and expect the system to come pre-loaded with risk content (Anton). Individual assessments (not workshops) are acceptable for MVP. Qualitative-only assessment is acceptable initially, with quantitative as a future addition.

**Key Quotes:**

> "ID, what is it with you guys and IDs? That's so annoying. What customer goes, oh, I'd love to set my own IDs every time I create something."
> — Tom Ryan

> "When you open up your IT risk environment, it's not going to be empty, but some predefined content. No more, no less."
> — Anton Merk

> "I would start my risk assessment and part of that would then be collecting information, doing assessment, going back, collecting more information."
> — Paulo Amaral

> "We could run theoretically the 27001 risk assessment out of this rather than doing a spreadsheet."
> — Danny, Qualtrics

**Summary:** New assessment flow must be streamlined (auto-IDs, pre-loaded content) and support iterative workflows. Ship with predefined risk libraries so users never face a blank screen.

---

### Theme 6: Scoping

**Cross-Interview Synthesis:**

Scoping is more complex than initially assumed. Organizations need multi-dimensional filtering: by asset criticality, business process, objective, region/environment, and risk type. Bidirectional navigation (asset → processes and processes → assets) is essential. SaaS companies scope at data/system category level; enterprises need regional and environmental segmentation (commercial vs. government).

**Key Quotes:**

> "Is your angle criticality? Is your angle processes? Is your angle objectives? Is your angle specific risks? Context is absolutely king."
> — Tom Ryan

> "I would want all of the scoping sections to map to objects in Diligent—risks, controls... all the risks that Danny has in commercial for me and all the risks that we have in government."
> — Matt V, Qualtrics

> "I want to see that there's 12 individual processes attached to Active Directory... I also should be able to choose one of those processes and see what assets it's also connected to. Going both ways."
> — Mark Harris

> "You always do that on a service level. Your cluster, you cluster it in a service. It's an abstraction—the grouping of all assets you pull in scope."
> — Anton Merk

> "Asset-first approach—yeah, I think that's perfect."
> — Dave Schultz, City of Lethbridge

**Summary:** Scoping must be flexible and multi-dimensional. Asset-first is the default, but process-first, criticality-first, and region-first entry points are all needed. The concept of "asset systems" or clusters (Anton's daisy chain model) is important for enterprise-scale assessments.

---

### Theme 7: Scoring

**Cross-Interview Synthesis:**

Scoring is the most debated theme. Universal agreements: (1) avoid simple averaging—it compresses everything to "medium"; (2) AI-assisted scoring is highly valued but must show transparent rationale; (3) human override is non-negotiable; (4) scores must tie to real evidence (control test results, incidents, CVEs). Disagreement exists on the formula complexity and whether the MVP should be prescriptive or configurable.

**Key Quotes:**

> "Average is such a weird thing to use. Risk people hate average. Everything ends up medium."
> — Tom Ryan

> "It just seems like kind of magic numbers. There's no really like reason why."
> — Paulo Amaral

> "I think you still need a human override. My experience might be more than what the AI, because AI might be hallucinating."
> — Mark Harris

> "The likelihood has to be driven by real facts."
> — Paulo Amaral

> "Wherever it is AI generated, I would be putting this logo. Wherever we're using AI, that needs to be visible."
> — Mark Harris

> "Customers want to be told how to do this stuff. Configurability is step two."
> — Tom Ryan

> "If you have a risk that is 5 impact and 5 likelihood, its inherent risk is 25. If you have a control that is one design and one operational... then the residual risk would be 25."
> — Danny, Qualtrics

> "The scoring approach is good. They will need different methodologies—that's something we build out later."
> — Mark Harris

**Summary:** MVP scoring must be prescriptive (best-practice formula), evidence-linked, and transparent. AI scoring with visible rationale and human override is table-stakes. Simple averaging is unacceptable; highest-value or weighted approaches are required. Label AI-generated content clearly. Future: configurable methodologies for mature customers.

---

### Theme 8: Aggregation

**Cross-Interview Synthesis:**

Aggregation methodology is a critical design decision. Mark Harris identifies that aggregation should occur at the organizational attribute level (org. units, subsidiaries, regions, projects)—not at the assessment level. Multiple assessments are for trending, not aggregation. Anton emphasizes standardized structures as prerequisites for roll-up. Tom Ryan expects bidirectional scoring between CRA and Risk Manager.

**Key Quotes:**

> "This whole approach of aggregation and consolidation is something that, on the enterprise risk, on the risk manager side, we're not doing very well."
> — Mark Harris

> "He's actually aggregating at the wrong level. He's aggregating at the assessments, which doesn't happen in practice."
> — Mark Harris

> "Unless we find a common denominator—a structured approach of creating risk scenarios and mitigating controls specific to the asset type—we will get lost. You can't roll it up otherwise."
> — Anton Merk

> "You want to take all the really granular, low-level risk assessment data and aggregate it so that it makes sense for an executive audience."
> — Paulo Amaral

> "You can combine the cyber risk data with ERM data, strategic risks... eventually it all scrolls up to a higher level of risk for board-level reporting."
> — Adél (validated by Supermicro interviewees)

**Summary:** Aggregation must happen at organizational attribute levels (org. unit, region, project), not at the assessment level. Weighted average is the most common real-world method. Standardized risk-scenario-control structures are prerequisites for meaningful roll-up. Integration with enterprise risk management (ERM) for board-level reporting is a strong differentiator.

---

### Theme 9: Mitigation

**Cross-Interview Synthesis:**

Mitigation tracking is essential but relatively straightforward in design: action items with owners, due dates, status tracking, and escalation workflows. Key additions: the ability to raise issues at any stage, reassessment triggers when mitigations are completed, and library-based mitigation suggestions (future, not MVP).

**Key Quotes:**

> "You should be able to actually raise an issue and an action item at any stage in the process."
> — Mark Harris

> "I need to be able to drill into and say, we've got five items to close out. Some have been closed, some haven't. Does that need a reassessment?"
> — Mark Harris

> "Do you have a library to say based on this threat, you can select this type of plan?"
> — Alfredo Villagomez, Supermicro

> "The subtasks are the treatment plans."
> — Paulo Amaral (on Jira-based mitigation tracking)

> "And then you have a whole workflow that sits behind that."
> — Mark Harris

**Summary:** Mitigation plans need owner assignment, due dates, status tracking, and reassessment triggers. Library-based mitigation recommendations are a strong future feature. Strategic risks are never "closed"—they're continuously managed through accumulated controls.

---

### Theme 10: Cyber Risk Report

**Cross-Interview Synthesis:**

Reporting is where the product either earns adoption or fails. Two distinct output types emerge: (1) executive narrative reports (Word/PDF) for board communication, and (2) detailed spreadsheets for auditors. Current prototype output is too granular for stakeholder communication. Process-level and financial-impact roll-ups are the most requested enhancements.

**Key Quotes:**

> "This is very detailed information. It's not particularly useful in your communications back to senior stakeholders. The dream is it steps up again—I'd love to see that against process."
> — Tom Ryan

> "We create a report that we share with executives. There's some visuals, analysis of Diligent-specific risk. We take out the formulaic things. It walks through top threats, top weaknesses."
> — Paulo Amaral

> "If you start to show financial impact and likelihood over time and reduction in risk through investment, cyber stops being a cost center, becomes a lever to protect enterprise value."
> — Mark Harris

> "I don't think I could take this to my boss and say, what are we going to spend money on? What's the action item?"
> — Paulo Amaral

> "Board presentation is limited to 15-30 minutes, focusing on top 5-10 highest-risk items and their owners."
> — Matt V, Qualtrics

> "And they're doing all this in PowerPoint. It is such an onerous way of doing things."
> — Mark Harris (on Bank of Islam Malaysia's 76-page manual report)

**Summary:** Reports must scale from scenario detail to executive summary. Two audiences: executives (narrative, financial impact, top risks, trend lines) and auditors (detailed spreadsheet with methodology). The ability to translate assessment data into "where to spend money" guidance is the ultimate value proposition.

---

### Theme 11: Scenario & Aggregation Model

**Cross-Interview Synthesis:**

The scenario model (one scenario = one threat + one asset) is validated across interviewees. Cyber risks are overarching categories (ransomware, data breach, phishing); scenarios are the granular asset-threat combinations underneath. The ISO 27005-aligned formula (Impact x Threat x Vulnerability) is endorsed by standards-focused experts.

**Key Quotes:**

> "The scenario is a threat and an asset. If you have one threat but two assets, it will be two scenarios."
> — Tom Ryan

> "It has to do with what you call scenarios here. For all intents and purposes, it is a more granular definition of the risk in the context of the asset."
> — Anton Merk

> "The scenarios make sense because they map to the threats that we have."
> — Danny, Qualtrics

> "The formula is Impact x Threat x Vulnerability. Likelihood is basically Threat x Vulnerability."
> — Adél (validated by multiple interviewees)

**Summary:** Scenario model is sound. Ship with predefined high-level cyber risks (ransomware, data breach, phishing, etc.) that spawn asset-specific scenarios. Scenarios are scored individually and aggregate upward to risk-level and then organizational-level views.

---

### Theme 12: Needs

**Cross-Interview Synthesis:**

The dominant need is time and effort reduction. Customers understand risk assessment's importance but lack capacity. The killer use case: upload existing data (threat libraries, vulnerability scans, pen test results) and let the platform guide them through a structured assessment with AI assistance.

**Key Quotes:**

> "In terms of customer feedback, it is always: do I have time to do this? It's never a question of should I be doing this."
> — Tom Ryan

> "If there's a tool that you can put real data into and come up with a clear picture of where to spend money, and by the way it meets auditor requirements, you probably make a lot of people happy."
> — Paulo Amaral

> "You take your threat library, you take the outputs of your vulnerability scanning, your pen test—you drop it in and our platform will analyze that information. People are losing their minds for that."
> — Tom Ryan

> "The core problem is clearly communicating where to spend money. Cybersecurity is just about where to spend money."
> — Paulo Amaral

> "The goal state is that we either have the metrics already mapped into the controls so there's some automation driving the scoring."
> — Matt V, Qualtrics

**Summary:** The primary need is reducing the effort to go from raw security data to defensible, executive-ready risk insights. File upload + AI-guided analysis is the most compelling capability. The tool must answer "where should we spend money?" to succeed.

---

### Theme 13: Pain Points

**Cross-Interview Synthesis:**

Pain points cluster around five areas: (1) disconnected workflows across tools, (2) opaque/subjective scoring, (3) excessive manual effort, (4) inability to communicate findings to executives, and (5) spreadsheet/PowerPoint-based reporting.

**Key Quotes:**

> "It's all just disconnected. How are we going to bring an actual lifecycle, an actual workflow, an actual operating model into the platform?"
> — Tom Ryan

> "It feels like data entry for the sake of data entry. It generates pictures and charts, but it doesn't generate action plans."
> — Paulo Amaral

> "If you're gonna do assessments based on spreadsheets, it's still not effective. You cannot quantify or qualify the assessment."
> — Alfredo Villagomez, Supermicro

> "There's a lot of automation we can do in Jira that we can't do in Risk Manager. It's a lot easier to manage access and link work."
> — Paulo Amaral (on why they chose Jira over Risk Manager)

> "Many-to-many relationships become a challenge in asset manager."
> — Ankita Bandi, Supermicro

> "This is a 76-page report that they do manually in PowerPoint."
> — Mark Harris (on Bank of Islam Malaysia)

**Summary:** The biggest pain points are workflow fragmentation, manual effort, and the gap between data collection and actionable output. Organizations resort to Jira and PowerPoint because existing GRC tools don't solve the operationalization problem.

---

### Theme 14: Opportunities

**Cross-Interview Synthesis:**

The product has a clear market opening if it delivers on three fronts: (1) pre-loaded, industry-specific baselines that eliminate blank-screen paralysis, (2) AI-powered scoring that reduces manual effort by 80%+, and (3) financial-impact framing that transforms cyber from a cost center to an enterprise value lever.

**Key Quotes:**

> "I think there's a really good opportunity to give customers a best-practice baseline."
> — Tom Ryan

> "If you start to show financial impact and reduction in risk through investment, cyber stops being a cost center, becomes a lever to protect enterprise value. That's what boards and CFOs are interested in."
> — Mark Harris

> "If we could partner with an authoritative source—these are the risks you should be worrying about—that would be fantastic."
> — Tom Ryan

> "Please build it and get it released sooner rather than later. Within the next month or so would be preferable."
> — Tom Ryan

> "We could run theoretically the 27001 risk assessment out of this rather than doing a spreadsheet."
> — Danny, Qualtrics

> "When cyber exposure is framed in financial terms, it becomes comparable, prioritized, and actionable."
> — Mark Harris

**Summary:** Massive opportunity in three areas: prescriptive baselines (industry-specific starter kits), AI-assisted scoring with transparent methodology, and financial-impact reporting for board-level communication. Speed to market matters—competitors are moving.

---

## Additional Cross-Interview Themes

### A. Compliance vs. Risk-Based Security (Emerging Theme)

Multiple interviewees describe a fundamental market divide between compliance-driven and risk-driven approaches. Qualtrics is actively transitioning from SOC 2 to NIST CSF. Tom Ryan frames it as "a holy war." The product should explicitly support this transition, positioning risk management as the higher maturity level while acknowledging compliance requirements.

### B. Financial Impact as Market Differentiator

Mark Harris, Paulo Amaral, and Anton Merk all independently emphasize that translating cyber risk into financial terms is THE differentiator. Traditional heat maps don't drive board decisions; probable financial impact does. This aligns with industry trends toward quantified risk assessment.

### C. Tool Integration Requirements

Supermicro (CrowdStrike, Rapid7), Paulo (Jira), Qualtrics (vulnerability scanners), and Lina (SAST/DAST tools) all need integration with existing security tooling. File upload is the MVP solution; direct integrations are a high-value roadmap item.

### D. Asset System / Dependency Modeling

Anton's "daisy chain" model and Mark Harris's bidirectional navigation requirement point to a deeper need: understanding how assets interconnect and how risk propagates through dependencies. This is critical for business impact analysis and is required for DORA compliance.

### E. Mature vs. Immature Customer Segmentation

Tom Ryan makes the strongest case: the MVP should target immature/under-resourced customers (zero-to-one), not mature enterprises that will demand heavy configurability. This is a larger addressable market and a more achievable product-market fit for an MVP.

---

## Key Takeaways

| # | Theme | Insight | Must-Have for MVP? | Supporting Interviewees |
|---|---|---|---|---|
| 1 | **Scoring** | Avoid simple averaging; use highest-value or weighted average with transparent rationale | Yes | Tom Ryan, Mark Harris, Paulo, Diego |
| 2 | **AI Scoring** | AI-assisted scoring with visible reasoning and human override | Yes | Mark Harris, Tom Ryan, City of Lethbridge, Qualtrics |
| 3 | **Pre-loaded Content** | Ship with predefined risk libraries, threat catalogs, and scoring formulas | Yes | Anton, Tom Ryan, Diego, Mark Harris |
| 4 | **File Upload** | Enable data ingestion (threat libraries, vuln scans, pen test results) | Yes | Tom Ryan, Qualtrics, Supermicro |
| 5 | **Scoping Flexibility** | Multi-dimensional scoping (asset, process, criticality, region) | Yes | Tom Ryan, Mark Harris, Qualtrics, Anton |
| 6 | **Evidence-Based Scoring** | Scores must tie to real data (control results, incidents, CVEs) | Yes | Paulo, Qualtrics, Supermicro, Lina |
| 7 | **Executive Reporting** | Process-level rollup, not just scenario detail; answer "where to spend money" | Phase 1 | Tom Ryan, Paulo, Mark Harris |
| 8 | **Financial Impact** | Frame cyber risk in financial terms for board communication | Phase 1 | Mark Harris, Paulo, Anton |
| 9 | **Aggregation at Attribute Level** | Aggregate by org. unit/region/project, not by assessment | Phase 1 | Mark Harris, Anton, Qualtrics |
| 10 | **Audit Trail** | Track all score changes with user ID, timestamp, and rationale | Yes | Mark Harris, City of Lethbridge, Qualtrics |
| 11 | **Mitigation Tracking** | Owner, due date, status, reassessment triggers | Yes | Mark Harris, City of Lethbridge, Lina |
| 12 | **Tool Integrations** | CrowdStrike, Rapid7, Tenable, Jira connectors | Phase 2 | Supermicro, Paulo, Qualtrics, Lina |
| 13 | **KRIs / Trending** | Quarterly trend visualization showing risk trajectory | Phase 1 | Mark Harris, Qualtrics |
| 14 | **Target Customer** | Focus MVP on immature/under-resourced teams (zero-to-one adoption) | Strategy | Tom Ryan, Diego |
| 15 | **Speed to Market** | Ship MVP by Q2 2026; competitors are moving | Strategy | Tom Ryan, Mark Harris |

---

## Per-Interviewee Summaries

### Diego Aponte
Experienced cybersecurity risk consultant with deep financial services expertise. Emphasizes that one-size-fits-all methodologies fail—different industries, maturity levels, and regulatory environments require different approaches. Defensibility of results (to boards and regulators) is non-negotiable. Predicts clients will immediately demand customization of aggregation methods. Identifies three tiers: early-stage (need defaults), mid-market (need flexibility), and enterprise (need full customization).

### Tom Ryan
Senior sales/strategy figure at Diligent with weekly customer-facing conversations on cyber risk. Fiercely pragmatic, pro-risk-based security, anti-over-engineering. His core message: target immature customers who lack time and expertise, not mature banks demanding heavy configurability. Time is the real constraint—customers never question whether they should do risk assessment, only whether they have capacity. AI-assisted "drop-in" analysis (upload data, get guided assessment) is the killer feature. Urges fast market entry.

### Christoph Burger-Scheidlin
CISO at Brainloop, a ~50-person SaaS company. Approaches assessment from business impact first, not assets. Uses threat modeling at the engineering level and business impact analysis from ISO requirements. Prefers informal, iterative reassessment with reasonable effort. Wants different stakeholders to assess different dimensions (business owners assess impact; IT assesses likelihood). Identifies keeping data fresh as the core challenge.

### City of Lethbridge (Dave Schultz & Bronwyn Jesse)
Small-to-mid municipal government. Currently lacks formal cyber risk assessment framework. The prototype's asset-centric approach fits well. Individual assessments (not workshops) are appropriate for their scale. Phased data buildup is preferred. Key needs: audit trail on all score changes, ecosystem readiness checklist, and the ability to generate risk-reduction narratives for their audit committee. High adoption readiness.

### Mark Harris
Experienced cyber risk SME with operational knowledge across large organizations. Most important contribution: aggregation must happen at organizational attribute levels (org. units, subsidiaries, regions), not at the assessment level. Multiple assessments are for trending, not aggregation. Strongly advocates for financial impact framing as THE competitive differentiator. References Bank of Islam Malaysia as a concrete use case (76-page manual PowerPoint report). Supports MVP-first approach with iterative feedback.

### Paulo Amaral
Security professional at Diligent operating as both SME and customer. Conducts comprehensive annual strategic assessments using internal data (incidents, audit findings, AppSec tickets), external benchmarks (Verizon DBIR), and broad business surveys (150 people, 70% completion). Deliberately chose Jira over Risk Manager for superior automation, customization, and linking capabilities. His central critique: tools feel like "data entry for the sake of data entry" and fail to answer "where should we spend money?" The product must bridge from data collection to actionable budget guidance.

### Qualtrics (Danny & Matt V)
GRC/security governance team at Qualtrics actively transitioning from compliance-driven to risk-focused assessment. Operates multiple framework-specific assessments (ISO 27001, ISO 42001, NIST CSF, FedRAMP). Current processes are "far from satisfactory." Their scoring uses Impact x Likelihood on 5-point scales with control effectiveness weighting. Needs multi-environment scoping (commercial vs. government, regional). Sees significant value in AI agent-driven scoring for large assessment volumes (50-100+ scenarios).

### Lina Maria Lainez (Trepel)
Cyber risk management lead at an oil & gas/energy company. Uses multiple data sources (SAST/DAST, pen testing, CVSS) with custom business-friendly threat naming. Assesses both inherent and residual risk with multiple impact categories (continuity, economic, confidentiality). Key pain points: conflated vulnerability management and risk management workflows, fragmented ownership, manual escalation for missed deadlines. Needs centralized threat dashboard, framework alignment (ISO 27001, PCI DSS), and automated reporting.

### Anton Merk
Highly standards-literate IT/cyber risk expert specializing in ISO 27001/27005 and DORA compliance. Validates the prototype's architectural foundation but identifies three critical gaps: (1) excessive manual effort where automation is possible, (2) missing traceability from policies to technical controls, and (3) no business impact/dependency modeling. Proposes a structured hierarchy: predefined high-level risks → asset-specific scenarios → asset-type-specific configuration controls. Introduces the "daisy chain" concept for asset system dependencies, referencing the European Banking Authority's DORA data dictionary.

### Supermicro (Alfredo Villagomez & Ankita Bandi)
Technically sophisticated organization using CrowdStrike, Rapid7, SecurityScorecard, and BitSight, but lacking a formalized business-aligned risk assessment framework. Alfredo is skeptical of spreadsheet-based assessment and wants direct integration with live monitoring tools. Ankita emphasizes data explainability—dashboards are only valuable when users understand what drives the scores. Key concern: control effectiveness transparency showing how controls reduce vulnerability scores per asset. Moderate-to-cautious receptiveness; needs concrete examples and clear integration pathways.

---

*Report compiled from 12 transcript files (VTT, DOCX, MD formats) totaling approximately 1.2M characters of raw interview data.*
