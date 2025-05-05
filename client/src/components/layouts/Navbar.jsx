import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FaHome, FaUser, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaTachometerAlt, FaBuilding } from 'react-icons/fa';
import { HiMenu, HiX } from 'react-icons/hi';
import Logo from '../common/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                <FaHome className="mr-1" /> Home
              </Link>
              <Link 
                to="/properties" 
                className="border-transparent text-gray-500 hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Properties
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="ml-3 relative flex items-center">
                {/* Admin-only dashboard link */}
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <FaTachometerAlt className="mr-1 inline" /> Admin Dashboard
                  </Link>
                )}
                
                {/* Agent-only dashboard link */}
                {user?.role === 'agent' && (
                  <Link 
                    to="/agent" 
                    className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <FaBuilding className="mr-1 inline" /> Agent Dashboard
                  </Link>
                )}
                
                {/* Profile link for all users */}
                <Link 
                  to="/profile" 
                  className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaUser className="mr-1 inline" /> Profile
                </Link>
                
                {/* Favorites link for all users */}
                <Link 
                  to="/favorites" 
                  className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaUser className="mr-1 inline" /> Favorites
                </Link>
                
                {/* Logout button for all users */}
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaSignOutAlt className="mr-1 inline" /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <Link 
                  to="/login" 
                  className="text-gray-500 hover:text-primary px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaSignInAlt className="mr-1 inline" /> Login
                </Link>
                <Link 
                  to="/register" 
                  className="ml-2 bg-primary text-gray-500 hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  <FaUserPlus className="mr-1 inline" /> Register
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <HiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <HiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaHome className="mr-1 inline" /> Home
            </Link>
            <Link 
              to="/properties" 
              className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Properties
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                {/* Admin-only dashboard link */}
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaTachometerAlt className="mr-1 inline" /> Admin Dashboard
                  </Link>
                )}
                
                {/* Agent-only dashboard link */}
                {user?.role === 'agent' && (
                  <Link 
                    to="/agent" 
                    className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <FaBuilding className="mr-1 inline" /> Agent Dashboard
                  </Link>
                )}
                
                {/* Profile link for all users */}
                <Link 
                  to="/profile" 
                  className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="mr-1 inline" /> Profile
                </Link>
                
                {/* Favorites link for all users */}
                <Link 
                  to="/favorites" 
                  className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUser className="mr-1 inline" /> Favorites
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="text-gray-500 hover:bg-gray-50 hover:text-primary block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  <FaSignOutAlt className="mr-1 inline" /> Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link 
                  to="/login" 
                  className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <FaSignInAlt className="mr-1 inline" /> Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-gray-500 hover:bg-gray-50 hover:text-primary block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserPlus className="mr-1 inline" /> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;