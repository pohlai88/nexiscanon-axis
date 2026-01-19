"use client";

import { SignupForm } from "@/components/auth/signup-form";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <SignupForm
          onSuccess={() => {
            router.push("/login");
          }}
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-medium text-primary hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
