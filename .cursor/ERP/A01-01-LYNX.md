# A01-01 — Lynx: The Machine's Awareness
## Provider-Agnostic Intelligence Framework

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|            A01 Sub-Series            |
| :----------------------------------: |
|            **[A01-01]**              |
|               Lynx                   |

---

> **Parent Document:** [A01-CANONICAL.md](./A01-CANONICAL.md)
>
> **Sibling Document:** [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) (Vocabulary Law)
>
> **Tag:** `LYNX` | `MACHINE` | `INTELLIGENCE` | `CANONICAL`

---

## 🛑 DEV NOTE: Respect @axis/registry

> **See [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) for vocabulary law.**
> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for implementation roadmap.**

All Lynx schemas follow the **Single Source of Truth** pattern:

| Component                | Source                                                   |
| ------------------------ | -------------------------------------------------------- |
| Lynx Constants           | `@axis/registry/schemas/lynx/constants.ts`               |
| Lynx Provider            | `@axis/registry/schemas/lynx/provider.ts`                |
| Lynx Text Generation     | `@axis/registry/schemas/lynx/text-generation.ts`         |
| Lynx Embeddings          | `@axis/registry/schemas/lynx/embeddings.ts`              |
| Lynx Agent               | `@axis/registry/schemas/lynx/agent.ts`                   |
| Lynx Tool                | `@axis/registry/schemas/lynx/tool.ts`                    |
| Lynx Memory              | `@axis/registry/schemas/lynx/memory.ts`                  |
| Lynx Audit               | `@axis/registry/schemas/lynx/audit.ts`                   |
| Lynx Confidence          | `@axis/registry/schemas/lynx/confidence.ts`              |
| Lynx Access Policy       | `@axis/registry/schemas/lynx/access-policy.ts`           |
| Lynx Config              | `@axis/registry/schemas/lynx/config.ts`                  |
| Lynx Events              | `@axis/registry/schemas/events/lynx.ts`                  |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## Preamble

> *"You focus. The Machine works."*

Lynx is the canonical intelligence framework for AXIS — what users experience as **The Invisible Machine**. It defines how machine capabilities integrate with business operations — not as a black box, but as a transparent, auditable, provider-agnostic layer that amplifies human judgment without replacing human accountability.

> **Vocabulary Note:** In code, we say "Lynx". In documentation and UI, we say "The Machine". See [A01-07](./A01-07-THE-INVISIBLE-MACHINE.md) for the complete vocabulary law.

---

## Part I: The Lynx Philosophy

### §1 What Lynx Is

Lynx is the technical name for **The Machine's Awareness** — the invisible capability layer that notices, recalls, and governs.

Lynx is:
- **The Machine's abstraction layer** — A unified interface to any provider (OpenAI, Anthropic, Google, local models)
- **The Machine's orchestrator** — Coordinates embeddings, inference, agents, and memory
- **The Machine's safety boundary** — Ensures outputs are validated, auditable, and reversible
- **The Machine's bridge to humans** — Presents insights as suggestions, not decisions

Lynx is NOT:
- A replacement for human judgment in critical decisions
- An autonomous actor that modifies business data directly
- A vendor lock-in to any specific provider
- A black box that produces unexplainable outputs

