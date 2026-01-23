import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
      <p className="text-muted-foreground text-center mb-6">
        Enter your email and we'll send you a reset link
      </p>
      <ForgotPasswordForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
