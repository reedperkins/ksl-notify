import nodemailer from "nodemailer";

export interface EmailClient {
  sendMessage(to: string, from: string, subject: string, body: string): void;
}

export const emailClient = createEmailClient();

export function createEmailClient(): EmailClient {
  const appUser = process.env.FASTMAIL_APP_USER;
  const appPassword = process.env.FASTMAIL_APP_PASSWORD;
  if (!appUser || !appPassword) throw new Error("Missing email credentials");

  const transporter = nodemailer.createTransport({
    host: "smtp.fastmail.com",
    port: 465,
    secure: true,
    auth: {
      user: appUser,
      pass: appPassword,
    },
  });

  return {
    async sendMessage(to: string, from: string, subject: string, body: string) {
      const mailOptions = {
        to,
        from,
        subject,
        text: body,
      };
      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.messageId);
    },
  };
}
