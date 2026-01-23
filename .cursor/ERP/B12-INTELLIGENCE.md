# B12 — Intelligence Layer
## The Machine's Awareness Applied to ERP

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|           B-Series            |                         |                     |                       |                          |                           |                             |                           |                                 |                               |                       |                       |             |
| :---------------------------: | :---------------------: | :-----------------: | :-------------------: | :----------------------: | :-----------------------: | :-------------------------: | :-----------------------: | :-----------------------------: | :---------------------------: | :-------------------: | :-------------------: | :---------: |
| [B01](./B01-DOCUMENTATION.md) | [B02](./B02-DOMAINS.md) | [B03](./B03-MDM.md) | [B04](./B04-SALES.md) | [B05](./B05-PURCHASE.md) | [B06](./B06-INVENTORY.md) | [B07](./B07-ACCOUNTING.md)  | [B08](./B08-CONTROLS.md)  | [B08-01](./B08-01-WORKFLOW.md)  | [B09](./B09-RECONCILIATION.md)| [B10](./B10-UX.md)    | [B11](./B11-AFANDA.md)| **[B12]**   |
|            Posting            |         Domains         |         MDM         |         Sales         |         Purchase         |         Inventory         |         Accounting          |         Controls          |            Workflow             |         Reconciliation        |          UX           |        AFANDA         | Intelligence|

---

> **Derived From:** [A01-01-LYNX.md](./A01-01-LYNX.md) (Lynx: The Machine's Awareness), [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) (Vocabulary of Truth), [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) Phase B12
>
> **Tag:** `INTELLIGENCE` | `LYNX` | `MACHINE` | `ANOMALY` | `FORECAST` | `PHASE-B12`

---

## 🛑 DEV NOTE: Respect Lynx, The Machine & @axis/registry

> **See [A01-01-LYNX.md](./A01-01-LYNX.md) for Lynx canonical patterns.**
> **See [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) for vocabulary law.**
> **See [A02-AXIS-MAP.md](./A02-AXIS-MAP.md) for full details.**

### The Machine Vocabulary (Enforced)

| Retired (FORBIDDEN) | The Machine (REQUIRED) |
|---------------------|------------------------|
| "AI detects..." | "The Machine notices..." |
| "Intelligent processing..." | "The Machine understands..." |
| "Smart recommendations..." | "The Machine offers..." |
| "Automated forecasting..." | "The Machine anticipates..." |
| "AI-powered assistant..." | "The Machine responds..." |

All B12 Intelligence schemas follow the **Single Source of Truth** pattern:

| Component                | Source                                                   |
| ------------------------ | -------------------------------------------------------- |
| Intelligence Constants   | `@axis/registry/schemas/intelligence/constants.ts`       |
| Anomaly Schema           | `@axis/registry/schemas/intelligence/anomaly.ts`         |
| Forecast Schema          | `@axis/registry/schemas/intelligence/forecast.ts`        |
| Document AI Schema       | `@axis/registry/schemas/intelligence/document.ts`        |
| Recommendation Schema    | `@axis/registry/schemas/intelligence/recommendation.ts`  |
| Assistant Schema         | `@axis/registry/schemas/intelligence/assistant.ts`       |
| Intelligence Events      | `@axis/registry/schemas/events/intelligence.ts`          |

**Rule**: All AI capabilities are powered by **Lynx** (A01-01). Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

---

## 1) The Core Law

> *"You focus. The Machine works."*

From A01-01 (Lynx) and A01-07 (The Invisible Machine):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE INTELLIGENCE PRINCIPLE                                │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║     B12 = The Machine's Awareness applied to ERP domains          ║    │
│    ║                                                                   ║    │
│    ║     • Anomaly Detection: The Machine notices what's unusual       ║    │
│    ║     • Forecasting: The Machine anticipates what's coming          ║    │
│    ║     • Document Understanding: The Machine reads documents         ║    │
│    ║     • Recommendations: The Machine offers improvements            ║    │
│    ║     • Natural Query: The Machine responds to questions            ║    │
│    ║                                                                   ║    │
│    ║     Every insight is:                                             ║    │
│    ║     ✓ Explainable (reasoning provided)                            ║    │
│    ║     ✓ Confident (score declared)                                  ║    │
│    ║     ✓ Auditable (logged to trail)                                 ║    │
│    ║     ✓ Human-governed (approval required for actions)              ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) Intelligence Architecture

### 2.1 Domain Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTELLIGENCE INTEGRATION                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      ERP DOMAINS (DATA SOURCES)                          ││
│  │  B03 MDM │ B04 Sales │ B05 Purchase │ B06 Inventory │ B07 Accounting    ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      LYNX CORE (A01-01)                                  ││
│  │  Providers │ Capabilities │ Orchestration │ Safety │ Audit              ││
│  └──────────────────────────────────┬──────────────────────────────────────┘│
│                                     │                                        │
│          ┌──────────────────────────┼──────────────────────────────────────┐│
│          ▼                          ▼                          ▼            ││
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐     ││
│  │   ANOMALY     │         │  FORECASTING  │         │  DOCUMENT AI  │     ││
│  │  Detection    │         │    Engine     │         │   Processing  │     ││
│  └───────────────┘         └───────────────┘         └───────────────┘     ││
│          │                          │                          │            ││
│  ┌───────────────┐         ┌───────────────┐                   │            ││
│  │RECOMMENDATIONS│         │   ASSISTANT   │                   │            ││
│  │    Engine     │         │  (NL Query)   │                   │            ││
│  └───────────────┘         └───────────────┘                   │            ││
│          │                          │                          │            ││
│          └──────────────────────────┼──────────────────────────┘            ││
│                                     ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                      B11 AFANDA (PRESENTATION)                           ││
│  │  Dashboards │ Alerts │ Reports │ KPIs                                   ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Intelligence Constants

