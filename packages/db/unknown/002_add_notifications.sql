-- =============================================================================
-- STATUS: UNKNOWN
-- Origin: apps/web/db/migrations/002_add_notifications.sql
-- Moved: 2026-01-24
-- Action: Check if notifications table exists in Drizzle schema or production.
--         If not, consider adding to Drizzle schema properly.
-- =============================================================================

-- Migration: Add notifications table
-- Description: In-app notification system for users

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES neon_auth.users_sync(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  metadata JSONB DEFAULT '{}',
  action_url TEXT,
  action_label VARCHAR(100),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_tenant 
  ON notifications(tenant_id) 
  WHERE tenant_id IS NOT NULL;

-- Comment
COMMENT ON TABLE notifications IS 'In-app notifications for users';
