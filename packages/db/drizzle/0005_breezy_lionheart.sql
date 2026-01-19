CREATE TABLE "sales_invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_no" text NOT NULL,
	"status" text NOT NULL,
	"partner_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"source_order_id" uuid,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"issued_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_invoices_tenant_invoice_no" UNIQUE("tenant_id","invoice_no")
);
--> statement-breakpoint
CREATE TABLE "sales_invoice_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"line_no" integer NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"uom_id" uuid NOT NULL,
	"qty" numeric(18, 6) NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_invoice_lines_tenant_invoice_line_no" UNIQUE("tenant_id","invoice_id","line_no")
);
--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_partner_id_erp_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."erp_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoices" ADD CONSTRAINT "sales_invoices_source_order_id_sales_orders_id_fk" FOREIGN KEY ("source_order_id") REFERENCES "public"."sales_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoice_lines" ADD CONSTRAINT "sales_invoice_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoice_lines" ADD CONSTRAINT "sales_invoice_lines_invoice_id_sales_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."sales_invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoice_lines" ADD CONSTRAINT "sales_invoice_lines_product_id_erp_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."erp_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_invoice_lines" ADD CONSTRAINT "sales_invoice_lines_uom_id_erp_uoms_id_fk" FOREIGN KEY ("uom_id") REFERENCES "public"."erp_uoms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sales_invoices_tenant_status_created" ON "sales_invoices" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_sales_invoices_tenant_partner" ON "sales_invoices" USING btree ("tenant_id","partner_id");--> statement-breakpoint
CREATE INDEX "idx_sales_invoices_tenant_source_order" ON "sales_invoices" USING btree ("tenant_id","source_order_id");--> statement-breakpoint
CREATE INDEX "idx_sales_invoice_lines_tenant_invoice" ON "sales_invoice_lines" USING btree ("tenant_id","invoice_id");