import Link from "next/link";
import { ResetPasswordForm } from "./reset-password-form";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
        <p className="text-[var(--muted-foreground)] mb-4">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-[var(--primary)] hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-center">Set New Password</h1>
      <p className="text-[var(--muted-foreground)] text-center mb-6">
        Enter your new password below
      </p>
      <ResetPasswordForm token={token} />
    </div>
  );
}
