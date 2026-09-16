# FinLen — Design System & UI/UX Style Guide
**Version:** 1.0.0  
**Status:** Active Baseline  
**Target Audience:** Gen Z (Ages 17–25), Students, Young Professionals  
**Design Philosophy:** "Playable Theory" — Tactile, Interactive, Haptic, and Empathetic Financial Learning

---

## 1. Brand Identity & Design Directive

### 1.1 Core Concept: Playable Theory
FinLen replaces dense, intimidating financial jargon with interactive experiences where choices can be tested and long-term consequences visualized. The design must communicate **financial intelligence without financial dread**. It is playful yet grounded, modern yet trustworthy, intuitive yet mathematically rigorous.

### 1.2 Aesthetic Archetype: Soft Structuralism + Machined Haptic Precision
- **Canvas Feel:** Natural warm cream canvas (`#f7f8f3`), avoiding clinical pure white or uninspired corporate grey.
- **Ink & Contrast:** Deep midnight navy (`#172238`) anchors typography and high-priority surfaces.
- **Vibrant Accent:** Energetic Coral (`#ff5f57`) serves as the singular brand punch—driving user action, highlighting risk metrics, and infusing warmth.
- **Physicality (Haptic Doppelrand):** Floating pill capsules, dual-bezel nested containers, specular highlight edges (`inset 0 1px rgba(255,255,255,0.7)`), and subtle ambient shadows.

---

## 2. Color System & Design Tokens

