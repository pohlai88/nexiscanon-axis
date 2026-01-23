# C02 — Column Adapter
## The Gang of Four Pattern for Universal Data Understanding

<!-- AXIS ERP Document Series -->
|         A-Series          |                          |                     |                           |                            |                          |
| :-----------------------: | :----------------------: | :-----------------: | :-----------------------: | :------------------------: | :----------------------: |
| [A01](./A01-CANONICAL.md) | [A02](./A02-AXIS-MAP.md) | [A03](./A03-TSD.md) | [A04](./A04-CONTRACTS.md) | [A05](./A05-DEPLOYMENT.md) | [A06](./A06-GLOSSARY.md) |
|        Philosophy         |         Roadmap          |       Schema        |         Contracts         |           Deploy           |         Glossary         |

|                        C-Series                        |                              |                                |                             |                         |
| :----------------------------------------------------: | :--------------------------: | :----------------------------: | :-------------------------: | :---------------------: |
| [C01](./C01-MIGRATION-PHILOSOPHY.md)                   |          **[C02]**           | [C03](./C03-MAPPING-STUDIO.md) | [C04](./C04-DUAL-LEDGER.md) | [C05](./C05-CUTOVER.md) |
|                       Philosophy                       |        Column Adapter        |         Mapping Studio         |         Dual Ledger         |         Cutover         |

---

> **Derived From:** [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md), [A01-01-LYNX.md](./A01-01-LYNX.md) v1.2.0, [A01-07-THE-INVISIBLE-MACHINE.md](./A01-07-THE-INVISIBLE-MACHINE.md) v1.1.0
>
> **Tag:** `COLUMN-ADAPTER` | `GANG-OF-FOUR` | `SCHEMA-INTROSPECTION` | `SEMANTIC` | `PHASE-C02`

---

## 🛑 DEV NOTE: Respect @axis/registry & The Machine

> **ALL DEVELOPERS MUST READ THIS BEFORE WRITING ANY CODE**

### The Law

All Column Adapter schemas follow the **Single Source of Truth** pattern:

| Component              | Source                                          |
| ---------------------- | ----------------------------------------------- |
| Source Type Constants  | `@axis/registry/schemas/migration/constants.ts` |
| Source Schema          | `@axis/registry/schemas/adapter/source.ts`      |
| Column Semantic Schema | `@axis/registry/schemas/adapter/semantic.ts`    |
| Transform Spec Schema  | `@axis/registry/schemas/adapter/transform.ts`   |
| Adapter Events         | `@axis/registry/schemas/events/adapter.ts`      |

**Rule**: Drizzle tables in `@axis/db` import types from `@axis/registry`. Never duplicate schema definitions.

### The Machine in Column Adapter

Column Adapter leverages Lynx (The Machine's Awareness) for:

| Capability           | The Machine...                                 |
| -------------------- | ---------------------------------------------- |
| Schema Introspection | ...reads database structures automatically     |
| Semantic Analysis    | ...notices what columns mean                   |
| Pattern Recognition  | ...recognizes naming patterns across ERPs      |
| Confidence Scoring   | ...indicates certainty with transparency       |
| Transform Suggestion | ...offers transformation hints                 |

---

## Preamble

> *"We don't build connectors for ERPs. The Machine understands columns. All data is columns."*

The Column Adapter is the **Gang of Four Adapter pattern** applied to data migration. Instead of building N connectors for N ERPs, we build ONE adapter that understands the universal truth: **all databases are columns**.

---

## 1) The Core Principle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE COLUMN ADAPTER PRINCIPLE                              │
│                                                                              │
│    ╔═══════════════════════════════════════════════════════════════════╗    │
│    ║                                                                   ║    │
│    ║   Traditional: N ERPs = N Connectors                              ║    │
│    ║   ┌────────────────────────────────────────────────────────────┐  ║    │
│    ║   │  QuickBooks API → QuickBooks Parser → QuickBooks Mapper   │  ║    │
│    ║   │  SAP RFC → SAP Parser → SAP Mapper                        │  ║    │
│    ║   │  Odoo API → Odoo Parser → Odoo Mapper                     │  ║    │
│    ║   │  ...                                                       │  ║    │
│    ║   │  Maintenance: O(N) → Impossible to scale                  │  ║    │
│    ║   └────────────────────────────────────────────────────────────┘  ║    │
│    ║                                                                   ║    │
│    ║   Column Adapter: N ERPs = 1 Pattern                              ║    │
│    ║   ┌────────────────────────────────────────────────────────────┐  ║    │
│    ║   │  ANY Source → Schema Introspection → Column Semantics     │  ║    │
│    ║   │                      ↓                                     │  ║    │
│    ║   │              The Machine Understanding                      │  ║    │
│    ║   │                      ↓                                     │  ║    │
│    ║   │              AXIS Canonical Mapping                        │  ║    │
│    ║   │                                                            │  ║    │
│    ║   │  Maintenance: O(1) → Infinitely scalable                  │  ║    │
│    ║   └────────────────────────────────────────────────────────────┘  ║    │
│    ║                                                                   ║    │
│    ╚═══════════════════════════════════════════════════════════════════╝    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2) The Gang of Four Adapter Pattern

