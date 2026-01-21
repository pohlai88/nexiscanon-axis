import React from "react";
import {
  DoubleScreenLayout,
  NavbarOverlay,
  AuditTrailViewer,
  CommandKPalette,
  useCommandK,
  CommonCommands,
  type AuditEntry,
  type CommandAction,
} from "@workspace/shared-ui/blocks";
import { useNavigate } from "react-router-dom"; // or your router

/**
 * Complete System with Command-K Integration
 * 
 * This example shows all 4 components working together:
 * 1. NavbarOverlay - Top navigation with Command-K trigger
 * 2. CommandKPalette - Keyboard-first command interface
 * 3. DoubleScreenLayout - Split view for content + audit
 * 4. AuditTrailViewer - Full audit log
 */

export function CompleteSystemWithCommandK() {
  const navigate = useNavigate();
  const { isOpen, open, close } = useCommandK();
  const [showAuditTrail, setShowAuditTrail] = React.useState(false);
  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([
    // ... sample data
  ]);

  // Define all available commands
  const commands: CommandAction[] = [
    // Navigation
    ...CommonCommands.navigation(navigate),
    
    // Audit Trail Commands
    {
      id: "toggle-audit",
      label: "Toggle Audit Trail",
      description: "Show/hide audit trail panel",
      category: "View",
      keywords: ["audit", "trail", "log", "show", "hide"],
      shortcut: "⌘A",
      action: () => setShowAuditTrail(!showAuditTrail),
    },
    {
      id: "export-audit",
      label: "Export Audit Log",
      description: "Download audit trail as CSV",
      category: "Audit",
      keywords: ["export", "download", "csv"],
      action: () => exportAuditLog(),
    },
    
    // Search
    {
      id: "search-global",
      label: "Search Everything",
      description: "Search across all documents",
      category: "Search",
      keywords: ["search", "find"],
      shortcut: "⌘F",
      action: () => console.log("Open search"),
    },
    
    // File Operations
    {
      id: "new-document",
      label: "New Document",
      description: "Create a new document",
      category: "File",
      keywords: ["new", "create"],
      shortcut: "⌘N",
      action: () => createNewDocument(),
    },
    
    // Settings
    {
      id: "open-settings",
      label: "Settings",
      description: "Open application settings",
      category: "Settings",
      keywords: ["settings", "preferences", "config"],
      shortcut: "⌘,",
      action: () => navigate("/settings"),
    },
    
    // Help
    {
      id: "help-docs",
      label: "Documentation",
      description: "View help documentation",
      category: "Help",
      keywords: ["help", "docs", "documentation"],
      url: "https://docs.example.com",
      action: () => window.open("https://docs.example.com"),
    },
  ];

  const exportAuditLog = () => {
    const csv = auditEntries
      .map((e) => `${e.timestamp},${e.user.name},${e.action},${e.resource.name}`)
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-trail-${Date.now()}.csv`;
    a.click();
  };

  const createNewDocument = () => {
    // Create new document logic
    addAuditEntry("create", "New Document");
  };

  const addAuditEntry = (action: string, resourceName: string) => {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user: {
        name: "Current User",
        email: "user@example.com",
        role: "Admin",
      },
      action: action as any,
      resource: {
        type: "Document",
        id: crypto.randomUUID(),
        name: resourceName,
      },
      severity: "medium",
      status: "success",
    };
    setAuditEntries([entry, ...auditEntries]);
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Navbar with Command-K trigger */}
      <NavbarOverlay
        title="NexusCanon AXIS"
        user={{
          name: "Admin User",
          email: "admin@nexuscanon.com",
          role: "Super Admin",
        }}
        notifications={5}
        onSearchClick={open}
        onAuditTrailClick={() => setShowAuditTrail(!showAuditTrail)}
        transparent
        showAuditTrail
        fixed
      />

      {/* Command-K Palette */}
      <CommandKPalette
        isOpen={isOpen}
        onClose={close}
        actions={commands}
        placeholder="Type a command or search..."
        showRecent
        showShortcuts
      />

      {/* Main Content with Double Screen Layout */}
      <div className="flex-1 overflow-hidden pt-16">
        {showAuditTrail ? (
          <DoubleScreenLayout
            leftContent={<MainContent />}
            rightContent={
              <AuditTrailViewer
                entries={auditEntries}
                onExport={exportAuditLog}
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
          <MainContent />
        )}
      </div>
    </div>
  );
}

function MainContent() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Document Management</h1>
        <p className="text-muted-foreground">
          Press <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd> to open
          command palette
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Q4 Financial Report</h3>
          <p className="text-sm text-muted-foreground">
            Last modified 2 hours ago
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Marketing Strategy</h3>
          <p className="text-sm text-muted-foreground">
            Last modified 5 hours ago
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-2">Product Roadmap</h3>
          <p className="text-sm text-muted-foreground">
            Last modified 1 day ago
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal Command-K Example
 * 
 * Just the command palette without audit trail
 */
export function MinimalCommandKExample() {
  const { isOpen, open, close } = useCommandK();

  const quickActions: CommandAction[] = [
    {
      id: "action-1",
      label: "Create New Project",
      description: "Start a new project",
      category: "Actions",
      shortcut: "⌘N",
      action: () => console.log("New project"),
    },
    {
      id: "action-2",
      label: "Search Documents",
      description: "Find documents by name",
      category: "Search",
      shortcut: "⌘F",
      action: () => console.log("Search"),
    },
  ];

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={open}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Open Command Palette (⌘K)
      </button>

      {/* Command Palette */}
      <CommandKPalette
        isOpen={isOpen}
        onClose={close}
        actions={quickActions}
      />
    </div>
  );
}

/**
 * With Recent Actions Tracking
 */
export function CommandKWithRecentActions() {
  const { isOpen, open, close } = useCommandK();
  const [recentActions, setRecentActions] = React.useState<CommandAction[]>([]);

  const allActions: CommandAction[] = [
    // ... your actions
  ];

  const handleActionExecute = (action: CommandAction) => {
    // Add to recent (max 5)
    setRecentActions((prev) => {
      const filtered = prev.filter((a) => a.id !== action.id);
      return [action, ...filtered].slice(0, 5);
    });
  };

  return (
    <CommandKPalette
      isOpen={isOpen}
      onClose={close}
      actions={allActions}
      recentActions={recentActions}
      onActionExecute={handleActionExecute}
      showRecent
    />
  );
}
