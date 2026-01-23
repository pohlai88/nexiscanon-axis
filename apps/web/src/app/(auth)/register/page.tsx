import Link from "next/link";
import { RegisterForm } from "./register-form";

interface RegisterPageProps {
  searchParams: Promise<{ invite?: string; email?: string }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const { invite, email } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
      {invite && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 text-center">
          You've been invited to join an organization. Complete registration to accept.
        </div>
      )}
      <RegisterForm inviteToken={invite} prefillEmail={email} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link 
          href={invite ? `/login?redirect=/invite?token=${invite}` : "/login"} 
          className="text-primary hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