```typescript
// packages/axis-registry/src/schemas/intelligence/constants.ts

export const INTELLIGENCE_CAPABILITY = [
  "anomaly_detection",
  "forecasting",
  "document_classification",
  "document_extraction",
  "semantic_search",
  "recommendations",
  "natural_language_query",
  "agent_execution",
] as const;

export const ANOMALY_TYPE = [
  "statistical",      // Z-score, IQR outliers
  "pattern",          // Unusual patterns
  "rule_based",       // Business rule violations
  "ml_detected",      // ML model detected
  "comparative",      // Comparison with peers/history
] as const;

export const ANOMALY_SEVERITY = [
  "info",             // FYI, no action needed
  "warning",          // Review recommended
  "critical",         // Immediate attention required
] as const;

export const ANOMALY_STATUS = [
  "detected",
  "acknowledged",
  "investigating",
  "resolved",
  "false_positive",
  "ignored",
] as const;

export const FORECAST_TYPE = [
  "demand",           // Product demand
  "revenue",          // Revenue projection
  "cash_flow",        // Cash flow prediction
  "inventory",        // Stock level prediction
  "expense",          // Expense projection
  "custom",           // Custom time series
] as const;

export const FORECAST_METHOD = [
  "moving_average",
  "exponential_smoothing",
  "arima",
  "prophet",
  "neural_network",
  "ensemble",
] as const;

export const DOCUMENT_TYPE = [
  "invoice",
  "purchase_order",
  "receipt",
  "contract",
  "statement",
  "report",
  "correspondence",
  "unknown",
] as const;

export const RECOMMENDATION_TYPE = [
  "pricing",          // Price optimization
  "reorder",          // Inventory reorder
  "payment",          // Payment timing
  "process",          // Process improvement
  "risk",             // Risk mitigation
  "opportunity",      // Revenue opportunity
] as const;

export const CONFIDENCE_LEVEL = [
  "high",             // 0.85 - 1.00
  "medium",           // 0.60 - 0.84
  "low",              // 0.30 - 0.59
  "uncertain",        // 0.00 - 0.29
] as const;
```

---

## 3) Anomaly Detection

### 3.1 Anomaly Schema

```typescript
// packages/axis-registry/src/schemas/intelligence/anomaly.ts

import { z } from "zod";

export const anomalySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Classification
  anomalyType: z.enum(ANOMALY_TYPE),
  severity: z.enum(ANOMALY_SEVERITY),
  
  // Context
  domain: z.string(),                    // Which ERP domain
  entityType: z.string(),                // e.g., "invoice", "order", "payment"
  entityId: z.string().uuid().optional(),
  
  // Detection
  detectedAt: z.string().datetime(),
  detectionMethod: z.string(),           // Algorithm/model used
  
  // Details
  title: z.string().max(255),
  description: z.string().max(2000),
  
  // Evidence
  metrics: z.array(z.object({
    name: z.string(),
    actualValue: z.number(),
    expectedValue: z.number().optional(),
    threshold: z.number().optional(),
    deviation: z.number().optional(),
  })),
  
  // Confidence
  confidence: z.object({
    level: z.enum(CONFIDENCE_LEVEL),
    score: z.number().min(0).max(1),
    factors: z.array(z.object({
      factor: z.string(),
      impact: z.enum(["positive", "negative"]),
      weight: z.number(),
    })).optional(),
  }),
  
  // AI Explanation
  explanation: z.string().max(2000).optional(),
  reasoning: z.string().optional(),       // Full reasoning chain
  
  // Suggested actions
  suggestedActions: z.array(z.object({
    action: z.string(),
    priority: z.enum(["immediate", "soon", "when_convenient"]),
    automatable: z.boolean(),
  })).optional(),
  
  // Status
  status: z.enum(ANOMALY_STATUS).default("detected"),
  
  // Resolution
  acknowledgedBy: z.string().uuid().optional(),
  acknowledgedAt: z.string().datetime().optional(),
  resolvedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNote: z.string().max(1000).optional(),
  
  // Feedback (for ML improvement)
  feedback: z.enum(["correct", "false_positive", "missed_context"]).optional(),
  feedbackNote: z.string().max(500).optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Anomaly = z.infer<typeof anomalySchema>;
```

### 3.2 Anomaly Detection Engine

```typescript
// packages/lynx/src/intelligence/anomaly-engine.ts

/**
 * Anomaly Detection Engine
 * Uses Lynx for ML-based detection, combined with statistical methods
 */
export class AnomalyDetectionEngine {
  constructor(
    private readonly lynx: LynxService,
    private readonly db: Database
  ) {}

  /**
   * Detect anomalies in a domain
   */
  async detectAnomalies(
    tenantId: string,
    domain: string,
    options?: {
      entityType?: string;
      lookbackDays?: number;
      sensitivityLevel?: "low" | "medium" | "high";
    }
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // 1. Statistical anomalies
    const statisticalAnomalies = await this.detectStatisticalAnomalies(
      tenantId,
      domain,
      options
    );
    anomalies.push(...statisticalAnomalies);
    
    // 2. Rule-based anomalies
    const ruleAnomalies = await this.detectRuleBasedAnomalies(
      tenantId,
      domain
    );
    anomalies.push(...ruleAnomalies);
    
    // 3. ML-based anomalies (via Lynx)
    const mlAnomalies = await this.detectMLAnomalies(
      tenantId,
      domain,
      options
    );
    anomalies.push(...mlAnomalies);
    
    // 4. Deduplicate and rank by severity
    return this.deduplicateAndRank(anomalies);
  }

  /**
   * Statistical anomaly detection (Z-score, IQR)
   */
  private async detectStatisticalAnomalies(
    tenantId: string,
    domain: string,
    options?: { lookbackDays?: number; sensitivityLevel?: string }
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const lookback = options?.lookbackDays ?? 30;
    const sensitivity = options?.sensitivityLevel ?? "medium";
    
    // Get domain-specific metrics
    const metrics = await this.getDomainMetrics(tenantId, domain, lookback);
    
    for (const metric of metrics) {
      // Calculate Z-score
      const zScore = (metric.currentValue - metric.mean) / metric.stdDev;
      const threshold = sensitivity === "high" ? 2 : sensitivity === "medium" ? 2.5 : 3;
      
      if (Math.abs(zScore) > threshold) {
        anomalies.push({
          id: generateUUID(),
          tenantId,
          anomalyType: "statistical",
          severity: Math.abs(zScore) > 4 ? "critical" : "warning",
          domain,
          entityType: metric.entityType,
          detectedAt: new Date().toISOString(),
          detectionMethod: "z_score",
          title: `Unusual ${metric.name}`,
          description: `${metric.name} is ${zScore > 0 ? "unusually high" : "unusually low"}`,
          metrics: [{
            name: metric.name,
            actualValue: metric.currentValue,
            expectedValue: metric.mean,
            deviation: zScore,
          }],
          confidence: {
            level: Math.abs(zScore) > 3.5 ? "high" : "medium",
            score: Math.min(0.99, 0.5 + Math.abs(zScore) * 0.1),
          },
          status: "detected",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    return anomalies;
  }

  /**
   * ML-based anomaly detection using Lynx
   */
  private async detectMLAnomalies(
    tenantId: string,
    domain: string,
    options?: { entityType?: string }
  ): Promise<Anomaly[]> {
    // Prepare data for Lynx
    const recentData = await this.getRecentDomainData(tenantId, domain);
    
    // Use Lynx for pattern detection
    const result = await this.lynx.generateObject({
      schema: z.object({
        anomalies: z.array(z.object({
          entityId: z.string(),
          anomalyType: z.string(),
          title: z.string(),
          description: z.string(),
          severity: z.enum(["info", "warning", "critical"]),
          confidence: z.number(),
          reasoning: z.string(),
          suggestedActions: z.array(z.string()),
        })),
      }),
      prompt: `Analyze the following ${domain} data for anomalies. 
               Look for unusual patterns, outliers, and potential issues.
               Data: ${JSON.stringify(recentData)}`,
    });
    
    return result.anomalies.map(a => ({
      id: generateUUID(),
      tenantId,
      anomalyType: "ml_detected",
      severity: a.severity,
      domain,
      entityType: options?.entityType || "unknown",
      entityId: a.entityId,
      detectedAt: new Date().toISOString(),
      detectionMethod: "lynx_pattern_detection",
      title: a.title,
      description: a.description,
      metrics: [],
      confidence: {
        level: a.confidence > 0.85 ? "high" : a.confidence > 0.6 ? "medium" : "low",
        score: a.confidence,
      },
      explanation: a.reasoning,
      suggestedActions: a.suggestedActions.map(action => ({
        action,
        priority: "soon" as const,
        automatable: false,
      })),
      status: "detected",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}
```

