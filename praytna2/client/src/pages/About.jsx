import React from "react";

const About = () => {
  return (
    <div className="relative bg-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 md:flex md:items-center">
        {/* Left Content */}
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Voyage Ocean Routing
          </h1>
          <p className="mt-4 text-gray-600">
            An advanced maritime path planning system that calculates optimal sea routes, 
            considering geographic constraints, strategic passages, and optional weather conditions.
          </p>

          {/* CTA Button */}
          <div className="mt-6">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="md:w-1/2 relative mt-8 md:mt-0 flex justify-center">
          <div className="relative">
            <img
              src="../../public/images/ship.jpg"
              alt="Maritime Routing"
              className="rounded-lg shadow-lg"
            />
            {/* Decorative Elements */}
            <div className="absolute -top-6 right-6 w-10 h-10 bg-yellow-400 rounded"></div>
            <div className="absolute -bottom-4 right-2 w-8 h-8 bg-blue-600 rounded"></div>
            <div className="absolute -bottom-6 left-6 w-6 h-6 bg-red-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-12">
        <div className="container mx-auto px-6">
          {/* Two-Column Layout for Project Overview & Key Features */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Project Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">🚢 Project Overview</h2>
              <p className="mb-4">
                Voyage Ocean Routing is an advanced system that computes efficient maritime routes, 
                considering land masses, strategic passages like the Suez and Panama Canals, and 
                international maritime paths.
              </p>
              <ul className="space-y-3 text-gray-700">
                    <li className="flex items-center">
                      ✅ <b>Graph-Based Algorithm</b>&nbsp;for efficient routing
                      calculations.
                    </li>
                    <li className="flex items-center">
                      ✅ <b>Strategic Passages</b>&nbsp;like the&nbsp;<b>Suez & Panama
                      Canals</b>&nbsp;for real-world accuracy.
                    </li>
                    <li className="flex items-center">
                      ✅ <b>2D & 3D Visualization</b>&nbsp;for intuitive route analysis.
                    </li>
                  </ul>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium text-lg mb-2">🌍 Ocean Path Finding</h3>
                  <p>Calculate efficient maritime routes between any two points on Earth's oceans.</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">🛳 Strategic Passages</h3>
                  <p>Includes key maritime routes like the Suez Canal, Panama Canal, and various straits.</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">🛰 3D Globe Visualization</h3>
                  <p>Interactive 3D mapping for better route understanding.</p>
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-2">🌦 Weather Optimization</h3>
                  <p>Optional weather-based routing for fuel efficiency and safety.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fancy Technical Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-12">
            <h2 className="text-2xl font-semibold text-center mb-8">Technical Details</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-3">🐍</div>
                <h3 className="text-lg font-semibold mb-2">Python Backend</h3>
                <p>Built with Python, utilizing NetworkX for graph-based path calculations.</p>
              </div>

              {/* Card 2 */}
              <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-3">⚛️</div>
                <h3 className="text-lg font-semibold mb-2">React Frontend</h3>
                <p>Modern UI powered by React and styled with Tailwind CSS.</p>
              </div>

              {/* Card 3 */}
              <div className="bg-gray-100 p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-3">🌎</div>
                <h3 className="text-lg font-semibold mb-2">3D & 2D Mapping</h3>
                <p>Interactive 3D globe with Plotly and 2D maps using Leaflet.</p>
              </div>
            </div>

            <p className="text-center mt-6 text-gray-600">
              For more details on the implementation and algorithms, check out our documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
