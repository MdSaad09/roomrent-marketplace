import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { toggleSidebar } from '../../redux/slices/uiSlice';
import AdminSidebar from '../admin/AdminSidebar';
import AdminHeader from '../admin/AdminHeader';
import { FaSignOutAlt, FaChevronRight, FaHome } from 'react-icons/fa';

// Breadcrumb mapping - maps routes to readable names
const breadcrumbNameMap = {
  '/admin': 'Dashboard',
  '/admin/properties': 'Properties',
  '/admin/properties/add': 'Add Property',
  '/admin/properties/edit': 'Edit Property',
  '/admin/properties/my': 'My Properties',
  '/admin/properties/pending': 'Pending Properties',
  '/admin/users': 'Users',
  '/admin/agents': 'Agents',  // Add this line
};
const AdminLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector(state => state.ui);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    let breadcrumbPath = '';
    
    return (
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Link to="/admin" className="flex items-center hover:text-blue-600">
          <FaHome className="mr-1" />
          Dashboard
        </Link>
        
        {pathnames.map((name, index) => {
          if (index === 0) return null; // Skip 'admin' as we already have Dashboard
          
          breadcrumbPath += `/${name}`;
          const fullPath = `/admin${breadcrumbPath}`;
          const isLast = index === pathnames.length - 1;
          
          // Handle dynamic routes like edit/:id
          let displayName = breadcrumbNameMap[fullPath] || name;
          if (fullPath.includes('/edit/') && !breadcrumbNameMap[fullPath]) {
            displayName = 'Edit Property';
          }
          
          return (
            <React.Fragment key={fullPath}>
              <FaChevronRight className="mx-2 text-gray-400" />
              {isLast ? (
                <span className="font-medium text-gray-800">{displayName}</span>
              ) : (
                <Link to={fullPath} className="hover:text-blue-600">
                  {displayName}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        ></div>
      )}
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Breadcrumbs */}
          {generateBreadcrumbs()}
          
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

export default AdminLayout;