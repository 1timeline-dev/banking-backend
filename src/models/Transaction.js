import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Successful", "Failed"],
      default: "Successful",
    },

    description: {
      type: String,
      default: "Money Transfer",
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Transaction", transactionSchema);