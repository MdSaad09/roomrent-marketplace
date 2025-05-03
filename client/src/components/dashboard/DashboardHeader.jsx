// client/src/components/dashboard/DashboardHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell, FaUser } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
// This will be replaced with actual action later
const toggleSidebar = () => ({ type: 'TOGGLE_SIDEBAR' });

const DashboardHeader = () => {
  const dispatch = useDispatch();
  
  return (
    <header className="bg-white shadow-sm h-16 flex items-center px-4 md:px-6">
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="text-gray-500 hover:text-gray-700 lg:hidden"
      >
        <FaBars className="h-6 w-6" />
      </button>
      
      <div className="ml-auto flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700 relative">
          <FaBell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1 -translate-y-1"></span>
        </button>
        
        <div className="relative">
          <button className="flex items-center text-gray-700 hover:text-gray-900">
            <img
              src="https://via.placeholder.com/40"
              alt="User"
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="hidden md:block ml-2 text-sm font-medium">John Doe</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;