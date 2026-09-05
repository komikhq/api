export interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export function renderResetPasswordEmailTemplate({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  const subject = "Atur Ulang Kata Sandi - KomikHQ";

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Reset Password KomikHQ</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 32px; border-radius: 12px; border: 1px solid #334155;">
    <h2 style="color: #f43f5e; margin-top: 0;">Reset Kata Sandi KomikHQ</h2>
    <p style="font-size: 16px; line-height: 1.6;">Halo ${userName}, kami menerima permintaan untuk mengatur ulang kata sandi akun KomikHQ Anda. Klik tombol di bawah untuk membuat kata sandi baru:</p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetUrl}" style="background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Kata Sandi</a>
    </div>
    <p style="font-size: 14px; color: #94a3b8;">Atau salin tautan berikut ke browser Anda:</p>
    <p style="font-size: 12px; word-break: break-all; color: #f43f5e;">${resetUrl}</p>
    <hr style="border: none; border-top: 1px solid #334155; margin: 32px 0;" />
    <p style="font-size: 12px; color: #64748b; text-align: center;">Tautan ini berlaku terbatas. Jika Anda tidak meminta reset kata sandi, abaikan email ini secara aman.</p>
  </div>
</body>
</html>
  `.trim();

  const text = `Halo ${userName},\n\nKami menerima permintaan reset kata sandi KomikHQ Anda. Gunakan tautan berikut untuk membuat kata sandi baru:\n${resetUrl}\n\nJika Anda tidak meminta reset kata sandi, abaikan email ini.`;

  return { subject, html, text };
}
