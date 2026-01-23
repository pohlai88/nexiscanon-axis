/**
 * Predictive Analytics Service
 * 
 * Statistical models for business forecasting and predictions:
 * - Churn Prediction: Identify customers likely to churn
 * - Revenue Forecasting: Predict future revenue based on trends
 * - Customer Lifetime Value Prediction: Estimate future CLV
 * - Purchase Probability: Predict next purchase timing
 * 
 * METHODS:
 * - Rule-based models (immediate deployment)
 * - Statistical analysis (moving averages, trends)
 * - Scoring models (weighted factors)
 * 
 * NOTE: This is a lightweight implementation. For production ML,
 * integrate with Python services (scikit-learn, TensorFlow, etc.)
 */

import { sql, eq, and, gte, desc } from "drizzle-orm";
import type { Database } from "../../client";
import { salesOrders } from "../../schema/sales/order";
import { salesInvoices } from "../../schema/sales/invoice";
import { customers } from "../../schema/customer";

// ============================================================================
// Types
// ============================================================================

export interface ChurnPrediction {
  customerId: string;
  customerNumber: string;
  customerName: string;
  churnScore: number; // 0-100 (100 = highest risk)
  churnRisk: "low" | "medium" | "high" | "critical";
  // Factors contributing to churn risk
  daysSinceLastOrder: number;
  orderFrequencyDecline: number; // % decline in recent orders
  revenueDecline: number; // % decline in recent revenue
  outstandingBalance: string;
  // Recommendations
  recommendations: string[];
  lastOrderDate?: Date;
}

export interface RevenueForecast {
  forecastPeriod: string; // e.g., "2026-02"
  forecastLabel: string; // e.g., "February 2026"
  // Historical data
  historicalRevenue: string;
  historicalOrders: number;
  // Forecast
  predictedRevenue: string;
  predictedOrders: number;
  confidenceInterval: {
    lower: string;
    upper: string;
  };
  // Method used
  method: "moving_average" | "linear_trend" | "seasonal";
}

export interface CLVPrediction {
  customerId: string;
  customerNumber: string;
  customerName: string;
  // Historical
  historicalRevenue: string;
  historicalOrders: number;
  daysSinceFirstOrder: number;
  // Predicted
  predictedLifetimeValue: string;
  predictedOrdersNext12Months: number;
  predictedRevenueNext12Months: string;
  // Confidence
  confidence: "low" | "medium" | "high";
}

export interface PurchaseProbability {
  customerId: string;
  customerNumber: string;
  customerName: string;
  // Purchase pattern
  averageDaysBetweenPurchases: number;
  daysSinceLastPurchase: number;
  // Prediction
  probabilityNext30Days: number; // 0-100%
  probabilityNext60Days: number;
  probabilityNext90Days: number;
  expectedPurchaseDate?: Date;
  purchaseLikelihood: "very_low" | "low" | "medium" | "high" | "very_high";
}

export interface PredictiveAnalyticsOptions {
  tenantId: string;
  customerId?: string; // Specific customer or all
  lookbackDays?: number; // Historical data window (default: 365)
  forecastPeriods?: number; // Periods to forecast (default: 3)
}

// ============================================================================
// Churn Prediction
// ============================================================================

/**
 * Predicts customer churn risk.
 * 
 * Factors considered:
 * - Days since last order (recency)
 * - Order frequency decline
 * - Revenue decline
 * - Outstanding balance
 */
