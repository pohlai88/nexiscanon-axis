/**
 * Chart of Accounts Service (B03)
 *
 * AXIS Canonical Implementation:
 * - Hierarchical account structure
 * - Control accounts (AR/AP/Inventory)
 * - Account validation and integrity
 *
 * @see .cursor/ERP/A01-CANONICAL.md §2 (Money Pillar)
 * @see .cursor/ERP/B07-ACCOUNTING.md (Chart of Accounts)
 */

import type { Database } from "../..";
import type { GlAccount } from "@axis/registry";

// ============================================================================
// COA Service Types
// ============================================================================

export interface AccountValidation {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface AccountHierarchy {
  account: GlAccount;
  children: AccountHierarchy[];
  level: number;
}

// ============================================================================
// Account Creation & Validation
// ============================================================================

/**
 * Creates new GL account with validation
 *
 * AXIS Rules:
 * - Account code must be unique within tenant
 * - Parent account must exist (if specified)
 * - Control accounts cannot be postable
 * - Account type must match parent type
 *
 * @param _db - Database connection
 * @param account - Account to create
 * @returns Validation result
 */
export async function createAccount(
  _db: Database,
  account: Omit<GlAccount, "id" | "createdAt" | "updatedAt">
): Promise<{
  success: boolean;
  accountId?: string;
  errors?: string[];
}> {
  // Step 1: Validate account
  const validation = await validateAccount(_db, account);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors,
    };
  }

  // Step 2: Calculate hierarchy path
  const path = await calculateAccountPath(_db, account);

  // Step 3: Create account
  const newAccount: GlAccount = {
    ...account,
    id: crypto.randomUUID(),
    path,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // TODO: Persist to database
  // await db.insert(accounts).values(newAccount);

  return {
    success: true,
    accountId: newAccount.id,
  };
}

/**
 * Validates account before creation/update
 *
 * AXIS Law: PROTECT.DETECT.REACT
 *
 * @param _db - Database connection
 * @param account - Account to validate
 * @returns Validation result
 */
