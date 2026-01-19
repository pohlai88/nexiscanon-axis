CREATE TABLE "sales_quotes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"quote_no" text NOT NULL,
	"status" text NOT NULL,
	"partner_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"issued_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_quotes_tenant_quote_no" UNIQUE("tenant_id","quote_no")
);
--> statement-breakpoint
CREATE TABLE "sales_quote_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"quote_id" uuid NOT NULL,
	"line_no" integer NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"uom_id" uuid NOT NULL,
	"qty" numeric(18, 6) NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_quote_lines_tenant_quote_line_no" UNIQUE("tenant_id","quote_id","line_no")
);
--> statement-breakpoint
ALTER TABLE "sales_quotes" ADD CONSTRAINT "sales_quotes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_quotes" ADD CONSTRAINT "sales_quotes_partner_id_erp_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."erp_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_quote_lines" ADD CONSTRAINT "sales_quote_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_quote_lines" ADD CONSTRAINT "sales_quote_lines_quote_id_sales_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."sales_quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_quote_lines" ADD CONSTRAINT "sales_quote_lines_product_id_erp_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."erp_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_quote_lines" ADD CONSTRAINT "sales_quote_lines_uom_id_erp_uoms_id_fk" FOREIGN KEY ("uom_id") REFERENCES "public"."erp_uoms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sales_quotes_tenant_status_created" ON "sales_quotes" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_sales_quotes_tenant_partner" ON "sales_quotes" USING btree ("tenant_id","partner_id");--> statement-breakpoint
CREATE INDEX "idx_sales_quote_lines_tenant_quote" ON "sales_quote_lines" USING btree ("tenant_id","quote_id");