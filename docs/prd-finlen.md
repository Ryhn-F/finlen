PRD — FinLen
Product: FinLen
Version: MVP 1.0
Platform: Responsive Web Application
Target User: Gen Z, especially students and young adults
Primary Goal: Make financial literacy interactive through simulation, roleplay, and real-world document analysis.

1. Product Overview
   1.1 What is FinLen?
   FinLen is an interactive financial literacy website designed to help young users understand financial risks through experience rather than theory.
   Instead of presenting financial concepts through long articles or videos, FinLen allows users to:
   Scan financial documents and identify potential red flags.
   Interact with an AI financial scenario through roleplay.
   Manipulate financial variables and visually see how debt and compound interest grow.
   This follows the proposal's concept of "Playable Theory", where users directly interact with financial simulations and scenarios.

2. Problem Statement
   Young people increasingly have access to digital financial services, but financial literacy has not increased at the same rate.
   The proposal identifies a gap between:
   Financial inclusion: 75.02%
   Financial literacy: 65.43%
   according to SNLIK 2024.
   This becomes particularly relevant for young users exposed to online loans, investment offers, and consumer debt.
   Core problem
   Users may have access to financial products without fully understanding their risks and long-term consequences.
   Therefore, FinLen needs to transform abstract financial concepts into interactive experiences that allow users to see and practice the consequences of financial decisions.

3. Product Goals
   Primary Goals
   G1 — Improve financial risk awareness
   Users should be able to recognize suspicious financial terms and potential risks.
   G2 — Make financial concepts understandable
   Users should visually understand concepts such as:
   interest
   compound interest
   debt growth
   repayment
   financial risk
   G3 — Train decision-making
   Users should practice responding to risky financial situations.
   G4 — Provide accessible education
   The platform should be usable directly through a browser without requiring application installation, consistent with the proposal's web-first strategy.

4. Target Users
   Primary Persona
   "The Financially Curious Gen Z"
   Age: 17–25
   Typical characteristics:
   Uses smartphone frequently
   Familiar with digital services
   May encounter online loans or investment offers
   Doesn't necessarily understand financial terminology
   Prefers interactive experiences over long theoretical material
   Wants quick, understandable explanations

5. Core User Journey
   The three features should not feel like three unrelated tools.
   The ideal journey:
   FINLEN
   │
   ▼
   Choose Experience
   │
   ┌───────────┼───────────┐
   ▼ ▼ ▼
   SCAN SIMULATE ROLEPLAY
   DOCUMENT DEBT AI
   │ │ │
   └───────────┼───────────┘
   ▼
   LEARN THE RISK
   │
   ▼
   FINANCIAL INSTINCT
   For the MVP, users can access each feature independently, but the experiences should provide contextual links to one another.
   Example:
   Scanner detects high interest → "See how this interest grows" → Compound Interest Simulator.

6. Functional Requirements

FEATURE 1 — Smart Document Scanner
6.1 Purpose
Allow users to upload or capture a financial document and receive an understandable explanation of potential financial red flags.
The proposal specifies OCR extraction from documents such as contracts, pamphlets, and financial materials, followed by red-flag detection.

6.2 User Flow
Scanner Page
│
▼
Upload Document
│
▼
Processing
│
▼
OCR Extraction
│
▼
Risk Analysis
│
▼
Results
│
├── Red Flags
├── Important Terms
└── Explanation

6.3 Input
Supported MVP inputs:
JPG
PNG
PDF
Maximum file size should be defined during implementation.
Example:
Upload your financial document

[ Drag & Drop ]

or

[ Choose File ]

Supported:
JPG, PNG, PDF

6.4 Processing
Step 1 — OCR
Backend sends the document to:
Azure Document Intelligence
The system extracts readable text.
Step 2 — Financial Analysis
Extracted text is analyzed by the backend.
The system identifies potentially important terms such as:
interest
late payment
administration fee
penalty
repayment
investment return
guaranteed return
minimum deposit
The exact red-flag rules should be configurable rather than hard-coded into the frontend.

6.5 Result Page
Example:
FINANCIAL DOCUMENT ANALYSIS

Risk Level
🔴 HIGH RISK

3 potential red flags detected
Red Flag Card
⚠ HIGH INTEREST

