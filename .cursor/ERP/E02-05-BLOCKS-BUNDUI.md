# E02-05: Bundui Components

> Status: **Active** | Priority: **HIGH**
> Source: [bundui.io](https://bundui.io) | [GitHub](https://github.com/bundui/components)

---

## Overview

Bundui provides 95+ components and blocks built on Tailwind CSS and Motion.
We've integrated the most valuable unique effects not covered by other sources.

**Focus Areas:**
- Image comparison (before/after)
- Interactive button effects
- Number animations
- Text morphing

---

## Implemented Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ImageComparison` | `effects/image-comparison.tsx` | Before/after slider |
| `ImageComparisonImage` | `effects/image-comparison.tsx` | Left/right image |
| `ImageComparisonSlider` | `effects/image-comparison.tsx` | Draggable divider |
| `ImageComparisonLabel` | `effects/image-comparison.tsx` | Position labels |
| `MagneticButton` | `effects/magnetic-button.tsx` | Cursor-following effect |
| `MagneticContainer` | `effects/magnetic-button.tsx` | Group magnetic elements |
| `SlidingNumber` | `effects/sliding-number.tsx` | Slot machine digits |
| `Countdown` | `effects/sliding-number.tsx` | Countdown alias |
| `useCountdown` | `effects/sliding-number.tsx` | Countdown hook |
| `TextMorph` | `effects/text-morph.tsx` | SVG filter text morphing |
| `TextMorphAuto` | `effects/text-morph.tsx` | Auto-sizing variant |

---

## Usage

### ImageComparison - Before/After Slider

```tsx
import {
  ImageComparison,
  ImageComparisonImage,
  ImageComparisonSlider,
  ImageComparisonLabel,
} from "@workspace/design-system"

// Drag-based comparison
<ImageComparison className="aspect-video rounded-lg overflow-hidden">
  <ImageComparisonImage
    src="/before.jpg"
    alt="Before"
    position="left"
  />
  <ImageComparisonImage
    src="/after.jpg"
    alt="After"
    position="right"
  />
  <ImageComparisonSlider className="bg-white" />
  <ImageComparisonLabel position="left">Before</ImageComparisonLabel>
  <ImageComparisonLabel position="right">After</ImageComparisonLabel>
</ImageComparison>

// Hover-based comparison
<ImageComparison enableHover className="aspect-video rounded-lg">
  <ImageComparisonImage src="/v1.jpg" alt="Old" position="left" />
  <ImageComparisonImage src="/v2.jpg" alt="New" position="right" />
  <ImageComparisonSlider />
</ImageComparison>
```

### MagneticButton - Cursor Following

```tsx
import { MagneticButton, MagneticContainer, Button } from "@workspace/design-system"

// Single button
<MagneticButton distance={0.4}>
  <Button size="lg">Hover me</Button>
</MagneticButton>

// Navigation group
<MagneticContainer>
  <MagneticButton distance={0.3}>
    <a href="/about">About</a>
  </MagneticButton>
  <MagneticButton distance={0.3}>
    <a href="/contact">Contact</a>
  </MagneticButton>
</MagneticContainer>

// Disable on mobile
<MagneticButton disabled={isMobile}>
  <Button>CTA</Button>
</MagneticButton>
```

### SlidingNumber - Animated Digits

```tsx
import { SlidingNumber, Countdown, useCountdown } from "@workspace/design-system"

// Basic counter
<SlidingNumber value={1234} />

// Currency
<SlidingNumber value={99.99} prefix="$" decimalPlaces={2} />

// Percentage
<SlidingNumber value={85} suffix="%" />

// Clock display
<div className="flex items-center text-4xl font-mono">
  <SlidingNumber value={hours} padStart />
  <span>:</span>
  <SlidingNumber value={minutes} padStart />
  <span>:</span>
  <SlidingNumber value={seconds} padStart />
</div>

// Countdown timer
function CountdownTimer({ target }: { target: Date }) {
  const { days, hours, minutes, seconds } = useCountdown(target)
  
  return (
    <div className="flex gap-4 text-2xl">
      <div>
        <Countdown value={days} />
        <span className="text-sm">days</span>
      </div>
      <div>
        <Countdown value={hours} />
        <span className="text-sm">hours</span>
      </div>
      <div>
        <Countdown value={minutes} />
        <span className="text-sm">min</span>
      </div>
      <div>
        <Countdown value={seconds} />
        <span className="text-sm">sec</span>
      </div>
    </div>
  )
}
```

### TextMorph - Morphing Text

```tsx
import { TextMorph, TextMorphAuto } from "@workspace/design-system"

// Hero headline
<TextMorph
  texts={["Innovative", "Powerful", "Beautiful", "Fast"]}
  morphTime={2}
  cooldownTime={0.5}
  className="text-6xl font-bold"
/>

// Auto-sizing variant
<TextMorphAuto
  texts={["Build", "Ship", "Scale"]}
  className="text-4xl"
/>
```

---

## Component API

### ImageComparison Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableHover` | `boolean` | `false` | Use hover instead of drag |
| `springOptions` | `SpringOptions` | `{}` | Motion spring config |
| `initialPosition` | `number` | `50` | Initial slider position (0-100) |

### MagneticButton Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `distance` | `number` | `0.6` | Follow intensity (0-1) |
| `disabled` | `boolean` | `false` | Disable magnetic effect |

### SlidingNumber Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | required | Number to display |
| `padStart` | `boolean` | `false` | Pad with leading zero |
| `decimalSeparator` | `string` | `"."` | Decimal character |
| `decimalPlaces` | `number` | — | Fixed decimal places |
| `prefix` | `string` | — | Prefix (e.g., "$") |
| `suffix` | `string` | — | Suffix (e.g., "%") |

### TextMorph Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `texts` | `string[]` | required | Texts to cycle through |
| `morphTime` | `number` | `2.5` | Transition duration (s) |
| `cooldownTime` | `number` | `0.25` | Pause between transitions |

---

## Skipped Components (Already Have Similar)

| Bundui | Our Equivalent | Source |
|--------|----------------|--------|
| `marquee-effect` | `Marquee` | Magic UI |
| `ripple-effect` | `Ripple` | Magic UI |
| `scroll-progress-bar` | `ScrollProgress` | Magic UI |
| `count-animation` | `NumberTicker` | Magic UI |
| `animated-gradient-text` | `AnimatedGradientText` | Magic UI |

---

## Design System Status

| Source | Components | Blocks | Effects |
|--------|------------|--------|---------|
| Shadcn Base | 54 | — | — |
| ShadcnStudio | — | 109 | — |
| Magic UI | — | — | 28 |
| Aceternity | — | — | 4 |
| ElevenLabs | — | — | 3 |
| **Bundui** | — | — | **4** (11 exports) |
| **TOTAL** | **54** | **109** | **39** |

---

## References

- [Bundui Documentation](https://bundui.io)
- [GitHub Repository](https://github.com/bundui/components)
- MIT Licensed
