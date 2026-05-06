# 🎯 Cyber Risk Assessment AI Scoring System
## Visual Diagrams (Mermaid)

**Version**: 1.1 | **Date**: May 6, 2026

---

## 📊 Database Entity Relationship Diagram

```mermaid
erDiagram
    ASSESSMENT ||--o{ ASSESSMENT_ASSET : includes
    ASSESSMENT_ASSET }o--|| ASSET : references
    ASSET }o--|| ORG_UNIT : "belongs to"
    ASSET ||--o{ SCENARIO : "exposed to"
    SCENARIO }o--|| THREAT : "threatened by"
    SCENARIO }o--|| VULNERABILITY : "vulnerable to"
    SCENARIO }o--|| CYBER_RISK : "contributes to"
    THREAT ||--o{ THREAT_ACTOR : has
    THREAT ||--o{ THREAT_VECTOR : has
    THREAT ||--o{ THREAT_SOURCE : has
    VULNERABILITY ||--o{ VULNERABILITY_CIA_IMPACT : impacts
    ASSET ||--o{ ASSET_CONTROL : "protected by"
    CONTROL ||--o{ ASSET_CONTROL : "protects"

    ASSESSMENT {
        uuid id PK
        string name
        string status
        timestamp created_at
        timestamp updated_at
    }

    ASSET {
        uuid id PK
        string name
        string asset_type
        int criticality "1-5, USER DEFINED"
        string criticality_label
        uuid org_unit_id FK
        string status
        timestamp created_at
    }

    ORG_UNIT {
        uuid id PK
        string name
        uuid parent_id FK
    }

    SCENARIO {
        uuid id PK
        string scenario_name
        uuid asset_id FK
        uuid threat_id FK
        uuid vulnerability_id FK
        uuid cyber_risk_id FK
        boolean is_not_applicable
        int threat_severity "AI-GENERATED 1-5"
        string threat_severity_label "AI-GENERATED"
        string threat_confidence "AI-GENERATED"
        text threat_rationale "AI-GENERATED"
        int vulnerability_severity "AI-GENERATED 1-5"
        string vulnerability_confidence "AI-GENERATED"
        text vulnerability_rationale "AI-GENERATED"
        text combined_rationale "AI-GENERATED"
        int likelihood "AI-CALCULATED"
        int cyber_risk_score "AI-CALCULATED"
        boolean needs_review "AI-FLAGGED"
        string scoring_source
        timestamp scored_at
    }

    THREAT {
        uuid id PK
        string display_id
        string name
        string domain
        text description
        string status
    }

    THREAT_ACTOR {
        uuid threat_id FK
        string actor_type
    }

    THREAT_VECTOR {
        uuid threat_id FK
        string vector_type
    }

    THREAT_SOURCE {
        uuid threat_id FK
        string source_type
    }

    VULNERABILITY {
        uuid id PK
        string display_id
        string name
        string domain
        string vulnerability_type
        text description
        string status
    }

    VULNERABILITY_CIA_IMPACT {
        uuid vulnerability_id FK
        string cia_pillar
    }

    CONTROL {
        uuid id PK
        string name
        string control_type
        int effectiveness
    }

    ASSET_CONTROL {
        uuid asset_id FK
        uuid control_id FK
    }

    CYBER_RISK {
        uuid id PK
        string name
        string domain
    }
```

---

## 🔄 Data Flow Architecture

```mermaid
flowchart TB
    subgraph UI["🖥️ User Interface"]
        A[Assessment Scoring Tab]
        B[Click 'Start AI Scoring']
    end

    subgraph Hook["⚛️ React Hook Layer"]
        C[useScoringAgent]
        D[State Management]
    end

    subgraph Data["📊 Data Fetching"]
        E[Fetch Scenario Data]
        F[JOIN Assets + Threats + Vulnerabilities]
    end

    subgraph Agent["🤖 AI Scoring Agent"]
        G[scoreScenario for each]
        H1[Calculate Threat Severity]
        H2[Calculate Vulnerability Severity]
        H3[Assess Confidence]
        H4[Generate Rationales]
        H5[Calculate Derived Metrics]
    end

    subgraph Persistence["💾 Database Persistence"]
        I[UPDATE scenario SET scores]
        J[Notify Catalog Change]
    end

    subgraph Display["📈 UI Update"]
        K[Refresh Table View]
        L[Show Success Toast]
        M[Enable Click-through]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H1
    H1 --> H2
    H2 --> H3
    H3 --> H4
    H4 --> H5
    H5 --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> A

    style Agent fill:#e1f5fe
    style UI fill:#f3e5f5
    style Persistence fill:#e8f5e9
    style Display fill:#fff3e0
```

