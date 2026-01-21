import React from "react";
import {
  DoubleScreenLayout,
  NavbarOverlay,
  AuditTrailViewer,
  type AuditEntry,
} from "@workspace/shared-ui/blocks";

/**
 * Integrated Audit Trail System
 * 
 * This example demonstrates how to use the 3 components together:
 * 1. NavbarOverlay - Top navigation with audit trail quick access
 * 2. DoubleScreenLayout - Split view for content + audit trail
 * 3. AuditTrailViewer - Full audit log with filtering and search
 * 
 * Perfect for:
 * - Compliance dashboards
 * - Security monitoring
 * - Admin panels
 * - Document management systems
 */

export function IntegratedAuditSystem() {
  const [showAuditTrail, setShowAuditTrail] = React.useState(false);
  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([
    {
      id: "1",
      timestamp: new Date().toISOString(),
      user: {
        name: "John Doe",
        email: "john@example.com",
        avatar: "https://avatar.vercel.sh/john",
        role: "Admin",
      },
      action: "update",
      resource: {
        type: "Document",
        id: "doc-123",
        name: "Q4 Financial Report",
      },
      changes: [
        {
          field: "status",
          oldValue: "draft",
          newValue: "published",
        },
        {
          field: "visibility",
          oldValue: "private",
          newValue: "public",
        },
      ],
      metadata: {
        ipAddress: "192.168.1.100",
        location: "New York, USA",
        device: "MacBook Pro",
        browser: "Chrome 120",
      },
      severity: "high",
      status: "success",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: {
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Editor",
      },
      action: "view",
      resource: {
        type: "Document",
        id: "doc-123",
        name: "Q4 Financial Report",
      },
      metadata: {
        ipAddress: "192.168.1.101",
        location: "San Francisco, USA",
      },
      severity: "low",
      status: "success",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: {
        name: "Bob Wilson",
        email: "bob@example.com",
        role: "Viewer",
      },
      action: "download",
      resource: {
        type: "Document",
        id: "doc-456",
        name: "Confidential Strategy.pdf",
      },
      metadata: {
        ipAddress: "203.0.113.45",
        location: "London, UK",
        device: "iPhone 15",
        browser: "Safari 17",
      },
      severity: "medium",
      status: "success",
    },
    {
      id: "4",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: {
        name: "Alice Brown",
        email: "alice@example.com",
        role: "Admin",
      },
      action: "delete",
      resource: {
        type: "User",
        id: "user-789",
        name: "test-user@example.com",
      },
      metadata: {
        ipAddress: "192.168.1.102",
        location: "New York, USA",
      },
      severity: "critical",
      status: "success",
    },
  ]);

  // Main content component
  const MainContent = () => (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Management System</h1>
        <p className="text-muted-foreground">
          Manage your documents with full audit trail visibility
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Document cards would go here */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Q4 Financial Report</h3>
          <p className="text-sm text-muted-foreground">
            Last modified 2 hours ago by John Doe
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Marketing Strategy 2024</h3>
          <p className="text-sm text-muted-foreground">
            Last modified 5 hours ago by Jane Smith
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Product Roadmap</h3>
          <p className="text-sm text-muted-foreground">
            Last modified 1 day ago by Bob Wilson
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen flex-col">
      {/* Navbar Overlay */}
      <NavbarOverlay
        title="NexusCanon AXIS"
        user={{
          name: "Admin User",
          email: "admin@nexuscanon.com",
          role: "Super Admin",
        }}
        notifications={5}
        onNotificationClick={() => console.log("Show notifications")}
        onSearchClick={() => console.log("Open search")}
        onAuditTrailClick={() => setShowAuditTrail(!showAuditTrail)}
        onSettingsClick={() => console.log("Open settings")}
        onLogout={() => console.log("Logout")}
        showAuditTrail
        transparent
        fixed
      />

      {/* Main Content Area with Double Screen Layout */}
      <div className="flex-1 overflow-hidden pt-16">
        {showAuditTrail ? (
          <DoubleScreenLayout
            leftContent={<MainContent />}
            rightContent={
              <AuditTrailViewer
                entries={auditEntries}
                onExport={() => console.log("Export audit log")}
                onFilterChange={(filters) => console.log("Filters:", filters)}
                onEntryClick={(entry) => console.log("Entry clicked:", entry)}
                showFilters
                showMetadata
              />
            }
            leftTitle="Documents"
            rightTitle="Audit Trail"
            defaultSplit={60}
            minSplit={30}
            maxSplit={80}
            allowSwap
            allowFullscreen
          />
        ) : (
          <MainContent />
        )}
      </div>
    </div>
  );
}

/**
 * Alternative: Full-Screen Audit Trail
 * 
 * For dedicated audit trail pages
 */
export function StandaloneAuditTrail() {
  return (
    <div className="flex h-screen flex-col">
      <NavbarOverlay
        title="Audit Trail"
        user={{
          name: "Security Officer",
          email: "security@nexuscanon.com",
          role: "Security Admin",
        }}
        showAuditTrail={false}
        transparent
      />

      <div className="flex-1 overflow-auto pt-16">
        <div className="container mx-auto p-6">
          <AuditTrailViewer
            entries={[
              // ... audit entries
            ]}
            onExport={() => console.log("Export for compliance")}
            showFilters
            showMetadata
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Alternative: Side-by-Side Comparison
 * 
 * Compare two documents or versions with audit trail
 */
export function DocumentComparisonWithAudit() {
  return (
    <div className="flex h-screen flex-col">
      <NavbarOverlay
        title="Document Comparison"
        user={{
          name: "Compliance Officer",
          email: "compliance@nexuscanon.com",
          role: "Compliance",
        }}
        transparent
      />

      <div className="flex-1 overflow-hidden pt-16">
        <DoubleScreenLayout
          leftContent={
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Version 1.0 (Original)</h2>
              <div className="prose max-w-none">
                {/* Document content */}
                <p>Original document content...</p>
              </div>
            </div>
          }
          rightContent={
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Version 2.0 (Current)</h2>
              <div className="prose max-w-none">
                {/* Document content */}
                <p>Updated document content...</p>
              </div>
            </div>
          }
          leftTitle="Version 1.0"
          rightTitle="Version 2.0"
          defaultSplit={50}
          allowSwap
          allowFullscreen
        />
      </div>
    </div>
  );
}
