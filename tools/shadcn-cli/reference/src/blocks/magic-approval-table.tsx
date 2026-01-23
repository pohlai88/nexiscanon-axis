'use client';

import {
  Avatar,
  AvatarFallback,
} from '@workspace/design-system/components/avatar';
import { Badge } from '@workspace/design-system/components/badge';
import { Button } from '@workspace/design-system/components/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@workspace/design-system/components/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/design-system/components/dropdown-menu';
import { Input } from '@workspace/design-system/components/input';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@workspace/design-system/components/resizable';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/design-system/components/table';
import { Textarea } from '@workspace/design-system/components/textarea';
import {
  Check,
  X,
  Clock,
  Paperclip,
  MessageSquare,
  ChevronRight,
  MoreHorizontal,
  FileText,
  Image as ImageIcon,
  File,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import * as React from 'react';

// ============================================================
// TYPES
// ============================================================

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'review';

export type ApprovalPriority = 'low' | 'normal' | 'high' | 'urgent';

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
};

export type Comment = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
};

export type MagicApprovalItem = {
  id: string;
  caseId: string;
  tenantId: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  requestedBy: string;
  requestedAt: Date;
  status: ApprovalStatus;
  priority: ApprovalPriority;
  dueDate?: Date;
  attachments?: Attachment[];
  comments?: Comment[];
  linkedTodoId?: string;
  category?: string;
  metadata?: Record<string, any>;
};

export type MagicApprovalColumn<T = any> = {
  id: string;
  accessorKey?: keyof T;
  header: string;
  width?: number;
  minWidth?: number;
  editable?: boolean;
  cell?: (row: T) => React.ReactNode;
  editCell?: (
    row: T,
    value: any,
    onChange: (value: any) => void,
  ) => React.ReactNode;
  format?: (value: any) => string;
};

export type MagicApprovalTableProps = {
  data: MagicApprovalItem[];
  columns?: MagicApprovalColumn<MagicApprovalItem>[];

  // Callbacks
  onApprove?: (
    item: MagicApprovalItem,
    comment?: string,
  ) => void | Promise<void>;
  onReject?: (item: MagicApprovalItem, reason: string) => void | Promise<void>;
  onEdit?: (itemId: string, field: string, value: any) => void | Promise<void>;
  onAttachmentAdd?: (itemId: string, file: File) => void | Promise<void>;
  onCommentAdd?: (itemId: string, comment: string) => void | Promise<void>;
  onLinkTodo?: (itemId: string, todoId: string) => void | Promise<void>;

  // Features
  showAttachments?: boolean;
  showComments?: boolean;
  showQuickApproval?: boolean;
  allowInlineEdit?: boolean;
  groupByTenant?: boolean;

  // UI
  className?: string;
  compact?: boolean;
};

// ============================================================
// DEFAULT COLUMNS
// ============================================================

