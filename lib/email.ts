// lib/email.ts
// Email utility untuk mengirim OTP ke dentist

export async function sendOTPEmail(email: string, name: string, otp: string) {
  // TODO: Implementasikan dengan service email pilihan Anda
  // Contoh: Nodemailer, SendGrid, Resend, dll

  const emailContent = `
    Halo ${name},
    
    Anda telah didaftarkan sebagai Dentist di Noer Dental.
    
    Kode OTP Anda: ${otp}
    
    Silakan gunakan kode ini untuk membuat password Anda.
    Kode ini berlaku selama 24 jam.
    
    Terima kasih,
    Tim Noer Dental
  `;

  // Development mode: Log ke console
  if (process.env.NODE_ENV === "development") {
    console.log("=== OTP EMAIL ===");
    console.log("To:", email);
    console.log("Name:", name);
    console.log("OTP:", otp);
    console.log("Content:", emailContent);
    console.log("=================");
    return true;
  }

  // Production mode: Kirim email sebenarnya
  // Contoh dengan fetch ke API email service
  try {
    // const response = await fetch("https://api.email-service.com/send", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Authorization": `Bearer ${process.env.EMAIL_API_KEY}`
    //   },
    //   body: JSON.stringify({
    //     to: email,
    //     subject: "Kode OTP - Noer Dental",
    //     text: emailContent
    //   })
    // });
    // return response.ok;

    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return false;
  }
}

// Generate random OTP (6 digit)
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
