import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */

const allowedOrigins = [
  "http://localhost:8080",
  "https://soteria.studio",
  "https://www.soteria.studio"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.json());

/* =========================
   EMAIL TRANSPORTER
========================= */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // use false for 587 (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("SMTP Server is ready 🚀");
  }
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.send("Soteria Email API Running 🚀");
});

/* =========================
   TEST EMAIL ROUTE
========================= */

app.get("/api/test-email", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"Soteria Studio" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "Test Email from Server",
      text: "Your email system is working 🚀",
    });

    res.json({
      success: true,
      messageId: info.messageId,
    });

  } catch (error) {
    console.error("Send Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================
   CONTACT ROUTE
========================= */

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Notify Admin
    await transporter.sendMail({
      from: `"Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Message from ${name}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr/>
        <p>${message}</p>
      `,
    });

    // Send Confirmation to Client
    await transporter.sendMail({
      from: `"Soteria Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out.</p>
        <p>We will get back to you shortly.</p>
      `,
    });

    res.json({ success: true });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/* =========================
   START SERVER
========================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});