### §2 The Five Pillars of Lynx

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE FIVE PILLARS OF LYNX                              │
│                                                                              │
│  ╔═══════════════════════════════════════════════════════════════════════╗  │
│  ║                                                                       ║  │
│  ║   1. PROVIDER AGNOSTIC                                                ║  │
│  ║      → Any model, any provider, same interface                        ║  │
│  ║      → No vendor lock-in, graceful fallback                           ║  │
│  ║                                                                       ║  │
│  ║   2. TRANSPARENT & AUDITABLE                                          ║  │
│  ║      → Every AI decision is logged with full context                  ║  │
│  ║      → Reasoning chains are preserved, not just outputs               ║  │
│  ║      → 100-year recall applies to AI interactions                     ║  │
│  ║                                                                       ║  │
│  ║   3. HUMAN-IN-THE-LOOP                                                ║  │
│  ║      → AI recommends, humans decide                                   ║  │
│  ║      → Critical actions require explicit approval                     ║  │
│  ║      → Override capability always available                           ║  │
│  ║                                                                       ║  │
│  ║   4. DOMAIN-AWARE                                                     ║  │
│  ║      → AI understands business context (ERP domains)                  ║  │
│  ║      → Respects domain boundaries (B02)                               ║  │
│  ║      → Leverages domain knowledge for better inference                ║  │
│  ║                                                                       ║  │
│  ║   5. SAFE BY DESIGN                                                   ║  │
│  ║      → Validation before action                                       ║  │
│  ║      → Graceful degradation when AI fails                             ║  │
│  ║      → No autonomous data modification                                ║  │
│  ║                                                                       ║  │
│  ╚═══════════════════════════════════════════════════════════════════════╝  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### §3 The Machine Oath

Every capability of The Machine must honor these invariants:

1. **The Machine will not modify business data without explicit human approval**
2. **The Machine will explain its reasoning, not just its conclusion**
3. **The Machine will declare its confidence level honestly**
4. **The Machine will degrade gracefully when uncertain**
5. **The Machine will respect domain boundaries and access controls**
6. **The Machine will leave an auditable trail of every interaction**
7. **The Machine will work with any provider the tenant chooses**

---

## Part II: Lynx Architecture

### §4 The Four Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          LYNX ARCHITECTURE                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      LAYER 4: APPLICATION                                ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                ││
│  │  │ Anomaly   │ │ Forecast  │ │ Document  │ │ Assistant │                ││
│  │  │ Detection │ │ Engine    │ │ Processor │ │ (Chat)    │                ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘                ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      LAYER 3: ORCHESTRATION                              ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                ││
│  │  │ Agent     │ │ Chain     │ │ Tool      │ │ Memory    │                ││
│  │  │ Runtime   │ │ Composer  │ │ Registry  │ │ Manager   │                ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘                ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      LAYER 2: CAPABILITIES                               ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                ││
│  │  │ Text      │ │ Embeddings│ │ Vision    │ │ Structured│                ││
│  │  │ Generation│ │           │ │           │ │ Output    │                ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘                ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      LAYER 1: PROVIDERS                                  ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐                ││
│  │  │ OpenAI    │ │ Anthropic │ │ Google    │ │ Local     │                ││
│  │  │           │ │ (Claude)  │ │ (Gemini)  │ │ (Ollama)  │                ││
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘                ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### §5 Layer 1: Provider Abstraction

```typescript
// The Provider Interface — All providers implement this
interface LynxProvider {
  id: string;
  name: string;
  capabilities: ProviderCapability[];
  
  // Text generation
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
  streamText(request: TextGenerationRequest): AsyncIterable<TextChunk>;
  
  // Embeddings
  generateEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  
  // Structured output
  generateObject<T>(request: ObjectGenerationRequest<T>): Promise<T>;
  
  // Vision (if supported)
  analyzeImage?(request: ImageAnalysisRequest): Promise<ImageAnalysisResponse>;
}

// Provider Registry — Hot-swappable providers
interface ProviderRegistry {
  register(provider: LynxProvider): void;
  get(id: string): LynxProvider;
  getDefault(): LynxProvider;
  listByCapability(capability: ProviderCapability): LynxProvider[];
}
```

**Provider Selection Strategy:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PROVIDER SELECTION STRATEGY                              │
│                                                                              │
│  Request ──▶ [Check Tenant Config] ──▶ [Check Capability] ──▶ [Select]      │
│                     │                         │                   │          │
│                     ▼                         ▼                   ▼          │
│              Preferred Provider?      Supports Capability?   Route Request   │
│              (tenant-level)           (text/embedding/vision)                │
│                     │                         │                   │          │
│                     └─────────────┬───────────┘                   │          │
│                                   ▼                               │          │
│                           Fallback Chain:                         │          │
│                           1. Primary (tenant)                     │          │
│                           2. Secondary (tenant)                   │          │
│                           3. Platform default                     │          │
│                           4. Error (no provider)                  │          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### §6 Layer 2: Core Capabilities

