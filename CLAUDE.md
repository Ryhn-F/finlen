# FinLen — Claude Guidelines

@AGENTS.md

## Project Documentation
- Complete Project & Implementation Guide: [docs/PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)
- Design System & Tokens: [design.md](design.md)
- Backend API Specification: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- PRD: [docs/prd-finlen.md](docs/prd-finlen.md)

## Common Commands
- Dev Server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Strict Rules for Agents
- Read and follow [docs/PROJECT_DOCUMENTATION.md#9-strict-operational-invariants-for-ai-coding-agents](docs/PROJECT_DOCUMENTATION.md#9-strict-operational-invariants-for-ai-coding-agents)
- Use semantic color tokens from `src/app/globals.css`. Never use pure black (`#000000`). Brand accent is Coral (`#ff5f57`).
- Always format Indonesian currency as `Rp 5.000.000` or `Rp 5,4 jt`.
- All financial counters and numbers must use `var(--font-geist-mono)`.
