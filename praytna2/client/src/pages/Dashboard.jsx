import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const ShipDashboard = ({ shipId }) => {
  const [ship, setShip] = useState(null);

  useEffect(() => {
    // Replace with API call
    const fetchShipData = async () => {
      try {
        const mockShip = {
          _id: "67c76dc775247a6bc82194a0",
          name: "Ocean Voyager",
          type: "Cargo",
          capacity: 50000,
          currentLocation: [45.67, -78.43], // [Latitude, Longitude]
          assignedRoute: null,
          speed: 20,
          status: "In Transit",
          fuelLevel: 75,
          createdAt: "2025-03-04T21:16:55.746+00:00",
          updatedAt: "2025-03-04T21:16:55.746+00:00",
        };
        setShip(mockShip);
      } catch (error) {
        console.error("Error fetching ship data:", error);
      }
    };

    fetchShipData();
  }, [shipId]);

  if (!ship) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600 animate-pulse">Loading ship data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-blue-300 p-6">
      <h1 className="text-4xl font-extrabold text-center text-blue-800 mb-8">
        Ship Dashboard 🚢 {ship.name}
      </h1>

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6 transition transform hover:scale-105">
        {/* Ship Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">📜 Ship Information</h2>
            <p><strong>Name:</strong> {ship.name}</p>
            <p><strong>Type:</strong> {ship.type}</p>
            <p><strong>Capacity:</strong> {ship.capacity} tons</p>
            <p>
              <strong>Status:</strong> 
              <span className={`ml-2 px-3 py-1 rounded-md text-white ${ship.status === "In Transit" ? "bg-green-500" : "bg-red-500"}`}>
                {ship.status}
              </span>
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3 text-gray-700">🚀 Performance</h2>
            <p><strong>Speed:</strong> {ship.speed} knots</p>
            <p><strong>Fuel Level:</strong> {ship.fuelLevel}%</p>
            <div className="w-full bg-gray-200 rounded-md h-6 mt-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-700 ease-in-out ${
                  ship.fuelLevel > 50 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${ship.fuelLevel}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700">🗺 Current Location</h2>
        <div className="h-72 w-full rounded-xl overflow-hidden border border-gray-300 shadow-md">
          <MapContainer center={ship.currentLocation} zoom={5} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={ship.currentLocation}>
              <Popup>{ship.name} is currently here.</Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Created At */}
        <p className="text-sm text-gray-500 mt-4 italic">
          <strong>Created At:</strong> {new Date(ship.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default ShipDashboard;
