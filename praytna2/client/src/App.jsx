import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route , Navigate} from 'react-router-dom';
import RouteVisualization from './pages/RouteVisualization';
import OceanPathFinder from './pages/OceanPathFinder'; // Assuming this is your path finder page
import About from './pages/About';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import {Toaster} from "react-hot-toast"
import ShipForm from './pages/ShipForm';  // Add this import
import ShipLogin from './pages/ShipLogin';
import useAuthStore from './store/useAuthStore';
import Dashboard from './pages/Dashboard';
import ChatContainer from './components/ChatContainer';


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

  const { checkAuth, checkingAuth , ship} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if(checkingAuth) return null

  return (
    <RouteContext.Provider value={{ globalRoute, setGlobalRoute }}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-grow  p-4">
            <Routes>
              <Route path="/visualization" element={ship?<RouteVisualization />:<Navigate to="/ship/new"/>} />
              <Route path="/pathfinder" element={ship?<OceanPathFinder />: <Navigate to="/ship/new"/>} />
              <Route path="/dashboard" element={ship?<Dashboard ship={ship} />: <Navigate to="/ship/new"/>} />
              <Route path="/chat" element={ship?<ChatContainer />: <Navigate to="/ship/new"/>} />
              <Route path="/about" element={<About />} />
              <Route path="/" element={ship ? <OceanPathFinder /> : <Navigate to="/ship/new" />} />
              <Route path="/ship/new" element={!ship?<ShipForm />: <Navigate to="/"/>} />
              <Route path="/ship/login" element={!ship?<ShipLogin />: <Navigate to="/"/>} />
            </Routes>
          </main>
          <Footer />
        </div>

      </Router>
      <Toaster/>
    </RouteContext.Provider>
  );
};

export default App;
