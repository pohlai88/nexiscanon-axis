import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

/** @type {import("eslint").Linter.Config[]} */
export default tseslint.config(
  {
    ignores: [".next/**", ".turbo/**", "node_modules/**", "dist/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Disable ESLint rules that conflict with Prettier
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  }
);
