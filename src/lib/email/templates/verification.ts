import { renderBaseEmailLayout } from "./base-layout";

export interface VerificationEmailProps {
  userName: string;
  verificationUrl: string;
}

export function renderVerificationEmailTemplate({
  userName,
  verificationUrl,
}: VerificationEmailProps) {
  const subject = "Verifikasi Alamat Email Anda - KomikHQ";
  const previewText = `Halo ${userName}, silakan verifikasi alamat email Anda untuk mengaktifkan akun KomikHQ.`;

  const contentHtml = `
    <h1 style="color: #f4f4f5; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.35; letter-spacing: -0.02em;">
      Verifikasi Akun KomikHQ
    </h1>
    <p style="color: #d4d4d8; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
      Halo <strong style="color: #fafafa;">${userName}</strong>,
    </p>
    <p style="color: #a1a1aa; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
      Terima kasih telah bergabung dengan KomikHQ! Untuk mengamankan akun dan menikmati seluruh fitur membaca komik, silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:
    </p>

    <!-- Bulletproof CTA Button -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #ea580c;">
                <!--[if mso]>
                <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${verificationUrl}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="18%" stroke="f" fillcolor="#ea580c">
                  <w:anchorlock/>
                  <center style="color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;">Verifikasi Email</center>
                </v:roundrect>
                <![endif]-->
                <a href="${verificationUrl}" target="_blank" style="background-color: #ea580c; border: 1px solid #ea580c; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 15px; font-weight: 600; padding: 14px 32px; text-decoration: none; text-align: center; mso-hide: all;">
                  Verifikasi Email
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #27272a; margin: 28px 0;" />

    <p style="font-size: 13px; color: #71717a; margin: 0 0 8px 0; line-height: 1.5;">
      Jika tombol di atas tidak berfungsi, salin dan buka tautan berikut di browser Anda:
    </p>
    <div style="background-color: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px 14px; margin: 0 0 20px 0; word-break: break-all;">
      <a href="${verificationUrl}" target="_blank" style="color: #ea580c; font-size: 13px; text-decoration: none; line-height: 1.4;">${verificationUrl}</a>
    </div>

    <p style="font-size: 12px; color: #71717a; margin: 0; line-height: 1.5;">
      Tautan verifikasi ini bersifat sementara. Jika Anda tidak merasa mendaftar di KomikHQ, Anda dapat mengabaikan email ini dengan aman.
    </p>
  `.trim();

  const html = renderBaseEmailLayout({
    title: subject,
    previewText,
    contentHtml,
  });

  const text = `Halo ${userName},\n\nTerima kasih telah mendaftar di KomikHQ.\nSilakan klik tautan berikut untuk memverifikasi alamat email Anda:\n${verificationUrl}\n\nJika Anda tidak merasa mendaftar di KomikHQ, Anda dapat mengabaikan email ini.`;

  return { subject, html, text };
}
