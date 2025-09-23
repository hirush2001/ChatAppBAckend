

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import userRoute from './routes/userRoute.js';
import cors from "cors";
import dotenv from 'dotenv';
import http from "http";
import { Server } from "socket.io";
//import Message from './models/Message.js';
import chatRoute from './routes/chatRoute.js';
import otpRoute from './routes/otpRoute.js';
import Otp from './models/Otp.js';
import socketHandler from './controller/messageController.js';
import messageRoute from './routes/messageRoute.js';
import chatroom from './models/chatroom.js';


dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});


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



socketHandler(io);
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to the database");
  

  })
  .catch((e) => {
    console.log("Database Connection Fail" + e);
  });
  

 

// Routes
app.use("/users", userRoute);
app.use("/login", userRoute);
app.use("/otp", otpRoute);
app.use("/verify", otpRoute);
app.use("/chatcode", chatRoute);
app.use("/verifycode", chatRoute);
app.use("/socket", messageRoute);

// Start Server
server.listen(5000, () => {
  console.log("Server is Running on port 5000");
});

