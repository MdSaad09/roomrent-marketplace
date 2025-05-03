import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProperties } from '../../redux/slices/propertySlice';
import { FaHome, FaPlus, FaHeart, FaEye, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { userProperties, loading } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    dispatch(fetchUserProperties());
  }, [dispatch]);
  
  // Calculate dashboard stats
  const totalProperties = userProperties.length;
  const propertiesForSale = userProperties.filter(p => p.status === 'for-sale').length;
  const propertiesForRent = userProperties.filter(p => p.status === 'for-rent').length;
  const totalViews = userProperties.reduce((sum, property) => sum + property.views, 0);
  
  // Get recent properties
  const recentProperties = [...userProperties]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-primary">
              <FaHome className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Properties</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalProperties}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaHome className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">For Sale</p>
              <h3 className="text-2xl font-bold text-gray-800">{propertiesForSale}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaHome className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">For Rent</p>
              <h3 className="text-2xl font-bold text-gray-800">{propertiesForRent}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaEye className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm">Total Views</p>
              <h3 className="text-2xl font-bold text-gray-800">{totalViews}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/dashboard/properties/add" 
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary mr-3">
              <FaPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Add Property</h3>
              <p className="text-sm text-gray-500">List a new property</p>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/properties" 
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary mr-3">
              <FaHome className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">My Properties</h3>
              <p className="text-sm text-gray-500">Manage your listings</p>
            </div>
          </Link>
          
          <Link 
            to="/dashboard/favorites" 
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
          >
            <div className="p-2 rounded-full bg-primary bg-opacity-10 text-primary mr-3">
              <FaHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Favorites</h3>
              <p className="text-sm text-gray-500">View saved properties</p>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Recent Properties */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Properties</h2>
          <Link to="/dashboard/properties" className="text-primary text-sm font-medium">
            View All
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : recentProperties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't added any properties yet.</p>
            <Link 
              to="/dashboard/properties/add" 
              className="mt-2 inline-block text-primary font-medium"
            >
              Add your first property
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProperties.map(property => (
              <div key={property._id} className="flex border-b border-gray-100 pb-4">
                <img 
                  src={property.images[0]?.url || 'https://via.placeholder.com/100?text=No+Image'} 
                  alt={property.title} 
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-medium text-gray-800">{property.title}</h3>
                  <p className="text-sm text-gray-500">
                    {property.address.city}, {property.address.state}
                  </p>
                  <div className="flex justify-between mt-2">
                    <span className="text-primary font-medium">
                      ${property.price.toLocaleString()}
                      {property.status === 'for-rent' && '/mo'}
                    </span>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FaEye className="mr-1" /> {property.views} views
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;