---

## 🧮 Risk Scoring Formula

```mermaid
graph LR
    A[Asset Criticality<br/>1-5<br/>User-Defined] --> I[Impact<br/>1-5]
    
    T[Threat Severity<br/>1-5<br/>AI-Scored] --> L[Likelihood<br/>1-25<br/>T × V]
    V[Vulnerability Severity<br/>1-5<br/>AI-Scored] --> L
    
    I --> CRS[Cyber Risk Score<br/>1-125<br/>I × L]
    L --> CRS
    
    CRS --> Band{Score Band}
    Band -->|101-125| VH[Very High<br/>Executive Action]
    Band -->|76-100| H[High<br/>Senior Mgmt Review]
    Band -->|51-75| M[Medium<br/>Management Awareness]
    Band -->|26-50| LO[Low<br/>Team Monitoring]
    Band -->|1-25| VL[Very Low<br/>Accept/Defer]
    
    style A fill:#ffccbc
    style T fill:#c5e1a5
    style V fill:#c5e1a5
    style I fill:#ffccbc
    style L fill:#fff59d
    style CRS fill:#ff6b6b
    style VH fill:#ef5350
    style H fill:#ff9800
    style M fill:#ffeb3b
    style LO fill:#8bc34a
    style VL fill:#66bb6a
```

---

## 🎯 Threat Severity Calculation Flow

```mermaid
flowchart TD
    Start[Start: Threat Severity Calculation] --> A1[Parse Threat Actors]
    
    A1 --> A2{Actor Type?}
    A2 -->|Nation-State| B1[Base = 5.0]
    A2 -->|Org Crime| B2[Base = 4.0]
    A2 -->|Hacktivist| B3[Base = 3.0]
    A2 -->|Insider| B4[Base = 3.5]
    A2 -->|Negligent| B5[Base = 2.5]
    A2 -->|Script Kiddie| B6[Base = 1.5]
    
    B1 --> C[Parse Attack Vectors]
    B2 --> C
    B3 --> C
    B4 --> C
    B5 --> C
    B6 --> C
    
    C --> C1{Vector Type?}
    C1 -->|Web/Email| D1[+1.0 Highly Accessible]
    C1 -->|Cloud/Network| D2[+0.5 Moderate Access]
    C1 -->|Physical| D3[-0.5 Limited Access]
    
    D1 --> E[Check Domain-Asset Alignment]
    D2 --> E
    D3 --> E
    
    E --> E1{Alignment?}
    E1 -->|Strong Match| F1[+0.5 Alignment Boost]
    E1 -->|Moderate| F2[+0.0 No Change]
    E1 -->|Weak Mismatch| F3[-0.5 Penalty]
    
    F1 --> G[Check Asset Criticality]
    F2 --> G
    F3 --> G
    
    G --> G1{Criticality?}
    G1 -->|5 Very High| H1[+1.0 Critical Boost]
    G1 -->|4 High| H2[+0.5 High Boost]
    G1 -->|3 Medium| H3[+0.0 No Change]
    G1 -->|2 Low| H4[-0.5 Low Penalty]
    G1 -->|1 Very Low| H5[-0.5 Low Penalty]
    
    H1 --> I[Sum All Factors]
    H2 --> I
    H3 --> I
    H4 --> I
    H5 --> I
    
    I --> J[CLAMP Result<br/>Min: 1, Max: 5]
    J --> K[Threat Severity<br/>1-5]
    
    style Start fill:#e1f5fe
    style K fill:#4caf50
    style I fill:#fff59d
    style J fill:#ff9800
```

---

## 🛡️ Vulnerability Severity Calculation Flow

