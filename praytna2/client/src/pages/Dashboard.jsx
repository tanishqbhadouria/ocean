import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import useAuthStore from "../store/useAuthStore";

const Dashboard = ( {ship} ) => {
  

  if (!ship) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600 animate-pulse">Loading ship data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 w-11/12 mx-auto">
      {/* Page Header */}
      <header className="pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800">🚢 {ship.name} - Dashboard</h1>
      </header>

      {/* Layout: Left (Info + Performance) | Right (Map) */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Left Section: Ship Info + Performance */}
        <div className="w-full md:w-2/5 space-y-6 mt-11">
          {/* Ship Information */}
          <section className="bg-gray-50 p-5 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">📜 Ship Information</h2>
            <div className="space-y-2 text-gray-800">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span> <span>{ship.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span> <span>{ship.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Capacity:</span> <span>{ship.capacity.toLocaleString()} tons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-md text-white ${
                    ship.status === "In Transit" ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {ship.status}
                </span>
              </div>
            </div>
          </section>

          {/* Performance */}
          <section className="bg-gray-50 p-5 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">🚀 Performance</h2>
            <div className="space-y-2 text-gray-800">
              <div className="flex justify-between">
                <span className="font-medium">Speed:</span> <span>{ship.speed} knots</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fuel Level:</span> <span>{ship.fuelLevel}%</span>
              </div>
            </div>

            {/* Fuel Bar */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-700 ease-in-out ${
                  ship.fuelLevel > 50 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${ship.fuelLevel}%` }}
              ></div>
            </div>
          </section>

          {/* Created At */}
          <footer className="text-sm text-gray-500">
            <p><strong>Created At:</strong> {new Date(ship.createdAt).toLocaleString()}</p>
          </footer>
        </div>

        {/* Right Section: Enlarged Map */}
        <div className="w-full md:w-3/5">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">🗺 Current Location</h2>
          <div className="h-[500px] w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <MapContainer center={ship.currentLocation} zoom={4} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={ship.currentLocation}>
                <Popup>{ship.name} is currently here.</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
