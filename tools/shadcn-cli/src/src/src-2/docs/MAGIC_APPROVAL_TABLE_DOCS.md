# MagicApprovalTable - CEO Approval Table

**Lightweight approval table** with inline editing, attachments, and task linking - perfect for executive workflows.

## 🎯 Features

### Core Capabilities

- ✅ **Quick Approval Actions** - One-click approve/reject from table
- ✅ **Inline Editing** - Double-click to edit title, amount, etc.
- ✅ **Resizable Columns** - Drag to resize
- ✅ **Attachments** - Upload & view files
- ✅ **Comments** - Discussion threads
- ✅ **Task Linking** - Link to todo items by Tenant ID + Case ID
- ✅ **Status Tracking** - Pending, Approved, Rejected, Review
- ✅ **Priority Levels** - Low, Normal, High, Urgent
- ✅ **Group by Tenant** - Multi-tenant support

### CEO-Friendly UX

- 🔥 **Quick Actions** - Approve/Reject without opening details
- 🔥 **Right Drawer** - Full details on demand
- 🔥 **Visual Status** - Color-coded rows (green=approved, red=rejected)
- 🔥 **Due Date Alerts** - Overdue items in red
- 🔥 **Compact Mode** - More rows on screen
- 🔥 **Magic Todo Link** - Connect approvals to tasks

## 📦 Installation

Already includes required Shadcn components from DataFortress setup.

## 🎯 Basic Usage

```tsx
import {
  MagicApprovalTable,
  MagicApprovalItem,
} from '@workspace/shared-ui/blocks';

const approvalItems: MagicApprovalItem[] = [
  {
    id: 'APR-001',
    caseId: 'CASE-12345',
    tenantId: 'acme-corp',
    title: 'Annual Marketing Budget',
    description: 'Q1 2024 marketing spend approval',
    amount: 150000,
    currency: '$',
    requestedBy: 'john@acme.com',
    requestedAt: new Date('2024-01-15'),
    status: 'pending',
    priority: 'high',
    dueDate: new Date('2024-01-20'),
    attachments: [
      {
        id: 'att-1',
        name: 'budget-proposal.pdf',
        url: '/files/budget-proposal.pdf',
        type: 'pdf',
        size: 245000,
        uploadedBy: 'john@acme.com',
        uploadedAt: new Date(),
      },
    ],
    comments: [
      {
        id: 'c-1',
        userId: 'user-1',
        userName: 'Sarah CFO',
        text: 'Looks good, but can we reduce digital ad spend by 10%?',
        createdAt: new Date('2024-01-16'),
      },
    ],
    linkedTodoId: 'TODO-789', // Links to task
  },
];

export function CEOApprovalDashboard() {
  const handleApprove = async (item: MagicApprovalItem, comment?: string) => {
    console.log('Approved:', item.id, comment);
    // API call to approve
  };

  const handleReject = async (item: MagicApprovalItem, reason: string) => {
    console.log('Rejected:', item.id, reason);
    // API call to reject
  };

  const handleEdit = async (itemId: string, field: string, value: any) => {
    console.log('Edited:', itemId, field, value);
    // API call to update field
  };

  return (
    <MagicApprovalTable
      data={approvalItems}
      onApprove={handleApprove}
      onReject={handleReject}
      onEdit={handleEdit}
      showQuickApproval
      allowInlineEdit
    />
  );
}
```

## 🎨 Advanced Examples

### Example 1: Multi-Tenant CEO Dashboard

```tsx
import { MagicApprovalTable } from '@workspace/shared-ui/blocks';

export function MultiTenantCEOApprovals() {
  const [approvals, setApprovals] = React.useState<MagicApprovalItem[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pending Approvals</h2>
        <p className="text-muted-foreground">
          {approvals.filter((a) => a.status === 'pending').length} items
          awaiting your decision
        </p>
      </div>

      <MagicApprovalTable
        data={approvals}
        groupByTenant
        showQuickApproval
        allowInlineEdit
        onApprove={async (item, comment) => {
          await fetch(`/api/approvals/${item.id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ comment }),
          });
          // Refresh data
        }}
        onReject={async (item, reason) => {
          await fetch(`/api/approvals/${item.id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
          });
          // Refresh data
        }}
        onEdit={async (itemId, field, value) => {
          await fetch(`/api/approvals/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ [field]: value }),
          });
        }}
        onLinkTodo={async (itemId, todoId) => {
          await fetch(`/api/approvals/${itemId}/link-todo`, {
            method: 'POST',
            body: JSON.stringify({ todoId }),
          });
        }}
      />
    </div>
  );
}
```

### Example 2: Purchase Order Approvals

```tsx
import {
  MagicApprovalTable,
  MagicApprovalItem,
} from '@workspace/shared-ui/blocks';

