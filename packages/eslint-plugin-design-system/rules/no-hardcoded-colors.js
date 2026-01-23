/**
 * @fileoverview Disallow hardcoded Tailwind color classes
 * @author AXIS Design System Team
 * 
 * This rule enforces the use of semantic color tokens instead of
 * hardcoded Tailwind color classes like bg-blue-500 or text-red-600.
 * 
 * @example
 * // ❌ Bad
 * <div className="bg-blue-500 text-white" />
 * 
 * // ✅ Good
 * <div className="bg-primary text-primary-foreground" />
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow hardcoded color classes (use semantic tokens)",
      category: "Design System",
      recommended: true,
    },
    messages: {
      hardcodedColor:
        "Use semantic tokens instead of '{{className}}'. Use 'bg-primary', 'text-foreground', 'border', etc.",
    },
    schema: [], // no options
  },

  create(context) {
    // Pattern matches: bg-blue-500, text-red-600, border-gray-200, etc.
    const hardcodedColorPattern =
      /\b(bg|text|border|ring|divide|outline|shadow|from|via|to|decoration)-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d{2,3}\b/

    return {
      JSXAttribute(node) {
        // Only check className attributes
        if (node.name.name !== "className") {
          return
        }

        let classNameValue = ""

        // Handle different attribute value types
        if (node.value) {
          if (node.value.type === "Literal") {
            // className="..."
            classNameValue = node.value.value
          } else if (
            node.value.type === "JSXExpressionContainer" &&
            node.value.expression.type === "Literal"
          ) {
            // className={"..."}
            classNameValue = node.value.expression.value
          } else if (
            node.value.type === "JSXExpressionContainer" &&
            node.value.expression.type === "TemplateLiteral"
          ) {
            // className={`...`}
            const quasis = node.value.expression.quasis
            classNameValue = quasis.map((q) => q.value.raw).join("")
          }
        }

        // Check for hardcoded colors
        if (classNameValue && hardcodedColorPattern.test(classNameValue)) {
          const match = classNameValue.match(hardcodedColorPattern)
          if (match) {
            context.report({
              node,
              messageId: "hardcodedColor",
              data: {
                className: match[0],
              },
            })
          }
        }
      },
    }
  },
}
