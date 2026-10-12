import nodemailer from "nodemailer";

export interface EmailSendResult {
  messageId: string;
  previewUrl?: string;
  transport: "smtp" | "ethereal";
}

export async function sendReportPdfEmail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  filename: string;
  pdf: Uint8Array;
}): Promise<EmailSendResult> {
  const smtpHost = process.env.SMTP_HOST;
  let transporter: nodemailer.Transporter;
  let transport: EmailSendResult["transport"] = "smtp";

  if (smtpHost) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    transport = "ethereal";
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"NutriPilot Reports" <reports@nutripilot.app>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: [
      {
        filename: options.filename,
        content: Buffer.from(options.pdf),
        contentType: "application/pdf",
      },
    ],
  });

  return {
    messageId: info.messageId,
    previewUrl: nodemailer.getTestMessageUrl(info) || undefined,
    transport,
  };
}
