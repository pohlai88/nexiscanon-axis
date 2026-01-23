/**
 * SQL Migration Generator
 *
 * Generates raw SQL migrations from registry definitions.
 * Useful for manual review or databases without Drizzle support.
 */

import {
  documentDrizzleMapping,
  economicEventDrizzleMapping,
  ledgerPostingDrizzleMapping,
  accountDrizzleMapping,
} from "../schemas";

type ColumnDef = {
  readonly type: string;
  readonly primaryKey?: boolean;
  readonly notNull?: boolean;
  readonly default?: string;
  readonly references?: string;
};

type IndexDef = {
  readonly columns: readonly string[];
  readonly unique?: boolean;
  readonly name?: string;
};

type TableMapping = {
  readonly tableName: string;
  readonly columns: Record<string, ColumnDef>;
  readonly indexes?: readonly IndexDef[];
  readonly immutable?: boolean;
};

/**
 * Generates CREATE TABLE SQL
 */
export function generateSqlMigration(mapping: TableMapping): string {
  const lines: string[] = [];

  // Table creation
  lines.push(`-- Table: ${mapping.tableName}`);
  lines.push(`CREATE TABLE IF NOT EXISTS ${mapping.tableName} (`);

  const columnDefs: string[] = [];
  for (const [name, def] of Object.entries(mapping.columns)) {
    let col = `  ${name} ${def.type.toUpperCase()}`;
    if (def.primaryKey) col += " PRIMARY KEY";
    if (def.default) col += ` DEFAULT ${def.default}`;
    if (def.notNull && !def.primaryKey) col += " NOT NULL";
    columnDefs.push(col);
  }
  lines.push(columnDefs.join(",\n"));
  lines.push(");");
  lines.push("");

  // Foreign keys (separate for clarity)
  for (const [name, def] of Object.entries(mapping.columns)) {
    if (def.references) {
      const [table, column] = def.references.split(".");
      lines.push(
        `ALTER TABLE ${mapping.tableName} ADD CONSTRAINT fk_${mapping.tableName}_${name} ` +
          `FOREIGN KEY (${name}) REFERENCES ${table}(${column});`
      );
    }
  }
  lines.push("");

  // Indexes
  if (mapping.indexes) {
    for (const idx of mapping.indexes) {
      const indexType = idx.unique ? "UNIQUE INDEX" : "INDEX";
      const name = idx.name || `${mapping.tableName}_${idx.columns.join("_")}_idx`;
      lines.push(
        `CREATE ${indexType} IF NOT EXISTS ${name} ON ${mapping.tableName} (${idx.columns.join(", ")});`
      );
    }
    lines.push("");
  }

  // RLS Policy
  lines.push(`-- Row Level Security`);
  lines.push(`ALTER TABLE ${mapping.tableName} ENABLE ROW LEVEL SECURITY;`);
  lines.push(
    `CREATE POLICY tenant_isolation_${mapping.tableName} ON ${mapping.tableName} ` +
      `FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);`
  );
  lines.push("");

  // Immutability trigger
  if (mapping.immutable) {
    lines.push(`-- Immutability Trigger`);
    lines.push(`CREATE OR REPLACE FUNCTION prevent_${mapping.tableName}_mutation()`);
    lines.push(`RETURNS TRIGGER AS $$`);
    lines.push(`BEGIN`);
    lines.push(`  RAISE EXCEPTION '${mapping.tableName} records are immutable. Use reversal pattern.';`);
    lines.push(`END;`);
    lines.push(`$$ LANGUAGE plpgsql;`);
    lines.push("");
    lines.push(`CREATE TRIGGER ${mapping.tableName}_immutable`);
    lines.push(`BEFORE UPDATE OR DELETE ON ${mapping.tableName}`);
    lines.push(`FOR EACH ROW EXECUTE FUNCTION prevent_${mapping.tableName}_mutation();`);
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Generates B01 specific constraints (from B01-DOCUMENTATION.md §6)
 */
export function generateB01Constraints(): string {
  const lines: string[] = [];

  // Document immutability for POSTED state
  lines.push(`-- ============================================================================`);
  lines.push(`-- B01 §6.2: Document Immutability (POSTED state protection)`);
  lines.push(`-- ============================================================================`);
  lines.push(``);
  lines.push(`CREATE OR REPLACE FUNCTION prevent_posted_document_mutation()`);
  lines.push(`RETURNS TRIGGER AS $$`);
  lines.push(`BEGIN`);
  lines.push(`  IF OLD.state IN ('posted', 'reversed') THEN`);
  lines.push(`    -- Only allow state transition from posted to reversed`);
  lines.push(`    IF TG_OP = 'UPDATE' AND OLD.state = 'posted' AND NEW.state = 'reversed' THEN`);
  lines.push(`      -- Allow: This is a valid reversal transition`);
  lines.push(`      RETURN NEW;`);
  lines.push(`    END IF;`);
  lines.push(`    -- Only allow linking reversal ID on posted documents`);
  lines.push(`    IF TG_OP = 'UPDATE' AND OLD.state = 'posted' AND NEW.reversalId IS NOT NULL THEN`);
  lines.push(`      RETURN NEW;`);
  lines.push(`    END IF;`);
  lines.push(`    RAISE EXCEPTION 'Cannot modify document in % state. Use reversal pattern.', OLD.state;`);
  lines.push(`  END IF;`);
  lines.push(`  RETURN NEW;`);
  lines.push(`END;`);
  lines.push(`$$ LANGUAGE plpgsql;`);
  lines.push(``);
  lines.push(`CREATE TRIGGER documents_posted_immutable`);
  lines.push(`BEFORE UPDATE ON documents`);
  lines.push(`FOR EACH ROW EXECUTE FUNCTION prevent_posted_document_mutation();`);
  lines.push(``);

  // Idempotency table
  lines.push(`-- ============================================================================`);
  lines.push(`-- B01 §6.3: Idempotency Key Table`);
  lines.push(`-- ============================================================================`);
  lines.push(``);
  lines.push(`CREATE TABLE IF NOT EXISTS posting_idempotency_keys (`);
  lines.push(`  tenant_id UUID NOT NULL,`);
  lines.push(`  idempotency_key VARCHAR(255) NOT NULL,`);
  lines.push(`  document_id UUID NOT NULL REFERENCES documents(id),`);
  lines.push(`  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,`);
  lines.push(`  PRIMARY KEY (tenant_id, idempotency_key)`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`ALTER TABLE posting_idempotency_keys ENABLE ROW LEVEL SECURITY;`);
  lines.push(`CREATE POLICY tenant_isolation_posting_idempotency_keys ON posting_idempotency_keys`);
  lines.push(`  FOR ALL USING (tenant_id = current_setting('app.current_tenant_id')::uuid);`);
  lines.push(``);

  // Journal balance constraint function
  lines.push(`-- ============================================================================`);
  lines.push(`-- B01 §6.1: Journal Balance Constraint`);
  lines.push(`-- ============================================================================`);
  lines.push(``);
  lines.push(`CREATE OR REPLACE FUNCTION check_journal_balance()`);
  lines.push(`RETURNS TRIGGER AS $$`);
  lines.push(`DECLARE`);
  lines.push(`  balance NUMERIC;`);
  lines.push(`BEGIN`);
  lines.push(`  -- Calculate balance for the batch being inserted`);
  lines.push(`  SELECT `);
  lines.push(`    SUM(CASE WHEN direction = 'debit' THEN amount ELSE 0 END) -`);
  lines.push(`    SUM(CASE WHEN direction = 'credit' THEN amount ELSE 0 END)`);
  lines.push(`  INTO balance`);
  lines.push(`  FROM ledger_postings`);
  lines.push(`  WHERE batch_id = NEW.batch_id;`);
  lines.push(`  `);
  lines.push(`  -- Note: This check runs per-row. For batch validation,`);
  lines.push(`  -- use the seal_posting_batch function after all inserts.`);
  lines.push(`  -- This trigger is informational, not blocking.`);
  lines.push(`  RETURN NEW;`);
  lines.push(`END;`);
  lines.push(`$$ LANGUAGE plpgsql;`);
  lines.push(``);
  lines.push(`-- Posting batch sealing function (explicit balance check)`);
  lines.push(`CREATE OR REPLACE FUNCTION verify_batch_balance(p_batch_id UUID)`);
  lines.push(`RETURNS BOOLEAN AS $$`);
  lines.push(`DECLARE`);
  lines.push(`  total_debits NUMERIC;`);
  lines.push(`  total_credits NUMERIC;`);
  lines.push(`BEGIN`);
  lines.push(`  SELECT `);
  lines.push(`    COALESCE(SUM(CASE WHEN direction = 'debit' THEN amount ELSE 0 END), 0),`);
  lines.push(`    COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount ELSE 0 END), 0)`);
  lines.push(`  INTO total_debits, total_credits`);
  lines.push(`  FROM ledger_postings`);
  lines.push(`  WHERE batch_id = p_batch_id;`);
  lines.push(`  `);
  lines.push(`  IF ABS(total_debits - total_credits) > 0.0001 THEN`);
  lines.push(`    RAISE EXCEPTION 'Journal balance violation: batch % has debits=% credits=%',`);
  lines.push(`      p_batch_id, total_debits, total_credits;`);
  lines.push(`  END IF;`);
  lines.push(`  `);
  lines.push(`  RETURN TRUE;`);
  lines.push(`END;`);
  lines.push(`$$ LANGUAGE plpgsql;`);
  lines.push(``);

  return lines.join("\n");
}

/**
 * Generates all SQL migrations
 */
export function generateAllSqlMigrations(): string {
  const migrations = [
    generateSqlMigration(accountDrizzleMapping), // Accounts first (referenced by postings)
    generateSqlMigration(documentDrizzleMapping),
    generateSqlMigration(economicEventDrizzleMapping),
    generateSqlMigration(ledgerPostingDrizzleMapping),
    generateB01Constraints(), // B01-specific constraints
  ];

  return migrations.join("\n\n");
}

// For debugging/preview
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(generateAllSqlMigrations());
}
