// packages/domain/src/addons/requests/types.ts
// Shared types for requests addon (breaks circular dependency)

export type RequestStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export interface Request {
  id: string;
  tenantId: string;
  requesterId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  evidenceRequiredForApproval?: boolean;
  evidenceTtlSeconds?: number | null;
}

export interface RequestCreateInput {
  requesterId: string;
  templateId?: string; // Optional template to inherit policy from (EVI013)
  evidenceRequiredForApproval?: boolean; // Override template policy (EVI013)
  evidenceTtlSeconds?: number | null; // Override template policy (EVI013)
}

export interface RequestApproveInput {
  requestId: string;
  approverId: string;
}
