// packages/domain/src/addons/erp.base/tokens.ts
// ERP Base service tokens for DI

import { SEQUENCE_SERVICE } from "./services/sequence-service";
import { UOM_SERVICE } from "./services/uom-service";
import { PARTNER_SERVICE } from "./services/partner-service";
import { PRODUCT_SERVICE } from "./services/product-service";
import { ERP_AUDIT_SERVICE } from "./services/audit-service";

/**
 * ERP Base service tokens
 * Import these in route handlers to get services from domain container
 */
export const ERP_BASE_TOKENS = {
  ErpAuditService: ERP_AUDIT_SERVICE,
  SequenceService: SEQUENCE_SERVICE,
  UomService: UOM_SERVICE,
  PartnerService: PARTNER_SERVICE,
  ProductService: PRODUCT_SERVICE,
} as const;
