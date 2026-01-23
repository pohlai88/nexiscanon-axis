/**
 * Stock Move Posting Service (B06)
 *
 * AXIS Canonical Implementation:
 * - Posts stock moves to GL (inventory accounts)
 * - Creates valuation entries (weighted avg / FIFO)
 * - Integrates with B07 GL Posting Engine
 *
 * @see .cursor/ERP/A01-CANONICAL.md §3 (Goods Pillar)
 * @see .cursor/ERP/B06-INVENTORY.md (Stock Moves)
 */

import type { Database } from "../..";
import type { StockMove, JournalEntry } from "@axis/registry";
import { GLPostingEngine } from "../accounting/gl-posting-engine";
import { ValuationEngine } from "./valuation-engine";

// ============================================================================
// Stock Move Posting Types
// ============================================================================

export interface StockMovePostingResult {
  success: boolean;
  valuationBatchId?: string;
  postingBatchId?: string;
  journalId?: string;
  totalValue: string;
  errors?: string[];
}

// ============================================================================
// Stock Move Posting
// ============================================================================

/**
 * Posts stock move to GL
 *
 * AXIS Flow:
 * 1. Valuate stock move (weighted avg / FIFO / standard)
 * 2. Create journal entry (Dr/Cr inventory accounts)
 * 3. Post to GL via B07 Posting Engine
 * 4. Link valuation batch to posting batch
 *
 * @param _db - Database connection
 * @param stockMove - Stock move to post
 * @param _context - 6W1H _context
 * @returns Posting result
 */
export async function postStockMoveToGL(
  _db: Database,
  stockMove: StockMove,
  _context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): Promise<StockMovePostingResult> {
  // Step 1: Valuate stock move
  const costingMethod = stockMove.lines[0]?.costingMethod || "weighted_average";
  
  let valuationResult;
  switch (costingMethod) {
    case "weighted_average":
      valuationResult = await ValuationEngine.valuateWeightedAverage(_db, stockMove);
      break;
    case "fifo":
      valuationResult = await ValuationEngine.valuateFIFO(_db, stockMove);
      break;
    case "standard":
      valuationResult = await ValuationEngine.valuateStandardCost(_db, stockMove);
      break;
    default:
      return {
        success: false,
        totalValue: "0",
        errors: [`Unknown costing method: ${costingMethod}`],
      };
  }

  if (!valuationResult.success) {
    return {
      success: false,
      totalValue: "0",
      errors: valuationResult.errors,
    };
  }

  // Step 2: Create journal entry
  const journal = createInventoryJournal(stockMove, valuationResult, _context);

  // Step 3: Post to GL
  const glResult = await GLPostingEngine.postJournalToGL(journal, _db, _context);

  if (!glResult.success) {
    return {
      success: false,
      totalValue: valuationResult.totalValue,
      errors: glResult.errors?.map(e => e.message),
    };
  }

  // Step 4: Link batches
  const valuationBatchId = crypto.randomUUID();
  const postingBatchId = glResult.batch!.id;

  // TODO: Update stock move with batch IDs
  // await db.update(stockMoves)
  //   .set({
  //     valuationBatchId,
  //     postingBatchId,
  //     status: "posted",
  //     postedBy: context.userId,
  //     postedAt: context.timestamp,
  //   })
  //   .where(eq(stockMoves.id, stockMove.id));

  return {
    success: true,
    valuationBatchId,
    postingBatchId,
    journalId: journal.id,
    totalValue: valuationResult.totalValue,
  };
}

// ============================================================================
// Journal Entry Creation
// ============================================================================

/**
 * Creates journal entry for stock move
 *
 * Move Type → Journal Entry:
 * - IN (Receipt): Dr Inventory, Cr GRN Accrual / AP
 * - OUT (Issue): Dr COGS / Expense, Cr Inventory
 * - TRANSFER: Dr To-Location, Cr From-Location
 * - ADJUSTMENT: Dr/Cr Inventory, Cr/Dr Adjustment Account
 *
 * @param stockMove - Stock move
 * @param valuation - Valuation result
 * @param _context - 6W1H _context
 * @returns Journal entry
 */
