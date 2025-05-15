import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminDashboardStats } from '../../redux/slices/adminSlice';
import { FaUsers, FaHome, FaEnvelope, FaUserPlus, FaExclamationTriangle, FaPlus, FaList, FaClock } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading, error } = useSelector(state => state.admin);
  
  useEffect(() => {
    dispatch(fetchAdminDashboardStats());
  }, [dispatch]);
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Prepare chart data
  const propertyStatusData = {
    labels: ['For Sale', 'For Rent', 'Sold', 'Rented'],
    datasets: [
      {
        data: dashboardStats ? [
          dashboardStats.propertyStats?.forSale || 0,
          dashboardStats.propertyStats?.forRent || 0,
          dashboardStats.propertyStats?.sold || 0,
          dashboardStats.propertyStats?.rented || 0
        ] : [0, 0, 0, 0],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of your real estate marketplace</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>Error loading dashboard data: {error.message || error}</span>
          </div>
          <button 
            onClick={() => dispatch(fetchAdminDashboardStats())}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Quick Actions Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                to="/admin/properties/pending" 
                className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 hover:bg-amber-100 transition duration-200"
              >
                <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                  <FaClock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Pending Properties</p>
                  <p className="text-sm">
                    {dashboardStats?.counts?.pendingProperties || 0} need review
                  </p>
                </div>
              </Link>
              
              <Link 
                to="/admin/properties/add" 
                className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 hover:bg-green-100 transition duration-200"
              >
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <FaPlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Add Property</p>
                  <p className="text-sm">Create new listing</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/users" 
                className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition duration-200"
              >
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <FaUsers className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">Manage Users</p>
                  <p className="text-sm">{dashboardStats?.counts?.users || 0} total users</p>
                </div>
              </Link>
              
              <Link 
                to="/admin/properties" 
                className="flex items-center p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 hover:bg-indigo-100 transition duration-200"
              >
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
                  <FaList className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">All Properties</p>
                  <p className="text-sm">{dashboardStats?.counts?.properties || 0} total listings</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <FaUsers className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {dashboardStats?.counts?.users || 0}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaHome className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Total Properties</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {dashboardStats?.counts?.properties || 0}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaEnvelope className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Total Inquiries</p>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {dashboardStats?.counts?.inquiries || 0}
                  </h3>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Status</h2>
              <div className="h-64">
                <Pie data={propertyStatusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
              {dashboardStats?.recent?.properties?.length === 0 && dashboardStats?.recent?.users?.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No recent activity to display</p>
              ) : (
                <div className="space-y-4">
                  {dashboardStats?.recent?.properties?.slice(0, 3).map(property => (
                    <div key={property._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                        <FaHome className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          New property: {property.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Added by {property.owner?.name || 'Unknown'} on {formatDate(property.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {dashboardStats?.recent?.users?.slice(0, 3).map(user => (
                    <div key={user._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                        <FaUserPlus className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          New user: {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined on {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
              <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All
              </Link>
            </div>
            
            {!dashboardStats?.recent?.users?.length ? (
              <p className="text-gray-500 text-center py-8">No recent users to display</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardStats?.recent?.users?.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {user.avatar ? (
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={user.avatar} 
                                  alt={user.name} 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40?text=User';
                                  }}
                                />
                              ) : (
                                <span className="text-gray-600 font-semibold text-lg">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'agent'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Recent Properties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Properties</h2>
              <div className="flex space-x-2">
                <Link to="/admin/properties/pending" className="text-amber-600 hover:text-amber-800 text-sm font-medium">
                  Pending ({dashboardStats?.counts?.pendingProperties || 0})
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/admin/properties" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>
            </div>
            
            {!dashboardStats?.recent?.properties?.length ? (
              <p className="text-gray-500 text-center py-8">No recent properties to display</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardStats?.recent?.properties?.map(property => (
                      <tr key={property._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                              {property.images?.[0]?.url ? (
                                <img 
                                  className="h-10 w-10 rounded object-cover" 
                                  src={property.images[0].url} 
                                  alt={property.title}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                  }}
                                />
                              ) : (
                                <FaHome className="text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{property.title}</div>
                              <div className="text-xs text-gray-500">
                                {property.address?.city && `${property.address.city}, `}
                                {property.address?.state}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{property.owner?.name || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            property.status === 'for-sale' 
                              ? 'bg-blue-100 text-blue-800' 
                              : property.status === 'for-rent'
                              ? 'bg-green-100 text-green-800'
                              : property.status === 'sold'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.status === 'for-sale' ? 'For Sale' : 
                             property.status === 'for-rent' ? 'For Rent' : 
                             property.status === 'sold' ? 'Sold' : 'Rented'}
                          </span>
                          {property.approved === false && (
                            <span className="ml-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{property.price?.toLocaleString() || 0}
                          {property.status === 'for-rent' && '/mo'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(property.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;