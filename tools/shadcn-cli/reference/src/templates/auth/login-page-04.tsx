/**
 * Login Page Template 04
 *
 * Shadcn login-04 inspired template with:
 * - Split layout (form + image)
 * - Modern card design
 * - Social auth options
 * - Email/password form
 *
 * Usage: Copy to apps/[app]/app/login/page.tsx and customize
 */

'use client';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  Input,
} from '@workspace/design-system';
import { cn } from '@workspace/design-system/lib/utils';
import { useState } from 'react';

export default function LoginPage04() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log('Login:', { email, password });
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card>
          <div className="grid md:grid-cols-2">
            {/* Form Section */}
            <div className="p-6 md:p-8">
              <CardHeader className="px-0">
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                  Enter your email to sign in to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0">
                <form onSubmit={handleSubmit}>
                  <FieldGroup>
                    <Field>
                      <Button
                        variant="outline"
                        type="button"
                        className="w-full"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="mr-2 h-4 w-4"
                        >
                          <path
                            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                            fill="currentColor"
                          />
                        </svg>
                        Continue with Google
                      </Button>
                    </Field>
                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                      Or continue with
                    </FieldSeparator>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          'transition-all duration-200',
                          errors.email && 'border-destructive',
                        )}
                        required
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm">
                          {errors.email}
                        </p>
                      )}
                    </Field>
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <a
                          href="#"
                          className="text-primary ml-auto inline-block text-sm underline-offset-4 transition-colors duration-200 hover:underline"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={cn(
                          'transition-all duration-200',
                          errors.password && 'border-destructive',
                        )}
                        required
                      />
                      {errors.password && (
                        <p className="text-destructive text-sm">
                          {errors.password}
                        </p>
                      )}
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full">
                        Sign In
                      </Button>
                      <p className="text-muted-foreground text-center text-sm">
                        Don't have an account?{' '}
                        <a
                          href="#"
                          className="text-primary transition-colors duration-200 hover:underline"
                        >
                          Sign up
                        </a>
                      </p>
                    </Field>
                  </FieldGroup>
                </form>
              </CardContent>
            </div>

            {/* Image Section */}
            <div className="bg-muted/50 hidden md:block">
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <div className="bg-primary/10 mb-4 inline-flex size-16 items-center justify-center rounded-full">
                    <svg
                      className="text-primary h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">Secure Login</h3>
                  <p className="text-muted-foreground text-sm">
                    Your account is protected with enterprise-grade security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
