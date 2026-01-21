import React from "react";
import {
  ComparisonCockpit,
  AuditTrailViewer,
  NavbarOverlay,
  type ComparisonDocument,
  type DocumentField,
  type AuditEntry,
} from "@workspace/shared-ui/blocks";

/**
 * Invoice Reconciliation Example
 * 
 * Billing officer comparing PDF invoice against ERP entry form
 */
export function InvoiceReconciliationExample() {
  const [formFields, setFormFields] = React.useState<DocumentField[]>([
    { id: "invoice_number", label: "Invoice Number", value: "", type: "text", required: true },
    { id: "vendor_name", label: "Vendor Name", value: "", type: "text", required: true },
    { id: "invoice_date", label: "Invoice Date", value: "", type: "date", required: true },
    { id: "due_date", label: "Due Date", value: "", type: "date", required: true },
    { id: "subtotal", label: "Subtotal", value: "", type: "currency", required: true },
    { id: "tax_amount", label: "Tax Amount", value: "", type: "currency", required: true },
    { id: "total_amount", label: "Total Amount", value: "", type: "currency", required: true },
    { id: "payment_terms", label: "Payment Terms", value: "", type: "text" },
    { id: "po_number", label: "PO Number", value: "", type: "text" },
  ]);

  const [auditEntries, setAuditEntries] = React.useState<AuditEntry[]>([]);

  // Sample PDF invoice content
  const pdfInvoice = `
    INVOICE

    Invoice Number: INV-2024-001234
    Date: January 20, 2024

    Bill To:
    Your Company Name
    123 Business Street
    City, State 12345

    From:
    Acme Suppliers Inc.
    456 Vendor Avenue
    Supplier City, ST 67890

    Description                    Quantity    Price       Total
    ---------------------------------------------------------------
    Office Supplies                   10       $25.00      $250.00
    Computer Equipment                 2       $450.00     $900.00
    Furniture                          1       $1,200.00   $1,200.00
    
    Subtotal:                                              $2,350.00
    Tax (8.5%):                                             $199.75
    Total Amount Due:                                     $2,549.75

    Payment Terms: Net 30
    PO Number: PO-2024-5678
    Due Date: February 19, 2024

    Please remit payment to:
    Bank: First National Bank
    Account: 1234567890
    Routing: 987654321
  `;

  const leftDocument: ComparisonDocument = {
    id: "invoice-pdf",
    title: "Invoice INV-2024-001234.pdf",
    type: "pdf",
    content: pdfInvoice,
    highlightable: true,
  };

  const rightDocument: ComparisonDocument = {
    id: "erp-form",
    title: "Invoice Entry Form",
    type: "form",
    content: null,
    fields: formFields,
  };

  const fieldMappings = {
    invoice_number: ["invoice", "inv", "number"],
    vendor_name: ["from", "vendor", "supplier"],
    invoice_date: ["date", "invoice date"],
    due_date: ["due", "due date"],
    subtotal: ["subtotal", "sub total"],
    tax_amount: ["tax"],
    total_amount: ["total", "amount due"],
    payment_terms: ["payment terms", "terms"],
    po_number: ["po", "purchase order"],
  };

  const handleFieldTransfer = (sourceText: string, targetFieldId: string) => {
    console.log(`Transferring "${sourceText}" to field ${targetFieldId}`);
    
    // Add audit entry
    const auditEntry: AuditEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      user: {
        name: "Billing Officer",
        email: "billing@company.com",
        role: "Finance",
      },
      action: "update",
      resource: {
        type: "Invoice Field",
        id: targetFieldId,
        name: formFields.find(f => f.id === targetFieldId)?.label || targetFieldId,
      },
      changes: [{
        field: targetFieldId,
        oldValue: formFields.find(f => f.id === targetFieldId)?.value || "",
        newValue: sourceText,
      }],
      severity: "medium",
      status: "success",
    };
    setAuditEntries([auditEntry, ...auditEntries]);
  };

  const handleFieldUpdate = (documentId: string, fieldId: string, value: string) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, value, validated: true } : field
      )
    );
  };

  const handleReconcile = () => {
    alert("Invoice reconciliation complete! Data saved to ERP.");
  };

  return (
    <div className="flex h-screen flex-col">
      <NavbarOverlay
        title="Invoice Reconciliation"
        user={{
          name: "Sarah Johnson",
          email: "sarah@company.com",
          role: "Billing Officer",
        }}
        transparent
      />

      <div className="flex-1 overflow-hidden pt-16">
        <ComparisonCockpit
          leftDocument={leftDocument}
          rightDocument={rightDocument}
          onFieldTransfer={handleFieldTransfer}
          onFieldUpdate={handleFieldUpdate}
          onReconcile={handleReconcile}
          fieldMappings={fieldMappings}
          aiAssisted
          showValidation
        />
      </div>
    </div>
  );
}

