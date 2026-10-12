export interface ResetPasswordEmailProps {
  userName: string
  resetUrl: string
}

export function renderResetPasswordEmailTemplate({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  const subject = "Reset Your Password - KomikHQ"

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Password - KomikHQ</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155;">
    <h2 style="color: #f43f5e; margin-top: 0;">Reset Your KomikHQ Password</h2>
    <p style="font-size: 16px; line-height: 1.6;">Hello ${userName}, we received a request to reset the password for your KomikHQ account. Click the button below to create a new password:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 14px; color: #94a3b8;">Or copy and paste the following link into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #f43f5e;">${resetUrl}</p>
    <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748b; text-align: center;">This link is valid for a limited time. If you did not request a password reset, you can safely ignore this email.</p>
  </div>
</body>
</html>
  `.trim()

  const text = `Hello ${userName},\n\nWe received a request to reset your KomikHQ password. Use the following link to set a new password:\n${resetUrl}\n\nIf you did not request a password reset, please ignore this email.`

  return { subject, html, text }
}
