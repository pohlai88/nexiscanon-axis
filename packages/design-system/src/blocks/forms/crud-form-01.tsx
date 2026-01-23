"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/card"
import { Input } from "../../components/input"
import { Textarea } from "../../components/textarea"
import { Label } from "../../components/label"
import { Button } from "../../components/button"
import { cn } from "../../lib/utils"

export interface CrudFormField {
  name: string
  label: string
  type?: "text" | "email" | "number" | "textarea" | "password"
  placeholder?: string
  description?: string
  required?: boolean
  value?: string | number
}

export interface CrudForm01Props {
  fields: CrudFormField[]
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>
  onCancel?: () => void
  title?: string
  description?: string
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  className?: string
}

export function CrudForm01({
  fields,
  onSubmit,
  onCancel,
  title = "Create New Item",
  description,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  isLoading = false,
  className,
}: CrudForm01Props) {
  const [formData, setFormData] = React.useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {}
    fields.forEach((field) => {
      initial[field.name] = field.value || ""
    })
    return initial
  })

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
              {field.description && (
                <p className="text-sm text-muted-foreground">
                  {field.description}
                </p>
              )}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : submitLabel}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
