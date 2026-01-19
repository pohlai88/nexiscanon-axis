"use client";

import { LoginForm } from "@/components/auth/login-form";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
      <div className="w-full max-w-md">
        <LoginForm
          onSuccess={() => {
            router.push("/");
          }}
        />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
