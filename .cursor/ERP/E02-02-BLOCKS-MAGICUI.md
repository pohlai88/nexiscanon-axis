# E02-02: Magic UI Components Discovery

> Applies on top of `E02-BLOCKS.md`. Delta-only additions from Magic UI registry.

## Overview

Magic UI specializes in **animation-first components** that add visual polish and interactivity to landing pages, marketing sites, and dashboards. Unlike ShadcnStudio (layout blocks), Magic UI focuses on **micro-interactions, effects, and animations**.

## Source

- **MCP Server**: `user-@magicuidesign/mcp`
- **Tools**: `getComponents`, `getBackgrounds`, `getTextAnimations`, `getButtons`, `getSpecialEffects`, `getUIComponents`, `getAnimations`, `getDeviceMocks`
- **Install**: `npx shadcn@latest add "https://magicui.design/r/{component}.json"`

---

## Component Categories

### 1. Background Effects (8 components) 🎨

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **warp-background** | Time warping 3D grid effect | Hero sections, feature highlights |
| **flickering-grid** | Canvas-based flickering grid | Dashboard backgrounds |
| **animated-grid-pattern** | SVG grid with animated squares | Landing pages |
| **retro-grid** | Scrolling perspective grid | Marketing hero |
| **ripple** | Expanding circle ripples | CTAs, focus states |
| **dot-pattern** | Animated dot background | Subtle page backgrounds |
| **grid-pattern** | Static SVG grid | Documentation, cards |
| **interactive-grid-pattern** | Hover-reactive grid | Interactive demos |

### 2. Text Animations (16 components) ✨

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **text-animate** | Multi-style text animations | Hero headlines |
| **line-shadow-text** | Moving line shadow effect | Feature titles |
| **aurora-text** | Aurora borealis gradient | Premium features |
| **number-ticker** | Animated number counter | KPIs, stats |
| **animated-shiny-text** | Shimmering text glare | Announcements |
| **animated-gradient-text** | Color-shifting gradient | Highlights |
| **text-reveal** | Scroll-triggered reveal | Long-form content |
| **hyper-text** | Scrambling letter effect | Tech/hacker aesthetic |
| **word-rotate** | Vertical word cycling | Taglines |
| **typing-animation** | Typewriter effect | Code demos, chat |
| **scroll-based-velocity** | Speed-based scrolling text | Marquees |
| **flip-text** | 3D flip animation | Toggles, switches |
| **box-reveal** | Box wipe reveal | Section intros |
| **sparkles-text** | Animated star sparkles | Celebrations |
| **morphing-text** | Text morphing between words | Dynamic labels |
| **spinning-text** | Circular spinning text | Badges, logos |

### 3. Interactive Components (19 components) 🖱️

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **marquee** | Infinite scrolling content | Partner logos, testimonials |
| **terminal** | Terminal/CLI mockup | Developer docs |
| **hero-video-dialog** | Video with dialog trigger | Product demos |
| **bento-grid** | Flexible feature grid | Feature showcase |
| **animated-list** | Sequenced list animations | Notifications, feeds |
| **dock** | macOS-style dock | App launchers |
| **globe** | Interactive 3D WebGL globe | Global presence |
| **tweet-card** | Twitter/X embed card | Social proof |
| **orbiting-circles** | Circular orbit animation | Tech integrations |
| **avatar-circles** | Overlapping avatar stack | Team/users |
| **icon-cloud** | 3D tag cloud | Tech stack |
| **animated-circular-progress** | Animated progress ring | Dashboards |
| **file-tree** | Directory structure | Documentation |
| **code-comparison** | Diff viewer | Before/after |
| **scroll-progress** | Page scroll indicator | Long pages |
| **lens** | Zoom/magnify effect | Product images |
| **pointer** | Custom cursor effects | Interactive demos |
| **smooth-cursor** | Physics-based cursor | Premium UX |
| **progressive-blur** | Scroll blur gradient | Overflow indicators |