### 2.1 Pattern Structure

```typescript
// The Adapter Pattern (Gang of Four)
//
// Target: What the client expects (AXIS Canonical)
// Adapter: Converts Adaptee to Target (Column Adapter)
// Adaptee: The source system (Any Database/CSV/Excel)

interface Target {
  // AXIS Canonical Schema
  parties: Party[];
  items: Item[];
  accounts: Account[];
  transactions: Transaction[];
}

interface Adaptee {
  // Any source: tables, columns, relationships
  schema: SourceSchema;
  data: SourceData;
}

class ColumnAdapter implements Target {
  private source: Adaptee;
  private mappings: ColumnMappings;
  private lynx: LynxService;
  
  constructor(source: Adaptee, lynx: LynxService) {
    this.source = source;
    this.lynx = lynx;
  }
  
  // Adapt source columns to AXIS parties
  get parties(): Party[] {
    const partyTable = this.findTableBySemantics("party");
    const columnMap = this.mapColumnsToSchema(partyTable, partySchema);
    return this.transformData(partyTable, columnMap);
  }
  
  // ... same pattern for items, accounts, transactions
}
```

### 2.2 Why This Pattern Works

| Aspect | Traditional Connector | Column Adapter |
| ------ | -------------------- | -------------- |
| **Knowledge required** | ERP-specific API/format | Column semantics |
| **New ERP support** | Build new connector | Works automatically |
| **Maintenance** | Per-connector updates | Single pattern update |
| **Machine leverage** | Minimal | Maximum (Lynx) |
| **Edge cases** | Manual handling | Semantic fallback |

---

## 3) Column Adapter Architecture

### 3.1 The Three Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COLUMN ADAPTER ARCHITECTURE                               │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                 LAYER 1: SOURCE ABSTRACTION                              ││
│  │                                                                          ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            ││
│  │  │PostgreSQL│ │  MySQL  │ │SQL Server│ │  CSV   │ │  Excel  │            ││
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘            ││
│  │       │           │           │           │           │                  ││
│  │       └───────────┴───────────┴───────────┴───────────┘                  ││
│  │                               │                                          ││
│  │                               ▼                                          ││
│  │                    ┌─────────────────────┐                               ││
│  │                    │  Unified Schema     │                               ││
│  │                    │  Representation     │                               ││
│  │                    └─────────────────────┘                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                  │                                           │
│                                  ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                 LAYER 2: SEMANTIC ANALYSIS (Lynx)                        ││
│  │                                                                          ││
│  │  ┌─────────────────────────────────────────────────────────────────────┐││
│  │  │  Column Name Analysis    │  "customer_nm" → party.legalName        │││
│  │  │  Data Type Analysis      │  VARCHAR(255) → string, max 255         │││
│  │  │  Sample Value Analysis   │  "Apple Inc." → company name pattern    │││
│  │  │  Relationship Analysis   │  FK to orders → customer-order link     │││
│  │  │  Statistical Analysis    │  Cardinality, nullability, uniqueness   │││
│  │  └─────────────────────────────────────────────────────────────────────┘││
│  │                                                                          ││
│  │  Output: Column → Semantic Meaning → AXIS Canonical Field               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                  │                                           │
│                                  ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │                 LAYER 3: CANONICAL TRANSFORMATION                        ││
│  │                                                                          ││
│  │  Source Column → Semantic Mapping → Transform Function → AXIS Field     ││
│  │                                                                          ││
│  │  Example:                                                                ││
│  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌───────────┐ ││
│  │  │ cust_nm      │ → │ party.name   │ → │ trim, case   │ → │ legalName │ ││
│  │  │ VARCHAR(100) │   │ confidence:  │   │ normalize    │   │ string    │ ││
│  │  │              │   │ 0.94         │   │              │   │           │ ││
│  │  └──────────────┘   └──────────────┘   └──────────────┘   └───────────┘ ││
│  │                                                                          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Source Abstraction Layer