function createInventoryJournal(
  stockMove: StockMove,
  valuation: { entries: Array<{ totalCost: string; itemId: string; locationId: string }> },
  _context: {
    userId: string;
    timestamp: string;
    fiscalPeriodId: string;
  }
): JournalEntry {
  const lines: JournalEntry["lines"] = [];
  let lineNumber = 1;

  for (const entry of valuation.entries) {
    const cost = parseFloat(entry.totalCost);

    const isReceipt = stockMove.moveType === "receipt" || stockMove.moveType === "adjustment_in" || stockMove.moveType === "return_in" || stockMove.moveType === "production_in";
    const isIssue = stockMove.moveType === "delivery" || stockMove.moveType === "adjustment_out" || stockMove.moveType === "return_out" || stockMove.moveType === "scrap" || stockMove.moveType === "production_out";
    
    if (isReceipt) {
      // Receipt: Dr Inventory
      lines.push({
        lineNumber: lineNumber++,
        accountId: crypto.randomUUID(), // TODO: Get from item/location
        accountCode: "1400",
        accountName: "Inventory",
        debit: cost.toFixed(2),
        credit: "0",
        description: `Stock receipt: ${stockMove.documentNumber}`,
        isReconciled: false,
      });

      // Cr GRN Accrual (or AP for direct bill)
      lines.push({
        lineNumber: lineNumber++,
        accountId: crypto.randomUUID(), // TODO: Get from config
        accountCode: "2100",
        accountName: "GRN Accrual",
        debit: "0",
        credit: cost.toFixed(2),
        description: `Stock receipt: ${stockMove.documentNumber}`,
        isReconciled: false,
      });
    } else if (isIssue) {
      // Issue: Dr COGS
      lines.push({
        lineNumber: lineNumber++,
        accountId: crypto.randomUUID(), // TODO: Get from config
        accountCode: "5000",
        accountName: "Cost of Goods Sold",
        debit: cost.toFixed(2),
        credit: "0",
        description: `Stock issue: ${stockMove.documentNumber}`,
        isReconciled: false,
      });

      // Cr Inventory
      lines.push({
        lineNumber: lineNumber++,
        accountId: crypto.randomUUID(), // TODO: Get from item/location
        accountCode: "1400",
        accountName: "Inventory",
        debit: "0",
        credit: cost.toFixed(2),
        description: `Stock issue: ${stockMove.documentNumber}`,
        isReconciled: false,
      });
    } else if (stockMove.moveType === "transfer") {
      // Transfer: Dr To-Location Inventory
      lines.push({
        lineNumber: lineNumber++,
        accountId: crypto.randomUUID(), // TODO: Get from to-location
        accountCode: "1400",
        accountName: "Inventory (To)",
        debit: cost.toFixed(2),
        credit: "0",
        description: `Stock transfer: ${stockMove.documentNumber}`,
        isReconciled: false,
      });

      // Cr From-Location Inventory
      lines.push({
        lineNumber: lineNumber++,
        accountId: crypto.randomUUID(), // TODO: Get from from-location
        accountCode: "1400",
        accountName: "Inventory (From)",
        debit: "0",
        credit: cost.toFixed(2),
        description: `Stock transfer: ${stockMove.documentNumber}`,
        isReconciled: false,
      });
    }
  }

  // Calculate totals
  const totalDebit = lines.reduce((sum, l) => sum + parseFloat(l.debit), 0);
  const totalCredit = lines.reduce((sum, l) => sum + parseFloat(l.credit), 0);

  const journal: JournalEntry = {
    id: crypto.randomUUID(),
    tenantId: stockMove.tenantId,
    documentNumber: `INV-${stockMove.documentNumber}`,
    journalType: "inventory",
    description: `Inventory posting: ${stockMove.moveType} - ${stockMove.documentNumber}`,
    reference: stockMove.documentNumber,
    sourceDocumentType: "stock_move",
    sourceDocumentId: stockMove.id,
    sourceDocumentNumber: stockMove.documentNumber,
    journalDate: _context.timestamp,
    effectiveDate: stockMove.movedDate || _context.timestamp,
    fiscalPeriodId: _context.fiscalPeriodId,
    fiscalYear: new Date(_context.timestamp).getFullYear(),
    fiscalMonth: new Date(_context.timestamp).getMonth() + 1,
    currency: "USD", // TODO: Get from tenant
    exchangeRate: 1,
    status: "draft",
    lines,
    totalDebit: totalDebit.toFixed(2),
    totalCredit: totalCredit.toFixed(2),
    createdBy: _context.userId,
    createdAt: _context.timestamp,
    updatedAt: _context.timestamp,
    isReversal: false,
  };

  return journal;
}

// ============================================================================
// Stock Move Reversal
// ============================================================================

/**
 * Reverses stock move posting
 *
 * AXIS Law: Never modify history, create reversal
 *
 * @param _db - Database connection
 * @param _originalMoveId - Stock move to reverse
 * @param _context - 6W1H _context with reason
 * @returns Reversal result
 */
export async function reverseStockMove(
  _db: Database,
  _originalMoveId: string,
  _context: {
    userId: string;
    timestamp: string;
    reason: string;
    fiscalPeriodId: string;
  }
): Promise<StockMovePostingResult> {
  // TODO: Get original stock move
  // const originalMove = await db.query.stockMoves.findFirst({
  //   where: eq(stockMoves.id, originalMoveId),
  // });

  // Create reversal stock move (flip in/out)
  // Post reversal to GL

  return {
    success: true,
    totalValue: "0",
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const StockMovePostingService = {
  postStockMoveToGL,
  reverseStockMove,
} as const;
