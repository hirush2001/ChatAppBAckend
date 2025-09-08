

// server.js
/*
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected:", socket.id);

  socket.on("chat message", ({ sender, message }) => {
    io.emit("chat message", { sender, message });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);
  });
});

server.listen(5000, () => {
  console.log("listening on *:5000");
});

mongoose.connect("mongodb+srv://hirushankavindu78:123@cluster0.ydtfdve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology:true,
})
    .then(() => {
    console.log("MongoDB Connected")
    }).catch((err) => {
    console.log("Connection Error:",err)
})
*/

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

// MongoDB Model
const Message = require("./models/Message");

// --- Connect to MongoDB ---
mongoose.connect("mongodb+srv://hirushankavindu78:123@cluster0.ydtfdve.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.log("❌ MongoDB connection error:", err));

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send previous chat history
  Message.find().sort({ timestamp: 1 }).then((messages) => {
    socket.emit("chat history", messages);
  });

  // Receive new message
  socket.on("chat message", async ({ sender, message }) => {
    const newMessage = new Message({ sender, message });
    await newMessage.save();

    io.emit("chat message", { sender, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
