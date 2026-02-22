import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // 587 TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, company, budget, message, timeline } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 🔔 1️⃣ Notify You
    await transporter.sendMail({
      from: `"Soteria Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Project Inquiry from ${name}`,
      html: `
        <h2>New Project Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || "N/A"}</p>
        <p><strong>Budget:</strong> ${budget || "N/A"}</p>
        <p><strong>Timeline:</strong> ${timeline || "N/A"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    // 📩 2️⃣ Auto Confirmation to Client
    await transporter.sendMail({
      from: `"Soteria Studio" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your project inquiry",
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for reaching out to Soteria Studio.</p>
        <p>We’ve received your message and will respond within 24 hours.</p>
        <br/>
        <p><strong>Your submission summary:</strong></p>
        <p>Budget: ${budget || "Not specified"}</p>
        <p>Timeline: ${timeline || "Not specified"}</p>
        <br/>
        <p>We look forward to working with you 🚀</p>
        <br/>
        <p>— Soteria Studio Team</p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});