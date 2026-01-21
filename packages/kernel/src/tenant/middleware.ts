import { resolveTenant } from "./resolve.js";

/**
 * Options for tenant middleware.
 */
export interface TenantMiddlewareOptions {
  /** Paths to exclude from tenant resolution */
  excludePaths?: string[];

  /** Callback when tenant is invalid */
  onInvalidTenant?: (slug: string, error: string) => Response | null;
}

/**
 * Create tenant resolution logic for Next.js middleware.
 * Returns tenant info to be used in middleware handler.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { createTenantMiddleware } from "@axis/kernel/tenant";
 *
 * const tenantMiddleware = createTenantMiddleware({
 *   excludePaths: ["/api/auth", "/login"],
 * });
 *
 * export function middleware(request: NextRequest) {
 *   const tenant = tenantMiddleware(request.nextUrl.pathname);
 *   if (!tenant.isValid) {
 *     return NextResponse.redirect("/login");
 *   }
 *   // Continue with tenant context...
 * }
 * ```
 */
export function createTenantMiddleware(options: TenantMiddlewareOptions = {}) {
  const { excludePaths = [] } = options;

  return (pathname: string) => {
    // Check if path should be excluded
    const shouldExclude = excludePaths.some(
      (path) => pathname === path || pathname.startsWith(`${path}/`)
    );

    if (shouldExclude) {
      return {
        slug: null,
        tenantId: null,
        isValid: true,
        excluded: true,
      };
    }

    const resolution = resolveTenant(pathname);

    return {
      ...resolution,
      excluded: false,
    };
  };
}
