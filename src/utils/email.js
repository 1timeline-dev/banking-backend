import transporter from "../../emailTransport.js";

export const sendOTPEmail = async (email, otp) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Online Banking OTP Verification",
      html: `
        <h2>Online Banking</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Email Error:", error);
    throw error;
  }
};
