import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // email should be mandatory
  },
  otp: {
    type: String,
    required: true, // OTP should be mandatory
  },
  sender: {
    type: String,
    
  },
  message: {
    type: String,
    
  }
}, { timestamps: true }); // adds createdAt and updatedAt

export default mongoose.model("Otp", otpSchema);
