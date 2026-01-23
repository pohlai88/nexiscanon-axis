# Quick Start: Integrated Audit Trail System

## Installation

These components are already part of `@workspace/shared-ui`. No additional installation needed!

## Basic Setup (5 minutes)

### Step 1: Import Components

```tsx
import {
  DoubleScreenLayout,
  NavbarOverlay,
  AuditTrailViewer,
  type AuditEntry,
} from '@workspace/shared-ui/blocks';
```

### Step 2: Create State

```tsx
const [showAuditTrail, setShowAuditTrail] = React.useState(false);
const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([]);
```

### Step 3: Add to Your Layout

```tsx
<div className="flex h-screen flex-col">
  {/* Navbar */}
  <NavbarOverlay
    title="My App"
    user={currentUser}
    onAuditTrailClick={() => setShowAuditTrail(!showAuditTrail)}
    transparent
    fixed
  />

  {/* Content */}
  <div className="flex-1 overflow-hidden pt-16">
    {showAuditTrail ? (
      <DoubleScreenLayout
        leftContent={<YourContent />}
        rightContent={<AuditTrailViewer entries={auditEntries} />}
      />
    ) : (
      <YourContent />
    )}
  </div>
</div>
```

### Step 4: Add Audit Entries

```tsx
const addAuditEntry = (action: string, resource: string) => {
  const newEntry: AuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user: currentUser,
    action: action as any,
    resource: {
      type: 'Document',
      id: 'doc-123',
      name: resource,
    },
    severity: 'medium',
    status: 'success',
  };

  setAuditEntries([newEntry, ...auditEntries]);
};

// Use it:
addAuditEntry('update', 'Financial Report.pdf');
```

## Component Quick Reference

### 1. DoubleScreenLayout

**Resizable split-pane layout**

```tsx
<DoubleScreenLayout
  leftContent={<div>Main Content</div>}
  rightContent={<div>Audit Trail</div>}
  leftTitle="Content"
  rightTitle="Audit Log"
  defaultSplit={60}
  allowSwap
  allowFullscreen
/>
```

### 2. NavbarOverlay

**Transparent navigation bar**

```tsx
<NavbarOverlay
  title="My App"
  user={{ name: 'John', email: 'john@example.com', role: 'Admin' }}
  notifications={5}
  onAuditTrailClick={() => setShowAuditTrail(true)}
  transparent
  showAuditTrail
/>
```

### 3. AuditTrailViewer

**Full-featured audit log**

```tsx
<AuditTrailViewer
  entries={auditEntries}
  onExport={() => exportToCSV(auditEntries)}
  showFilters
  showMetadata
/>
```

## Real-World Example

```tsx
import React from 'react';
import {
  DoubleScreenLayout,
  NavbarOverlay,
  AuditTrailViewer,
  type AuditEntry,
} from '@workspace/shared-ui/blocks';

export function MyApp() {
  const [showAuditTrail, setShowAuditTrail] = React.useState(false);
  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user: {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
      },
      action: 'update',
      resource: {
        type: 'Document',
        id: 'doc-123',
        name: 'Financial Report',
      },
      changes: [
        {
          field: 'status',
          oldValue: 'draft',
          newValue: 'published',
        },
      ],
      severity: 'high',
      status: 'success',
    },
  ]);

  return (
    <div className="flex h-screen flex-col">
      <NavbarOverlay
        title="Document Manager"
        user={{
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'Super Admin',
        }}
        notifications={3}
        onAuditTrailClick={() => setShowAuditTrail(!showAuditTrail)}
        transparent
        showAuditTrail
        fixed
      />

      <div className="flex-1 overflow-hidden pt-16">
        {showAuditTrail ? (
          <DoubleScreenLayout
            leftContent={
              <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Documents</h1>
                {/* Your content here */}
              </div>
            }
            rightContent={
              <AuditTrailViewer
                entries={auditEntries}
                onExport={() => console.log('Export')}
                showFilters
                showMetadata
              />
            }
            leftTitle="Documents"
            rightTitle="Audit Trail"
            defaultSplit={60}
            allowSwap
            allowFullscreen
          />
        ) : (
          <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">Documents</h1>
            {/* Your content here */}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Toggle Audit Trail

```tsx
const [showAudit, setShowAudit] = React.useState(false);

<NavbarOverlay onAuditTrailClick={() => setShowAudit(!showAudit)} />;
```

### Pattern 2: Filter Audit Entries

```tsx
const handleFilterChange = (filters: AuditFilters) => {
  // Apply filters to your data source
  const filtered = filterAuditEntries(auditEntries, filters);
  setFilteredEntries(filtered);
};

<AuditTrailViewer
  entries={filteredEntries}
  onFilterChange={handleFilterChange}
/>;
```

### Pattern 3: Export Audit Log

```tsx
const exportToCSV = () => {
  const csv = auditEntries
    .map(
      (entry) =>
        `${entry.timestamp},${entry.user.name},${entry.action},${entry.resource.name}`,
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-trail-${Date.now()}.csv`;
  a.click();
};

<AuditTrailViewer entries={auditEntries} onExport={exportToCSV} />;
```

## Tips & Best Practices

1. **Store Audit Entries**: Use a database (PostgreSQL, MongoDB) to persist audit logs
2. **Real-time Updates**: Use WebSocket or polling to show live updates
3. **Pagination**: For 1000+ entries, implement server-side pagination
4. **Retention**: Set up auto-archiving for old entries (e.g., 90 days)
5. **Security**: Encrypt sensitive audit data at rest
6. **Compliance**: Ensure GDPR/CCPA compliance for user data

## Troubleshooting

### Audit trail not showing?

- Check `showAuditTrail` state
- Verify `entries` array is not empty
- Check component is wrapped in proper layout

### Split pane not resizing?

- Ensure parent has defined height (`h-screen` or `h-full`)
- Check for CSS conflicts
- Verify mouse events are not blocked

### Navbar overlay not transparent?

- Set `transparent={true}` prop
- Check for conflicting CSS

## Next Steps

- Add real-time updates with WebSocket
- Implement server-side filtering
- Add export to PDF
- Set up automated compliance reports
- Integrate with notification system

## Questions?

See full documentation: [INTEGRATED_AUDIT_SYSTEM.md](./INTEGRATED_AUDIT_SYSTEM.md)
