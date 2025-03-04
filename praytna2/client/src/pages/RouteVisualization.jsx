import React, { useState, useEffect, useContext } from 'react';
import GlobeView from '../components/GlobeView';
import OceanPathMap from '../components/Map/OceanPathMap'; 
import { useNavigate } from 'react-router-dom';
import { RouteContext } from '../App';

const RouteVisualization = () => {
  const navigate = useNavigate();
  const { globalRoute, setGlobalRoute } = useContext(RouteContext);
  
  // Local state for route input
  const [route, setRoute] = useState({
    source: globalRoute.source,
    destination: globalRoute.destination
  });
  
  // State for input fields - initialize from global state
  const [sourceInput, setSourceInput] = useState(globalRoute.sourceInput);
  const [destInput, setDestInput] = useState(globalRoute.destInput);
  
  // Visualization type: 'globe' or 'map'
  const [visualizationType, setVisualizationType] = useState('globe');
  
  // Route type: 'standard' or 'weather'
  const [routeType, setRouteType] = useState(globalRoute.routeType);
  
  // Common ports for quick selection
  const commonPorts = [
    { name: 'Mumbai to Dublin', source: [72.8777, 18.933], destination: [-6.2603, 53.3498] },
    { name: 'Shanghai to Rotterdam', source: [121.4737, 31.2304], destination: [4.4777, 51.9244] },
    { name: 'Tokyo to San Francisco', source: [139.8132, 35.7090], destination: [-122.4194, 37.7749] },
    { name: 'New York to Los Angeles', source: [-74.0060, 40.7128], destination: [-118.2426, 34.0522] },
    { name: 'Singapore to Sydney', source: [103.8198, 1.3521], destination: [151.2093, -33.8688] }
  ];
  
  // Update global state when local route changes
  useEffect(() => {
    setGlobalRoute({
      source: route.source,
      destination: route.destination,
      sourceInput: sourceInput,
      destInput: destInput,
      routeType: routeType
    });
  }, [route, sourceInput, destInput, routeType, setGlobalRoute]);
  
  // Handle coordinate input
  const handleCoordinateInput = () => {
    try {
      const sourceCoords = sourceInput.split(',').map(num => parseFloat(num.trim()));
      const destCoords = destInput.split(',').map(num => parseFloat(num.trim()));
      
      if (sourceCoords.length !== 2 || destCoords.length !== 2 ||
          isNaN(sourceCoords[0]) || isNaN(sourceCoords[1]) ||
          isNaN(destCoords[0]) || isNaN(destCoords[1])) {
        alert('Please enter valid coordinates as "longitude, latitude"');
        return;
      }
      
      setRoute({
        source: sourceCoords,
        destination: destCoords
      });
    } catch (error) {
      alert('Invalid coordinates. Please use format: longitude, latitude');
    }
  };
  
  // Handle quick route selection
  const selectQuickRoute = (selectedRoute) => {
    setSourceInput(`${selectedRoute.source[0]}, ${selectedRoute.source[1]}`);
    setDestInput(`${selectedRoute.destination[0]}, ${selectedRoute.destination[1]}`);
    setRoute({
      source: selectedRoute.source,
      destination: selectedRoute.destination
    });
  };

  // Navigate to path finder with current route
  const goToPathFinder = () => {
    // Global state is already updated, just navigate
    navigate('/pathfinder');
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Ocean Route Visualization</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b">
              <h3 className="text-lg font-medium">Route Selection</h3>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                    Source (longitude, latitude)
                  </label>
                  <input
                    type="text"
                    id="source"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="e.g. 72.8777, 18.933"
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                    Destination (longitude, latitude)
                  </label>
                  <input
                    type="text"
                    id="destination"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                    placeholder="e.g. -6.2603, 53.3498"
                    value={destInput}
                    onChange={(e) => setDestInput(e.target.value)}
                  />
                </div>
                
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleCoordinateInput}
                >
                  Calculate Route
                </button>
                
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={goToPathFinder}
                >
                  Use in Path Finder
                </button>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visualization Type
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="globe-radio"
                        type="radio"
                        name="visualization-type"
                        checked={visualizationType === 'globe'}
                        onChange={() => setVisualizationType('globe')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="globe-radio" className="ml-2 text-sm text-gray-700">
                        3D Globe
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="map-radio"
                        type="radio"
                        name="visualization-type"
                        checked={visualizationType === 'map'}
                        onChange={() => setVisualizationType('map')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="map-radio" className="ml-2 text-sm text-gray-700">
                        2D Map
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-2">Quick Routes</h4>
                  <div className="space-y-2">
                    {commonPorts.map((port, index) => (
                      <button
                        key={index}
                        className="w-full py-1 px-3 text-sm border border-gray-300 hover:bg-gray-50 rounded"
                        onClick={() => selectQuickRoute(port)}
                      >
                        {port.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          {/* ...existing visualization container... */}
          <div className="bg-white rounded-lg shadow h-full">
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b">
              <h3 className="text-lg font-medium">
                Route Visualization
                {route.source && route.destination && (
                  <span className="text-gray-500 text-sm ml-2">
                    ({route.source[0].toFixed(2)}, {route.source[1].toFixed(2)}) to 
                    ({route.destination[0].toFixed(2)}, {route.destination[1].toFixed(2)})
                  </span>
                )}
              </h3>
            </div>
            <div className="p-4" style={{ height: '600px' }}>
              {!route.source || !route.destination ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Please select a route to visualize</p>
                </div>
              ) : visualizationType === 'globe' ? (
                <GlobeView 
                  route={route} 
                  selectedRoute={routeType}
                  onRouteTypeChange={setRouteType}
                />
              ) : (
                <OceanPathMap 
                  route={route} 
                  selectedRoute={routeType}
                  onRouteTypeChange={setRouteType}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteVisualization;
