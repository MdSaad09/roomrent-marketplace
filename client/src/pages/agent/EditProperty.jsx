// client/src/pages/agent/EditProperty.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById, updateProperty } from '../../redux/slices/propertySlice';
import PropertyForm from '../../components/properties/PropertyForm';
import { FaInfoCircle } from 'react-icons/fa';

const EditProperty = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { property, loading } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);
  
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  
  useEffect(() => {
    const loadProperty = async () => {
      try {
        await dispatch(fetchPropertyById(id)).unwrap();
        setInitialLoading(false);
      } catch (err) {
        setError('Failed to load property details');
        setInitialLoading(false);
      }
    };
    
    loadProperty();
  }, [dispatch, id]);
  
  // Make sure the agent can only edit their own properties
  useEffect(() => {
    if (!initialLoading && property && property.owner && property.owner._id !== user.id) {
      navigate('/unauthorized');
    }
  }, [property, user, initialLoading, navigate]);
  
  const handleSubmit = async (propertyData) => {
    try {
      // For agents, ensure the property stays unpublished after edits
      if (user.role === 'agent') {
        propertyData.published = false;
      }
      
      await dispatch(updateProperty({ id, propertyData })).unwrap();
      navigate('/agent/properties');
    } catch (err) {
      setError(err.message || 'Failed to update property. Please try again.');
    }
  };
  
  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">Property not found or you don't have permission to edit it.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Property</h1>
      
      {!property.published && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This property is currently pending approval. Any changes you make will also need to be approved before publishing.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <PropertyForm 
        property={property} 
        onSubmit={handleSubmit} 
        loading={loading}
        isAgent={true}
      />
    </div>
  );
};

export default EditProperty;