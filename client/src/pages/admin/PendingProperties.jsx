import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPendingProperties, approveProperty } from '../../redux/slices/propertySlice';
import Spinner from '../../components/common/Spinner';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const PendingProperties = () => {
  const dispatch = useDispatch();
  const { pendingProperties, loading, error } = useSelector(state => state.properties);
  
  useEffect(() => {
    dispatch(getPendingProperties());
  }, [dispatch]);
  
  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this property?')) {
      dispatch(approveProperty(id))
        .then(() => {
          // Property will be automatically removed from the list via Redux state update
        });
    }
  };
  
  if (loading && !pendingProperties) {
    return <Spinner />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Properties Pending Approval</h1>
      
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
        <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">Property</th>
              <th className="py-3 px-4 text-left">Agent</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Created</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pendingProperties && pendingProperties.map(property => (
              <tr key={property._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    {property.images && property.images[0] ? (
                      <img 
                        src={property.images[0].url} 
                        alt={property.title}
                        className="h-10 w-10 rounded-md object-cover mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-200 mr-3 flex items-center justify-center text-gray-500">
                        No img
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{property.title}</p>
                      <p className="text-sm text-gray-500">
                        {property.address?.city}, {property.address?.state}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  {property.owner && (
                    <div className="flex items-center">
                      <img 
                        src={property.owner.avatar} 
                        alt={property.owner.name}
                        className="h-8 w-8 rounded-full object-cover mr-2"
                      />
                      <div>
                        <p>{property.owner.name}</p>
                        <p className="text-xs text-gray-500">{property.owner.email}</p>
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="capitalize">{property.type}</span>
                </td>
                <td className="py-3 px-4">
                  ${property.price.toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <span className="capitalize px-2 py-1 rounded text-xs font-semibold text-white bg-yellow-500">
                    {property.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {new Date(property.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-center space-x-3">
                    <Link
                      to={`/properties/${property._id}`}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="View Property"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleApprove(property._id)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Approve Property"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => {/* Implement reject functionality if needed */}}
                      className="text-red-600 hover:text-red-900 p-1"
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
    )}
  </div>
);
};

export default PendingProperties;