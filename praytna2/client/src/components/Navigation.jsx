import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import ConfirmDialog from './ConfirmDialog';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ship, logout } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path ? 'text-blue-600' : 'text-gray-700';

  // Handle logout confirmation
  const handleLogout = () => setIsDialogOpen(true);
  const confirmLogout = () => {
    logout();
    navigate('/ship/new');
    setIsDialogOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow">
        <div className="container mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Voyage</span>
              <span className="text-xl font-semibold ml-1 text-gray-700">Ocean Routing</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/')}`}>
                Path Finder
              </Link>
              <Link to="/visualization" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/visualization')}`}>
                3D Globe
              </Link>
              <Link to="/about" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/about')}`}>
                About
              </Link>
              <Link to="/chat" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/chat')}`}>
                Chat with SOLO
              </Link>

              {ship ? (
                <>
                  <Link to="/dashboard" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/dashboard')}`}>
                    🚢 Dashboard
                  </Link>
                  <button onClick={handleLogout} className="py-1 hover:text-red-600 transition-colors text-gray-700">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/ship/login" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/ship/login')}`}>
                    Login
                  </Link>
                  <Link to="/ship/new" className={`py-1 hover:text-blue-600 transition-colors ${isActive('/ship/new')}`}>
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onConfirm={confirmLogout}
        onCancel={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default Navigation;
