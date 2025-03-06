import React, { useState, useEffect } from 'react';

const PortSearch = ({ ports, onSelect, placeholder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPorts, setFilteredPorts] = useState([]);
    
    // Filter ports within the valid range (-120 to 120 longitude, -60 to 60 latitude)
    const filterValidPorts = (ports) => {
        return ports.filter(port => {
            const [lon, lat] = port.geometry.coordinates;
            return lon >= -120 && lon <= 120 && lat >= -60 && lat <= 60;
        });
    };

    useEffect(() => {
        if (!searchTerm) {
            setFilteredPorts([]);
            return;
        }

        const validPorts = filterValidPorts(ports);
        const filtered = validPorts.filter(port => 
            port.properties.PORT_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
            port.properties.COUNTRY.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 10); // Limit to 10 results

        setFilteredPorts(filtered);
    }, [searchTerm, ports]);

    return (
        <div className="relative">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full p-2 border rounded"
            />
            {filteredPorts.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-60 overflow-auto">
                    {filteredPorts.map((port, index) => (
                        <li
                            key={index}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                onSelect(port);
                                setSearchTerm('');
                                setFilteredPorts([]);
                            }}
                        >
                            {port.properties.PORT_NAME}, {port.properties.COUNTRY}
                            <span className="text-xs text-gray-500 ml-2">
                                ({port.geometry.coordinates[0].toFixed(2)}°, {port.geometry.coordinates[1].toFixed(2)}°)
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {searchTerm && filteredPorts.length === 0 && (
                <div className="absolute z-10 w-full bg-white border rounded mt-1 p-2 text-gray-500">
                    No ports found within valid range
                </div>
            )}
        </div>
    );
};

export default PortSearch;