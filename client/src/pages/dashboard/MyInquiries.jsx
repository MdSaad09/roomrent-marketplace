import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAlert } from '../../redux/slices/uiSlice';
import { FaEnvelope, FaSearch, FaReply, FaExclamationTriangle, FaEye, FaHome } from 'react-icons/fa';
import axios from 'axios';

const MyInquiries = () => {
  const dispatch = useDispatch();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/inquiries/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setInquiries(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch inquiries');
      }
    } catch (err) {
      console.error('Error fetching inquiries:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
      dispatch(setAlert({
        type: 'error',
        message: 'Failed to load inquiries'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const viewInquiry = (inquiry) => {
    setSelectedInquiry(inquiry);
    setShowModal(true);
  };

  // Filter inquiries based on search term
  const filteredInquiries = searchTerm
    ? inquiries.filter(inquiry => 
        inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.property?.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : inquiries;

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Inquiries</h1>
        <p className="text-gray-600">View and manage your property inquiries</p>
      </div>
      
      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>Error: {error}</span>
          </div>
          <button 
            onClick={fetchInquiries}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="flex justify-center mb-4">
            <FaEnvelope className="text-gray-400 text-5xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Inquiries Found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'No inquiries match your search criteria.' 
              : 'You have not sent any inquiries yet.'}
          </p>
          <Link to="/properties" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {inquiry.property?.images && inquiry.property.images[0] ? (
                            <img 
                              src={typeof inquiry.property.images[0] === 'string' 
                                ? inquiry.property.images[0] 
                                : inquiry.property.images[0].url} 
                              alt={inquiry.property.title} 
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <FaHome className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {inquiry.property?.title || 'Unknown Property'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {inquiry.property?.address?.city && inquiry.property?.address?.state 
                              ? `${inquiry.property.address.city}, ${inquiry.property.address.state}` 
                              : 'Location not available'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {inquiry.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          inquiry.status === 'responded' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewInquiry(inquiry)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FaEye className="inline" /> View
                      </button>
                      <Link 
                        to={`/properties/${inquiry.property?._id}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaHome className="inline" /> Property
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Inquiry Detail Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-gray-800">Inquiry Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mt-4 border-t pt-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedInquiry.property?.title || 'Unknown Property'}
                  </h3>
                  <p className="text-gray-600">
                    {selectedInquiry.property?.address?.city && selectedInquiry.property?.address?.state 
                      ? `${selectedInquiry.property.address.city}, ${selectedInquiry.property.address.state}` 
                      : 'Location not available'}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700">Your Message:</h4>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-line">{selectedInquiry.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Sent on {formatDate(selectedInquiry.createdAt)}
                    </p>
                  </div>
                </div>
                
                {selectedInquiry.status === 'responded' && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700">Owner's Response:</h4>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-line">
                        {/* This would need to be updated once you implement response storage */}
                        Thank you for your interest in this property. Please contact me at {selectedInquiry.property?.owner?.phone || 'phone number'} to schedule a viewing.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <Link 
                    to={`/properties/${selectedInquiry.property?._id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                  >
                    View Property
                  </Link>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyInquiries;