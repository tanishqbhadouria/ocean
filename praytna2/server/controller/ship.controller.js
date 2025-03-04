import jwt from "jsonwebtoken";
import Ship from "../models/ships.model.js"; // Adjust the path as needed

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const registerShip = async (req, res) => {
  try {
    const {
      name,
      password,
      type,
      capacity,
      currentLocation,
      speed,
      status,
      fuelLevel,
    } = req.body;

    if (
      !name ||
      !password ||
      !type ||
      !capacity ||
      !currentLocation ||
      !speed ||
      !status ||
      !fuelLevel
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!Array.isArray(currentLocation) || currentLocation.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Current location must be an array of [longitude, latitude]",
      });
    }

    if (await Ship.findOne({ name })) {
      return res.status(400).json({
        success: false,
        message: "Ship already exists",
      });
    }

    const newShip = await Ship.create({
      name,
      password,
      type,
      capacity,
      currentLocation,
      speed,
      status,
      fuelLevel,
    });

    const token = signToken(newShip._id);

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true, // prevents XSS attacks
      sameSite: "strict", // prevents CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({
      success: true,
      ship: newShip,
    });
  } catch (error) {
    console.log("Error in ship registration:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error in ship registration" });
  }
};

export const loginShip = async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const ship = await Ship.findOne({ name }).select("+password");

    if (!ship || !(await ship.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid name or password",
      });
    }

    const token = signToken(ship._id);

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true, // Prevents XSS attacks
      sameSite: "strict", // Prevents CSRF attacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      success: true,
      ship,
    });
  } catch (error) {
    console.log("Error in ship login:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
