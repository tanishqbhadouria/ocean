import React, { useState } from 'react';

const PortSearch = ({ ports, onSelect, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredPorts = ports.filter(port => 
    port.properties.PORT_NAME.toLowerCase().includes(searchTerm.toLowerCase()) ||
    port.properties.COUNTRY.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (port) => {
    onSelect(port);
    setSearchTerm(`${port.properties.PORT_NAME}, ${port.properties.COUNTRY}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />
      
      {showDropdown && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredPorts.length > 0 ? (
            filteredPorts.map((port, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(port)}
              >
                {port.properties.PORT_NAME}, {port.properties.COUNTRY}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No ports found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PortSearch;