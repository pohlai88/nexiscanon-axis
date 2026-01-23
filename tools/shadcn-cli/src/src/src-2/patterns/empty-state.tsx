/**
 * Empty State Pattern
 *
 * Reference implementation showing:
 * - Empty state display
 * - Call-to-action integration
 * - Icon usage
 * - Responsive layout
 *
 * Usage: Copy relevant patterns to your components
 */

import { Button, Card } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import {
  FileText,
  Users,
  FolderOpen,
  Search,
  PlusCircle,
  Inbox,
  LucideIcon,
} from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// Base Empty State Component
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <Card
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        'transition-all duration-300',
        className,
      )}
    >
      <div className="bg-muted mb-4 inline-flex rounded-full p-4">
        <Icon className="text-muted-foreground h-12 w-12" />
      </div>

      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>

      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button onClick={action.onClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

// Specific Empty State Variants

export function NoDocumentsEmpty({
  onCreateClick,
}: {
  onCreateClick: () => void;
}) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents yet"
      description="Get started by creating your first document. You can add content, collaborate with your team, and organize your work."
      action={{
        label: 'Create Document',
        onClick: onCreateClick,
      }}
      secondaryAction={{
        label: 'View Templates',
        onClick: () => console.log('View templates'),
      }}
    />
  );
}

export function NoUsersEmpty({ onInviteClick }: { onInviteClick: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No team members"
      description="Start building your team by inviting members. Collaborate on projects and manage permissions easily."
      action={{
        label: 'Invite Team Member',
        onClick: onInviteClick,
      }}
    />
  );
}

export function NoResultsEmpty({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find any items matching your search. Try adjusting your filters or search terms."
      action={{
        label: 'Clear Filters',
        onClick: onClearFilters,
      }}
      secondaryAction={{
        label: 'Reset Search',
        onClick: () => console.log('Reset search'),
      }}
    />
  );
}

export function EmptyFolderState({
  onUploadClick,
}: {
  onUploadClick: () => void;
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="This folder is empty"
      description="Upload files or create subfolders to organize your content."
      action={{
        label: 'Upload Files',
        onClick: onUploadClick,
      }}
      secondaryAction={{
        label: 'Create Folder',
        onClick: () => console.log('Create folder'),
      }}
    />
  );
}

// Inline Empty State (smaller, for lists)
export function InlineEmptyState({
  message,
  action,
}: {
  message: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12',
        'transition-opacity duration-300',
      )}
    >
      <Inbox className="text-muted-foreground/50 mb-4 h-16 w-16" />
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage Example with Conditional Rendering
export function EmptyStatePattern<T>({
  data,
  isLoading,
  isEmpty,
  emptyState,
  children,
}: {
  data: T[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyState: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isEmpty || data.length === 0) {
    return <>{emptyState}</>;
  }

  return <>{children}</>;
}

// Key Patterns Demonstrated:
// 1. Use semantic tokens for colors (bg-muted, text-muted-foreground)
// 2. Use transition-all duration-300 for smooth state changes
// 3. Center content with flex and items-center
// 4. Provide clear actions with PlusCircle icon
// 5. Use max-w-md to constrain description width
// 6. Support primary and secondary actions
