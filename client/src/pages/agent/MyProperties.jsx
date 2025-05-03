// client/src/pages/agent/MyProperties.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProperties, deleteProperty } from '../../redux/slices/propertySlice';
import { FaEdit, FaTrash, FaEye, FaExclamationCircle, FaPlus, FaImage } from 'react-icons/fa';
import ConfirmModal from '../../components/common/ConfirmModal';

const MyProperties = () => {
  const dispatch = useDispatch();
  const { userProperties, loading } = useSelector(state => state.properties);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUserProperties());
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
      
      // Refresh properties
      dispatch(fetchUserProperties());
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setDeletingInProgress(false);
    }
  };

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
      
      {/* Pending Properties */}
      {pendingProperties.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Approval</h2>
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
          
          <div className="space-y-4">
            {pendingProperties.map(property => (
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
                      <div className="absolute top-0 right-0 bg-yellow-400 text-white py-1 px-3 text-xs">
                        Pending Approval
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:w-3/4">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{property.title}</h3>
                      <p className="font-bold text-indigo-600">${property.price.toLocaleString()}</p>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      {property.address.city}, {property.address.state}
                    </p>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>
                    
                    <div className="flex justify-end space-x-3">
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
            ))}
          </div>
        </div>
      )}
      
      {/* Published Properties */}
      {publishedProperties.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Published Properties</h2>
          
          <div className="space-y-4">
            {publishedProperties.map(property => (
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
                      <div className="absolute top-0 right-0 bg-green-500 text-white py-1 px-3 text-xs">
                        Published
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 md:w-3/4">
                    <div className="flex justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{property.title}</h3>
                      <p className="font-bold text-indigo-600">${property.price.toLocaleString()}</p>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      {property.address.city}, {property.address.state}
                    </p>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">{property.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-gray-600 text-sm">
                        Views: <span className="font-medium">{property.views || 0}</span>
                      </div>
                      
                      <div className="flex space-x-3">
                        <Link
                          to={`/properties/${property._id}`}
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaEye className="w-5 h-5" />
                        </Link>
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