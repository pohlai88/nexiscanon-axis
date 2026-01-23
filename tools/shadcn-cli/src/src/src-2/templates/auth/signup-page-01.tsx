/**
 * Signup Page Template 01
 *
 * Multi-step signup page with:
 * - Step indicator
 * - Form validation
 * - Progress tracking
 * - Social auth option
 *
 * Usage: Copy to apps/[app]/app/signup/page.tsx and customize
 */

'use client';

import { Button, Card, Input, Label } from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import { Github, Mail, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Step = 1 | 2 | 3;

const steps = [
  { id: 1, name: 'Account', description: 'Create your account' },
  { id: 2, name: 'Profile', description: 'Complete your profile' },
  { id: 3, name: 'Verify', description: 'Verify your email' },
];

export default function SignupPage01() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    company: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNextStep = () => {
    // Validate current step
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.email) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }

    if (currentStep === 2) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (currentStep < 3) {
        setCurrentStep((currentStep + 1) as Step);
      } else {
        console.log('Sign up:', formData);
        // Implement signup logic
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Create your account</h1>
          <p className="text-muted-foreground">
            Get started with your free account
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2',
                      'transition-all duration-300',
                      currentStep > step.id &&
                        'border-primary bg-primary text-primary-foreground',
                      currentStep === step.id && 'border-primary text-primary',
                      currentStep < step.id &&
                        'border-border text-muted-foreground',
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">{step.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1',
                      'transition-colors duration-300',
                      currentStep > step.id ? 'bg-primary' : 'bg-border',
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Social Signup (Step 1 only) */}
        {currentStep === 1 && (
          <>
            <div className="mb-6 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => console.log('GitHub signup')}
              >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => console.log('Google signup')}
              >
                <Mail className="mr-2 h-5 w-5" />
                Continue with Google
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="border-border w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card text-muted-foreground px-2">
                  Or continue with email
                </span>
              </div>
            </div>
          </>
        )}

        {/* Form Steps */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={cn(errors.email && 'border-destructive')}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={cn(errors.password && 'border-destructive')}
                />
                {errors.password && (
                  <p className="text-destructive text-sm">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={cn(errors.confirmPassword && 'border-destructive')}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={cn(errors.fullName && 'border-destructive')}
                />
                {errors.fullName && (
                  <p className="text-destructive text-sm">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="bg-primary/10 mb-6 inline-flex rounded-full p-4">
                <Mail className="text-primary h-12 w-12" />
              </div>
              <h2 className="mb-2 text-xl font-bold">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a verification link to{' '}
                <span className="text-foreground font-medium">
                  {formData.email}
                </span>
              </p>
              <p className="text-muted-foreground text-sm">
                Didn't receive the email?{' '}
                <button className="text-primary hover:underline">Resend</button>
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between gap-4">
          {currentStep > 1 && currentStep < 3 && (
            <Button variant="outline" onClick={handlePreviousStep}>
              Previous
            </Button>
          )}
          {currentStep < 3 && (
            <Button
              onClick={handleNextStep}
              className={cn(currentStep === 1 && 'w-full')}
            >
              {currentStep === 2 ? 'Complete Signup' : 'Next'}
            </Button>
          )}
        </div>

        {/* Sign In Link */}
        {currentStep === 1 && (
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{' '}
            </span>
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}
