/**
 * MagicApprovalTable Examples
 * CEO approval table with inline editing, attachments, and todo linking
 */

import * as React from 'react';

import { Badge } from '@workspace/design-system/components/badge';
import {
  MagicApprovalTable,
  type MagicApprovalItem,
  type Attachment,
  type Comment,
} from '../magic-approval-table';

// ============================================================
// EXAMPLE 1: CEO Approval Dashboard
// ============================================================

const ceoApprovals: MagicApprovalItem[] = [
  {
    id: 'APR-001',
    caseId: 'BUDGET-2024-Q1',
    tenantId: 'marketing',
    title: 'Q1 Marketing Budget Approval',
    description:
      'Digital advertising, events, and content marketing budget for Q1 2024',
    amount: 150000,
    currency: '$',
    requestedBy: 'john.smith@company.com',
    requestedAt: new Date('2024-01-15T10:00:00'),
    status: 'pending',
    priority: 'high',
    dueDate: new Date('2024-01-20'),
    attachments: [
      {
        id: 'att-1',
        name: 'Q1-Marketing-Budget-Proposal.pdf',
        url: '/files/budget-q1.pdf',
        type: 'pdf',
        size: 456000,
        uploadedBy: 'john.smith@company.com',
        uploadedAt: new Date('2024-01-15T10:00:00'),
      },
      {
        id: 'att-2',
        name: 'ROI-Analysis.xlsx',
        url: '/files/roi-analysis.xlsx',
        type: 'document',
        size: 89000,
        uploadedBy: 'john.smith@company.com',
        uploadedAt: new Date('2024-01-15T10:05:00'),
      },
    ],
    comments: [
      {
        id: 'c-1',
        userId: 'u-1',
        userName: 'Sarah CFO',
        text: 'Numbers look good. Can we shift 10% from digital to events?',
        createdAt: new Date('2024-01-16T14:30:00'),
      },
      {
        id: 'c-2',
        userId: 'u-2',
        userName: 'John Marketing',
        text: 'Updated proposal reflects 60% digital, 40% events. See revised attachment.',
        createdAt: new Date('2024-01-16T16:00:00'),
      },
    ],
    linkedTodoId: 'TODO-BUDGET-Q1-001',
    category: 'Budget',
  },
  {
    id: 'APR-002',
    caseId: 'PO-2024-0245',
    tenantId: 'operations',
    title: 'Raw Materials Purchase Order',
    description: 'Steel sheets and aluminum rods for Q1 production run',
    amount: 85000,
    currency: '$',
    requestedBy: 'procurement@company.com',
    requestedAt: new Date('2024-01-16T09:00:00'),
    status: 'pending',
    priority: 'urgent',
    dueDate: new Date('2024-01-18'),
    attachments: [
      {
        id: 'att-3',
        name: 'PO-2024-0245.pdf',
        url: '/files/po-0245.pdf',
        type: 'pdf',
        size: 234000,
        uploadedBy: 'procurement@company.com',
        uploadedAt: new Date('2024-01-16T09:00:00'),
      },
    ],
    category: 'Purchase Order',
    metadata: {
      vendor: 'Global Steel Co',
      deliveryDate: '2024-02-01',
    },
  },
  {
    id: 'APR-003',
    caseId: 'EXP-2024-0189',
    tenantId: 'sales',
    title: 'Client Entertainment - Acme Corp Deal',
    description: 'Dinner with Acme Corp executives to close $500k deal',
    amount: 850,
    currency: '$',
    requestedBy: 'sarah.sales@company.com',
    requestedAt: new Date('2024-01-17T11:00:00'),
    status: 'pending',
    priority: 'normal',
    dueDate: new Date('2024-01-22'),
    attachments: [
      {
        id: 'att-4',
        name: 'dinner-receipt.jpg',
        url: '/files/receipt-0189.jpg',
        type: 'image',
        size: 156000,
        uploadedBy: 'sarah.sales@company.com',
        uploadedAt: new Date('2024-01-17T11:00:00'),
      },
    ],
    comments: [
      {
        id: 'c-3',
        userId: 'u-3',
        userName: 'Sarah Sales',
        text: 'This dinner sealed a $500k annual contract. Great ROI!',
        createdAt: new Date('2024-01-17T11:05:00'),
      },
    ],
    category: 'Expense',
    linkedTodoId: 'TODO-ACME-FOLLOWUP',
  },
  {
    id: 'APR-004',
    caseId: 'CTR-2024-SaaS-003',
    tenantId: 'it',
    title: 'Enterprise Software License Renewal',
    description: 'Annual renewal for CRM platform with 200 user licenses',
    amount: 120000,
    currency: '$',
    requestedBy: 'it@company.com',
    requestedAt: new Date('2024-01-14T15:00:00'),
    status: 'review',
    priority: 'high',
    dueDate: new Date('2024-01-25'),
    attachments: [
      {
        id: 'att-5',
        name: 'contract-renewal-v2.pdf',
        url: '/files/contract-v2.pdf',
        type: 'pdf',
        size: 678000,
        uploadedBy: 'it@company.com',
        uploadedAt: new Date('2024-01-14T15:00:00'),
      },
    ],
    category: 'Contract',
    metadata: {
      vendor: 'CloudSoft Inc',
      term: '12 months',
      renewalDate: '2025-01-25',
      previousAmount: 110000,
    },
  },
  {
    id: 'APR-005',
    caseId: 'HR-2024-HIRE-012',
    tenantId: 'hr',
    title: 'Senior Developer Hire - Compensation Package',
    description: 'Salary and benefits approval for senior backend developer',
    amount: 165000,
    currency: '$',
    requestedBy: 'hr@company.com',
    requestedAt: new Date('2024-01-18T10:00:00'),
    status: 'pending',
    priority: 'high',
    dueDate: new Date('2024-01-21'),
    attachments: [
      {
        id: 'att-6',
        name: 'candidate-profile.pdf',
        url: '/files/candidate-012.pdf',
        type: 'pdf',
        size: 345000,
        uploadedBy: 'hr@company.com',
        uploadedAt: new Date('2024-01-18T10:00:00'),
      },
    ],
    comments: [
      {
        id: 'c-4',
        userId: 'u-4',
        userName: 'HR Manager',
        text: 'Candidate has 8 years experience in our tech stack. Strong cultural fit.',
        createdAt: new Date('2024-01-18T10:05:00'),
      },
    ],
    category: 'HR',
    linkedTodoId: 'TODO-HIRE-ONBOARD-012',
  },
];

