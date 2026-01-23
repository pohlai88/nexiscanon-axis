"use client"

/**
 * Predictive Form - Cobalt Kernel Component
 *
 * AI-powered form with autofill suggestions and validation.
 * Implements A01-CANONICAL.md §4 — "Predict, don't ask"
 *
 * Features:
 * - Smart field suggestions based on context
 * - Autofill from previous entries
 * - Real-time validation
 * - Confidence indicators
 * - One-click acceptance
 *
 * @example
 * ```tsx
 * import { PredictiveForm } from "@workspace/design-system"
 *
 * <PredictiveForm
 *   fields={formFields}
 *   predictions={aiPredictions}
 *   onSubmit={handleSubmit}
 *   onAcceptPrediction={(fieldId, value) => acceptValue(fieldId, value)}
 * />
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/card"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Textarea } from "@/components/textarea"
import { Badge } from "@/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip"
import { Progress } from "@/components/progress"
import {
  Sparkles,
  Check,
  X,
  AlertCircle,
  Loader2,
  Brain,
  History,
  Zap,
  ChevronRight,
} from "lucide-react"

// ============================================================================
// Types
// ============================================================================

export type FieldType = "text" | "number" | "email" | "date" | "select" | "textarea" | "currency"

export interface FieldOption {
  value: string
  label: string
}

export interface FieldPrediction {
  value: string
  confidence: number // 0-100
  source: "ai" | "history" | "default" | "calculated"
  explanation?: string
}

export interface FormField {
  id: string
  name: string
  label: string
  type: FieldType
  placeholder?: string
  required?: boolean
  options?: FieldOption[] // For select fields
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  dependencies?: string[] // Field IDs this field depends on
}

export interface PredictiveFormProps {
  /** Form title */
  title?: string
  /** Form description */
  description?: string
  /** Form fields configuration */
  fields: FormField[]
  /** AI/historical predictions for each field */
  predictions?: Record<string, FieldPrediction>
  /** Current field values */
  values?: Record<string, string>
  /** Submit callback */
  onSubmit?: (values: Record<string, string>) => Promise<void>
  /** Accept prediction callback */
  onAcceptPrediction?: (fieldId: string, value: string) => void
  /** Reject prediction callback */
  onRejectPrediction?: (fieldId: string) => void
  /** Request new prediction callback */
  onRequestPrediction?: (fieldId: string, context: Record<string, string>) => Promise<FieldPrediction | null>
  /** Loading state */
  isLoading?: boolean
  /** Submit button text */
  submitText?: string
  /** Show confidence indicators */
  showConfidence?: boolean
  /** Auto-accept predictions above this confidence threshold */
  autoAcceptThreshold?: number
  /** Custom className */
  className?: string
}

// ============================================================================
// Helper Components
// ============================================================================

