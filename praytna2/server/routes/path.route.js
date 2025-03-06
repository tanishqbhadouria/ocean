import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { addRoute, getRoute, getRouteById } from "../controller/path.controller.js";

const route = express.Router();

route.post("/add", protectRoute, addRoute);

route.get("/:routeId", protectRoute, getRouteById);

export default route;