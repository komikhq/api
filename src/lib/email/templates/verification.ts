export interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export function renderVerificationEmailTemplate({
  userName,
  verificationUrl,
}: VerificationEmailProps) {
  const subject = "Verifikasi Alamat Email Anda - KomikHQ";
  
  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Verifikasi Email KomikHQ</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155;">
    <h2 style="color: #38bdf8; margin-top: 0;">Selamat Datang di KomikHQ, ${userName}!</h2>
    <p style="font-size: 16px; line-height: 1.6;">Terima kasih telah mendaftar. Silakan klik tombol di bawah untuk memverifikasi alamat email Anda dan mengaktifkan akun Anda:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationUrl}" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Verifikasi Email</a>
    </div>
    <p style="font-size: 14px; color: #94a3b8;">Atau salin tautan berikut ke browser Anda:</p>
    <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">${verificationUrl}</p>
    <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748b; text-align: center;">Jika Anda tidak membuat akun di KomikHQ, silakan abaikan email ini.</p>
  </div>
</body>
</html>
  `.trim();

  const text = `Halo ${userName},\n\nTerima kasih telah mendaftar di KomikHQ. Silakan verifikasi email Anda melalui tautan berikut:\n${verificationUrl}\n\nJika Anda tidak merasa mendaftar, silakan abaikan email ini.`;

  return { subject, html, text };
}
