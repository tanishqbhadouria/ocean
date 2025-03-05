import React, { useState, useEffect } from 'react';
import OceanPathMap from '../components/Map/OceanPathMap';
import PortSearch from '../components/PortSearch';

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
            </div>

            <div className="flex-1">
                <OceanPathMap
                    source={source}
                    destination={destination}
                    route={route}
                />
            </div>
        </div>
    );
}