FinLen uses semantic CSS variables defined in `:root` inside [`src/app/globals.css`](file:///d:/Projects/finlen/src/app/globals.css). All new interfaces must strictly consume these tokens.

### 2.1 Primary Color Tokens

| Token Variable | Hex / Value | Color Preview | Role & Usage |
| :--- | :--- | :--- | :--- |
| `--canvas` | `#f7f8f3` | Soft Warm Cream | Global page background, outer shells, paper canvas base |
| `--surface` | `#fcfdf9` | Crisp Light White | Primary card backgrounds, floating panels, pill buttons |
| `--surface-strong` | `#eef1ea` | Muted Sage Tint | Nested card containers, form backgrounds, sidebar workspace backdrops |
| `--ink` | `#172238` | Deep Midnight Navy | Primary text headlines, dark feature cards, dark primary buttons, sidebar background |
| `--muted` | `#596276` | Cool Slate Muted | Secondary descriptions, subtitles, inactive captions, metadata labels |
| `--line` | `#d8dce5` | Subtle Border Gray | Hairline dividers, card outlines, subtle grid lines |
| `--accent` | `#ff5f57` | Vibrant Coral | Primary interactive punch, button orbs, active switches, key chart series |
| `--accent-dark` | `#a92d29` | Crimson Coral | Hover text on links, slider thumb focus, high-contrast headings on soft backgrounds |
| `--accent-soft` | `#ffe1dd` | Tender Coral Tint | Eyebrow badges, active token pills, selection highlight, warning callout cards |
| `--navy-soft` | `#e6ebf1` | Ice Navy Tint | Secondary stats, comparison Option B cards, secondary feature containers |

### 2.2 Semantic & Auxiliary Palette

| Name | Hex / Value | Usage Context |
| :--- | :--- | :--- |
| **Dark Secondary Surface** | `#24324a` | Profile containers in sidebar, nested dark art slots, secondary comparison lines |
| **Warning Gold (Notice)** | `#fff0bf` (Bg) / `#624600` (Text) | High-interest rate callouts, risky terms alerts |
| **Danger / High Risk** | `#ffe1dd` (Bg) / `#7f2623` (Text) | Debt compounding explosion warnings, red-flag document highlights |
| **Success / Safe Metric** | `#e6f4ea` (Bg) / `#137333` (Text) | Safe loan indicators, verified contract status, positive cashflow |
| **Shadow Ambient Tint** | `rgb(23 34 56 / 8%-16%)` | Semantic variable `--shadow-tint: 23 34 56` prevents muddy pure-black shadows |

### 2.3 Strict Palette Rules
1. **Single Accent Rule:** Coral (`#ff5f57`) is the dominant accent. Do NOT introduce random purple, bright cyan, or orange gradients unless representing a specific chart comparison scenario.
2. **Never Pure Black (`#000000`):** Always use Midnight Navy (`--ink: #172238`) for dark themes and typography.
3. **Never Gray Drop Shadows:** Shadows must always be tinted with Navy (`rgba(var(--shadow-tint), 0.08)`) to preserve organic depth.
4. **Theme Lock:** Do not randomly alternate light and dark backgrounds mid-page. Sections maintain an intentional narrative rhythm (e.g. Cream Canvas -> Deep Ink for Journey/Immersion -> Cream Canvas).

---

## 3. Typography System

FinLen relies on Next.js Google Fonts configured in [`src/app/layout.tsx`](file:///d:/Projects/finlen/src/app/layout.tsx):
- **Sans-Serif:** `Geist Sans` (`var(--font-geist-sans)`)
- **Monospace:** `Geist Mono` (`var(--font-geist-mono)`)

### 3.1 Type Scale Hierarchy

| Style Level | Class / Size | Weight | Tracking & Leading | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `clamp(3.4rem, 5.8vw, 6.4rem)` | `900` | `tracking-[-0.075em]`, `leading-[0.92]` | Main Hero headlines (`.hero-title`) |
| **Section Title** | `clamp(2.3rem, 5vw, 5rem)` | `850` | `tracking-[-0.07em]`, `leading-[0.98]` | Major section headers (Features, Simulator, Gap) |
| **Card / Feature H3** | `clamp(1.4rem, 2.8vw, 2.5rem)` | `800` | `tracking-[-0.05em]`, `leading-[1.05]` | Bento card titles, ledger headlines |
| **Subhead / Lead** | `clamp(1rem, 1.5vw, 1.2rem)` | `400`–`500` | `leading-[1.55]` | Hero lead text, section descriptions (`--muted`) |
| **Body Standard** | `0.95rem` / `text-base` | `400` | `leading-relaxed` | General card text, explanations, educational copy |
| **Eyebrow Badge** | `0.7rem` (`11px`) | `850` | `tracking-[0.15em]`, `uppercase` | Pill badges preceding titles (`.eyebrow`) |
| **Telemetry / Data** | `0.75rem`–`1.35rem` (Mono) | `750`–`800` | `tracking-[-0.04em]` | Rupiah values, interest percentages, month durations |

### 3.2 Financial & Number Formatting Rules
- **Indonesian Currency:** Always format with Indonesian thousand separators:
  - Full display: `Rp 5.000.000` (Never `Rp. 5000000` or `5.000.000 IDR`).
  - Compact summary: `Rp 5,4 jt` or `Rp 250 rb` (used in axis labels and mobile tags).
- **Percentages:** Always use standard decimal format: `2%`, `2,5%`, or `5%/bln`.
- **Tenor / Time:** Suffix with clear unit: `12 bulan`, `36 bln`.
- **All Numerical Outputs:** Must use `font-family: var(--font-geist-mono), monospace` to ensure tabular alignment in charts and counters.

---

## 4. Spacing, Elevation & Corner Radii

FinLen uses an exaggerated, friendly squircle radius system that softens financial complexity into tactile toy-like modules.

### 4.1 Corner Radii Scale
- **`--radius-card` (24px):** Standard cards, feature bento boxes, chart panels, ledger articles.
- **`--radius-control` (14px):** Interactive controls, currency input fields, comparison switches, scenario tabs.
- **Capsule Pill (`999px`):** Primary buttons, marketing navbar, eyebrow tags, choice tokens, status badges.
- **Large Art Shells (`32px`–`34px`): Hero visual frames, trust sections.

### 4.2 Elevation & Shadow Layers
1. **Pill Elevation (`nav` / `choice-token`):**
   ```css
   box-shadow: 0 12px 36px rgba(23, 34, 56, 0.08), inset 0 1px rgba(255, 255, 255, 0.7);
   ```
2. **Card Elevation (`controls-panel` / `chart-panel`):**
   ```css
   box-shadow: inset 0 0 0 1px rgba(23, 34, 56, 0.09), 0 16px 50px rgba(23, 34, 56, 0.06);
   ```
3. **Hero Art Depth:**
   ```css
   box-shadow: 0 30px 90px rgba(23, 34, 56, 0.11);
   ```

### 4.3 The "Double-Bezel" (Doppelrand) Architecture
To make cards feel like high-end machined physical hardware:
- **Outer Shell:** A wrapper container with subtle tinted background (`rgba(23, 34, 56, 0.05)` or `--surface-strong`), outer radius `32px`, and padding `8px`.
- **Inner Core:** The actual card with `--radius-card` (`24px`), distinct surface background (`--surface`), inner specular line (`inset 0 1px rgba(255,255,255,0.72)`), and rich content.

---

## 5. Iconography & Visual Assets

### 5.1 Phosphor Icons Standard
All icons must be imported from `@phosphor-icons/react` (or `@phosphor-icons/react/ssr` on Server Components).
- **Primary Weight:** `bold` for arrows and navigation actions.
- **Feature Weight:** `duotone` for concept badges (`ShieldCheck`, `ChartLineUp`, `Sparkle`).
- **Standard Sizing Ladder:**
  - `16px`: Inside button orbs and inline links.
  - `20px`–`24px`: Sidebar navigation items and form inputs.
  - `32px`–`48px`: Feature category tokens and stat badges.
- **Prohibition:** Strictly banned from importing Lucide, Feather, Material, or FontAwesome icons. Maintain a pure Phosphor icon family.

### 5.2 Visual Asset Art Direction ("Nara & The Choice Engine")
- **Character / Protagonist:** "Nara", a curious Gen Z explorer testing financial options at an interactive console.
- **Style:** Clean thick navy outlines, warm coral and mint/slate color blocks, tactile paper textures.
- **No Div-Screenshots:** Never construct fake, broken CSS dashboards. Use high-fidelity components, interactive SVGs, or art-directed illustrations.

---

## 6. Component Architecture & UI Patterns

### 6.1 Buttons & Interactive Pills

#### Primary Button with "Button-in-Button" Orb
Primary CTAs must feature a trailing circular orb enclosing the action glyph:
```tsx
<Link href="/app/simulator" className="button button-primary">
  <span>Mulai Belajar</span>
  <span className="button-orb" aria-hidden="true">
    <ArrowRight size={16} weight="bold" />
  </span>
</Link>
```
- **Hover Physics:** Button floats up `-2px`; inner orb translates right `+3px` and rotates `-8deg`.
- **Active Physics:** Button compresses with `scale(0.98)`.

#### Secondary Button
```tsx
<Link href="#learn" className="button button-secondary">
  Pelajari Dulu
</Link>
```
- Flat surface background, subtle `rgba(23, 34, 56, 0.18)` outline, midnight navy text.

---

### 6.2 Navigation Patterns

1. **Marketing Navbar (`.marketing-nav`):**
   - Floating pill capsule detached from top (`height: 68px`, max-width `1180px`, `backdrop-filter: blur(18px)`).
   - Desktop renders brand lockup, centered category links, and primary CTA.
   - Mobile (<768px) collapses to brand + native `<details class="mobile-menu">` panel.
2. **App Shell Sidebar (`.app-sidebar`):**
   - Desktop Expanded: `248px` width with labels, badges, and user profile card.
   - Desktop Minimized: `78px` width icon-only mode with smooth width interpolation (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Mobile Drawer: Fixed overlay drawer sliding from `translateX(-105%)` to `0` over a dark backdrop scrim (`rgba(23, 34, 56, 0.48)`).

---

### 6.3 Financial Form Controls & Inputs

#### Currency Input Field (`.currency-entry`)
Form input for Rupiah debt amounts with tabular mono font and focus rings:
```tsx
<div className="currency-entry">
  <span className="currency-prefix">Rp</span>
  <input
    type="text"
    inputMode="numeric"
    value="5.000.000"
    aria-label="Jumlah Utang Pokok"
  />
  <span className="currency-suffix">IDR</span>
</div>
```
- Focus state: `box-shadow: inset 0 0 0 2px var(--accent-dark)`.
- Never use placeholder as label; always provide an explicit `<label>`.

#### Custom Slider Range (`input[type="range"]`)
- Custom 6px track with border-radius `999px` in soft slate (`#cbd0d8`).
- 20px circular thumb with accent color, white halo ring, and navy ambient shadow.
- Accompanied by `.slider-indicators` displaying minimum and maximum threshold values.

#### Comparison Toggle Switch (`.compare-switch`)
- Dual-state switch allowing direct scenario benchmarking (Option A vs Option B).
- High visual feedback with track color transition to `--accent` and smooth thumb translateX.

---

### 6.4 Data Visualization & Chart Standards

FinLen charts are built with **Recharts** wrapped in responsive, adaptive panels:
- **Option A (Baseline Scenario):** Stroke `#ff5f57` (Vibrant Coral), strokeWidth `3px`.
- **Option B (Comparison Scenario):** Stroke `#24324a` (Dark Slate Navy), strokeWidth `2.5px`, dashed `5 5`.
- **Grid Lines:** `rgba(216, 220, 229, 0.6)` (subtle hairlines, horizontal only).
- **Tooltip Card:** Rounded-2xl card with white background, navy borders, tabular mono figures, and delta difference badge.
- **Empty & Loading States:** Dedicated skeleton shimmer (`.chart-skeleton`) with animated diagonal sweep. Never leave a blank empty box.

---

## 7. Motion Choreography & Transitions

FinLen uses fluid physical transitions inspired by high-end consumer hardware. Default browser `linear` and `ease-in-out` transitions are **strictly forbidden**.

### 7.1 Motion Parameters
- **Physics Curve:** `cubic-bezier(0.16, 1, 0.3, 1)` (Crisp deceleration with immediate feedback).
- **Micro-Interaction Duration:** `200ms`–`320ms` (buttons, toggles, hover states).
- **Panel & Drawer Duration:** `420ms`–`520ms` (sidebar minimize, mobile drawer slide).
- **Hero & Section Reveals:** `650ms`–`900ms` (entrance stagger, scroll reveal).

### 7.2 Motion Libraries & Components
- **`motion/react`:** Standard Framer Motion import for spring physics and layout morphs.
- **`BlurText`:** Character-by-character blur-in animation for impactful headlines.
- **`ScrollReveal`:** Intersection-observer-driven entrance for statistics and key statements.

### 7.3 Accessibility Rule (`prefers-reduced-motion`)
All animations, transitions, and keyframe sweeps must automatically truncate to `0.01ms` when `prefers-reduced-motion: reduce` is enabled in the operating system.

---

## 8. Responsive Breakpoints & Viewport Rules

FinLen follows a Mobile-First responsive discipline:

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop (`>= 1024px`)** | Laptops, Desktop Monitors | Dual-column hero, 2-column simulator workspace, sticky desktop sidebar |
| **Tablet (`768px - 1023px`)** | iPads, Tablets, Foldables | Stacked features, compact sidebar, 3-column stats with full-width note |
| **Mobile (`< 768px`)** | iPhone, Android Smartphones | Single-column stack, drawer navigation, touch-friendly 44px min touch targets |

### 8.1 Viewport Stability Directive
- **Never use `100vh`** for full-height hero sections on mobile. Always use `min-h-[100dvh]` to eliminate layout jumps caused by mobile Safari / Chrome dynamic address bars.
- **Mobile Collapses:** Hero tilt rotations (`rotate(1.5deg)`) and ledger horizontal translations (`translateX(-34px)`) reset to `none` below `768px` to prevent horizontal overflow and touch interference.

---

## 9. Anti-Patterns & Strict Banned Practices

To protect FinLen from degraded design quality, the following are **strictly banned**:

1. ❌ **No Generic AI Purple/Cyan Gradients:** Never introduce purple button glows or neon AI mesh gradients. FinLen's identity is Warm Canvas + Midnight Navy + Coral.
2. ❌ **No Unformatted Numbers:** Numbers must never be rendered as raw strings like `12450000`. Always format as `Rp 12.450.000`.
3. ❌ **No Mixed Icon Sets:** Do not mix Lucide, Heroicons, or Material icons with Phosphor.
4. ❌ **No Placeholder-As-Label:** Form inputs must always have clear, dedicated labels above the input field.
5. ❌ **No Text Wrapping on Primary CTAs:** Primary button labels must fit cleanly on one line (1–3 words max).
6. ❌ **No Symmetrical Boring 3-Card Grids:** Prefer asymmetrical bento grids, 1-large/2-stacked splits, or interactive ledger cards.
7. ❌ **No Eyebrow Overuse:** Maximum 1 eyebrow tag per 3 sections. An eyebrow above every headline makes the page look templated.

---

## 10. Design Checklist for Future Modules

Before shipping any new page or feature (such as the **Smart Document Scanner** or **AI Financial Roleplay**):

- [ ] Does the page use `--canvas` (`#f7f8f3`), `--surface` (`#fcfdf9`), and `--ink` (`#172238`) as foundation?
- [ ] Is Coral (`#ff5f57`) used with purpose as the primary accent rather than scattered everywhere?
- [ ] Are numeric values formatted with `Geist Mono` and standard Indonesian currency conventions?
- [ ] Do interactive cards follow the Doppelrand double-bezel or card elevation pattern?
- [ ] Are all icons sourced from `@phosphor-icons/react`?
- [ ] Do CTAs use the button-in-button orb or standard pill button styling?
- [ ] Does the layout collapse cleanly to single-column on mobile (`< 768px`) without horizontal scroll?
- [ ] Is `prefers-reduced-motion` fully respected?
- [ ] Do all form inputs and button states pass WCAG AA contrast standards?
