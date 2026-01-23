/**
 * @fileoverview Custom ESLint plugin for AXIS Design System enforcement
 * @author AXIS Design System Team
 * 
 * This plugin enforces design system consistency rules:
 * - no-hardcoded-colors: Use semantic tokens instead of Tailwind color classes
 * - no-template-literals-in-classname: Use cn() utility for className merging
 */

const noHardcodedColors = require("./rules/no-hardcoded-colors")
const noTemplateLiteralsInClassname = require("./rules/no-template-literals-in-classname")

module.exports = {
  rules: {
    "no-hardcoded-colors": noHardcodedColors,
    "no-template-literals-in-classname": noTemplateLiteralsInClassname,
  },
  configs: {
    recommended: {
      plugins: ["design-system"],
      rules: {
        "design-system/no-hardcoded-colors": "error",
        "design-system/no-template-literals-in-classname": "error",
      },
    },
  },
}