```typescript
// packages/axis-registry/src/schemas/migration/source.ts

export const SOURCE_TYPE = [
  "postgresql",
  "mysql",
  "sqlserver",
  "oracle",
  "sqlite",
  "mongodb",      // Flattened to columns
  "csv",
  "excel",
  "json",
  "api",          // REST API → JSON → columns
] as const;

export const sourceSchemaSchema = z.object({
  sourceType: z.enum(SOURCE_TYPE),
  
  // Connection (for databases)
  connection: z.object({
    host: z.string().optional(),
    port: z.number().optional(),
    database: z.string().optional(),
    // Credentials stored in secret manager, referenced by ID
    credentialRef: z.string().optional(),
  }).optional(),
  
  // File (for CSV/Excel/JSON)
  file: z.object({
    path: z.string().optional(),
    encoding: z.string().default("utf-8"),
    delimiter: z.string().default(","),
    hasHeader: z.boolean().default(true),
  }).optional(),
  
  // Extracted schema
  tables: z.array(z.object({
    name: z.string(),
    schema: z.string().optional(),        // Database schema (e.g., "public")
    rowCount: z.number().int().optional(),
    columns: z.array(z.object({
      name: z.string(),
      dataType: z.string(),               // Original type
      nullable: z.boolean(),
      isPrimaryKey: z.boolean().default(false),
      isForeignKey: z.boolean().default(false),
      foreignKeyRef: z.object({
        table: z.string(),
        column: z.string(),
      }).optional(),
      defaultValue: z.unknown().optional(),
      
      // Sample data for AI analysis
      sampleValues: z.array(z.unknown()).optional(),
      distinctCount: z.number().int().optional(),
      nullCount: z.number().int().optional(),
    })),
  })),
  
  // Relationships (inferred from FKs)
  relationships: z.array(z.object({
    fromTable: z.string(),
    fromColumn: z.string(),
    toTable: z.string(),
    toColumn: z.string(),
    type: z.enum(["one_to_one", "one_to_many", "many_to_many"]),
  })).optional(),
  
  introspectedAt: z.string().datetime(),
});

export type SourceSchema = z.infer<typeof sourceSchemaSchema>;
```

### 3.3 Schema Introspection

```typescript
// packages/migration/src/introspection/index.ts

/**
 * Introspect any source and extract unified schema
 */
export async function introspectSource(
  source: SourceConnection
): Promise<SourceSchema> {
  const introspector = getIntrospector(source.type);
  
  // 1. Connect and extract raw schema
  const rawSchema = await introspector.extractSchema(source);
  
  // 2. For each table, sample data
  for (const table of rawSchema.tables) {
    table.columns = await Promise.all(
      table.columns.map(async (col) => ({
        ...col,
        sampleValues: await introspector.sampleColumn(source, table.name, col.name, 100),
        distinctCount: await introspector.countDistinct(source, table.name, col.name),
        nullCount: await introspector.countNulls(source, table.name, col.name),
      }))
    );
  }
  
  // 3. Infer relationships from foreign keys and naming patterns
  rawSchema.relationships = await inferRelationships(rawSchema);
  
  return rawSchema;
}

/**
 * Get appropriate introspector for source type
 */
function getIntrospector(sourceType: SourceType): SchemaIntrospector {
  switch (sourceType) {
    case "postgresql":
      return new PostgreSQLIntrospector();
    case "mysql":
      return new MySQLIntrospector();
    case "sqlserver":
      return new SQLServerIntrospector();
    case "csv":
      return new CSVIntrospector();
    case "excel":
      return new ExcelIntrospector();
    case "json":
      return new JSONIntrospector();
    default:
      throw new Error(`Unsupported source type: ${sourceType}`);
  }
}
```

