import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getChat } from "../controller/chat.controller.js";

const route = express.Router();

route.post("/", protectRoute, getChat)

export default route;