// client/src/pages/agent/AgentDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProperties, deleteProperty } from '../../redux/slices/propertySlice';
import { FaPlus, FaEdit, FaTrash, FaEye, FaExclamationCircle } from 'react-icons/fa';
import PropertyCard from '../../components/properties/PropertyCard';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import Message from '../../components/common/Message';

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const { userProperties, loading, error } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUserProperties());
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
    } catch (error) {
      console.error('Failed to delete property:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Filter for published and unpublished properties
  const publishedProperties = userProperties?.filter(prop => prop.published) || [];
  const pendingProperties = userProperties?.filter(prop => !prop.published) || [];
  
  if (loading && !userProperties.length) {
    return <Loader />;
  }
  
  if (error) {
    return <Message variant="danger">{error.message || 'Failed to load properties'}</Message>;
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
              <img 
                src={user?.avatar || 'https://via.placeholder.com/60'} 
                alt={user?.name}
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{user?.name}</h2>
                <p className="text-gray-600">{user?.email}</p>
                <p className="text-gray-600">{user?.phone || 'No phone number'}</p>
              </div>
            </div>
            
            <Link 
              to="/profile"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Total Properties</h3>
            <p className="text-3xl font-bold text-indigo-600">{userProperties?.length || 0}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Published</h3>
            <p className="text-3xl font-bold text-green-600">{publishedProperties.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-2">Pending Approval</h3>
            <p className="text-3xl font-bold text-yellow-600">{pendingProperties.length}</p>
          </div>
        </div>
        
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