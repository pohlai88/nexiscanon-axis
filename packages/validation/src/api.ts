// packages/validation/src/api.ts
// API route validation schemas

import { z } from "zod";

// ---- Health endpoint ----

export const healthOutputSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string().datetime(),
});

export type HealthOutput = z.infer<typeof healthOutputSchema>;

// ---- Echo endpoint ----

export const echoBodySchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const echoOutputSchema = z.object({
  echoed: z.string(),
});

export type EchoBody = z.infer<typeof echoBodySchema>;
export type EchoOutput = z.infer<typeof echoOutputSchema>;

// ---- Auth endpoints ----

export const loginOutputSchema = z.object({
  message: z.string(),
});

export const logoutOutputSchema = z.object({
  success: z.boolean(),
});

export const signupOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type LoginOutput = z.infer<typeof loginOutputSchema>;
export type LogoutOutput = z.infer<typeof logoutOutputSchema>;
export type SignupOutput = z.infer<typeof signupOutputSchema>;

// ---- Users endpoint ----

export const userOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type UserOutput = z.infer<typeof userOutputSchema>;

// ---- Requests endpoints ----

export const requestCreateInputSchema = z.object({
  // EVI013: Template inheritance + policy overrides
  templateId: z.string().uuid().optional(),
  evidenceRequiredForApproval: z.boolean().optional(),
  evidenceTtlSeconds: z.number().int().positive().nullable().optional(),
});

export const requestCreateOutputSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requesterId: z.string().uuid(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]),
  createdAt: z.string().datetime(),
  approvedAt: z.string().datetime().optional(),
  approvedBy: z.string().uuid().optional(),
});

export const requestApproveInputSchema = z.object({
  // Empty body for now - approverId comes from auth context
});

export const requestApproveOutputSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  requesterId: z.string().uuid(),
  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED", "REJECTED"]),
  createdAt: z.string().datetime(),
  approvedAt: z.string().datetime().optional(),
  approvedBy: z.string().uuid().optional(),
});

export type RequestCreateInput = z.infer<typeof requestCreateInputSchema>;
export type RequestCreateOutput = z.infer<typeof requestCreateOutputSchema>;
export type RequestApproveInput = z.infer<typeof requestApproveInputSchema>;
export type RequestApproveOutput = z.infer<typeof requestApproveOutputSchema>;

// ---- Templates endpoints ----

export const templateCreateInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  evidenceRequiredForApproval: z.boolean().optional(),
  evidenceTtlSeconds: z.number().int().positive().nullable().optional(),
});

export const templateOutputSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  evidenceRequiredForApproval: z.boolean(),
  evidenceTtlSeconds: z.number().int().positive().nullable(),
  createdAt: z.string(),
});

export const templatesListOutputSchema = z.object({
  templates: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string().nullable(),
      evidenceRequiredForApproval: z.boolean(),
      evidenceTtlSeconds: z.number().int().positive().nullable(),
      createdAt: z.string(),
    })
  ),
});

export type TemplateCreateInput = z.infer<typeof templateCreateInputSchema>;
export type TemplateOutput = z.infer<typeof templateOutputSchema>;
export type TemplatesListOutput = z.infer<typeof templatesListOutputSchema>;
