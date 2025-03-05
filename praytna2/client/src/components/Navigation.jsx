// src/components/Navigation.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ship, logout } = useAuthStore();

  // Helper function to determine if a link is active
  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-700';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/ship/new');
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">Voyage</span>
              <span className="text-xl font-semibold ml-1 text-gray-700">Ocean Routing</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`py-1 border-transparent hover:text-blue-600 transition-colors ${isActive('/')}`}
            >
              Path Finder
            </Link>
            <Link
              to="/visualization"
              className={`py-1 border-transparent hover:text-blue-600 transition-colors ${isActive('/visualization')}`}
            >
              3D Globe
            </Link>
            <Link
              to="/about"
              className={`py-1 border-transparent hover:text-blue-600 transition-colors ${isActive('/about')}`}
            >
              About
            </Link>
            {ship ? (
              <button
                onClick={handleLogout}
                className="py-1 border-transparent hover:text-blue-600 transition-colors text-gray-700"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/ship/login"
                  className={`py-1 border-transparent hover:text-blue-600 transition-colors ${isActive('/ship/login')}`}
                >
                  Login
                </Link>
                <Link
                  to="/ship/new"
                  className={`py-1 border-transparent hover:text-blue-600 transition-colors ${isActive('/ship/new')}`}
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            {/* Mobile menu button (can be expanded with actual mobile menu implementation) */}
            <button
              type="button"
              className="text-gray-500 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              aria-label="toggle menu"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