### 4. Button Effects (6 components) 🔘

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **shimmer-button** | Traveling light perimeter | Primary CTAs |
| **shiny-button** | Dynamic shine effect | Secondary CTAs |
| **rainbow-button** | Animated rainbow border | Special actions |
| **interactive-hover-button** | Expanding hover effect | Navigation |
| **pulsating-button** | Attention pulse | Urgent actions |
| **ripple-button** | Click ripple effect | All buttons |

### 5. Special Effects (8 components) ⚡

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **particles** | Floating particle system | Hero backgrounds |
| **meteors** | Meteor shower effect | Special events |
| **border-beam** | Traveling border light | Card highlights |
| **animated-beam** | Path-following beam | Integration diagrams |
| **shine-border** | Animated border glow | Focus states |
| **confetti** | Celebration particles | Success states |
| **cool-mode** | Click-to-spawn particles | Gamification |
| **light-rays** | Animated light beams | Premium features |

### 6. Device Mockups (3 components) 📱

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **safari** | Safari browser frame | App screenshots |
| **iphone** | iPhone device frame | Mobile demos |
| **android** | Android device frame | Mobile demos |

### 7. Cards & Containers (3 components) 🃏

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **magic-card** | Spotlight border effect | Feature cards |
| **neon-gradient-card** | Neon glow container | Premium features |
| **blur-fade** | Blur in/out animation | Page transitions |

### 8. Miscellaneous (5 components) 🎯

| Component | Description | ERP Use Case |
|-----------|-------------|--------------|
| **video-text** | Video-backed text | Hero headlines |
| **pixel-image** | Pixelated image effect | Retro aesthetic |
| **highlighter** | Hand-drawn highlight | Emphasis |
| **animated-theme-toggler** | Theme switch animation | Dark mode |
| **dotted-map** | Geographic dot map | Location display |

---

## Implementation Priority for AXIS ERP

### 🔴 HIGH Priority (Marketing & Landing Pages)

| Component | Why |
|-----------|-----|
| **blur-fade** | Universal page transition effect |
| **number-ticker** | Dashboard KPIs, stats |
| **marquee** | Partner logos, testimonials |
| **animated-list** | Notification feeds |
| **typing-animation** | AI/chat features |
| **shimmer-button** | Premium CTA styling |

### 🟡 MEDIUM Priority (Enhanced UX)

| Component | Why |
|-----------|-----|
| **text-animate** | Hero headlines |
| **animated-circular-progress** | Dashboard widgets |
| **confetti** | Success celebrations |
| **border-beam** | Card highlights |
| **particles** | Hero backgrounds |
| **grid-pattern** | Section backgrounds |

### 🟢 LOW Priority (Nice to Have)

| Component | Why |
|-----------|-----|
| **globe** | Global presence display |
| **terminal** | Developer documentation |
| **safari/iphone** | Screenshot mockups |
| **icon-cloud** | Tech stack display |
| **magic-card** | Premium feature cards |

---

## Integration Strategy

### Key Insight: Registry Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REGISTRY ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   @shadcn (ui.shadcn.com/r/)                                                │
│   └── 438 items: components, blocks, examples                                │
│       └── Base UI: button, card, dialog, sidebar, etc.                       │
│       └── Blocks: dashboard-01, sidebar-01...17, login-01...05              │
│       └── Charts: 79 chart variants                                          │
│       └── Calendars: 27 calendar variants                                    │
│                                                                              │
│   @magicui (magicui.design/r/)                                              │
│   └── ~70 items: animations, effects, special components                     │
│       └── Built ON TOP of shadcn patterns                                    │
│       └── Uses same cn() utility                                             │
│       └── Requires: motion (framer-motion successor)                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Installation Methods

#### Method 1: Direct from Magic UI Registry (Recommended for new installs)

```bash
# Install individual components from Magic UI
npx shadcn@latest add "https://magicui.design/r/blur-fade.json"
npx shadcn@latest add "https://magicui.design/r/number-ticker.json"
npx shadcn@latest add "https://magicui.design/r/marquee.json"
```

**Note:** This installs to `components/ui/` by default. For monorepo, redirect to design-system.