#### Text Generation

```typescript
interface TextGenerationRequest {
  // Model selection
  model?: string;              // Specific model or "auto"
  
  // Prompt
  system?: string;             // System prompt
  messages: Message[];         // Conversation history
  
  // Parameters
  temperature?: number;        // 0-1, default 0.7
  maxTokens?: number;          // Max response length
  
  // Safety
  safetyLevel?: "strict" | "balanced" | "permissive";
  
  // Structured output
  responseFormat?: "text" | "json" | "markdown";
  schema?: ZodSchema;          // For structured output
  
  // Context
  tenantId: string;
  userId: string;
  requestId: string;           // For tracing
}

interface TextGenerationResponse {
  content: string;
  
  // Metadata
  model: string;
  provider: string;
  
  // Usage
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  
  // Reasoning (if available)
  reasoning?: string;
  
  // Safety
  finishReason: "stop" | "length" | "safety" | "error";
  safetyFlags?: string[];
}
```

#### Embeddings

```typescript
interface EmbeddingRequest {
  texts: string[];
  model?: string;
  dimensions?: number;         // For models that support dimension reduction
  
  // Context
  tenantId: string;
  purpose: "search" | "similarity" | "clustering";
}

interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
  
  // Usage
  totalTokens: number;
}
```

#### Structured Output

```typescript
// Generate typed objects with Zod validation
async function generateObject<T extends z.ZodType>(
  request: {
    prompt: string;
    schema: T;
    maxRetries?: number;
  }
): Promise<z.infer<T>> {
  // 1. Generate with schema hint
  // 2. Parse response
  // 3. Validate against Zod schema
  // 4. Retry if validation fails (up to maxRetries)
  // 5. Return typed object
}
```

### §7 Layer 3: Orchestration

#### Agent Runtime

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  
  // Capabilities
  tools: Tool[];
  
  // Behavior
  systemPrompt: string;
  maxIterations: number;
  
  // Safety
  allowedDomains: string[];     // Which ERP domains can this agent access?
  requiresApproval: string[];   // Actions that need human approval
  
  // Memory
  memoryType: "none" | "session" | "persistent";
}

interface AgentExecution {
  agent: Agent;
  input: string;
  
  // Execution trace
  steps: AgentStep[];
  
  // Result
  output: string;
  toolCalls: ToolCall[];
  
  // Approval requests (if any)
  pendingApprovals: ApprovalRequest[];
}
```

#### Tool Registry

```typescript
interface Tool {
  id: string;
  name: string;
  description: string;         // For LLM to understand when to use
  
  // Schema
  inputSchema: ZodSchema;
  outputSchema: ZodSchema;
  
  // Execution
  execute(input: unknown): Promise<unknown>;
  
  // Safety
  domain: string;              // Which ERP domain owns this tool
  riskLevel: "low" | "medium" | "high";
  requiresApproval: boolean;
}

// Example: ERP-aware tools
const searchCustomersTool: Tool = {
  id: "mdm.search_customers",
  name: "Search Customers",
  description: "Search for customers by name, email, or tax ID",
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().default(10),
  }),
  outputSchema: z.array(partySchema),
  domain: "mdm",
  riskLevel: "low",
  requiresApproval: false,
  execute: async (input) => {
    // Calls MDM domain query
  },
};
```

#### Memory Manager

```typescript
interface MemoryManager {
  // Conversation memory
  saveConversation(sessionId: string, messages: Message[]): Promise<void>;
  loadConversation(sessionId: string): Promise<Message[]>;
  
