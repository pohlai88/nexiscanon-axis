import { Metadata } from "next";
import { ApprovalQueue } from "@workspace/design-system/blocks";

export const metadata: Metadata = {
  title: "Approvals",
  description: "AFANDA Approval Queue - Pending approvals with SLA tracking",
};

/**
 * Approvals Page
 *
 * Displays the approval queue with SLA timers and bulk actions.
 *
 * @see AFANDA.md §5.1 AFANDA Blocks
 * @see B11-AFANDA.md §8 AFANDA Configuration
 */

// Sample approval data
const sampleApprovals = [
  {
    id: "1",
    title: "Purchase Order PO-2024-0847",
    description: "Office supplies from Staples Inc.",
    amount: "$12,500.00",
    requestedBy: {
      name: "John Smith",
      avatar: "",
      department: "Operations",
    },
    documentType: "Purchase Order" as const,
    priority: "high" as const,
    slaDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    approvalChain: [
      {
        name: "Jane Doe",
        role: "Department Manager",
        status: "approved" as const,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        name: "You",
        role: "Finance Director",
        status: "pending" as const,
      },
      {
        name: "CEO",
        role: "Final Approval",
        status: "pending" as const,
      },
    ],
  },
  {
    id: "2",
    title: "Purchase Order PO-2024-0851",
    description: "IT Equipment - Laptops for new hires",
    amount: "$8,200.00",
    requestedBy: {
      name: "Sarah Johnson",
      avatar: "",
      department: "IT",
    },
    documentType: "Purchase Order" as const,
    priority: "medium" as const,
    slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    approvalChain: [
      {
        name: "IT Manager",
        role: "Department Manager",
        status: "approved" as const,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        name: "You",
        role: "Finance Director",
        status: "pending" as const,
      },
    ],
  },
  {
    id: "3",
    title: "Invoice INV-2024-1234",
    description: "Consulting services - Q4 Strategy Review",
    amount: "$45,000.00",
    requestedBy: {
      name: "Michael Chen",
      avatar: "",
      department: "Strategy",
    },
    documentType: "Invoice" as const,
    priority: "high" as const,
    slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    approvalChain: [
      {
        name: "You",
        role: "Finance Director",
        status: "pending" as const,
      },
      {
        name: "CFO",
        role: "Final Approval",
        status: "pending" as const,
      },
    ],
  },
  {
    id: "4",
    title: "Expense Report EXP-2024-0456",
    description: "Travel expenses - Client meeting NYC",
    amount: "$2,340.00",
    requestedBy: {
      name: "Emily Davis",
      avatar: "",
      department: "Sales",
    },
    documentType: "Expense" as const,
    priority: "low" as const,
    slaDeadline: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72 hours from now
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    approvalChain: [
      {
        name: "Sales Manager",
        role: "Department Manager",
        status: "approved" as const,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
      {
        name: "You",
        role: "Finance Director",
        status: "pending" as const,
      },
    ],
  },
  {
    id: "5",
    title: "Credit Note CN-2024-0089",
    description: "Customer refund - Order #45678",
    amount: "$1,250.00",
    requestedBy: {
      name: "Robert Wilson",
      avatar: "",
      department: "Customer Service",
    },
    documentType: "Credit Note" as const,
    priority: "medium" as const,
    slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours OVERDUE
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    approvalChain: [
      {
        name: "CS Manager",
        role: "Department Manager",
        status: "approved" as const,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        name: "You",
        role: "Finance Director",
        status: "pending" as const,
      },
    ],
  },
];

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approvals</h1>
          <p className="text-muted-foreground">
            Review and approve pending requests with SLA tracking.
          </p>
        </div>
      </div>

      {/* Approval Queue */}
      <ApprovalQueue
        items={sampleApprovals}
        onApprove={(id, comment) => {
          console.log("Approved:", id, comment);
        }}
        onReject={(id, comment) => {
          console.log("Rejected:", id, comment);
        }}
        onBulkApprove={(ids) => {
          console.log("Bulk approved:", ids);
        }}
        onBulkReject={(ids) => {
          console.log("Bulk rejected:", ids);
        }}
      />
    </div>
  );
}