#### Method 2: Using MCP for Code Access (Best for customization)

```typescript
// Get component code via MCP
CallMcpTool({
  server: "user-@magicuidesign/mcp",
  toolName: "getAnimations",  // or getBackgrounds, getTextAnimations, etc.
  arguments: {}
})
```

Then adapt and place in `packages/design-system/src/effects/`.

#### Method 3: Hybrid (Recommended for AXIS)

1. **Create `packages/design-system/src/effects/`** folder
2. Use MCP to get component code
3. Adapt imports: `@/lib/utils` → `@workspace/design-system/lib/utils`
4. Export from `@workspace/design-system/effects`

```tsx
// Usage in apps
import { BlurFade, NumberTicker, Marquee } from "@workspace/design-system/effects"
```

### Optimization: Maximize Value from Both Registries

#### From Shadcn Registry (@shadcn) - We Have Most

| Category | Available | We Have | Gap |
|----------|-----------|---------|-----|
| Components | 56 | 54 | ✅ 96% |
| Sidebars | 17 | 17 | ✅ 100% |
| Charts | 79 | 30 | 🟡 38% |
| Calendars | 27 | 10 | 🟡 37% |
| Login Forms | 5 | 5 | ✅ 100% |

#### From Magic UI Registry (@magicui) - Unique Value

| Category | Available | We Have | Priority |
|----------|-----------|---------|----------|
| Text Animations | 16 | 0 | 🔴 HIGH |
| Backgrounds | 8 | 0 | 🔴 HIGH |
| Special Effects | 8 | 0 | 🟡 MEDIUM |
| Buttons | 6 | 0 | 🟡 MEDIUM |
| Device Mocks | 3 | 0 | 🟢 LOW |

---

## Dependencies

Magic UI components require:

| Package | Version | Purpose |
|---------|---------|---------|
| **motion** (motion/react) | ^11.x | Animation library (formerly framer-motion) |
| **@radix-ui/react-slot** | ^1.x | Polymorphic components |
| **clsx / tailwind-merge** | — | Already have via cn() |

---

## Key Differences: Magic UI vs ShadcnStudio

| Aspect | Magic UI | ShadcnStudio |
|--------|----------|--------------|
| **Focus** | Animations & effects | Layout blocks |
| **Components** | ~70 effects | ~40 blocks |
| **Use Case** | Marketing, landing pages | Dashboard, ERP |
| **Dependencies** | motion/react | Minimal |
| **Overlap** | Bento Grid | Dashboard layouts |

---

## Recommended First Batch (6 components)

These provide maximum impact for AXIS with minimal effort:

1. **blur-fade** - Universal transition
2. **number-ticker** - KPI animations
3. **marquee** - Logo scrollers
4. **typing-animation** - AI features
5. **confetti** - Success states
6. **shimmer-button** - Premium CTAs

---

## MCP Usage Examples

```typescript
// Get all background components
CallMcpTool({
  server: "user-@magicuidesign/mcp",
  toolName: "getBackgrounds",
  arguments: {}
})

// Get specific component details
CallMcpTool({
  server: "user-@magicuidesign/mcp",
  toolName: "getTextAnimations",
  arguments: {}
})
```

---

## Summary Statistics

| Category | Components | Status |
|----------|------------|--------|
| Backgrounds | 8 | Available |
| Text Animations | 16 | Available |
| Interactive | 19 | Available |
| Buttons | 6 | Available |
| Special Effects | 8 | Available |
| Device Mockups | 3 | Available |
| Cards | 3 | Available |
| Misc | 5 | Available |
| **TOTAL** | **~70** | Available via MCP |

---

## ✅ Implemented Components

### Phase 1 (HIGH Priority)

