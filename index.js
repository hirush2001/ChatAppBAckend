import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import userRoute from './routes/userRoute.js';
import cors from "cors";
import dotenv from 'dotenv';
import http from "http";
import { Server } from "socket.io";
import Message from './models/Message.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// JWT Middleware
app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");

    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
      if (decoded != null) {
        console.log(decoded);
        req.user = decoded;
        next();
      } else {
        console.log("Invalid Token");
        res.status(403).json({ message: "Invalid Token" });
      }
    });
  } else {
    next();
  }
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
    const newMessage = new Message({ sender, message, timestamp: new Date() });
    await newMessage.save();

    io.emit("chat message", { sender, message });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Database
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to the database");
  })
  .catch(() => {
    console.log("Database Connection Fail");
  });

// Routes
app.use("/users", userRoute);
app.use("/login", userRoute);

// Start Server
server.listen(5000, () => {
  console.log("Server is Running on port 5000");
});
