import transporter from "../config/mail.js";
import "dotenv/config";
import type Mail from "nodemailer/lib/mailer/index.js";

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    attachments?: Mail.Attachment[];
}

export async function sendEmail ({
    to, 
    subject,
    html,
    attachments = [],
}: EmailOptions) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        attachments,
    });
}