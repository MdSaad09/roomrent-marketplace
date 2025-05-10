// client/src/pages/agent/EditProperty.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById, updateProperty, resubmitRejectedProperty } from '../../redux/slices/propertySlice';
import PropertyForm from '../../components/properties/PropertyForm';
import { FaInfoCircle, FaExclamationCircle } from 'react-icons/fa';
import { setAlert } from '../../redux/slices/uiSlice';

const EditProperty = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  console.log("Agent EditProperty Component - Property ID:", id); // Debug log
  
  const { property, loading } = useSelector(state => state.properties);
  const { user } = useSelector(state => state.auth);
  
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [isResubmitting, setIsResubmitting] = useState(false);
  
  useEffect(() => {
    const loadProperty = async () => {
      setInitialLoading(true);
      try {
        console.log("Fetching property data for ID:", id);
        const result = await dispatch(fetchPropertyById(id)).unwrap();
        console.log("Property data fetched:", result);
        setInitialLoading(false);
      } catch (err) {
        console.error("Error fetching property:", err);
        setError('Failed to load property details');
        setInitialLoading(false);
        dispatch(setAlert({
          type: 'error',
          message: 'Failed to load property details: ' + (err.message || '')
        }));
      }
    };
    
    if (id) {
      loadProperty();
    } else {
      console.error("No property ID found in URL params");
      setError('Property ID not found');
      setInitialLoading(false);
    }
  }, [dispatch, id]);
  
  // Make sure the agent can only edit their own properties
  useEffect(() => {
    if (!initialLoading && property) {
      console.log("Checking ownership - Property owner:", property.owner, "User:", user);
      
      // Get owner ID, handling both object and string formats
      const ownerId = property.owner?._id || property.owner;
      const userId = user?.id || user?._id;
      
      if (ownerId && userId && ownerId !== userId) {
        console.warn("User is not the owner of this property, redirecting");
        dispatch(setAlert({
          type: 'error',
          message: 'You do not have permission to edit this property'
        }));
        navigate('/unauthorized');
      }
    }
  }, [property, user, initialLoading, navigate, dispatch]);
  
  const handleSubmit = async (propertyData) => {
    try {
      console.log("Submitting property update:", propertyData);
      
      // Check if this is a resubmission of a rejected property
      const isRejected = property.rejectionReason && property.rejectionReason.trim() !== '';
      
      if (isRejected) {
        setIsResubmitting(true);
        // Use the resubmit endpoint for rejected properties
        await dispatch(resubmitRejectedProperty({ id, propertyData })).unwrap();
        dispatch(setAlert({
          type: 'success',
          message: 'Property resubmitted for approval'
        }));
      } else {
        // For agents, ensure the property stays unpublished after edits
        if (user.role === 'agent') {
          propertyData.published = false;
        }
        
        await dispatch(updateProperty({ id, propertyData })).unwrap();
        
        dispatch(setAlert({
          type: 'success',
          message: 'Property updated successfully'
        }));
      }
      
      navigate('/agent/properties');
    } catch (err) {
      console.error("Error updating property:", err);
      setError(err.message || 'Failed to update property. Please try again.');
      dispatch(setAlert({
        type: 'error',
        message: 'Failed to update property: ' + (err.message || '')
      }));
    } finally {
      setIsResubmitting(false);
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
            <p className="text-sm text-red-700">
              {error || "Property not found or you don't have permission to edit it."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const isRejected = property.rejectionReason && property.rejectionReason.trim() !== '';
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Property</h1>

      {/* Rejection Notice */}
      {isRejected && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaExclamationCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">This property was rejected</h3>
                <div className="mt-2 text-red-700">
                  <p><strong>Reason:</strong> {property.rejectionReason}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">
                    Please address the issues mentioned above and then resubmit for review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pending Notice (only show if not rejected) */}
      {!property.published && !isRejected && (
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
        loading={loading || isResubmitting}
        isAgent={true}
        submitButtonText={isRejected ? "Resubmit for Approval" : "Update Property"}
      />
    </div>
  );
};

export default EditProperty;