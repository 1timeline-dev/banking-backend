import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP CONNECTION ERROR:");
    console.error(error);
  } else {
    console.log("✅ SMTP SERVER IS READY");
  }
});

export default transporter;