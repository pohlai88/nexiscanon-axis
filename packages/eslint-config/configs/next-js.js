import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export const nextJsConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig, // Disable ESLint rules that conflict with Prettier
  {
    ignores: [".next/**"],
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
