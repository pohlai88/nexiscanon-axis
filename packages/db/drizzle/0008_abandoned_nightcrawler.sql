CREATE TYPE "public"."acct_dc" AS ENUM('DEBIT', 'CREDIT');--> statement-breakpoint
CREATE TYPE "public"."acct_source_type" AS ENUM('SALES_INVOICE', 'SALES_CREDIT_NOTE');--> statement-breakpoint
CREATE TABLE "acct_ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entry_no" text NOT NULL,
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source_type" "acct_source_type" NOT NULL,
	"source_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"currency" text NOT NULL,
	"memo" text,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "acct_ledger_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"account_code" text NOT NULL,
	"dc" "acct_dc" NOT NULL,
	"amount_cents" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "acct_ledger_lines" ADD CONSTRAINT "acct_ledger_lines_entry_id_acct_ledger_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."acct_ledger_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_acct_ledger_tenant_source_event" ON "acct_ledger_entries" USING btree ("tenant_id","source_type","source_id","event_type");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_acct_ledger_tenant_entry_no" ON "acct_ledger_entries" USING btree ("tenant_id","entry_no");--> statement-breakpoint
CREATE INDEX "idx_acct_ledger_tenant_posted_at" ON "acct_ledger_entries" USING btree ("tenant_id","posted_at");--> statement-breakpoint
CREATE INDEX "idx_acct_ledger_tenant_source" ON "acct_ledger_entries" USING btree ("tenant_id","source_type","source_id");--> statement-breakpoint
CREATE INDEX "idx_acct_ledger_lines_tenant_entry" ON "acct_ledger_lines" USING btree ("tenant_id","entry_id");--> statement-breakpoint
CREATE INDEX "idx_acct_ledger_lines_tenant_account" ON "acct_ledger_lines" USING btree ("tenant_id","account_code");