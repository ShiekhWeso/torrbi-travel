import nodemailer from 'nodemailer';

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({to, subject, html}: SendEmailInput): Promise<{ok: boolean}> {
  try {
    const host = process.env.ZOHO_SMTP_HOST?.trim();
    const user = process.env.ZOHO_SMTP_USER?.trim();
    const password = process.env.ZOHO_SMTP_PASS;
    const from = process.env.EMAIL_FROM?.trim();
    const portValue = process.env.ZOHO_SMTP_PORT?.trim();
    const port = portValue ? Number(portValue) : 465;

    if (!host || !user || !password || !from) {
      throw new Error('Missing Zoho SMTP configuration.');
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('Invalid Zoho SMTP port.');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: true,
      auth: {user, pass: password},
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000
    });
    await transporter.sendMail({from, to, subject, html});
    return {ok: true};
  } catch (error) {
    const password = process.env.ZOHO_SMTP_PASS;
    const reason = error instanceof Error ? error.message : String(error);
    console.error('Failed to send email:', password ? reason.split(password).join('[REDACTED]') : reason);
    return {ok: false};
  }
}
