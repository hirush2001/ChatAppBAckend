import express from "express";
import { otpSender,otpverify } from "../controller/otpController.js";

const otpRoute = express.Router();

otpRoute.post("/otp", otpSender);
otpRoute.post("/verify", otpverify);
export default otpRoute;
