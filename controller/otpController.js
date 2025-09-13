// otpController.js
import Otp from "../models/Otp.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";



dotenv.config();

export async  function otpSender(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Delete old OTPs
    await Otp.deleteMany({ email });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Save OTP
    await Otp.create({ email, otp });
 
    // Create transporter **inside the function**
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS
      },
      tls: { rejectUnauthorized: false }
    });

    // Send email
     transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your Chat OTP",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`
    });

    res.json({ message: "OTP sent to your email!" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
}

export async function otpverify(req,res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const record = await Otp.findOne({ email,  otp });

    if (!record)
      return res.status(400).json({ error: "Invalid OTP" });
    if (record.expireAt < Date.now()) {
      return res.status(400).json({ error: "OTP expired" });
    }
    await Otp.deleteOne({ _id: record._id });

    res.json({ message: "OTP verified succefully" });
  } catch (error) {
    res.status(500).json({error: error.message})
  }
}




