CREATE TABLE "request_evidence_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"request_id" uuid NOT NULL,
	"evidence_file_id" uuid NOT NULL,
	"linked_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "request_evidence_links" ADD CONSTRAINT "request_evidence_links_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_evidence_links" ADD CONSTRAINT "request_evidence_links_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "request_evidence_links" ADD CONSTRAINT "request_evidence_links_evidence_file_id_evidence_files_id_fk" FOREIGN KEY ("evidence_file_id") REFERENCES "public"."evidence_files"("id") ON DELETE no action ON UPDATE no action;