# DataFortress - PostgreSQL-Level Data Table

**The ultimate ERP data table component** that rivals Neon, Prisma Studio, Drizzle Studio, and Cloudflare D1.

## 🚀 Features

### Core Capabilities

- ✅ **Advanced Sorting** - Multi-column sorting with visual indicators
- ✅ **Powerful Filtering** - Column-specific filters with operators
- ✅ **Smart Pagination** - Server-side pagination with customizable page sizes
- ✅ **Row Selection** - Bulk selection with checkbox support
- ✅ **Search** - Global search across all columns
- ✅ **Export** - CSV, Excel, JSON export formats
- ✅ **Resizable Columns** - Drag to resize column widths
- ✅ **Column Visibility** - Show/hide columns dynamically
- ✅ **Loading States** - Beautiful skeleton loaders
- ✅ **Empty States** - Elegant empty state handling

### Beast Mode Features

- 🔥 **Audit Trail Drawer** - Right-side overlay showing complete change history
- 🔥 **Row Actions** - Contextual actions for each row (Edit, Delete, etc.)
- 🔥 **Bulk Actions** - Actions on multiple selected rows
- 🔥 **Virtual Scrolling** - Handle 10k+ rows smoothly
- 🔥 **Custom Cell Renderers** - Full control over cell content
- 🔥 **Striped Rows** - Alternating row colors for readability
- 🔥 **Compact Mode** - Dense table layout for more data
- 🔥 **Custom Row Styling** - Dynamic row classes based on data

## 📦 Installation

The DataFortress uses these Shadcn components (already installed):

```bash
npx shadcn@latest add table drawer resizable empty sonner scroll-area skeleton spinner
```

## 🎯 Basic Usage

```tsx
import {
  DataFortress,
  DataFortressColumn,
  DataFortressRow,
} from '@workspace/shared-ui/blocks';

type Product = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
};

const columns: DataFortressColumn<Product>[] = [
  {
    id: 'sku',
    accessorKey: 'sku',
    header: 'SKU',
    sortable: true,
    filterable: true,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Product Name',
    sortable: true,
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: 'Price',
    align: 'right',
    format: (value) => `$${value.toFixed(2)}`,
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: 'Stock',
    align: 'center',
    cell: (row) => (
      <Badge variant={row.stock > 10 ? 'default' : 'destructive'}>
        {row.stock}
      </Badge>
    ),
  },
];

const data: DataFortressRow<Product>[] = [
  {
    _id: 1,
    sku: 'PRD-001',
    name: 'Widget Pro',
    price: 99.99,
    stock: 45,
    status: 'active',
    _audit: [
      {
        timestamp: new Date('2024-01-15'),
        user: 'john@company.com',
        action: 'created',
        note: 'Initial product creation',
      },
      {
        timestamp: new Date('2024-01-20'),
        user: 'sarah@company.com',
        action: 'updated',
        field: 'price',
        oldValue: 89.99,
        newValue: 99.99,
        note: 'Price increase due to demand',
      },
    ],
  },
  // ... more rows
];

export function ProductsTable() {
  return (
    <DataFortress
      data={data}
      columns={columns}
      selectable
      pagination
      searchable
      exportable
      auditEnabled
    />
  );
}
```

## 🎨 Advanced Examples

### Example 1: Full-Featured ERP Table

