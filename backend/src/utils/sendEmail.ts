import transporter from "../config/mail.js";
import ses from "../config/ses.js";
import "dotenv/config";
import nodemailer from "nodemailer";
import { SendEmailCommand, type SendEmailCommandInput } from "@aws-sdk/client-sesv2";
import type Mail from "nodemailer/lib/mailer/index.js";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Mail.Attachment[];
}

export async function sendEmail({
  to,
  subject,
  html,
  attachments = [],
}: EmailOptions): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER?.toLowerCase() ?? "smtp";
  const from = process.env.EMAIL_USER;
  if (!from) {
    throw new Error("EMAIL_USER is not configured.");
  }
  if (provider === "ses") {
    const mimeMessage = await nodemailer
      .createTransport({
        streamTransport: true,
        buffer: true,
        newline: "windows",
      })
      .sendMail({
        from,
        to,
        subject,
        html,
        attachments,
      });

    const rawMessage = mimeMessage.message;

    if (!Buffer.isBuffer(rawMessage)) {
      throw new Error("Failed to generate the raw email buffer for Amazon SES.");
    }
    const input: SendEmailCommandInput = {
      FromEmailAddress: from,
      Content: {
        Raw: {
          Data: rawMessage,
        },
      },
    };
    try {
  await ses.send(new SendEmailCommand(input));
  console.log("✅ AWS SES email sent successfully");
} catch (error: unknown) {
  console.error("❌ AWS SES SEND ERROR:", error);
  if (error instanceof Error) {
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
  }
  throw error;
}
    return;
  }

  if (provider !== "smtp") {
    throw new Error(`Unsupported EMAIL_PROVIDER: ${provider}. Use "smtp" or "ses".`);
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    attachments,
  });
}