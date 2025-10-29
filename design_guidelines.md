# Sports Prediction Engine - Design Guidelines

## Design Approach

**Selected Approach:** Design System - Fluent Design with Data Visualization specialization

**Justification:** This is a data-intensive professional analytics platform requiring clear information hierarchy, efficient data comprehension, and consistent UI patterns for complex metrics display. The utility-focused nature demands systematic approach over aesthetic experimentation.

**Key Design Principles:**
- Data clarity above all - every metric must be instantly scannable
- Professional credibility through systematic layouts and precise typography
- Purposeful hierarchy that guides users from headline prediction to supporting evidence
- Sport-specific visual differentiation without overwhelming the core data

---

## Typography

**Font Families:**
- Primary: Inter (Google Fonts) - for all UI text, labels, and body content
- Monospace: JetBrains Mono (Google Fonts) - for all numerical data, odds, percentages, scores

**Type Scale & Hierarchy:**
- **Page Headers:** 3xl (36px) / font-bold / tracking-tight
- **Section Headers:** 2xl (24px) / font-semibold / tracking-tight
- **Card Titles:** xl (20px) / font-semibold
- **Subsection Labels:** base (16px) / font-medium / uppercase / tracking-wide
- **Primary Metrics:** 4xl-5xl (36-48px) / font-bold / monospace
- **Secondary Metrics:** 2xl (24px) / font-semibold / monospace
- **Body Text:** base (16px) / font-normal / line-height-relaxed
- **Small Labels:** sm (14px) / font-medium
- **Micro Text:** xs (12px) / font-normal

**Critical Rule:** All numerical values (odds, percentages, probabilities, scores, stakes) must use monospace font for alignment and scannability.

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 or p-8
- Section spacing: mb-8 or mb-12
- Card gaps: gap-6
- Tight groupings: gap-2 or gap-4
- Major section breaks: mt-16 or mt-20

**Grid Structure:**
- **Main Dashboard:** 12-column grid (grid-cols-12)
- **Primary Content Area:** col-span-8 (left two-thirds)
- **Sidebar/Secondary:** col-span-4 (right one-third)
- **Metrics Grid:** grid-cols-2 md:grid-cols-4 for stat displays
- **Sport Filters:** grid-cols-4 for equal-width sport cards

**Container Strategy:**
- Maximum width: max-w-7xl (1280px)
- Page padding: px-6 md:px-8 lg:px-12
- Full viewport height sections where appropriate for dashboard feel

---

## Component Library

### A. Navigation & Controls

**Top Navigation Bar:**
- Fixed header: h-16, border-b treatment
- Logo/brand: left-aligned with icon + text
- Sport filter tabs: centered, icon + label, active state with border-b-2
- Utility actions: right-aligned (refresh, settings, notifications)

**Sport Filter Cards:**
- Equal-width cards in 4-column grid
- Each card: icon (size-12), sport name, active indicator
- Hover state: subtle elevation/border treatment
- Active state: distinct border/accent treatment

### B. Data Display Components

**Apex Pick Card (Hero Component):**
- Large prominent card: p-8, rounded-lg
- Header section: sport icon, match details, timestamp
- Primary metrics: displayed in 3-4 column grid
  - Bet type: xl text
  - Odds: 5xl monospace, highly prominent
  - Edge (EV%): 4xl monospace with indicator icon
  - Confidence: 4xl monospace with progress bar below
- Visual hierarchy: odds are the largest element, confidence second

**Metrics Display Grid:**
- 2x2 or 4-column layout for key metrics
- Each metric cell:
  - Label: uppercase, xs-sm, tracking-wide
  - Value: 2xl-3xl, monospace, font-bold
  - Optional sublabel: xs text below value
- Border-right between columns (except last)

**Progress Indicators:**
- Used for: Confidence Score, Prediction Stability, Liquidity
- Height: h-2
- Rounded: rounded-full
- Segmented for scores (0-25, 25-50, 50-75, 75-100)
- Value label above: monospace

**Risk Assessment Panel:**
- Tabbed interface or accordion for: VaR/CVaR, Sensitivity, Adversarial, Black Swan
- Each section: icon, title, risk level indicator, detailed breakdown
- Risk level: badge component (sm, rounded-full, px-3, py-1)