"2% interest per day"

Why it matters:

A daily interest rate can cause
the amount owed to increase rapidly.

[ Simulate This ]
Another:
⚠ LATE PAYMENT PENALTY

"Penalty applies after 3 days"

Why it matters:

Late payments may increase
your total financial obligation.

6.6 Scanner Functional Requirements
ID
Requirement
SC-01
User can upload a document
SC-02
System validates file type
SC-03
System validates file size
SC-04
Backend sends document to OCR
SC-05
OCR result is returned as text
SC-06
System analyzes extracted text
SC-07
System identifies potential red flags
SC-08
System displays risk level
SC-09
System explains detected risks
SC-10
User can navigate to relevant simulator

FEATURE 2 — NPC Financial Roleplay
7.1 Purpose
Train users to make safer financial decisions by putting them inside simulated financial situations.
The proposal describes this as an AI-generated chat scenario where users interact with an AI acting as an aggressive debt collector or fraudulent investment agent.

7.2 MVP Scenario
For the MVP, use one scenario first:
Scenario: Aggressive Debt Collector
This keeps development manageable while still demonstrating the concept.

7.3 User Flow
Roleplay Page
│
▼
Choose Scenario
│
▼
Scenario Introduction
│
▼
AI NPC Conversation
│
▼
User Responds
│
▼
AI Evaluates Response
│
▼
Conversation Continues
│
▼
Scenario Completed
│
▼
Financial Instinct Score

7.4 Chat Interface
┌──────────────────────────────┐
│ FINLEN ROLEPLAY │
│ Debt Collector Scenario │
├──────────────────────────────┤
│ │
│ 🤖 Collector │
│ │
│ Your payment is overdue. │
│ You need to pay today. │
│ │
│ You │
│ I would like to know the │
│ exact breakdown first. │
│ │
├──────────────────────────────┤
│ Type your response... │
│ [SEND] │
└──────────────────────────────┘

7.5 AI Behavior
The AI should not simply behave as a generic chatbot.
It should have:
Scenario
↓
NPC Persona
↓
Current Situation
↓
User Response
↓
Response Evaluation
↓
Next Situation
The backend should maintain scenario state.
Example:
{
"scenario": "debt_collector",
"turn": 3,
"risk_score": 60,
"critical_thinking": 80,
"impulse_control": 70
}

7.6 User Evaluation
After important responses, the system can evaluate the user's decision.
Example:
GOOD DECISION

You asked for a breakdown
of the debt before agreeing
to payment.

+10 Critical Thinking
+5 Risk Awareness
Avoid making the AI's evaluation feel like a definitive financial/legal judgment. It is an educational simulation.

7.7 Final Score
At the end:
FINANCIAL INSTINCT

82 / 100

Critical Thinking 90
Risk Awareness 78
Impulse Control 82
Decision Making 79

🏆 FINANCIAL SURVIVOR
This gives the user a tangible result after completing the scenario.

7.8 Roleplay Functional Requirements
ID
Requirement
RP-01
User can select a scenario
RP-02
System initializes scenario
RP-03
AI generates NPC responses
RP-04
User can send messages
RP-05
Backend maintains conversation state
RP-06
System evaluates user decisions
RP-07
System updates user score
RP-08
System displays final score
RP-09
System provides learning feedback

FEATURE 3 — Interactive Data Visualization
8.1 Purpose
Help users understand how debt changes over time by directly manipulating financial variables.
The proposal specifically describes an interactive graph with an initial debt amount and adjustable loan duration, creating a visual "shock therapy" showing debt growth.

8.2 User Flow
Simulator
│
▼
Input Initial Debt
│
▼
Set Interest Rate
│
▼
Adjust Duration
│
▼
Calculate
│
▼
Update Graph
│
▼
Show Financial Impact

8.3 Input Controls
Initial Debt
Initial Debt

Rp 5.000.000

[────────●────────]
Interest Rate
Monthly Interest

2%

[──────●──────────]
Duration
Duration

12 months

[────────●────────]

8.4 Main Output
DEBT GROWTH

Rp 5.000.000
│
│
│ ●
│ ●
│ ●
│ ●
│ ●
└──────────────────
0 6 12 months
Below it:
Initial Debt
Rp 5.000.000