const DEFAULT_COLUMNS: MagicApprovalColumn<MagicApprovalItem>[] = [
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    width: 120,
    minWidth: 100,
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: 'Priority',
    width: 100,
    minWidth: 80,
  },
  {
    id: 'caseId',
    accessorKey: 'caseId',
    header: 'Case ID',
    width: 120,
    minWidth: 100,
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Title',
    width: 300,
    minWidth: 200,
    editable: true,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: 'Amount',
    width: 120,
    minWidth: 100,
    editable: true,
  },
  {
    id: 'requestedBy',
    accessorKey: 'requestedBy',
    header: 'Requested By',
    width: 150,
    minWidth: 120,
  },
  {
    id: 'dueDate',
    accessorKey: 'dueDate',
    header: 'Due Date',
    width: 120,
    minWidth: 100,
  },
  {
    id: 'attachments',
    header: 'Attachments',
    width: 100,
    minWidth: 80,
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function MagicApprovalTable({
  data,
  columns = DEFAULT_COLUMNS,
  onApprove,
  onReject,
  onEdit,
  onAttachmentAdd,
  onCommentAdd,
  onLinkTodo,
  showAttachments = true,
  showComments = true,
  showQuickApproval = true,
  allowInlineEdit = true,
  groupByTenant = false,
  className,
  compact = false,
}: MagicApprovalTableProps) {
  const [columnWidths, setColumnWidths] = React.useState<
    Record<string, number>
  >(Object.fromEntries(columns.map((col) => [col.id, col.width || 150])));
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    colId: string;
  } | null>(null);
  const [selectedItem, setSelectedItem] =
    React.useState<MagicApprovalItem | null>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleCellEdit = async (rowId: string, colId: string, value: any) => {
    setEditingCell(null);
    await onEdit?.(rowId, colId, value);
  };

  const handleQuickApprove = async (item: MagicApprovalItem) => {
    await onApprove?.(item);
  };

  const handleQuickReject = async (item: MagicApprovalItem) => {
    const reason = prompt('Rejection reason:');
    if (reason) {
      await onReject?.(item, reason);
    }
  };

  const handleViewDetails = (item: MagicApprovalItem) => {
    setSelectedItem(item);
    setDetailsOpen(true);
  };

  // Group by tenant if enabled
  const groupedData = React.useMemo(() => {
    if (!groupByTenant) return { all: data };

    return data.reduce(
      (acc, item) => {
        if (!acc[item.tenantId]) acc[item.tenantId] = [];
        acc[item.tenantId]!.push(item);
        return acc;
      },
      {} as Record<string, MagicApprovalItem[]>,
    );
  }, [data, groupByTenant]);

  return (
    <>
      <div className={`space-y-4 ${className || ''}`}>
        {Object.entries(groupedData).map(([tenantId, items]) => (
          <div key={tenantId} className="space-y-2">
            {groupByTenant && (
              <div className="flex items-center gap-2 px-2">
                <h3 className="text-muted-foreground text-sm font-semibold">
                  Tenant: {tenantId}
                </h3>
                <Badge variant="secondary">{items.length} items</Badge>
              </div>
            )}

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead
                        key={col.id}
                        style={{
                          width: columnWidths[col.id],
                          minWidth: col.minWidth,
                        }}
                      >
                        {col.header}
                      </TableHead>
                    ))}
                    {showQuickApproval && (
                      <TableHead className="w-[140px]">Quick Actions</TableHead>
                    )}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow
                      key={item.id}
                      className={`${compact ? 'h-10' : ''} ${
                        item.status === 'approved'
                          ? 'bg-green-50/50'
                          : item.status === 'rejected'
                            ? 'bg-red-50/50'
                            : ''
                      }`}
                    >
                      {columns.map((col) => (
                        <TableCell key={col.id}>
                          <CellRenderer
                            item={item}
                            column={col}
                            isEditing={
                              editingCell?.rowId === item.id &&
                              editingCell?.colId === col.id
                            }
                            onEdit={(value) =>
                              handleCellEdit(item.id, col.id, value)
                            }
                            onStartEdit={() =>
                              allowInlineEdit &&
                              col.editable &&
                              setEditingCell({ rowId: item.id, colId: col.id })
                            }
                          />
                        </TableCell>
                      ))}

                      {showQuickApproval && (
                        <TableCell>
                          {item.status === 'pending' && (
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                onClick={() => handleQuickApprove(item)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleQuickReject(item)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      )}

                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(item)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>

      {/* Details Drawer */}
      {selectedItem && (
        <ApprovalDetailsDrawer
          item={selectedItem}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          onApprove={onApprove}
          onReject={onReject}
          onAttachmentAdd={onAttachmentAdd}
          onCommentAdd={onCommentAdd}
          onLinkTodo={onLinkTodo}
          showAttachments={showAttachments}
          showComments={showComments}
        />
      )}
    </>
  );
}

// ============================================================
// CELL RENDERER
// ============================================================

type CellRendererProps = {
  item: MagicApprovalItem;
  column: MagicApprovalColumn<MagicApprovalItem>;
  isEditing: boolean;
  onEdit: (value: any) => void;
  onStartEdit: () => void;
};

function CellRenderer({
  item,
  column,
  isEditing,
  onEdit,
  onStartEdit,
}: CellRendererProps) {
  const [editValue, setEditValue] = React.useState<any>('');

  React.useEffect(() => {
    if (isEditing && column.accessorKey) {
      setEditValue(item[column.accessorKey] || '');
    }
  }, [isEditing, item, column.accessorKey]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEdit(editValue);
    } else if (e.key === 'Escape') {
      onEdit(column.accessorKey ? item[column.accessorKey] : '');
    }
  };

  // Custom column renderers
  if (column.id === 'status') {
    return <StatusBadge status={item.status} />;
  }

  if (column.id === 'priority') {
    return <PriorityBadge priority={item.priority} />;
  }

  if (column.id === 'amount' && item.amount) {
    if (isEditing) {
      return (
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onEdit(editValue)}
          onKeyDown={handleKeyDown}
          className="h-8"
          autoFocus
        />
      );
    }
    return (
      <div
        className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1 font-medium"
        onDoubleClick={onStartEdit}
      >
        {item.currency || '$'}
        {item.amount.toLocaleString()}
      </div>
    );
  }

  if (column.id === 'requestedBy') {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-xs">
            {item.requestedBy.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm">{item.requestedBy}</span>
      </div>
    );
  }

  if (column.id === 'dueDate' && item.dueDate) {
    const isOverdue = new Date(item.dueDate) < new Date();
    return (
      <div
        className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}
      >
        <Clock className="h-3 w-3" />
        <span className="text-sm">
          {new Date(item.dueDate).toLocaleDateString()}
        </span>
      </div>
    );
  }

  if (column.id === 'attachments') {
    return (
      <div className="flex items-center gap-1">
        <Paperclip className="text-muted-foreground h-4 w-4" />
        <span className="text-sm">{item.attachments?.length || 0}</span>
      </div>
    );
  }

  if (column.id === 'title') {
    if (isEditing) {
      return (
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => onEdit(editValue)}
          onKeyDown={handleKeyDown}
          className="h-8"
          autoFocus
        />
      );
    }
    return (
      <div
        className="hover:bg-muted/50 cursor-pointer rounded px-2 py-1"
        onDoubleClick={onStartEdit}
      >
        {item.title}
      </div>
    );
  }

  // Default renderer
  if (column.cell) {
    return <>{column.cell(item)}</>;
  }

  const value = column.accessorKey ? item[column.accessorKey] : null;
  const formatted = column.format && value ? column.format(value) : value;

  if (isEditing && column.editable) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => onEdit(editValue)}
        onKeyDown={handleKeyDown}
        className="h-8"
        autoFocus
      />
    );
  }

  return (
    <div
      className={`${column.editable ? 'hover:bg-muted/50 cursor-pointer rounded px-2 py-1' : ''}`}
      onDoubleClick={column.editable ? onStartEdit : undefined}
    >
      {formatted as React.ReactNode}
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const config = {
    pending: { icon: Clock, variant: 'secondary' as const, label: 'Pending' },
    approved: {
      icon: CheckCircle2,
      variant: 'default' as const,
      label: 'Approved',
    },
    rejected: {
      icon: XCircle,
      variant: 'destructive' as const,
      label: 'Rejected',
    },
    review: {
      icon: AlertCircle,
      variant: 'secondary' as const,
      label: 'Review',
    },
  };

  const { icon: Icon, variant, label } = config[status];

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// ============================================================
// PRIORITY BADGE
// ============================================================

function PriorityBadge({ priority }: { priority: ApprovalPriority }) {
  const config = {
    low: { className: 'bg-gray-100 text-gray-800', label: 'Low' },
    normal: { className: 'bg-blue-100 text-blue-800', label: 'Normal' },
    high: { className: 'bg-orange-100 text-orange-800', label: 'High' },
    urgent: { className: 'bg-red-100 text-red-800', label: 'Urgent' },
  };

  const { className, label } = config[priority];

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

// ============================================================
// APPROVAL DETAILS DRAWER
// ============================================================

type ApprovalDetailsDrawerProps = {
  item: MagicApprovalItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove?: (
    item: MagicApprovalItem,
    comment?: string,
  ) => void | Promise<void>;
  onReject?: (item: MagicApprovalItem, reason: string) => void | Promise<void>;
  onAttachmentAdd?: (itemId: string, file: File) => void | Promise<void>;
  onCommentAdd?: (itemId: string, comment: string) => void | Promise<void>;
  onLinkTodo?: (itemId: string, todoId: string) => void | Promise<void>;
  showAttachments?: boolean;
  showComments?: boolean;
};

function ApprovalDetailsDrawer({
  item,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onAttachmentAdd,
  onCommentAdd,
  onLinkTodo,
  showAttachments,
  showComments,
}: ApprovalDetailsDrawerProps) {
  const [comment, setComment] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [newComment, setNewComment] = React.useState('');
  const [linkedTodoId, setLinkedTodoId] = React.useState(
    item.linkedTodoId || '',
  );

  const handleApprove = async () => {
    await onApprove?.(item, comment || undefined);
    onOpenChange(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    await onReject?.(item, rejectionReason);
    onOpenChange(false);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      await onCommentAdd?.(item.id, newComment);
      setNewComment('');
    }
  };

  const handleLinkTodo = async () => {
    if (linkedTodoId.trim()) {
      await onLinkTodo?.(item.id, linkedTodoId);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onAttachmentAdd?.(item.id, file);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-2xl">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <StatusBadge status={item.status} />
            {item.title}
          </DrawerTitle>
          <DrawerDescription>
            Case ID: {item.caseId} | Tenant: {item.tenantId}
          </DrawerDescription>
        </DrawerHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
          {/* Details Section */}
          <div className="space-y-3">
            <h3 className="font-semibold">Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Requested By:</span>
                <div className="mt-1 flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {item.requestedBy.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{item.requestedBy}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <div className="mt-1">
                  <PriorityBadge priority={item.priority} />
                </div>
              </div>
              {item.amount && (
                <div>
                  <span className="text-muted-foreground">Amount:</span>
                  <div className="mt-1 font-semibold">
                    {item.currency || '$'}
                    {item.amount.toLocaleString()}
                  </div>
                </div>
              )}
              {item.dueDate && (
                <div>
                  <span className="text-muted-foreground">Due Date:</span>
                  <div className="mt-1">
                    {new Date(item.dueDate).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
            {item.description && (
              <div>
                <span className="text-muted-foreground text-sm">
                  Description:
                </span>
                <p className="mt-1 text-sm">{item.description}</p>
              </div>
            )}
          </div>

          {/* Link to Todo */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Link to Task</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Enter Todo ID"
                value={linkedTodoId}
                onChange={(e) => setLinkedTodoId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleLinkTodo} variant="outline" size="sm">
                Link
              </Button>
            </div>
            {item.linkedTodoId && (
              <Badge variant="secondary" className="gap-1">
                <FileText className="h-3 w-3" />
                Linked to: {item.linkedTodoId}
              </Badge>
            )}
          </div>

          {/* Attachments */}
          {showAttachments && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Attachments</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="mr-2 h-4 w-4" />
                  Add
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              {item.attachments && item.attachments.length > 0 ? (
                <div className="space-y-2">
                  {item.attachments.map((att) => (
                    <AttachmentCard key={att.id} attachment={att} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No attachments</p>
              )}
            </div>
          )}

          {/* Comments */}
          {showComments && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Comments</h3>
              {item.comments && item.comments.length > 0 && (
                <div className="max-h-40 space-y-2 overflow-y-auto">
                  {item.comments.map((c) => (
                    <CommentCard key={c.id} comment={c} />
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px]"
                />
                <Button onClick={handleAddComment} size="sm">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Approval Actions */}
          {item.status === 'pending' && (
            <div className="space-y-3 border-t pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Approval Comment (Optional)
                </label>
                <Textarea
                  placeholder="Add approval note..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rejection Reason (Required)
                </label>
                <Textarea
                  placeholder="Explain why you're rejecting..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          )}
        </div>

        <DrawerFooter>
          {item.status === 'pending' ? (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
                disabled={!rejectionReason.trim()}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          ) : (
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

// ============================================================
// ATTACHMENT CARD
// ============================================================

function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const getIcon = () => {
    switch (attachment.type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-2">
      <div className="flex items-center gap-2">
        {getIcon()}
        <div>
          <div className="text-sm font-medium">{attachment.name}</div>
          <div className="text-muted-foreground text-xs">
            {(attachment.size / 1024).toFixed(1)} KB • {attachment.uploadedBy}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// COMMENT CARD
// ============================================================

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="bg-muted/30 rounded-lg border p-3">
      <div className="mb-1 flex items-center gap-2">
        <Avatar className="h-5 w-5">
          <AvatarFallback className="text-xs">
            {comment.userName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm font-medium">{comment.userName}</span>
        <span className="text-muted-foreground text-xs">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
      <p className="text-sm">{comment.text}</p>
    </div>
  );
}