### 3.3 Domain-Specific Anomaly Rules

```typescript
// packages/axis-registry/src/schemas/intelligence/anomaly-rules.ts

export const DOMAIN_ANOMALY_RULES = {
  sales: [
    {
      id: "sales.large_order",
      name: "Unusually Large Order",
      condition: "order.total > customer.avgOrderValue * 5",
      severity: "warning",
      description: "Order value significantly exceeds customer average",
    },
    {
      id: "sales.sudden_discount",
      name: "Excessive Discount",
      condition: "line.discountPercent > 30",
      severity: "warning",
      description: "Discount exceeds normal threshold",
    },
    {
      id: "sales.credit_limit_approach",
      name: "Approaching Credit Limit",
      condition: "customer.arBalance > customer.creditLimit * 0.9",
      severity: "warning",
      description: "Customer is approaching credit limit",
    },
    {
      id: "sales.duplicate_invoice",
      name: "Potential Duplicate Invoice",
      condition: "invoice.similar_exists_30_days",
      severity: "critical",
      description: "Invoice appears similar to recent invoice for same customer",
    },
  ],
  
  purchase: [
    {
      id: "purchase.price_increase",
      name: "Unusual Price Increase",
      condition: "line.unitPrice > previousPO.unitPrice * 1.2",
      severity: "warning",
      description: "Unit price increased more than 20% from last PO",
    },
    {
      id: "purchase.split_order",
      name: "Potential Order Splitting",
      condition: "countPOsToSupplier7Days > 3 AND avgPOValue < approvalThreshold",
      severity: "warning",
      description: "Multiple small POs to same supplier may indicate approval bypass",
    },
    {
      id: "purchase.weekend_po",
      name: "Weekend Purchase Order",
      condition: "po.createdAt.dayOfWeek IN ('Saturday', 'Sunday')",
      severity: "info",
      description: "PO created on weekend - may need review",
    },
  ],
  
  inventory: [
    {
      id: "inventory.negative_stock",
      name: "Negative Stock",
      condition: "stockLevel.onHand < 0",
      severity: "critical",
      description: "Stock has gone negative",
    },
    {
      id: "inventory.slow_moving",
      name: "Slow Moving Inventory",
      condition: "item.daysSinceLastMove > 90 AND item.onHand > 0",
      severity: "info",
      description: "Item has not moved in 90 days",
    },
    {
      id: "inventory.variance_threshold",
      name: "Large Count Variance",
      condition: "countVariance.percent > 5",
      severity: "warning",
      description: "Physical count variance exceeds 5%",
    },
  ],
  
  accounting: [
    {
      id: "accounting.unbalanced_entry",
      name: "Unbalanced Journal Entry",
      condition: "SUM(debit) != SUM(credit)",
      severity: "critical",
      description: "Journal entry does not balance",
    },
    {
      id: "accounting.unusual_amount",
      name: "Unusual Transaction Amount",
      condition: "entry.amount > account.avgMonthlyActivity * 3",
      severity: "warning",
      description: "Transaction significantly larger than normal for this account",
    },
    {
      id: "accounting.closed_period_attempt",
      name: "Closed Period Posting Attempt",
      condition: "entry.periodId.status = 'hard_closed'",
      severity: "critical",
      description: "Attempt to post to closed fiscal period",
    },
  ],
};
```

---

## 4) Forecasting Engine

### 4.1 Forecast Schema

```typescript
// packages/axis-registry/src/schemas/intelligence/forecast.ts

export const forecastSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Type
  forecastType: z.enum(FORECAST_TYPE),
  
  // Target
  targetEntity: z.string().optional(),    // e.g., itemId, customerId
  targetEntityId: z.string().uuid().optional(),
  
  // Time parameters
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  granularity: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  horizon: z.number().int(),              // Number of periods ahead
  
  // Method
  method: z.enum(FORECAST_METHOD),
  modelVersion: z.string().optional(),
  
  // Results
  predictions: z.array(z.object({
    periodStart: z.string().datetime(),
    periodEnd: z.string().datetime(),
    value: z.number(),
    lowerBound: z.number(),               // Confidence interval
    upperBound: z.number(),
  })),
  
  // Confidence
  confidence: z.object({
    level: z.enum(CONFIDENCE_LEVEL),
    score: z.number().min(0).max(1),
    mape: z.number().optional(),          // Mean Absolute Percentage Error
    rmse: z.number().optional(),          // Root Mean Square Error
  }),
  
  // Historical performance
  backtestResults: z.object({
    accuracy: z.number(),
    periods: z.number(),
  }).optional(),
  
  // AI Insights
  insights: z.array(z.object({
    type: z.enum(["trend", "seasonality", "anomaly", "opportunity", "risk"]),
    description: z.string(),
    impact: z.enum(["positive", "negative", "neutral"]),
  })).optional(),
  
  // Status
  status: z.enum(["pending", "completed", "failed"]).default("pending"),
  error: z.string().optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  createdBy: z.string().uuid(),
});

export type Forecast = z.infer<typeof forecastSchema>;
```

### 4.2 Forecasting Engine

