// client/src/pages/agent/AgentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProperties, deleteProperty } from '../../redux/slices/propertySlice';
import { fetchAgentDashboardStats } from '../../redux/slices/agentSlice';
import { FaPlus, FaEdit, FaTrash, FaEye, FaExclamationCircle, FaChartLine, FaHome } from 'react-icons/fa';
import PropertyCard from '../../components/properties/PropertyCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const { userProperties, loading: propertiesLoading, error: propertiesError } = useSelector(state => state.properties);
  const { agentDashboardStats, loading: statsLoading, error: statsError } = useSelector(state => state.agents);
  const { user } = useSelector(state => state.auth);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUserProperties());
    dispatch(fetchAgentDashboardStats());
  }, [dispatch]);
  
  const openDeleteModal = (property) => {
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };
  
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    setIsDeleting(true);
    try {
      await dispatch(deleteProperty(propertyToDelete._id)).unwrap();
      setDeleteModalOpen(false);
      // Refresh dashboard stats after deletion
      dispatch(fetchAgentDashboardStats());
      dispatch(fetchUserProperties());
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Filter for published, pending approval, and rejected properties
  const publishedProperties = userProperties?.filter(prop => prop.published) || [];
  const pendingProperties = userProperties?.filter(prop => !prop.published && !prop.rejectionReason) || [];
  const rejectedProperties = userProperties?.filter(prop => prop.rejectionReason) || [];
  
  const isLoading = (propertiesLoading || statsLoading) && !userProperties.length && !agentDashboardStats;
  
  // Helper function to safely render property images
  const renderPropertyImage = (property) => {
    // Check if property has images
    if (!property.images || !Array.isArray(property.images) || property.images.length === 0) {
      return (
        <div className="h-10 w-10 bg-gray-200 flex items-center justify-center rounded-md">
          <FaHome className="text-gray-400" />
        </div>
      );
    }
    
    // Get the first image
    const image = property.images[0];
    
    // Handle different image formats
    let imageUrl;
    if (typeof image === 'string') {
      imageUrl = image;
    } else if (image && image.url) {
      imageUrl = image.url;
    } else if (image && image.public_id) {
      imageUrl = `/uploads/${image.public_id}`;
    } else {
      console.warn('Unknown image format:', image);
      imageUrl = '/images/property-placeholder.jpg';
    }
    
    return (
      <img 
        src={imageUrl} 
        alt={property.title || "Property"}
        className="h-10 w-10 rounded-md object-cover"
        onError={(e) => {
          console.error('Failed to load image:', imageUrl);
          e.target.src = '/images/property-placeholder.jpg';
        }}
      />
    );
  };
  
  // Helper function to format address
  const formatAddress = (property) => {
    if (!property) return '';
    
    if (property.location) return property.location;
    
    if (property.address) {
      const { city, state } = property.address;
      if (city && state) return `${city}, ${state}`;
      if (city) return city;
      if (state) return state;
    }
    
    return 'Location not available';
  };
  
  if (isLoading) {
    return <Loader />;
  }
  
  const error = propertiesError || statsError;
  if (error) {
    return <Message variant="danger">{error.message || 'Failed to load dashboard data'}</Message>;
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Agent Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your property listings</p>
        </div>
        
        {/* Agent Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name || 'Agent'}</h2>
                <p className="text-gray-600">{user?.email || 'No email'}</p>
                <p className="text-gray-600">{user?.phone || 'No phone number'}</p>
              </div>
            </div>
            
            <Link 
              to="/agent/profile"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Statistics - Updated to include rejected properties */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Total Properties</h3>
            <p className="text-3xl font-bold text-indigo-600">
              {agentDashboardStats?.totalProperties || userProperties?.length || 0}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-600">
              {agentDashboardStats?.publishedProperties || publishedProperties.length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Pending Approval</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {pendingProperties.length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">
              {rejectedProperties.length}
            </p>
          </div>
        </div>
        
        {/* Recent Activity - New section using dashboard stats */}
        {agentDashboardStats?.recentProperties && agentDashboardStats.recentProperties.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <FaChartLine className="mr-2 text-indigo-600" /> Recent Activity
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {agentDashboardStats.recentProperties.map(property => (
                    <tr key={property._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {renderPropertyImage(property)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{property.title}</div>
                            <div className="text-sm text-gray-500">{formatAddress(property)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${property.price?.toLocaleString() || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.published 
                            ? 'bg-green-100 text-green-800' 
                            : property.rejectionReason
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {property.published 
                            ? 'Published' 
                            : property.rejectionReason 
                              ? 'Rejected' 
                              : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {property.published && (
                            <Link to={`/properties/${property._id}`} className="text-blue-600 hover:text-blue-900">
                              <FaEye />
                            </Link>
                          )}
                          <Link to={`/agent/properties/edit/${property._id}`} className="text-indigo-600 hover:text-indigo-900">
                            <FaEdit />
                          </Link>
                          <button onClick={() => openDeleteModal(property)} className="text-red-600 hover:text-red-900">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Action Button */}
        <div className="mb-8 flex justify-end">
          <Link 
            to="/agent/properties/add" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add New Property
          </Link>
        </div>
        
        {/* Properties Pending Approval */}
        {pendingProperties.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Properties Pending Approval</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    These properties are awaiting admin approval before they will be visible to users.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingProperties.map(property => (
                <div key={property._id} className="relative">
                  <div className="absolute top-0 right-0 bg-yellow-400 text-white py-1 px-3 z-10 rounded-bl-lg">
                    Pending Approval
                  </div>
                  <PropertyCard property={property} />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Link 
                      to={`/agent/properties/edit/${property._id}`}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <FaEdit size={20} />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(property)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rejected Properties */}
        {rejectedProperties.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Rejected Properties</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    These properties were rejected by an administrator. Please review the feedback and make necessary changes before resubmitting.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rejectedProperties.map(property => (
                <div key={property._id} className="relative">
                  <div className="absolute top-0 right-0 bg-red-500 text-white py-1 px-3 z-10 rounded-bl-lg">
                    Rejected
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md bg-white">
                    {/* Property Image */}
                    <div className="h-48 bg-gray-200 relative">
                      {property.images && property.images[0] ? (
                        <img 
                          src={property.images[0].url} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/property-placeholder.jpg';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <FaHome size={48} />
                        </div>
                      )}
                      <div className="absolute top-0 left-0 bg-indigo-500 text-white px-2 py-1 text-sm">
                        {property.status?.replace('-', ' ').toUpperCase() || 'FOR SALE'}
                      </div>
                    </div>
                    
                    {/* Property Details */}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 text-gray-800 truncate">{property.title}</h3>
                      <p className="text-gray-600 mb-2">{formatAddress(property)}</p>
                      <p className="text-indigo-600 font-bold text-xl mb-2">${property.price?.toLocaleString() || 0}</p>
                      
                      {/* Rejection Reason */}
                      <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-md">
                        <h4 className="font-semibold text-red-700 mb-1">Rejection Reason:</h4>
                        <p className="text-sm text-gray-700">{property.rejectionReason}</p>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          {property.bedrooms || 0} beds • {property.bathrooms || 0} baths • {property.size || 0} sqft
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end space-x-2">
                      <Link 
                        to={`/agent/properties/edit/${property._id}`}
                        className="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <FaEdit className="mr-1" /> Edit & Resubmit
                      </Link>
                      <button
                        onClick={() => openDeleteModal(property)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
                {/* Published Properties */}
                <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Published Properties</h2>
          
          {publishedProperties.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">No published properties yet</h3>
              <p className="text-gray-600 mb-4">
                Your approved properties will appear here.
              </p>
              <Link 
                to="/agent/properties/add" 
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
              >
                <FaPlus className="mr-2" /> Add Your First Property
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProperties.map(property => (
                <div key={property._id}>
                  <PropertyCard property={property} />
                  <div className="mt-2 flex justify-end space-x-2">
                    <Link 
                      to={`/properties/${property._id}`}
                      className="text-blue-600 hover:text-blue-800"
                      target="_blank"
                    >
                      <FaEye size={20} />
                    </Link>
                    <Link 
                      to={`/agent/properties/edit/${property._id}`}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <FaEdit size={20} />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(property)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Empty State if no properties at all */}
        {userProperties.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center mt-8">
            <div className="mx-auto h-20 w-20 text-gray-400 mb-4">
              <FaHome size={50} className="mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">No Properties Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start building your property portfolio by adding your first property listing.
            </p>
            <Link 
              to="/agent/properties/add" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
            >
              <FaPlus className="mr-2" /> Add Your First Property
            </Link>
          </div>
        )}
        
        {/* Confirmation Modal for Delete */}
        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDeleteProperty}
          title="Delete Property"
          message={`Are you sure you want to delete "${propertyToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          isLoading={isDeleting}
        />
      </div>
    </div>
  );
};

export default AgentDashboard;
        