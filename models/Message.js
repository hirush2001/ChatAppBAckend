import mongoose from "mongoose";


const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true, // the OTP/room identifier
  },
  timestamp: { type: Date, default: Date.now }
});


export default mongoose.model("Message", messageSchema);