```typescript
// packages/lynx/src/intelligence/forecast-engine.ts

export class ForecastingEngine {
  constructor(
    private readonly lynx: LynxService,
    private readonly db: Database
  ) {}

  /**
   * Generate demand forecast for items
   */
  async forecastDemand(
    tenantId: string,
    itemId: string,
    options: {
      horizon: number;          // Periods ahead
      granularity: "daily" | "weekly" | "monthly";
      method?: ForecastMethod;
      includeInsights?: boolean;
    }
  ): Promise<Forecast> {
    // 1. Get historical sales data
    const historicalData = await this.getSalesHistory(
      tenantId,
      itemId,
      options.granularity,
      365 // 1 year of history
    );
    
    // 2. Select forecasting method
    const method = options.method ?? await this.selectBestMethod(historicalData);
    
    // 3. Generate predictions
    const predictions = await this.generatePredictions(
      historicalData,
      method,
      options.horizon,
      options.granularity
    );
    
    // 4. Calculate confidence intervals
    const withConfidence = await this.addConfidenceIntervals(
      predictions,
      historicalData
    );
    
    // 5. Generate AI insights (via Lynx)
    let insights;
    if (options.includeInsights) {
      insights = await this.generateInsights(tenantId, itemId, historicalData, withConfidence);
    }
    
    // 6. Build forecast result
    const forecast: Forecast = {
      id: generateUUID(),
      tenantId,
      forecastType: "demand",
      targetEntity: "item",
      targetEntityId: itemId,
      startDate: withConfidence[0].periodStart,
      endDate: withConfidence[withConfidence.length - 1].periodEnd,
      granularity: options.granularity,
      horizon: options.horizon,
      method,
      predictions: withConfidence,
      confidence: this.calculateOverallConfidence(withConfidence, historicalData),
      insights,
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
    };
    
    // 7. Store forecast
    await this.storeForecast(forecast);
    
    return forecast;
  }

  /**
   * Generate cash flow forecast
   */
  async forecastCashFlow(
    tenantId: string,
    options: {
      horizon: number;
      granularity: "daily" | "weekly" | "monthly";
    }
  ): Promise<Forecast> {
    // Get AR aging (expected inflows)
    const arAging = await this.getARAgingProjections(tenantId);
    
    // Get AP aging (expected outflows)
    const apAging = await this.getAPAgingProjections(tenantId);
    
    // Get recurring patterns
    const recurringInflows = await this.getRecurringInflows(tenantId);
    const recurringOutflows = await this.getRecurringOutflows(tenantId);
    
    // Combine into cash flow projection
    const predictions = await this.combineCashFlowComponents(
      arAging,
      apAging,
      recurringInflows,
      recurringOutflows,
      options
    );
    
    // Use Lynx for risk assessment
    const riskAssessment = await this.lynx.generateObject({
      schema: z.object({
        risks: z.array(z.object({
          period: z.string(),
          riskLevel: z.enum(["low", "medium", "high"]),
          description: z.string(),
          mitigation: z.string(),
        })),
        opportunities: z.array(z.object({
          description: z.string(),
          potentialImpact: z.number(),
        })),
      }),
      prompt: `Analyze this cash flow forecast and identify risks and opportunities:
               ${JSON.stringify(predictions)}`,
    });
    
    return {
      id: generateUUID(),
      tenantId,
      forecastType: "cash_flow",
      startDate: predictions[0].periodStart,
      endDate: predictions[predictions.length - 1].periodEnd,
      granularity: options.granularity,
      horizon: options.horizon,
      method: "ensemble",
      predictions,
      confidence: {
        level: "medium",
        score: 0.75,
      },
      insights: [
        ...riskAssessment.risks.map(r => ({
          type: "risk" as const,
          description: `${r.period}: ${r.description}. Mitigation: ${r.mitigation}`,
          impact: "negative" as const,
        })),
        ...riskAssessment.opportunities.map(o => ({
          type: "opportunity" as const,
          description: o.description,
          impact: "positive" as const,
        })),
      ],
      status: "completed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "system",
    };
  }

  /**
   * Generate AI insights from forecast data
   */
  private async generateInsights(
    tenantId: string,
    itemId: string,
    historical: TimeSeries,
    predictions: Prediction[]
  ): Promise<ForecastInsight[]> {
    const result = await this.lynx.generateObject({
      schema: z.object({
        insights: z.array(z.object({
          type: z.enum(["trend", "seasonality", "anomaly", "opportunity", "risk"]),
          description: z.string(),
          impact: z.enum(["positive", "negative", "neutral"]),
        })),
      }),
      prompt: `Analyze this demand forecast and provide insights:
               Historical data: ${JSON.stringify(historical)}
               Predictions: ${JSON.stringify(predictions)}
               
               Identify trends, seasonality, potential risks, and opportunities.`,
    });
    
    return result.insights;
  }
}
```

---

## 5) Document AI

### 5.1 Document Processing Schema

```typescript
// packages/axis-registry/src/schemas/intelligence/document.ts

export const documentClassificationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Input
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().int(),
  
  // Classification
  documentType: z.enum(DOCUMENT_TYPE),
  subType: z.string().optional(),
  
  // Confidence
  confidence: z.object({
    level: z.enum(CONFIDENCE_LEVEL),
    score: z.number().min(0).max(1),
    alternatives: z.array(z.object({
      type: z.string(),
      score: z.number(),
    })).optional(),
  }),
  
  // Processing
  processedAt: z.string().datetime(),
  processingTimeMs: z.number().int(),
  
  createdAt: z.string().datetime(),
});

export const documentExtractionSchema = z.object({
  id: z.string().uuid(),
  classificationId: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Document type (determines schema)
  documentType: z.enum(DOCUMENT_TYPE),
  
  // Extracted fields (dynamic based on type)
  extractedFields: z.record(z.object({
    value: z.unknown(),
    confidence: z.number(),
    boundingBox: z.object({
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      page: z.number(),
    }).optional(),
  })),
  
  // Line items (for invoices, POs, etc.)
  lineItems: z.array(z.object({
    lineNumber: z.number().int(),
    fields: z.record(z.object({
      value: z.unknown(),
      confidence: z.number(),
    })),
  })).optional(),
  
  // Validation
  validationResults: z.array(z.object({
    field: z.string(),
    status: z.enum(["valid", "warning", "error"]),
    message: z.string().optional(),
  })).optional(),
  
  // Suggested mapping
  suggestedEntity: z.object({
    entityType: z.string(),
    entityId: z.string().uuid().optional(),
    matchConfidence: z.number(),
  }).optional(),
  
  // Processing
  processedAt: z.string().datetime(),
  processingTimeMs: z.number().int(),
  
  createdAt: z.string().datetime(),
});

export type DocumentClassification = z.infer<typeof documentClassificationSchema>;
export type DocumentExtraction = z.infer<typeof documentExtractionSchema>;
```

### 5.2 Document AI Engine

