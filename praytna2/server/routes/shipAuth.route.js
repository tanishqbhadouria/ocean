import express from "express";
import { loginShip, logoutShip, registerShip, ship } from "../controller/ship.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const route = express.Router();

route.post("/signup", registerShip);
route.post("/login", loginShip)
route.post("/logout", logoutShip)
route.get("/ship", protectRoute, ship)

export default route;