export function POApprovalTable() {
  const poApprovals: MagicApprovalItem[] = [
    {
      id: 'PO-001',
      caseId: 'PO-2024-001',
      tenantId: 'manufacturing',
      title: 'Raw Materials - Q1 Stock',
      description: 'Steel sheets and aluminum rods for production',
      amount: 85000,
      currency: '$',
      requestedBy: 'procurement@company.com',
      requestedAt: new Date('2024-01-10'),
      status: 'pending',
      priority: 'urgent',
      dueDate: new Date('2024-01-15'),
      category: 'Purchase Order',
      attachments: [
        {
          id: 'att-po-1',
          name: 'PO-2024-001.pdf',
          url: '/files/po-001.pdf',
          type: 'pdf',
          size: 156000,
          uploadedBy: 'procurement@company.com',
          uploadedAt: new Date(),
        },
        {
          id: 'att-po-2',
          name: 'vendor-quote.xlsx',
          url: '/files/quote.xlsx',
          type: 'document',
          size: 45000,
          uploadedBy: 'procurement@company.com',
          uploadedAt: new Date(),
        },
      ],
      linkedTodoId: 'TODO-PO-001',
    },
    {
      id: 'PO-002',
      caseId: 'PO-2024-002',
      tenantId: 'manufacturing',
      title: 'Office Supplies Bulk Order',
      amount: 2500,
      currency: '$',
      requestedBy: 'admin@company.com',
      requestedAt: new Date('2024-01-12'),
      status: 'pending',
      priority: 'low',
      dueDate: new Date('2024-01-25'),
      category: 'Purchase Order',
    },
  ];

  return (
    <MagicApprovalTable
      data={poApprovals}
      showQuickApproval
      allowInlineEdit
      showAttachments
      showComments
      onApprove={(item, comment) => {
        console.log(`PO ${item.caseId} approved`, comment);
      }}
      onReject={(item, reason) => {
        console.log(`PO ${item.caseId} rejected:`, reason);
      }}
      onAttachmentAdd={(itemId, file) => {
        console.log(`Upload to ${itemId}:`, file.name);
      }}
    />
  );
}
```

### Example 3: Expense Report Approvals

```tsx
import {
  MagicApprovalTable,
  MagicApprovalItem,
} from '@workspace/shared-ui/blocks';

