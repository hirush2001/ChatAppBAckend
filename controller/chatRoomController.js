import { error } from "console";
import ChatRoom from "../models/chatroom.js";  // make sure .js is included
import crypto from "crypto";

export async   function createChatRoom(req, res) {
  try {
    // Generate 3-digit code
    const code = crypto.randomInt(100, 999).toString();

    // Save code in DB
    const room = await ChatRoom.create({ code });

    res.json({
      message: "Chat room created ",
      code: room.code,
      roomId: room._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function intoChatRoom(req, res) {
    try {
        const { code } = req.body;
        if (!code)
            return res.status(400).json({ error: "Code is Required" })
        const checkcode = await ChatRoom.findOne({ code });
        
        if (!checkcode)
            return res.status(400).json({ error: "Invalid Code" }) 
        res.json({message: "Code is correct"})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}
