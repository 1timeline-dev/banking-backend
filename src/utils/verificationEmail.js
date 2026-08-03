import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `http://localhost:5000/api/auth/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Online Banking" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Online Banking Account",

    html: `
      <div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">

        <div style="background:#0d6efd;padding:20px;text-align:center;color:white;">
          <h1 style="margin:0;">Online Banking</h1>
        </div>

        <div style="padding:30px;">

          <h2 style="color:#111827;">
            Welcome!
          </h2>

          <p style="font-size:16px;color:#374151;">
            Thank you for creating your Online Banking account.
          </p>

          <p style="font-size:16px;color:#374151;">
            Please verify your email address by clicking the button below.
          </p>

          <div style="text-align:center;margin:35px 0;">
            <a
              href="${verificationLink}"
              style="
                background:#0d6efd;
                color:#ffffff;
                text-decoration:none;
                padding:14px 28px;
                border-radius:6px;
                display:inline-block;
                font-weight:bold;
              "
            >
              Verify Email
            </a>
          </div>

          <p style="color:#6b7280;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>

          <p style="word-break:break-all;">
            <a href="${verificationLink}">
              ${verificationLink}
            </a>
          </p>

          <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">

          <p style="font-size:14px;color:#6b7280;">
            If you did not create this account, you can safely ignore this email.
          </p>

        </div>

        <div style="background:#f3f4f6;padding:15px;text-align:center;color:#6b7280;font-size:13px;">
          © ${new Date().getFullYear()} Online Banking. All rights reserved.
        </div>

      </div>
    `,
  });
};