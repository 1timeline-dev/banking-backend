import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email, token) => {
  try {
    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Online Banking Password Reset</h2>

          <p>We received a request to reset your password.</p>

          <p>Click the button below to reset your password:</p>

          <a href="${resetLink}"
             style="
               display:inline-block;
               padding:12px 20px;
               background:#0d6efd;
               color:white;
               text-decoration:none;
               border-radius:6px;
             ">
             Reset Password
          </a>

          <p>Or copy and paste this link into your browser:</p>

          <p>${resetLink}</p>

          <p>This link expires in <strong>15 minutes</strong>.</p>

          <p>If you didn't request this password reset, you can safely ignore this email.</p>

          <hr>

          <small>Online Banking Team</small>
        </div>
      `,
    });

    console.log("✅ Reset password email sent:", info.response);
  } catch (error) {
    console.error("❌ Reset password email failed:", error.message);
    throw error;
  }
};