```tsx
import { DataFortress } from '@workspace/shared-ui/blocks';
import { Edit, Trash2, Eye } from 'lucide-react';

export function CustomersTable() {
  const [data, setData] = React.useState<Customer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(
    new Set(),
  );

  const columns: DataFortressColumn<Customer>[] = [
    {
      id: 'customerId',
      accessorKey: 'customerId',
      header: 'Customer ID',
      sortable: true,
      pinned: 'left',
    },
    {
      id: 'companyName',
      accessorKey: 'companyName',
      header: 'Company',
      sortable: true,
      filterable: true,
    },
    {
      id: 'contact',
      accessorKey: 'contactName',
      header: 'Contact',
      cell: (row) => (
        <div>
          <div className="font-medium">{row.contactName}</div>
          <div className="text-muted-foreground text-sm">
            {row.contactEmail}
          </div>
        </div>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      cell: (row) => (
        <Badge
          variant={
            row.status === 'active'
              ? 'default'
              : row.status === 'pending'
                ? 'secondary'
                : 'destructive'
          }
        >
          {row.status}
        </Badge>
      ),
      filterable: true,
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Pending', value: 'pending' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      id: 'totalOrders',
      accessorKey: 'totalOrders',
      header: 'Total Orders',
      align: 'right',
      sortable: true,
    },
    {
      id: 'revenue',
      accessorKey: 'totalRevenue',
      header: 'Revenue',
      align: 'right',
      format: (value) =>
        new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value),
      sortable: true,
    },
  ];

  const rowActions = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => console.log('Edit', row),
    },
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row) => console.log('View', row),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row) => console.log('Delete', row),
      variant: 'destructive' as const,
    },
  ];

  const bulkActions = [
    {
      label: 'Export Selected',
      onClick: (rows) => console.log('Export', rows),
    },
    {
      label: 'Delete Selected',
      onClick: (rows) => console.log('Delete', rows),
      variant: 'destructive' as const,
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    console.log(`Exporting as ${format}`);
    // Implementation here
  };

  const handleRefresh = () => {
    setLoading(true);
    // Fetch data
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <DataFortress
      data={data}
      columns={columns}
      isLoading={loading}
      selectable
      selectedRows={selectedRows}
      onSelectionChange={setSelectedRows}
      sortable
      filterable
      pagination
      pageSize={50}
      searchable
      searchPlaceholder="Search customers..."
      rowActions={rowActions}
      bulkActions={bulkActions}
      exportable
      onExport={handleExport}
      auditEnabled
      refreshable
      onRefresh={handleRefresh}
      striped
      rowClassName={(row) => (row.status === 'inactive' ? 'opacity-50' : '')}
    />
  );
}
```

### Example 2: Audit Trail with Right Drawer

```tsx
export function OrdersTable() {
  return (
    <DataFortress
      data={ordersWithAudit}
      columns={orderColumns}
      auditEnabled
      onViewAudit={(row) => {
        console.log('View audit for order:', row._id);
        // Audit drawer opens automatically
      }}
    />
  );
}

// Data structure with audit trail
const ordersWithAudit = [
  {
    _id: 'ORD-001',
    orderNumber: 'ORD-001',
    customer: 'Acme Corp',
    total: 1250.0,
    status: 'delivered',
    _audit: [
      {
        timestamp: new Date('2024-01-10T10:30:00'),
        user: 'system@company.com',
        action: 'created',
        note: 'Order placed via API',
      },
      {
        timestamp: new Date('2024-01-10T14:00:00'),
        user: 'warehouse@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'pending',
        newValue: 'processing',
        note: 'Order moved to processing',
      },
      {
        timestamp: new Date('2024-01-11T09:00:00'),
        user: 'shipping@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'processing',
        newValue: 'shipped',
        note: 'Package shipped via FedEx #123456',
      },
      {
        timestamp: new Date('2024-01-13T16:00:00'),
        user: 'system@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'shipped',
        newValue: 'delivered',
        note: 'Delivery confirmed',
      },
    ],
  },
];
```

### Example 3: Server-Side Operations

```tsx
export function ServerSideTable() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    page: 1,
    pageSize: 50,
    total: 0,
  });
  const [sort, setSort] = React.useState<DataFortressSortConfig[]>([]);
  const [filters, setFilters] = React.useState<DataFortressFilterConfig[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: pagination.page,
          pageSize: pagination.pageSize,
          sort,
          filters,
          search: searchQuery,
        }),
      });
      const result = await response.json();
      setData(result.data);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, sort, filters, searchQuery]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataFortress
      data={data}
      columns={columns}
      isLoading={loading}
      pagination
      currentPage={pagination.page}
      pageSize={pagination.pageSize}
      totalRecords={pagination.total}
      onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) =>
        setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
      }
      sortable
      onSortChange={setSort}
      filterable
      onFilterChange={setFilters}
      searchable
      onSearch={setSearchQuery}
      refreshable
      onRefresh={fetchData}
    />
  );
}
```

## 🎛️ Props Reference

### DataFortressProps

