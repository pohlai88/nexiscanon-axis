/**
 * DataFortress Examples
 * PostgreSQL-level data table with audit trail, export, and advanced features
 */

import { Badge } from '@workspace/design-system/components/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import * as React from 'react';

import {
  DataFortress,
  type DataFortressColumn,
  type DataFortressRow,
} from '../data-fortress';

// ============================================================
// EXAMPLE 1: Customer Management Table
// ============================================================

type Customer = {
  customerId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  status: 'active' | 'pending' | 'inactive';
  totalOrders: number;
  totalRevenue: number;
  joinedDate: Date;
};

const customerColumns: DataFortressColumn<Customer>[] = [
  {
    id: 'customerId',
    accessorKey: 'customerId',
    header: 'Customer ID',
    sortable: true,
    defaultWidth: 120,
  },
  {
    id: 'companyName',
    accessorKey: 'companyName',
    header: 'Company',
    sortable: true,
    filterable: true,
    defaultWidth: 200,
  },
  {
    id: 'contact',
    header: 'Contact',
    cell: (row) => (
      <div>
        <div className="font-medium">{row.contactName}</div>
        <div className="text-muted-foreground text-sm">{row.contactEmail}</div>
      </div>
    ),
    defaultWidth: 220,
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
    defaultWidth: 100,
  },
  {
    id: 'totalOrders',
    accessorKey: 'totalOrders',
    header: 'Orders',
    align: 'right',
    sortable: true,
    defaultWidth: 100,
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
    defaultWidth: 120,
  },
  {
    id: 'joinedDate',
    accessorKey: 'joinedDate',
    header: 'Joined',
    format: (value) => new Date(value).toLocaleDateString(),
    sortable: true,
    defaultWidth: 120,
  },
];

const sampleCustomers: DataFortressRow<Customer>[] = [
  {
    _id: 'CUST-001',
    customerId: 'CUST-001',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    contactEmail: 'john@acme.com',
    status: 'active',
    totalOrders: 125,
    totalRevenue: 45200.5,
    joinedDate: new Date('2023-01-15'),
    _audit: [
      {
        timestamp: new Date('2023-01-15T10:00:00'),
        user: 'sales@company.com',
        action: 'created',
        note: 'Customer onboarded by sales team',
      },
      {
        timestamp: new Date('2023-02-20T14:30:00'),
        user: 'admin@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'pending',
        newValue: 'active',
        note: 'KYC verification completed',
      },
      {
        timestamp: new Date('2024-01-10T09:15:00'),
        user: 'finance@company.com',
        action: 'updated',
        field: 'totalRevenue',
        oldValue: 38500.0,
        newValue: 45200.5,
        note: 'Updated after Q4 reconciliation',
      },
    ],
  },
  {
    _id: 'CUST-002',
    customerId: 'CUST-002',
    companyName: 'TechStart Inc',
    contactName: 'Sarah Johnson',
    contactEmail: 'sarah@techstart.io',
    status: 'active',
    totalOrders: 89,
    totalRevenue: 32100.0,
    joinedDate: new Date('2023-03-22'),
    _audit: [
      {
        timestamp: new Date('2023-03-22T11:00:00'),
        user: 'sales@company.com',
        action: 'created',
        note: 'Customer registered via website',
      },
      {
        timestamp: new Date('2023-03-25T15:00:00'),
        user: 'admin@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'pending',
        newValue: 'active',
        note: 'Automated approval after initial order',
      },
    ],
  },
  {
    _id: 'CUST-003',
    customerId: 'CUST-003',
    companyName: 'Global Traders Ltd',
    contactName: 'Michael Chen',
    contactEmail: 'm.chen@globaltraders.com',
    status: 'pending',
    totalOrders: 0,
    totalRevenue: 0,
    joinedDate: new Date('2024-01-18'),
    _audit: [
      {
        timestamp: new Date('2024-01-18T16:30:00'),
        user: 'system@company.com',
        action: 'created',
        note: 'Auto-created from lead conversion',
      },
    ],
  },
  {
    _id: 'CUST-004',
    customerId: 'CUST-004',
    companyName: 'RetailPro Solutions',
    contactName: 'Emily Rodriguez',
    contactEmail: 'emily@retailpro.com',
    status: 'inactive',
    totalOrders: 45,
    totalRevenue: 15600.0,
    joinedDate: new Date('2022-11-10'),
    _audit: [
      {
        timestamp: new Date('2022-11-10T09:00:00'),
        user: 'sales@company.com',
        action: 'created',
        note: 'Customer onboarded',
      },
      {
        timestamp: new Date('2023-12-15T10:00:00'),
        user: 'admin@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'active',
        newValue: 'inactive',
        note: 'No activity for 6 months - marked inactive',
      },
    ],
  },
];

