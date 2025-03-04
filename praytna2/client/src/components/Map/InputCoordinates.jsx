import React, { useState, useEffect } from 'react';

/**
 * Component for entering and validating geographic coordinates
 * 
 * @param {Object} props
 * @param {Array} props.value - Initial coordinates as [lon, lat]
 * @param {Function} props.onChange - Callback when coordinates change
 * @param {String} props.label - Input field label
 * @param {String} props.placeholder - Input placeholder text
 * @param {String} props.className - Additional CSS classes
 */
const InputCoordinates = ({ 
  value = [0, 0], 
  onChange, 
  label = "Coordinates [lon, lat]:",
  placeholder = "0, 0",
  className = ""
}) => {
  // Keep the input string and parsed coordinates separate
  const [inputText, setInputText] = useState(`${value[0]}, ${value[1]}`);
  const [error, setError] = useState(null);

  // Update the input text if the value prop changes
  useEffect(() => {
    setInputText(`${value[0]}, ${value[1]}`);
  }, [value]);

  // Handle text input changes
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);

    try {
      // Parse the input
      const parts = text.split(',').map(part => part.trim());
      if (parts.length !== 2) {
        setError("Format must be 'longitude, latitude'");
        return;
      }
      
      const lon = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      
      if (isNaN(lon) || isNaN(lat)) {
        setError("Both values must be numbers");
        return;
      }
      
      // Validate range
      if (lon < -180 || lon > 180) {
        setError("Longitude must be between -180 and 180");
        return;
      }
      
      if (lat < -90 || lat > 90) {
        setError("Latitude must be between -90 and 90");
        return;
      }
      
      // Valid input, clear error and call onChange
      setError(null);
      onChange([lon, lat]);
      
    } catch (err) {
      setError("Invalid format. Use 'longitude, latitude'");
    }
  };

  return (
    <div className={`coordinate-input ${className}`}>
      <label className="block text-gray-700 mb-1 font-medium">
        {label}
        <input 
          type="text" 
          value={inputText}
          onChange={handleInputChange}
          className={`ml-2 px-3 py-2 border rounded-md w-40 text-sm ${error ? 'border-red-500' : ''}`}
          placeholder={placeholder}
        />
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default InputCoordinates;
