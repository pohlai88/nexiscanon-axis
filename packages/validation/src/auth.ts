import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])/;

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .min(1, "Email required");

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  )
  .regex(/[A-Z]/, "Password must contain uppercase letter")
  .regex(/[0-9]/, "Password must contain number");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required"),
});

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const emailVerificationSchema = z.object({
  email: emailSchema,
  code: z.string().min(1, "Verification code required"),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    token: z.string().min(1, "Reset token required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type OTPInput = z.infer<typeof otpSchema>;
export type EmailVerificationInput = z.infer<typeof emailVerificationSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
