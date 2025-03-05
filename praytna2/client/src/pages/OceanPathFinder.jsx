import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RouteContext } from '../App';
import OceanPathMap from '../components/Map/OceanPathMap.jsx';
import PathDebugger from '../components/Map/PathDebugger.jsx';
import { toast } from 'react-hot-toast';
// import portsData from '../public/ports.geojson';
import PortSearch from '../components/PortSearch';

const OceanPathFinder = () => {
  const navigate = useNavigate();
  const { globalRoute, setGlobalRoute } = useContext(RouteContext);
  const [isLoading, setIsLoading] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [showDebugger, setShowDebugger] = useState(false);
  const API_URL = 'http://localhost:5000';
  
  // Initialize local state from global state
  const [sourceInput, setSourceInput] = useState(globalRoute.sourceInput);
  const [destInput, setDestInput] = useState(globalRoute.destInput);
  const [routeType, setRouteType] = useState(globalRoute.routeType);
  
  const [portsData, setPortsData] = useState([]);

  // Set up local route object for calculations
  const [route, setRoute] = useState({
    source: globalRoute.source,
    destination: globalRoute.destination
  });
  
  // Update source/dest inputs when global route changes
  useEffect(() => {
    setSourceInput(globalRoute.sourceInput);
    setDestInput(globalRoute.destInput);
    setRoute({
      source: globalRoute.source,
      destination: globalRoute.destination
    });
    setRouteType(globalRoute.routeType);
  }, [globalRoute]);
  
  // Add state for ports
  const [ports, setPorts] = useState([]);
  const [selectedSourcePort, setSelectedSourcePort] = useState('');
  const [selectedDestPort, setSelectedDestPort] = useState('');

  // Load ports on component mount
  useEffect(() => {
    // Fetch ports data when component mounts
    fetch('/ports.geojson')
        .then(response => response.json())
        .then(data => {
            setPortsData(data);
        })
        .catch(err => {
            console.error('Error loading ports data:', err);
            setError('Failed to load ports data');
        });
    }, []);

  // Replace ports state with selected ports
  const [sourcePort, setSourcePort] = useState(null);
  const [destPort, setDestPort] = useState(null);

  // Replace undefined setSource/setDestination with proper handlers
  const handleSourcePortSelect = (selectedPort) => {
    setSourcePort(selectedPort);
    setSourceInput(`${selectedPort.properties.PORT_NAME}, ${selectedPort.properties.COUNTRY}`);
  };

  const handleDestPortSelect = (selectedPort) => {
    setDestPort(selectedPort);
    setDestInput(`${selectedPort.properties.PORT_NAME}, ${selectedPort.properties.COUNTRY}`);
  };

  // Handle port selection and route calculation
  const handlePortSelection = async () => {
    if (!sourcePort || !destPort) {
      toast.error('Please select both source and destination ports');
      return;
    }

    const sourceCoords = sourcePort.geometry.coordinates;
    const destCoords = destPort.geometry.coordinates;

    const newRoute = {
      source: sourceCoords,
      destination: destCoords
    };

    setRoute(newRoute);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/shortest_ocean_path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: sourceCoords,
          destination: destCoords,
          algorithm: 'astar',
          max_distance: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch path');
      }

      const data = await response.json();
      setPathData(data);
      toast.success('Path calculated successfully!');

      // Update global state
      setGlobalRoute({
        ...globalRoute,
        source: sourceCoords,
        destination: destCoords,
        sourceInput: `${sourcePort.name}, ${sourcePort.country}`,
        destInput: `${destPort.name}, ${destPort.country}`,
        routeType: routeType
      });
    } catch (error) {
      console.error('Error calculating path:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to visualization view
  const goToVisualization = () => {
    navigate('/visualization');
  };
  
  // Common ports for quick selection - ensure [longitude, latitude] format
  const commonPorts = [
    // { 
    //   name: 'Singapore to Sydney', 
    //   source: [103.8198, 1.3521],  // [longitude, latitude]
    //   destination: [151.2093, -33.8688]
    // },
    // { 
    //   name: 'Shanghai to Rotterdam', 
    //   source: [121.4737, 31.2304],
    //   destination: [4.4777, 51.9244]
    // },
    // { 
    //   name: 'Tokyo to San Francisco', 
    //   source: [139.8132, 35.7090],
    //   destination: [-122.4194, 37.7749],
    //   maxDistance: 1000  // Pacific routes need larger radius
    // },
    // { 
    //   name: 'New York to Los Angeles', 
    //   source: [-74.0060, 40.7128],
    //   destination: [-118.2426, 34.0522],
    //   maxDistance: 800
    // },
    // { 
    //   name: 'Mumbai to Dublin', 
    //   source: [72.8777, 18.933],  // [lon, lat]
    //   destination: [-6.2603, 53.3498]
    // }
  ];
  
  // Handle quick route selection
  const selectQuickRoute = async (selectedRoute) => {
    const requestData = {
      source: selectedRoute.source,
      destination: selectedRoute.destination,
      vessel: {
        speed: 25,
        consumption_rate: 1.2,
        type: 'container_ship'
      }
    };
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_URL}/shortest_ocean_path`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Path calculation failed:', errorData);
        throw new Error(errorData.message || 'Failed to fetch path');
      }
      
      const data = await response.json();
      if (!data.path_coordinates || data.path_coordinates.length === 0) {
        throw new Error('No valid path found between these ports');
      }
      
      setPathData(data);
      toast.success(`Path calculated for ${selectedRoute.name}!`);
      
      // Update global state
      setGlobalRoute({
        ...globalRoute,
        source: selectedRoute.source,
        destination: selectedRoute.destination,
        sourceInput: `${selectedRoute.source[0]}, ${selectedRoute.source[1]}`,
        destInput: `${selectedRoute.destination[0]}, ${selectedRoute.destination[1]}`,
        routeType: routeType
      });
    } catch (error) {
      console.error('Error calculating path:', error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for receiving path data from the debugger
  const handlePathFromDebugger = (data) => {
    setPathData(data);
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
              <div className="space-y-4">
                {/* Replace coordinate inputs with port selection dropdowns */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                Source Port
                            </label>
                            <PortSearch
                                ports={portsData.features || []}
                                onSelect={handleSourcePortSelect}
                                placeholder="Select source port..."
                            />
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                Destination Port
                            </label>
                            <PortSearch
                                ports={portsData.features || []}
                                onSelect={handleDestPortSelect}
                                placeholder="Select destination port..."
                            />
                </div>

                {/* Replace handleCoordinateInput with handlePortSelection */}
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handlePortSelection}
                  disabled={isLoading}
                >
                  {isLoading ? 'Calculating...' : 'Calculate Route'}
                </button>
                
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={goToVisualization}
                >
                  View on Globe
                </button>
                
                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-sm mb-2">Quick Routes</h4>
                  <div className="space-y-2">
                    {commonPorts.map((port, index) => (
                      <button
                        key={index}
                        className="w-full py-1 px-3 text-sm border border-gray-300 hover:bg-gray-50 rounded"
                        onClick={() => selectQuickRoute(port)}
                        disabled={isLoading}
                      >
                        {port.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <button 
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => setShowDebugger(!showDebugger)}
                  >
                    {showDebugger ? 'Hide' : 'Show'} Debug Tools
                  </button>
                  
                  {showDebugger && (
                    <div className="mt-3">
                      <PathDebugger onPathReceived={handlePathFromDebugger} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map panel */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="bg-gray-100 px-4 py-3 rounded-t-lg border-b">
              <h3 className="text-lg font-medium">
                Ocean Path Map
                {route.source && route.destination && (
                  <span className="text-gray-500 text-sm ml-2">
                    ({route.source[0].toFixed(2)}, {route.source[1].toFixed(2)}) to 
                    ({route.destination[0].toFixed(2)}, {route.destination[1].toFixed(2)})
                  </span>
                )}
              </h3>
            </div>
            <div className="p-4" style={{ height: '600px' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Calculating route...</p>
                </div>
              ) : !route.source || !route.destination ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Please select a route to calculate</p>
                </div>
              ) : (
                <OceanPathMap 
                  route={route}
                  pathData={pathData}
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

export default OceanPathFinder;