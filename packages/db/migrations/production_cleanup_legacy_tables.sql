-- Production Cleanup: Remove All Legacy Tables
-- Generated: 2026-01-23
-- Purpose: Achieve clean F01/B01 schema in production

-- Drop legacy accounting tables
DROP TABLE IF EXISTS gl_accounts, gl_ledger_postings, gl_posting_batches CASCADE;
DROP TABLE IF EXISTS journal_entries CASCADE;
DROP TABLE IF EXISTS fiscal_periods, currencies, tenant_currencies, exchange_rates CASCADE;
DROP TABLE IF EXISTS ap_subledger, ar_subledger CASCADE;

-- Drop business module tables (Sales)
DROP TABLE IF EXISTS sales_quotes, sales_orders, sales_deliveries, sales_invoices, sales_payments, sales_credit_notes CASCADE;

-- Drop business module tables (Purchase)
DROP TABLE IF EXISTS purchase_requests, purchase_orders, purchase_receipts, purchase_bills, purchase_payments, purchase_debit_notes CASCADE;

-- Drop business module tables (Inventory)
DROP TABLE IF EXISTS stock_levels, stock_moves, stock_adjustments, stock_transfers CASCADE;
DROP TABLE IF EXISTS reservations, physical_counts, valuation_entries, cost_layers CASCADE;

-- Drop business module tables (Reconciliation)
DROP TABLE IF EXISTS recon_bank_statements, recon_bank_statement_lines CASCADE;
DROP TABLE IF EXISTS recon_match_records, recon_exceptions, recon_jobs CASCADE;

-- Drop business module tables (Controls)
DROP TABLE IF EXISTS ctrl_roles, ctrl_permissions, ctrl_role_permissions, ctrl_user_roles CASCADE;
DROP TABLE IF EXISTS ctrl_policies, ctrl_policy_rules CASCADE;
DROP TABLE IF EXISTS ctrl_danger_zone_requests, ctrl_audit_extensions CASCADE;

-- Drop business module tables (Workflow)
DROP TABLE IF EXISTS wf_definitions, wf_steps, wf_instances CASCADE;
DROP TABLE IF EXISTS wf_tasks, wf_task_history CASCADE;
DROP TABLE IF EXISTS wf_delegations, wf_escalation_rules, wf_notifications CASCADE;

-- Drop business module tables (Afanda/Dashboards)
DROP TABLE IF EXISTS afanda_dashboards, afanda_dashboard_layouts, afanda_widgets CASCADE;
DROP TABLE IF EXISTS afanda_kpis, afanda_report_definitions CASCADE;
DROP TABLE IF EXISTS afanda_alert_rules, afanda_alert_instances CASCADE;

-- Drop business module tables (Lynx/AI)
DROP TABLE IF EXISTS lynx_agents, lynx_tools CASCADE;
DROP TABLE IF EXISTS lynx_agent_executions, lynx_conversation_sessions CASCADE;
DROP TABLE IF EXISTS lynx_tool_execution_logs CASCADE;

-- Drop business module tables (UX)
DROP TABLE IF EXISTS ux_persona_configs, ux_user_preferences, ux_onboarding_progress CASCADE;

-- Drop utility tables
DROP TABLE IF EXISTS domain_outbox, posting_idempotency_keys, embeddings CASCADE;

-- Verification: Count remaining tables (should be 10)
SELECT COUNT(*) AS remaining_public_tables 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