export function ExpenseApprovalTable() {
  const expenses: MagicApprovalItem[] = [
    {
      id: 'EXP-001',
      caseId: 'EXP-2024-0015',
      tenantId: 'sales-team',
      title: 'Client Dinner - Acme Corp Deal',
      description: 'Business dinner with Acme Corp executives',
      amount: 450,
      currency: '$',
      requestedBy: 'sarah@company.com',
      requestedAt: new Date('2024-01-14'),
      status: 'pending',
      priority: 'normal',
      dueDate: new Date('2024-01-18'),
      category: 'Expense Report',
      attachments: [
        {
          id: 'att-exp-1',
          name: 'receipt.jpg',
          url: '/files/receipt-001.jpg',
          type: 'image',
          size: 125000,
          uploadedBy: 'sarah@company.com',
          uploadedAt: new Date(),
        },
      ],
      comments: [
        {
          id: 'c-exp-1',
          userId: 'u-1',
          userName: 'Sarah Sales',
          text: 'This dinner led to closing a $500k deal. Worth every penny!',
          createdAt: new Date('2024-01-15'),
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Expense Approvals</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {expenses.filter((e) => e.status === 'pending').length} pending
          </Badge>
        </div>
      </div>

      <MagicApprovalTable
        data={expenses}
        showQuickApproval
        allowInlineEdit
        compact
        onApprove={async (item, comment) => {
          await fetch(`/api/expenses/${item.id}/approve`, {
            method: 'POST',
            body: JSON.stringify({ comment }),
          });
        }}
        onReject={async (item, reason) => {
          await fetch(`/api/expenses/${item.id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason }),
          });
        }}
      />
    </div>
  );
}
```

### Example 4: Contract Approvals with Todo Linking

```tsx
import {
  MagicApprovalTable,
  MagicApprovalItem,
} from '@workspace/shared-ui/blocks';

export function ContractApprovalTable() {
  const contracts: MagicApprovalItem[] = [
    {
      id: 'CTR-001',
      caseId: 'CTR-2024-SaaS-001',
      tenantId: 'legal',
      title: 'Software License Agreement - Enterprise Plan',
      description: 'Annual SaaS subscription with enhanced support',
      amount: 120000,
      currency: '$',
      requestedBy: 'legal@company.com',
      requestedAt: new Date('2024-01-10'),
      status: 'pending',
      priority: 'high',
      dueDate: new Date('2024-01-17'),
      category: 'Contract',
      attachments: [
        {
          id: 'att-ctr-1',
          name: 'contract-draft-v3.pdf',
          url: '/files/contract-v3.pdf',
          type: 'pdf',
          size: 890000,
          uploadedBy: 'legal@company.com',
          uploadedAt: new Date(),
        },
      ],
      linkedTodoId: 'TODO-CTR-REVIEW-001',
      metadata: {
        vendor: 'CloudSoft Inc',
        term: '12 months',
        renewalDate: '2025-01-17',
      },
    },
  ];

  const handleLinkTodo = async (itemId: string, todoId: string) => {
    console.log(`Linking ${itemId} to todo ${todoId}`);
    // Update backend
    await fetch(`/api/approvals/${itemId}/link-todo`, {
      method: 'POST',
      body: JSON.stringify({
        todoId,
        linkType: 'approval_required',
      }),
    });
  };

  return (
    <MagicApprovalTable
      data={contracts}
      showQuickApproval={false} // Contracts need detailed review
      allowInlineEdit={false} // Contracts shouldn't be edited inline
      showAttachments
      showComments
      onApprove={async (item, comment) => {
        await fetch(`/api/contracts/${item.id}/approve`, {
          method: 'POST',
          body: JSON.stringify({ comment, approvedBy: 'CEO' }),
        });
      }}
      onReject={async (item, reason) => {
        await fetch(`/api/contracts/${item.id}/reject`, {
          method: 'POST',
          body: JSON.stringify({ reason, rejectedBy: 'CEO' }),
        });
      }}
      onLinkTodo={handleLinkTodo}
      onCommentAdd={async (itemId, comment) => {
        await fetch(`/api/contracts/${itemId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ text: comment, userId: 'ceo@company.com' }),
        });
      }}
    />
  );
}
```

## 🎛️ Props Reference

### MagicApprovalTableProps

| Prop                | Type                             | Default           | Description                      |
| ------------------- | -------------------------------- | ----------------- | -------------------------------- |
| `data`              | `MagicApprovalItem[]`            | **Required**      | Array of approval items          |
| `columns`           | `MagicApprovalColumn[]`          | `DEFAULT_COLUMNS` | Custom column configuration      |
| `onApprove`         | `(item, comment?) => void`       | `undefined`       | Approve handler                  |
| `onReject`          | `(item, reason) => void`         | `undefined`       | Reject handler (reason required) |
| `onEdit`            | `(itemId, field, value) => void` | `undefined`       | Inline edit handler              |
| `onAttachmentAdd`   | `(itemId, file) => void`         | `undefined`       | File upload handler              |
| `onCommentAdd`      | `(itemId, comment) => void`      | `undefined`       | Comment handler                  |
| `onLinkTodo`        | `(itemId, todoId) => void`       | `undefined`       | Link to todo handler             |
| `showAttachments`   | `boolean`                        | `true`            | Show attachments in drawer       |
| `showComments`      | `boolean`                        | `true`            | Show comments in drawer          |
| `showQuickApproval` | `boolean`                        | `true`            | Quick approve/reject buttons     |
| `allowInlineEdit`   | `boolean`                        | `true`            | Double-click to edit cells       |
| `groupByTenant`     | `boolean`                        | `false`           | Group rows by tenant             |
| `compact`           | `boolean`                        | `false`           | Compact row height               |
| `className`         | `string`                         | `undefined`       | Additional CSS classes           |

### MagicApprovalItem

```typescript
type MagicApprovalItem = {
  id: string; // Unique ID
  caseId: string; // Case/reference ID
  tenantId: string; // Tenant identifier
  title: string; // Approval title
  description?: string; // Detailed description
  amount?: number; // Monetary amount
  currency?: string; // Currency symbol ($, €, etc.)
  requestedBy: string; // User who requested
  requestedAt: Date; // Request timestamp
  status: ApprovalStatus; // Current status
  priority: ApprovalPriority; // Priority level
  dueDate?: Date; // Due date
  attachments?: Attachment[]; // File attachments
  comments?: Comment[]; // Discussion threads
  linkedTodoId?: string; // Linked task ID
  category?: string; // Category tag
  metadata?: Record<string, any>; // Custom metadata
};

type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'review';
type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';
```

### Attachment

```typescript
type Attachment = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document' | 'other';
  size: number; // Bytes
  uploadedBy: string;
  uploadedAt: Date;
};
```

### Comment

```typescript
type Comment = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
};
```

## 🔗 Todo Integration

The MagicApprovalTable links to tasks via **Tenant ID + Case ID**:

```typescript
// Approval item
const approval = {
  id: 'APR-001',
  caseId: 'CASE-12345',
  tenantId: 'acme-corp',
  linkedTodoId: 'TODO-789', // Links to task
  // ...
};

