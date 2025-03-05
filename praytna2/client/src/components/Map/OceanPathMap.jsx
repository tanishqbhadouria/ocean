import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Fix for Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerIconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

// Component to auto-fit the map to the route
const MapFitter = ({ path }) => {
  const map = useMap();
  
  useEffect(() => {
    if (path && path.length > 0) {
      const bounds = L.latLngBounds(path.map(point => [point[1], point[0]]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, path]);
  
  return null;
};

function convertToApiFormat(coord) {
  // Convert from map [lat, lng] to API [lon, lat]
  return coord; // No conversion needed since route already has [lon, lat]
}

<<<<<<< HEAD
const OceanPathMap = ({ routeData }) => {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(2);
  const mapRef = useRef(null);

  // Update map when route data changes
  useEffect(() => {
    if (routeData && routeData.route && routeData.route.length > 0) {
      const coordinates = routeData.route.map(point => [point.coordinates[1], point.coordinates[0]]);
      setMapCenter(calculateCenter(coordinates));
      setZoom(calculateZoom(coordinates));
    }
  }, [routeData]);

  // Calculate center point between two coordinates
  const calculateCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return [0, 0];
    
    const lats = coordinates.map(point => point[1]);
    const lons = coordinates.map(point => point[0]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Handle date line crossing
    let centerLon = (minLon + maxLon) / 2;
    if (maxLon - minLon > 180) {
      // This means we're crossing the date line - adjust
      centerLon = (((minLon + 360) + maxLon) / 2) % 360;
      if (centerLon > 180) centerLon -= 360;
    }
    
    return [(minLat + maxLat) / 2, centerLon];
  };
  
  // Calculate appropriate zoom level for the route
  const calculateZoom = (coordinates) => {
    if (!coordinates || coordinates.length <= 1) return 2;
    
    const lats = coordinates.map(point => point[1]);
    const lons = coordinates.map(point => point[0]);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    let lonDiff = Math.abs(maxLon - minLon);
    if (lonDiff > 180) lonDiff = 360 - lonDiff;
    
    const latDiff = Math.abs(maxLat - minLat);
    
    // Calculate zoom based on the greater of the two differences
    const diff = Math.max(lonDiff, latDiff);
    
    if (diff > 180) return 1;
    if (diff > 90) return 2;
    if (diff > 45) return 3;
    if (diff > 22.5) return 4;
    if (diff > 11.25) return 5;
    if (diff > 5.625) return 6;
    if (diff > 2.8125) return 7;
    if (diff > 1.40625) return 8;
    return 9;
  };
  
  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
        worldCopyJump={true}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <MapUpdater center={mapCenter} zoom={zoom} />
        
        {routeData && (
          <>
            <Polyline
              positions={routeData.route.map(point => [point.coordinates[1], point.coordinates[0]])}
              color="blue"
            />
            
            <Marker position={[routeData.sourceNode.lat, routeData.sourceNode.lng]}>
              <Popup>Source Node</Popup>
            </Marker>
            <Marker position={[routeData.destNode.lat, routeData.destNode.lng]}>
              <Popup>Destination Node</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Route statistics */}
      {routeData && (
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md max-w-xs">
          <h4 className="font-medium text-sm mb-1">Route Statistics</h4>
          <p className="text-xs">
            <span className="font-semibold">Distance:</span> {Math.round(routeData.summary.totalDistance || 0).toLocaleString()} km<br />
            <span className="font-semibold">Source Deviation:</span> {Math.round(routeData.summary.sourceDeviation || 0).toLocaleString()} km<br />
            <span className="font-semibold">Destination Deviation:</span> {Math.round(routeData.summary.destDeviation || 0).toLocaleString()} km<br />
            <span className="font-semibold">Total Distance:</span> {Math.round(routeData.summary.totalWithDeviations || 0).toLocaleString()} km
          </p>
        </div>
      )}
=======
function convertFromApiFormat(coord) {
  // Convert from API [lon, lat] to Leaflet [lat, lng]
  return [coord[1], coord[0]];
}

// Add this function to handle antimeridian path splitting
const splitPathAtAntimeridian = (coordinates) => {
  if (!coordinates || coordinates.length < 2) return [coordinates];
  
  const paths = [];
  let currentPath = [coordinates[0]];
  
  for (let i = 1; i < coordinates.length; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    
    // Check if path crosses antimeridian (large longitude difference)
    if (Math.abs(curr[0] - prev[0]) > 180) {
      // Determine if crossing from positive to negative or vice versa
      const isEastToWest = prev[0] > 0;
      
      // Add interpolated points at the meridian crossing
      const lat = prev[1] + (curr[1] - prev[1]) * (180 - Math.abs(prev[0])) / (Math.abs(curr[0] - prev[0]));
      
      // Add points at the boundary
      currentPath.push([isEastToWest ? 180 : -180, lat]);
      paths.push([...currentPath]);
      
      // Start new path from the other side
      currentPath = [
        [isEastToWest ? -180 : 180, lat],
        curr
      ];
    } else {
      currentPath.push(curr);
    }
  }
  
  paths.push(currentPath);
  return paths;
};

const OceanPathMap = ({ route, selectedRoute, onRouteTypeChange }) => {
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const pathRef = useRef([]);
  
  // Generate path points from the API
  useEffect(() => {
    const fetchPath = async () => {
      if (!route.source || !route.destination) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Format request data according to API expectations
        const requestData = {
          source: route.source,          // Already in [lon, lat] format
          destination: route.destination, // Already in [lon, lat] format
          vessel: {
            speed: 25,                   // Speed in km/h
            consumption_rate: 1.2,       // Fuel consumption rate
            type: 'container_ship'       // Vessel type
          }
        };

        console.log('Sending request:', requestData); // Debug log

        const response = await axios.post(
          'http://localhost:5000/shortest_ocean_path', 
          requestData
        );
        
        if (response.data.error) {
          throw new Error(response.data.error);
        }
        
        setPathData(response.data);
      } catch (err) {
        console.error('Error fetching path:', err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPath();
  }, [route.source, route.destination, selectedRoute]);
  
  // Format route stats for display
  const formatRouteStats = () => {
    if (!pathData) return null;
    
    return (
      <div className="bg-white rounded shadow-md p-4 absolute bottom-6 right-6 z-10 max-w-xs">
        <h4 className="font-bold text-lg border-b pb-2 mb-3">Route Statistics</h4>
        <div className="grid grid-cols-2 gap-1 text-sm">
          <div className="text-gray-600">Total Distance:</div>
          <div className="font-medium">{Math.round(pathData.total_distance).toLocaleString()} km</div>
          
          <div className="text-gray-600">Estimated Time:</div>
          <div className="font-medium">{Math.round(pathData.estimated_time)} hours</div>
          
          <div className="text-gray-600">Fuel Consumption:</div>
          <div className="font-medium">{Math.round(pathData.fuel_consumption)} units</div>
          
          <div className="text-gray-600">Path Points:</div>
          <div className="font-medium">{pathData.path_length}</div>
          
          <div className="text-gray-600">Vessel Type:</div>
          <div className="font-medium">{pathData.vessel?.type || 'N/A'}</div>
          
          <div className="text-gray-600">Vessel Speed:</div>
          <div className="font-medium">{pathData.vessel?.speed || 0} km/h</div>
        </div>
      </div>
    );
  };
  
  // Update getLeafletPath to use the split paths
  const getLeafletPath = () => {
    if (!pathData || !pathData.coordinates) {
      console.log('No path data or coordinates available:', pathData);
      return [];
    }
    
    // Split paths at antimeridian
    const splitPaths = splitPathAtAntimeridian(pathData.coordinates);
    
    // Convert each path segment to Leaflet format
    return splitPaths.map(path => 
      path.map(coord => convertFromApiFormat(coord))
    );
  };
  
  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-20">
          <div className="flex flex-col items-center">
            <div className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 animate-spin mb-2"></div>
            <p>Calculating optimal route...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-bold text-red-600 mb-3">Error</h3>
            <p className="mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      
      <MapContainer 
        ref={mapRef}
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Source marker - convert [lon, lat] to [lat, lng] for Leaflet */}
        {route.source && (
          <Marker position={[route.source[1], route.source[0]]}>
            <Popup>
              <b>Source:</b><br />
              Lon: {route.source[0]}, Lat: {route.source[1]}
              {pathData?.source?.node_id && (
                <p>Nearest node: {pathData.source.node_id}</p>
              )}
            </Popup>
          </Marker>
        )}
        
        {/* Destination marker - convert [lon, lat] to [lat, lng] for Leaflet */}
        {route.destination && (
          <Marker position={[route.destination[1], route.destination[0]]}>
            <Popup>
              <b>Destination:</b><br />
              Lon: {route.destination[0]}, Lat: {route.destination[1]}
              {pathData?.destination?.node_id && (
                <p>Nearest node: {pathData.destination.node_id}</p>
              )}
            </Popup>
          </Marker>
        )}
        
        {/* Updated route polyline to handle multiple segments */}
        {pathData && pathData.coordinates && pathData.coordinates.length > 0 && (
          <>
            {getLeafletPath().map((pathSegment, index) => (
              <Polyline
                key={index}
                positions={pathSegment}
                color={selectedRoute === 'weather' ? 'green' : 'blue'}
                weight={4}
                opacity={0.7}
              />
            ))}
          </>
        )}
        
        {/* Auto-fit map to the path */}
        <MapFitter path={pathData?.coordinates} />
      </MapContainer>
      
      {/* Route stats overlay */}
      {pathData && formatRouteStats()}
      
      {/* Route type selector */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded shadow-md p-2">
        <div className="flex space-x-2">
          <button 
            className={`px-4 py-2 rounded ${selectedRoute === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => onRouteTypeChange('standard')}
          >
            Standard
          </button>
          <button 
            className={`px-4 py-2 rounded ${selectedRoute === 'weather' ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
            onClick={() => onRouteTypeChange('weather')}
          >
            Weather-Optimized
          </button>
        </div>
      </div>
>>>>>>> a810e59e9ee83636824adc22d1ecf5175ab2720b
    </div>
  );
};

export default OceanPathMap;