---

## 4) Semantic Analysis (The Machine's Understanding)

### 4.1 Column Semantic Classification

```typescript
// packages/migration/src/semantic/analyzer.ts

export const SEMANTIC_CATEGORY = [
  // Party-related
  "party.name",
  "party.legal_name",
  "party.display_name",
  "party.email",
  "party.phone",
  "party.tax_id",
  "party.address",
  "party.city",
  "party.country",
  "party.is_customer",
  "party.is_supplier",
  
  // Item-related
  "item.code",
  "item.name",
  "item.description",
  "item.unit_price",
  "item.cost",
  "item.uom",
  "item.category",
  "item.type",
  
  // Account-related
  "account.code",
  "account.name",
  "account.type",
  "account.parent",
  "account.balance",
  
  // Transaction-related
  "transaction.date",
  "transaction.number",
  "transaction.reference",
  "transaction.amount",
  "transaction.quantity",
  "transaction.unit_price",
  "transaction.line_total",
  "transaction.tax_amount",
  "transaction.discount",
  "transaction.total",
  "transaction.currency",
  "transaction.status",
  
  // System-related
  "system.id",
  "system.created_at",
  "system.updated_at",
  "system.created_by",
  
  // Unknown
  "unknown",
] as const;

export const columnSemanticSchema = z.object({
  sourceTable: z.string(),
  sourceColumn: z.string(),
  
  // Semantic classification
  semanticCategory: z.enum(SEMANTIC_CATEGORY),
  confidence: z.number().min(0).max(1),
  
  // Analysis factors
  factors: z.array(z.object({
    factor: z.string(),
    contribution: z.number(),    // How much this factor contributed
    evidence: z.string(),        // What evidence supports this
  })),
  
  // Alternative classifications
  alternatives: z.array(z.object({
    category: z.enum(SEMANTIC_CATEGORY),
    confidence: z.number(),
  })).optional(),
  
  // Mapping target
  axisField: z.string().optional(),     // e.g., "party.legalName"
  axisSchema: z.string().optional(),    // e.g., "partySchema"
  
  // Transform required
  transformHint: z.string().optional(), // e.g., "uppercase", "trim", "parse_date"
  
  analyzedAt: z.string().datetime(),
});

export type ColumnSemantic = z.infer<typeof columnSemanticSchema>;
```

### 4.2 The Machine's Semantic Analyzer

```typescript
// packages/migration/src/semantic/machine-analyzer.ts

/**
 * The Machine analyzes column semantics
 */
export class MachineSemanticAnalyzer {
  constructor(private readonly lynx: LynxService) {}

  /**
   * Analyze all columns in a source schema
   */
  async analyzeSchema(
    schema: SourceSchema
  ): Promise<ColumnSemantic[]> {
    const results: ColumnSemantic[] = [];
    
    for (const table of schema.tables) {
      // Analyze table context first
      const tableContext = await this.analyzeTableContext(table);
      
      // Then analyze each column with table context
      for (const column of table.columns) {
        const semantic = await this.analyzeColumn(table, column, tableContext);
        results.push(semantic);
      }
    }
    
    return results;
  }

  /**
   * Analyze a single column using Lynx
   */
  private async analyzeColumn(
    table: TableSchema,
    column: ColumnSchema,
    tableContext: TableContext
  ): Promise<ColumnSemantic> {
    // Prepare analysis prompt
    const analysisRequest = {
      tableName: table.name,
      tableContext: tableContext.likelyDomain,
      columnName: column.name,
      dataType: column.dataType,
      nullable: column.nullable,
      isPK: column.isPrimaryKey,
      isFK: column.isForeignKey,
      fkRef: column.foreignKeyRef,
      sampleValues: column.sampleValues?.slice(0, 10),
      distinctCount: column.distinctCount,
      nullCount: column.nullCount,
    };
    
    // The Machine performs semantic analysis
    const result = await this.lynx.generateObject({
      schema: z.object({
        semanticCategory: z.enum(SEMANTIC_CATEGORY),
        confidence: z.number(),
        reasoning: z.string(),
        factors: z.array(z.object({
          factor: z.string(),
          contribution: z.number(),
          evidence: z.string(),
        })),
        alternatives: z.array(z.object({
          category: z.enum(SEMANTIC_CATEGORY),
          confidence: z.number(),
        })),
        axisField: z.string().optional(),
        transformHint: z.string().optional(),
      }),
      prompt: `Analyze this database column and determine its semantic meaning.
               
               Context:
               - Table: ${analysisRequest.tableName} (likely domain: ${analysisRequest.tableContext})
               - Column: ${analysisRequest.columnName}
               - Type: ${analysisRequest.dataType}
               - Nullable: ${analysisRequest.nullable}
               - Primary Key: ${analysisRequest.isPK}
               - Foreign Key: ${analysisRequest.isFK}${analysisRequest.fkRef ? ` → ${analysisRequest.fkRef.table}.${analysisRequest.fkRef.column}` : ''}
               - Sample values: ${JSON.stringify(analysisRequest.sampleValues)}
               - Distinct values: ${analysisRequest.distinctCount}
               - Null count: ${analysisRequest.nullCount}
               
               Determine:
               1. What semantic category does this column belong to?
               2. What AXIS canonical field should it map to?
               3. What transformations are needed?
               
               Consider common ERP naming patterns (SAP: KUNNR, MATNR; QuickBooks: CustomerName; Odoo: res.partner.name)`,
    });
    
    return {
      sourceTable: table.name,
      sourceColumn: column.name,
      semanticCategory: result.semanticCategory,
      confidence: result.confidence,
      factors: result.factors,
      alternatives: result.alternatives,
      axisField: result.axisField,
      transformHint: result.transformHint,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Analyze table context (what domain does this table belong to?)
   */
  private async analyzeTableContext(table: TableSchema): Promise<TableContext> {
    const result = await this.lynx.generateObject({
      schema: z.object({
        likelyDomain: z.enum(["party", "item", "account", "sales", "purchase", "inventory", "journal", "system", "unknown"]),
        confidence: z.number(),
        reasoning: z.string(),
      }),
      prompt: `Analyze this database table and determine what ERP domain it belongs to.
               
               Table: ${table.name}
               Columns: ${table.columns.map(c => c.name).join(", ")}
               Row count: ${table.rowCount}
               
               Common patterns:
               - customers, clients, vendors, suppliers → party
               - products, items, skus, materials → item
               - accounts, gl_accounts, coa → account
               - orders, invoices, quotes → sales
               - purchase_orders, bills → purchase
               - stock, inventory, warehouse → inventory
               - journal_entries, postings → journal`,
    });
    
    return result;
  }
}
```

### 4.3 Pattern Recognition Rules

```typescript
// packages/migration/src/semantic/patterns.ts

/**
 * Common column naming patterns across ERPs
 * Used as hints for The Machine's analysis
 */
export const COLUMN_PATTERNS = {
  "party.name": [
    // QuickBooks
    /^customer_?name$/i,
    /^vendor_?name$/i,
    /^company_?name$/i,
    // SAP
    /^NAME1$/i,
    /^NAME2$/i,
    /^KUNNR$/i,     // Customer number
    /^LIFNR$/i,     // Vendor number
    // Odoo
    /^res\.partner\.name$/i,
    /^partner_?name$/i,
    // Generic
    /^(cust|vend|supp|client).*name$/i,
    /^legal_?name$/i,
    /^display_?name$/i,
  ],
  
  "party.email": [
    /^e?mail$/i,
    /^email_?address$/i,
    /^contact_?email$/i,
    /^ADR6$/i,      // SAP email
  ],
  
  "item.code": [
    /^(item|product|sku|material)_?(code|number|id|no)$/i,
    /^MATNR$/i,     // SAP material number
    /^default_?code$/i,
    /^barcode$/i,
    /^upc$/i,
  ],
  
  "item.name": [
    /^(item|product|material)_?(name|desc|description)$/i,
    /^MAKTX$/i,     // SAP material description
  ],
  
  "account.code": [
    /^(account|acct|gl)_?(code|number|no)$/i,
    /^SAKNR$/i,     // SAP GL account
  ],
  
  "transaction.amount": [
    /^(amount|total|value|sum)$/i,
    /^(net|gross)_?amount$/i,
    /^DMBTR$/i,     // SAP amount in local currency
    /^WRBTR$/i,     // SAP amount in document currency
  ],
  
  "transaction.date": [
    /^(date|dated|dt|posting_?date|document_?date|invoice_?date)$/i,
    /^BUDAT$/i,     // SAP posting date
    /^BLDAT$/i,     // SAP document date
    /^created_?at$/i,
  ],
  
  "system.id": [
    /^id$/i,
    /^uuid$/i,
    /^_id$/i,
    /^pk$/i,
    /^primary_?key$/i,
  ],
};

/**
 * Apply pattern matching as first-pass classification
 */
export function matchColumnPattern(
  columnName: string
): { category: SemanticCategory; confidence: number } | null {
  for (const [category, patterns] of Object.entries(COLUMN_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(columnName)) {
        return {
          category: category as SemanticCategory,
          confidence: 0.7, // Pattern match = 70% confidence
        };
      }
    }
  }
  return null;
}
```

---

## 5) Raw Zone Storage

### 5.1 Raw Zone Principle

> *"Never mutate the raw. Always replayable."*

The Raw Zone stores source data **exactly as received**. No transformations, no cleaning, no mapping.

```typescript
// packages/axis-registry/src/schemas/migration/raw-zone.ts

export const rawRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  // Source reference
  sourceType: z.enum(SOURCE_TYPE),
  sourceTable: z.string(),
  sourceRowId: z.string(),            // Original primary key (as string)
  
  // Raw data (unchanged)
  rawData: z.record(z.unknown()),     // Original column values
  
  // Metadata
  importBatch: z.string(),
  importedAt: z.string().datetime(),
  checksum: z.string(),               // For deduplication
});

export const rawZoneStatsSchema = z.object({
  tenantId: z.string().uuid(),
  migrationId: z.string().uuid(),
  
  tables: z.array(z.object({
    tableName: z.string(),
    recordCount: z.number().int(),
    columnCount: z.number().int(),
    importedAt: z.string().datetime(),
    checksum: z.string(),             // For detecting changes
  })),
  
  totalRecords: z.number().int(),
  totalSize: z.number().int(),        // Bytes
  
  lastUpdatedAt: z.string().datetime(),
});

export type RawRecord = z.infer<typeof rawRecordSchema>;
export type RawZoneStats = z.infer<typeof rawZoneStatsSchema>;
```

### 5.2 Raw Zone Ingestion

```typescript
// packages/migration/src/raw-zone/ingest.ts

/**
 * Ingest source data into Raw Zone
 */
export async function ingestToRawZone(
  db: Database,
  tenantId: string,
  migrationId: string,
  source: SourceConnection,
  options?: {
    tables?: string[];        // Specific tables, or all
    batchSize?: number;
    onProgress?: (progress: IngestProgress) => void;
  }
): Promise<IngestResult> {
  const introspector = getIntrospector(source.type);
  const schema = await introspectSource(source);
  
  const tablesToIngest = options?.tables 
    ? schema.tables.filter(t => options.tables!.includes(t.name))
    : schema.tables;
  
  const results: TableIngestResult[] = [];
  const batchSize = options?.batchSize ?? 1000;
  
  for (const table of tablesToIngest) {
    let offset = 0;
    let totalIngested = 0;
    
    while (true) {
      // Fetch batch from source
      const rows = await introspector.fetchRows(source, table.name, {
        limit: batchSize,
        offset,
      });
      
      if (rows.length === 0) break;
      
      // Convert to raw records
      const rawRecords: RawRecord[] = rows.map(row => ({
        id: generateUUID(),
        tenantId,
        migrationId,
        sourceType: source.type,
        sourceTable: table.name,
        sourceRowId: extractPrimaryKey(row, table),
        rawData: row,
        importBatch: `batch-${offset}`,
        importedAt: new Date().toISOString(),
        checksum: calculateChecksum(row),
      }));
      
      // Insert into Raw Zone (idempotent by checksum)
      await db.insert(rawZone)
        .values(rawRecords)
        .onConflictDoNothing();
      
      totalIngested += rows.length;
      offset += batchSize;
      
      options?.onProgress?.({
        table: table.name,
        processed: totalIngested,
        total: table.rowCount,
      });
    }
    
    results.push({
      table: table.name,
      recordsIngested: totalIngested,
    });
  }
  
  return {
    migrationId,
    tables: results,
    totalRecords: results.reduce((sum, r) => sum + r.recordsIngested, 0),
    completedAt: new Date().toISOString(),
  };
}
```

