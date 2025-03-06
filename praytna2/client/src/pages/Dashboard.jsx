import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useRouteStore from "../store/useRouteStore";

// Fix for default marker icons in Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIconShadow from "leaflet/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
  iconSize: [25, 41], // Size of the icon
  iconAnchor: [12, 41], // Point of the icon which will correspond to the marker's location
  popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  shadowSize: [41, 41], // Size of the shadow
});

L.Marker.prototype.options.icon = defaultIcon;

const Dashboard = ({ ship, route }) => {
  
  const { getRouteById, routeData, isLoading } = useRouteStore();

  useEffect(() => {
    if (route) {
      getRouteById(route);
    }
  }, [route]);

  if (!ship) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600 animate-pulse">
          Loading ship data...
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading route details...</div>;
  }

  const pos = [ship?.currentLocation[1], ship?.currentLocation[0]];
  // const pos=[-6.1754, 106.8272]

  return (
    <div className="min-h-screen bg-white p-6 w-11/12 mx-auto">
      {/* Page Header */}
      <header className="pb-4 border-b border-gray-300">
        <h1 className="text-3xl font-bold text-gray-800">
          🚢 {ship?.name} - Dashboard
        </h1>
      </header>

      {/* Layout: Left (Info + Performance) | Right (Map) */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Left Section: Ship Info + Performance */}
        <div className="w-full md:w-2/5 space-y-6 mt-11">
          {/* Ship Information */}
          <section className="bg-gray-50 p-5 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
              📜 Ship Information
            </h2>
            <div className="space-y-2 text-gray-800">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>{" "}
                <span>{ship?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Type:</span>{" "}
                <span>{ship?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Capacity:</span>{" "}
                <span>{ship?.capacity?.toLocaleString()} tons</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status:</span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-md text-white ${
                    ship?.status === "In Transit"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                >
                  {ship?.status}
                </span>
              </div>
            </div>
          </section>

          {/* Performance */}
          <section className="bg-gray-50 p-5 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
              🚀 Performance
            </h2>
            <div className="space-y-2 text-gray-800">
              <div className="flex justify-between">
                <span className="font-medium">Speed:</span>{" "}
                <span>{ship?.speed} knots</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Fuel Level:</span>{" "}
                <span>{ship?.fuelLevel}%</span>
              </div>
            </div>

            {/* Fuel Bar */}
            <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full transition-all duration-700 ease-in-out ${
                  ship?.fuelLevel > 50 ? "bg-green-500" : "bg-red-500"
                }`}
                style={{ width: `${ship?.fuelLevel}%` }}
              ></div>
            </div>
          </section>

          {/* Created At */}
          <footer className="text-sm text-gray-500">
            <p>
              <strong>Created At:</strong>{" "}
              {new Date(ship?.createdAt).toLocaleString()}
            </p>
          </footer>
        </div>

        {/* Right Section: Enlarged Map */}
        <div className="w-full md:w-3/5">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            🗺 Current Location
          </h2>
          <div className="h-[500px] w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <MapContainer center={pos} zoom={4} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={pos}>
                <Popup>{ship?.name} is currently here.</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Route Details */}
      {routeData && (
        <>
          <div className="p-6 mt-6"></div>
          <h2 className="text-2xl font-bold mb-6">Route Details</h2>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700">Source Port</h3>
                <p>{routeData?.source?.name}</p>
                <p className="text-sm text-gray-500">
                  ({routeData?.source?.coordinates[0]?.toFixed(4)},
                  {routeData?.source?.coordinates[1]?.toFixed(4)})
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">
                  Destination Port
                </h3>
                <p>{routeData?.destination?.name}</p>
                <p className="text-sm text-gray-500">
                  ({routeData?.destination?.coordinates[0]?.toFixed(4)},
                  {routeData?.destination?.coordinates[1]?.toFixed(4)})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <h3 className="font-semibold text-gray-700">Estimated Time</h3>
                <p>{routeData?.estimatedTime?.toFixed(2)} hours</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Distance</h3>
                <p>{routeData?.distance?.toFixed(2)} nautical miles</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700">Fuel Consumption</h3>
                <p>{routeData?.fuelConsumption?.toFixed(2)} tons</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4"></div>
          <h3 className="font-semibold text-red-700">* Ships on Route</h3>
          <p>{routeData?.shipCount} ships currently assigned</p>
        </>
      )}
    </div>
  );
};

export default Dashboard;