-- Clean Rebuild: Posting Spine Schema
-- Generated: 2026-01-23
-- Implements: F01 + B01 without tech debt

-- ============================================================================
-- Core Identity & Auth Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  name varchar(255),
  email_verified boolean NOT NULL DEFAULT false,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(63) NOT NULL,
  name varchar(255) NOT NULL,
  type varchar(20) NOT NULL DEFAULT 'organization',
  parent_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  status varchar(20) NOT NULL DEFAULT 'active',
  plan varchar(20) NOT NULL DEFAULT 'free',
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS tenants_slug_unique ON tenants(slug);

CREATE TABLE IF NOT EXISTS tenant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  key_hash varchar(255) NOT NULL UNIQUE,
  last_used_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'member',
  token varchar(255) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Audit Trail (F01 LAW F01-07)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  resource_type varchar(100),
  resource_id uuid,
  who varchar(255),
  what text,
  "where" varchar(255),
  why text,
  how varchar(100),
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address varchar(45),
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- Chart of Accounts (B01 Foundation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code varchar(20) NOT NULL,
  name varchar(255) NOT NULL,
  account_type varchar(20) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  metadata jsonb,
  is_active varchar(10) NOT NULL DEFAULT 'true',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS accounts_tenant_code_idx ON accounts(tenant_id, code);

-- ============================================================================
-- B01 Posting Spine: 3-Layer Model
-- ============================================================================

-- Layer 1: Documents (Workflow Layer)
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_type varchar(50) NOT NULL,
  state varchar(20) NOT NULL DEFAULT 'draft',
  document_number varchar(50) NOT NULL,
  document_date timestamptz NOT NULL,
  entity_id uuid,
  version integer NOT NULL DEFAULT 1,
  data jsonb NOT NULL,
  context_6w1h jsonb NOT NULL,
  danger_zone jsonb,
  reversal_id uuid,
  reversed_from_id uuid,
  created_by uuid NOT NULL REFERENCES users(id),
  modified_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz,
  posted_by uuid REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_documents_tenant ON documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_documents_type_state ON documents(tenant_id, document_type, state);
CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(tenant_id, document_number);

-- Layer 2: Economic Events (Truth Layer)
CREATE TABLE IF NOT EXISTS economic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
  event_type varchar(50) NOT NULL,
  description varchar(500) NOT NULL,
  event_date timestamptz NOT NULL,
  amount numeric(19, 4),
  currency varchar(3) NOT NULL DEFAULT 'USD',
  entity_id uuid,
  data jsonb NOT NULL,
  context_6w1h jsonb NOT NULL,
  danger_zone jsonb,
  reversal_id uuid,
  reversed_from_id uuid,
  is_reversal varchar(10) NOT NULL DEFAULT 'false',
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_economic_events_tenant ON economic_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_economic_events_document ON economic_events(document_id);
CREATE INDEX IF NOT EXISTS idx_economic_events_date ON economic_events(event_date);

-- Layer 3: Ledger Postings (Math Layer)
CREATE TABLE IF NOT EXISTS ledger_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  economic_event_id uuid NOT NULL REFERENCES economic_events(id) ON DELETE RESTRICT,
  batch_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  direction varchar(10) NOT NULL,
  amount numeric(19, 4) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'USD',
  posting_date timestamptz NOT NULL,
  description varchar(500) NOT NULL,
  metadata jsonb,
  reversal_id uuid,
  reversed_from_id uuid,
  is_reversal varchar(10) NOT NULL DEFAULT 'false',
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_postings_tenant ON ledger_postings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ledger_postings_event ON ledger_postings(economic_event_id);
CREATE INDEX IF NOT EXISTS idx_ledger_postings_batch ON ledger_postings(batch_id);
CREATE INDEX IF NOT EXISTS idx_ledger_postings_account ON ledger_postings(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_postings_date ON ledger_postings(posting_date);

-- ============================================================================
-- Verification Queries
-- ============================================================================

SELECT 'Schema created successfully' AS status;

-- Count core tables
SELECT 
  COUNT(*) FILTER (WHERE table_name IN ('users', 'tenants', 'tenant_users', 'api_keys', 'invitations')) AS identity_tables,
  COUNT(*) FILTER (WHERE table_name = 'audit_logs') AS audit_tables,
  COUNT(*) FILTER (WHERE table_name = 'accounts') AS coa_tables,
  COUNT(*) FILTER (WHERE table_name IN ('documents', 'economic_events', 'ledger_postings')) AS posting_spine_tables
FROM information_schema.tables
WHERE table_schema = 'public';