### C. Content Sections

**Justification Section:**
- Multi-level disclosure/accordion pattern
- Summary: p-6 background panel, text-lg
- Deep Dive: bulleted list with icon bullets, pl-6, space-y-3
- Each bullet: icon (checkmark, arrow, etc.), bold key term, detailed explanation
- Competitive Edge: highlighted panel with border-l-4, pl-4, distinct treatment
- Explainability Score: circular progress with center value (e.g., "9/10")

**Market Analysis Table:**
- Dense data table: border, rounded corners
- Headers: sticky, font-semibold, border-b-2
- Cells: py-3, px-4, monospace for numbers
- Alternating row treatment for readability
- Color-coded cells for liquidity (High/Medium/Low)

**Contingency Pick Card:**
- Smaller secondary card: p-6
- Clearly labeled "Contingency Pick"
- Compact metrics layout: 3-column grid
- Trigger conditions: italic text, pl-4, border-l treatment

### D. Charts & Visualizations

**Probability Distribution Chart:**
- Canvas element: h-64
- X-axis: probability range, Y-axis: frequency/density
- Clear axis labels, grid lines, legend
- Ensemble average line with confidence interval shading

**Historical Performance Chart:**
- Line or area chart: h-48
- Time-series display of prediction accuracy
- Multiple series for different sports/models
- Interactive tooltips on hover

**Confidence Interval Visualization:**
- Horizontal bar with range markers
- Point estimate clearly marked
- 95% confidence range shaded
- Numeric labels at key points

---

## Page Structure

### Dashboard Layout

**Header Section (Fixed):**
- Navigation bar as described
- Sport filter tabs directly below

**Main Content Area:**
- Left Column (col-span-8):
  - Apex Pick Card (hero, full width)
  - Market Analysis section below
  - Justification section (collapsible/expandable)
  - Risk Assessment panels

- Right Sidebar (col-span-4):
  - Contingency Pick card at top
  - Quick Metrics summary
  - Historical Performance mini-chart
  - Recent Predictions feed (scrollable)

**Footer:**
- Minimal: legal disclaimers, timestamp of last update, system status indicator

---

## Responsive Behavior

**Desktop (lg and above):**
- Full 12-column layout as described
- All charts at maximum size
- Side-by-side metric comparisons

**Tablet (md):**
- Stack to single column where needed
- Maintain 2-column metric grids
- Reduce chart heights slightly

**Mobile:**
- Full single-column stack
- Apex Pick metrics: 2-column grid (not 4)
- Simplified navigation: hamburger menu
- Collapsible sections default to collapsed
- Sticky header with sport selector

---

## Images

**No large hero image required** - this is a data-focused dashboard where information density is the priority. The "hero" is the Apex Pick Card itself with its prominent metrics.

**Icon Usage:**
- Sport icons: Use Font Awesome for football, tennis, basketball, hockey (size-8 to size-12)
- Status icons: Heroicons for check marks, warnings, arrows, trends
- All icons from CDN, no custom SVGs

**Optional Small Graphics:**
- Team/league logos if available from API (size-8 to size-10, rounded)
- Sport-specific background patterns (very subtle, watermark-style) in sport filter cards

---

## Interaction Patterns

**State Changes:**
- Loading states: skeleton screens for metrics, pulse animation
- Empty states: centered message with icon, suggestion to refresh
- Error states: alert banner at top, retry action

**Micro-interactions:**
- Metric cards: subtle scale on hover (scale-105)
- Buttons: standard elevation increase, no elaborate animations
- Chart tooltips: appear on hover with precise values
- Expandable sections: smooth height transition (duration-200)

**No distracting animations** - all transitions serve functional purpose of indicating state change or providing feedback.

---

## Accessibility

- All numerical metrics have proper labels for screen readers
- Color not sole indicator of risk levels - use icons + text
- Keyboard navigation for all interactive elements
- Focus states clearly visible on all controls
- Sufficient contrast ratios (WCAG AA minimum)
- Monospace numbers align for screen reader number announcement