import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const Schema = mongoose.Schema;

const ShipSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    
    type: {
        type: String,
        enum: ["Cargo", "Tanker", "Container", "Passenger", "Fishing", "Military", "Other"],
        required: true
    },

    capacity: {
        type: Number, 
        required: true
    },

    currentLocation: {
        type: [Number], // [longitude, latitude]
        required: true
    },
    
    assignedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route", // Links to the routes collection
        default: null
    },

    speed: {
        type: Number, // Speed in knots
        required: true,
        default: 0
    },

    status: {
        type: String,
        enum: ["Docked", "In Transit", "Anchored", "Under Maintenance"],
        required: true,
        default: "Docked"
    },
    
    fuelLevel: {
        type: Number, // Fuel percentage (0-100)
        required: true,
        default: 100
    },

}, {timestamps: true});

ShipSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

// ✅ Compare password for authentication
ShipSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Ship = mongoose.model("Ship", ShipSchema);
export default Ship;
