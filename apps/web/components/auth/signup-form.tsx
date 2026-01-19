"use client";

import { useState } from "react";
import { useAuth } from "@workspace/auth";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@workspace/design-system";
import { signupSchema, type SignupInput } from "@workspace/validation";

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [data, setData] = useState<SignupInput>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [validationError, setValidationError] = useState<string>("");
  const { signup, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    try {
      const validated = signupSchema.parse(data);
      await signup(validated.email, validated.password);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setValidationError(err.message);
      }
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={data.confirmPassword}
              onChange={(e) =>
                setData({ ...data, confirmPassword: e.target.value })
              }
              required
            />
          </div>

          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          {error && <p className="text-sm text-destructive">{error.message}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
