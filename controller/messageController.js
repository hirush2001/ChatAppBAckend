
import Otp from "../models/Otp.js";
import Message from "../models/Message.js";
import chatroom from "../models/chatroom.js";


export default async function socketHandler(io) {


  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ✅ Join OTP room after checking from DB
    socket.on("joinRoom", async (code) => {
      console.log("📩 Received joinRoom request with OTP:", code);

      try {
        // Find OTP from DB
        const otpDoc = await chatroom.findOne({ code });

        if (!otpDoc) {
          console.log(`❌ Invalid OTP: ${code}`);
          socket.emit("otp-status", { success: false, message: "OTP is incorrect" });
          return;
        }

        // ✅ OTP is correct, allow joining
        socket.join(code);
        console.log(`✅ User ${socket.id} joined room ${code}`);

        // Send confirmation to user
        socket.emit("otp-status", { success: true, message: "OTP is correct" });

        // Notify others in the room
        socket.to(code).emit("message", `Someone joined room ${code}`);
      } catch (err) {
        console.error("🚨 Error checking OTP:", err);
        socket.emit("otp-status", { success: false, message: "Server error while checking OTP" });
      }
    });

    // ✅ Receive new chat message (save + emit)
    socket.on("chat message", async (data) => {
      console.log("📩 Received chat message payload:", data);

      const { code, sender, message } = data;

      if (!code || !sender || !message) {
        console.error("❌ Missing OTP, sender, or message");
        return;
      }

      try {
        // Verify OTP from DB before saving message
        const otpDoc = await chatroom.findOne({ code });

        if (!otpDoc) {
          console.log(`❌ Invalid OTP while sending message: ${code}`);
          socket.emit("chat-status", { success: false, message: "Invalid OTP, cannot send message" });
          return;
        }

        // Save message in Message collection
        const newMessage = new Message({ code, sender, message });
        await newMessage.save();

        console.log(`✅ Message saved for room ${code}:`, { sender, message });

        // Emit message to everyone in the room
        io.to(code).emit("chat message", { code, sender, message });
      } catch (err) {
        console.error("🚨 Error saving message:", err);
        socket.emit("chat-status", { success: false, message: "Failed to save message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("❎ User disconnected:", socket.id);
    });
  });
}