export function CustomerManagementExample() {
  const [selectedRows, setSelectedRows] = React.useState<Set<string | number>>(
    new Set(),
  );

  const rowActions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: (row: DataFortressRow<Customer>) => {
        console.log('View customer:', row);
      },
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row: DataFortressRow<Customer>) => {
        console.log('Edit customer:', row);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: DataFortressRow<Customer>) => {
        console.log('Delete customer:', row);
      },
      variant: 'destructive' as const,
    },
  ];

  const bulkActions = [
    {
      label: 'Export Selected',
      onClick: (rows: DataFortressRow<Customer>[]) => {
        console.log('Export customers:', rows);
      },
    },
    {
      label: 'Activate Selected',
      onClick: (rows: DataFortressRow<Customer>[]) => {
        console.log('Activate customers:', rows);
      },
    },
    {
      label: 'Delete Selected',
      icon: Trash2,
      onClick: (rows: DataFortressRow<Customer>[]) => {
        console.log('Delete customers:', rows);
      },
      variant: 'destructive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Management</h2>
        <p className="text-muted-foreground">
          Manage customers with complete audit trail and bulk actions
        </p>
      </div>

      <DataFortress
        data={sampleCustomers}
        columns={customerColumns}
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        sortable
        filterable
        pagination
        pageSize={10}
        searchable
        searchPlaceholder="Search customers..."
        rowActions={rowActions}
        bulkActions={bulkActions}
        exportable
        onExport={(format) => console.log(`Export as ${format}`)}
        auditEnabled
        refreshable
        onRefresh={() => console.log('Refresh data')}
        striped
        rowClassName={(row) => (row.status === 'inactive' ? 'opacity-50' : '')}
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 2: Order Processing Table
// ============================================================

type Order = {
  orderNumber: string;
  customerName: string;
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
};

const orderColumns: DataFortressColumn<Order>[] = [
  {
    id: 'orderNumber',
    accessorKey: 'orderNumber',
    header: 'Order #',
    sortable: true,
    defaultWidth: 120,
  },
  {
    id: 'customer',
    accessorKey: 'customerName',
    header: 'Customer',
    sortable: true,
    filterable: true,
    defaultWidth: 200,
  },
  {
    id: 'orderDate',
    accessorKey: 'orderDate',
    header: 'Date',
    format: (value) => new Date(value).toLocaleDateString(),
    sortable: true,
    defaultWidth: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: (row) => {
      const variants: Record<Order['status'], any> = {
        pending: 'secondary',
        processing: 'default',
        shipped: 'default',
        delivered: 'default',
        cancelled: 'destructive',
      };
      return <Badge variant={variants[row.status]}>{row.status}</Badge>;
    },
    filterable: true,
    defaultWidth: 120,
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    cell: (row) => {
      const colors: Record<Order['priority'], string> = {
        low: 'bg-gray-100 text-gray-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
      };
      return (
        <Badge className={colors[row.priority]} variant="outline">
          {row.priority}
        </Badge>
      );
    },
    filterable: true,
    defaultWidth: 100,
  },
  {
    id: 'items',
    accessorKey: 'itemCount',
    header: 'Items',
    align: 'center',
    sortable: true,
    defaultWidth: 80,
  },
  {
    id: 'subtotal',
    accessorKey: 'subtotal',
    header: 'Subtotal',
    align: 'right',
    format: (value) => `$${value.toFixed(2)}`,
    sortable: true,
    defaultWidth: 100,
  },
  {
    id: 'tax',
    accessorKey: 'tax',
    header: 'Tax',
    align: 'right',
    format: (value) => `$${value.toFixed(2)}`,
    sortable: true,
    defaultWidth: 100,
  },
  {
    id: 'total',
    accessorKey: 'total',
    header: 'Total',
    align: 'right',
    cell: (row) => <div className="font-semibold">${row.total.toFixed(2)}</div>,
    sortable: true,
    defaultWidth: 120,
  },
];

const sampleOrders: DataFortressRow<Order>[] = [
  {
    _id: 'ORD-001',
    orderNumber: 'ORD-001',
    customerName: 'Acme Corporation',
    orderDate: new Date('2024-01-10'),
    status: 'delivered',
    itemCount: 5,
    subtotal: 1150.0,
    tax: 100.0,
    total: 1250.0,
    priority: 'normal',
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
  {
    _id: 'ORD-002',
    orderNumber: 'ORD-002',
    customerName: 'TechStart Inc',
    orderDate: new Date('2024-01-15'),
    status: 'processing',
    itemCount: 12,
    subtotal: 2800.0,
    tax: 240.0,
    total: 3040.0,
    priority: 'high',
    _audit: [
      {
        timestamp: new Date('2024-01-15T11:00:00'),
        user: 'web@company.com',
        action: 'created',
        note: 'Order placed via website',
      },
      {
        timestamp: new Date('2024-01-15T15:30:00'),
        user: 'cs@company.com',
        action: 'updated',
        field: 'priority',
        oldValue: 'normal',
        newValue: 'high',
        note: 'Customer requested expedited shipping',
      },
      {
        timestamp: new Date('2024-01-16T09:00:00'),
        user: 'warehouse@company.com',
        action: 'updated',
        field: 'status',
        oldValue: 'pending',
        newValue: 'processing',
        note: 'Items picked and packing in progress',
      },
    ],
  },
  {
    _id: 'ORD-003',
    orderNumber: 'ORD-003',
    customerName: 'Global Traders Ltd',
    orderDate: new Date('2024-01-18'),
    status: 'pending',
    itemCount: 3,
    subtotal: 450.0,
    tax: 38.0,
    total: 488.0,
    priority: 'urgent',
    _audit: [
      {
        timestamp: new Date('2024-01-18T16:45:00'),
        user: 'sales@company.com',
        action: 'created',
        note: 'Rush order - customer needs by EOW',
      },
      {
        timestamp: new Date('2024-01-18T17:00:00'),
        user: 'manager@company.com',
        action: 'updated',
        field: 'priority',
        oldValue: 'high',
        newValue: 'urgent',
        note: 'Escalated to urgent - critical parts',
      },
    ],
  },
];

export function OrderProcessingExample() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Order Processing</h2>
        <p className="text-muted-foreground">
          Track orders from creation to delivery with complete audit trail
        </p>
      </div>

      <DataFortress
        data={sampleOrders}
        columns={orderColumns}
        selectable
        sortable
        defaultSort={[{ column: 'orderDate', direction: 'desc' }]}
        filterable
        pagination
        pageSize={25}
        searchable
        searchPlaceholder="Search orders..."
        exportable
        auditEnabled
        refreshable
        striped
        rowClassName={(row) => {
          if (row.priority === 'urgent') return 'border-l-4 border-l-red-500';
          if (row.priority === 'high') return 'border-l-4 border-l-orange-500';
          return '';
        }}
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Server-Side Table
// ============================================================

export function ServerSideTableExample() {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    page: 1,
    pageSize: 50,
    total: 0,
  });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setData(sampleCustomers.slice(0, pagination.pageSize));
      setPagination((prev) => ({ ...prev, total: 100 }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Server-Side Operations</h2>
        <p className="text-muted-foreground">
          All operations (sort, filter, pagination) happen on the server
        </p>
      </div>

      <DataFortress
        data={data}
        columns={customerColumns}
        isLoading={loading}
        pagination
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
        totalRecords={pagination.total}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) =>
          setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
        }
        refreshable
        onRefresh={fetchData}
      />
    </div>
  );
}

// ============================================================
// EXPORT ALL EXAMPLES
// ============================================================

export const DataFortressExamples = {
  CustomerManagement: CustomerManagementExample,
  OrderProcessing: OrderProcessingExample,
  ServerSide: ServerSideTableExample,
};
