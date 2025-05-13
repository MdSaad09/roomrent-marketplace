import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaEnvelope, FaSearch, FaExclamationTriangle, FaEye, FaCheck, FaTimes, FaTrash, FaHome } from 'react-icons/fa';
import axios from 'axios';
import { setAlert } from '../../redux/slices/uiSlice';

const Inquiries = () => {
  const dispatch = useDispatch();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/inquiries', {
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

  const updateInquiryStatus = async (id, status) => {
    try {
      const response = await axios.put(`/api/admin/inquiries/${id}/status`, 
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data.success) {
        // Update the inquiry in the state
        setInquiries(prevInquiries => 
          prevInquiries.map(inq => 
            inq._id === id ? { ...inq, status } : inq
          )
        );
        
        dispatch(setAlert({
          type: 'success',
          message: `Inquiry marked as ${status}`
        }));
        
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry({ ...selectedInquiry, status });
        }
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      dispatch(setAlert({
        type: 'error',
        message: 'Failed to update inquiry status'
      }));
    }
  };

  const openDeleteModal = (inquiry) => {
    setInquiryToDelete(inquiry);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setInquiryToDelete(null);
  };

  const deleteInquiry = async (id) => {
    try {
      const response = await axios.delete(`/api/admin/inquiries/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        // Remove the inquiry from the state
        setInquiries(prevInquiries => 
          prevInquiries.filter(inq => inq._id !== id)
        );
        
        dispatch(setAlert({
          type: 'success',
          message: 'Inquiry deleted successfully'
        }));
        
        // Close modals if the deleted inquiry was being viewed
        if (selectedInquiry && selectedInquiry._id === id) {
          setShowModal(false);
        }
        closeDeleteModal();
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      dispatch(setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete inquiry'
      }));
      closeDeleteModal();
    }
  };

  // Filter inquiries based on search term
  const filteredInquiries = searchTerm
    ? inquiries.filter(inquiry => 
        inquiry.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-800">Inquiries</h1>
        <p className="text-gray-600">Manage property inquiries from users</p>
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
              : 'There are no inquiries in the system yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map(inquiry => (
                  <tr key={inquiry._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {inquiry.user?.avatar ? (
                            <img 
                              src={inquiry.user.avatar} 
                              alt={inquiry.user.name} 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-500 font-semibold">
                              {inquiry.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{inquiry.user?.name || 'Unknown User'}</div>
                          <div className="text-sm text-gray-500">{inquiry.user?.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{inquiry.property?.title || 'Unknown Property'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{inquiry.message}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : inquiry.status === 'responded' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => viewInquiry(inquiry)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {inquiry.status === 'pending' && (
                          <button
                            onClick={() => updateInquiryStatus(inquiry._id, 'responded')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Mark as Responded"
                          >
                            <FaCheck />
                          </button>
                        )}
                        {inquiry.status !== 'closed' && (
                          <button
                            onClick={() => updateInquiryStatus(inquiry._id, 'closed')}
                            className="text-gray-600 hover:text-gray-900"
                            title="Close Inquiry"
                          >
                            <FaTimes />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(inquiry)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Inquiry"
                        >
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
      
      {/* Inquiry Detail Modal with updated delete button */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Inquiry Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Property</h3>
                <div className="flex items-center">
                  {selectedInquiry.property?.images?.[0]?.url ? (
                    <img 
                      src={selectedInquiry.property.images[0].url} 
                      alt={selectedInquiry.property.title} 
                      className="h-16 w-16 object-cover rounded-md mr-3"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                      <FaHome className="text-gray-400 text-xl" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{selectedInquiry.property?.title || 'Unknown Property'}</p>
                    <p className="text-sm text-gray-600">ID: {selectedInquiry.property?._id || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">From</h3>
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    {selectedInquiry.user?.avatar ? (
                      <img 
                        src={selectedInquiry.user.avatar} 
                        alt={selectedInquiry.user.name} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        {selectedInquiry.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{selectedInquiry.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600">{selectedInquiry.user?.email || 'No email'}</p>
                    <p className="text-sm text-gray-600">Phone: {selectedInquiry.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Message</h3>
                <p className="text-gray-600 whitespace-pre-line">{selectedInquiry.message}</p>
              </div>
              
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-700">Status</h3>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedInquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : selectedInquiry.status === 'responded' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Received on {formatDate(selectedInquiry.createdAt)}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    openDeleteModal(selectedInquiry);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Inquiry
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedInquiry.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateInquiryStatus(selectedInquiry._id, 'responded');
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Mark as Responded
                  </button>
                )}
                {selectedInquiry.status !== 'closed' && (
                  <button
                    onClick={() => {
                      updateInquiryStatus(selectedInquiry._id, 'closed');
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Close Inquiry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && inquiryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <FaExclamationTriangle className="text-red-500 mr-3 text-xl" />
                <div>
                  <p className="font-medium text-red-600">Warning: This action cannot be undone</p>
                  <p className="text-gray-600 mt-1">All information associated with this inquiry will be permanently deleted.</p>
                </div>
              </div>
              
              <p className="text-gray-700">
                Are you sure you want to delete the inquiry from <span className="font-semibold">{inquiryToDelete.user?.name || 'Unknown User'}</span>?
              </p>
              
              {inquiryToDelete.property && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-500">Property: {inquiryToDelete.property?.title || 'Unknown Property'}</p>
                  <p className="text-sm text-gray-500 mt-1 truncate">Message: {inquiryToDelete.message}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteInquiry(inquiryToDelete._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inquiries;