---

## 6) Canonical Transformation

### 6.1 Transformation Pipeline

```
Raw Zone → Semantic Mapping → Transform Functions → AXIS Canonical
```

```typescript
// packages/migration/src/transform/pipeline.ts

/**
 * Transform raw data to AXIS canonical format
 */
export async function transformToCanonical(
  db: Database,
  tenantId: string,
  migrationId: string,
  mappings: ColumnMapping[]
): Promise<TransformResult> {
  const results: TransformResult = {
    parties: [],
    items: [],
    accounts: [],
    transactions: [],
    errors: [],
  };
  
  // Group mappings by target entity
  const partyMappings = mappings.filter(m => m.targetSchema === "party");
  const itemMappings = mappings.filter(m => m.targetSchema === "item");
  const accountMappings = mappings.filter(m => m.targetSchema === "account");
  // ... etc
  
  // Transform parties
  if (partyMappings.length > 0) {
    const partyResult = await transformParties(db, tenantId, migrationId, partyMappings);
    results.parties = partyResult.records;
    results.errors.push(...partyResult.errors);
  }
  
  // Transform items
  if (itemMappings.length > 0) {
    const itemResult = await transformItems(db, tenantId, migrationId, itemMappings);
    results.items = itemResult.records;
    results.errors.push(...itemResult.errors);
  }
  
  // ... etc for accounts, transactions
  
  return results;
}

/**
 * Transform raw party records to AXIS Party schema
 */
async function transformParties(
  db: Database,
  tenantId: string,
  migrationId: string,
  mappings: ColumnMapping[]
): Promise<{ records: Party[]; errors: TransformError[] }> {
  const partyTableMapping = mappings[0]; // Assume all from same source table
  const sourceTable = partyTableMapping.sourceTable;
  
  // Fetch raw records
  const rawRecords = await db.query.rawZone.findMany({
    where: and(
      eq(rawZone.tenantId, tenantId),
      eq(rawZone.migrationId, migrationId),
      eq(rawZone.sourceTable, sourceTable)
    ),
  });
  
  const results: Party[] = [];
  const errors: TransformError[] = [];
  
  for (const raw of rawRecords) {
    try {
      // Apply column mappings
      const party: Partial<Party> = {
        id: generateUUID(),
        tenantId,
      };
      
      for (const mapping of mappings) {
        const sourceValue = raw.rawData[mapping.sourceColumn];
        const transformedValue = applyTransform(sourceValue, mapping.transform);
        setNestedProperty(party, mapping.targetField, transformedValue);
      }
      
      // Validate against schema
      const validated = partySchema.parse(party);
      results.push(validated);
    } catch (error) {
      errors.push({
        sourceTable,
        sourceRowId: raw.sourceRowId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  
  return { records: results, errors };
}
```

### 6.2 Transform Functions