/**
 * Insurance Claim Reconciliation Example
 */
export function InsuranceClaimReconciliation() {
  const [formFields, setFormFields] = React.useState<DocumentField[]>([
    { id: "claim_number", label: "Claim Number", value: "", type: "text", required: true },
    { id: "patient_name", label: "Patient Name", value: "", type: "text", required: true },
    { id: "service_date", label: "Service Date", value: "", type: "date", required: true },
    { id: "billed_amount", label: "Billed Amount", value: "", type: "currency", required: true },
    { id: "approved_amount", label: "Approved Amount", value: "", type: "currency", required: true },
    { id: "patient_responsibility", label: "Patient Responsibility", value: "", type: "currency" },
    { id: "insurance_payment", label: "Insurance Payment", value: "", type: "currency", required: true },
    { id: "denial_reason", label: "Denial Reason", value: "", type: "text" },
    { id: "adjustment_code", label: "Adjustment Code", value: "", type: "text" },
  ]);

  const claimResponse = `
    EXPLANATION OF BENEFITS (EOB)
    
    Claim Number: CLM-2024-987654
    Patient: John Doe
    Member ID: MEM123456
    Date of Service: January 15, 2024
    
    Provider: City General Hospital
    Service Description: Emergency Room Visit
    
    Billing Summary:
    Billed Amount:                 $3,500.00
    Negotiated Rate:               $2,800.00
    Insurance Approved:            $2,240.00
    
    Patient Responsibility:
    Deductible Applied:             $500.00
    Co-insurance (20%):             $60.00
    Total Patient Responsibility:   $560.00
    
    Insurance Payment:             $2,240.00
    
    Adjustment Codes:
    Code 45: Charge exceeds contracted rate
    Code 23: Co-insurance applied
    
    Payment Status: APPROVED
    Check Number: CHK-789456
    Payment Date: January 25, 2024
    
    Denial Reason: N/A
  `;

  const leftDocument: ComparisonDocument = {
    id: "eob-document",
    title: "EOB - Claim CLM-2024-987654",
    type: "pdf",
    content: claimResponse,
    highlightable: true,
  };

  const rightDocument: ComparisonDocument = {
    id: "claim-form",
    title: "Claim Reconciliation Form",
    type: "form",
    content: null,
    fields: formFields,
  };

  const fieldMappings = {
    claim_number: ["claim", "clm"],
    patient_name: ["patient"],
    service_date: ["date of service", "service date"],
    billed_amount: ["billed amount", "billed"],
    approved_amount: ["approved", "insurance approved"],
    patient_responsibility: ["patient responsibility", "total patient"],
    insurance_payment: ["insurance payment", "payment"],
    denial_reason: ["denial"],
    adjustment_code: ["adjustment", "code"],
  };

  return (
    <div className="flex h-screen flex-col">
      <NavbarOverlay
        title="Insurance Claim Reconciliation"
        user={{
          name: "Medical Billing Specialist",
          email: "billing@hospital.com",
          role: "Medical Billing",
        }}
        transparent
      />

      <div className="flex-1 overflow-hidden pt-16">
        <ComparisonCockpit
          leftDocument={leftDocument}
          rightDocument={rightDocument}
          onFieldUpdate={(docId, fieldId, value) => {
            setFormFields((prev) =>
              prev.map((f) => (f.id === fieldId ? { ...f, value, validated: true } : f))
            );
          }}
          onReconcile={() => alert("Claim reconciled successfully!")}
          fieldMappings={fieldMappings}
          aiAssisted
          showValidation
        />
      </div>
    </div>
  );
}