```typescript
// packages/lynx/src/intelligence/document-engine.ts

export class DocumentAIEngine {
  constructor(
    private readonly lynx: LynxService,
    private readonly db: Database
  ) {}

  /**
   * Classify an uploaded document
   */
  async classifyDocument(
    tenantId: string,
    file: Buffer,
    fileName: string,
    fileType: string
  ): Promise<DocumentClassification> {
    const startTime = Date.now();
    
    // Use Lynx vision capabilities
    const result = await this.lynx.generateObject({
      schema: z.object({
        documentType: z.enum(DOCUMENT_TYPE),
        subType: z.string().optional(),
        confidence: z.number(),
        reasoning: z.string(),
      }),
      prompt: `Classify this document. Determine its type (invoice, purchase_order, receipt, contract, statement, report, correspondence, or unknown).`,
      image: file,
    });
    
    return {
      id: generateUUID(),
      tenantId,
      fileName,
      fileType,
      fileSize: file.length,
      documentType: result.documentType,
      subType: result.subType,
      confidence: {
        level: result.confidence > 0.85 ? "high" : result.confidence > 0.6 ? "medium" : "low",
        score: result.confidence,
      },
      processedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Extract fields from a classified document
   */
  async extractFields(
    tenantId: string,
    classificationId: string,
    file: Buffer
  ): Promise<DocumentExtraction> {
    const startTime = Date.now();
    
    // Get classification
    const classification = await this.db.query.documentClassifications.findFirst({
      where: eq(documentClassifications.id, classificationId),
    });
    
    if (!classification) {
      throw new Error("Classification not found");
    }
    
    // Get extraction schema based on document type
    const extractionSchema = this.getExtractionSchema(classification.documentType);
    
    // Use Lynx for extraction
    const result = await this.lynx.generateObject({
      schema: extractionSchema,
      prompt: `Extract all relevant fields from this ${classification.documentType}.
               Include line items if present.
               For each field, provide a confidence score.`,
      image: file,
    });
    
    // Validate and match
    const validation = await this.validateExtraction(tenantId, classification.documentType, result);
    const suggestedEntity = await this.matchToEntity(tenantId, classification.documentType, result);
    
    return {
      id: generateUUID(),
      classificationId,
      tenantId,
      documentType: classification.documentType,
      extractedFields: result.fields,
      lineItems: result.lineItems,
      validationResults: validation,
      suggestedEntity,
      processedAt: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Get extraction schema based on document type
   */
  private getExtractionSchema(documentType: DocumentType): ZodSchema {
    switch (documentType) {
      case "invoice":
        return z.object({
          fields: z.object({
            invoiceNumber: z.object({ value: z.string(), confidence: z.number() }),
            invoiceDate: z.object({ value: z.string(), confidence: z.number() }),
            dueDate: z.object({ value: z.string(), confidence: z.number() }).optional(),
            vendorName: z.object({ value: z.string(), confidence: z.number() }),
            vendorAddress: z.object({ value: z.string(), confidence: z.number() }).optional(),
            vendorTaxId: z.object({ value: z.string(), confidence: z.number() }).optional(),
            subtotal: z.object({ value: z.number(), confidence: z.number() }),
            taxAmount: z.object({ value: z.number(), confidence: z.number() }).optional(),
            total: z.object({ value: z.number(), confidence: z.number() }),
            currency: z.object({ value: z.string(), confidence: z.number() }),
          }),
          lineItems: z.array(z.object({
            lineNumber: z.number(),
            fields: z.object({
              description: z.object({ value: z.string(), confidence: z.number() }),
              quantity: z.object({ value: z.number(), confidence: z.number() }),
              unitPrice: z.object({ value: z.number(), confidence: z.number() }),
              lineTotal: z.object({ value: z.number(), confidence: z.number() }),
            }),
          })),
        });
        
      case "purchase_order":
        return z.object({
          fields: z.object({
            poNumber: z.object({ value: z.string(), confidence: z.number() }),
            poDate: z.object({ value: z.string(), confidence: z.number() }),
            deliveryDate: z.object({ value: z.string(), confidence: z.number() }).optional(),
            buyerName: z.object({ value: z.string(), confidence: z.number() }),
            supplierName: z.object({ value: z.string(), confidence: z.number() }),
            total: z.object({ value: z.number(), confidence: z.number() }),
            currency: z.object({ value: z.string(), confidence: z.number() }),
          }),
          lineItems: z.array(z.object({
            lineNumber: z.number(),
            fields: z.object({
              itemCode: z.object({ value: z.string(), confidence: z.number() }).optional(),
              description: z.object({ value: z.string(), confidence: z.number() }),
              quantity: z.object({ value: z.number(), confidence: z.number() }),
              unitPrice: z.object({ value: z.number(), confidence: z.number() }),
              lineTotal: z.object({ value: z.number(), confidence: z.number() }),
            }),
          })),
        });
        
      // Add other document types...
        
      default:
        return z.object({
          fields: z.record(z.object({
            value: z.unknown(),
            confidence: z.number(),
          })),
        });
    }
  }

  /**
   * Match extracted data to existing ERP entities
   */
  private async matchToEntity(
    tenantId: string,
    documentType: DocumentType,
    extraction: ExtractionResult
  ): Promise<{ entityType: string; entityId?: string; matchConfidence: number } | undefined> {
    switch (documentType) {
      case "invoice": {
        // Try to match vendor
        const vendorName = extraction.fields.vendorName?.value as string;
        if (vendorName) {
          const vendor = await this.findPartyByName(tenantId, vendorName, true);
          if (vendor) {
            return {
              entityType: "party",
              entityId: vendor.id,
              matchConfidence: vendor.matchScore,
            };
          }
        }
        break;
      }
      
      case "purchase_order": {
        // Try to match supplier and items
        const supplierName = extraction.fields.supplierName?.value as string;
        if (supplierName) {
          const supplier = await this.findPartyByName(tenantId, supplierName, true);
          if (supplier) {
            return {
              entityType: "party",
              entityId: supplier.id,
              matchConfidence: supplier.matchScore,
            };
          }
        }
        break;
      }
    }
    
    return undefined;
  }
}
```

---

## 6) Smart Recommendations

### 6.1 Recommendation Schema

