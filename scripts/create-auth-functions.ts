#!/usr/bin/env tsx
/**
 * Create RLS helper functions
 * 
 * Creates:
 * - auth.user_id() - Get current user's ID from JWT
 * - auth.user_tenant_id() - Get current user's tenant
 * - auth.is_admin() - Check if current user is admin
 * 
 * Usage: tsx scripts/create-auth-functions.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function createAuthFunctions() {
  console.log('🔧 Creating authentication helper functions...\n');

  // 1. Create auth schema if not exists
  try {
    await sql`CREATE SCHEMA IF NOT EXISTS auth`;
    console.log('✅ Created auth schema');
  } catch (error) {
    console.log('ℹ️  Auth schema already exists');
  }

  // 2. Create auth.user_id() function
  try {
    await sql`
      CREATE OR REPLACE FUNCTION auth.user_id()
      RETURNS text
      LANGUAGE sql
      STABLE
      AS $$
        SELECT nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
      $$
    `;
    console.log('✅ Created auth.user_id() function');
  } catch (error) {
    console.error('❌ Failed to create auth.user_id():', error);
  }

  // 3. Create auth.user_tenant_id() function
  try {
    await sql`
      CREATE OR REPLACE FUNCTION auth.user_tenant_id()
      RETURNS text
      LANGUAGE sql
      STABLE
      AS $$
        SELECT tenant_id::text FROM users WHERE id = auth.user_id();
      $$
    `;
    console.log('✅ Created auth.user_tenant_id() function');
  } catch (error) {
    console.error('❌ Failed to create auth.user_tenant_id():', error);
  }

  // 4. Create auth.is_admin() function
  try {
    await sql`
      CREATE OR REPLACE FUNCTION auth.is_admin()
      RETURNS boolean
      LANGUAGE sql
      STABLE
      AS $$
        SELECT EXISTS (
          SELECT 1 FROM users
          WHERE id = auth.user_id()
            AND (metadata->>'role' = 'admin' OR metadata->>'isAdmin' = 'true')
        );
      $$
    `;
    console.log('✅ Created auth.is_admin() function');
  } catch (error) {
    console.error('❌ Failed to create auth.is_admin():', error);
  }

  console.log('\n✅ All authentication functions created!');
  console.log('\n📝 Available functions:');
  console.log('   - auth.user_id() → Returns current user ID from JWT');
  console.log('   - auth.user_tenant_id() → Returns current user tenant ID');
  console.log('   - auth.is_admin() → Returns true if user is admin\n');
}

createAuthFunctions().catch(console.error);
