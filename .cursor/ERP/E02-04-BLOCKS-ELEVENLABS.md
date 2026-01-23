# E02-04: ElevenLabs UI Components

> Status: **Active** | Priority: **HIGH**
> Source: [ui.elevenlabs.io](https://ui.elevenlabs.io)

---

## Overview

ElevenLabs UI provides components specialized for AI/voice agent interfaces.
We've adapted the most valuable components for general use without requiring the ElevenLabs SDK.

**Focus Areas:**
- AI loading/thinking indicators
- Chat/conversation interfaces
- Voice interaction UI elements

---

## Registry Integration

### CLI Installation (Full Components)

```bash
# Install all ElevenLabs components
npx shadcn@latest add https://ui.elevenlabs.io/r/all.json

# Install specific component
npx shadcn@latest add https://ui.elevenlabs.io/r/shimmering-text.json
```

### Our Adaptation

We've created standalone versions that don't require `@elevenlabs/react` SDK:
- No external API dependencies
- Compatible with any AI backend
- Lighter bundle size

---

## Implemented Components

### AI/Loading States

| Component | Location | Description |
|-----------|----------|-------------|
| `ShimmeringText` | `effects/shimmering-text.tsx` | Animated shimmer text effect |

### Chat Components

| Component | Location | Description |
|-----------|----------|-------------|
| `ChatMessage` | `effects/chat-message.tsx` | Message container |
| `ChatMessageContent` | `effects/chat-message.tsx` | Message bubble |
| `ChatMessageAvatar` | `effects/chat-message.tsx` | User/AI avatar |
| `ChatMessageTimestamp` | `effects/chat-message.tsx` | Time display |
| `ChatMessageGroup` | `effects/chat-message.tsx` | Consecutive messages |
| `ChatInput` | `effects/chat-input.tsx` | Auto-resize input |
| `ChatInputContainer` | `effects/chat-input.tsx` | Sticky positioning |

---

## Usage

### ShimmeringText - AI Thinking Indicator

```tsx
import { ShimmeringText } from "@workspace/design-system"

// Basic usage
<ShimmeringText text="AI is thinking..." />

// Customized
<ShimmeringText
  text="Generating response..."
  duration={1.5}
  delay={0.2}
  repeat={true}
  shimmerColor="#3b82f6"
/>
```

### Chat Interface

```tsx
import {
  ChatMessage,
  ChatMessageContent,
  ChatMessageAvatar,
  ChatMessageTimestamp,
  ChatInput,
  ChatInputContainer,
} from "@workspace/design-system"

// User message
<ChatMessage from="user">
  <ChatMessageContent variant="contained">
    Hello, I need help with my order.
  </ChatMessageContent>
  <ChatMessageAvatar name="John" src="/avatars/user.png" />
</ChatMessage>

// AI response
<ChatMessage from="assistant">
  <ChatMessageAvatar name="AI" src="/avatars/ai.png" />
  <ChatMessageContent variant="flat">
    I'd be happy to help! Could you share your order number?
    <ChatMessageTimestamp time={new Date()} />
  </ChatMessageContent>
</ChatMessage>

// Chat input
<ChatInputContainer sticky>
  <ChatInput
    placeholder="Ask me anything..."
    onSubmit={(message) => handleSend(message)}
    isLoading={isSending}
    showMicButton
    onMicClick={toggleVoice}
  />
</ChatInputContainer>
```

### ChatMessageContent Variants

```tsx
// Contained (default) - solid background
<ChatMessageContent variant="contained">...</ChatMessageContent>

// Flat - minimal for AI responses
<ChatMessageContent variant="flat">...</ChatMessageContent>

// Outline - bordered style
<ChatMessageContent variant="outline">...</ChatMessageContent>
```

---

## Component API

### ShimmeringText Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | Text to display |
| `duration` | `number` | `2` | Animation duration (seconds) |
| `delay` | `number` | `0` | Start delay |
| `repeat` | `boolean` | `true` | Loop animation |
| `repeatDelay` | `number` | `0.5` | Pause between loops |
| `startOnView` | `boolean` | `true` | Trigger on viewport entry |
| `spread` | `number` | `2` | Shimmer width multiplier |
| `color` | `string` | — | Base text color |
| `shimmerColor` | `string` | — | Shimmer gradient color |

### ChatInput Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(message: string) => void` | — | Submit callback |
| `isLoading` | `boolean` | `false` | Loading state |
| `showMicButton` | `boolean` | `false` | Show voice button |
| `isMicActive` | `boolean` | `false` | Mic active state |
| `onMicClick` | `() => void` | — | Mic button callback |
| `placeholder` | `string` | `"Type a message..."` | Input placeholder |
| `maxLength` | `number` | — | Character limit |
| `autoResize` | `boolean` | `true` | Auto-grow textarea |
| `minRows` | `number` | `1` | Minimum rows |
| `maxRows` | `number` | `5` | Maximum rows |

---

## Skipped Components (Require ElevenLabs SDK)

| Component | Reason |
|-----------|--------|
| `Orb` | Requires WebGL + ElevenLabs real-time API |
| `LiveWaveform` | Tied to ElevenLabs voice streaming |
| `ConversationBar` | Uses `@elevenlabs/react` hooks |
| `VoicePicker` | Requires ElevenLabs voice catalog |
| `Response` | Needs `streamdown` library |

These can be installed directly via the ElevenLabs CLI if needed:
```bash
npx @elevenlabs/cli@latest components add orb
```

---

## Design System Status

| Source | Components | Blocks | Effects |
|--------|------------|--------|---------|
| Shadcn Base | 54 | — | — |
| ShadcnStudio | — | 109 | — |
| Magic UI | — | — | 28 |
| Aceternity | — | — | 4 |
| **ElevenLabs** | — | — | **3** (8 exports) |
| **TOTAL** | **54** | **109** | **35** |

---

## References

- [ElevenLabs UI Documentation](https://ui.elevenlabs.io)
- [GitHub Repository](https://github.com/elevenlabs/ui)
- [Component Registry](https://ui.elevenlabs.io/r/{name}.json)
