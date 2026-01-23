import Link from "next/link";
import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; reset?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirect, reset } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      
      {reset === "success" && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm text-center">
          Password reset successful. Please sign in with your new password.
        </div>
      )}
      
      <LoginForm redirectTo={redirect} />
      
      <div className="mt-4 text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          Forgot your password?
        </Link>
      </div>
      
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-primary hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
