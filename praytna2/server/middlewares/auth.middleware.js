import jwt from "jsonwebtoken";
import Ship from "../models/ships.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies.jwt;

    // Check for token in headers if not found in cookies
    if (
      !token &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized - Invalid token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized - Invalid token",
      });
    }

    const currentShip = await Ship.findById(decoded.id).select("-password");
    

    if (!currentShip) {
      return res.status(404).json({ message: "Ship not found" });
    }

    req.ship = currentShip;

    next();
  } catch (error) {
    console.log("Error in Protected Route", error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized - Invalid token",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
};
