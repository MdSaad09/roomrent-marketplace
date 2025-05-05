// client/src/pages/agent/MyProperties.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProperties, deleteProperty } from '../../redux/slices/propertySlice';
import { fetchAgentDashboardStats } from '../../redux/slices/agentSlice';
import { FaEdit, FaTrash, FaEye, FaExclamationCircle, FaPlus, FaImage, FaFilter, FaSortAmountDown } from 'react-icons/fa';
import ConfirmModal from '../../components/common/ConfirmModal';

const MyProperties = () => {
  const dispatch = useDispatch();
  const { userProperties, loading } = useSelector(state => state.properties);
  const { agentDashboardStats } = useSelector(state => state.agents);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [filters, setFilters] = useState({
    published: '',
    sort: 'newest'
  });
  
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
    
    try {
      setDeletingInProgress(true);
      await dispatch(deleteProperty(propertyToDelete._id)).unwrap();
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
      
      // Refresh properties and stats
      dispatch(fetchUserProperties());
      dispatch(fetchAgentDashboardStats());
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Filter and sort properties based on user selections
  const filteredProperties = userProperties.filter(property => {
    if (filters.published === 'true') return property.published;
    if (filters.published === 'false') return !property.published;
    return true; // Show all if no filter
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (filters.sort === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (filters.sort === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (filters.sort === 'priceAsc') {
      return a.price - b.price;
    } else if (filters.sort === 'priceDesc') {
      return b.price - a.price;
    }
    return 0;
  });

  // Helper function to safely get image URL
  const getPropertyImage = (property) => {
    if (!property.images || property.images.length === 0) {
      return '/images/property-placeholder.jpg';
    }
    
    const firstImage = property.images[0];
    
    // Handle different image data formats
    if (typeof firstImage === 'string') {
      return firstImage;
    } else if (firstImage && firstImage.url) {
      return firstImage.url;
    } else if (firstImage && firstImage.public_id) {
      // If you have a public_id but not a URL, you might need to construct the URL
      return `/uploads/${firstImage.public_id}`;
    } else {
      console.warn('Property has invalid image format:', property.images);
      return '/images/property-placeholder.jpg';
    }
  };
  
  // Group properties by publication status
  const publishedProperties = userProperties.filter(property => property.published);
  const pendingProperties = userProperties.filter(property => !property.published);
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (userProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Properties Found</h2>
        <p className="text-gray-600 mb-6">You haven't created any properties yet.</p>
        <Link
          to="/agent/properties/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md inline-flex items-center"
        >
          <FaPlus className="mr-2" /> Add Your First Property
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
        <Link
          to="/agent/properties/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Add Property
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
          <div className="flex items-center">
            <FaFilter className="mr-2 text-gray-500" />
            <span className="text-gray-700 font-medium">Filters:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-grow">
            <select
              name="published"
              value={filters.published}
              onChange={handleFilterChange}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Properties</option>
              <option value="true">Published</option>
              <option value="false">Pending Approval</option>
            </select>
            
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Property Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-700">Total Properties</h3>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {agentDashboardStats?.totalProperties || userProperties.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-700">Published</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {agentDashboardStats?.publishedProperties || publishedProperties.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-700">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {agentDashboardStats?.unpublishedProperties || pendingProperties.length}
          </p>
        </div>
      </div>
      
      {/* Property List */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-800 mb-2">No properties match your filters</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your filters to see more properties.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProperties.map(property => (
            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/4">
                  <div className="h-48 md:h-full relative">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={getPropertyImage(property)} 
                        alt={property.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.src = '/images/property-placeholder.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaImage className="text-gray-400 text-4xl" />
                      </div>
                    )}
                    <div className={`absolute top-0 right-0 ${property.published ? 'bg-green-500' : 'bg-yellow-400'} text-white py-1 px-3 text-xs`}>
                      {property.published ? 'Published' : 'Pending Approval'}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 md:w-3/4">
                  <div className="flex justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{property.title}</h3>
                    <p className="font-bold text-indigo-600">${property.price.toLocaleString()}</p>
                  </div>
                  
                  <p className="text-gray-600 mb-2">
                    {property.address?.city}, {property.address?.state}
                  </p>
                  
                  <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600 text-sm">
                      <span className="mr-3">Listed: {new Date(property.createdAt).toLocaleDateString()}</span>
                      <span>Views: <span className="font-medium">{property.views || 0}</span></span>
                    </div>
                    
                    <div className="flex space-x-3">
                      {property.published && (
                        <Link
                          to={`/properties/${property._id}`}
                          className="text-blue-600 hover:text-blue-800"
                          
                        >
                          <FaEye className="w-5 h-5" />
                        </Link>
                      )}
                      <Link
                        to={`/agent/properties/edit/${property._id}`}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <FaEdit className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => openDeleteModal(property)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteProperty}
        title="Delete Property"
        message={`Are you sure you want to delete "${propertyToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isLoading={deletingInProgress}
      />
    </div>
  );
};

export default MyProperties;