export function CEOApprovalDashboard() {
  const [approvals, setApprovals] = React.useState(ceoApprovals);

  const handleApprove = async (item: MagicApprovalItem, comment?: string) => {
    console.log(`✅ Approved: ${item.caseId}`, comment);

    // Update local state
    setApprovals((prev) =>
      prev.map((a) =>
        a.id === item.id ? { ...a, status: 'approved' as const } : a,
      ),
    );

    // API call
    await fetch(`/api/approvals/${item.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        comment,
        approvedBy: 'CEO',
        approvedAt: new Date(),
      }),
    });

    // Update linked todo
    if (item.linkedTodoId) {
      await fetch(`/api/todos/${item.linkedTodoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
    }
  };

  const handleReject = async (item: MagicApprovalItem, reason: string) => {
    console.log(`❌ Rejected: ${item.caseId} - Reason: ${reason}`);

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === item.id ? { ...a, status: 'rejected' as const } : a,
      ),
    );

    await fetch(`/api/approvals/${item.id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason,
        rejectedBy: 'CEO',
        rejectedAt: new Date(),
      }),
    });
  };

  const handleEdit = async (itemId: string, field: string, value: any) => {
    console.log(`✏️ Edited: ${itemId}.${field} = ${value}`);

    setApprovals((prev) =>
      prev.map((a) => (a.id === itemId ? { ...a, [field]: value } : a)),
    );

    await fetch(`/api/approvals/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
  };

  const handleLinkTodo = async (itemId: string, todoId: string) => {
    console.log(`🔗 Linked: ${itemId} -> ${todoId}`);

    const item = approvals.find((a) => a.id === itemId);
    if (!item) return;

    setApprovals((prev) =>
      prev.map((a) => (a.id === itemId ? { ...a, linkedTodoId: todoId } : a)),
    );

    await fetch(`/api/approvals/${itemId}/link-todo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todoId,
        tenantId: item.tenantId,
        caseId: item.caseId,
      }),
    });
  };

  const handleCommentAdd = async (itemId: string, commentText: string) => {
    console.log(`💬 Comment on ${itemId}: ${commentText}`);

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      userId: 'ceo-user',
      userName: 'CEO',
      text: commentText,
      createdAt: new Date(),
    };

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === itemId
          ? { ...a, comments: [...(a.comments || []), newComment] }
          : a,
      ),
    );

    await fetch(`/api/approvals/${itemId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: commentText,
        userId: 'ceo-user',
        userName: 'CEO',
      }),
    });
  };

  const handleAttachmentAdd = async (itemId: string, file: File) => {
    console.log(`📎 Upload to ${itemId}: ${file.name}`);

    // Upload file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('itemId', itemId);

    const response = await fetch(`/api/approvals/${itemId}/attachments`, {
      method: 'POST',
      body: formData,
    });

    const attachment: Attachment = await response.json();

    setApprovals((prev) =>
      prev.map((a) =>
        a.id === itemId
          ? { ...a, attachments: [...(a.attachments || []), attachment] }
          : a,
      ),
    );
  };

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CEO Approval Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {pendingCount} item{pendingCount !== 1 ? 's' : ''} awaiting your
            decision
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{pendingCount} Pending</Badge>
          <Badge variant="default">
            {approvals.filter((a) => a.status === 'approved').length} Approved
          </Badge>
          <Badge variant="destructive">
            {approvals.filter((a) => a.status === 'rejected').length} Rejected
          </Badge>
        </div>
      </div>

      <MagicApprovalTable
        data={approvals}
        groupByTenant
        showQuickApproval
        allowInlineEdit
        showAttachments
        showComments
        onApprove={handleApprove}
        onReject={handleReject}
        onEdit={handleEdit}
        onLinkTodo={handleLinkTodo}
        onCommentAdd={handleCommentAdd}
        onAttachmentAdd={handleAttachmentAdd}
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 2: Compact Purchase Order Approvals
// ============================================================

