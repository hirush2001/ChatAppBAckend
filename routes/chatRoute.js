import express from "express";
import { createChatRoom , intoChatRoom } from "../controller/chatRoomController.js";


const chatRoute = express.Router();

chatRoute.get("/chatcode", createChatRoom);
chatRoute.post("/verifycode", intoChatRoom);

export default chatRoute;