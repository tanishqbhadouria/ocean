import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import InputCoordinates from "./InputCoordinates";

// Fix default markers
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Start/End icons
const startIcon = L.icon({
  ...DefaultIcon.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

const endIcon = L.icon({
  ...DefaultIcon.options,
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// Component to fit the map to the route bounds
const FitBoundsToRoute = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const latLngs = coordinates.map(coord => [coord[1], coord[0]]);
      map.fitBounds(latLngs);
    }
  }, [coordinates, map]);
  
  return null;
};

const EnhancedOceanPathMap = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pathData, setPathData] = useState(null);
  const [source, setSource] = useState([0.0, 50.0]); // [lon, lat]
  const [destination, setDestination] = useState([-10.0, 40.0]); // [lon, lat]

  const fetchPath = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/shortest_ocean_path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: source,
          destination: destination,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPathData(data);
    } catch (err) {
      setError(`Failed to fetch path: ${err.message}`);
      console.error('Error fetching path:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial path
  useEffect(() => {
    fetchPath();
  }, []);

  // Calculate the distance of the path
  const calculateDistance = () => {
    if (!pathData || !pathData.coordinates || pathData.coordinates.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    for (let i = 0; i < pathData.coordinates.length - 1; i++) {
      const coord1 = pathData.coordinates[i];
      const coord2 = pathData.coordinates[i + 1];
      
      // Haversine formula to calculate distance between two points
      const R = 6371; // Radius of Earth in km
      const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
      const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c;
      
      totalDistance += distance;
    }
    
    return totalDistance.toFixed(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPath();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Ocean Path Finder</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputCoordinates
              label="Source [lon, lat]:"
              value={source}
              onChange={setSource}
              placeholder="0, 50"
            />
            
            <InputCoordinates
              label="Destination [lon, lat]:"
              value={destination}
              onChange={setDestination}
              placeholder="-10, 40"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`px-6 py-3 rounded-md font-semibold text-white transition 
              ${isLoading ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
          >
            {isLoading ? 'Finding Path...' : 'Find Ocean Path'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="h-[70vh] w-full border border-gray-300 rounded-lg overflow-hidden shadow-md">
        <MapContainer 
          center={[45.0, -5.0]} 
          zoom={4} 
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {pathData && pathData.coordinates && (
            <>
              <Polyline 
                positions={pathData.coordinates.map(coord => [coord[1], coord[0]])} 
                color="blue"
                weight={4}
                opacity={0.7}
              >
                <Popup>
                  <div className="text-sm">
                    <span className="font-bold">Ocean Route</span><br/>
                    <span>Distance: {calculateDistance()} km</span><br/>
                    <span>Waypoints: {pathData.coordinates.length}</span>
                  </div>
                </Popup>
              </Polyline>

              <Marker 
                position={[pathData.coordinates[0][1], pathData.coordinates[0][0]]}
                icon={startIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <span className="font-bold">Starting Point</span><br/>
                    <span>Coordinates: {pathData.coordinates[0][0]}, {pathData.coordinates[0][1]}</span><br/>
                    <span>Node: {pathData.source_node}</span>
                  </div>
                </Popup>
              </Marker>

              <Marker 
                position={[
                  pathData.coordinates[pathData.coordinates.length - 1][1], 
                  pathData.coordinates[pathData.coordinates.length - 1][0]
                ]}
                icon={endIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <span className="font-bold">Destination</span><br/>
                    <span>
                      Coordinates: {pathData.coordinates[pathData.coordinates.length - 1][0]}, 
                      {pathData.coordinates[pathData.coordinates.length - 1][1]}
                    </span><br/>
                    <span>Node: {pathData.destination_node}</span>
                  </div>
                </Popup>
              </Marker>

              <FitBoundsToRoute coordinates={pathData.coordinates} />
            </>
          )}
        </MapContainer>
      </div>

      {pathData && (
        <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-3">Path Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-700">
                <span className="font-semibold">From:</span> {source[0]}, {source[1]}
                <span className="text-sm text-gray-500 ml-1">(Node: {pathData.source_node})</span>
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-700">
                <span className="font-semibold">To:</span> {destination[0]}, {destination[1]}
                <span className="text-sm text-gray-500 ml-1">(Node: {pathData.destination_node})</span>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Distance:</span> {calculateDistance()} km
              </p>
            </div>
            
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-gray-700">
                <span className="font-semibold">Waypoints:</span> {pathData.coordinates.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedOceanPathMap;
