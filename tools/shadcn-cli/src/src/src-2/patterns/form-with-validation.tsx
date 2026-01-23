/**
 * Form with Validation Pattern
 *
 * Reference implementation showing:
 * - Proper cn() usage for conditional styling
 * - Form validation with error display
 * - Semantic color tokens for error states
 * - Accessible form structure
 *
 * Usage: Copy relevant patterns to your form components
 */

'use client';

import { Button, Input, Label, Card } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function FormWithValidationPattern() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormData, boolean>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateField = (
    field: keyof FormData,
    value: string,
  ): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return 'Invalid email format';
        break;
      case 'phone':
        if (value && !/^\d{10,}$/.test(value.replace(/\D/g, '')))
          return 'Invalid phone number';
        break;
      case 'message':
        if (!value.trim()) return 'Message is required';
        if (value.length < 10) return 'Message must be at least 10 characters';
        break;
    }
    return undefined;
  };

  // Handle field change
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Validate on change if field was touched
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // Handle field blur
  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      phone: true,
      message: true,
    });

    // If no errors, submit
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Form submitted:', formData);
        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTouched({});
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <p className="text-muted-foreground">
          Fill out the form below and we'll get back to you
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={cn(
              'transition-colors duration-200',
              touched.name && errors.name && 'border-destructive',
            )}
            placeholder="John Doe"
            aria-invalid={touched.name && !!errors.name}
            aria-describedby={
              touched.name && errors.name ? 'name-error' : undefined
            }
          />
          {touched.name && errors.name && (
            <p
              id="name-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={cn(
              'transition-colors duration-200',
              touched.email && errors.email && 'border-destructive',
            )}
            placeholder="john@example.com"
            aria-invalid={touched.email && !!errors.email}
            aria-describedby={
              touched.email && errors.email ? 'email-error' : undefined
            }
          />
          {touched.email && errors.email && (
            <p
              id="email-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Field (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={cn(
              'transition-colors duration-200',
              touched.phone && errors.phone && 'border-destructive',
            )}
            placeholder="+1 (555) 000-0000"
            aria-invalid={touched.phone && !!errors.phone}
            aria-describedby={
              touched.phone && errors.phone ? 'phone-error' : undefined
            }
          />
          {touched.phone && errors.phone && (
            <p
              id="phone-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {errors.phone}
            </p>
          )}
        </div>

        {/* Message Field */}
        <div className="space-y-2">
          <Label htmlFor="message">
            Message <span className="text-destructive">*</span>
          </Label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            className={cn(
              'border-border bg-background flex min-h-[120px] w-full rounded-md border px-3 py-2 text-sm',
              'transition-colors duration-200',
              'placeholder:text-muted-foreground',
              'focus-visible:ring-primary focus-visible:ring-2 focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              touched.message && errors.message && 'border-destructive',
            )}
            placeholder="Tell us how we can help..."
            aria-invalid={touched.message && !!errors.message}
            aria-describedby={
              touched.message && errors.message ? 'message-error' : undefined
            }
          />
          {touched.message && errors.message && (
            <p
              id="message-error"
              className="text-destructive text-sm"
              role="alert"
            >
              {errors.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({ name: '', email: '', phone: '', message: '' });
              setErrors({});
              setTouched({});
            }}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
