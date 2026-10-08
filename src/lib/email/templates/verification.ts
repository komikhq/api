export interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export function renderVerificationEmailTemplate({
  userName,
  verificationUrl,
}: VerificationEmailProps) {
  const subject = "Verify Your Email Address - KomikHQ";
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email - KomikHQ</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155;">
    <h2 style="color: #38bdf8; margin-top: 0;">Welcome to KomikHQ, ${userName}!</h2>
    <p style="font-size: 16px; line-height: 1.6;">Thank you for signing up. Please click the button below to verify your email address and activate your account:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
    </div>
    <p style="font-size: 14px; color: #94a3b8;">Or copy and paste the following link into your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">${verificationUrl}</p>
    <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748b; text-align: center;">If you did not create an account at KomikHQ, please ignore this email.</p>
  </div>
</body>
</html>
  `.trim();

  const text = `Hello ${userName},\n\nThank you for signing up for KomikHQ. Please verify your email via the following link:\n${verificationUrl}\n\nIf you did not register, please ignore this email.`;

  return { subject, html, text };
}
