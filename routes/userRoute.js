import express from "express";
import { createUser,loginUser } from "../controller/useController.js";

const userRoute = express.Router();

userRoute.post("/", createUser)
userRoute.post("/login",loginUser)

export default userRoute;