Interest
Rp 1.341.208

Final Amount
Rp 6.341.208
The graph should update immediately when the user changes the parameters.

8.5 Comparison Mode
This is an optional MVP enhancement but I strongly recommend it.
Allow users to compare two scenarios:
OPTION A OPTION B

Debt Rp5M Rp5M
Interest 2% 5%
Duration 12M 12M

Final Rp6.34M Rp8.95M
Then:
Difference: Rp2.61M
This makes the educational message much stronger.

8.6 Simulator Functional Requirements
ID
Requirement
DV-01
User can enter initial debt
DV-02
User can modify interest rate
DV-03
User can modify duration
DV-04
System calculates debt
DV-05
Graph updates dynamically
DV-06
System displays initial amount
DV-07
System displays interest amount
DV-08
System displays final amount
DV-09
User can reset simulation
DV-10
Optional comparison between scenarios

9. Homepage
   The homepage should immediately communicate the product concept.
   Hero
   Financial decisions
   shouldn't be learned
   the hard way.

Experience the consequences
before they happen.

[ START LEARNING ]

[ EXPLORE SIMULATOR ]
Then:
Three Feature Cards
🔍 SCAN

Find financial red flags
before you sign.

🎭 ROLEPLAY

Practice handling
financial pressure.

📈 SIMULATE

See how debt grows
over time.

10. Navigation
    For MVP:
    FINLEN

Home
Learn
Simulator
Roleplay
Scanner

                         [Start]

If authentication is implemented:
Home
Learn
Simulator
Roleplay
Scanner
Progress

                     Profile

11. Backend Architecture
The proposal specifies:
Next.js / React / Tailwind
FastAPI
PostgreSQL / Supabase
Azure Document Intelligence
Gemini API
Vercel
Railway / Render
Recommended architecture:
USER
│
▼
NEXT.JS
│
┌────────┴────────┐
│ │
▼ ▼
FastAPI Supabase
│
┌──────┼─────────┐
│ │ │
▼ ▼ ▼
Azure Gemini Financial
OCR API Calculator

12. API Design
    Scanner
    POST
    /api/scanner/analyze
    Request:
    multipart/form-data

file
Response:
{
"risk_level": "high",
"extracted_text": "...",
"red_flags": [
{
"title": "High Interest",
"severity": "high",
"text": "2% per day",
"explanation": "..."
}
]
}

Roleplay
POST
/api/roleplay/session
Create a session.
POST
/api/roleplay/message
Request:
{
"session_id": "123",
"message": "I want to see the debt breakdown first."
}
Response:
{
"message": "...",
"evaluation": {
"risk_awareness": 10,
"critical_thinking": 8
},
"session_state": {
"turn": 3
}
}

13. Database Structure
    For MVP:
    users
    ──────
    id
    email
    created_at
    roleplay_sessions
    ──────────────────
    id
    user_id
    scenario
    score
    status
    created_at
    completed_at
    roleplay_messages
    ──────────────────
    id
    session_id
    sender
    message
    evaluation
    created_at
    scan_sessions
    ──────────────
    id
    user_id
    filename
    risk_level
    extracted_text
    created_at
    red_flags
    ─────────
    id
    scan_id
    category
    severity
    detected_text
    explanation
    You don't need a database for the compound interest calculation itself. The calculation can happen client-side for instant interaction.

14. Frontend Structure
    For Next.js App Router:
    app/
    │
    ├── page.tsx
    │
    ├── scanner/
    │ └── page.tsx
    │
    ├── simulator/
    │ └── page.tsx
    │
    ├── roleplay/
    │ ├── page.tsx
    │ └── [sessionId]/
    │ └── page.tsx
    │
    ├── learn/
    │ └── page.tsx
    │
    └── progress/
    └── page.tsx
    Components:
    components/
    │
    ├── scanner/
    │ ├── DocumentUploader
    │ ├── ScanProgress
    │ ├── RiskScore
    │ └── RedFlagCard
    │
    ├── simulator/
    │ ├── FinancialInput
    │ ├── SimulatorSlider
    │ ├── DebtChart
    │ └── FinancialSummary
    │
    ├── roleplay/
    │ ├── ScenarioCard
    │ ├── ChatWindow
    │ ├── ChatMessage
    │ ├── TypingIndicator
    │ └── ScoreResult
    │
    └── ui/
    ├── Button
    ├── Card
    ├── Modal
    └── ProgressBar

