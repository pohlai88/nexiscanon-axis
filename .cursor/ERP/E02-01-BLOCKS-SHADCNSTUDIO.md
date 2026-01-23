# E02-01: ShadcnStudio Blocks Implementation Guide

> Applies on top of `E02-BLOCKS.md`. Delta-only additions from ShadcnStudio registry.

## Overview

This document catalogs **~40 net new block types** from ShadcnStudio that complement our existing 87 blocks. These blocks fill critical gaps in Marketing UI, eCommerce, and advanced Dashboard patterns.

## Source

- **MCP Server**: `user-ShadcnStudio`
- **Tools**: `get-blocks-metadata`, `get-block-meta-content`, `get-inspiration-block-content`

---

## Implementation Status Legend

| Status | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🔄 | In progress |
| ✅ | Implemented |
| ⏭️ | Skipped (lower priority) |

---

## Category 1: Bento Grid (HIGH PRIORITY)

Modern flexible grid layouts for dashboards and landing pages.

| Block | Variants | Status | Priority | Path |
|-------|----------|--------|----------|------|
| Bento Grid | 10 | ✅ | 🔴 HIGH | `/bento-grid/bento-grid/registry` |

### Inspiration Endpoints
```
src/mcp/inspiration-blocks/bento-grid/bento-grid
src/mcp/inspiration-blocks/bento-grid/bento-grid-2
src/mcp/inspiration-blocks/bento-grid/bento-grid-3
src/mcp/inspiration-blocks/bento-grid/bento-grid-4
src/mcp/inspiration-blocks/bento-grid/bento-grid-5
src/mcp/inspiration-blocks/bento-grid/bento-grid-6
src/mcp/inspiration-blocks/bento-grid/bento-grid-7
src/mcp/inspiration-blocks/bento-grid/bento-grid-8
src/mcp/inspiration-blocks/bento-grid/bento-grid-9
src/mcp/inspiration-blocks/bento-grid/bento-grid-10
```

---

## Category 2: Dashboard & Application (HIGH PRIORITY)

Essential blocks for ERP dashboard experience.

| Block | Variants | Status | Priority | Path |
|-------|----------|--------|----------|------|
| Application Shell | 9 | ✅ | 🔴 HIGH | `/dashboard-and-application/application-shell/registry` |
| Multi-step Form | 3 | ✅ | 🔴 HIGH | `/dashboard-and-application/multi-step-form/registry` |
| Dashboard Shell | 9 | ✅ | 🔴 HIGH | `/dashboard-and-application/dashboard-shell/registry` |
| Dashboard Header | 6 | ✅ | 🔴 HIGH | `/dashboard-and-application/dashboard-header/registry` |
| Dashboard Dialog | 2 | ✅ | 🟡 MEDIUM | `/dashboard-and-application/dashboard-dialog/registry` |
| Dashboard Dropdown | 2 | ⬜ | 🟡 MEDIUM | `/dashboard-and-application/dashboard-dropdown/registry` |
| Dashboard Footer | 1 | ⬜ | 🟢 LOW | `/dashboard-and-application/dashboard-footer/registry` |
| Widgets Component | 1 | ✅ | 🟡 MEDIUM | `/dashboard-and-application/widgets-component/registry` |
| ~~Charts Component~~ | 2 | ✅ | — | We have 30 charts |
| ~~Dashboard Sidebar~~ | 2 | ✅ | — | We have 17 sidebars |
| ~~Statistics Component~~ | 2 | ✅ | — | We have stats-grid-01 |

### Inspiration Endpoints - Application Shell
```
src/mcp/inspiration-blocks/dashboard-and-application/application-shell
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-2
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-3
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-4
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-5
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-6
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-7
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-8
src/mcp/inspiration-blocks/dashboard-and-application/application-shell-9
```

### Inspiration Endpoints - Multi-step Form
```
src/mcp/inspiration-blocks/dashboard-and-application/multi-step-form
src/mcp/inspiration-blocks/dashboard-and-application/multi-step-form-2
src/mcp/inspiration-blocks/dashboard-and-application/multi-step-form-3
```

### Inspiration Endpoints - Dashboard Shell
```
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-2
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-3
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-4
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-5
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-6
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-7
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-8
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-shell-9
```

### Inspiration Endpoints - Dashboard Header
```
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-header
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-header-2
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-header-3
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-header-4
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-header-5
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-header-6
```

