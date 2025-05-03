// client/src/pages/agent/AddProperty.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createProperty } from '../../redux/slices/propertySlice';
import PropertyForm from '../../components/properties/PropertyForm';
import { FaInfoCircle } from 'react-icons/fa';

const AddProperty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);
  
  const [error, setError] = useState('');
  
  const handleSubmit = async (propertyData) => {
    try {
      // Add owner field to the property data
      propertyData.owner = user.id;
      
      // For agents, properties start as unpublished
      propertyData.published = false;
      
      await dispatch(createProperty(propertyData)).unwrap();
      navigate('/agent/properties');
    } catch (err) {
      setError(err.message || 'Failed to create property. Please try again.');
    }
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Property</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaInfoCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Your property will be reviewed by our administrators before being published.
              This typically takes 24-48 hours.
            </p>
          </div>
        </div>
      </div>
      
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
        onSubmit={handleSubmit} 
        loading={loading}
        isAgent={true}
      />
    </div>
  );
};

export default AddProperty;