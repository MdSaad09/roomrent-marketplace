// client/src/components/layouts/AgentLayout.jsx
import React from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaHome, 
  FaBuilding, 
  FaPlus, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTachometerAlt
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import Logo from '../common/Logo';

const AgentLayout = () => {
  const { user } = useSelector(state => state.auth);
  const { sidebarOpen } = useSelector(state => state.ui);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white shadow-lg transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <Logo light />
        </div>
        
        <div className="px-4 py-6">
          <div className="flex items-center mb-6">
            <img 
              src={user?.avatar || 'https://via.placeholder.com/60?text=Agent'} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full mr-3 object-cover"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-300">{user?.name || 'Agent'}</h3>
              <p className="text-xs text-gray-500">Real Estate Agent</p>
            </div>
          </div>
          
          <nav>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/agent"
                  end
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <FaTachometerAlt className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/agent/properties"
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <FaBuilding className="w-5 h-5 mr-3" />
                  <span>My Properties</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/agent/properties/add"
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <FaPlus className="w-5 h-5 mr-3" />
                  <span>Add Property</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/agent/profile"
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <FaUser className="w-5 h-5 mr-3" />
                  <span>My Profile</span>
                </NavLink>
              </li>
            </ul>
          </nav>
          
          <div className="mt-10 pt-6 border-t border-gray-700 space-y-2">
            <Link
              to="/"
              className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <FaHome className="w-5 h-5 mr-3" />
              <span>Back to Website</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <FaSignOutAlt className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        ></div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Updated to match AdminHeader */}
        <header className="bg-gray-800 text-white shadow-md h-16 flex items-center px-4 md:px-6">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="text-gray-300 hover:text-white lg:hidden"
          >
            <FaBars className="h-6 w-6" />
          </button>
          
          <div className="ml-4 lg:ml-0">
            <h2 className="text-lg font-medium">Agent Dashboard</h2>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="relative">
              <button className="flex items-center text-gray-300 hover:text-white">
                <img
                  src={user?.avatar || "https://via.placeholder.com/40?text=Agent"}
                  alt={user?.name || "Agent"}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="hidden md:block ml-2 text-sm font-medium">{user?.name || "Agent"}</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
        
        {/* Logout button fixed at bottom right (visible on mobile) */}
        <div className="lg:hidden fixed bottom-6 right-6">
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

export default AgentLayout;