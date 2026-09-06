# FinLen — Playable Financial Theory

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-172238?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-172238?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-172238?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-ff5f57?style=flat)](LICENSE)

> **"Uji pilihanmu. Ingat pelajarannya."**  
> FinLen is an interactive financial literacy web application designed for Indonesian youth (Gen Z, ages 17–25). It replaces dry, intimidating jargon with tactile simulations, document scanning, and AI roleplay so users experience the consequences of financial decisions *before* real money is on the line.

---

## 📖 Quick Links & Documentation Index

For exhaustive technical guides, architecture maps, and API specs, consult the dedicated documentation:

- 📑 **[Master Project Documentation & Status Guide](docs/PROJECT_DOCUMENTATION.md)** — Comprehensive architecture, codebase map, mathematical specifications, and implementation audit.
- 🎨 **[Design System & UI/UX Style Guide](design.md)** — Semantic color tokens, typography scale, haptic squircle radii, and Indonesian currency guidelines.
- 🔌 **[Backend API Documentation & Agent Contract](docs/API_DOCUMENTATION.md)** — FastAPI REST endpoints, session state machine, and scoring mechanics.
- 📋 **[Product Requirements Document (PRD)](docs/prd-finlen.md)** — Original product concept, personas, user journeys, and feature definitions.

---

## 🎯 The Mission: Closing the SNLIK 2024 Gap

According to Indonesia's **SNLIK 2024** (*Survei Nasional Literasi dan Inklusi Keuangan*):
- **Financial Inclusion:** `75.02%` (Access to digital credit, paylater, and online loans)
- **Financial Literacy:** `65.43%` (Understanding of risks, compound interest, and legal fine print)
- **The Gap:** **`9.59 percentage points`**

Access has outpaced understanding. FinLen bridges this divide through **Playable Theory** (Teori yang Dapat Dimainkan), transforming abstract compounding equations into tactile, visual, and memorable experiences.

---

## 🚀 Current Implementation Status

| Module | Feature | Status | Notes |
| :--- | :--- | :---: | :--- |
| **Landing Page** | Marketing Hub (`/`) | ✅ **Live** | Staggered blur typography, SNLIK 2024 kinetic gap visualizer, interactive choice tokens, tri-feature bento. |
| **App Shell** | Navigation & Sidebar | ✅ **Live** | Responsive desktop collapsible sidebar (icon-only mode) and mobile off-canvas drawer. |
| **Simulator Lab** | Debt Growth Lab (`/app/simulator`) | ✅ **Live** | Interactive compound interest visualizer ($A = P(1 + r)^t$) with Recharts dual-line graphs, currency formatting, and shock alerts. |
| **Simulator Lab** | Comparison Mode (A vs B) | ✅ **Live** | Side-by-side scenario testing with lockable loan principal/duration to isolate interest rate differences. |
| **Design System** | Soft Structuralism Tokens | ✅ **Live** | Warm Cream Canvas (`#f7f8f3`), Midnight Ink (`#172238`), and Vibrant Coral (`#ff5f57`) with navy-tinted ambient shadows. |
| **AI Roleplay** | Debt Collector Persona | 🟡 **API Ready / UI Planned** | Backend state machine implemented; chat frontend UI in roadmap. |
| **Document Scanner** | Red-Flag OCR Detector | 🟡 **API Ready / UI Planned** | Backend Azure Document Intelligence API ready; frontend dropzone in roadmap. |

---

## 🛠️ Technology Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org) with React 19
- **Compiler:** Babel React Compiler enabled (`reactCompiler: true`)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com) + Custom Semantic Design Tokens
- **Icons:** [@phosphor-icons/react](https://phosphoricons.com)
- **Data Visualization:** [Recharts](https://recharts.org)
- **Animations:** [Motion](https://motion.dev) (Framer Motion) & [GSAP](https://gsap.com) ScrollTrigger
- **Backend Pair:** [FastAPI](https://fastapi.tiangolo.com) + SQLModel + Google Gemini API + Azure Document Intelligence

---

## ⚡ Getting Started

### Prerequisites
- Node.js `20.x` or higher
- npm `10.x` or higher

### 1. Clone & Install
```bash
git clone https://github.com/Ryhn-F/finlen.git
cd finlen
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 3. Lint & Build
```bash
# Verify code formatting and lint rules
npm run lint

# Build production bundle
npm run build

# Run production server
npm run start
```

---

## 📂 Project Structure

```
finlen/
├── design.md                  # Design tokens, color system, and UI/UX rules
├── docs/
│   ├── API_DOCUMENTATION.md   # FastAPI backend endpoints and schemas
│   ├── design.md              # Design system reference
│   ├── prd-finlen.md          # Comprehensive product requirements
│   └── PROJECT_DOCUMENTATION.md # Full technical specification & implementation guide
├── public/                    # Logos, SVG assets, and public resources
├── src/
│   ├── app/
│   │   ├── app/
│   │   │   └── simulator/     # /app/simulator route
│   │   ├── globals.css        # Tailwind v4 theme, tokens & utility classes
│   │   ├── layout.tsx         # Root layout with Geist Sans/Mono fonts
│   │   └── page.tsx           # High-impact landing page
│   └── components/
│       ├── navigation/        # AppSidebar, AppTopbar, MarketingNavbar
│       ├── react-bits/        # BlurText (Motion) & ScrollReveal (GSAP)
│       └── simulator/         # SimulatorWorkspace (Debt Growth Lab)
```

---

## 🤖 Instructions for AI Coding Agents

When working inside this repository, all AI agents **must adhere to the invariant rules** documented in [`docs/PROJECT_DOCUMENTATION.md#9-strict-operational-invariants-for-ai-coding-agents`](docs/PROJECT_DOCUMENTATION.md#9-strict-operational-invariants-for-ai-coding-agents):
1. **Color Token Adherence:** Use only canonical tokens defined in `globals.css` (Canvas `#f7f8f3`, Ink `#172238`, Coral `#ff5f57`). Never use pure black (`#000000`).
2. **Indonesian Currency Rules:** Format Rupiah using `Rp 5.000.000` or `Rp 5,4 jt`. Suffix durations with `bulan`.
3. **Tabular Monospace:** Numerical metrics and tabular data must use `var(--font-geist-mono)`.
4. **Backend Contracts:** When creating features, strictly follow [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md).

---

## 🛡️ Educational Disclaimer

FinLen is an educational simulation tool. It does **not** provide legal, financial, or investment advice. Simulations assume compounding growth models for educational illustration without hidden banking fees or debt restructuring adjustments.
