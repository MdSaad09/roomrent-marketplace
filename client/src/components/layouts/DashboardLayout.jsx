import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import { FaSignOutAlt } from 'react-icons/fa';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sidebarOpen } = useSelector(state => state.ui);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        ></div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        
        {/* Logout button fixed at bottom right */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="Logout"
          >
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;