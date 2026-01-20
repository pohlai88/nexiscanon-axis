// apps/web/components/auth/enhanced-login-form.tsx
// Enhanced Login form - Tailwind v4 + Framer Motion + Stunning Effects
//
// FEATURES:
// - Solaris morphing theme transitions
// - Shimmer button effects
// - Floating animated inputs
// - Spotlight card with glow tracking
// - 3D hover effects

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@workspace/auth";
import {
  ShimmerButton,
  FloatingInput,
  SpotlightCard,
  Separator,
} from "@workspace/design-system";
import { loginSchema, type LoginInput } from "@workspace/validation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

interface EnhancedLoginFormProps {
  onSuccess?: () => void;
  showOAuth?: boolean;
}

export function EnhancedLoginForm({ onSuccess, showOAuth = true }: EnhancedLoginFormProps) {
  const [data, setData] = useState<LoginInput>({ email: "", password: "" });
  const [validationError, setValidationError] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const neonAuthUrl = process.env.NEXT_PUBLIC_NEON_AUTH_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    try {
      const validated = loginSchema.parse(data);
      await login(validated.email, validated.password);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error) {
        setValidationError(err.message);
      }
    }
  };

  const handleOAuthSignIn = (provider: "google" | "github") => {
    if (!neonAuthUrl) {
      setValidationError("OAuth not configured");
      return;
    }

    const callbackUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${neonAuthUrl}/api/auth/sign-in/social?provider=${provider}&callbackURL=${callbackUrl}`;
  };

  return (
    <SpotlightCard className="w-full max-w-md p-8">
      {/* Header with gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h2 className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-3xl font-bold text-transparent">
          Welcome Back
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to continue to your account
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input with Icon */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground z-10" />
          <FloatingInput
            id="email"
            type="email"
            label="Email Address"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
            className="pl-10"
            error={validationError && !data.email ? "Email is required" : undefined}
          />
        </motion.div>

        {/* Password Input with Toggle */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground z-10" />
          <FloatingInput
            id="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
            className="pl-10 pr-10"
            error={validationError && !data.password ? "Password is required" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </motion.div>

        {/* Error Messages */}
        <AnimatePresence>
          {(validationError || error) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {validationError || error?.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ShimmerButton
            type="submit"
            disabled={isLoading}
            className="w-full"
            shimmerColor="rgba(255, 255, 255, 0.5)"
            background="linear-gradient(135deg, var(--primary) 0%, var(--primary-foreground) 100%)"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 rounded-full border-2 border-current border-t-transparent"
              />
            ) : (
              "Sign In"
            )}
          </ShimmerButton>
        </motion.div>
      </form>

      {/* OAuth Section */}
      {showOAuth && neonAuthUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-background/80 hover:shadow-lg hover:shadow-primary/5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </motion.button>

            <motion.button
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-lg border border-border/50 bg-background/50 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-all hover:border-primary/50 hover:bg-background/80 hover:shadow-lg hover:shadow-primary/5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              GitHub
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent blur-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </SpotlightCard>
  );
}