/**
 * Purchase Order Verification Example
 */
export function PurchaseOrderVerification() {
  const [formFields, setFormFields] = React.useState<DocumentField[]>([
    { id: "po_number", label: "PO Number", value: "", type: "text", required: true },
    { id: "vendor", label: "Vendor", value: "", type: "text", required: true },
    { id: "order_date", label: "Order Date", value: "", type: "date", required: true },
    { id: "delivery_date", label: "Expected Delivery", value: "", type: "date" },
    { id: "item_description", label: "Item Description", value: "", type: "text", required: true },
    { id: "quantity", label: "Quantity", value: "", type: "number", required: true },
    { id: "unit_price", label: "Unit Price", value: "", type: "currency", required: true },
    { id: "total", label: "Total Amount", value: "", type: "currency", required: true },
  ]);

  const poDocument = `
    PURCHASE ORDER
    
    PO Number: PO-2024-5678
    Date: January 20, 2024
    
    Vendor:
    Tech Solutions Ltd.
    789 Technology Drive
    Tech City, TC 54321
    
    Ship To:
    Our Company Warehouse
    321 Warehouse Blvd
    City, ST 12345
    
    Item Details:
    -----------------------------------------------
    Description: Dell Latitude 7420 Laptop
    Model: LAT-7420-I7-16GB-512SSD
    Quantity: 15 units
    Unit Price: $1,299.99
    Total: $19,499.85
    
    Expected Delivery: February 5, 2024
    Shipping Method: Ground
    Payment Terms: Net 30
    
    Approved By: John Manager
    Date Approved: January 20, 2024
  `;

  const leftDocument: ComparisonDocument = {
    id: "po-pdf",
    title: "PO-2024-5678.pdf",
    type: "pdf",
    content: poDocument,
    highlightable: true,
  };

  const rightDocument: ComparisonDocument = {
    id: "receiving-form",
    title: "Goods Receipt Form",
    type: "form",
    content: null,
    fields: formFields,
  };

  return (
    <div className="h-screen">
      <ComparisonCockpit
        leftDocument={leftDocument}
        rightDocument={rightDocument}
        onFieldUpdate={(docId, fieldId, value) => {
          setFormFields((prev) =>
            prev.map((f) => (f.id === fieldId ? { ...f, value, validated: true } : f))
          );
        }}
        fieldMappings={{
          po_number: ["po", "purchase order"],
          vendor: ["vendor"],
          order_date: ["date"],
          delivery_date: ["delivery", "expected"],
          item_description: ["description", "model"],
          quantity: ["quantity", "units"],
          unit_price: ["unit price", "price"],
          total: ["total"],
        }}
        aiAssisted
        showValidation
      />
    </div>
  );
}

/**
 * Minimal Example - Just the Cockpit
 */
export function MinimalComparisonCockpit() {
  const leftDoc: ComparisonDocument = {
    id: "doc1",
    title: "Source Document",
    type: "pdf",
    content: "Sample text with data: Amount $1,234.56 Date 01/20/2024",
    highlightable: true,
  };

  const rightDoc: ComparisonDocument = {
    id: "doc2",
    title: "Target Form",
    type: "form",
    content: null,
    fields: [
      { id: "amount", label: "Amount", value: "", type: "currency" },
      { id: "date", label: "Date", value: "", type: "date" },
    ],
  };

  return (
    <div className="h-screen">
      <ComparisonCockpit
        leftDocument={leftDoc}
        rightDocument={rightDoc}
        onFieldTransfer={(text, fieldId) => console.log(`Transfer: ${text} → ${fieldId}`)}
      />
    </div>
  );
}
