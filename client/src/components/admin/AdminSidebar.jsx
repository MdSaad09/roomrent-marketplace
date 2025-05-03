import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaHome, 
  FaPlus, 
  FaSignOutAlt, 
  FaUserCog, 
  FaClipboardList,
  FaIdCard  // Added for agent management
} from 'react-icons/fa';
import Logo from '../common/Logo';

const AdminSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const isActive = (path) => {
    // Exact match for dashboard
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    
    // Exact match for "Manage Properties"
    if (path === '/admin/properties' && location.pathname === '/admin/properties') {
      return true;
    }
    
    // Exact match for "Add Property"
    if (path === '/admin/properties/add' && location.pathname === '/admin/properties/add') {
      return true;
    }
    
    // For "Manage Users" and any other paths, check if it starts with the path
    // but is not one of the special cases above
    if (path !== '/admin' && 
        path !== '/admin/properties' && 
        path !== '/admin/properties/add' && 
        location.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  const navItems = [
    {
      path: '/admin',
      name: 'Dashboard',
      icon: <FaTachometerAlt className="w-5 h-5" />
    },
    {
      path: '/admin/users',
      name: 'Manage Users',
      icon: <FaUsers className="w-5 h-5" />
    },
    {
      path: '/admin/agents',
      name: 'Manage Agents',
      icon: <FaIdCard className="w-5 h-5" />
    },
    {
      path: '/admin/properties',
      name: 'Manage Properties',
      icon: <FaClipboardList className="w-5 h-5" />
    },
    {
      path: '/admin/properties/pending',
      name: 'Pending Properties',
      icon: <FaClipboardList className="w-5 h-5" />
    },
    {
      path: '/admin/properties/add',
      name: 'Add Property',
      icon: <FaPlus className="w-5 h-5" />
    }
  ];
  
  return (
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
            src={user?.avatar || 'https://via.placeholder.com/60?text=Admin'} 
            alt={user?.name} 
            className="w-10 h-10 rounded-full mr-3 object-cover"
          />
          <div>
            <h3 className="text-sm font-medium text-gray-300">{user?.name || 'Admin User'}</h3>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors duration-200
                    ${isActive(item.path) 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'}
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      dispatch(toggleSidebar());
                    }
                  }}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="mt-10 pt-6 border-t border-gray-700 space-y-2">
          <Link
            to="/profile"
            className="flex items-center px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <FaUserCog className="w-5 h-5 mr-3" />
            <span>My Profile</span>
          </Link>
          
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
  );
};

export default AdminSidebar;