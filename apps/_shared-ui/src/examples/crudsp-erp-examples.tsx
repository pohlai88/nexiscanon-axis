import React from "react";
import {
  CRUDSPToolbar,
  ERPModulePresets,
  InteractiveDataTable,
  NavbarOverlay,
  CommandKPalette,
  useCommandK,
  AuditTrailViewer,
  type CRUDSPAction,
  type AuditEntry,
} from "@workspace/shared-ui/blocks";

/**
 * Complete ERP Module Example
 * 
 * Sales Order Management with CRUDSP toolbar
 */
export function SalesOrderModule() {
  const { isOpen: commandOpen, close: closeCommand } = useCommandK();
  const [selectedOrders, setSelectedOrders] = React.useState<string[]>([]);
  const [showAuditTrail, setShowAuditTrail] = React.useState(false);
  const [loading, setLoading] = React.useState<Partial<Record<CRUDSPAction, boolean>>>({});
  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([]);

  // Sales order data
  const [orders, setOrders] = React.useState([
    { id: "SO-001", customer: "Acme Corp", amount: "$12,500", status: "Pending" },
    { id: "SO-002", customer: "TechStart Inc", amount: "$8,900", status: "Approved" },
    { id: "SO-003", customer: "Global Solutions", amount: "$25,000", status: "Processing" },
  ]);

  // CRUDSP Handlers
  const handlers = {
    create: () => {
      setLoading({ create: true });
      setTimeout(() => {
        console.log("Creating new sales order");
        addAuditEntry("create", "New Sales Order");
        setLoading({});
      }, 1000);
    },
    quickOrder: () => {
      console.log("Quick order from template");
      addAuditEntry("create", "Quick Order");
    },
    bulkOrder: () => {
      console.log("Bulk order import");
      addAuditEntry("create", "Bulk Order Import");
    },
    read: () => {
      if (selectedOrders.length === 0) {
        alert("Please select an order to view");
        return;
      }
      console.log("Reading order:", selectedOrders[0]);
      addAuditEntry("view", selectedOrders[0]);
    },
    update: () => {
      if (selectedOrders.length === 0) {
        alert("Please select an order to edit");
        return;
      }
      console.log("Updating order:", selectedOrders[0]);
      addAuditEntry("update", selectedOrders[0]);
    },
    delete: () => {
      if (selectedOrders.length === 0) {
        alert("Please select an order to cancel");
        return;
      }
      if (confirm(`Cancel order ${selectedOrders[0]}?`)) {
        console.log("Cancelling order:", selectedOrders[0]);
        addAuditEntry("delete", selectedOrders[0]);
      }
    },
    search: () => {
      console.log("Opening search");
    },
    audit: () => {
      setShowAuditTrail(!showAuditTrail);
    },
    predict: () => {
      console.log("Running AI forecast");
      addAuditEntry("view", "AI Forecast Generated");
    },
    demandForecast: () => {
      console.log("Demand forecast");
    },
    revenueProjection: () => {
      console.log("Revenue projection");
    },
  };

  const addAuditEntry = (action: string, resourceName: string) => {
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user: {
        name: "Sales Manager",
        email: "sales@example.com",
        role: "Sales",
      },
      action: action as any,
      resource: {
        type: "Sales Order",
        id: crypto.randomUUID(),
        name: resourceName,
      },
      severity: "medium",
      status: "success",
    };
    setAuditEntries([entry, ...auditEntries]);
  };

  // User permissions
  const permissions = {
    create: true,
    read: true,
    update: true,
    delete: true, // false for regular users
    search: true,
    audit: true,
    predict: true,
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Navbar */}
      <NavbarOverlay
        title="Sales Orders"
        user={{
          name: "John Smith",
          email: "john@example.com",
          role: "Sales Manager",
        }}
        onAuditTrailClick={() => setShowAuditTrail(!showAuditTrail)}
        transparent
        fixed
      />

      {/* Command Palette */}
      <CommandKPalette
        isOpen={commandOpen}
        onClose={closeCommand}
        actions={[]}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden pt-16">
        <div className="h-full p-6 space-y-6">
          {/* CRUDSP Toolbar */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Sales Orders</h1>
              <p className="text-sm text-muted-foreground">
                Manage customer orders and track fulfillment
              </p>
            </div>

            <CRUDSPToolbar
              actions={ERPModulePresets.salesOrders(handlers)}
              permissions={permissions}
              layout="horizontal"
              showLabels
              showShortcuts
            />
          </div>

          {/* Selection Info */}
          {selectedOrders.length > 0 && (
            <div className="rounded-lg border bg-primary/10 p-3 text-sm">
              <strong>{selectedOrders.length}</strong> order(s) selected
            </div>
          )}

          {/* Data Table */}
          <InteractiveDataTable
            columns={[
              { key: "id", label: "Order ID", sortable: true },
              { key: "customer", label: "Customer", sortable: true },
              { key: "amount", label: "Amount", sortable: true },
              { key: "status", label: "Status", sortable: true },
            ]}
            data={orders}
            onRowClick={(row) => setSelectedOrders([row.id])}
            showActions
          />

          {/* Audit Trail Panel */}
          {showAuditTrail && (
            <div className="fixed right-0 top-16 bottom-0 w-96 border-l bg-background overflow-auto shadow-lg">
              <AuditTrailViewer
                entries={auditEntries}
                showFilters
                showMetadata
                compactMode
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal CRUDSP Example
 */
export function MinimalCRUDSPExample() {
  return (
    <CRUDSPToolbar
      actions={{
        create: {
          action: "create",
          onClick: () => console.log("Create"),
        },
        read: {
          action: "read",
          onClick: () => console.log("Read"),
        },
        update: {
          action: "update",
          onClick: () => console.log("Update"),
        },
        delete: {
          action: "delete",
          onClick: () => console.log("Delete"),
        },
        search: {
          action: "search",
          onClick: () => console.log("Search"),
        },
        audit: {
          action: "audit",
          onClick: () => console.log("Audit"),
        },
        predict: {
          action: "predict",
          onClick: () => console.log("Predict"),
        },
      }}
      showLabels
    />
  );
}

/**
 * Inventory Module Example
 */
export function InventoryModule() {
  const [loading, setLoading] = React.useState<Partial<Record<CRUDSPAction, boolean>>>({});

  const handlers = {
    create: () => console.log("Add item"),
    read: () => console.log("View stock"),
    update: () => console.log("Adjust inventory"),
    delete: () => console.log("Remove item"),
    search: () => console.log("Find items"),
    audit: () => console.log("Movement log"),
    predict: () => {
      setLoading({ predict: true });
      setTimeout(() => {
        alert("AI Prediction: Item SKU-123 will need reordering in 5 days");
        setLoading({});
      }, 2000);
    },
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory Management</h1>

        <CRUDSPToolbar
          actions={{
            ...ERPModulePresets.inventory(handlers),
            predict: {
              ...ERPModulePresets.inventory(handlers).predict!,
              loading: loading.predict,
            },
          }}
          showLabels
        />
      </div>

      <div className="rounded-lg border p-12 text-center text-muted-foreground">
        <p>Inventory table would go here</p>
        <p className="text-sm mt-2">Click Predict to see AI reorder alerts</p>
      </div>
    </div>
  );
}

/**
 * With Permission Control
 */
export function CRUDSPWithPermissions() {
  const [userRole, setUserRole] = React.useState<"admin" | "editor" | "viewer">("editor");

  const permissions = {
    admin: {
      create: true,
      read: true,
      update: true,
      delete: true,
      search: true,
      audit: true,
      predict: true,
    },
    editor: {
      create: true,
      read: true,
      update: true,
      delete: false, // No delete permission
      search: true,
      audit: false, // No audit access
      predict: true,
    },
    viewer: {
      create: false,
      read: true,
      update: false,
      delete: false,
      search: true,
      audit: false,
      predict: false,
    },
  };

  return (
    <div className="p-6 space-y-6">
      {/* Role Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">User Role:</label>
        <select
          value={userRole}
          onChange={(e) => setUserRole(e.target.value as any)}
          className="rounded-md border px-3 py-1"
        >
          <option value="admin">Admin (Full Access)</option>
          <option value="editor">Editor (No Delete/Audit)</option>
          <option value="viewer">Viewer (Read Only)</option>
        </select>
      </div>

      {/* CRUDSP Toolbar */}
      <CRUDSPToolbar
        actions={{
          create: { action: "create", onClick: () => console.log("Create") },
          read: { action: "read", onClick: () => console.log("Read") },
          update: { action: "update", onClick: () => console.log("Update") },
          delete: { action: "delete", onClick: () => console.log("Delete") },
          search: { action: "search", onClick: () => console.log("Search") },
          audit: { action: "audit", onClick: () => console.log("Audit") },
          predict: { action: "predict", onClick: () => console.log("Predict") },
        }}
        permissions={permissions[userRole]}
        showLabels
      />

      <div className="rounded-lg border p-6">
        <p className="text-sm text-muted-foreground">
          Switch roles to see how permissions affect button visibility
        </p>
      </div>
    </div>
  );
}

/**
 * Vertical Layout for Sidebars
 */
export function CRUDSPVerticalLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar with vertical CRUDSP */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <h2 className="mb-4 font-semibold">Actions</h2>
        <CRUDSPToolbar
          actions={{
            create: { action: "create", onClick: () => console.log("Create") },
            read: { action: "read", onClick: () => console.log("Read") },
            update: { action: "update", onClick: () => console.log("Update") },
            delete: { action: "delete", onClick: () => console.log("Delete") },
            search: { action: "search", onClick: () => console.log("Search") },
            audit: { action: "audit", onClick: () => console.log("Audit") },
            predict: { action: "predict", onClick: () => console.log("Predict") },
          }}
          layout="vertical"
          showLabels
        />
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <p className="text-muted-foreground">Main content area</p>
      </div>
    </div>
  );
}
