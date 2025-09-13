import express from "express";
import  socketHandler  from "../controller/messageController.js";


const messageRoute = express.Router();

messageRoute.post("/socket", socketHandler);


export default messageRoute;