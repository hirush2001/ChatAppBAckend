import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
/*
module.exports = mongoose.model("Message", messageSchema);
*/

export default mongoose.model("Message", messageSchema);