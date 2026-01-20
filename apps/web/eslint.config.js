import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export default tseslint.config(
  {
    ignores: [".next/**", ".turbo/**", "node_modules/**", "dist/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Disable ESLint rules that conflict with Prettier
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  // ---- API Route Handler Guard Rails ----
  // Enforces kernel-only pattern in route files
  {
    files: ["app/api/**/route.ts", "app/api/**/route.tsx"],
    rules: {
      // No console noise in route handlers
      "no-console": ["error", { allow: ["warn", "error"] }],

      // No raw response construction - use kernel only
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "NewExpression[callee.name='Response'], NewExpression[callee.name='NextResponse']",
          message:
            "Route handlers MUST NOT construct Response/NextResponse. Use kernel(spec) only.",
        },
        {
          selector:
            "CallExpression[callee.object.name='NextResponse'][callee.property.name='json']",
          message:
            "Route handlers MUST NOT call NextResponse.json(). Use kernel(spec) only.",
        },
      ],

      // Ban NextResponse import and all next/* imports in route files
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/server",
              importNames: ["NextResponse"],
              message:
                "Do not import NextResponse in route files. Kernel handles all response building.",
            },
          ],
          patterns: [
            {
              group: ["next/*"],
              message:
                "Do not import from next/* in route files. Route files are spec-only; kernel owns runtime concerns.",
            },
            {
              group: ["./*", "../*"],
              message:
                "Route files MUST NOT use relative imports. Use @workspace/* packages only.",
            },
          ],
        },
      ],
    },
  }
);
