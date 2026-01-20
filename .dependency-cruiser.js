/**
 * Dependency Cruiser Configuration - Canon Guardrails Pack
 * 
 * This config enforces architectural boundaries as a Directed Acyclic Graph (DAG).
 * It treats architecture as code and validates it strictly.
 * 
 * Run: pnpm validate:architecture
 * Diagram: pnpm graph:architecture
 * 
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
    forbidden: [
        /* =========================================================
           REFINEMENT 1: No App-to-Internal-DS (Block Deep Imports)
           ========================================================= */
        {
            name: 'no-app-to-internal-ds',
            severity: 'error',
            comment: 'Apps cannot import design-system internals directly. Use public subpath exports only.',
            from: {
                path: '^apps/'
            },
            to: {
                path: '^packages/design-system/src/',
                pathNot: [
                    // Allowed public entry points
                    '^packages/design-system/src/index\\.ts$',
                    '^packages/design-system/src/styles/globals\\.css$'
                ]
            }
        },

        /* =========================================================
           REFINEMENT 2: No Relative Escape Hatch
           Apps cannot use ../../ to bypass package boundaries
           ========================================================= */
        {
            name: 'no-relative-escape',
            severity: 'error',
            comment: 'Apps cannot use relative imports to escape package boundaries (../../packages/...)',
            from: {
                path: '^apps/'
            },
            to: {
                path: '^\\.\\./\\.\\./packages/',
            }
        },

        /* =========================================================
           REFINEMENT 3: No Themed Components in Production
           Showcase/themed components are reference only
           ========================================================= */
        {
            name: 'no-themed-in-production',
            severity: 'error',
            comment: 'Themed components (src/themed/) are showcase only, not for production use',
            from: {
                path: '^apps/(web|docs)/'
            },
            to: {
                path: '^packages/design-system/src/themed/'
            }
        },

        /* =========================================================
           REFINEMENT 4: No Direct Utility Imports
           Apps must use design-system utils, not direct dependencies
           ========================================================= */
        {
            name: 'no-direct-utility-imports',
            severity: 'error',
            comment: 'Apps must use @workspace/design-system/utils, not direct clsx/tailwind-merge imports',
            from: {
                path: '^apps/'
            },
            to: {
                path: '^(clsx|tailwind-merge|class-variance-authority)$',
            }
        },

        /* =========================================================
           REFINEMENT 5: No Server-Only in Client Components
           React best practice enforcement
           ========================================================= */
        {
            name: 'no-server-only-in-client',
            severity: 'warn',
            comment: 'Components with "use client" directive cannot import server-only modules',
            from: {
                path: '^packages/design-system/src/components/',
                // This is a simplified check - scripts/validate-directives.ts does full parsing
            },
            to: {
                path: '^(next/headers|next/cookies|server-only)$',
            }
        },

        /* =========================================================
           CORE RULE: No Circular Dependencies
           ========================================================= */
        {
            name: 'no-circular-dependencies',
            severity: 'error',
            comment: 'Circular dependencies cause bundle bloat and runtime issues',
            from: {},
            to: {
                circular: true
            }
        },

        /* =========================================================
           OPTIONAL WARNING: Orphan Components
           Components should be exported from index.ts
           ========================================================= */
        {
            name: 'no-orphan-components',
            severity: 'warn',
            comment: 'All components should be exported from index.ts or via subpath exports',
            from: {
                path: '^packages/design-system/src/components/[^/]+\\.tsx$'
            },
            to: {
                path: '^packages/design-system/src/index\\.ts$',
                reachable: false
            }
        },

        /* =========================================================
           PACKAGE BOUNDARIES: Apps Cannot Cross-Import
           ========================================================= */
        {
            name: 'no-app-cross-import',
            severity: 'error',
            comment: 'Apps cannot import from other apps',
            from: {
                path: '^apps/web/'
            },
            to: {
                path: '^apps/docs/'
            }
        },
        {
            name: 'no-app-cross-import-reverse',
            severity: 'error',
            comment: 'Apps cannot import from other apps',
            from: {
                path: '^apps/docs/'
            },
            to: {
                path: '^apps/web/'
            }
        },

        /* =========================================================
           PACKAGE DIRECTION: Packages Cannot Import Apps
           ========================================================= */
        {
            name: 'no-package-to-app',
            severity: 'error',
            comment: 'Shared packages cannot depend on apps (inverted dependency)',
            from: {
                path: '^packages/'
            },
            to: {
                path: '^apps/'
            }
        },
    ],

    options: {
        /* Do not follow external dependencies */
        doNotFollow: {
            path: 'node_modules',
        },

        /* Include TypeScript pre-compilation dependencies */
        tsPreCompilationDeps: true,

        /* TypeScript configuration */
        tsConfig: {
            fileName: './tsconfig.json',
        },

        /* Module systems to consider */
        moduleSystems: ['es6', 'cjs'],

        /* Output report format */
        reporterOptions: {
            dot: {
                /* Collapse patterns for cleaner graphs */
                collapsePattern: '^(packages|apps)/[^/]+',

                /* Theme (optional) */
                theme: {
                    graph: {
                        splines: 'ortho',
                        rankdir: 'TB',
                    },
                    modules: [
                        {
                            criteria: { source: '^apps/' },
                            attributes: { fillcolor: '#ffcccc', style: 'filled' },
                        },
                        {
                            criteria: { source: '^packages/design-system' },
                            attributes: { fillcolor: '#ccffcc', style: 'filled' },
                        },
                        {
                            criteria: { source: '^packages/' },
                            attributes: { fillcolor: '#ccccff', style: 'filled' },
                        },
                    ],
                },
            },
            archi: {
                /* Collapse patterns for architecture diagram */
                collapsePattern: '^(packages|apps)/[^/]+',
            },
        },

        /* Progress indicator */
        progress: {
            type: 'performance-log',
        },
    },
};