// When linking a todo
const handleLinkTodo = async (itemId: string, todoId: string) => {
  // Backend creates bidirectional link
  await fetch(`/api/approvals/${itemId}/link-todo`, {
    method: 'POST',
    body: JSON.stringify({
      todoId,
      tenantId: approval.tenantId,
      caseId: approval.caseId,
    }),
  });
};

// Query todos by case
const todos = await fetch(`/api/todos?tenantId=${tenantId}&caseId=${caseId}`);
```

## 🎨 Styling & Customization

### Custom Columns

```tsx
import { MagicApprovalColumn } from '@workspace/shared-ui/blocks';

const customColumns: MagicApprovalColumn<MagicApprovalItem>[] = [
  {
    id: 'vendor',
    header: 'Vendor',
    width: 200,
    cell: (row) => row.metadata?.vendor || '-',
  },
  {
    id: 'contract_term',
    header: 'Term',
    width: 100,
    cell: (row) => row.metadata?.term || '-',
  },
  // ... default columns
];

<MagicApprovalTable data={data} columns={customColumns} />;
```

### Status Colors

- **Pending**: Gray badge, Clock icon
- **Approved**: Green background, CheckCircle icon
- **Rejected**: Red background, XCircle icon
- **Review**: Yellow badge, AlertCircle icon

### Priority Colors

- **Low**: Gray
- **Normal**: Blue
- **High**: Orange
- **Urgent**: Red

## 🚀 Best Practices

### 1. CEO Dashboard Setup

```tsx
// Dashboard with pending approvals only
const pendingApprovals = approvals.filter((a) => a.status === 'pending');

<MagicApprovalTable
  data={pendingApprovals}
  showQuickApproval
  compact
  groupByTenant
/>;
```

### 2. Approval Workflow

```tsx
// Multi-step approval with notifications
const handleApprove = async (item: MagicApprovalItem, comment?: string) => {
  // 1. Update status
  await updateApprovalStatus(item.id, 'approved');

  // 2. Notify requester
  await sendNotification(item.requestedBy, `Your request was approved by CEO`);

  // 3. Update linked todo
  if (item.linkedTodoId) {
    await updateTodoStatus(item.linkedTodoId, 'approved');
  }

  // 4. Log audit trail
  await logAudit(item.id, 'approved', { approver: 'CEO', comment });
};
```

### 3. Bulk Operations

```tsx
// Approve multiple items at once
const approveAll = async (items: MagicApprovalItem[]) => {
  await Promise.all(items.map((item) => handleApprove(item, 'Bulk approval')));
};
```

## 📊 Comparison

| Feature       | MagicApprovalTable | DataFortress    | Regular Table |
| ------------- | ------------------ | --------------- | ------------- |
| Quick Actions | ✅ Built-in        | ➕ Custom       | ❌            |
| Inline Edit   | ✅ Double-click    | ✅ Advanced     | ❌            |
| Attachments   | ✅ Built-in        | ➕ Custom       | ❌            |
| Comments      | ✅ Built-in        | ➕ Custom       | ❌            |
| Todo Linking  | ✅ Built-in        | ❌              | ❌            |
| Audit Trail   | ➕ Via comments    | ✅ Built-in     | ❌            |
| Use Case      | CEO Approvals      | Data Management | Basic Display |

## 🎉 Summary

**MagicApprovalTable** is perfect for:

- CEO approval workflows
- Purchase order approvals
- Expense report reviews
- Contract approvals
- Budget approvals
- Any approval workflow with attachments & comments

**Key Benefits:**

- ✅ Quick approve/reject (no need to open drawer)
- ✅ Inline editing (fix amounts/titles instantly)
- ✅ Attachments & comments (complete context)
- ✅ Todo linking (connect approvals to tasks)
- ✅ Multi-tenant support (group by tenant)
- ✅ Lightweight & fast (simpler than DataFortress)

**Total Components: 56** (including MagicApprovalTable!)