| Component | Location | Description |
|-----------|----------|-------------|
| `BlurFade` | `effects/blur-fade.tsx` | Universal fade transition |
| `NumberTicker` | `effects/number-ticker.tsx` | Animated number counter |
| `Marquee` | `effects/marquee.tsx` | Infinite scrolling content |
| `AnimatedList` | `effects/animated-list.tsx` | Sequenced list animations |
| `TypingAnimation` | `effects/typing-animation.tsx` | Typewriter effect |
| `ShimmerButton` | `effects/shimmer-button.tsx` | Traveling light button |
| `Confetti` | `effects/confetti.tsx` | Celebration particles |
| `BorderBeam` | `effects/border-beam.tsx` | Traveling border light |
| `TextAnimate` | `effects/text-animate.tsx` | Multi-style text animations |
| `GridPattern` | `effects/grid-pattern.tsx` | SVG grid background |
| `DotPattern` | `effects/dot-pattern.tsx` | Animated dot background |

### Phase 2 (MEDIUM Priority)

| Component | Location | Description |
|-----------|----------|-------------|
| `Particles` | `effects/particles.tsx` | Floating particle system |
| `MagicCard` | `effects/magic-card.tsx` | Spotlight border effect |
| `AnimatedCircularProgress` | `effects/animated-circular-progress.tsx` | Animated progress ring |
| `Ripple` | `effects/ripple.tsx` | Expanding ripple effect |
| `RetroGrid` | `effects/retro-grid.tsx` | Scrolling perspective grid |
| `AvatarCircles` | `effects/avatar-circles.tsx` | Overlapping avatar stack |
| `AnimatedShinyText` | `effects/animated-shiny-text.tsx` | Shimmering text glare |
| `AnimatedGradientText` | `effects/animated-gradient-text.tsx` | Color-shifting gradient |

### Phase 3 (Additional Components)

| Component | Location | Description |
|-----------|----------|-------------|
| `WordRotate` | `effects/word-rotate.tsx` | Vertical word cycling |
| `OrbitingCircles` | `effects/orbiting-circles.tsx` | Circular orbit animation |
| `ShineBorder` | `effects/shine-border.tsx` | Animated border glow |
| `ScrollProgress` | `effects/scroll-progress.tsx` | Page scroll indicator |

### Phase 4 (Device Mocks & Layout)

| Component | Location | Description |
|-----------|----------|-------------|
| `Terminal` | `effects/terminal.tsx` | Dev documentation display |
| `Safari` | `effects/safari.tsx` | Browser screenshot mock |
| `HeroVideoDialog` | `effects/hero-video-dialog.tsx` | Video showcase modal |
| `BentoGrid` | `effects/bento-grid.tsx` | Feature layout grid |
| `Dock` | `effects/dock.tsx` | macOS-style dock navigation |

### Usage

```tsx
import {
  // Phase 1 - HIGH Priority
  BlurFade,
  NumberTicker,
  Marquee,
  AnimatedList,
  TypingAnimation,
  ShimmerButton,
  Confetti,
  BorderBeam,
  TextAnimate,
  GridPattern,
  DotPattern,
  // Phase 2 - MEDIUM Priority
  Particles,
  MagicCard,
  AnimatedCircularProgress,
  Ripple,
  RetroGrid,
  AvatarCircles,
  AnimatedShinyText,
  AnimatedGradientText,
  // Phase 3 - Additional
  WordRotate,
  OrbitingCircles,
  ShineBorder,
  ScrollProgress,
  // Phase 4 - Device Mocks & Layout
  Terminal,
  AnimatedSpan,
  Safari,
  HeroVideoDialog,
  BentoGrid,
  BentoCard,
  Dock,
  DockIcon,
} from "@workspace/design-system"
```

---

## Next Steps

1. ~~**Validate `motion` package**~~ ✅ Installed
2. ~~**Create effects folder**~~ ✅ `packages/design-system/src/effects/`
3. ~~**Implement HIGH priority**~~ ✅ 11 components
4. **Implement MEDIUM priority** - particles, animated-circular-progress, magic-card
5. **Document patterns** - Update E03-IMPLEMENTATION.md

---

## References

- Parent: `E02-BLOCKS.md`
- Sibling: `E02-01-BLOCKS-SHADCNSTUDIO.md`
- MCP Server: `user-@magicuidesign/mcp`
- Registry: https://magicui.design/r/
