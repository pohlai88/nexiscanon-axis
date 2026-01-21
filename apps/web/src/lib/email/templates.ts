/**
 * Email templates.
 *
 * Pattern: HTML email templates with text fallbacks.
 *
 * Available templates:
 * - invitationEmail: Team invitation
 * - passwordResetEmail: Password reset link
 * - welcomeEmail: Welcome after registration
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Common email wrapper for consistent styling.
 */
function emailWrapper(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px 32px;">
        ${content}
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Team invitation email template.
 */
export function invitationEmail(params: {
  inviterName: string;
  tenantName: string;
  role: string;
  token: string;
}): { subject: string; html: string; text: string } {
  const { inviterName, tenantName, role, token } = params;
  const inviteUrl = `${BASE_URL}/invite?token=${token}`;

  const subject = `You've been invited to join ${tenantName}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <tr>
      <td style="padding: 40px 32px;">
        <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #18181b;">
          You're invited to ${tenantName}
        </h1>

        <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          <strong>${inviterName}</strong> has invited you to join <strong>${tenantName}</strong> as a <strong>${role}</strong>.
        </p>

        <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
          Click the button below to accept the invitation and get started.
        </p>

        <a href="${inviteUrl}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 500; color: #ffffff; background-color: #18181b; text-decoration: none; border-radius: 8px;">
          Accept Invitation
        </a>

        <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
          If you can't click the button, copy and paste this link into your browser:
        </p>
        <p style="margin: 8px 0 0; font-size: 14px; word-break: break-all; color: #3f3f46;">
          ${inviteUrl}
        </p>

        <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

        <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
          This invitation will expire in 7 days. If you didn't expect this email, you can safely ignore it.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const text = `
You're invited to ${tenantName}

${inviterName} has invited you to join ${tenantName} as a ${role}.

Accept the invitation by visiting:
${inviteUrl}

This invitation will expire in 7 days.

If you didn't expect this email, you can safely ignore it.
  `.trim();

  return { subject, html, text };
}

/**
 * Password reset email template.
 */
export function passwordResetEmail(params: {
  token: string;
  expiresInMinutes?: number;
}): { subject: string; html: string; text: string } {
  const { token, expiresInMinutes = 60 } = params;
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
  const subject = "Reset your password";

  const content = `
    <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #18181b;">
      Reset your password
    </h1>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      We received a request to reset your password. Click the button below to choose a new password.
    </p>

    <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      This link will expire in ${expiresInMinutes} minutes.
    </p>

    <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 500; color: #ffffff; background-color: #18181b; text-decoration: none; border-radius: 8px;">
      Reset Password
    </a>

    <p style="margin: 32px 0 0; font-size: 14px; line-height: 1.6; color: #71717a;">
      If you can't click the button, copy and paste this link into your browser:
    </p>
    <p style="margin: 8px 0 0; font-size: 14px; word-break: break-all; color: #3f3f46;">
      ${resetUrl}
    </p>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

    <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
    </p>
  `;

  const html = emailWrapper(content, subject);

  const text = `
Reset your password

We received a request to reset your password. Visit the link below to choose a new password:

${resetUrl}

This link will expire in ${expiresInMinutes} minutes.

If you didn't request a password reset, you can safely ignore this email.
  `.trim();

  return { subject, html, text };
}

/**
 * Welcome email template.
 */
export function welcomeEmail(params: {
  userName: string;
  tenantName?: string;
}): { subject: string; html: string; text: string } {
  const { userName, tenantName } = params;
  const dashboardUrl = tenantName
    ? `${BASE_URL}/${tenantName.toLowerCase().replace(/\s+/g, "-")}`
    : `${BASE_URL}/onboarding`;

  const subject = "Welcome to AXIS";

  const content = `
    <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #18181b;">
      Welcome to AXIS${tenantName ? `, ${userName}!` : "!"}
    </h1>

    <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      ${tenantName
        ? `Your workspace <strong>${tenantName}</strong> is ready to go.`
        : "Thanks for signing up! You're all set to get started."
      }
    </p>

    <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #3f3f46;">
      ${tenantName
        ? "Click below to access your dashboard and start managing your business."
        : "Click below to create your first workspace and start managing your business."
      }
    </p>

    <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 500; color: #ffffff; background-color: #18181b; text-decoration: none; border-radius: 8px;">
      ${tenantName ? "Go to Dashboard" : "Get Started"}
    </a>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e4e4e7;">

    <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
      Need help? Reply to this email or check out our documentation.
    </p>
  `;

  const html = emailWrapper(content, subject);

  const text = `
Welcome to AXIS${tenantName ? `, ${userName}!` : "!"}

${tenantName
    ? `Your workspace "${tenantName}" is ready to go.`
    : "Thanks for signing up! You're all set to get started."
  }

Visit your dashboard:
${dashboardUrl}

Need help? Reply to this email or check out our documentation.
  `.trim();

  return { subject, html, text };
}
