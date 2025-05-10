// src/pages/admin/PendingProperties.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingProperties, approveProperty } from '../../redux/slices/propertySlice';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaEye, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { setAlert } from '../../redux/slices/uiSlice';

const PendingProperties = () => {
  const dispatch = useDispatch();
  const { pendingProperties, loading, error } = useSelector(state => state.properties);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [showReasonModal, setShowReasonModal] = useState(null);
  const [rejectingProperty, setRejectingProperty] = useState(false);
  
  useEffect(() => {
    dispatch(getPendingProperties());
  }, [dispatch]);
  
  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this property?')) {
      dispatch(approveProperty(id))
        .then(() => {
          // Property will be automatically removed from the list via Redux state update
          dispatch(setAlert({
            type: 'success',
            message: 'Property approved successfully'
          }));
        })
        .catch(error => {
          dispatch(setAlert({
            type: 'error',
            message: error.message || 'Failed to approve property'
          }));
        });
    }
  };

  const openRejectionModal = (id) => {
    setShowReasonModal(id);
  };

  const handleReject = async (id) => {
    if (!rejectionReasons[id] || !rejectionReasons[id].trim()) {
      dispatch(setAlert({
        type: 'error',
        message: 'Please provide a reason for rejection'
      }));
      return;
    }

    try {
      setRejectingProperty(true);
      
      // Use direct axios call to the reject endpoint
      const response = await axios.put(
        `/api/properties/${id}/reject`, 
        { reason: rejectionReasons[id] },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        dispatch(setAlert({
          type: 'success',
          message: 'Property rejected successfully'
        }));
        
        // Close the modal and clear the reason
        setShowReasonModal(null);
        setRejectionReasons(prev => ({ ...prev, [id]: '' }));
        
        // Refresh the list of pending properties to reflect the change
        dispatch(getPendingProperties());
      } else {
        throw new Error(response.data.message || 'Failed to reject property');
      }
    } catch (error) {
      console.error('Error rejecting property:', error);
      dispatch(setAlert({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to reject property'
      }));
    } finally {
      setRejectingProperty(false);
    }
  };

  const handleReasonChange = (id, value) => {
    setRejectionReasons(prev => ({ ...prev, [id]: value }));
  };
  
  if (loading && !pendingProperties) {
    return <Spinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Properties Pending Approval</h1>
        <Link 
          to="/admin/properties" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-200"
        >
          All Properties
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p>{error.message || 'An error occurred while fetching pending properties.'}</p>
        </div>
      )}
      
      {!loading && (!pendingProperties || pendingProperties.length === 0) ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No properties pending approval.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingProperties && pendingProperties.map(property => (
                  <tr key={property._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {property.images && property.images[0] ? (
                          <img 
                            src={property.images[0].url} 
                            alt={property.title}
                            className="h-10 w-10 rounded-md object-cover mr-3"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                            No img
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{property.title}</p>
                          <p className="text-sm text-gray-500">
                            {property.address?.city}, {property.address?.state}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {property.owner && (
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2">
                            {property.owner.name ? property.owner.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <p className="text-sm text-gray-900">{property.owner.name || 'Unknown Agent'}</p>
                            <p className="text-xs text-gray-500">{property.owner.email || 'No email'}</p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                        {property.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${property.price?.toLocaleString() || '0'}
                      {property.status === 'for-rent' && '/mo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">
                        {property.status?.replace('-', ' ') || 'unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(property.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link
                          to={`/properties/${property._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Property"
                          target="_blank"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/properties/edit/${property._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Property"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleApprove(property._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Property"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => openRejectionModal(property._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject Property"
                        >
                          <FaTimes />
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

      {/* Rejection Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Provide Rejection Reason</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows="4"
              placeholder="Enter reason for rejection..."
              value={rejectionReasons[showReasonModal] || ''}
              onChange={(e) => handleReasonChange(showReasonModal, e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => setShowReasonModal(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                onClick={() => handleReject(showReasonModal)}
                disabled={rejectingProperty}
              >
                {rejectingProperty ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Rejecting...
                  </>
                ) : (
                  'Reject Property'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingProperties;