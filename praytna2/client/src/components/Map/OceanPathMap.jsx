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
    </div>
  );
};

export default OceanPathMap;