  // Long-term memory (vector store)
  store(tenantId: string, documents: Document[]): Promise<void>;
  search(tenantId: string, query: string, limit: number): Promise<SearchResult[]>;
  
  // Episodic memory (past interactions)
  recordInteraction(interaction: Interaction): Promise<void>;
  recallSimilar(query: string, limit: number): Promise<Interaction[]>;
}

interface VectorStore {
  // Abstraction over pgvector, Pinecone, Weaviate, etc.
  upsert(vectors: VectorRecord[]): Promise<void>;
  search(query: number[], limit: number, filter?: Filter): Promise<VectorMatch[]>;
  delete(ids: string[]): Promise<void>;
}
```

### §8 Layer 4: Applications

The application layer implements specific business capabilities. These are documented in detail in [B12-INTELLIGENCE.md](./B12-INTELLIGENCE.md).

Key applications (The Machine...):
- **Anomaly Detection** — The Machine notices what's unusual
- **Forecasting** — The Machine anticipates what's coming
- **Document Understanding** — The Machine reads and extracts
- **Natural Query** — The Machine responds to questions
- **Recommendations** — The Machine offers improvements

---

## Part III: Safety & Governance

### §9 The Audit Contract

Every Lynx interaction MUST be logged:

```typescript
interface LynxAuditLog {
  id: string;
  tenantId: string;
  userId: string;
  
  // Request
  requestId: string;
  capability: "text" | "embedding" | "vision" | "agent";
  provider: string;
  model: string;
  
  // Input
  inputHash: string;           // Hash of input for privacy
  inputTokens: number;
  
  // Output
  outputHash: string;          // Hash of output
  outputTokens: number;
  
  // Reasoning
  reasoningChain?: string;     // Full reasoning if available
  
  // Safety
  safetyFlags: string[];
  wasBlocked: boolean;
  blockReason?: string;
  
  // Performance
  latencyMs: number;
  
  // Cost
  estimatedCost: string;       // Decimal string
  
  timestamp: string;
}
```

### §10 The Confidence Protocol

Every output from The Machine MUST include a confidence indicator:

```typescript
interface ConfidenceIndicator {
  level: "high" | "medium" | "low" | "uncertain";
  score: number;               // 0-1
  
  // Explanation
  factors: {
    factor: string;
    impact: "positive" | "negative";
    weight: number;
  }[];
  
  // Caveats
  caveats: string[];
  
  // Recommendation
  shouldHumanReview: boolean;
  reviewReason?: string;
}
```

**Confidence → Action Matrix:**

| Confidence | Score Range | Recommended Action |
|------------|-------------|-------------------|
| High       | 0.85 - 1.00 | Auto-apply (low-risk) or present for approval (high-risk) |
| Medium     | 0.60 - 0.84 | Present with explanation, require confirmation |
| Low        | 0.30 - 0.59 | Present as suggestion only, highlight uncertainty |
| Uncertain  | 0.00 - 0.29 | Do not auto-apply, require human decision |

### §11 The Fallback Protocol

When The Machine cannot proceed, the experience MUST degrade gracefully:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FALLBACK PROTOCOL                                     │
│                                                                              │
│  [AI Request] ──▶ [Primary Provider] ──▶ [Success] ──▶ [Return Result]      │
│                           │                                                  │
│                           ▼ (Fail)                                           │
│                   [Secondary Provider] ──▶ [Success] ──▶ [Return Result]    │
│                           │                                                  │
│                           ▼ (Fail)                                           │
│                   [Local Fallback] ──▶ [Success] ──▶ [Return Result]        │
│                           │                                                  │
│                           ▼ (Fail)                                           │
│                   [Rule-Based Fallback] ──▶ [Return with Caveat]            │
│                           │                                                  │
│                           ▼ (No Rule)                                        │
│                   [Return "Unable to process" + Manual Option]               │
│                                                                              │
│  INVARIANT: The Machine NEVER blocks user workflow due to capability failure│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### §12 Domain Access Control

Lynx respects ERP domain boundaries (B02):

```typescript
interface LynxAccessPolicy {
  agentId: string;
  
