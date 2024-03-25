import nodemailer from "nodemailer";
import config from "../../../config";

const eamilSender = async (email: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email_sender,
      pass: config.emailSender.email_sender_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '"PH Health Care 👻" <sakibmohammad7679@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "reset password link ✔", // Subject line
    html: html, // html body
  });
};

export default eamilSender;