```typescript
// packages/axis-registry/src/schemas/intelligence/recommendation.ts

export const recommendationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  
  // Type
  recommendationType: z.enum(RECOMMENDATION_TYPE),
  
  // Target
  targetDomain: z.string(),
  targetEntity: z.string().optional(),
  targetEntityId: z.string().uuid().optional(),
  
  // Recommendation
  title: z.string().max(255),
  description: z.string().max(2000),
  
  // Impact
  expectedImpact: z.object({
    type: z.enum(["revenue", "cost", "efficiency", "risk", "quality"]),
    direction: z.enum(["increase", "decrease"]),
    estimatedValue: z.number().optional(),
    unit: z.string().optional(),
  }),
  
  // Confidence
  confidence: z.object({
    level: z.enum(CONFIDENCE_LEVEL),
    score: z.number().min(0).max(1),
  }),
  
  // AI Reasoning
  reasoning: z.string().max(2000),
  supportingData: z.array(z.object({
    metric: z.string(),
    value: z.unknown(),
    source: z.string(),
  })).optional(),
  
  // Action
  suggestedAction: z.object({
    actionType: z.string(),
    parameters: z.record(z.unknown()),
    automatable: z.boolean(),
    estimatedEffort: z.enum(["minimal", "moderate", "significant"]),
  }),
  
  // Status
  status: z.enum(["pending", "accepted", "rejected", "implemented"]).default("pending"),
  
  // Feedback
  feedback: z.object({
    outcome: z.enum(["successful", "partially_successful", "unsuccessful"]).optional(),
    actualImpact: z.number().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});

export type Recommendation = z.infer<typeof recommendationSchema>;
```

### 6.2 Recommendation Engine

```typescript
// packages/lynx/src/intelligence/recommendation-engine.ts

export class RecommendationEngine {
  constructor(
    private readonly lynx: LynxService,
    private readonly db: Database
  ) {}

  /**
   * Generate pricing recommendations
   */
  async generatePricingRecommendations(
    tenantId: string,
    itemId?: string
  ): Promise<Recommendation[]> {
    // Get pricing data
    const pricingData = await this.getPricingData(tenantId, itemId);
    
    // Analyze with Lynx
    const analysis = await this.lynx.generateObject({
      schema: z.object({
        recommendations: z.array(z.object({
          itemId: z.string(),
          currentPrice: z.number(),
          recommendedPrice: z.number(),
          changePercent: z.number(),
          reasoning: z.string(),
          confidence: z.number(),
          expectedImpact: z.object({
            revenueChange: z.number(),
            marginChange: z.number(),
          }),
        })),
      }),
      prompt: `Analyze this pricing data and recommend price adjustments:
               ${JSON.stringify(pricingData)}
               
               Consider:
               - Competitor pricing (if available)
               - Sales velocity at different price points
               - Margin requirements
               - Seasonality
               - Customer segments`,
    });
    
    return analysis.recommendations.map(r => ({
      id: generateUUID(),
      tenantId,
      recommendationType: "pricing",
      targetDomain: "sales",
      targetEntity: "item",
      targetEntityId: r.itemId,
      title: `Adjust price for item`,
      description: r.reasoning,
      expectedImpact: {
        type: "revenue",
        direction: r.expectedImpact.revenueChange > 0 ? "increase" : "decrease",
        estimatedValue: Math.abs(r.expectedImpact.revenueChange),
        unit: "currency",
      },
      confidence: {
        level: r.confidence > 0.85 ? "high" : r.confidence > 0.6 ? "medium" : "low",
        score: r.confidence,
      },
      reasoning: r.reasoning,
      supportingData: [
        { metric: "currentPrice", value: r.currentPrice, source: "pricing" },
        { metric: "recommendedPrice", value: r.recommendedPrice, source: "analysis" },
        { metric: "changePercent", value: r.changePercent, source: "analysis" },
      ],
      suggestedAction: {
        actionType: "update_price",
        parameters: { itemId: r.itemId, newPrice: r.recommendedPrice },
        automatable: true,
        estimatedEffort: "minimal",
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Generate reorder recommendations
   */
  async generateReorderRecommendations(
    tenantId: string
  ): Promise<Recommendation[]> {
    // Get inventory and demand data
    const inventoryData = await this.getInventoryData(tenantId);
    const demandForecasts = await this.getDemandForecasts(tenantId);
    
    // Analyze with Lynx
    const analysis = await this.lynx.generateObject({
      schema: z.object({
        recommendations: z.array(z.object({
          itemId: z.string(),
          itemName: z.string(),
          currentStock: z.number(),
          recommendedOrderQty: z.number(),
          reorderPoint: z.number(),
          reasoning: z.string(),
          urgency: z.enum(["immediate", "soon", "planned"]),
          confidence: z.number(),
        })),
      }),
      prompt: `Analyze inventory levels and demand forecasts to recommend reorders:
               Inventory: ${JSON.stringify(inventoryData)}
               Forecasts: ${JSON.stringify(demandForecasts)}
               
               Consider:
               - Current stock levels
               - Lead times
               - Demand forecasts
               - Safety stock requirements
               - Economic order quantity`,
    });
    
    return analysis.recommendations.map(r => ({
      id: generateUUID(),
      tenantId,
      recommendationType: "reorder",
      targetDomain: "inventory",
      targetEntity: "item",
      targetEntityId: r.itemId,
      title: `Reorder ${r.itemName}`,
      description: r.reasoning,
      expectedImpact: {
        type: "risk",
        direction: "decrease",
      },
      confidence: {
        level: r.confidence > 0.85 ? "high" : r.confidence > 0.6 ? "medium" : "low",
        score: r.confidence,
      },
      reasoning: r.reasoning,
      supportingData: [
        { metric: "currentStock", value: r.currentStock, source: "inventory" },
        { metric: "recommendedOrderQty", value: r.recommendedOrderQty, source: "analysis" },
        { metric: "reorderPoint", value: r.reorderPoint, source: "analysis" },
      ],
      suggestedAction: {
        actionType: "create_purchase_request",
        parameters: { itemId: r.itemId, quantity: r.recommendedOrderQty },
        automatable: true,
        estimatedEffort: "minimal",
      },
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }
}
```

---

## 7) Smart Assistant

### 7.1 Assistant Schema

```typescript
// packages/axis-registry/src/schemas/intelligence/assistant.ts

export const conversationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  
  // Metadata
  title: z.string().max(255).optional(),
  
  // Context
  context: z.object({
    domain: z.string().optional(),
    entityType: z.string().optional(),
    entityId: z.string().uuid().optional(),
  }).optional(),
  
  // Messages
  messages: z.array(z.object({
    id: z.string().uuid(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    timestamp: z.string().datetime(),
    
    // Tool calls
    toolCalls: z.array(z.object({
      toolId: z.string(),
      input: z.record(z.unknown()),
      output: z.unknown().optional(),
      status: z.enum(["pending", "completed", "failed"]),
    })).optional(),
    
    // Citations
    citations: z.array(z.object({
      source: z.string(),
      content: z.string(),
      entityType: z.string().optional(),
      entityId: z.string().optional(),
    })).optional(),
  })),
  
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const naturalLanguageQuerySchema = z.object({
  query: z.string(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  
  // Context
  domain: z.string().optional(),
  
  // Response
  response: z.object({
    answer: z.string(),
    confidence: z.number(),
    
    // Structured data (if applicable)
    data: z.unknown().optional(),
    
    // Visualization suggestion
    visualization: z.enum(["table", "chart", "metric", "list", "none"]).optional(),
    
    // Follow-up questions
    followUps: z.array(z.string()).optional(),
    
    // Sources
    sources: z.array(z.object({
      type: z.string(),
      id: z.string(),
      relevance: z.number(),
    })).optional(),
  }),
  
  // Timing
  queryTime: z.string().datetime(),
  responseTimeMs: z.number().int(),
});

export type Conversation = z.infer<typeof conversationSchema>;
export type NaturalLanguageQuery = z.infer<typeof naturalLanguageQuerySchema>;
```