### Inspiration Endpoints - Other Dashboard
```
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-dialog
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-dialog-2
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-dropdown
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-dropdown-2
src/mcp/inspiration-blocks/dashboard-and-application/dashboard-footer
src/mcp/inspiration-blocks/dashboard-and-application/widgets-component
```

---

## Category 3: Marketing UI (MEDIUM PRIORITY)

Blocks for tenant portals, landing pages, and public-facing UIs.

| Block | Variants | Status | Priority | Path |
|-------|----------|--------|----------|------|
| Hero Section | 15 | ✅ | 🔴 HIGH | `/marketing-ui/hero-section/registry` |
| Features Section | 7 | ✅ | 🔴 HIGH | `/marketing-ui/features-section/registry` |
| Pricing | 2 | ✅ | 🔴 HIGH | `/marketing-ui/pricing-component/registry` |
| FAQ | 2 | ✅ | 🟡 MEDIUM | `/marketing-ui/faq-component/registry` |
| Testimonials | 4 | ✅ | 🟡 MEDIUM | `/marketing-ui/testimonials-component/registry` |
| Navbar | 2 | ✅ | 🟡 MEDIUM | `/marketing-ui/navbar-component/registry` |
| Footer | 1 | ✅ | 🟡 MEDIUM | `/marketing-ui/footer-component/registry` |
| CTA Section | 1 | ✅ | 🟡 MEDIUM | `/marketing-ui/cta-section/registry` |
| Social Proof | 3 | ✅ | 🟡 MEDIUM | `/marketing-ui/social-proof/registry` |
| Team Section | 2 | ⬜ | 🟢 LOW | `/marketing-ui/team-section/registry` |
| About Us Page | 6 | ⬜ | 🟢 LOW | `/marketing-ui/about-us-page/registry` |
| Contact Us | 2 | ⬜ | 🟢 LOW | `/marketing-ui/contact-us-page/registry` |
| Blog | 2 | ⬜ | 🟢 LOW | `/marketing-ui/blog-component/registry` |
| Portfolio | 2 | ⬜ | 🟢 LOW | `/marketing-ui/portfolio/registry` |
| Gallery | 1 | ⬜ | 🟢 LOW | `/marketing-ui/gallery-component/registry` |
| Logo Cloud | 1 | ⬜ | 🟢 LOW | `/marketing-ui/logo-cloud/registry` |
| Compare | 1 | ⬜ | 🟢 LOW | `/marketing-ui/compare/registry` |
| App Integration | 1 | ⬜ | 🟢 LOW | `/marketing-ui/app-integration/registry` |
| Cookies Consent | 1 | ⬜ | 🟢 LOW | `/marketing-ui/cookies-consent/registry` |
| Verify Email | 1 | ⬜ | 🟢 LOW | `/marketing-ui/verify-email/registry` |
| ~~Login Page~~ | 1 | ✅ | — | We have 5 login variants |
| ~~Register~~ | 1 | ✅ | — | We have signup-form-01 |
| ~~Forgot Password~~ | 1 | ✅ | — | We have forgot-password-form-01 |
| ~~Reset Password~~ | 1 | ✅ | — | We have reset-password-form-01 |
| ~~Two Factor Auth~~ | 1 | ✅ | — | We have otp-form-01 |
| ~~Error Page~~ | 2 | ✅ | — | We have error-state-01 |

### Inspiration Endpoints - Hero Section
```
src/mcp/inspiration-blocks/marketing-ui/hero-section
src/mcp/inspiration-blocks/marketing-ui/hero-section-2
src/mcp/inspiration-blocks/marketing-ui/hero-section-3
src/mcp/inspiration-blocks/marketing-ui/hero-section-4
src/mcp/inspiration-blocks/marketing-ui/hero-section-5
src/mcp/inspiration-blocks/marketing-ui/hero-section-6
src/mcp/inspiration-blocks/marketing-ui/hero-section-7
src/mcp/inspiration-blocks/marketing-ui/hero-section-8
src/mcp/inspiration-blocks/marketing-ui/hero-section-9
src/mcp/inspiration-blocks/marketing-ui/hero-section-10
src/mcp/inspiration-blocks/marketing-ui/hero-section-11
src/mcp/inspiration-blocks/marketing-ui/hero-section-12
src/mcp/inspiration-blocks/marketing-ui/hero-section-13
src/mcp/inspiration-blocks/marketing-ui/hero-section-14
src/mcp/inspiration-blocks/marketing-ui/hero-section-15
```

