CREATE TABLE "sales_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_no" text NOT NULL,
	"status" text NOT NULL,
	"partner_id" uuid NOT NULL,
	"currency" text NOT NULL,
	"source_quote_id" uuid,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"confirmed_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_orders_tenant_order_no" UNIQUE("tenant_id","order_no")
);
--> statement-breakpoint
CREATE TABLE "sales_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"line_no" integer NOT NULL,
	"product_id" uuid,
	"description" text NOT NULL,
	"uom_id" uuid NOT NULL,
	"qty" numeric(18, 6) NOT NULL,
	"unit_price_cents" integer NOT NULL,
	"line_total_cents" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_sales_order_lines_tenant_order_line_no" UNIQUE("tenant_id","order_id","line_no")
);
--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_partner_id_erp_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."erp_partners"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_source_quote_id_sales_quotes_id_fk" FOREIGN KEY ("source_quote_id") REFERENCES "public"."sales_quotes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_order_id_sales_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."sales_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_product_id_erp_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."erp_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_uom_id_erp_uoms_id_fk" FOREIGN KEY ("uom_id") REFERENCES "public"."erp_uoms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_sales_orders_tenant_status_created" ON "sales_orders" USING btree ("tenant_id","status","created_at");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_tenant_partner" ON "sales_orders" USING btree ("tenant_id","partner_id");--> statement-breakpoint
CREATE INDEX "idx_sales_orders_tenant_source_quote" ON "sales_orders" USING btree ("tenant_id","source_quote_id");--> statement-breakpoint
CREATE INDEX "idx_sales_order_lines_tenant_order" ON "sales_order_lines" USING btree ("tenant_id","order_id");