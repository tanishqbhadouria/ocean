import React, { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

const Dashboard = () => {
  const {ship} = useAuthStore();

  if (!ship) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading ship data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Ship Dashboard
      </h1>

      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          🚢 {ship.name}
        </h2>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 font-medium">Type:</p>
            <p className="text-gray-800">{ship.type}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Capacity:</p>
            <p className="text-gray-800">{ship.capacity} tons</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Location:</p>
            <p className="text-gray-800">{ship.currentLocation.join(", ")}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Speed:</p>
            <p className="text-gray-800">{ship.speed} knots</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Fuel Level:</p>
            <p className="text-gray-800">{ship.fuelLevel}%</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Status:</p>
            <p
              className={`text-lg font-bold ${
                ship.status === "In Transit" ? "text-green-600" : "text-red-600"
              }`}
            >
              {ship.status}
            </p>
          </div>
        </div>

        <p className="text-gray-500 text-center mt-6 text-sm">
          Created on {new Date(ship.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
