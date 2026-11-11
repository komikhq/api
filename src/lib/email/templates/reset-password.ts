import { renderBaseEmailLayout } from "./base-layout";

export interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

export function renderResetPasswordEmailTemplate({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) {
  const subject = "Atur Ulang Kata Sandi - KomikHQ";
  const previewText = `Halo ${userName}, gunakan tautan ini untuk mengatur ulang kata sandi akun KomikHQ Anda.`;

  const contentHtml = `
    <h1 style="color: #f4f4f5; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.35; letter-spacing: -0.02em;">
      Atur Ulang Kata Sandi
    </h1>
    <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
      Halo <strong style="color: #fafafa;">${userName}</strong>,
    </p>
    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
      Kami menerima permintaan untuk mengatur ulang kata sandi akun KomikHQ Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:
    </p>

    <!-- Bulletproof CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0 28px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #ea580c;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="18%" stroke="f" fillcolor="#ea580c">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Atur Ulang Kata Sandi</center>
                </v:roundrect>
                <![endif]-->
                <a href="${resetUrl}" target="_blank" style="background-color: #ea580c; border: 1px solid #ea580c; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 15px; font-weight: 600; padding: 14px 32px; text-decoration: none; text-align: center; mso-hide: all;">
                  Atur Ulang Kata Sandi
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Security Warning Notice Box -->
    <div style="background-color: rgba(234, 88, 12, 0.08); border: 1px solid rgba(234, 88, 12, 0.25); border-radius: 8px; padding: 14px 16px; margin: 24px 0;">
      <p style="color: #fdba74; font-size: 13px; line-height: 1.5; margin: 0;">
        <strong>Perhatian Keamanan:</strong> Tautan ini hanya berlaku untuk waktu terbatas. Jangan pernah membagikan tautan ini kepada orang lain.
      </p>
    </div>

    <hr style="border: none; border-top: 1px solid #27272a; margin: 28px 0;" />

    <p style="font-size: 13px; color: #71717a; margin: 0 0 8px 0; line-height: 1.5;">
      Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:
    </p>
    <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px 14px; margin: 0 0 20px 0; word-break: break-all;">
      <a href="${resetUrl}" target="_blank" style="color: #ea580c; font-size: 13px; text-decoration: none; line-height: 1.4;">${resetUrl}</a>
    </div>

    <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.5;">
      Jika Anda tidak pernah meminta pengaturan ulang kata sandi, mohon abaikan email ini. Akun Anda tetap aman.
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    title: subject,
    previewText,
    contentHtml,
  });

  const text = `Halo ${userName},\n\nKami menerima permintaan untuk mengatur ulang kata sandi akun KomikHQ Anda.\nSilakan gunakan tautan berikut untuk membuat kata sandi baru:\n${resetUrl}\n\nTautan ini bersifat rahasia dan hanya berlaku untuk waktu terbatas. Jika Anda tidak meminta pengaturan ulang kata sandi, abaikan email ini.`;

  return { subject, html, text };
}