export async function predictChurn(
  db: Database,
  options: PredictiveAnalyticsOptions
): Promise<ChurnPrediction[]> {
  const { tenantId, customerId, lookbackDays = 365 } = options;

  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - lookbackDays);

  // Get customer order history
  const customerFilters = [eq(customers.tenantId, tenantId), eq(customers.isActive, true)];
  if (customerId) {
    customerFilters.push(eq(customers.id, customerId));
  }

  const customersList = await db
    .select({
      customerId: customers.id,
      customerNumber: customers.customerNumber,
      customerName: customers.customerName,
    })
    .from(customers)
    .where(and(...customerFilters));

  const predictions: ChurnPrediction[] = [];

  for (const customer of customersList) {
    // Get all orders
    const orders = await db
      .select({
        orderDate: salesOrders.orderDate,
        totalAmount: salesOrders.totalAmount,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.customerId, customer.customerId),
          eq(salesOrders.tenantId, tenantId)
        )
      )
      .orderBy(desc(salesOrders.orderDate));

    if (orders.length === 0) continue;

    // Calculate metrics
    const firstOrder = orders[0];
    if (!firstOrder) continue;
    const lastOrderDate = firstOrder.orderDate;
    const daysSinceLastOrder = Math.floor(
      (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate frequency decline (recent vs historical)
    const recentOrders = orders.filter(
      (o) => o.orderDate >= lookbackDate
    ).length;
    const historicalOrders = orders.length;
    const expectedRecentOrders = historicalOrders * 0.5; // Expect 50% of orders in recent period
    const orderFrequencyDecline = expectedRecentOrders > 0
      ? Math.max(0, ((expectedRecentOrders - recentOrders) / expectedRecentOrders) * 100)
      : 0;

    // Calculate revenue decline
    const recentRevenue = orders
      .filter((o) => o.orderDate >= lookbackDate)
      .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const historicalRevenue = orders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount),
      0
    );
    const expectedRecentRevenue = historicalRevenue * 0.5;
    const revenueDecline = expectedRecentRevenue > 0
      ? Math.max(0, ((expectedRecentRevenue - recentRevenue) / expectedRecentRevenue) * 100)
      : 0;

    // Get outstanding balance
    const [outstandingResult] = await db
      .select({
        outstanding: sql<string>`COALESCE(SUM(CASE WHEN ${salesInvoices.status} IN ('draft', 'issued') THEN ${salesInvoices.totalAmount}::numeric ELSE 0 END), 0)::text`,
      })
      .from(salesInvoices)
      .where(
        and(
          eq(salesInvoices.customerId, customer.customerId),
          eq(salesInvoices.tenantId, tenantId)
        )
      );

    const outstandingBalance = outstandingResult?.outstanding || "0";

    // Calculate churn score (0-100)
    let churnScore = 0;

    // Recency factor (0-40 points)
    if (daysSinceLastOrder > 180) churnScore += 40;
    else if (daysSinceLastOrder > 90) churnScore += 30;
    else if (daysSinceLastOrder > 60) churnScore += 20;
    else if (daysSinceLastOrder > 30) churnScore += 10;

    // Frequency decline factor (0-30 points)
    churnScore += Math.min(30, orderFrequencyDecline * 0.3);

    // Revenue decline factor (0-20 points)
    churnScore += Math.min(20, revenueDecline * 0.2);

    // Outstanding balance factor (0-10 points)
    if (parseFloat(outstandingBalance) > 1000) churnScore += 10;
    else if (parseFloat(outstandingBalance) > 500) churnScore += 5;

    // Determine risk level
    let churnRisk: ChurnPrediction["churnRisk"];
    if (churnScore >= 75) churnRisk = "critical";
    else if (churnScore >= 50) churnRisk = "high";
    else if (churnScore >= 25) churnRisk = "medium";
    else churnRisk = "low";

    // Generate recommendations
    const recommendations: string[] = [];
    if (daysSinceLastOrder > 90) {
      recommendations.push("Send re-engagement campaign");
    }
    if (orderFrequencyDecline > 50) {
      recommendations.push("Offer loyalty discount");
    }
    if (parseFloat(outstandingBalance) > 0) {
      recommendations.push("Follow up on outstanding invoices");
    }
    if (revenueDecline > 50) {
      recommendations.push("Schedule account review call");
    }

    predictions.push({
      customerId: customer.customerId,
      customerNumber: customer.customerNumber,
      customerName: customer.customerName,
      churnScore: Math.round(churnScore),
      churnRisk,
      daysSinceLastOrder,
      orderFrequencyDecline: Math.round(orderFrequencyDecline),
      revenueDecline: Math.round(revenueDecline),
      outstandingBalance,
      recommendations,
      lastOrderDate,
    });
  }

  // Sort by churn score (highest risk first)
  predictions.sort((a, b) => b.churnScore - a.churnScore);

  return predictions;
}

