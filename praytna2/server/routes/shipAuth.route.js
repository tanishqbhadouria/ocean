import express from "express";
import { loginShip, registerShip } from "../controller/ship.controller.js";

const route = express.Router();

route.post("/signup", registerShip);
route.post("/login", loginShip)

export default route;