async function validateAccount(
  _db: Database,
  account: Partial<GlAccount>
): Promise<AccountValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!account.code) {
    errors.push("Account code is required");
  }

  if (!account.name) {
    errors.push("Account name is required");
  }

  if (!account.accountType) {
    errors.push("Account type is required");
  }

  // Validate account code format
  if (account.code && !/^[A-Z0-9-]+$/.test(account.code)) {
    errors.push("Account code must contain only uppercase letters, numbers, and hyphens");
  }

  // Check code uniqueness
  // TODO: Query database
  // const existing = await db.query.accounts.findFirst({
  //   where: and(
  //     eq(accounts.tenantId, account.tenantId),
  //     eq(accounts.code, account.code)
  //   ),
  // });
  // if (existing) {
  //   errors.push(`Account code '${account.code}' already exists`);
  // }

  // Validate control account rules
  if (account.isControlAccount && account.isPostable) {
    errors.push("Control accounts cannot be postable");
  }

  if (account.isControlAccount && !account.subledgerType) {
    errors.push("Control accounts must specify subledger type");
  }

  // Validate parent account
  if (account.parentAccountId) {
    // TODO: Check parent exists and is same type
    // const parent = await db.query.accounts.findFirst({
    //   where: eq(accounts.id, account.parentAccountId),
    // });
    // if (!parent) {
    //   errors.push("Parent account does not exist");
    // } else if (parent.accountType !== account.accountType) {
    //   errors.push("Account type must match parent account type");
    // }
  }

  // Validate normal balance
  if (account.accountType && account.normalBalance) {
    const expectedBalance = getExpectedNormalBalance(account.accountType);
    if (account.normalBalance !== expectedBalance) {
      warnings.push(
        `Normal balance '${account.normalBalance}' is unusual for ${account.accountType} accounts (expected: ${expectedBalance})`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Gets expected normal balance for account type
 */
function getExpectedNormalBalance(
  accountType: GlAccount["accountType"]
): "debit" | "credit" {
  switch (accountType) {
    case "asset":
    case "expense":
      return "debit";
    case "liability":
    case "equity":
    case "revenue":
      return "credit";
    default:
      return "debit";
  }
}

/**
 * Calculates hierarchical path for account
 *
 * Path format: "1000/1100/1110" (parent codes separated by /)
 *
 * @param _db - Database connection
 * @param account - Account to calculate path for
 * @returns Account path
 */
async function calculateAccountPath(
  _db: Database,
  account: Partial<GlAccount>
): Promise<string> {
  if (!account.parentAccountId) {
    return account.code || "";
  }

  // TODO: Query parent account and build path
  // const parent = await db.query.accounts.findFirst({
  //   where: eq(accounts.id, account.parentAccountId),
  // });
  // return parent ? `${parent.path}/${account.code}` : account.code;

  return account.code || "";
}

// ============================================================================
// Account Hierarchy
// ============================================================================

/**
 * Gets account hierarchy tree
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant filter
 * @param accountType - Optional type filter
 * @returns Hierarchical account tree
 */
export async function getAccountHierarchy(
  _db: Database,
  _tenantId: string,
  _accountType?: GlAccount["accountType"]
): Promise<AccountHierarchy[]> {
  // TODO: Query accounts and build tree
  // const accounts = await db.query.accounts.findMany({
  //   where: and(
  //     eq(accounts.tenantId, tenantId),
  //     accountType ? eq(accounts.accountType, accountType) : undefined
  //   ),
  //   orderBy: [accounts.code],
  // });

  // return buildAccountTree(accounts);

  return [];
}

/**
 * Builds hierarchical tree from flat account list
 */
function _buildAccountTree(accounts: GlAccount[]): AccountHierarchy[] {
  const accountMap = new Map<string, AccountHierarchy>();
  const rootAccounts: AccountHierarchy[] = [];

  // First pass: Create hierarchy nodes
  for (const account of accounts) {
    accountMap.set(account.id, {
      account,
      children: [],
      level: account.level,
    });
  }

  // Second pass: Build parent-child relationships
  for (const account of accounts) {
    const node = accountMap.get(account.id)!;

    if (account.parentAccountId) {
      const parent = accountMap.get(account.parentAccountId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Orphaned account (parent not found)
        rootAccounts.push(node);
      }
    } else {
      // Root account
      rootAccounts.push(node);
    }
  }

  return rootAccounts;
}

// ============================================================================
// Account Lookup & Search
// ============================================================================

/**
 * Finds account by code
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant filter
 * @param code - Account code
 * @returns Account or null
 */
export async function findAccountByCode(
  _db: Database,
  _tenantId: string,
  _code: string
): Promise<GlAccount | null> {
  // TODO: Query database
  // return await db.query.accounts.findFirst({
  //   where: and(
  //     eq(accounts.tenantId, tenantId),
  //     eq(accounts.code, code)
  //   ),
  // });

  return null;
}

/**
 * Gets control account for subledger type
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant filter
 * @param subledgerType - AR/AP/Inventory
 * @returns Control account
 */
export async function getControlAccount(
  _db: Database,
  _tenantId: string,
  _subledgerType: "ar" | "ap" | "inventory"
): Promise<GlAccount | null> {
  // TODO: Query database
  // return await db.query.accounts.findFirst({
  //   where: and(
  //     eq(accounts.tenantId, tenantId),
  //     eq(accounts.isControlAccount, true),
  //     eq(accounts.subledgerType, subledgerType)
  //   ),
  // });

  return null;
}

/**
 * Searches accounts by name or code
 *
 * @param _db - Database connection
 * @param _tenantId - Tenant filter
 * @param query - Search query
 * @returns Matching accounts
 */
export async function searchAccounts(
  _db: Database,
  _tenantId: string,
  _query: string
): Promise<GlAccount[]> {
  // TODO: Query database with LIKE search
  // return await db.query.accounts.findMany({
  //   where: and(
  //     eq(accounts.tenantId, tenantId),
  //     or(
  //       like(accounts.code, `%${query}%`),
  //       like(accounts.name, `%${query}%`)
  //     )
  //   ),
  //   limit: 50,
  // });

  return [];
}

// ============================================================================
// Account Deactivation
// ============================================================================

/**
 * Deactivates account (soft delete)
 *
 * AXIS Rule: Cannot deactivate if:
 * - Account has postings
 * - Account has active children
 * - Account is a control account with subledger entries
 *
 * @param _db - Database connection
 * @param accountId - Account to deactivate
 * @returns Deactivation result
 */
export async function deactivateAccount(
  _db: Database,
  _accountId: string
): Promise<{
  success: boolean;
  errors?: string[];
}> {
  // TODO: Check for postings
  // const hasPostings = await db.query.glLedgerPostings.findFirst({
  //   where: eq(glLedgerPostings.accountId, accountId),
  // });

  // if (hasPostings) {
  //   return {
  //     success: false,
  //     errors: ["Cannot deactivate account with existing postings"],
  //   };
  // }

  // TODO: Check for active children
  // const hasChildren = await db.query.accounts.findFirst({
  //   where: and(
  //     eq(accounts.parentAccountId, accountId),
  //     eq(accounts.status, "active")
  //   ),
  // });

  // if (hasChildren) {
  //   return {
  //     success: false,
  //     errors: ["Cannot deactivate account with active child accounts"],
  //   };
  // }

  // TODO: Update status
  // await db.update(accounts)
  //   .set({ status: "inactive", updatedAt: new Date().toISOString() })
  //   .where(eq(accounts.id, accountId));

  return {
    success: true,
  };
}

// ============================================================================
// Export Public API
// ============================================================================

export const COAService = {
  createAccount,
  getAccountHierarchy,
  findAccountByCode,
  getControlAccount,
  searchAccounts,
  deactivateAccount,
} as const;
