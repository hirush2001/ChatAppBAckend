import Otp from "../models/Otp.js";
import Message from "../models/Message.js";

export default async function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ✅ Join OTP room after checking from DB
    socket.on("joinRoom", async (otp) => {
      console.log("📩 Received joinRoom request with OTP:", otp);

      try {
        // Find OTP from DB
        const otpDoc = await Otp.findOne({ otp });

        if (!otpDoc) {
          console.log(`❌ Invalid OTP: ${otp}`);
          socket.emit("otp-status", { success: false, message: "OTP is incorrect" });
          return;
        }

        // ✅ OTP is correct, allow joining
        socket.join(otp);
        console.log(`✅ User ${socket.id} joined room ${otp}`);

        // Send confirmation to user
        socket.emit("otp-status", { success: true, message: "OTP is correct" });

        // Notify others in the room
        socket.to(otp).emit("message", `Someone joined room ${otp}`);
      } catch (err) {
        console.error("🚨 Error checking OTP:", err);
        socket.emit("otp-status", { success: false, message: "Server error while checking OTP" });
      }
    });

    // ✅ Receive new chat message (save + emit)
    socket.on("chat message", async (data) => {
      console.log("📩 Received chat message payload:", data);

      const { otp, sender, message } = data;

      if (!otp || !sender || !message) {
        console.error("❌ Missing OTP, sender, or message");
        return;
      }

      try {
        // Verify OTP from DB before saving message
        const otpDoc = await Otp.findOne({ otp });

        if (!otpDoc) {
          console.log(`❌ Invalid OTP while sending message: ${otp}`);
          socket.emit("chat-status", { success: false, message: "Invalid OTP, cannot send message" });
          return;
        }

        // Save message in Message collection
        const newMessage = new Message({ otp, sender, message });
        await newMessage.save();

        console.log(`✅ Message saved for room ${otp}:`, { sender, message });

        // Emit message to everyone in the room
        io.to(otp).emit("chat message", { sender, message });
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
