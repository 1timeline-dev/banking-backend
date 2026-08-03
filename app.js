import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import statementRoutes from "./src/routes/statementRoutes.js";
import beneficiaryRoutes from "./src/routes/beneficiaryRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import publicRoutes from "./src/routes/publicRoutes.js";
// Connect to MongoDB
connectDB();

const app = express();
console.log("CLIENT_URL:", process.env.CLIENT_URL);
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    message: "Online Banking API is running 🚀",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user/statement", statementRoutes);
app.use("/api/user/beneficiaries", beneficiaryRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public", publicRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