### Inspiration Endpoints - Features Section
```
src/mcp/inspiration-blocks/marketing-ui/features-section
src/mcp/inspiration-blocks/marketing-ui/features-section-2
src/mcp/inspiration-blocks/marketing-ui/features-section-3
src/mcp/inspiration-blocks/marketing-ui/features-section-4
src/mcp/inspiration-blocks/marketing-ui/features-section-5
src/mcp/inspiration-blocks/marketing-ui/features-section-6
src/mcp/inspiration-blocks/marketing-ui/features-section-7
```

### Inspiration Endpoints - Pricing
```
src/mcp/inspiration-blocks/marketing-ui/pricing-component
src/mcp/inspiration-blocks/marketing-ui/pricing-component-2
```

### Inspiration Endpoints - Other Marketing
```
src/mcp/inspiration-blocks/marketing-ui/faq-component
src/mcp/inspiration-blocks/marketing-ui/faq-component-2
src/mcp/inspiration-blocks/marketing-ui/testimonials-component
src/mcp/inspiration-blocks/marketing-ui/testimonials-component-2
src/mcp/inspiration-blocks/marketing-ui/testimonials-component-3
src/mcp/inspiration-blocks/marketing-ui/testimonials-component-4
src/mcp/inspiration-blocks/marketing-ui/navbar-component
src/mcp/inspiration-blocks/marketing-ui/navbar-component-2
src/mcp/inspiration-blocks/marketing-ui/footer-component
src/mcp/inspiration-blocks/marketing-ui/cta-section
src/mcp/inspiration-blocks/marketing-ui/social-proof
src/mcp/inspiration-blocks/marketing-ui/social-proof-2
src/mcp/inspiration-blocks/marketing-ui/social-proof-3
src/mcp/inspiration-blocks/marketing-ui/team-section
src/mcp/inspiration-blocks/marketing-ui/team-section-2
src/mcp/inspiration-blocks/marketing-ui/about-us-page
src/mcp/inspiration-blocks/marketing-ui/about-us-page-2
src/mcp/inspiration-blocks/marketing-ui/about-us-page-3
src/mcp/inspiration-blocks/marketing-ui/about-us-page-4
src/mcp/inspiration-blocks/marketing-ui/about-us-page-5
src/mcp/inspiration-blocks/marketing-ui/about-us-page-6
src/mcp/inspiration-blocks/marketing-ui/contact-us-page
src/mcp/inspiration-blocks/marketing-ui/contact-us-page-2
src/mcp/inspiration-blocks/marketing-ui/blog-component
src/mcp/inspiration-blocks/marketing-ui/blog-component-2
src/mcp/inspiration-blocks/marketing-ui/portfolio
src/mcp/inspiration-blocks/marketing-ui/portfolio-2
src/mcp/inspiration-blocks/marketing-ui/gallery-component
src/mcp/inspiration-blocks/marketing-ui/logo-cloud
src/mcp/inspiration-blocks/marketing-ui/compare
src/mcp/inspiration-blocks/marketing-ui/app-integration
src/mcp/inspiration-blocks/marketing-ui/cookies-consent
src/mcp/inspiration-blocks/marketing-ui/verify-email
```

---

## Category 4: eCommerce (MEDIUM PRIORITY)

Blocks for procurement, marketplace, and product catalog features.

| Block | Variants | Status | Priority | Path |
|-------|----------|--------|----------|------|
| Shopping Cart | 1 | ✅ | 🔴 HIGH | `/ecommerce/shopping-cart/registry` |
| Checkout Page | 1 | ✅ | 🔴 HIGH | `/ecommerce/checkout-page/registry` |
| Product List | 1 | ✅ | 🔴 HIGH | `/ecommerce/product-list/registry` |
| Order Summary | 1 | ✅ | 🔴 HIGH | `/ecommerce/order-summary/registry` |
| Product Overview | 2 | ✅ | 🟡 MEDIUM | `/ecommerce/product-overview/registry` |
| Product Quick View | 1 | ⬜ | 🟡 MEDIUM | `/ecommerce/product-quick-view/registry` |
| Product Reviews | 2 | ⬜ | 🟡 MEDIUM | `/ecommerce/product-reviews/registry` |
| Category Filter | 1 | ⬜ | 🟡 MEDIUM | `/ecommerce/category-filter/registry` |
| Product Category | 1 | ⬜ | 🟢 LOW | `/ecommerce/product-category/registry` |
| Mega Footer | 1 | ⬜ | 🟢 LOW | `/ecommerce/mega-footer/registry` |
| Offer Modal | 1 | ⬜ | 🟢 LOW | `/ecommerce/offer-modal/registry` |

