# E02-03: Aceternity UI Components

> Status: **Active** | Priority: **HIGH**
> Source: [ui.aceternity.com](https://ui.aceternity.com)

---

## Overview

Aceternity UI provides premium visual effects and 3D components that complement Magic UI.
While Magic UI focuses on animation-first interactions, Aceternity specializes in:

- **Premium backgrounds** (Aurora, Spotlight, Vortex)
- **3D effects** (3D Card, 3D Pin, Wobble Card)
- **Scroll-based animations** (Tracing Beam, Macbook Scroll)
- **Navigation components** (Floating Navbar, Floating Dock)

---

## Registry Integration

### Configuration

```json
// components.json
{
  "registries": {
    "@aceternity": "https://ui.aceternity.com/registry/{name}.json"
  }
}
```

### CLI Installation

```bash
npx shadcn@latest add "https://ui.aceternity.com/registry/{component}.json"
```

### API Access

```powershell
Invoke-RestMethod -Uri "https://ui.aceternity.com/registry/{component}.json"
```

---

## Implemented Components

### Phase 1 (HIGH Priority) - ✅ COMPLETE

| Component | Location | Description |
|-----------|----------|-------------|
| `AuroraBackground` | `effects/aurora-background.tsx` | Northern lights effect |
| `Spotlight` | `effects/spotlight.tsx` | Animated spotlight beams |
| `WobbleCard` | `effects/wobble-card.tsx` | Interactive wobble effect |
| `TracingBeam` | `effects/tracing-beam.tsx` | Scroll-following beam |

### Usage

```tsx
import {
  AuroraBackground,
  Spotlight,
  WobbleCard,
  TracingBeam,
} from "@workspace/design-system"

// Hero section with aurora
<AuroraBackground>
  <Spotlight />
  <h1>Welcome to the Future</h1>
</AuroraBackground>

// Feature card with wobble
<WobbleCard>
  <h3>Premium Feature</h3>
  <p>Description here</p>
</WobbleCard>

// Documentation with tracing beam
<TracingBeam>
  <article>
    <h2>Getting Started</h2>
    <p>Content flows with the beam...</p>
  </article>
</TracingBeam>
```

---

## Component Catalog (90+ Available)

### Backgrounds & Effects (25)

| Component | Status | Notes |
|-----------|--------|-------|
| `aurora-background` | ✅ Implemented | Hero sections |
| `spotlight-new` | ✅ Implemented | Feature emphasis |
| `sparkles` | ⏳ Requires @tsparticles | Heavy dependency |
| `background-beams` | 🔲 Available | SVG beam paths |
| `background-boxes` | 🔲 Available | Hoverable boxes |
| `meteors` | 🔲 Available | Falling meteors |
| `vortex` | 🔲 Available | Wavy vortex |
| `wavy-background` | 🔲 Available | CSS waves |

### Card Components (15)

| Component | Status | Notes |
|-----------|--------|-------|
| `wobble-card` | ✅ Implemented | Mouse-following wobble |
| `3d-card-effect` | 🔲 Available | Perspective tilt |
| `evervault-card` | 🔲 Available | Encryption effect |
| `glare-card` | 🔲 Available | Linear-style glare |
| `card-spotlight` | 🔲 Available | Radial spotlight |

### Scroll & Parallax (5)

| Component | Status | Notes |
|-----------|--------|-------|
| `tracing-beam` | ✅ Implemented | SVG scroll beam |
| `macbook-scroll` | 🔲 Available | Fey.com style |
| `parallax-scroll` | 🔲 Available | Grid parallax |
| `sticky-scroll-reveal` | 🔲 Available | Content reveal |

### Text Components (10)

| Component | Status | Notes |
|-----------|--------|-------|
| `flip-words` | 🔲 Available | Word flip animation |
| `text-generate-effect` | 🔲 Available | Character fade-in |
| `typewriter-effect` | 🔲 Available | (Similar to Magic UI) |
| `encrypted-text` | 🔲 Available | Gibberish reveal |

### Navigation (7)

| Component | Status | Notes |
|-----------|--------|-------|
| `floating-navbar` | 🔲 Available | Hide/show on scroll |
| `floating-dock` | 🔲 Available | macOS dock |
| `resizable-navbar` | 🔲 Available | Width changes on scroll |
| `sidebar` | 🔲 Available | Expandable sidebar |

### Data Visualization (5)

| Component | Status | Notes |
|-----------|--------|-------|
| `github-globe` | 🔲 Available | WebGL globe |
| `world-map` | 🔲 Available | Animated world map |
| `timeline` | 🔲 Available | Sticky header timeline |

---

## Comparison: Aceternity vs Magic UI

| Aspect | Aceternity UI | Magic UI |
|--------|--------------|----------|
| **Focus** | Premium visuals, 3D | Animation-first |
| **Components** | 90+ | 50+ |
| **Backgrounds** | 25 (richer) | 8 |
| **3D Effects** | Yes (3D Pin, Card) | Limited |
| **Dependencies** | motion, @tsparticles | motion |
| **MCP** | No | Yes ✅ |

---

## Design System Status

| Source | Base | Blocks | Effects |
|--------|------|--------|---------|
| Shadcn | 54 | — | — |
| ShadcnStudio | — | 109 | — |
| Magic UI | — | — | 28 |
| **Aceternity** | — | — | **4** |
| **TOTAL** | **54** | **109** | **32** |

---

## Next Steps

### Phase 2 (MEDIUM Priority)

- [ ] `background-beams` - SVG beam animations
- [ ] `3d-card-effect` - Perspective tilt card
- [ ] `glare-card` - Linear-style glare effect
- [ ] `floating-navbar` - Hide/show navigation

### Phase 3 (LOW Priority)

- [ ] `github-globe` - WebGL globe (complex)
- [ ] `macbook-scroll` - Product showcase
- [ ] `timeline` - Documentation timelines

---

## References

- [Aceternity UI Documentation](https://ui.aceternity.com/docs/cli)
- [Component Registry](https://ui.aceternity.com/registry/{name}.json)
- [Shadcn CLI 3.0](https://ui.shadcn.com/docs/cli)
