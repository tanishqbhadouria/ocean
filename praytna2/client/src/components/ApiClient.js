/**
 * API client for making consistent requests to the backend
 */

// Base URL for API requests - adjust this to match your environment
const API_BASE_URL = 'http://localhost:5000';

/**
 * Make a request to fetch a route
 * 
 * @param {string} routeType - 'standard' or 'weather' for the type of route
 * @param {Array} source - [longitude, latitude] of source point
 * @param {Array} destination - [longitude, latitude] of destination point
 * @param {Object} options - Additional options like vessel properties
 * @returns {Promise} Promise resolving to route data
 */
export const fetchRoute = async (routeType, source, destination, options = {}) => {
  // Determine endpoint based on route type
  const endpoint = routeType === 'weather' 
    ? `${API_BASE_URL}/optimal_ocean_path` 
    : `${API_BASE_URL}/shortest_ocean_path`;
    
  // Try using demo coordinates if in development and if source or destination is over land
  const useDemoCoordinates = options.useDemoCoordinates || false;
  
  // Prepare request payload
  const payload = {
    source: source,
    destination: destination
  };
  
  // Add vessel data for weather-optimized routes
  if (routeType === 'weather') {
    payload.vessel = {
      type: 'cargo',
      speed: 20,
      consumption_rate: 1.0,
      ...options.vessel
    };
    payload.apply_weather = true;
  }
  
  // Make request
  try {
    console.log(`Fetching ${routeType} route from ${endpoint}`, payload);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(payload)
    });
    
    // Handle both success and error responses
    const responseData = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseData);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${responseData.substring(0, 100)}`);
    }
    
    if (!response.ok) {
      // If we got a 404 (points not found) and useDemoCoordinates is enabled
      if (response.status === 404 && useDemoCoordinates) {
        console.warn('Using demo route data since API failed');
        return getDemoRouteData(routeType, source, destination);
      }
      
      // Otherwise throw the error
      const errorMessage = data.error || `HTTP error ${response.status}`;
      throw new Error(`API Error (${response.status}): ${errorMessage}`);
    }
    
    console.log(`Received ${routeType} route data:`, data);
    return data;
    
  } catch (error) {
    console.error(`Failed to fetch ${routeType} route:`, error);
    
    // If configured to use demo data on error
    if (useDemoCoordinates || options.fallbackToDemo) {
      console.warn('Falling back to demo route data');
      return getDemoRouteData(routeType, source, destination);
    }
    
    throw error;
  }
};

/**
 * Generate demo route data for testing or fallback
 */
function getDemoRouteData(routeType, source, destination) {
  // Calculate a simple straight-line path with some intermediates
  const steps = 10;
  const coordinates = [];
  
  // Add source
  coordinates.push(source);
  
  // Add intermediate points
  for (let i = 1; i < steps; i++) {
    const fraction = i / steps;
    const lon = source[0] + (destination[0] - source[0]) * fraction;
    const lat = source[1] + (destination[1] - source[1]) * fraction;
    coordinates.push([lon, lat]);
  }
  
  // Add destination
  coordinates.push(destination);
  
  // Calculate approximate distance
  const totalDistance = calculateDistance(source, destination);
  
  // Build response
  const result = {
    source: source,
    destination: destination,
    coordinates: coordinates,
    total_distance: totalDistance,
    path_length: coordinates.length,
    computation_time: 0.001,
    is_demo_data: true  // Mark this as demo data
  };
  
  // Add weather-specific fields
  if (routeType === 'weather') {
    result.estimated_time = totalDistance / 20; // Assuming 20 km/h
    result.fuel_consumption = totalDistance * 1.0; // Assuming 1 unit/km
  }
  
  return result;
}

/**
 * Simple distance calculation for demo data
 */
function calculateDistance(point1, point2) {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;
  const R = 6371; // Earth radius in km
  
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

/**
 * Get information about the graph used by the routing system
 * 
 * @returns {Promise} Promise resolving to graph info
 */
export const getGraphInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/graph_info`);
    
    if (!response.ok) {
      throw new Error(`API Error (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch graph info:', error);
    throw error;
  }
};

export default {
  fetchRoute,
  getGraphInfo
};
