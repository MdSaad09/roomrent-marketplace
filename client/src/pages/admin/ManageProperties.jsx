// client/src/pages/admin/ManageProperties.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProperties, 
  deleteProperty, 
  updateProperty 
} from '../../redux/slices/propertySlice';
import { setAlert } from '../../redux/slices/uiSlice';

const ManageProperties = () => {
  const dispatch = useDispatch();
  const { properties, loading, pagination } = useSelector(state => state.properties);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Fetch properties on component mount
  // In the useEffect where you fetch properties
  useEffect(() => {
    // In the loadProperties function
    const loadProperties = async () => {
      try {
        // console.log('Fetching properties with includeUnpublished=true');
        // console.log('Current auth token:', localStorage.getItem('token'));
        
        await dispatch(fetchProperties({ 
          page, 
          limit,
          includeUnpublished: true 
        })).unwrap();
        
        // console.log('Properties fetched successfully:', properties);
      } catch (error) {
        // console.error('Error fetching properties:', error);
        dispatch(setAlert({
          type: 'error',
          message: error.message || 'Failed to fetch properties'
        }));
      }
    };
    
    loadProperties();
  }, [dispatch, page, limit, filter]); // Add filter to dependency array

  // Filter and search properties
  useEffect(() => {
    if (!properties) return;
    
    let result = [...properties];
    
    // Apply filter
    if (filter !== 'all') {
      if (filter === 'featured') {
        result = result.filter(property => property.featured);
      } else if (filter === 'unpublished') {
        result = result.filter(property => !property.published);
      } else {
        result = result.filter(property => property.status === filter);
      }
    }
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(property => 
        property.title.toLowerCase().includes(search) ||
        property.address.city.toLowerCase().includes(search) ||
        property.address.state.toLowerCase().includes(search)
      );
    }
    
    setFilteredProperties(result);
  }, [properties, filter, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    
    // Refresh properties when filter changes
    dispatch(fetchProperties({ 
      page, 
      limit,
      includeUnpublished: true 
    }));
  };

  const openDeleteModal = (property) => {
    console.log("Opening delete modal for property:", property);
    setPropertyToDelete(property);
    setDeleteModalOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete || deletingInProgress) {
      console.log("No property to delete or deletion already in progress");
      return;
    }
    
    try {
      setDeletingInProgress(true);
      console.log('Attempting to delete property:', propertyToDelete._id);
      
      // Dispatch the delete action and wait for it to complete
      await dispatch(deleteProperty(propertyToDelete._id)).unwrap();
      
      dispatch(setAlert({
        type: 'success',
        message: 'Property deleted successfully'
      }));
      
      // Refresh the properties list with includeUnpublished
      await dispatch(fetchProperties({ 
        page, 
        limit, 
        includeUnpublished: true 
      })).unwrap();
      
      setDeleteModalOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      console.error('Error deleting property:', error);
      dispatch(setAlert({
        type: 'error',
        message: error.message || 'Failed to delete property. Please try again.'
      }));
    } finally {
      setDeletingInProgress(false);
    }
  };

  const handleToggleFeature = async (id, featured) => {
    try {
      await dispatch(updateProperty({
        id,
        propertyData: { featured: !featured }
      })).unwrap();
      
      dispatch(setAlert({
        type: 'success',
        message: `Property ${!featured ? 'added to' : 'removed from'} featured listings`
      }));
    } catch (error) {
      dispatch(setAlert({
        type: 'error',
        message: error.message || 'Failed to update property'
      }));
    }
  };

  const handleTogglePublish = async (id, published) => {
    try {
      await dispatch(updateProperty({
        id,
        propertyData: { published: !published }
      })).unwrap();
      
      dispatch(setAlert({
        type: 'success',
        message: `Property ${!published ? 'published' : 'unpublished'} successfully`
      }));
    } catch (error) {
      dispatch(setAlert({
        type: 'error',
        message: error.message || 'Failed to update property'
      }));
    }
  };

  // Function to handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Properties</h1>
          <p className="text-gray-600">Manage all property listings on the platform</p>
        </div>
        <Link 
          to="/admin/properties/add" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Add Property
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <div>
            <select
              value={filter}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Properties</option>
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="featured">Featured</option>
              <option value="unpublished">Unpublished</option>
            </select>
          </div>
        </div>
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            No properties match your search criteria or there are no properties in the system.
          </p>
          <Link 
            to="/admin/properties/add" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <FaPlus className="mr-2" /> Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProperties.map(property => (
                  <tr key={property._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded object-cover" 
                            src={property.images[0]?.url || 'https://via.placeholder.com/40?text=No+Image'} 
                            alt={property.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{property.title}</div>
                          <div className="text-xs text-gray-500">
                            {property.address.city}, {property.address.state}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === 'for-sale' 
                          ? 'bg-blue-100 text-blue-800' 
                          : property.status === 'for-rent'
                          ? 'bg-green-100 text-green-800'
                          : property.status === 'sold'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {property.status === 'for-sale' ? 'For Sale' : 
                         property.status === 'for-rent' ? 'For Rent' : 
                         property.status === 'sold' ? 'Sold' : 'Rented'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{property.price.toLocaleString()}
                      {property.status === 'for-rent' && '/mo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleFeature(property._id, property.featured)}
                        className={`p-1 rounded-full ${
                          property.featured 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        title={property.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        {property.featured ? <FaCheck /> : <FaTimes />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleTogglePublish(property._id, property.published)}
                        className={`p-1 rounded-full ${
                          property.published 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        title={property.published ? 'Unpublish' : 'Publish'}
                      >
                        {property.published ? <FaCheck /> : <FaTimes />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Link
                          to={`/properties/${property._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/properties/edit/${property._id}`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => openDeleteModal(property)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded ${
                    pagination.currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal - inline implementation instead of the ConfirmModal component */}
      {deleteModalOpen && propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Delete Property</h3>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{propertyToDelete?.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPropertyToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-300"
                disabled={deletingInProgress}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProperty}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-300 flex items-center justify-center"
                disabled={deletingInProgress}
              >
                {deletingInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProperties;