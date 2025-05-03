// client/src/pages/dashboard/MyProperties.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

const MyProperties = () => {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  // This will be replaced with actual data fetching in the future
  const dummyProperties = [];

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDelete = (id) => {
    // Will implement actual delete functionality later
    console.log('Delete property with ID:', id);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Properties</h1>
          <p className="text-gray-600">Manage your property listings</p>
        </div>
        <Link
          to="/dashboard/properties/add"
          className="mt-4 md:mt-0 bg-primary text-white px-4 py-2 rounded-md flex items-center justify-center"
        >
          <FaPlus className="mr-2" /> Add New Property
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Properties List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Properties Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't added any properties yet. Start by adding your first property.
          </p>
          <Link
            to="/dashboard/properties/add"
            className="inline-block bg-primary text-white px-4 py-2 rounded-md"
          >
            <FaPlus className="inline mr-2" /> Add Property
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
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {properties.map((property) => (
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
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          property.status === 'for-sale'
                            ? 'bg-blue-100 text-blue-800'
                            : property.status === 'for-rent'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'sold'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {property.status === 'for-sale'
                          ? 'For Sale'
                          : property.status === 'for-rent'
                          ? 'For Rent'
                          : property.status === 'sold'
                          ? 'Sold'
                          : 'Rented'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${property.price.toLocaleString()}
                      {property.status === 'for-rent' && '/mo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {property.views}
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
                          to={`/dashboard/properties/edit/${property._id}`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(property._id)}
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
        </div>
      )}
    </div>
  );
};

export default MyProperties;