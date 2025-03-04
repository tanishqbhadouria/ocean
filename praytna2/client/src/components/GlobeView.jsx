import React, { useEffect, useRef, useState } from 'react';
import Plot from 'react-plotly.js';
import { fetchRoute } from './ApiClient';

const GlobeView = ({ route, selectedRoute, onRouteTypeChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeData, setRouteData] = useState({});
  const [view, setView] = useState('atlantic'); // Default view
  
  // Views configuration
  const views = {
    pacific: { lon: 180, lat: 0, roll: 0 },
    atlantic: { lon: 0, lat: 0, roll: 0 },
    indian: { lon: 80, lat: 0, roll: 0 },
    northPole: { lon: 0, lat: 90, roll: 0 },
    southPole: { lon: 0, lat: -90, roll: 0 }
  };
  
  // Reference to the Plotly figure
  const plotRef = useRef(null);
  
  // Calculate route center to focus the view
  const calculateRouteCenter = (coordinates) => {
    if (!coordinates || coordinates.length === 0) return views.atlantic;
    
    // Calculate average of coordinates
    const lons = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    // Handle transpacific routes and date line crossing
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Check if this is a transpacific route
    // If any point is beyond ±180° or the span is very large, treat as transpacific
    const isTranspacific = 
      lons.some(lon => lon > 180 || lon < -180) || 
      maxLon - minLon > 180;
    
    if (isTranspacific) {
      // For transpacific routes, use Pacific view
      return views.pacific;
    }
    
    // Regular routes
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLon = lons.reduce((a, b) => a + b, 0) / lons.length;
    
    // Choose appropriate view based on region
    if (avgLon < -100) return views.pacific;   // East Pacific
    if (avgLon > 100) return views.pacific;    // West Pacific
    if (avgLon < 30 && avgLon > -30) return views.atlantic;  // Atlantic
    if (avgLon > 60 && avgLon < 100) return views.indian;    // Indian Ocean
    
    return { lon: avgLon, lat: avgLat, roll: 0 };
  };
  
  // Fetch route data when route changes
  useEffect(() => {
    if (!route?.source || !route?.destination) return;
    
    const getRouteData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use the centralized API client with fallback to demo data
        const data = await fetchRoute(selectedRoute, route.source, route.destination, {
          fallbackToDemo: true  // Use demo data if API fails
        });
        
        // Update route data
        setRouteData(prev => ({
          ...prev,
          [selectedRoute]: data
        }));
        
        // Center the view on the route
        if (plotRef.current && data.coordinates) {
          const center = calculateRouteCenter(data.coordinates);
          plotRef.current.el._fullLayout.geo.projection.rotation = center;
        }
        
        // Show a warning if using demo data
        if (data.is_demo_data) {
          setError("Using demo route. The API couldn't find a valid ocean path between these points.");
        }
        
      } catch (err) {
        setError(`Failed to fetch route: ${err.message}`);
        console.error('Route fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    getRouteData();
  }, [route, selectedRoute]);
  
  // Prepare data for Plotly
  const prepareGlobeData = () => {
    const data = [];
    
    // Base ocean layer
    data.push({
      type: 'scattergeo',
      lon: [],
      lat: [],
      mode: 'markers',
      marker: {
        size: 5,
        color: 'blue',
        opacity: 0.1
      },
      name: 'Ocean',
      showlegend: false,
      hoverinfo: 'none'
    });
    
    // Function to handle transpacific coordinates
    const normalizeCoordinates = (coords) => {
      // Check if this is a transpacific route (large longitude gap)
      const lons = coords.map(c => c[0]);
      const minLon = Math.min(...lons);
      const maxLon = Math.max(...lons);
      
      // If the route spans across the date line
      if (maxLon - minLon > 180) {
        // Normalize all coordinates to be on the same side
        // If most points are on the east side (positive), shift western points
        const eastCount = lons.filter(lon => lon > 0).length;
        const westCount = lons.filter(lon => lon < 0).length;
        
        if (eastCount >= westCount) {
          // Shift western points east (add 360 to negative longitudes)
          return coords.map(c => {
            const [lon, lat] = c;
            return lon < 0 ? [lon + 360, lat] : [lon, lat];
          });
        } else {
          // Shift eastern points west (subtract 360 from positive longitudes)
          return coords.map(c => {
            const [lon, lat] = c;
            return lon > 0 ? [lon - 360, lat] : [lon, lat];
          });
        }
      }
      
      // Not transpacific, return as is
      return coords;
    };
    
    // Add standard route if available
    if (routeData.standard?.coordinates?.length) {
      const coords = normalizeCoordinates(routeData.standard.coordinates);
      data.push({
        type: 'scattergeo',
        lon: coords.map(c => c[0]),
        lat: coords.map(c => c[1]),
        mode: 'lines',
        line: {
          width: 3,
          color: 'blue'
        },
        name: 'Standard Route'
      });
      
      // Add markers for start and end points
      data.push({
        type: 'scattergeo',
        lon: [coords[0][0], coords[coords.length - 1][0]],
        lat: [coords[0][1], coords[coords.length - 1][1]],
        mode: 'markers+text',
        marker: {
          size: [10, 10],
          color: ['green', 'red'],
          symbol: ['circle', 'circle']
        },
        text: ['Start', 'End'],
        textposition: ['top center', 'bottom center'],
        name: 'Endpoints'
      });
    }
    
    // Add weather-optimized route if available
    if (routeData.weather?.coordinates?.length) {
      const coords = normalizeCoordinates(routeData.weather.coordinates);
      data.push({
        type: 'scattergeo',
        lon: coords.map(c => c[0]),
        lat: coords.map(c => c[1]),
        mode: 'lines',
        line: {
          width: 3,
          color: 'red',
          dash: 'dash'
        },
        name: 'Weather-Optimized Route'
      });
    }
    
    // Add key strategic passages as reference
    const passages = [
      {
        name: 'Suez Canal',
        coords: [[32.34, 30.01], [32.31, 29.20]],
        color: 'purple'
      },
      {
        name: 'Panama Canal',
        coords: [[-79.91, 9.38], [-79.52, 8.93]],
        color: 'orange'
      },
      {
        name: 'Strait of Gibraltar',
        coords: [[-5.60, 36.03], [-5.28, 35.95]],
        color: 'green'
      }
    ];
    
    passages.forEach(passage => {
      data.push({
        type: 'scattergeo',
        lon: passage.coords.map(c => c[0]),
        lat: passage.coords.map(c => c[1]),
        mode: 'lines',
        line: {
          width: 4,
          color: passage.color
        },
        name: passage.name,
        opacity: 0.8
      });
    });
    
    return data;
  };
  
  // Layout configuration for Plotly
  const layout = {
    title: 'Global Ocean Route Visualization',
    autosize: true,
    height: 600,
    geo: {
      projection: {
        type: 'orthographic',
        rotation: views[view]
      },
      showland: true,
      landcolor: 'lightgray',
      showocean: true,
      oceancolor: 'lightblue',
      showcoastlines: true,
      coastlinecolor: 'gray',
      showcountries: true,
      countrycolor: 'gray',
      lataxis: {
        showgrid: true,
        gridcolor: 'lightgray'
      },
      lonaxis: {
        showgrid: true,
        gridcolor: 'lightgray'
      }
    },
    margin: {
      l: 0,
      r: 0,
      b: 30,
      t: 50,
      pad: 0
    }
  };
  
  // Switch view
  const changeView = (newView) => {
    setView(newView);
    if (plotRef.current) {
      plotRef.current.el._fullLayout.geo.projection.rotation = views[newView];
      plotRef.current.el.layout = {
        ...plotRef.current.el.layout,
        geo: {
          ...plotRef.current.el.layout.geo,
          projection: {
            ...plotRef.current.el.layout.geo.projection,
            rotation: views[newView]
          }
        }
      };
      plotRef.current.el._fullLayout.geo._update();
    }
  };
  
  // Toggle between standard and weather-optimized routes
  const toggleRouteType = (type) => {
    if (onRouteTypeChange) {
      onRouteTypeChange(type);
    }
  };
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button 
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${selectedRoute === 'standard' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              onClick={() => toggleRouteType('standard')}
              disabled={isLoading}
            >
              Standard Route
            </button>
            <button 
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${selectedRoute === 'weather' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              onClick={() => toggleRouteType('weather')}
              disabled={isLoading}
            >
              Weather-Optimized Route
            </button>
          </div>
          
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {Object.entries(views).map(([key, _]) => (
              <button
                key={key}
                type="button"
                className={`px-3 py-1 text-sm font-medium ${view === key
                  ? 'bg-gray-200 text-gray-800'
                  : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                onClick={() => changeView(key)}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
          {error}
        </div>
      )}
      
      <div className="relative flex-1 min-h-[500px] border border-gray-200 rounded-md">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70 z-10">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}
        
        <Plot
          ref={plotRef}
          data={prepareGlobeData()}
          layout={layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
          config={{ responsive: true }}
        />
      </div>
      
      {routeData[selectedRoute] && (
        <div className="mt-3">
          <h5 className="text-lg font-medium">Route Statistics</h5>
          <p>
            <span className="font-semibold">Distance:</span> {Math.round(routeData[selectedRoute].total_distance || 0).toLocaleString()} km
            {routeData[selectedRoute].estimated_time && (
              <>
                <br />
                <span className="font-semibold">Estimated Time:</span> {Math.round(routeData[selectedRoute].estimated_time).toLocaleString()} hours
                ({(routeData[selectedRoute].estimated_time / 24).toFixed(1)} days)
              </>
            )}
            {routeData[selectedRoute].fuel_consumption && (
              <>
                <br />
                <span className="font-semibold">Est. Fuel Consumption:</span> {Math.round(routeData[selectedRoute].fuel_consumption).toLocaleString()} units
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobeView;
