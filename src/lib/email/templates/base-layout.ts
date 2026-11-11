export interface BaseEmailLayoutProps {
  title: string;
  previewText: string;
  contentHtml: string;
  footerNotice?: string;
}

export function renderBaseEmailLayout({
  title,
  previewText,
  contentHtml,
  footerNotice,
}: BaseEmailLayoutProps): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; min-width: 100%; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
  <!-- Preheader preview text for inbox -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; max-width: 0px; opacity: 0;">
    ${previewText}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #09090b; min-height: 100vh;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Email Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto;">
          <!-- Header / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; font-size: 24px; font-weight: 800; letter-spacing: -0.03em; color: #f4f4f5; text-decoration: none;">
                      Komik<span style="color: #ea580c;">HQ</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.45);">
                <tr>
                  <td style="padding: 36px 32px;">
                    ${contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 32px; padding-bottom: 24px; color: #71717a; font-size: 12px; line-height: 1.6; text-align: center;">
              ${
                footerNotice
                  ? `<p style="margin: 0 0 12px; color: #71717a; font-size: 12px;">${footerNotice}</p>`
                  : ""
              }
              <p style="margin: 0; color: #52525b; font-size: 12px;">
                &copy; ${currentYear} KomikHQ. Seluruh hak cipta dilindungi undang-undang.
              </p>
              <p style="margin: 6px 0 0; color: #3f3f46; font-size: 11px;">
                Email otomatis dari sistem KomikHQ. Mohon tidak membalas email ini secara langsung.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