15. Important UX Requirements
    Loading States
    Every AI/processing feature must have a clear loading state.
    Scanner:
    Analyzing your document...

Extracting text
✓

Checking financial terms
...

Analyzing potential risks
...
Roleplay:
NPC is typing...

Error States
Example:
Something went wrong.

We couldn't analyze this document.

Please try another image or document.

[ TRY AGAIN ]
Never leave the user staring at an empty screen.

16. Educational Safety
    Because this is financial education, the product should clearly communicate:
    FinLen provides educational simulations and does not provide financial, legal, or investment advice.
    For scanner results, use:
    Potential Red Flag
    instead of:
    This is definitely a scam.
    The AI should explain why something may be risky, rather than making unsupported definitive claims.

17. MVP Scope
    This is VERY important for you guys.
    Don't try to build everything in the proposal at once.
    Must Have
    Homepage
    Hero
    Feature overview
    Smart Scanner
    Upload
    OCR
    Red flag detection
    Results
    Interactive Data
    Initial debt
    Interest
    Duration
    Dynamic graph
    Financial summary
    NPC Roleplay
    One scenario
    AI conversation
    Session state
    Basic scoring
    Final result

Should Have
Authentication
User progress
Mission system
Scenario history
Comparison mode
Scanner → Simulator integration

Could Have
Multiple NPC scenarios
Investment scam scenario
Leaderboard
Achievement system
PWA
Offline educational content

Won't Have in MVP
Native Android application
Native iOS application
Real financial transactions
Real loan applications
Real investment recommendations
Complex financial portfolio management
This keeps the implementation aligned with the proposal's web-first strategy rather than accidentally turning the competition project into a full fintech product.

18. Development Priority
    I'd give your dev team this order:
    PHASE 1
    Foundation
    │
    ├── Next.js
    ├── Tailwind
    ├── Layout
    ├── Routing
    └── Design System
    │
    ▼
    PHASE 2
    Interactive Simulator
    │
    ├── Inputs
    ├── Calculation
    ├── Chart
    └── Animation
    │
    ▼
    PHASE 3
    NPC Roleplay
    │
    ├── Chat UI
    ├── FastAPI
    ├── Gemini
    ├── Scenario State
    └── Scoring
    │
    ▼
    PHASE 4
    Document Scanner
    │
    ├── Upload
    ├── Azure OCR
    ├── Text Extraction
    ├── Red Flag Engine
    └── Results
    │
    ▼
    PHASE 5
    Integration
    │
    ├── Scanner → Simulator
    ├── Roleplay → Score
    ├── Progress
    └── Polish

19. Definition of Done
    A feature is considered complete when:
    Scanner
    User can upload supported document
    OCR successfully extracts text
    Red flags are displayed
    Risk explanations are understandable
    Error/loading states work
    Mobile responsive
    Roleplay
    User can start scenario
    NPC responds through Gemini
    Conversation maintains context
    User decisions affect evaluation
    Final score is generated
    Loading/error states work
    Simulator
    User can change debt
    User can change interest
    User can change duration
    Calculation is correct
    Graph updates immediately
    Results are understandable
    Mobile responsive

20. The Core Product Principle
    If I had to give the developer team one rule for FinLen, it's this:
    Every financial concept should answer three questions:
    "What is it?" → "What happens if I do it?" → "Can I recognize it in real life?"
    And your three features map beautifully to that:
    WHAT IS IT?
    │
    ▼
    📈 INTERACTIVE DATA
    Understand the concept
    │
    ▼
    WHAT HAPPENS?
    │
    ▼
    🎭 NPC ROLEPLAY
    Experience the decision
    │
    ▼
    CAN I RECOGNIZE IT?
    │
    ▼
    🔍 DOCUMENT SCANNER
    Detect it in the real world
    That should be the design philosophy of the entire FinLen website, rather than just implementing three technically impressive features independently. It also directly supports the proposal's stated objective of moving users from merely receiving financial information toward understanding consequences through simulation and interaction.
