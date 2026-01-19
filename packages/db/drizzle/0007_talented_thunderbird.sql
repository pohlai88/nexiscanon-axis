CREATE TABLE "evidence_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"original_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" bigint NOT NULL,
	"sha256" text,
	"r2_key" text NOT NULL,
	"source_r2_key" text,
	"view_r2_key" text,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "evidence_files_r2_key_unique" UNIQUE("r2_key")
);
--> statement-breakpoint
CREATE TABLE "sales_credit_note_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"credit_note_id" uuid NOT NULL,
	"line_no" integer NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"uom_id" uuid NOT NULL,
	"qty" numeric(18, 6) NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_credit_note_lines_tenant_credit_line" UNIQUE("tenant_id","credit_note_id","line_no")
);
--> statement-breakpoint
CREATE TABLE "sales_credit_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"credit_no" text NOT NULL,
	"status" text NOT NULL,
	"partner_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"source_invoice_id" uuid,
	"reason" text,
	"subtotal_cents" integer DEFAULT 0 NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"issued_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_credit_notes_tenant_credit_no" UNIQUE("tenant_id","credit_no")
);
--> statement-breakpoint
ALTER TABLE "evidence_files" ADD CONSTRAINT "evidence_files_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_note_lines" ADD CONSTRAINT "sales_credit_note_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_note_lines" ADD CONSTRAINT "sales_credit_note_lines_credit_note_id_sales_credit_notes_id_fk" FOREIGN KEY ("credit_note_id") REFERENCES "public"."sales_credit_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_note_lines" ADD CONSTRAINT "sales_credit_note_lines_product_id_erp_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."erp_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_note_lines" ADD CONSTRAINT "sales_credit_note_lines_uom_id_erp_uoms_id_fk" FOREIGN KEY ("uom_id") REFERENCES "public"."erp_uoms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_notes" ADD CONSTRAINT "sales_credit_notes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_notes" ADD CONSTRAINT "sales_credit_notes_partner_id_erp_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."erp_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_credit_notes" ADD CONSTRAINT "sales_credit_notes_source_invoice_id_sales_invoices_id_fk" FOREIGN KEY ("source_invoice_id") REFERENCES "public"."sales_invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sales_credit_note_lines_tenant_credit" ON "sales_credit_note_lines" USING btree ("tenant_id","credit_note_id");--> statement-breakpoint
CREATE INDEX "idx_sales_credit_notes_tenant_status_created" ON "sales_credit_notes" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_sales_credit_notes_tenant_partner" ON "sales_credit_notes" USING btree ("tenant_id","partner_id");--> statement-breakpoint
CREATE INDEX "idx_sales_credit_notes_tenant_source_invoice" ON "sales_credit_notes" USING btree ("tenant_id","source_invoice_id");