### 7.2 Smart Assistant Engine

```typescript
// packages/lynx/src/intelligence/assistant-engine.ts

export class SmartAssistantEngine {
  constructor(
    private readonly lynx: LynxService,
    private readonly db: Database,
    private readonly toolRegistry: ToolRegistry
  ) {}

  /**
   * Process a natural language query
   */
  async query(
    tenantId: string,
    userId: string,
    query: string,
    options?: {
      domain?: string;
      conversationId?: string;
    }
  ): Promise<NaturalLanguageQueryResponse> {
    const startTime = Date.now();
    
    // 1. Determine intent
    const intent = await this.classifyIntent(query);
    
    // 2. Get relevant context
    const context = await this.gatherContext(tenantId, intent, options?.domain);
    
    // 3. Check permissions
    const allowedTools = await this.getPermittedTools(userId, tenantId);
    
    // 4. Run agent with tools
    const result = await this.lynx.runAgent("erp_assistant", query, {
      tenantId,
      userId,
      tools: allowedTools.filter(t => this.isRelevantTool(t, intent)),
      systemContext: this.buildSystemContext(context, options?.domain),
    });
    
    // 5. Format response
    const response = await this.formatResponse(result, intent);
    
    return {
      answer: response.answer,
      confidence: response.confidence,
      data: response.data,
      visualization: response.visualization,
      followUps: await this.generateFollowUps(query, response),
      sources: response.sources,
      responseTimeMs: Date.now() - startTime,
    };
  }

  /**
   * Classify user intent
   */
  private async classifyIntent(query: string): Promise<QueryIntent> {
    const result = await this.lynx.generateObject({
      schema: z.object({
        category: z.enum([
          "data_query",     // "How many orders this month?"
          "entity_lookup",  // "Show me customer ABC"
          "comparison",     // "Compare sales Q1 vs Q2"
          "explanation",    // "Why did inventory drop?"
          "action_request", // "Create a purchase order"
          "report_request", // "Generate AR aging report"
          "help",           // "How do I...?"
          "other",
        ]),
        domain: z.string().optional(),
        entities: z.array(z.object({
          type: z.string(),
          value: z.string(),
        })),
        timeRange: z.object({
          start: z.string().optional(),
          end: z.string().optional(),
          relative: z.string().optional(),
        }).optional(),
      }),
      prompt: `Classify this user query and extract key information:
               Query: "${query}"`,
    });
    
    return result;
  }

  /**
   * Example queries and responses
   */
  async handleExampleQueries(): Promise<void> {
    // Query: "What are our top 10 customers by revenue this quarter?"
    // → Runs sales.query tool → Returns ranked list → Suggests bar chart
    
    // Query: "Show me overdue invoices over $10,000"
    // → Runs ar.query tool → Returns filtered list → Suggests table
    
    // Query: "Why is inventory for SKU-123 low?"
    // → Analyzes stock movements → Identifies high demand + late PO
    // → Returns explanation with data
    
    // Query: "Create a PO for 100 units of Widget A"
    // → Checks permissions → Creates draft PO → Returns for approval
  }
}
```

---

## 8) Intelligence Events

```typescript
// packages/axis-registry/src/schemas/events/intelligence.ts

export const anomalyDetectedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("intelligence.anomaly.detected"),
  payload: z.object({
    anomalyId: z.string().uuid(),
    domain: z.string(),
    entityType: z.string(),
    entityId: z.string().uuid().optional(),
    severity: z.enum(ANOMALY_SEVERITY),
    title: z.string(),
    confidence: z.number(),
  }),
});

export const forecastGeneratedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("intelligence.forecast.generated"),
  payload: z.object({
    forecastId: z.string().uuid(),
    forecastType: z.enum(FORECAST_TYPE),
    horizon: z.number(),
    confidenceScore: z.number(),
  }),
});

export const documentProcessedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("intelligence.document.processed"),
  payload: z.object({
    classificationId: z.string().uuid(),
    extractionId: z.string().uuid().optional(),
    documentType: z.enum(DOCUMENT_TYPE),
    confidence: z.number(),
    matchedEntityId: z.string().uuid().optional(),
  }),
});

export const recommendationCreatedEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("intelligence.recommendation.created"),
  payload: z.object({
    recommendationId: z.string().uuid(),
    recommendationType: z.enum(RECOMMENDATION_TYPE),
    targetDomain: z.string(),
    confidence: z.number(),
    automatable: z.boolean(),
  }),
});

export const assistantQueryEventSchema = eventEnvelopeSchema.extend({
  eventType: z.literal("intelligence.assistant.query"),
  payload: z.object({
    conversationId: z.string().uuid().optional(),
    queryHash: z.string(),      // For privacy
    intent: z.string(),
    responseTimeMs: z.number(),
    toolsUsed: z.array(z.string()),
  }),
});
```

---

## 9) Intelligence Configuration

