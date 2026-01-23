/**
 * @fileoverview Enforce cn() utility for className merging
 * @author AXIS Design System Team
 * 
 * This rule enforces the use of the cn() utility function for
 * merging class names instead of template literals or string concatenation.
 * 
 * @example
 * // ❌ Bad
 * <div className={`base ${active ? 'active' : ''}`} />
 * <div className={"base " + (active ? "active" : "")} />
 * 
 * // ✅ Good
 * <div className={cn("base", active && "active")} />
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce cn() utility for className merging instead of template literals",
      category: "Design System",
      recommended: true,
    },
    messages: {
      useClnUtil:
        "Use cn() utility for className merging instead of template literals. Example: className={cn('base', condition && 'conditional')}",
    },
    schema: [], // no options
  },

  create(context) {
    return {
      JSXAttribute(node) {
        // Only check className attributes
        if (node.name.name !== "className") {
          return
        }

        // Check if value is a template literal
        if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "TemplateLiteral"
        ) {
          // Allow if it's calling cn() with template literal
          const parent = node.value.expression.parent
          if (
            parent &&
            parent.type === "CallExpression" &&
            parent.callee.name === "cn"
          ) {
            return // This is okay
          }

          // Report violation
          context.report({
            node,
            messageId: "useClnUtil",
          })
        }

        // Check for string concatenation
        if (
          node.value &&
          node.value.type === "JSXExpressionContainer" &&
          node.value.expression.type === "BinaryExpression" &&
          node.value.expression.operator === "+"
        ) {
          context.report({
            node,
            messageId: "useClnUtil",
          })
        }
      },
    }
  },
}