| Prop                | Type                         | Default              | Description                          |
| ------------------- | ---------------------------- | -------------------- | ------------------------------------ |
| `data`              | `DataFortressRow<T>[]`       | **Required**         | Array of data rows                   |
| `columns`           | `DataFortressColumn<T>[]`    | **Required**         | Column definitions                   |
| `isLoading`         | `boolean`                    | `false`              | Show loading skeletons               |
| `isEmpty`           | `boolean`                    | `false`              | Show empty state                     |
| `emptyMessage`      | `string`                     | `"No records found"` | Empty state title                    |
| `emptyDescription`  | `string`                     | `"Try adjusting..."` | Empty state description              |
| `selectable`        | `boolean`                    | `false`              | Enable row selection                 |
| `selectedRows`      | `Set<string \| number>`      | `undefined`          | Controlled selected rows             |
| `onSelectionChange` | `(ids: Set) => void`         | `undefined`          | Selection change handler             |
| `sortable`          | `boolean`                    | `true`               | Enable sorting                       |
| `defaultSort`       | `DataFortressSortConfig[]`   | `[]`                 | Initial sort config                  |
| `onSortChange`      | `(sort) => void`             | `undefined`          | Sort change handler                  |
| `filterable`        | `boolean`                    | `true`               | Enable filtering                     |
| `defaultFilters`    | `DataFortressFilterConfig[]` | `[]`                 | Initial filters                      |
| `onFilterChange`    | `(filters) => void`          | `undefined`          | Filter change handler                |
| `pagination`        | `boolean`                    | `true`               | Enable pagination                    |
| `pageSize`          | `number`                     | `50`                 | Rows per page                        |
| `currentPage`       | `number`                     | `1`                  | Current page number                  |
| `totalRecords`      | `number`                     | `undefined`          | Total record count (for server-side) |
| `onPageChange`      | `(page) => void`             | `undefined`          | Page change handler                  |
| `onPageSizeChange`  | `(size) => void`             | `undefined`          | Page size change handler             |
| `rowActions`        | `Array<RowAction>`           | `[]`                 | Actions for each row                 |
| `bulkActions`       | `Array<BulkAction>`          | `[]`                 | Actions for selected rows            |
| `exportable`        | `boolean`                    | `true`               | Enable export                        |
| `onExport`          | `(format) => void`           | `undefined`          | Export handler                       |
| `auditEnabled`      | `boolean`                    | `true`               | Enable audit trail drawer            |
| `onViewAudit`       | `(row) => void`              | `undefined`          | View audit handler                   |
| `searchable`        | `boolean`                    | `true`               | Enable search                        |
| `searchPlaceholder` | `string`                     | `"Search..."`        | Search input placeholder             |
| `onSearch`          | `(query) => void`            | `undefined`          | Search handler                       |
| `refreshable`       | `boolean`                    | `true`               | Enable refresh button                |
| `onRefresh`         | `() => void`                 | `undefined`          | Refresh handler                      |
| `striped`           | `boolean`                    | `true`               | Alternating row colors               |
| `bordered`          | `boolean`                    | `false`              | Show table border                    |
| `compact`           | `boolean`                    | `false`              | Compact row height                   |
| `className`         | `string`                     | `undefined`          | Additional CSS classes               |
| `rowClassName`      | `(row) => string`            | `undefined`          | Dynamic row classes                  |

### DataFortressColumn

| Prop            | Type                            | Description                       |
| --------------- | ------------------------------- | --------------------------------- |
| `id`            | `string`                        | **Required** - Unique column ID   |
| `accessorKey`   | `keyof T`                       | Key to access data in row object  |
| `header`        | `string`                        | **Required** - Column header text |
| `cell`          | `(row: T) => ReactNode`         | Custom cell renderer              |
| `sortable`      | `boolean`                       | Enable sorting for this column    |
| `filterable`    | `boolean`                       | Enable filtering for this column  |
| `resizable`     | `boolean`                       | Enable resizing for this column   |
| `minWidth`      | `number`                        | Minimum column width (px)         |
| `maxWidth`      | `number`                        | Maximum column width (px)         |
| `defaultWidth`  | `number`                        | Default column width (px)         |
| `hidden`        | `boolean`                       | Hide this column                  |
| `pinned`        | `"left" \| "right" \| false`    | Pin column position               |
| `align`         | `"left" \| "center" \| "right"` | Text alignment                    |
| `format`        | `(value: any) => string`        | Value formatter                   |
| `filterOptions` | `Array<{label, value}>`         | Filter dropdown options           |

