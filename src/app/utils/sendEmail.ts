import nodemailer from "nodemailer";
import config from "../config";

const currentDate = new Date();

const formattedDate = currentDate.toLocaleDateString("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const sendEmail = async (options: {
  email: string;
  subject: string;
  html: any;
}) => {
  const transporter = nodemailer.createTransport({
    // host: config.smtp.smtp_host,
    host: "smtp.gmail.com",
    port: parseInt(config.smtp.smtp_port as string),
    auth: {
      user: config.smtp.smtp_mail,
      pass: config.smtp.smtp_pass,
    },
  });

  const { email, subject, html } = options;

  const mailOptions = {
    from: `${config.smtp.name} <${config.smtp.smtp_mail}>`,
    to: email,
    date: formattedDate,
    signed_by: "bdCalling.com",
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
