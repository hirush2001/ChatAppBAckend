// otpController.js
import crypto from "crypto";
import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";

export async function otpSender(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Delete old OTPs for this email
    await Otp.deleteMany({ email });

    // Generate 6-digit OTP
    const generatedOtp = crypto.randomInt(100000, 1000000).toString();

    // Save OTP in database
    await Otp.create({ email, otp: generatedOtp });

    // Print OTP in backend console (for testing)
    console.log(`Generated OTP for ${email}: ${generatedOtp}`);

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Chat OTP",
      text: `Your OTP is: ${generatedOtp}. It expires in 5 minutes.`,
    });

    // Send OTP in response for testing (remove in production)
    res.json({
      message: "OTP sent to your email!",
      otp: generatedOtp,
    });

  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}


export async function otpverify(req, res) { 
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
    }

    // ✅ Use Otp (capital O) instead of otp
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (record.expireAt < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    await Otp.deleteOne({ _id: record._id });

    res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: error.message });
  }
}


