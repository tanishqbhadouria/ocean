import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const ShipSchema = new Schema({
    mmsi: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Cargo", "Tanker", "Container", "Passenger", "Fishing", "Military", "Other"],
        required: true
    },
    capacity: {
        type: Number, // Maximum tonnage or TEU (for containers)
        required: true
    },
    currentLocation: {
        type: [Number], // [longitude, latitude]
        required: true
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
    assignedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route", // Links to the routes collection
        default: null
    },
    fuelLevel: {
        type: Number, // Fuel percentage (0-100)
        required: true,
        default: 100
    },
}, {timestamps: true});

const Ship = mongoose.model("Ship", ShipSchema);
export default Ship;