```mermaid
flowchart TD
    Start[Start: Vulnerability Severity Calculation] --> A[Parse CIA Impact]
    
    A --> A1{CIA Pillars Count?}
    A1 -->|3 Pillars C+I+A| B1[Base = 5.0<br/>Maximum Impact]
    A1 -->|2 Pillars| B2[Base = 3.5<br/>High Impact]
    A1 -->|1 Pillar| B3[Base = 2.5<br/>Moderate Impact]
    
    B1 --> C[Check Exploitability]
    B2 --> C
    B3 --> C
    
    C --> C1{Vuln Type?}
    C1 -->|Known Exploits| D1[+0.5 Easily Exploitable]
    C1 -->|Common Weakness| D2[+0.0 Standard]
    C1 -->|Rare Condition| D3[-0.5 Difficult]
    
    D1 --> E[Check Domain-Asset Alignment]
    D2 --> E
    D3 --> E
    
    E --> E1{Alignment?}
    E1 -->|Technology Domain| F1[+0.5 Universal Risk]
    E1 -->|Process Domain| F2[+0.25 Moderate]
    E1 -->|People Domain| F3[+0.25 Moderate]
    E1 -->|Physical Domain| F4[+0.0 Asset-Specific]
    
    F1 --> G[Check Asset Criticality]
    F2 --> G
    F3 --> G
    F4 --> G
    
    G --> G1{Criticality?}
    G1 -->|5 Very High| H1[+1.0 Critical Boost]
    G1 -->|4 High| H2[+0.5 High Boost]
    G1 -->|3 Medium| H3[+0.0 No Change]
    G1 -->|2 Low| H4[-0.0 Minimal]
    G1 -->|1 Very Low| H5[-0.0 Minimal]
    
    H1 --> I[Sum All Factors]
    H2 --> I
    H3 --> I
    H4 --> I
    H5 --> I
    
    I --> J[CLAMP Result<br/>Min: 1, Max: 5]
    J --> K[Vulnerability Severity<br/>1-5]
    
    style Start fill:#e1f5fe
    style K fill:#4caf50
    style I fill:#fff59d
    style J fill:#ff9800
```

---

## 🔍 Confidence Assessment Logic

```mermaid
flowchart TD
    Start[Start: Confidence Assessment] --> A[Initialize Missing Count = 0]
    
    A --> B1{Threat Description?}
    B1 -->|Missing or < 10 chars| C1[Missing Count +1]
    B1 -->|Present| D1[Continue]
    
    C1 --> B2
    D1 --> B2
    
    B2{Threat Actors?}
    B2 -->|None Specified| C2[Missing Count +1]
    B2 -->|Present| D2[Continue]
    
    C2 --> B3
    D2 --> B3
    
    B3{Attack Vectors?}
    B3 -->|None Specified| C3[Missing Count +1]
    B3 -->|Present| D3[Continue]
    
    C3 --> B4
    D3 --> B4
    
    B4{Threat Status?}
    B4 -->|Draft| C4[Missing Count +1]
    B4 -->|Active| D4[Continue]
    
    C4 --> B5
    D4 --> B5
    
    B5{Vulnerability Description?}
    B5 -->|Missing or < 10 chars| C5[Missing Count +1]
    B5 -->|Present| D5[Continue]
    
    C5 --> B6
    D5 --> B6
    
    B6{Vulnerability Type?}
    B6 -->|Missing| C6[Missing Count +1]
    B6 -->|Present| D6[Continue]
    
    C6 --> B7
    D6 --> B7
    
    B7{Domain-Asset Alignment?}
    B7 -->|Severe Mismatch| C7[Missing Count +1]
    B7 -->|OK| D7[Continue]
    
    C7 --> E
    D7 --> E
    
    E{Missing Count?}
    E -->|0| F1[Confidence: HIGH]
    E -->|1| F2[Confidence: MEDIUM<br/>Add Warning]
    E -->|≥2| F3[Confidence: LOW<br/>Set needs_review = TRUE]
    
    F1 --> End[Return Confidence Level]
    F2 --> End
    F3 --> End
    
    style Start fill:#e1f5fe
    style F1 fill:#4caf50
    style F2 fill:#ffeb3b
    style F3 fill:#ef5350
    style End fill:#9c27b0
```

---

