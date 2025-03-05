import React, { useState, useEffect } from 'react';
import OceanPathMap from '../components/Map/OceanPathMap';
import PortSearch from '../components/PortSearch';

<<<<<<< HEAD
const OceanPathFinder = () => {
  const navigate = useNavigate();
  const { globalRoute, setGlobalRoute } = useContext(RouteContext);
  
  // Initialize local state from global state
  const [sourceInput, setSourceInput] = useState(globalRoute.sourceInput);
  const [destInput, setDestInput] = useState(globalRoute.destInput);
  const [routeType, setRouteType] = useState(globalRoute.routeType);
  
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
      
      const newRoute = {
        source: sourceCoords,
        destination: destCoords
      };
      
      setRoute(newRoute);
      
      // Update global state
      setGlobalRoute({
        ...globalRoute,
        source: sourceCoords,
        destination: destCoords,
        sourceInput: sourceInput,
        destInput: destInput,
        routeType: routeType
      });
    } catch (error) {
      alert('Invalid coordinates. Please use format: longitude, latitude');
    }
  };
  
  // Navigate to visualization view
  const goToVisualization = () => {
    navigate('/visualization');
  };
  
  // Common ports for quick selection - same as in RouteVisualization
  const commonPorts = [
    { name: 'Kakinada to Diglipur', source: [16.96, 82.21], destination: [5.39, 95.20] },
    // { name: 'Shanghai to Rotterdam', source: [121.4737, 31.2304], destination: [4.4777, 51.9244] },
    // { name: 'Tokyo to San Francisco', source: [139.8132, 35.7090], destination: [-122.4194, 37.7749] },
    // { name: 'New York to Los Angeles', source: [-74.0060, 40.7128], destination: [-118.2426, 34.0522] },
    // { name: 'Singapore to Sydney', source: [103.8198, 1.3521], destination: [151.2093, -33.8688] }
  ];
  
  // Handle quick route selection
  const selectQuickRoute = (selectedRoute) => {
    const newSourceInput = `${selectedRoute.source[0]}, ${selectedRoute.source[1]}`;
    const newDestInput = `${selectedRoute.destination[0]}, ${selectedRoute.destination[1]}`;
    
    setSourceInput(newSourceInput);
    setDestInput(newDestInput);
    setRoute({
      source: selectedRoute.source,
      destination: selectedRoute.destination
    });
    
    // Update global state
    setGlobalRoute({
      ...globalRoute,
      source: selectedRoute.source,
      destination: selectedRoute.destination,
      sourceInput: newSourceInput,
      destInput: newDestInput
    });
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route Type
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        id="standard-radio"
                        type="radio"
                        name="route-type"
                        checked={routeType === 'standard'}
                        onChange={() => setRouteType('standard')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="standard-radio" className="ml-2 text-sm text-gray-700">
                        Standard Route
                      </label>
=======
export default function OceanPathFinder() {
    const [source, setSource] = useState(null);
    const [destination, setDestination] = useState(null);
    const [route, setRoute] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [portsData, setPortsData] = useState([]);

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
    }, []);


    const handleFindRoute = async () => {
        if (!source || !destination) {
            setError('Please select both source and destination ports');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/find-route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: {
                        lng: source[0],
                        lat: source[1]
                    },
                    destination: {
                        lng: destination[0],
                        lat: destination[1]
                    }
                })
            });

            const data = await response.json();
            
            if (data.error) {
                setError(data.error);
                return;
            }
            
            setRoute(data);

        } catch (err) {
            setError('Failed to find route: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex flex-col">
            <div className="p-4 bg-white shadow-md">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Source Port
                            </label>
                            <PortSearch
                                ports={portsData}
                                onSelect={setSource}
                                placeholder="Select source port..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Destination Port
                            </label>
                            <PortSearch
                                ports={portsData}
                                onSelect={setDestination}
                                placeholder="Select destination port..."
                            />
                        </div>
                        
                        <div>
                            <button
                                onClick={handleFindRoute}
                                disabled={loading || !source || !destination}
                                className={`w-full px-4 py-2 text-white font-medium rounded-md
                                    ${loading || !source || !destination 
                                        ? 'bg-blue-300' 
                                        : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Finding Route...' : 'Find Route'}
                            </button>
                        </div>
>>>>>>> de3557a08a01e39f4cb83d5806abee3f82b1a2ac
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    {route && route.summary && (
                        <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md">
                            <h3 className="font-medium">Route Summary</h3>
                            <p>Total Distance: {Math.round(route.summary.totalDistance)} km</p>
                            <p>Source Deviation: {Math.round(route.summary.sourceDeviation)} km</p>
                            <p>Destination Deviation: {Math.round(route.summary.destDeviation)} km</p>
                        </div>
                    )}
                </div>
<<<<<<< HEAD
                
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={handleCoordinateInput}
                >
                  Calculate Route
                </button>
                
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={goToVisualization}
                >
                  View on Globe
                </button>
                
                <div className="border-t pt-4 mt-4">
                  {/* <h4 className="font-medium text-sm mb-2">Quick Routes</h4> */}
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
=======
>>>>>>> de3557a08a01e39f4cb83d5806abee3f82b1a2ac
            </div>

            <div className="flex-1">
                {/* <OceanPathMap
                    source={source}
                    destination={destination}
                    route={route}
                /> */}
            </div>
        </div>
    );
}
