import nodemailer from "nodemailer";

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

type ResendResponse = {
  id: string;
};

let smtpTransporter: nodemailer.Transporter | null = null;

const defaultFrom = process.env.EMAIL_FROM || "noreply@noerdental.com";

function buildEmailContent(name: string, otp: string) {
  const text = `Halo ${name},\n\nAnda telah didaftarkan sebagai Dentist di Noer Dental.\n\nKode OTP Anda: ${otp}\n\nSilakan gunakan kode ini untuk membuat password Anda.\nKode ini berlaku selama 24 jam.\n\nTerima kasih,\nTim Noer Dental`;
  const html = `
    <p>Halo ${name},</p>
    <p>Anda telah didaftarkan sebagai Dentist di Noer Dental.</p>
    <p><strong>Kode OTP Anda: ${otp}</strong></p>
    <p>Silakan gunakan kode ini untuk membuat password Anda. Kode ini berlaku selama 24 jam.</p>
    <p>Terima kasih,<br/>Tim Noer Dental</p>
  `;
  return { text, html };
}

function getSMTPTransporter() {
  if (smtpTransporter) {
    return smtpTransporter;
  }
  const host = process.env.SMTP_HOST;
  if (!host) {
    throw new Error("SMTP_HOST is not configured");
  }
  const rawPort = process.env.SMTP_PORT;
  const port = rawPort ? Number.parseInt(rawPort, 10) : 587;
  if (Number.isNaN(port)) {
    throw new Error("SMTP_PORT must be a number");
  }
  const secure = port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });
  return smtpTransporter;
}

async function sendViaSMTP(payload: MailPayload) {
  const transporter = getSMTPTransporter();
  await transporter.sendMail({
    from: defaultFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
  return true;
}

async function sendViaResend(payload: MailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: defaultFrom,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Resend error", response.status, errorBody);
    return false;
  }
  const data: ResendResponse = await response.json();
  return Boolean(data.id);
}

export async function sendOTPEmail(email: string, name: string, otp: string) {
  const subject = "Kode OTP - Noer Dental";
  const { text, html } = buildEmailContent(name, otp);
  if (process.env.NODE_ENV === "development") {
    console.log("=== OTP EMAIL ===");
    console.log("To:", email);
    console.log("Name:", name);
    console.log("OTP:", otp);
    console.log("Text:", text);
    console.log("HTML:", html);
    console.log("=================");
  }
  try {
    const payload: MailPayload = {
      to: email,
      subject,
      text,
      html,
    };
    if (process.env.RESEND_API_KEY) {
      const sent = await sendViaResend(payload);
      if (sent) {
        return true;
      }
    }
    if (process.env.SMTP_HOST) {
      return await sendViaSMTP(payload);
    }
    console.error("Email service is not configured");
    return false;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
