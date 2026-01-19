CREATE TABLE "erp_uoms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_erp_uoms_tenant_code" UNIQUE("tenant_id","code")
);
--> statement-breakpoint
CREATE TABLE "erp_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sequence_key" text NOT NULL,
	"prefix" text NOT NULL,
	"next_value" bigint DEFAULT 1 NOT NULL,
	"padding" integer DEFAULT 6 NOT NULL,
	"year_reset" boolean DEFAULT true NOT NULL,
	"current_year" integer,
	CONSTRAINT "uq_erp_sequences_tenant_key" UNIQUE("tenant_id","sequence_key")
);
--> statement-breakpoint
CREATE TABLE "erp_partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"party_type" text NOT NULL,
	"tax_id" text,
	"company_registry" text,
	"email" text,
	"phone" text,
	"website" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state_province" text,
	"postal_code" text,
	"country_code" text,
	"default_currency_code" text,
	"default_payment_terms_days" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"internal_notes" text,
	CONSTRAINT "uq_erp_partners_tenant_code" UNIQUE("tenant_id","code")
);
--> statement-breakpoint
CREATE TABLE "erp_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"product_type" text DEFAULT 'GOODS' NOT NULL,
	"category" text,
	"default_sale_price_cents" bigint DEFAULT 0 NOT NULL,
	"default_purchase_price_cents" bigint DEFAULT 0 NOT NULL,
	"currency_code" text DEFAULT 'USD' NOT NULL,
	"default_uom_id" uuid,
	"is_stockable" boolean DEFAULT true NOT NULL,
	"track_inventory" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_sellable" boolean DEFAULT true NOT NULL,
	"is_purchasable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid,
	"version" integer DEFAULT 1 NOT NULL,
	"internal_notes" text,
	CONSTRAINT "uq_erp_products_tenant_sku" UNIQUE("tenant_id","sku")
);
--> statement-breakpoint
ALTER TABLE "erp_uoms" ADD CONSTRAINT "erp_uoms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_sequences" ADD CONSTRAINT "erp_sequences_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_partners" ADD CONSTRAINT "erp_partners_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_partners" ADD CONSTRAINT "erp_partners_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_partners" ADD CONSTRAINT "erp_partners_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_products" ADD CONSTRAINT "erp_products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_products" ADD CONSTRAINT "erp_products_default_uom_id_erp_uoms_id_fk" FOREIGN KEY ("default_uom_id") REFERENCES "public"."erp_uoms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_products" ADD CONSTRAINT "erp_products_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "erp_products" ADD CONSTRAINT "erp_products_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_erp_uoms_tenant" ON "erp_uoms" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_erp_uoms_tenant_category" ON "erp_uoms" USING btree ("tenant_id","category");--> statement-breakpoint
CREATE INDEX "idx_erp_sequences_tenant" ON "erp_sequences" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_erp_partners_tenant" ON "erp_partners" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_erp_partners_tenant_type" ON "erp_partners" USING btree ("tenant_id","party_type");--> statement-breakpoint
CREATE INDEX "idx_erp_partners_tenant_name" ON "erp_partners" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "idx_erp_products_tenant" ON "erp_products" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_erp_products_tenant_active" ON "erp_products" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "idx_erp_products_tenant_category" ON "erp_products" USING btree ("tenant_id","category");