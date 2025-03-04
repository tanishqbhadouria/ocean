import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchRoute } from '../ApiClient';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper component to update map center and zoom
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const OceanPathMap = ({ route, selectedRoute, onRouteTypeChange }) => {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [zoom, setZoom] = useState(2);
  const [routeData, setRouteData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  
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
  
  // Fetch route data when route changes
  useEffect(() => {
    if (!route?.source || !route?.destination) return;
    
    const getRouteData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the centralized API client with fallback to demo data
        const data = await fetchRoute(selectedRoute, route.source, route.destination, {
          fallbackToDemo: true  // Use demo data if API fails
        });
        
        // Update route data
        setRouteData(prev => ({
          ...prev,
          [selectedRoute]: data
        }));
        
        // Update map center and zoom if coordinates are available
        if (data.coordinates && data.coordinates.length > 0) {
          const center = calculateCenter(data.coordinates);
          setMapCenter([center[0], center[1]]);
          setZoom(calculateZoom(data.coordinates));
        }
        
        // Show a warning if using demo data
        if (data.is_demo_data) {
          setError("Using demo route. The API couldn't find a valid ocean path between these points.");
        }
        
      } catch (err) {
        setError(`Failed to fetch route: ${err.message}`);
        console.error('Route fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    getRouteData();
  }, [route, selectedRoute]);
  
  // Handle route type change
  const handleRouteTypeChange = (type) => {
    if (onRouteTypeChange) {
      onRouteTypeChange(type);
    }
  };
  
  // Reverse coordinates for Leaflet (which uses [lat, lon] instead of [lon, lat])
  const reverseCoordinates = (coordinates) => {
    return coordinates.map(coord => [coord[1], coord[0]]);
  };
  
  // Split coordinates at the date line to prevent inappropriate rendering
  const splitRouteAtDateline = (coordinates) => {
    if (!coordinates || coordinates.length < 2) return [];
    
    const reversedCoords = reverseCoordinates(coordinates);
    const segments = [];
    let currentSegment = [reversedCoords[0]];
    
    for (let i = 1; i < reversedCoords.length; i++) {
      const prevLon = reversedCoords[i-1][1];
      const currLon = reversedCoords[i][1];
      
      // Check if this is a date line crossing (large longitude jump)
      // with special handling for values that have already been normalized for transpacific routes
      let isCrossing = false;
      
      // Standard crossing detection using absolute difference
      if (Math.abs(prevLon - currLon) > 180) {
        isCrossing = true;
      }
      
      // Some coordinates might have been adjusted to >180 or <-180 for transpacific routes
      // We need to detect segments that should be split there too
      if (Math.abs(prevLon) > 180 || Math.abs(currLon) > 180) {
        // If one coordinate is adjusted and the other isn't, split there
        if ((prevLon < -180 || prevLon > 180) && (currLon >= -180 && currLon <= 180)) {
          isCrossing = true;
        } else if ((currLon < -180 || currLon > 180) && (prevLon >= -180 && prevLon <= 180)) {
          isCrossing = true;
        }
      }
      
      if (isCrossing) {
        segments.push([...currentSegment]);
        currentSegment = [reversedCoords[i]];
      } else {
        currentSegment.push(reversedCoords[i]);
      }
    }
    
    if (currentSegment.length > 0) {
      segments.push(currentSegment);
    }
    
    return segments;
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-md shadow-md">
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-sm font-medium rounded ${selectedRoute === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleRouteTypeChange('standard')}
            disabled={isLoading}
          >
            Standard
          </button>
          <button 
            className={`px-3 py-1 text-sm font-medium rounded ${selectedRoute === 'weather' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
            onClick={() => handleRouteTypeChange('weather')}
            disabled={isLoading}
          >
            Weather
          </button>
        </div>
      </div>
      
      {/* Map */}
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
        
        {/* Dynamic map center updater */}
        <MapUpdater center={mapCenter} zoom={zoom} />
        
        {/* Standard route */}
        {routeData.standard?.coordinates && 
          splitRouteAtDateline(routeData.standard.coordinates).map((segment, i) => (
            <Polyline 
              key={`standard-${i}`}
              positions={segment}
              color="blue"
              weight={4}
            />
          ))
        }
        
        {/* Weather-optimized route */}
        {routeData.weather?.coordinates && 
          splitRouteAtDateline(routeData.weather.coordinates).map((segment, i) => (
            <Polyline 
              key={`weather-${i}`}
              positions={segment}
              color="red"
              weight={4}
              dashArray="5, 10"
            />
          ))
        }
        
        {/* Start marker */}
        {route?.source && (
          <Marker position={[route.source[1], route.source[0]]}>
            <Popup>Starting Point</Popup>
          </Marker>
        )}
        
        {/* End marker */}
        {route?.destination && (
          <Marker position={[route.destination[1], route.destination[0]]}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      )}
      
      {/* Error display */}
      {error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-100 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}
      
      {/* Route statistics */}
      {routeData[selectedRoute] && (
        <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md max-w-xs">
          <h4 className="font-medium text-sm mb-1">Route Statistics</h4>
          <p className="text-xs">
            <span className="font-semibold">Distance:</span> {Math.round(routeData[selectedRoute].total_distance || 0).toLocaleString()} km<br />
            {routeData[selectedRoute].estimated_time && (
              <>
                <span className="font-semibold">Est. Time:</span> {Math.round(routeData[selectedRoute].estimated_time).toLocaleString()} hrs
                ({(routeData[selectedRoute].estimated_time / 24).toFixed(1)} days)<br />
              </>
            )}
            {routeData[selectedRoute].fuel_consumption && (
              <><span className="font-semibold">Fuel:</span> {Math.round(routeData[selectedRoute].fuel_consumption).toLocaleString()} units<br /></>
            )}
            {routeData[selectedRoute].transpacific && (
              <span className="font-semibold text-blue-600">Transpacific Route</span>
            )}
          </p>
        </div>
      )}
      
      {/* Debug info - should be removed in production */}
      <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-md shadow-md max-w-xs text-xs">
        <div>Source: {route?.source ? `${route.source[0].toFixed(2)}, ${route.source[1].toFixed(2)}` : 'None'}</div>
        <div>Dest: {route?.destination ? `${route.destination[0].toFixed(2)}, ${route.destination[1].toFixed(2)}` : 'None'}</div>
        <div>Route type: {selectedRoute}</div>
      </div>
    </div>
  );
};

export default OceanPathMap;
