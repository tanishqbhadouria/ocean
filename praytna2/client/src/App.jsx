import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RouteVisualization from './pages/RouteVisualization';
import OceanPathFinder from './pages/OceanPathFinder'; // Assuming this is your path finder page
import About from './pages/About';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ShipForm from './pages/ShipForm';  // Add this import

// Create a context to share route data between components
export const RouteContext = createContext();

const App = () => {
  // Shared route state
  const [globalRoute, setGlobalRoute] = useState({
    source: null,
    destination: null,
    sourceInput: '',
    destInput: '',
    routeType: 'standard'
  });

  return (
    <RouteContext.Provider value={{ globalRoute, setGlobalRoute }}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/visualization" element={<RouteVisualization />} />
              <Route path="/pathfinder" element={<OceanPathFinder />} />
              <Route path="/about" element={<About />} />
              <Route path="/" element={<OceanPathFinder />} />
              <Route path="/ship/new" element={<ShipForm />} />  {/* Add this route */}
            </Routes>
          </main>
          <Footer />
        </div>

      </Router>
    </RouteContext.Provider>
  );
};

export default App;
