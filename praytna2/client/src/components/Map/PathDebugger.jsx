import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const PathDebugger = ({ onPathReceived }) => {
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const API_URL = process.env.VITE_GRAPH;

  // Test routes that span different regions of the world
  const testRoutes = [
    { name: "Mumbai to Dublin", source: [72.8777, 18.933], destination: [-6.2603, 53.3498] },
    { name: "Tokyo to San Francisco", source: [139.8132, 35.7090], destination: [-122.4194, 37.7749] },
    { name: "New York to Los Angeles", source: [-74.0060, 40.7128], destination: [-118.2426, 34.0522] },
    { name: "Singapore to Sydney", source: [103.8198, 1.3521], destination: [151.2093, -33.8688] },
    { name: "Cape Town to Perth", source: [18.4241, -33.9249], destination: [115.8575, -31.9505] }
  ];

  const testPath = async (route) => {
    setLoading(true);
    
    // Try both coordinate formats to determine what works
    const requestBody = {
      source: route.source,  // [lon, lat]
      destination: route.destination,
      algorithm: 'astar',
      max_distance: 800 // Increase the search radius for more reliable node finding
    };
    
    try {
      console.log(`Fetching path for ${route.name}...`);
      setLastRequest(requestBody);
      
      const response = await fetch(`${API_URL}/path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      setLastResponse(data);
      
      if (response.ok) {
        console.log(`Path found for ${route.name}:`, data);
        toast.success(`Path found for ${route.name} with ${data.path_length} points`);
        if (onPathReceived) onPathReceived(data);
      } else {
        console.error(`Error finding path for ${route.name}:`, data);
        toast.error(`Error: ${data.message || 'Failed to fetch path'}`);
        
        // If error indicates we couldn't find nearest nodes, try flipping coordinates
        if (data.message?.includes('find nearest nodes')) {
          const flippedRequest = {
            ...requestBody,
            source: route.source.slice().reverse(), // [lat, lon] instead of [lon, lat]
            destination: route.destination.slice().reverse(),
          };
          
          console.log("Trying with flipped coordinates...");
          toast.info("Trying with flipped coordinates...");
          
          const flippedResponse = await fetch(`${API_URL}/path`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(flippedRequest)
          });
          
          const flippedData = await flippedResponse.json();
          setLastResponse(flippedData);
          
          if (flippedResponse.ok) {
            console.log(`Path found for ${route.name} with flipped coordinates:`, flippedData);
            toast.success(`Path found for ${route.name} with flipped coordinates`);
            if (onPathReceived) onPathReceived(flippedData);
          } else {
            console.error(`Still failed with flipped coordinates:`, flippedData);
            toast.error(`Still failed with flipped coordinates: ${flippedData.message}`);
          }
        }
      }
    } catch (error) {
      console.error(`Network error for ${route.name}:`, error);
      toast.error(`Network error: ${error.message}`);
      setLastResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <h3 className="text-lg font-medium mb-3">Path Debugger</h3>
      
      <div className="space-y-2 mb-4">
        {testRoutes.map((route, index) => (
          <button
            key={index}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded mr-2 text-sm"
            onClick={() => testPath(route)}
            disabled={loading}
          >
            Test: {route.name}
          </button>
        ))}
      </div>
      
      <button
        className="text-sm text-blue-600 hover:underline"
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? 'Hide' : 'Show'} Debug Info
      </button>
      
      {showDebug && lastRequest && (
        <div className="mt-3 text-xs">
          <div className="bg-gray-100 p-2 rounded mb-2">
            <h4 className="font-bold">Last Request:</h4>
            <pre className="overflow-auto max-h-40">
              {JSON.stringify(lastRequest, null, 2)}
            </pre>
          </div>
          
          {lastResponse && (
            <div className="bg-gray-100 p-2 rounded">
              <h4 className="font-bold">Last Response:</h4>
              <pre className="overflow-auto max-h-40">
                {JSON.stringify(lastResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PathDebugger;