## 📈 Batch Processing Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Assessment Scoring Tab
    participant Hook as useScoringAgent Hook
    participant DB as Database
    participant Agent as AI Scoring Agent
    participant Store as Catalog Store

    User->>UI: Click "Start AI Scoring"
    UI->>Hook: startScoring(scenarioIds)
    Hook->>Hook: setPhase('processing')
    
    Note over Hook,DB: Data Fetching Phase
    loop For each scenario ID
        Hook->>DB: SELECT scenario + asset + threat + vulnerability
        DB-->>Hook: Complete scenario data
    end
    
    Hook->>Agent: scoreBatch({ scenarios })
    
    Note over Agent: AI Processing Phase (60-90 seconds)
    loop For each scenario
        Agent->>Agent: Calculate threat severity
        Agent->>Agent: Calculate vulnerability severity
        Agent->>Agent: Assess confidence
        Agent->>Agent: Generate rationales
        Agent->>Agent: Calculate derived metrics
    end
    
    Agent-->>Hook: BatchScoringOutput { results, summary }
    
    Note over Hook,DB: Persistence Phase
    loop For each result
        Hook->>DB: UPDATE scenario SET scores
        DB-->>Hook: Success
    end
    
    Hook->>Store: notifyCatalogChange()
    Store-->>UI: Trigger re-render
    
    Hook->>Hook: setPhase('complete')
    Hook->>Hook: setResults(output)
    
    UI->>User: Display scores + success toast
    
    Note over User,UI: User can now view rationales
```

---

## 🎨 UI State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Page Load
    
    Idle --> Processing: User clicks<br/>"Start AI Scoring"
    
    Processing --> Complete: All scenarios<br/>scored successfully
    Processing --> Error: Scoring fails<br/>(API error, timeout)
    
    Complete --> Idle: User clicks<br/>"Re-score"
    Error --> Idle: User clicks<br/>"Try Again"
    
    state Processing {
        [*] --> FetchingData
        FetchingData --> ScoringScenarios
        ScoringScenarios --> PersistingResults
        PersistingResults --> [*]
    }
    
    note right of Idle
        - Show "Start AI Scoring" button
        - Empty score columns
        - No skeleton loaders
    end note
    
    note right of Processing
        - Button shows spinner
        - Table shows skeleton loaders
        - Status: "Processing X scenarios..."
    end note
    
    note right of Complete
        - Show success message
        - Scores populated in table
        - Enable click-through to details
    end note
    
    note right of Error
        - Show error alert
        - Allow retry
        - Preserve any partial results
    end note
```

---

## 🏗️ Component Architecture

```mermaid
graph TB
    subgraph Pages["📄 Pages"]
        AST[AssessmentScoringTab.tsx]
        SRP[ScoringRationalePage.tsx]
    end
    
    subgraph Hooks["⚛️ React Hooks"]
        USA[useScoringAgent.ts]
    end
    
    subgraph Services["🔧 Services"]
        SA[scoringAgent.ts<br/>Interface]
        MSA[mockScoringAgent.ts<br/>Mock Implementation]
        LSA[llmScoringAgent.ts<br/>LLM Implementation<br/>Future]
    end
    
    subgraph Data["💾 Data Layer"]
        CAT[scenarios.ts<br/>Catalog Data]
        STORE[catalogStore.ts<br/>Observable Store]
    end
    
    subgraph Components["🎨 UI Components"]
        SIC[ScoringInfoCard]
        ST[ScoringTable]
        SR[ScoringRow]
        WYS[WYSIWYG Editor]
    end
    
    AST --> USA
    AST --> SIC
    AST --> ST
    ST --> SR
    
    SRP --> WYS
    
    USA --> SA
    SA -.implements.-> MSA
    SA -.implements.-> LSA
    
    USA --> CAT
    USA --> STORE
    
    STORE --> AST
    STORE --> SRP
    
    style AST fill:#e1f5fe
    style USA fill:#c5e1a5
    style SA fill:#fff59d
    style MSA fill:#ffccbc
    style LSA fill:#f8bbd0
```

---

## 📊 Severity Distribution Example

```mermaid
pie title Cyber Risk Score Distribution (Sample Assessment)
    "Very High (101-125)" : 8
    "High (76-100)" : 15
    "Medium (51-75)" : 18
    "Low (26-50)" : 12
    "Very Low (1-25)" : 7
```

---

## ⏱️ Performance Comparison

```mermaid
gantt
    title Time Comparison: Manual vs AI Scoring (50 scenarios)
    dateFormat X
    axisFormat %s

    section Manual Scoring
    Analyst reviews scenarios :0, 14400
    Analyst writes rationales :14400, 28800

    section AI Scoring
    AI processes all scenarios :0, 75
    UI updates :75, 76
```

