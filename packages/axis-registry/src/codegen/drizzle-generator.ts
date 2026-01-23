/**
 * Drizzle Schema Generator
 *
 * Generates Drizzle ORM schema files from registry definitions.
 * This eliminates manual sync between Zod schemas and Drizzle tables.
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
 * Maps SQL types to Drizzle column functions
 */
function mapSqlTypeToDrizzle(sqlType: string): string {
  if (sqlType.startsWith("uuid")) return "uuid";
  if (sqlType.startsWith("varchar")) return `varchar`;
  if (sqlType.startsWith("numeric")) return "numeric";
  if (sqlType.startsWith("integer")) return "integer";
  if (sqlType.startsWith("boolean")) return "boolean";
  if (sqlType.startsWith("timestamptz")) return "timestamp";
  if (sqlType.startsWith("jsonb")) return "jsonb";
  return "text";
}

/**
 * Generates Drizzle column definition
 */
function generateColumn(name: string, def: ColumnDef): string {
  const drizzleType = mapSqlTypeToDrizzle(def.type);
  const parts: string[] = [];

  // Column name and type
  if (drizzleType === "varchar") {
    const match = def.type.match(/varchar\((\d+)\)/);
    const length = match ? match[1] : "255";
    parts.push(`varchar("${name}", { length: ${length} })`);
  } else if (drizzleType === "numeric") {
    const match = def.type.match(/numeric\((\d+),(\d+)\)/);
    const precision = match ? match[1] : "19";
    const scale = match ? match[2] : "4";
    parts.push(`numeric("${name}", { precision: ${precision}, scale: ${scale} })`);
  } else if (drizzleType === "timestamp") {
    parts.push(`timestamp("${name}", { withTimezone: true })`);
  } else {
    parts.push(`${drizzleType}("${name}")`);
  }

  // Primary key
  if (def.primaryKey) {
    parts.push(".primaryKey()");
    if (def.default?.includes("gen_random_uuid")) {
      parts.push(".defaultRandom()");
    }
  }

  // Not null
  if (def.notNull && !def.primaryKey) {
    parts.push(".notNull()");
  }

  // Default value
  if (def.default && !def.primaryKey) {
    if (def.default === "now()") {
      parts.push(".defaultNow()");
    } else if (def.default.startsWith("'") && def.default.endsWith("'")) {
      parts.push(`.default(${def.default.replace(/'/g, '"')})`);
    } else if (def.default === "true" || def.default === "false") {
      parts.push(`.default(${def.default})`);
    } else {
      parts.push(`.default(${def.default})`);
    }
  }

  // Foreign key reference
  if (def.references) {
    const [table, column] = def.references.split(".");
    parts.push(`.references(() => ${table}.${column})`);
  }

  return `  ${name}: ${parts.join("")},`;
}

/**
 * Generates full Drizzle table definition
 */
export function generateDrizzleSchema(mapping: TableMapping): string {
  const lines: string[] = [];

  lines.push(`export const ${mapping.tableName} = pgTable(`);
  lines.push(`  "${mapping.tableName}",`);
  lines.push(`  {`);

  // Generate columns
  for (const [name, def] of Object.entries(mapping.columns)) {
    lines.push(generateColumn(name, def));
  }

  lines.push(`  },`);

  // Generate indexes if present
  if (mapping.indexes && mapping.indexes.length > 0) {
    lines.push(`  (table) => [`);
    for (const idx of mapping.indexes) {
      const indexType = idx.unique ? "uniqueIndex" : "index";
      const cols = idx.columns.map((c) => `table.${c}`).join(", ");
      const name = idx.name ? `"${idx.name}"` : `"${mapping.tableName}_${idx.columns.join("_")}_idx"`;
      lines.push(`    ${indexType}(${name}).on(${cols}),`);
    }
    lines.push(`  ]`);
  }

  lines.push(`);`);

  return lines.join("\n");
}

/**
 * Generates all Drizzle schemas
 */
export function generateAllDrizzleSchemas(): Record<string, string> {
  return {
    document: generateDrizzleSchema(documentDrizzleMapping),
    economicEvent: generateDrizzleSchema(economicEventDrizzleMapping),
    ledgerPosting: generateDrizzleSchema(ledgerPostingDrizzleMapping),
    account: generateDrizzleSchema(accountDrizzleMapping),
  };
}

// For debugging/preview
if (import.meta.url === `file://${process.argv[1]}`) {
  const schemas = generateAllDrizzleSchemas();
  for (const [name, schema] of Object.entries(schemas)) {
    console.log(`\n// ============ ${name} ============`);
    console.log(schema);
  }
}
