import React from 'react';

import {
  ExcelModeGrid,
  NavbarOverlay,
  CRUDSPToolbar,
  ERPModulePresets,
  type GridColumn,
  type GridRow,
  type CellChange,
} from '@workspace/shared-ui/blocks';

/**
 * Invoice Bulk Status Update Example
 *
 * Admin updating 40 unpaid invoices from "Pending" to "Overdue"
 */
export function InvoiceBulkStatusUpdate() {
  interface Invoice extends GridRow {
    invoice_number: string;
    customer: string;
    amount: number;
    status: string;
    due_date: string;
    days_overdue: number;
  }

  const [invoices, setInvoices] = React.useState<Invoice[]>([
    {
      id: '1',
      invoice_number: 'INV-001',
      customer: 'Acme Corp',
      amount: 2500,
      status: 'Pending',
      due_date: '2024-01-10',
      days_overdue: 11,
    },
    {
      id: '2',
      invoice_number: 'INV-002',
      customer: 'TechStart Inc',
      amount: 1800,
      status: 'Pending',
      due_date: '2024-01-12',
      days_overdue: 9,
    },
    {
      id: '3',
      invoice_number: 'INV-003',
      customer: 'Global Solutions',
      amount: 5200,
      status: 'Pending',
      due_date: '2024-01-08',
      days_overdue: 13,
    },
    {
      id: '4',
      invoice_number: 'INV-004',
      customer: 'Design Studio',
      amount: 3100,
      status: 'Pending',
      due_date: '2024-01-15',
      days_overdue: 6,
    },
    {
      id: '5',
      invoice_number: 'INV-005',
      customer: 'Marketing Plus',
      amount: 4700,
      status: 'Pending',
      due_date: '2024-01-11',
      days_overdue: 10,
    },
    // ... 35 more rows would be here
  ]);

  const columns: GridColumn<Invoice>[] = [
    {
      id: 'invoice_number',
      header: 'Invoice #',
      accessor: 'invoice_number',
      type: 'text',
      editable: false,
      width: 120,
    },
    {
      id: 'customer',
      header: 'Customer',
      accessor: 'customer',
      type: 'text',
      editable: true,
      width: 200,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      type: 'currency',
      editable: true,
      width: 120,
      format: (value) => `$${value.toLocaleString()}`,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      type: 'select',
      editable: true,
      width: 150,
      options: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Overdue', value: 'Overdue' },
        { label: 'Paid', value: 'Paid' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
    {
      id: 'due_date',
      header: 'Due Date',
      accessor: 'due_date',
      type: 'date',
      editable: true,
      width: 120,
    },
    {
      id: 'days_overdue',
      header: 'Days Overdue',
      accessor: 'days_overdue',
      type: 'number',
      editable: false,
      width: 120,
      format: (value) => (value > 0 ? `${value} days` : '—'),
    },
  ];

  const handleSave = async (data: Invoice[]) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Saving data:', data);
    alert('✅ Changes saved successfully!');
  };

  const handleDataChange = (changes: CellChange[]) => {
    console.log('Changes:', changes);
  };

  const crudspHandlers = {
    create: () => alert('Create new invoice'),
    read: () => alert('View invoices'),
    update: () => alert('Update selected'),
    delete: () => alert('Delete selected'),
    search: () => alert('Search invoices'),
    audit: () => alert('View audit trail'),
    predict: () => alert('Predict payment dates'),
  };

  return (
    <div className="flex h-screen flex-col">
      <NavbarOverlay
        title="Invoice Management"
        user={{
          name: 'Finance Admin',
          email: 'admin@company.com',
          role: 'Finance',
        }}
        transparent
      />

      <div className="flex-1 overflow-hidden pt-16">
        <div className="h-full space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Bulk Invoice Update</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Click any cell to edit. Drag the handle in bottom-right corner
                to fill down.
              </p>
            </div>

            <CRUDSPToolbar
              actions={ERPModulePresets.finance(crudspHandlers)}
              layout="horizontal"
              showLabels={false}
            />
          </div>

          <ExcelModeGrid
            columns={columns}
            data={invoices}
            onDataChange={handleDataChange}
            onSave={handleSave}
            enableDragFill
            enableBulkEdit
            enableKeyboardNav
            showToolbar
          />

          <div className="bg-muted/50 rounded-lg border p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold">
              💡 Pro Tips
            </h3>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>
                • Click "Pending" in Status column, select "Overdue", grab
                handle, drag down 20 rows
              </li>
              <li>
                • Use{' '}
                <kbd className="bg-background rounded px-1 py-0.5">Tab</kbd> to
                move between cells
              </li>
              <li>
                • Press{' '}
                <kbd className="bg-background rounded px-1 py-0.5">Ctrl+C</kbd>{' '}
                /{' '}
                <kbd className="bg-background rounded px-1 py-0.5">Ctrl+V</kbd>{' '}
                to copy/paste
              </li>
              <li>
                • Press{' '}
                <kbd className="bg-background rounded px-1 py-0.5">Ctrl+Z</kbd>{' '}
                to undo changes
              </li>
              <li>
                • Press{' '}
                <kbd className="bg-background rounded px-1 py-0.5">Ctrl+S</kbd>{' '}
                to save all changes at once
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Product Inventory Bulk Edit Example
 */
export function ProductInventoryBulkEdit() {
  interface Product extends GridRow {
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
  }

  const [products, setProducts] = React.useState<Product[]>([
    {
      id: '1',
      sku: 'SKU-001',
      name: 'Laptop Stand',
      category: 'Accessories',
      price: 49.99,
      stock: 150,
      status: 'Active',
    },
    {
      id: '2',
      sku: 'SKU-002',
      name: 'Wireless Mouse',
      category: 'Peripherals',
      price: 29.99,
      stock: 320,
      status: 'Active',
    },
    {
      id: '3',
      sku: 'SKU-003',
      name: 'USB-C Hub',
      category: 'Accessories',
      price: 39.99,
      stock: 89,
      status: 'Low Stock',
    },
    {
      id: '4',
      sku: 'SKU-004',
      name: 'Keyboard',
      category: 'Peripherals',
      price: 79.99,
      stock: 200,
      status: 'Active',
    },
    {
      id: '5',
      sku: 'SKU-005',
      name: 'Monitor',
      category: 'Displays',
      price: 299.99,
      stock: 45,
      status: 'Active',
    },
  ]);

  const columns: GridColumn<Product>[] = [
    { id: 'sku', header: 'SKU', accessor: 'sku', editable: false, width: 100 },
    {
      id: 'name',
      header: 'Product Name',
      accessor: 'name',
      editable: true,
      width: 200,
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      type: 'select',
      editable: true,
      options: ['Accessories', 'Peripherals', 'Displays', 'Audio', 'Storage'],
      width: 150,
    },
    {
      id: 'price',
      header: 'Price',
      accessor: 'price',
      type: 'currency',
      editable: true,
      width: 100,
      format: (val) => `$${val.toFixed(2)}`,
      validation: (val) => (val < 0 ? 'Price cannot be negative' : null),
    },
    {
      id: 'stock',
      header: 'Stock',
      accessor: 'stock',
      type: 'number',
      editable: true,
      width: 80,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      type: 'select',
      editable: true,
      options: ['Active', 'Low Stock', 'Out of Stock', 'Discontinued'],
      width: 130,
    },
  ];

  return (
    <div className="h-screen p-6">
      <h1 className="mb-4 text-2xl font-bold">Product Inventory</h1>
      <ExcelModeGrid
        columns={columns}
        data={products}
        onSave={async (data) => {
          await new Promise((r) => setTimeout(r, 500));
          alert('✅ Inventory updated!');
        }}
        enableDragFill
        enableKeyboardNav
      />
    </div>
  );
}

/**
 * Employee Data Bulk Update Example
 */
export function EmployeeBulkUpdate() {
  interface Employee extends GridRow {
    emp_id: string;
    name: string;
    department: string;
    role: string;
    salary: number;
    status: string;
  }

  const [employees, setEmployees] = React.useState<Employee[]>([
    {
      id: '1',
      emp_id: 'EMP-001',
      name: 'John Doe',
      department: 'Engineering',
      role: 'Senior Developer',
      salary: 95000,
      status: 'Active',
    },
    {
      id: '2',
      emp_id: 'EMP-002',
      name: 'Jane Smith',
      department: 'Marketing',
      role: 'Marketing Manager',
      salary: 85000,
      status: 'Active',
    },
    {
      id: '3',
      emp_id: 'EMP-003',
      name: 'Bob Johnson',
      department: 'Sales',
      role: 'Sales Rep',
      salary: 65000,
      status: 'Active',
    },
    {
      id: '4',
      emp_id: 'EMP-004',
      name: 'Alice Brown',
      department: 'Engineering',
      role: 'Developer',
      salary: 75000,
      status: 'Active',
    },
    {
      id: '5',
      emp_id: 'EMP-005',
      name: 'Charlie Wilson',
      department: 'HR',
      role: 'HR Specialist',
      salary: 60000,
      status: 'Active',
    },
  ]);

  const columns: GridColumn<Employee>[] = [
    {
      id: 'emp_id',
      header: 'Employee ID',
      accessor: 'emp_id',
      editable: false,
      width: 120,
    },
    {
      id: 'name',
      header: 'Name',
      accessor: 'name',
      editable: true,
      width: 150,
    },
    {
      id: 'department',
      header: 'Department',
      accessor: 'department',
      type: 'select',
      editable: true,
      options: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'],
      width: 130,
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      editable: true,
      width: 180,
    },
    {
      id: 'salary',
      header: 'Salary',
      accessor: 'salary',
      type: 'currency',
      editable: true,
      width: 120,
      format: (val) => `$${val.toLocaleString()}`,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      type: 'select',
      editable: true,
      options: ['Active', 'On Leave', 'Terminated'],
      width: 120,
    },
  ];

  return (
    <div className="h-screen p-6">
      <h1 className="mb-4 text-2xl font-bold">Employee Directory</h1>
      <ExcelModeGrid
        columns={columns}
        data={employees}
        onSave={async (data) => {
          console.log('Saving employee data:', data);
          await new Promise((r) => setTimeout(r, 800));
          alert('✅ Employee data saved!');
        }}
        enableDragFill
        enableKeyboardNav
        autoSave={false}
      />
    </div>
  );
}

/**
 * Minimal Example - Simple Grid
 */
export function MinimalExcelGrid() {
  interface SimpleRow extends GridRow {
    name: string;
    value: number;
    category: string;
  }

  const data: SimpleRow[] = [
    { id: '1', name: 'Item A', value: 100, category: 'Type 1' },
    { id: '2', name: 'Item B', value: 200, category: 'Type 2' },
    { id: '3', name: 'Item C', value: 300, category: 'Type 1' },
  ];

  const columns: GridColumn<SimpleRow>[] = [
    { id: 'name', header: 'Name', accessor: 'name', editable: true },
    {
      id: 'value',
      header: 'Value',
      accessor: 'value',
      type: 'number',
      editable: true,
    },
    {
      id: 'category',
      header: 'Category',
      accessor: 'category',
      type: 'select',
      options: ['Type 1', 'Type 2', 'Type 3'],
      editable: true,
    },
  ];

  return (
    <div className="h-screen p-6">
      <ExcelModeGrid columns={columns} data={data} enableDragFill />
    </div>
  );
}
