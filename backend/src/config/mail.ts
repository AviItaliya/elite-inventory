import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport ({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
export default transporter;
