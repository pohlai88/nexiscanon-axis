/**
 * Template Registry Index
 *
 * This file exports all templates for easy import.
 * Templates are organized by category.
 *
 * Usage:
 * import { LandingPage01 } from "@workspace/shared-ui/templates/marketing/landing-page-01";
 * import { DashboardHome01 } from "@workspace/shared-ui/templates/dashboard/dashboard-home-01";
 */

// Marketing Templates
export { default as LandingPage01 } from './marketing/landing-page-01';
export { default as PricingPage01 } from './marketing/pricing-page-01';
export { default as FeaturesPage01 } from './marketing/features-page-01';

// Dashboard Templates
export { default as DashboardHome01 } from './dashboard/dashboard-home-01';
export { default as UsersTable01 } from './dashboard/users-table-01';
export { default as SettingsPage01 } from './dashboard/settings-page-01';

// Auth Templates
export { default as LoginPage01 } from './auth/login-page-01';
export { default as LoginPage03 } from './auth/login-page-03';
export { default as LoginPage04 } from './auth/login-page-04';
export { default as SignupPage01 } from './auth/signup-page-01';

// Dashboard Templates
export { default as Dashboard02 } from './dashboard/dashboard-02';

// Tasks Templates
export { default as TasksPage01 } from './tasks/tasks-page-01';

// Re-export types if needed
export type { DataFortressColumn } from '../blocks';
