ALTER TABLE "requests" ADD COLUMN "evidence_required_for_approval" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "requests" ADD COLUMN "evidence_ttl_seconds" integer;