function ConfidenceBadge({ confidence, source }: { confidence: number; source: string }) {
  const getColor = () => {
    if (confidence >= 90) return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    if (confidence >= 70) return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    if (confidence >= 50) return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  }

  const getIcon = () => {
    switch (source) {
      case "ai":
        return <Brain className="h-3 w-3" />
      case "history":
        return <History className="h-3 w-3" />
      case "calculated":
        return <Zap className="h-3 w-3" />
      default:
        return <Sparkles className="h-3 w-3" />
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              getColor()
            )}
          >
            {getIcon()}
            {confidence}%
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {source === "ai" && "AI-generated suggestion"}
            {source === "history" && "Based on previous entries"}
            {source === "calculated" && "Calculated from other fields"}
            {source === "default" && "Default value"}
          </p>
          <p className="text-xs text-muted-foreground">Confidence: {confidence}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function PredictionSuggestion({
  prediction,
  onAccept,
  onReject,
  showConfidence,
}: {
  prediction: FieldPrediction
  onAccept: () => void
  onReject: () => void
  showConfidence: boolean
}) {
  return (
    <div className="mt-1 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5">
      <Sparkles className="h-3 w-3 text-primary shrink-0" />
      <span className="flex-1 text-sm truncate">{prediction.value}</span>
      {showConfidence && (
        <ConfidenceBadge confidence={prediction.confidence} source={prediction.source} />
      )}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-green-100 hover:text-green-700"
          onClick={onAccept}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-700"
          onClick={onReject}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Field Renderers
// ============================================================================

interface FieldRendererProps {
  field: FormField
  value: string
  onChange: (value: string) => void
  prediction?: FieldPrediction
  onAcceptPrediction?: () => void
  onRejectPrediction?: () => void
  showConfidence: boolean
  error?: string
}

function FieldRenderer({
  field,
  value,
  onChange,
  prediction,
  onAcceptPrediction,
  onRejectPrediction,
  showConfidence,
  error,
}: FieldRendererProps) {
  const showPrediction = prediction && !value && onAcceptPrediction && onRejectPrediction

  const commonInputClass = cn(
    "transition-all",
    prediction && !value && "border-primary/50 bg-primary/5"
  )

  const renderInput = () => {
    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            id={field.id}
            name={field.name}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonInputClass}
            rows={3}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={commonInputClass}>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "currency":
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id={field.id}
              name={field.name}
              type="number"
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className={cn(commonInputClass, "pl-7")}
              min={field.validation?.min}
              max={field.validation?.max}
              step="0.01"
            />
          </div>
        )

      default:
        return (
          <Input
            id={field.id}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={commonInputClass}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        )
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={field.id} className="flex items-center gap-2">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
        {prediction && value === prediction.value && (
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            AI-filled
          </Badge>
        )}
      </Label>
      {renderInput()}
      {showPrediction && (
        <PredictionSuggestion
          prediction={prediction}
          onAccept={onAcceptPrediction}
          onReject={onRejectPrediction}
          showConfidence={showConfidence}
        />
      )}
      {error && (
        <p className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function PredictiveForm({
  title,
  description,
  fields,
  predictions = {},
  values: initialValues = {},
  onSubmit,
  onAcceptPrediction,
  onRejectPrediction,
  onRequestPrediction,
  isLoading = false,
  submitText = "Submit",
  showConfidence = true,
  autoAcceptThreshold = 95,
  className,
}: PredictiveFormProps) {
  const [values, setValues] = React.useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [dismissedPredictions, setDismissedPredictions] = React.useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Auto-accept high-confidence predictions
  React.useEffect(() => {
    if (autoAcceptThreshold > 0) {
      Object.entries(predictions).forEach(([fieldId, prediction]) => {
        if (
          prediction.confidence >= autoAcceptThreshold &&
          !values[fieldId] &&
          !dismissedPredictions.has(fieldId)
        ) {
          handleAcceptPrediction(fieldId, prediction.value)
        }
      })
    }
  }, [predictions, autoAcceptThreshold])

  const handleChange = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[fieldId]
        return next
      })
    }
  }

  const handleAcceptPrediction = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    onAcceptPrediction?.(fieldId, value)
  }

  const handleRejectPrediction = (fieldId: string) => {
    setDismissedPredictions((prev) => new Set([...prev, fieldId]))
    onRejectPrediction?.(fieldId)
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = values[field.id] || ""

      if (field.required && !value.trim()) {
        newErrors[field.id] = `${field.label} is required`
        return
      }

      if (field.validation) {
        if (field.type === "number" || field.type === "currency") {
          const numValue = parseFloat(value)
          if (field.validation.min !== undefined && numValue < field.validation.min) {
            newErrors[field.id] = field.validation.message || `Minimum value is ${field.validation.min}`
          }
          if (field.validation.max !== undefined && numValue > field.validation.max) {
            newErrors[field.id] = field.validation.message || `Maximum value is ${field.validation.max}`
          }
        }

        if (field.validation.pattern) {
          const regex = new RegExp(field.validation.pattern)
          if (!regex.test(value)) {
            newErrors[field.id] = field.validation.message || "Invalid format"
          }
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit?.(values)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate overall prediction acceptance
  const totalPredictions = Object.keys(predictions).length
  const acceptedPredictions = Object.entries(predictions).filter(
    ([fieldId, pred]) => values[fieldId] === pred.value
  ).length
  const predictionProgress = totalPredictions > 0 ? (acceptedPredictions / totalPredictions) * 100 : 0

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prediction Progress */}
      {totalPredictions > 0 && (
        <div className="rounded-lg bg-muted/50 p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="font-medium">AI Predictions</span>
            </div>
            <span className="text-muted-foreground">
              {acceptedPredictions}/{totalPredictions} accepted
            </span>
          </div>
          <Progress value={predictionProgress} className="h-1.5" />
        </div>
      )}

      {/* Form Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const prediction = !dismissedPredictions.has(field.id) ? predictions[field.id] : undefined
          return (
            <div
              key={field.id}
              className={cn(field.type === "textarea" && "md:col-span-2")}
            >
              <FieldRenderer
                field={field}
                value={values[field.id] || ""}
                onChange={(value) => handleChange(field.id, value)}
                prediction={prediction}
                onAcceptPrediction={() =>
                  prediction && handleAcceptPrediction(field.id, prediction.value)
                }
                onRejectPrediction={() => handleRejectPrediction(field.id)}
                showConfidence={showConfidence}
                error={errors[field.id]}
              />
            </div>
          )
        })}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2 pt-4">
        {totalPredictions > acceptedPredictions && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              Object.entries(predictions).forEach(([fieldId, pred]) => {
                if (!values[fieldId] && !dismissedPredictions.has(fieldId)) {
                  handleAcceptPrediction(fieldId, pred.value)
                }
              })
            }}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Accept All Suggestions
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isLoading}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {submitText}
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )

  if (title || description) {
    return (
      <Card className={className}>
        <CardHeader>
          {title && (
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
          )}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{formContent}</CardContent>
      </Card>
    )
  }

  return <div className={className}>{formContent}</div>
}

// ============================================================================
// Preset Form Configurations
// ============================================================================

export const INVOICE_FORM_FIELDS: FormField[] = [
  { id: "customer", name: "customer", label: "Customer", type: "select", required: true, options: [] },
  { id: "invoice_date", name: "invoice_date", label: "Invoice Date", type: "date", required: true },
  { id: "due_date", name: "due_date", label: "Due Date", type: "date", required: true },
  { id: "po_number", name: "po_number", label: "PO Number", type: "text" },
  { id: "amount", name: "amount", label: "Amount", type: "currency", required: true },
  { id: "description", name: "description", label: "Description", type: "textarea" },
]

export const PURCHASE_ORDER_FIELDS: FormField[] = [
  { id: "supplier", name: "supplier", label: "Supplier", type: "select", required: true, options: [] },
  { id: "order_date", name: "order_date", label: "Order Date", type: "date", required: true },
  { id: "delivery_date", name: "delivery_date", label: "Expected Delivery", type: "date" },
  { id: "ship_to", name: "ship_to", label: "Ship To", type: "select", options: [] },
  { id: "total", name: "total", label: "Order Total", type: "currency", required: true },
  { id: "notes", name: "notes", label: "Notes", type: "textarea" },
]

export const EXPENSE_FORM_FIELDS: FormField[] = [
  { id: "category", name: "category", label: "Category", type: "select", required: true, options: [
    { value: "travel", label: "Travel" },
    { value: "meals", label: "Meals & Entertainment" },
    { value: "supplies", label: "Office Supplies" },
    { value: "software", label: "Software & Subscriptions" },
    { value: "other", label: "Other" },
  ]},
  { id: "date", name: "date", label: "Expense Date", type: "date", required: true },
  { id: "amount", name: "amount", label: "Amount", type: "currency", required: true },
  { id: "merchant", name: "merchant", label: "Merchant/Vendor", type: "text" },
  { id: "description", name: "description", label: "Description", type: "textarea", required: true },
]

// ============================================================================
// Exports
// ============================================================================

export type { FieldType, FieldOption, FieldPrediction, FormField }
