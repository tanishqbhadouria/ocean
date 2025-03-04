import React from 'react';

const About = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Voyage Ocean Routing</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
          <p className="mb-4">
            Voyage Ocean Routing is an advanced maritime path planning application that calculates optimal sea routes 
            between any two points on Earth. The system uses sophisticated graph-based algorithms and ocean data to 
            efficiently compute routes that account for geographic constraints, strategic passages like canals and 
            straits, and optionally weather conditions.
          </p>
          
          <p className="mb-4">
            Our routing engine builds a precise model of navigable ocean areas using data from trusted sources and  
            employs Dijkstra's algorithm for shortest path calculations while accounting for factors like:
          </p>
          
          <ul className="list-disc pl-6 mb-4">
            <li>Land masses and coastal boundaries</li>
            <li>Strategic passages (Suez Canal, Panama Canal, etc.)</li>
            <li>International maritime routes</li>
            <li>Weather patterns (optional)</li>
          </ul>
          
          <p>
            The application features both a traditional 2D map view and an innovative 3D globe visualization that 
            provides an intuitive way to understand global maritime routes.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Features</h2>
          
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">Ocean Path Finding</h3>
            <p>Calculate efficient maritime routes between any two points on Earth's oceans.</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">3D Globe Visualization</h3>
            <p>View routes on an interactive 3D globe that accurately represents Earth's curvature.</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium text-lg mb-2">Strategic Passages</h3>
            <p>Routes account for key maritime passages like the Suez Canal, Panama Canal, and various straits.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-2">Weather Optimization</h3>
            <p>Optional weather routing to avoid adverse conditions and minimize fuel consumption.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
          <p className="mb-4">
            The application consists of a Python-based backend using NetworkX for graph operations and a React frontend 
            with Tailwind CSS for styling. The 3D globe visualization is powered by Plotly, while 2D maps use Leaflet.
          </p>
          
          <p>
            For more information about the implementation details and algorithms used, please refer to the project 
            documentation or contact our development team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
