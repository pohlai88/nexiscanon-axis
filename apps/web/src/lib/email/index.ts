/**
 * Email service using Resend.
 *
 * Pattern: Centralized email sending with templates.
 */

import { Resend } from "resend";
import { logger } from "../logger";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "AXIS <noreply@nexuscanon.com>";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Email template types for notification system.
 */
export type EmailTemplate =
  | "team-invite"
  | "payment-failed"
  | "password-changed"
  | "password-reset"
  | "welcome"
  | "trial-ending";

/**
 * Send an email via Resend.
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  if (!process.env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not configured, skipping email");
    return { success: false, error: "Email service not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      logger.error("Email send error", { error: error.message });
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    logger.error("Email service error", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
