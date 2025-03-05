import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteContext } from '../App';
import OceanPathMap from '../components/Map/OceanPathMap';

const OceanPathFinder = () => {
  const navigate = useNavigate();
  const { globalRoute, setGlobalRoute } = useContext(RouteContext);
  
  // State for coordinate inputs
  const [sourceCoords, setSourceCoords] = useState({ lng: '', lat: '' });
  const [destCoords, setDestCoords] = useState({ lng: '', lat: '' });
  const [routeData, setRouteData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate coordinates
    const sourceLng = parseFloat(sourceCoords.lng);
    const sourceLat = parseFloat(sourceCoords.lat);
    const destLng = parseFloat(destCoords.lng);
    const destLat = parseFloat(destCoords.lat);

    if (isNaN(sourceLng) || isNaN(sourceLat) || isNaN(destLng) || isNaN(destLat)) {
      setError('Please enter valid coordinates');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/find-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            lng: sourceLng,
            lat: sourceLat
          },
          destination: {
            lng: destLng,
            lat: destLat
          }
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch route');
      }

      setRouteData(data);
      
      // Update global state
      setGlobalRoute({
        source: [sourceLng, sourceLat],
        destination: [destLng, destLat],
        routeData: data
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Ocean Path Finder</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Input panel */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b">
              <h3 className="text-lg font-medium">Route Configuration</h3>
            </div>
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Source Coordinates</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={sourceCoords.lng}
                        onChange={(e) => setSourceCoords(prev => ({ ...prev, lng: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={sourceCoords.lat}
                        onChange={(e) => setSourceCoords(prev => ({ ...prev, lat: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Destination Coordinates</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={destCoords.lng}
                        onChange={(e) => setDestCoords(prev => ({ ...prev, lng: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={destCoords.lat}
                        onChange={(e) => setDestCoords(prev => ({ ...prev, lat: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                >
                  {isLoading ? 'Calculating...' : 'Calculate Route'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/visualization')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                >
                  View on Globe
                </button>
              </form>

              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Map panel */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b">
              <h3 className="text-lg font-medium">Ocean Path Map</h3>
            </div>
            <div className="p-4" style={{ height: '600px' }}>
              <OceanPathMap routeData={routeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OceanPathFinder;
