import type { PlopTypes } from "@turbo/gen";
import { execSync } from "child_process";
import path from "path";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // Helper to convert to kebab-case
  plop.setHelper('kebabCase', (text: string) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  });

  // Helper to convert to PascalCase
  plop.setHelper('pascalCase', (text: string) => {
    return text
      .replace(/[-_\s](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toUpperCase());
  });

  plop.setGenerator("component", {
    description: "Create a new design-system component",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Component name (e.g., Button, Card):",
        validate: (input: string) => {
          if (!input) return "Component name is required";
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
            return "Component name must be PascalCase (e.g., Button, MyComponent)";
          }
          return true;
        }
      },
      {
        type: "list",
        name: "category",
        message: "Component category:",
        choices: [
          { name: "UI Component (button, card, input)", value: "ui" },
          { name: "Layout (sidebar, header, footer)", value: "layout" },
          { name: "Form (checkbox, radio, select)", value: "form" },
          { name: "Feedback (alert, toast, spinner)", value: "feedback" },
          { name: "Navigation (menu, tabs, breadcrumb)", value: "navigation" },
          { name: "Data Display (table, chart, badge)", value: "data" }
        ]
      },
      {
        type: "confirm",
        name: "hasVariants",
        message: "Use class-variance-authority (CVA) for variants?",
        default: true
      },
      {
        type: "confirm",
        name: "needsClient",
        message: "Does this component use React hooks? (will add 'use client')",
        default: false
      }
    ],
    actions: [
      // 1. Create component file
      {
        type: "add",
        path: "packages/design-system/src/components/{{kebabCase name}}.tsx",
        templateFile: "templates/component.hbs"
      },
      
      // 2. Regenerate exports
      {
        type: "custom",
        name: "Regenerate exports",
        action: async () => {
          try {
            console.log("\n🔄 Regenerating exports...");
            execSync("pnpm gen:exports", { 
              stdio: "inherit",
              cwd: process.cwd()
            });
            return "✅ Exports regenerated";
          } catch (error) {
            return `❌ Failed to regenerate exports: ${error}`;
          }
        }
      },
      
      // 3. Validate architecture
      {
        type: "custom",
        name: "Validate architecture",
        action: async () => {
          try {
            console.log("\n🔍 Validating architecture...");
            execSync("pnpm validate:architecture", { 
              stdio: "inherit",
              cwd: process.cwd()
            });
            return "✅ Architecture validated";
          } catch (error) {
            console.warn("⚠️  Architecture validation failed - please review manually");
            return "⚠️  Please run: pnpm validate:architecture";
          }
        }
      },
      
      // 4. Success message
      {
        type: "custom",
        name: "Success",
        action: () => {
          return `
✨ Component created successfully!

📁 Location: packages/design-system/src/components/{{kebabCase name}}.tsx
📦 Exports: Auto-updated in package.json and index.ts

Next steps:
1. Implement component logic
2. Test: import { {{pascalCase name}} } from '@workspace/design-system/{{kebabCase name}}'
3. Run: pnpm validate:architecture
          `.trim();
        }
      }
    ]
  });
}