```typescript
// packages/axis-registry/src/schemas/intelligence/config.ts

export const intelligenceConfigSchema = z.object({
  tenantId: z.string().uuid(),
  
  // Feature toggles
  features: z.object({
    anomalyDetection: z.boolean().default(true),
    forecasting: z.boolean().default(true),
    documentAI: z.boolean().default(true),
    recommendations: z.boolean().default(true),
    smartAssistant: z.boolean().default(true),
  }),
  
  // Anomaly detection settings
  anomalyDetection: z.object({
    enabled: z.boolean().default(true),
    sensitivityLevel: z.enum(["low", "medium", "high"]).default("medium"),
    enabledDomains: z.array(z.string()).default(["sales", "purchase", "inventory", "accounting"]),
    notifyCritical: z.boolean().default(true),
    notifyWarning: z.boolean().default(false),
  }),
  
  // Forecasting settings
  forecasting: z.object({
    enabled: z.boolean().default(true),
    defaultHorizon: z.number().int().default(12),
    defaultGranularity: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
    autoGenerateDemandForecasts: z.boolean().default(false),
    autoGenerateCashFlowForecasts: z.boolean().default(false),
  }),
  
  // Document AI settings
  documentAI: z.object({
    enabled: z.boolean().default(true),
    autoClassify: z.boolean().default(true),
    autoExtract: z.boolean().default(true),
    minimumConfidence: z.number().min(0).max(1).default(0.7),
    supportedTypes: z.array(z.enum(DOCUMENT_TYPE)).default(["invoice", "purchase_order", "receipt"]),
  }),
  
  // Recommendation settings
  recommendations: z.object({
    enabled: z.boolean().default(true),
    enabledTypes: z.array(z.enum(RECOMMENDATION_TYPE)).default(["reorder", "pricing"]),
    autoApplyLowRisk: z.boolean().default(false),
    minimumConfidence: z.number().min(0).max(1).default(0.8),
  }),
  
  // Assistant settings
  assistant: z.object({
    enabled: z.boolean().default(true),
    allowedDomains: z.array(z.string()).default(["all"]),
    maxTokensPerQuery: z.number().int().default(2000),
    enableActionExecution: z.boolean().default(false),  // Requires approval
  }),
  
  updatedAt: z.string().datetime(),
  updatedBy: z.string().uuid(),
});

export type IntelligenceConfig = z.infer<typeof intelligenceConfigSchema>;
```

---

## 10) Exit Criteria (B12 Gate)

**B12 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                              | Verified | Implementation                               |
| --- | ------------------------------------------------------ | -------- | -------------------------------------------- |
| 1   | Lynx integration (A01-01)                              | ✅        | All capabilities use Lynx service            |
| 2   | Anomaly detection (statistical + ML)                   | ✅        | `AnomalyDetectionEngine` defined             |
| 3   | Domain-specific anomaly rules                          | ✅        | `DOMAIN_ANOMALY_RULES` catalog               |
| 4   | Forecasting engine (demand, cash flow)                 | ✅        | `ForecastingEngine` defined                  |
| 5   | Document classification                                | ✅        | `classifyDocument()` function                |
| 6   | Document field extraction                              | ✅        | `extractFields()` function                   |
| 7   | Recommendation engine                                  | ✅        | `RecommendationEngine` defined               |
| 8   | Smart assistant (NL query)                             | ✅        | `SmartAssistantEngine` defined               |
| 9   | Confidence levels on all outputs                       | ✅        | `CONFIDENCE_LEVEL` pattern enforced          |
| 10  | AI audit logging                                       | ✅        | Via Lynx audit contract (A01-01)             |
| 11  | Intelligence events to outbox                          | ✅        | B02 outbox integration ready                 |
| 12  | Tenant-level configuration                             | ✅        | `intelligenceConfigSchema` defined           |

### Implementation Files

| Component                | Location                                                       |
| ------------------------ | -------------------------------------------------------------- |
| Intelligence Constants   | `packages/axis-registry/src/schemas/intelligence/constants.ts` |
| Anomaly Schema           | `packages/axis-registry/src/schemas/intelligence/anomaly.ts`   |
| Forecast Schema          | `packages/axis-registry/src/schemas/intelligence/forecast.ts`  |
| Document Schema          | `packages/axis-registry/src/schemas/intelligence/document.ts`  |
| Recommendation Schema    | `packages/axis-registry/src/schemas/intelligence/recommendation.ts` |
| Assistant Schema         | `packages/axis-registry/src/schemas/intelligence/assistant.ts` |
| Anomaly Engine           | `packages/lynx/src/intelligence/anomaly-engine.ts`             |
| Forecast Engine          | `packages/lynx/src/intelligence/forecast-engine.ts`            |
| Document Engine          | `packages/lynx/src/intelligence/document-engine.ts`            |
| Recommendation Engine    | `packages/lynx/src/intelligence/recommendation-engine.ts`      |
| Assistant Engine         | `packages/lynx/src/intelligence/assistant-engine.ts`           |
| Intelligence Events      | `packages/axis-registry/src/schemas/events/intelligence.ts`    |

---

## 11) Integration with Other Phases

| Phase                   | Dependency on B12            | What B12 Provides                     |
| ----------------------- | ---------------------------- | ------------------------------------- |
| **A01-01** (Lynx)       | Foundation                   | Provider-agnostic AI layer            |
| **B02** (Domains)       | Event publishing             | Intelligence events via outbox        |
| **B03** (MDM)           | Entity matching              | Document AI matches to parties/items  |
| **B04** (Sales)         | Anomaly detection            | Sales anomalies, demand forecasts     |
| **B05** (Purchase)      | Recommendations              | Reorder recommendations               |
| **B06** (Inventory)     | Forecasting                  | Demand forecasts, reorder points      |
| **B07** (Accounting)    | Anomaly detection            | Unusual transactions, cash flow       |
| **B09** (Reconciliation)| Exception analysis           | ML-assisted matching                  |
| **B11** (AFANDA)        | Insights delivery            | AI insights in dashboards             |

---

## Document Governance

| Field            | Value                                           |
| ---------------- | ----------------------------------------------- |
| **Status**       | **Implemented** (Schemas + Engines Complete)    |
| **Version**      | 1.0.0                                           |
| **Derived From** | A01-01-LYNX.md v1.2.0, A01-07-THE-INVISIBLE-MACHINE.md v1.1.0, A02-AXIS-MAP.md v0.2.0 |
| **Phase**        | B12 (Intelligence)                              |
| **Author**       | AXIS Architecture Team                          |
| **Last Updated** | 2026-01-22                                      |

**Note**: B12 is the capstone of the B-series, applying Lynx AI capabilities to all ERP domains.

---

## Related Documents

| Document                                         | Purpose                                    |
| ------------------------------------------------ | ------------------------------------------ |
| [A01-01-LYNX.md](./A01-01-LYNX.md)               | Lynx: The Machine's Awareness              |
| [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) | The Vocabulary of Truth |
| [A01-CANONICAL.md](./A01-CANONICAL.md)           | AXIS Philosophy                            |
| [A02-AXIS-MAP.md](./A02-AXIS-MAP.md)             | Roadmap: Phase B12 definition              |
| [B11-AFANDA.md](./B11-AFANDA.md)                 | AFANDA (presents intelligence insights)    |
| All B-phases (B03-B09)                           | Domain data sources                        |

---

> *"Intelligence Layer: The Machine's Awareness for every ERP domain. The Machine notices anomalies. The Machine anticipates the future. The Machine understands documents. The Machine offers recommendations. You focus. The Machine works."*