export function CompactPOApprovals() {
  const poApprovals = ceoApprovals.filter(
    (a) => a.category === 'Purchase Order',
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Purchase Order Approvals</h2>

      <MagicApprovalTable
        data={poApprovals}
        compact
        showQuickApproval
        allowInlineEdit
        onApprove={(item) => console.log('Approved:', item.caseId)}
        onReject={(item, reason) =>
          console.log('Rejected:', item.caseId, reason)
        }
      />
    </div>
  );
}

// ============================================================
// EXAMPLE 3: Expense Report Approvals (No Inline Edit)
// ============================================================

export function ExpenseApprovals() {
  const expenses = ceoApprovals.filter((a) => a.category === 'Expense');

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Expense Report Approvals</h2>

      <MagicApprovalTable
        data={expenses}
        showQuickApproval
        allowInlineEdit={false} // Expenses shouldn't be edited
        showAttachments
        showComments
        onApprove={(item, comment) => {
          console.log(`Expense ${item.caseId} approved`, comment);
        }}
        onReject={(item, reason) => {
          console.log(`Expense ${item.caseId} rejected:`, reason);
        }}
      />
    </div>
  );
}

// ============================================================
// EXPORT ALL EXAMPLES
// ============================================================

export const MagicApprovalTableExamples = {
  CEODashboard: CEOApprovalDashboard,
  CompactPO: CompactPOApprovals,
  ExpenseReports: ExpenseApprovals,
};
