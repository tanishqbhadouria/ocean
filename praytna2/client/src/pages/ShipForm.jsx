import React, { useState } from "react";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    type: "Cargo",
    capacity: "",
    currentLocation: { lon: "", lat: "" },
    speed: "0",
    status: "Docked",
    fuelLevel: "100",
  });
  const navigate = useNavigate();

  const { signup } = useAuthStore();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lon" || name === "lat") {
      setFormData({
        ...formData,
        currentLocation: {
          ...formData.currentLocation,
          [name]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const shipData = {
      ...formData,
      currentLocation: [
        parseFloat(formData.currentLocation.lon),
        parseFloat(formData.currentLocation.lat),
      ],
    };
    const result = await signup(shipData);
    if (result) {
      setFormData({
        name: "",
        password: "",
        type: "Cargo",
        capacity: "",
        currentLocation: { lon: "", lat: "" },
        speed: "0",
        status: "Docked",
        fuelLevel: "100",
      });
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Register New Ship
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ship Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter ship name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ship Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[
                  "Cargo",
                  "Tanker",
                  "Container",
                  "Passenger",
                  "Fishing",
                  "Military",
                  "Other",
                ].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (tons) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                placeholder="Enter capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Location <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    name="lon"
                    placeholder="Longitude"
                    value={formData.currentLocation.lon}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    name="lat"
                    placeholder="Latitude"
                    value={formData.currentLocation.lat}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Speed (knots) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="speed"
                placeholder="Enter speed"
                value={formData.speed}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["Docked", "In Transit", "Anchored", "Under Maintenance"].map(
                  (status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Level (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fuelLevel"
                placeholder="Enter fuel level"
                value={formData.fuelLevel}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;