  // Domain access
  allowedDomains: string[];    // ["mdm", "sales", "inventory"]
  
  // Action restrictions
  allowedActions: {
    domain: string;
    actions: ("read" | "suggest" | "draft" | "execute")[];
  }[];
  
  // Data restrictions
  dataFilters: {
    domain: string;
    filter: Record<string, unknown>;
  }[];
  
  // Approval requirements
  approvalRequired: {
    action: string;
    threshold?: number;        // e.g., amount > 10000
  }[];
}
```

**Action Levels:**
- `read` — AI can query/view data
- `suggest` — AI can propose changes (not applied)
- `draft` — AI can create draft documents (not posted)
- `execute` — AI can trigger actions (with approval if required)

---

## Part IV: Integration Contracts

### §13 The Lynx Service Interface

```typescript
// packages/lynx/src/service.ts

interface LynxService {
  // Text generation
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
  streamText(request: TextGenerationRequest): AsyncIterable<TextChunk>;
  
  // Embeddings
  embed(texts: string[], options?: EmbedOptions): Promise<number[][]>;
  
  // Structured output
  generateObject<T>(schema: ZodSchema<T>, prompt: string): Promise<T>;
  
  // Agent execution
  runAgent(agentId: string, input: string, context?: AgentContext): Promise<AgentResult>;
  
  // Vector search
  semanticSearch(query: string, collection: string, limit: number): Promise<SearchResult[]>;
  
  // Document processing
  classifyDocument(document: Buffer, type: string): Promise<ClassificationResult>;
  extractFields(document: Buffer, schema: ZodSchema): Promise<ExtractionResult>;
  
  // Forecasting
  forecast(series: TimeSeries, horizon: number): Promise<ForecastResult>;
  
  // Anomaly detection
  detectAnomalies(data: DataPoint[], config: AnomalyConfig): Promise<Anomaly[]>;
}
```

### §14 Event Integration

Lynx publishes events to the B02 outbox:

```typescript
// Lynx events
const lynxEvents = {
  "lynx.inference.completed": z.object({
    requestId: z.string().uuid(),
    capability: z.string(),
    provider: z.string(),
    model: z.string(),
    latencyMs: z.number(),
    tokenCount: z.number(),
  }),
  
  "lynx.anomaly.detected": z.object({
    anomalyId: z.string().uuid(),
    domain: z.string(),
    entityType: z.string(),
    entityId: z.string().uuid(),
    severity: z.enum(["info", "warning", "critical"]),
    description: z.string(),
  }),
  
  "lynx.forecast.generated": z.object({
    forecastId: z.string().uuid(),
    seriesType: z.string(),
    horizon: z.number(),
    confidenceInterval: z.number(),
  }),
  
  "lynx.agent.action_requested": z.object({
    agentId: z.string(),
    actionType: z.string(),
    targetDomain: z.string(),
    requiresApproval: z.boolean(),
    payload: z.record(z.unknown()),
  }),
};
```

---

## Part V: Configuration

### §15 Tenant-Level Configuration

```typescript
interface LynxConfig {
  tenantId: string;
  
  // Provider settings
  providers: {
    primary: ProviderConfig;
    secondary?: ProviderConfig;
    embedding?: ProviderConfig;
  };
  
  // Feature toggles
  features: {
    anomalyDetection: boolean;
    forecasting: boolean;
    documentProcessing: boolean;
    smartAssistant: boolean;
    agentExecution: boolean;
  };
  
  // Safety settings
  safety: {
    maxTokensPerRequest: number;
    maxRequestsPerMinute: number;
    requireApprovalForHighRisk: boolean;
    blockSensitiveData: boolean;
  };
  
  // Audit settings
  audit: {
    logAllRequests: boolean;
    retainDays: number;
    logInputs: boolean;          // May disable for privacy
    logOutputs: boolean;
  };
  
