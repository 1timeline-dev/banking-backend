import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import { generateOTP, hashOTP, otpMatches } from "../utils/otp.js";
import { sendOTPEmail } from "../utils/email.js";
import {
  sendDebitEmail,
  sendCreditEmail,
} from "../utils/transactionEmail.js";

// Request a transfer (Send OTP)
export const transferMoney = async (req, res) => {
  try {
    const { accountNumber, amount } = req.body;

    if (!accountNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: "Account number and amount are required.",
      });
    }

    const sender = await User.findById(req.user._id).select(
      "+otp +otpExpires +pendingTransfer"
    );

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (sender.isFrozen) {
      return res.status(403).json({
        success: false,
        message: "Your account has been frozen.",
      });
    }

    const receiver = await User.findOne({ accountNumber });

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    if (receiver.isFrozen) {
      return res.status(403).json({
        success: false,
        message: "Receiver account is frozen.",
      });
    }

    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot transfer money to yourself.",
      });
    }

    const transferAmount = Number(amount);

    if (transferAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero.",
      });
    }

    if (sender.balance < transferAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance.",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store hashed OTP
    sender.otp = hashOTP(otp);
    sender.otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    sender.pendingTransfer = {
      receiver: receiver._id,
      amount: transferAmount,
    };

    await sender.save();

    // Send plain OTP to email
    await sendOTPEmail(sender.email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email. Verify to complete the transfer.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify OTP & Complete Transfer
export const verifyTransfer = async (req, res) => {
  try {
    const { otp } = req.body;

    const sender = await User.findById(req.user._id).select(
      "+otp +otpExpires +pendingTransfer"
    );

    if (!sender) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check expiry first
    if (!sender.otpExpires || sender.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    // Verify OTP
    if (!sender.otp || !otpMatches(otp, sender.otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (!sender.pendingTransfer?.receiver) {
      return res.status(400).json({
        success: false,
        message: "No pending transfer found.",
      });
    }

    const receiver = await User.findById(sender.pendingTransfer.receiver);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found.",
      });
    }

    if (receiver.isFrozen) {
      return res.status(403).json({
        success: false,
        message: "Receiver account is frozen.",
      });
    }

    const transferAmount = sender.pendingTransfer.amount;

    // Double-check balance
    if (sender.balance < transferAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance.",
      });
    }

    // Transfer funds
    sender.balance -= transferAmount;
    receiver.balance += transferAmount;

    await sender.save();
    await receiver.save();

    // Save transaction
    await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount: transferAmount,
      status: "Successful",
    });

    // Clear OTP & pending transfer BEFORE emails
    sender.otp = null;
    sender.otpExpires = null;
    sender.pendingTransfer = {
      receiver: null,
      amount: null,
    };

    await sender.save();

    // Send emails (don't fail transfer if email fails)
    try {
      await sendDebitEmail(
        sender.email,
        sender.fullname,
        transferAmount,
        receiver.fullname,
        sender.balance
      );

      await sendCreditEmail(
        receiver.email,
        receiver.fullname,
        transferAmount,
        sender.fullname,
        receiver.balance
      );
    } catch (emailError) {
      console.error("Email Error:", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Transfer completed successfully.",
      balance: sender.balance,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};