import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import { FaTachometerAlt, FaHome, FaPlus, FaHeart, FaUser } from 'react-icons/fa';
import Logo from '../common/Logo';

const DashboardSidebar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <FaTachometerAlt className="w-5 h-5" />
    },
    {
      path: '/dashboard/properties',
      name: 'My Properties',
      icon: <FaHome className="w-5 h-5" />
    },
    {
      path: '/dashboard/properties/add',
      name: 'Add Property',
      icon: <FaPlus className="w-5 h-5" />
    },
    {
      path: '/dashboard/favorites',
      name: 'Favorites',
      icon: <FaHeart className="w-5 h-5" />
    },
    {
      path: '/dashboard/profile',
      name: 'Profile',
      icon: <FaUser className="w-5 h-5" />
    }
  ];
  
  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform 
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out
    `}>
      <div className="flex items-center justify-center h-16 border-b">
        <Logo />
      </div>
      
      <div className="px-4 py-6">
        <div className="flex items-center mb-6">
          <img 
            src={user?.avatar || 'https://via.placeholder.com/60'} 
            alt={user?.name} 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="text-sm font-medium text-gray-700">{user?.name}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
        </div>
        
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center px-4 py-3 text-gray-600 rounded-lg
                    ${isActive(item.path) ? 'bg-primary bg-opacity-10 text-primary' : 'hover:bg-gray-100'}
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
      </div>
    </div>
  );
};

export default DashboardSidebar;