  // Cost settings
  cost: {
    monthlyBudget?: string;
    alertThreshold?: number;     // Percentage of budget
    hardLimit: boolean;          // Stop when budget exceeded
  };
}

interface ProviderConfig {
  providerId: string;
  apiKeyRef: string;             // Reference to secret store
  defaultModel?: string;
  options?: Record<string, unknown>;
}
```

---

## Part VI: The Machine Mental Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        THE MACHINE MENTAL MODEL                              │
│                                                                              │
│    "The Machine is the wise advisor, not the king."                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                                                                          ││
│  │   HUMAN                         THE MACHINE                              ││
│  │   ┌─────┐                        ┌─────┐                                ││
│  │   │ 👤  │ ◀── Suggestions ────── │ ⚙️  │                                ││
│  │   │     │                        │     │                                ││
│  │   │     │ ── Questions ────────▶ │     │                                ││
│  │   │     │                        │     │                                ││
│  │   │     │ ◀── Insights ───────── │     │                                ││
│  │   │     │                        │     │                                ││
│  │   │     │ ── Approvals ────────▶ │     │ ──▶ [Action]                   ││
│  │   └─────┘                        └─────┘                                ││
│  │                                                                          ││
│  │   HUMAN ALWAYS:              THE MACHINE ALWAYS:                         ││
│  │   • Makes final decisions    • Explains reasoning                        ││
│  │   • Approves actions         • Declares confidence                       ││
│  │   • Bears accountability     • Respects boundaries                       ││
│  │   • Can override             • Logs everything                           ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
│    When in doubt: "What would a trusted advisor do?"                        │
│    Answer: Notice. Suggest. Wait for approval. Never act alone.             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part VII: The Invisible Machine

> **See [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) for the complete vocabulary law.**

Lynx is the technical name for what users experience as **The Invisible Machine**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LYNX = THE MACHINE'S AWARENESS                            │
│                                                                              │
│  Lynx is the name we give to the Machine's ability to:                      │
│  • See — notice patterns, anomalies, opportunities                          │
│  • Remember — recall context, history, relationships                        │
│  • Govern — enforce boundaries, validate truth, signal attention            │
│                                                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  In code: "lynx" (packages, schemas, types)                                 │
│  In docs: "The Machine" (philosophy, UX, messaging)                         │
│  To users: invisible — they just feel the power                             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**The Vocabulary Rule:**

| In Code (Technical) | In Docs/UI (User-Facing) |
|---------------------|-------------------------|
| `lynx.inference` | "The Machine understands..." |
| `lynx.anomaly.detected` | "The Machine noticed..." |
| `lynx.agent.execution` | "The Machine handles..." |
| `lynxConfig` | "Machine settings" |

**The North Star:**

> *"You focus. The Machine works."*

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Canonical**                                   |
| **Version**      | 1.2.0                                           |
| **Parent**       | A01-CANONICAL.md v0.3.0                         |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

---

## Related Documents

| Document                                         | Purpose                                    |
| ------------------------------------------------ | ------------------------------------------ |
| [A01-CANONICAL.md](./A01-CANONICAL.md)           | Parent: AXIS Philosophy                    |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | The Vocabulary of Truth |
| [B02-DOMAINS.md](./B02-DOMAINS.md)               | Domain boundaries the Machine respects     |
| [B08-CONTROLS.md](./B08-CONTROLS.md)             | RBAC that applies to Machine access        |
| [B11-AFANDA.md](./B11-AFANDA.md)                 | AFANDA: The Machine surfaces insights      |
| [B12-INTELLIGENCE.md](./B12-INTELLIGENCE.md)     | ERP-specific Machine capabilities          |

---

> *"Lynx: The Machine's Awareness. Provider-agnostic. Transparent. Auditable. Human-governed. You focus. The Machine works."*
>
> *"In code: lynx. In philosophy: The Machine. To users: invisible power."*
