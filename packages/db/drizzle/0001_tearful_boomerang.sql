CREATE TABLE "erp_audit_events" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"actor_type" text DEFAULT 'USER' NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"command_id" uuid,
	"trace_id" text,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_erp_audit_tenant_entity" ON "erp_audit_events" USING btree ("tenant_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "idx_erp_audit_tenant_time" ON "erp_audit_events" USING btree ("tenant_id","occurred_at");--> statement-breakpoint
CREATE INDEX "idx_erp_audit_entity_id" ON "erp_audit_events" USING btree ("entity_id","occurred_at");