### DataFortressRow

```typescript
type DataFortressRow<T> = T & {
  _id: string | number; // Required unique identifier
  _audit?: AuditTrail[]; // Optional audit history
};
```

### AuditTrail

```typescript
type AuditTrail = {
  timestamp: Date;
  user: string;
  action: 'created' | 'updated' | 'deleted';
  field?: string; // Which field changed
  oldValue?: any; // Previous value
  newValue?: any; // New value
  note?: string; // Change description
};
```

## 🎨 Styling & Theming

DataFortress uses Shadcn components and respects your theme configuration:

```tsx
// Custom styling example
<DataFortress
  data={data}
  columns={columns}
  className="shadow-lg"
  rowClassName={(row) => {
    if (row.status === 'error') return 'bg-destructive/10';
    if (row.status === 'warning') return 'bg-warning/10';
    return '';
  }}
  striped={false}
  bordered
  compact
/>
```

## 🚀 Performance Tips

1. **Virtual Scrolling** - Enable for large datasets (10k+ rows)

```tsx
<DataFortress virtualScroll data={largeDataset} />
```

2. **Server-Side Operations** - Offload sorting/filtering/pagination to backend

```tsx
<DataFortress
  data={data}
  totalRecords={1000000}
  onSortChange={handleServerSort}
  onFilterChange={handleServerFilter}
  onPageChange={handleServerPagination}
/>
```

3. **Memoize Custom Cells** - Prevent unnecessary re-renders

```tsx
const columns = React.useMemo(
  () => [
    {
      id: 'custom',
      cell: React.memo((row) => <ComplexComponent data={row} />),
    },
  ],
  [],
);
```

## 🎯 Comparison with Other Tools

| Feature      | DataFortress      | Prisma Studio | Drizzle Studio | Neon Console |
| ------------ | ----------------- | ------------- | -------------- | ------------ |
| Sorting      | ✅ Multi-column   | ✅            | ✅             | ✅           |
| Filtering    | ✅ Advanced       | ✅            | ✅             | ✅           |
| Audit Trail  | ✅ Built-in       | ❌            | ❌             | ❌           |
| Export       | ✅ CSV/Excel/JSON | ❌            | ❌             | ✅ CSV       |
| Bulk Actions | ✅                | ❌            | ❌             | ❌           |
| Custom Cells | ✅ Full control   | ❌            | ❌             | ❌           |
| Themeable    | ✅ Shadcn         | ❌            | ❌             | ❌           |
| Reusable     | ✅ Component      | ❌ App-only   | ❌ App-only    | ❌ App-only  |

## 📚 Real-World Use Cases

### 1. Customer Management

- View all customers with company details
- Bulk export selected customers
- Track status changes in audit trail
- Filter by status, region, account manager

### 2. Order Processing

- Display orders with calculated totals
- View complete order history (created → shipped → delivered)
- Bulk actions (approve, cancel, refund)
- Export orders for accounting

### 3. Inventory Management

- Monitor stock levels with color-coded alerts
- Track price changes over time
- Bulk update product statuses
- Export for warehouse reporting

### 4. User Administration

- Manage user accounts and permissions
- View login history and changes
- Bulk activate/deactivate users
- Export user lists for compliance

### 5. Financial Transactions

- Display transactions with formatted amounts
- Filter by date range, status, type
- View audit trail for compliance
- Export for financial reporting

## 🔮 Roadmap

- [ ] Column reordering (drag & drop)
- [ ] Inline cell editing
- [ ] Advanced filters (date range, multi-select)
- [ ] Saved views & presets
- [ ] Real-time updates (WebSocket)
- [ ] Column grouping
- [ ] Pivot table mode
- [ ] Chart overlays

## 🎉 Summary

**DataFortress** is the ultimate data table for ERP systems:

- PostgreSQL-level power in a React component
- Rivals Prisma Studio, Drizzle Studio, Neon Console
- Built-in audit trail with drawer overlay
- Export to CSV, Excel, JSON
- Fully themeable with Shadcn
- Production-ready for enterprise apps

**Total Components: 55** (including DataFortress!)
