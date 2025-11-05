import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailContent(name: string, otp: string) {
  const text = `Halo ${name},\n\nAnda telah didaftarkan sebagai Dentist di Noer Dental.\n\nKode OTP Anda: ${otp}\n\nSilakan gunakan kode ini untuk membuat password Anda.\nKode ini berlaku selama 24 jam.\n\nTerima kasih,\nTim Noer Dental`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification - Noer Dental</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <tr>
                <td style="background-color: #000000; padding: 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Noer Dental</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 22px;">Halo ${name},</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    Anda telah didaftarkan sebagai Dentist di Noer Dental.
                  </p>
                  <div style="background-color: #f8f9fa; border-left: 4px solid #000000; padding: 20px; margin: 20px 0;">
                    <p style="color: #333333; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
                      Kode OTP Anda:
                    </p>
                    <p style="color: #000000; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 0; text-align: center;">
                      ${otp}
                    </p>
                  </div>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                    Silakan gunakan kode ini untuk membuat password Anda. 
                    <strong style="color: #d9534f;">Kode ini berlaku selama 24 jam.</strong>
                  </p>
                  <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 4px; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; font-size: 14px; margin: 0;">
                      <strong>⚠️ Perhatian:</strong> Jangan bagikan kode OTP ini kepada siapapun, termasuk staff Noer Dental.
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                  <p style="color: #999999; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} Noer Dental. All rights reserved.
                  </p>
                  <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                    Email ini dikirim secara otomatis, mohon tidak membalas email ini.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return { text, html };
}

export async function sendOTPEmail(
  email: string,
  name: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not configured in environment variables");
    return { 
      success: false, 
      error: "Email service not configured properly" 
    };
  }

  console.log(`\n🔄 Sending OTP email to ${email}...`);

  try {
    const { text, html } = buildEmailContent(name, otp);
    
    const emailConfig = {
      from: "Noer Dental <onboarding@resend.dev>",
      to: [email],
      subject: "Kode OTP - Setup Password Noer Dental",
      text,
      html,
      tags: [{ name: "category", value: "otp" }]
    };

    console.log("📧 Sending email with config:", {
      from: emailConfig.from,
      to: emailConfig.to,
      subject: emailConfig.subject
    });

    const { data, error } = await resend.emails.send(emailConfig);

    if (error) {
      console.error("❌ Failed to send email:", error);
      return { 
        success: false, 
        error: `Failed to send email: ${error.message}` 
      };
    }

    console.log("✅ Email sent successfully!", data?.id);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error("❌ Error sending email:", errorMessage);
    return { 
      success: false, 
      error: `Email service error: ${errorMessage}` 
    };
  }
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