---

## 🔄 Scoring Workflow

```mermaid
journey
    title User Journey: AI Scoring Workflow
    section Navigate
      Open Assessment: 5: User
      Go to Scoring Tab: 5: User
      See unscored scenarios: 3: User
    section Score
      Click "Start AI Scoring": 5: User
      Wait for processing: 4: User, AI Agent
      See skeleton loaders: 4: User
    section Review
      View populated scores: 5: User
      Click scenario for details: 5: User
      Read AI rationale: 4: User
      Edit if needed: 5: User
    section Complete
      Review flagged scenarios: 4: User
      Approve scores: 5: User
      Move to Results tab: 5: User
```

---

## 🎯 Confidence Level Distribution

```mermaid
graph LR
    A[All Scenarios<br/>50 total] --> B{Confidence<br/>Assessment}
    
    B -->|85%| C[High Confidence<br/>42 scenarios<br/>Auto-accepted]
    B -->|12%| D[Medium Confidence<br/>6 scenarios<br/>Minor warnings]
    B -->|3%| E[Low Confidence<br/>2 scenarios<br/>Requires Review]
    
    C --> F[Ready for Use]
    D --> G[Review Optional]
    E --> H[Review Required]
    
    style C fill:#4caf50
    style D fill:#ffeb3b
    style E fill:#ef5350
    style F fill:#81c784
    style G fill:#fff176
    style H fill:#e57373
```

---

## 🔐 Data Security & Audit Trail

```mermaid
flowchart LR
    subgraph Input["📥 Input Data"]
        A[Threat Catalog]
        B[Vulnerability Catalog]
        C[Asset Inventory]
    end
    
    subgraph Processing["⚙️ Processing"]
        D[AI Scoring Agent]
        E[Validation]
        F[Confidence Check]
    end
    
    subgraph Storage["💾 Storage"]
        G[Scenario Scores]
        H[Full Rationales]
        I[Confidence Levels]
    end
    
    subgraph Audit["📋 Audit Trail"]
        J[Timestamp]
        K[Scoring Mode]
        L[Agent Version]
        M[Review Status]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    
    G --> J
    H --> K
    I --> L
    J --> M
    
    style Input fill:#e3f2fd
    style Processing fill:#fff9c4
    style Storage fill:#f3e5f5
    style Audit fill:#e8f5e9
```

---

## 📱 Responsive UI Layout

```mermaid
graph TB
    subgraph Desktop["🖥️ Desktop View (>1200px)"]
        D1[Assessment Header]
        D2[Scoring Info Card<br/>with AI Button]
        D3[Wide Table<br/>All columns visible]
        D4[Inline score editing]
    end
    
    subgraph Tablet["📱 Tablet View (768-1200px)"]
        T1[Collapsed Header]
        T2[Stacked Info Card]
        T3[Scrollable Table<br/>Priority columns]
        T4[Modal for editing]
    end
    
    subgraph Mobile["📱 Mobile View (<768px)"]
        M1[Minimal Header]
        M2[Card-based Layout]
        M3[Scenario Cards<br/>Swipeable]
        M4[Full-screen editor]
    end
    
    style Desktop fill:#e1f5fe
    style Tablet fill:#f3e5f5
    style Mobile fill:#fff3e0
```

---

**End of Diagrams**

## 💡 How to Use These Diagrams

### In GitHub/GitLab
These Mermaid diagrams render automatically in:
- GitHub README.md files
- GitLab markdown files
- Most modern markdown viewers

### In Documentation Tools
- **Docusaurus**: Native Mermaid support
- **MkDocs**: Use `mkdocs-mermaid2-plugin`
- **Confluence**: Use Mermaid macro or export as PNG

### Export as Images
Use one of these tools:
1. **Mermaid Live Editor**: https://mermaid.live
2. **VS Code**: Markdown Preview Mermaid Support extension
3. **CLI**: `mmdc -i input.md -o output.png`

### In Presentations
1. Export diagrams as PNG/SVG
2. Import into PowerPoint/Keynote
3. Or use Marp for markdown slides

---

**Document Version**: 1.0  
**Last Updated**: May 6, 2026  
**Format**: Mermaid Diagrams  
**Compatibility**: GitHub, GitLab, Docusaurus, MkDocs
