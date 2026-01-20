CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_created_idx" ON "audit_logs" USING btree ("tenant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "evidence_files_tenant_id_idx" ON "evidence_files" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "evidence_files_status_idx" ON "evidence_files" USING btree ("status");--> statement-breakpoint
CREATE INDEX "evidence_files_uploaded_by_idx" ON "evidence_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "request_evidence_links_tenant_id_idx" ON "request_evidence_links" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "request_evidence_links_request_id_idx" ON "request_evidence_links" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "request_evidence_links_evidence_file_id_idx" ON "request_evidence_links" USING btree ("evidence_file_id");--> statement-breakpoint
CREATE INDEX "request_templates_tenant_id_idx" ON "request_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "requests_tenant_id_idx" ON "requests" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "requests_status_idx" ON "requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "requests_tenant_created_idx" ON "requests" USING btree ("tenant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "requests_requester_id_idx" ON "requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "users_tenant_id_idx" ON "users" USING btree ("tenant_id");