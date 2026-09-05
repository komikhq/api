export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailBindings {
  EMAIL_PROVIDER?: string;
  EMAIL_FROM?: string;
  RESEND_API_KEY?: string;
  BREVO_API_KEY?: string;
  EMAIL?: {
    send: (msg: { to: string; from: string; subject: string; html: string; text?: string }) => Promise<void>;
  };
}

export async function sendEmail(env: EmailBindings, options: SendEmailOptions): Promise<boolean> {
  const provider = env.EMAIL_PROVIDER || "resend";
  const from = env.EMAIL_FROM || "KomikHQ <no-reply@komikhq.com>";

  switch (provider.toLowerCase()) {
    case "resend": {
      if (!env.RESEND_API_KEY) {
        console.error(`[Email Service] Missing RESEND_API_KEY environment variable. Unable to dispatch email to ${options.to}`);
        throw new Error("Failed to send email: server environment unconfigured.");
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Email Service] Resend API returned status ${res.status}: ${errText}`);
        throw new Error("Failed to send email via provider API.");
      }
      console.log(`[Email Service] Email successfully dispatched to ${options.to}`);
      return true;
    }

    case "brevo": {
      if (!env.BREVO_API_KEY) {
        throw new Error("Missing BREVO_API_KEY environment variable.");
      }
      const senderEmail = from.includes("<")
        ? from.split("<")[1].replace(">", "").trim()
        : from;
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { email: senderEmail, name: "KomikHQ" },
          to: [{ email: options.to }],
          subject: options.subject,
          htmlContent: options.html,
          textContent: options.text,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Brevo API dispatch failed: ${errText}`);
      }
      return true;
    }

    case "cloudflare": {
      if (!env.EMAIL || typeof env.EMAIL.send !== "function") {
        throw new Error("Cloudflare Email Workers binding (EMAIL) is not configured.");
      }
      await env.EMAIL.send({
        to: options.to,
        from,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    }

    default:
      throw new Error(`Unsupported EMAIL_PROVIDER: "${provider}".`);
  }
}