// ============================================================================
// Revenue Forecasting
// ============================================================================

/**
 * Forecasts future revenue using moving average.
 */
export async function forecastRevenue(
  db: Database,
  options: PredictiveAnalyticsOptions
): Promise<RevenueForecast[]> {
  const { tenantId, forecastPeriods = 3 } = options;

  // Get historical monthly revenue (last 12 months)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);

  const monthlyRevenue = await db
    .select({
      year: sql<number>`EXTRACT(YEAR FROM ${salesOrders.orderDate})::int`,
      month: sql<number>`EXTRACT(MONTH FROM ${salesOrders.orderDate})::int`,
      revenue: sql<string>`COALESCE(SUM(${salesOrders.totalAmount}::numeric), 0)::text`,
      orders: sql<number>`COUNT(*)::int`,
    })
    .from(salesOrders)
    .where(
      and(
        eq(salesOrders.tenantId, tenantId),
        gte(salesOrders.orderDate, startDate)
      )
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${salesOrders.orderDate})`,
      sql`EXTRACT(MONTH FROM ${salesOrders.orderDate})`
    )
    .orderBy(sql`EXTRACT(YEAR FROM ${salesOrders.orderDate})`, sql`EXTRACT(MONTH FROM ${salesOrders.orderDate})`);

  if (monthlyRevenue.length < 3) {
    return []; // Not enough historical data
  }

  // Calculate moving average (last 3 months)
  const revenueValues = monthlyRevenue.map((m) => parseFloat(m.revenue));
  const orderValues = monthlyRevenue.map((m) => m.orders);

  const avgRevenue =
    revenueValues.slice(-3).reduce((sum, v) => sum + v, 0) / 3;
  const avgOrders =
    orderValues.slice(-3).reduce((sum, v) => sum + v, 0) / 3;

  // Calculate standard deviation for confidence interval
  const variance =
    revenueValues
      .slice(-3)
      .reduce((sum, v) => sum + Math.pow(v - avgRevenue, 2), 0) / 3;
  const stdDev = Math.sqrt(variance);

  const forecasts: RevenueForecast[] = [];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Generate forecasts
  const lastMonth = monthlyRevenue[monthlyRevenue.length - 1];
  if (!lastMonth) {
    return forecasts;
  }
  let currentYear = lastMonth.year;
  let currentMonth = lastMonth.month;

  for (let i = 0; i < forecastPeriods; i++) {
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }

    const forecastPeriod = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    const forecastLabel = `${monthNames[currentMonth - 1]} ${currentYear}`;
    const lastRevenueValue = revenueValues[revenueValues.length - 1] ?? 0;
    const lastOrderValue = orderValues[orderValues.length - 1] ?? 0;

    forecasts.push({
      forecastPeriod,
      forecastLabel,
      historicalRevenue: lastRevenueValue.toFixed(4),
      historicalOrders: lastOrderValue,
      predictedRevenue: avgRevenue.toFixed(4),
      predictedOrders: Math.round(avgOrders),
      confidenceInterval: {
        lower: Math.max(0, avgRevenue - 1.96 * stdDev).toFixed(4),
        upper: (avgRevenue + 1.96 * stdDev).toFixed(4),
      },
      method: "moving_average",
    });
  }

  return forecasts;
}

// ============================================================================
// Purchase Probability
// ============================================================================

/**
 * Predicts when customer is likely to purchase next.
 */
export async function predictNextPurchase(
  db: Database,
  options: PredictiveAnalyticsOptions
): Promise<PurchaseProbability[]> {
  const { tenantId, customerId } = options;

  const customerFilters = [eq(customers.tenantId, tenantId), eq(customers.isActive, true)];
  if (customerId) {
    customerFilters.push(eq(customers.id, customerId));
  }

  const customersList = await db
    .select({
      customerId: customers.id,
      customerNumber: customers.customerNumber,
      customerName: customers.customerName,
    })
    .from(customers)
    .where(and(...customerFilters));

  const predictions: PurchaseProbability[] = [];

  for (const customer of customersList) {
    const orders = await db
      .select({
        orderDate: salesOrders.orderDate,
      })
      .from(salesOrders)
      .where(
        and(
          eq(salesOrders.customerId, customer.customerId),
          eq(salesOrders.tenantId, tenantId)
        )
      )
      .orderBy(desc(salesOrders.orderDate));

    if (orders.length < 2) continue; // Need at least 2 orders

    const firstOrder = orders[0];
    if (!firstOrder) continue;

    // Calculate average days between purchases
    let totalDays = 0;
    for (let i = 0; i < orders.length - 1; i++) {
      const currentOrder = orders[i];
      const nextOrder = orders[i + 1];
      if (!currentOrder || !nextOrder) continue;
      const daysDiff = Math.floor(
        (currentOrder.orderDate.getTime() - nextOrder.orderDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      totalDays += daysDiff;
    }
    const avgDaysBetweenPurchases = Math.round(totalDays / (orders.length - 1));

    // Days since last purchase
    const daysSinceLastPurchase = Math.floor(
      (Date.now() - firstOrder.orderDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate probability
    const ratio = daysSinceLastPurchase / avgDaysBetweenPurchases;

    // Probability increases as we approach average interval
    let probability30 = 0;
    let probability60 = 0;
    let probability90 = 0;

    if (ratio >= 0.8) {
      // Close to typical purchase interval
      probability30 = Math.min(100, 20 + ratio * 60);
      probability60 = Math.min(100, 40 + ratio * 50);
      probability90 = Math.min(100, 60 + ratio * 40);
    } else {
      // Not yet at typical interval
      probability30 = Math.min(30, ratio * 30);
      probability60 = Math.min(50, ratio * 60);
      probability90 = Math.min(70, ratio * 80);
    }

    // Expected purchase date
    const expectedDaysUntilPurchase = Math.max(
      0,
      avgDaysBetweenPurchases - daysSinceLastPurchase
    );
    const expectedPurchaseDate = new Date();
    expectedPurchaseDate.setDate(
      expectedPurchaseDate.getDate() + expectedDaysUntilPurchase
    );

    // Likelihood category
    let purchaseLikelihood: PurchaseProbability["purchaseLikelihood"];
    if (probability30 >= 80) purchaseLikelihood = "very_high";
    else if (probability30 >= 60) purchaseLikelihood = "high";
    else if (probability30 >= 40) purchaseLikelihood = "medium";
    else if (probability30 >= 20) purchaseLikelihood = "low";
    else purchaseLikelihood = "very_low";

    predictions.push({
      customerId: customer.customerId,
      customerNumber: customer.customerNumber,
      customerName: customer.customerName,
      averageDaysBetweenPurchases: avgDaysBetweenPurchases,
      daysSinceLastPurchase: daysSinceLastPurchase,
      probabilityNext30Days: Math.round(probability30),
      probabilityNext60Days: Math.round(probability60),
      probabilityNext90Days: Math.round(probability90),
      expectedPurchaseDate,
      purchaseLikelihood,
    });
  }

  // Sort by 30-day probability (highest first)
  predictions.sort((a, b) => b.probabilityNext30Days - a.probabilityNext30Days);

  return predictions;
}

// ============================================================================
// Export Public API
// ============================================================================

export const PredictiveAnalyticsService = {
  predictChurn,
  forecastRevenue,
  predictNextPurchase,
} as const;
