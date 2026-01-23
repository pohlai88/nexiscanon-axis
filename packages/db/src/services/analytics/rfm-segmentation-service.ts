/**
 * RFM Segmentation Service
 * 
 * RFM Analysis: Recency, Frequency, Monetary
 * Industry-standard customer segmentation for targeting and retention.
 * 
 * SEGMENTS:
 * - Champions: Best customers (high R, F, M)
 * - Loyal Customers: Regular buyers (high F, M)
 * - Potential Loyalists: Recent customers with potential (high R, M)
 * - At Risk: Used to buy frequently (low R, high F, M)
 * - Can't Lose Them: Made big purchases, long time ago (low R, high M)
 * - Hibernating: Last purchase long ago, low spenders (low R, F, M)
 * - Lost: Haven't purchased in very long time (very low R)
 * 
 * SCORING:
 * - Each metric scored 1-5 (5 = best)
 * - Combined RFM score (e.g., "555" = Champion)
 * - Segment assigned based on score pattern
 */

import { sql, eq, and } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders } from "../../schema/sales/order";
import { customers } from "../../schema/customer";

// ============================================================================
// Types
// ============================================================================

export interface RFMScore {
  customerId: string;
  customerNumber: string;
  customerName: string;
  // Raw metrics
  recency: number; // Days since last purchase
  frequency: number; // Total number of orders
  monetary: string; // Total revenue
  // Scores (1-5, 5 = best)
  recencyScore: number;
  frequencyScore: number;
  monetaryScore: number;
  // Combined
  rfmScore: string; // e.g., "555", "345"
  rfmSegment: RFMSegment;
  // Additional insights
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  averageOrderValue: string;
}

export type RFMSegment =
  | "champions"
  | "loyal_customers"
  | "potential_loyalists"
  | "recent_customers"
  | "promising"
  | "need_attention"
  | "about_to_sleep"
  | "at_risk"
  | "cant_lose_them"
  | "hibernating"
  | "lost";

export interface RFMSegmentSummary {
  segment: RFMSegment;
  customerCount: number;
  totalRevenue: string;
  averageRecency: number;
  averageFrequency: number;
  averageMonetary: string;
  percentageOfCustomers: number;
  percentageOfRevenue: number;
}

export interface RFMAnalysisOptions {
  tenantId: string;
  asOfDate?: Date; // Default: today
  minOrders?: number; // Minimum orders to include (default: 1)
}

// ============================================================================
// Main RFM Functions
// ============================================================================

/**
 * Calculates RFM scores for all customers.
 */
export async function calculateRFMScores(
  db: Database,
  options: RFMAnalysisOptions
): Promise<RFMScore[]> {
  const { tenantId, asOfDate = new Date(), minOrders = 1 } = options;

  // Get raw RFM metrics for all customers
  const rawMetrics = await db
    .select({
      customerId: customers.id,
      customerNumber: customers.customerNumber,
      customerName: customers.customerName,
      recency: sql<number>`EXTRACT(DAY FROM ${asOfDate}::timestamp - MAX(${salesOrders.orderDate}))::int`,
      frequency: sql<number>`COUNT(${salesOrders.id})::int`,
      monetary: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      firstOrderDate: sql<Date>`MIN(${salesOrders.orderDate})`,
      lastOrderDate: sql<Date>`MAX(${salesOrders.orderDate})`,
      averageOrderValue: sql<string>`COALESCE(AVG(${salesOrders.totalAmount}::numeric), 0)::text`,
    })
    .from(customers)
    .innerJoin(
      salesOrders,
      and(
        eq(salesOrders.customerId, customers.id),
        eq(salesOrders.tenantId, tenantId)
      )
    )
    .where(eq(customers.tenantId, tenantId))
    .groupBy(customers.id, customers.customerNumber, customers.customerName)
    .having(sql`COUNT(${salesOrders.id}) >= ${minOrders}`);

  if (rawMetrics.length === 0) {
    return [];
  }

  // Calculate quintiles for scoring
  const recencies = rawMetrics.map((m) => m.recency).sort((a, b) => a - b);
  const frequencies = rawMetrics.map((m) => m.frequency).sort((a, b) => a - b);
  const monetaries = rawMetrics
    .map((m) => parseFloat(m.monetary))
    .sort((a, b) => a - b);

  const recencyQuintiles = calculateQuintiles(recencies);
  const frequencyQuintiles = calculateQuintiles(frequencies);
  const monetaryQuintiles = calculateQuintiles(monetaries);

  // Score each customer
  const rfmScores: RFMScore[] = rawMetrics.map((metric) => {
    // Recency: Lower is better (reverse score)
    const recencyScore = 6 - scoreValue(metric.recency, recencyQuintiles);

    // Frequency: Higher is better
    const frequencyScore = scoreValue(metric.frequency, frequencyQuintiles);

    // Monetary: Higher is better
    const monetaryScore = scoreValue(
      parseFloat(metric.monetary),
      monetaryQuintiles
    );

    const rfmScore = `${recencyScore}${frequencyScore}${monetaryScore}`;
    const rfmSegment = assignSegment(recencyScore, frequencyScore, monetaryScore);

    return {
      customerId: metric.customerId,
      customerNumber: metric.customerNumber,
      customerName: metric.customerName,
      recency: metric.recency,
      frequency: metric.frequency,
      monetary: metric.monetary,
      recencyScore,
      frequencyScore,
      monetaryScore,
      rfmScore,
      rfmSegment,
      firstOrderDate: metric.firstOrderDate,
      lastOrderDate: metric.lastOrderDate,
      averageOrderValue: metric.averageOrderValue,
    };
  });

  return rfmScores;
}

/**
 * Gets RFM segment summary (aggregated statistics per segment).
 */
export async function getRFMSegmentSummary(
  db: Database,
  options: RFMAnalysisOptions
): Promise<RFMSegmentSummary[]> {
  const rfmScores = await calculateRFMScores(db, options);

  if (rfmScores.length === 0) {
    return [];
  }

  // Group by segment
  const segmentMap = new Map<RFMSegment, RFMScore[]>();
  for (const score of rfmScores) {
    const existing = segmentMap.get(score.rfmSegment) || [];
    existing.push(score);
    segmentMap.set(score.rfmSegment, existing);
  }

  // Calculate totals for percentages
  const totalCustomers = rfmScores.length;
  const totalRevenue = rfmScores.reduce(
    (sum, s) => sum + parseFloat(s.monetary),
    0
  );

  // Build summary for each segment
  const summaries: RFMSegmentSummary[] = [];

  for (const [segment, scores] of segmentMap.entries()) {
    const customerCount = scores.length;
    const segmentRevenue = scores.reduce(
      (sum, s) => sum + parseFloat(s.monetary),
      0
    );
    const avgRecency =
      scores.reduce((sum, s) => sum + s.recency, 0) / customerCount;
    const avgFrequency =
      scores.reduce((sum, s) => sum + s.frequency, 0) / customerCount;
    const avgMonetary = segmentRevenue / customerCount;

    summaries.push({
      segment,
      customerCount,
      totalRevenue: segmentRevenue.toFixed(4),
      averageRecency: Math.round(avgRecency),
      averageFrequency: Math.round(avgFrequency),
      averageMonetary: avgMonetary.toFixed(4),
      percentageOfCustomers: (customerCount / totalCustomers) * 100,
      percentageOfRevenue: (segmentRevenue / totalRevenue) * 100,
    });
  }

  // Sort by revenue (highest first)
  summaries.sort(
    (a, b) => parseFloat(b.totalRevenue) - parseFloat(a.totalRevenue)
  );

  return summaries;
}

/**
 * Gets customers by RFM segment.
 */
export async function getCustomersBySegment(
  db: Database,
  options: RFMAnalysisOptions & { segment: RFMSegment }
): Promise<RFMScore[]> {
  const allScores = await calculateRFMScores(db, options);
  return allScores.filter((s) => s.rfmSegment === options.segment);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculates quintiles (20th, 40th, 60th, 80th percentiles).
 */
function calculateQuintiles(sortedValues: number[]): number[] {
  const len = sortedValues.length;
  return [
    sortedValues[Math.floor(len * 0.2)] ?? 0,
    sortedValues[Math.floor(len * 0.4)] ?? 0,
    sortedValues[Math.floor(len * 0.6)] ?? 0,
    sortedValues[Math.floor(len * 0.8)] ?? 0,
  ];
}

/**
 * Scores a value based on quintiles (1-5).
 */
function scoreValue(value: number, quintiles: number[]): number {
  const q0 = quintiles[0] ?? 0;
  const q1 = quintiles[1] ?? 0;
  const q2 = quintiles[2] ?? 0;
  const q3 = quintiles[3] ?? 0;
  if (value <= q0) return 1;
  if (value <= q1) return 2;
  if (value <= q2) return 3;
  if (value <= q3) return 4;
  return 5;
}

/**
 * Assigns RFM segment based on scores.
 * 
 * Based on industry-standard RFM segmentation logic.
 */
function assignSegment(
  r: number,
  f: number,
  m: number
): RFMSegment {
  // Champions: Best customers (bought recently, often, and spend the most)
  if (r >= 4 && f >= 4 && m >= 4) return "champions";

  // Loyal Customers: Buy frequently (high F, M)
  if (r >= 3 && f >= 4 && m >= 4) return "loyal_customers";

  // Potential Loyalists: Recent customers with potential (high R, M)
  if (r >= 4 && f >= 2 && m >= 3) return "potential_loyalists";

  // Recent Customers: Bought recently but not much
  if (r >= 4 && f <= 2) return "recent_customers";

  // Promising: Recent shoppers with good spend
  if (r >= 3 && f <= 2 && m >= 3) return "promising";

  // Need Attention: Above average recency, frequency, and monetary
  if (r >= 3 && f >= 3 && m >= 3) return "need_attention";

  // About to Sleep: Below average recency, frequency, and monetary
  if (r >= 2 && f <= 2 && m <= 2) return "about_to_sleep";

  // At Risk: Spent big money, purchased often but long time ago
  if (r <= 2 && f >= 3 && m >= 3) return "at_risk";

  // Can't Lose Them: Made big purchases, but long time ago
  if (r <= 1 && f >= 4 && m >= 4) return "cant_lose_them";

  // Hibernating: Last purchase long ago, low spenders
  if (r <= 2 && f <= 2 && m <= 2) return "hibernating";

  // Lost: Haven't purchased in very long time
  if (r <= 1) return "lost";

  // Default: About to sleep
  return "about_to_sleep";
}

// ============================================================================
// Export Public API
// ============================================================================

export const RFMSegmentationService = {
  calculateRFMScores,
  getRFMSegmentSummary,
  getCustomersBySegment,
} as const;