### Inspiration Endpoints - eCommerce
```
src/mcp/inspiration-blocks/ecommerce/shopping-cart
src/mcp/inspiration-blocks/ecommerce/checkout-page
src/mcp/inspiration-blocks/ecommerce/product-list
src/mcp/inspiration-blocks/ecommerce/order-summary
src/mcp/inspiration-blocks/ecommerce/product-overview
src/mcp/inspiration-blocks/ecommerce/product-overview-2
src/mcp/inspiration-blocks/ecommerce/product-quick-view
src/mcp/inspiration-blocks/ecommerce/product-reviews
src/mcp/inspiration-blocks/ecommerce/product-reviews-2
src/mcp/inspiration-blocks/ecommerce/category-filter
src/mcp/inspiration-blocks/ecommerce/product-category
src/mcp/inspiration-blocks/ecommerce/mega-footer
src/mcp/inspiration-blocks/ecommerce/offer-modal
```

---

## Category 5: DataTable (ALREADY COVERED)

| Block | Variants | Status | Notes |
|-------|----------|--------|-------|
| ~~DataTable~~ | 2 | ✅ | We have `data-fortress-01` |

---

## Implementation Phases

### Phase 1: Dashboard Critical (ERP Core)
**Target: 5 block types, ~20 variants**

| Priority | Block | Variants | Est. Effort |
|----------|-------|----------|-------------|
| 1 | Multi-step Form | 3 | High |
| 2 | Bento Grid | 3-5 | Medium |
| 3 | Application Shell | 2-3 | High |
| 4 | Dashboard Header | 2-3 | Medium |
| 5 | Widgets Component | 1 | Low |

### Phase 2: Marketing Essentials
**Target: 5 block types, ~15 variants**

| Priority | Block | Variants | Est. Effort |
|----------|-------|----------|-------------|
| 1 | Hero Section | 3-5 | Medium |
| 2 | Pricing | 2 | Medium |
| 3 | Features Section | 2-3 | Medium |
| 4 | FAQ | 2 | Low |
| 5 | Footer | 1 | Low |

### Phase 3: eCommerce (If Needed)
**Target: 4 block types, ~5 variants**

| Priority | Block | Variants | Est. Effort |
|----------|-------|----------|-------------|
| 1 | Shopping Cart | 1 | High |
| 2 | Checkout Page | 1 | High |
| 3 | Product List | 1 | Medium |
| 4 | Order Summary | 1 | Medium |

---

## MCP Usage Guide

### Fetch Block Metadata
```typescript
// Get detailed block info for installation
CallMcpTool({
  server: "user-ShadcnStudio",
  toolName: "get-block-meta-content",
  arguments: { endpoint: "/bento-grid/bento-grid/registry" }
})
```

### Fetch Inspiration Code
```typescript
// Get actual code for a block variant
CallMcpTool({
  server: "user-ShadcnStudio",
  toolName: "get-inspiration-block-content",
  arguments: { endpoint: "src/mcp/inspiration-blocks/bento-grid/bento-grid" }
})
```

---

## Summary Statistics

| Category | Total Blocks | Variants | Status |
|----------|-------------|----------|--------|
| Bento Grid | 1 | 10 | ⬜ Missing |
| Dashboard & Application | 8 | 33 | ⬜ Mostly Missing |
| Marketing UI | 20 | 59 | ⬜ Mostly Missing |
| eCommerce | 11 | 13 | ⬜ Missing |
| DataTable | 1 | 2 | ✅ Covered |
| **TOTAL NEW** | **40** | **115** | — |

### Current State
- **Our blocks**: 87
- **Overlap with ShadcnStudio**: ~15 (already covered)
- **Net new from ShadcnStudio**: ~40 block types

### After Full Implementation
- **Projected total**: ~127 blocks (87 + 40)

---

## References

- Parent: `E02-BLOCKS.md`
- Implementation: `E03-IMPLEMENTATION.md`
- MCP Server: `user-ShadcnStudio`