```typescript
// packages/migration/src/transform/functions.ts

export const TRANSFORM_FUNCTIONS = {
  // String transforms
  trim: (v: unknown) => typeof v === "string" ? v.trim() : v,
  uppercase: (v: unknown) => typeof v === "string" ? v.toUpperCase() : v,
  lowercase: (v: unknown) => typeof v === "string" ? v.toLowerCase() : v,
  titlecase: (v: unknown) => typeof v === "string" ? toTitleCase(v) : v,
  
  // Date transforms
  parse_date: (v: unknown, format?: string) => parseDate(v, format),
  parse_datetime: (v: unknown, format?: string) => parseDateTime(v, format),
  
  // Number transforms
  parse_decimal: (v: unknown) => parseDecimal(v),
  parse_int: (v: unknown) => parseInt(String(v), 10),
  
  // Boolean transforms
  parse_bool: (v: unknown) => parseBool(v),
  yes_no_to_bool: (v: unknown) => /^(yes|y|true|1)$/i.test(String(v)),
  
  // Normalization
  normalize_phone: (v: unknown) => normalizePhone(v),
  normalize_email: (v: unknown) => normalizeEmail(v),
  normalize_country: (v: unknown) => normalizeCountryCode(v),
  
  // Lookup transforms (require context)
  lookup_account_type: (v: unknown, ctx: TransformContext) => lookupAccountType(v, ctx),
  lookup_item_type: (v: unknown, ctx: TransformContext) => lookupItemType(v, ctx),
  
  // Composite
  chain: (v: unknown, ...transforms: TransformFn[]) => 
    transforms.reduce((acc, fn) => fn(acc), v),
};

export function applyTransform(
  value: unknown,
  transform: TransformSpec | undefined
): unknown {
  if (!transform) return value;
  
  if (typeof transform === "string") {
    // Simple transform name
    const fn = TRANSFORM_FUNCTIONS[transform];
    if (!fn) throw new Error(`Unknown transform: ${transform}`);
    return fn(value);
  }
  
  // Transform with options
  const fn = TRANSFORM_FUNCTIONS[transform.name];
  if (!fn) throw new Error(`Unknown transform: ${transform.name}`);
  return fn(value, transform.options);
}
```

---

## 7) Exit Criteria (C02 Gate)

**C02 is complete ONLY when ALL of the following are true:**

| #   | Criterion                                    | Status |
| --- | -------------------------------------------- | ------ |
| 1   | Column Adapter pattern documented            | ✅      |
| 2   | Source abstraction layer defined             | ✅      |
| 3   | Schema introspection for multiple sources    | ✅      |
| 4   | Lynx semantic analyzer integration           | ✅      |
| 5   | Column pattern recognition rules             | ✅      |
| 6   | Raw Zone storage schema defined              | ✅      |
| 7   | Canonical transformation pipeline            | ✅      |
| 8   | Transform functions library                  | ✅      |

---

## 8) Integration with Other Phases

| Phase               | Integration                                      |
| ------------------- | ------------------------------------------------ |
| **C01** (Philosophy)| Column Adapter is the "how" of C01's "why"       |
| **C03** (Mapping)   | Semantic analysis feeds into Mapping Studio      |
| **A01-01** (Lynx)   | Lynx powers semantic column classification       |
| **B03** (MDM)       | Target schemas for party, item, location         |
| **B07** (Accounting)| Target schema for accounts, COA                  |

---

## Document Governance

| Field            | Value                                                               |
| ---------------- | ------------------------------------------------------------------- |
| **Status**       | **Implemented**                                                     |
| **Version**      | 1.0.0                                                               |
| **Derived From** | C01-MIGRATION-PHILOSOPHY.md, A01-01-LYNX.md v1.2.0, A01-07 v1.1.0   |
| **Phase**        | C02 (Column Adapter)                                                |
| **Author**       | AXIS Architecture Team                                              |
| **Last Updated** | 2026-01-22                                                          |

---

## Related Documents

| Document                                           | Purpose                               |
| -------------------------------------------------- | ------------------------------------- |
| [C01-MIGRATION-PHILOSOPHY.md](./C01-MIGRATION-PHILOSOPHY.md) | Philosophy (Column Adapter insight)  |
| [C03-MAPPING-STUDIO.md](./C03-MAPPING-STUDIO.md)   | Mapping Studio (uses semantic output) |
| [A01-01-LYNX.md](./A01-01-LYNX.md)                 | Lynx (powers semantic analysis)       |
| [B03-MDM.md](./B03-MDM.md)                         | MDM (target Party/Item schemas)       |
| [B07-ACCOUNTING.md](./B07-ACCOUNTING.md)           | Accounting (target Account schema)    |

---

> *"Column Adapter: One pattern for The Machine to understand all databases. Because all data is columns."*
