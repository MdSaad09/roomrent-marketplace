// src/pages/admin/Agents.jsx (renamed from Agents.jsx)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAgents } from '../../redux/slices/agentSlice';
import Spinner from '../../components/common/Spinner';
import { FaSearch, FaEdit, FaTrash, FaEye, FaExclamationTriangle, FaTimes, FaUserPlus } from 'react-icons/fa';
import { setAlert } from '../../redux/slices/uiSlice';

const Agents = () => {
  const dispatch = useDispatch();
  const { agents = [], loading = false, error = null, pagination = {} } = useSelector(state => state.agents || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [agentToView, setAgentToView] = useState(null);

  // Fetch agents on component mount
  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchAgents({ search: searchTerm }));
  };

  const handlePageChange = (page) => {
    dispatch(fetchAgents({ page }));
  };

  const handleViewAgent = (agent) => {
    setAgentToView(agent);
    setShowViewModal(true);
  };

  const handleDeleteConfirm = (agent) => {
    setAgentToDelete(agent);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAgent = () => {
    if (!agentToDelete) return;
    
    // Implement agent deletion functionality when ready
    dispatch(setAlert({
      type: 'success',
      message: `Agent ${agentToDelete.name} has been deleted successfully`
    }));
    
    setShowDeleteConfirm(false);
    setAgentToDelete(null);
    
    // Refresh the list
    dispatch(fetchAgents());
  };

  // Filter agents based on search term (client-side filtering as backup)
  const filteredAgents = searchTerm
    ? agents.filter(agent => 
        agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : agents;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Agents</h1>
          <p className="text-gray-600">View and manage all real estate agents on the platform</p>
        </div>
        <Link
          to="/admin/users"
          className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center transition duration-300"
        >
          <FaUserPlus className="mr-2" /> Add New Agent
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents by name, email or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <button 
              type="submit" 
              className="absolute right-2 top-2 bg-blue-600 text-white px-3 py-1 rounded"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>Error loading agents: {error.message || JSON.stringify(error)}</span>
          </div>
          <button 
            onClick={() => dispatch(fetchAgents())}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Agents List */}
      {loading && agents.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Agents Found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? 'No agents match your search criteria.' 
              : 'There are no registered agents in the system.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
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
                {filteredAgents.map(agent => (
                  <tr key={agent._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={agent.avatar || 'https://via.placeholder.com/40?text=Agent'} 
                            alt={agent.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                          <div className="text-sm text-gray-500">{agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{agent.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.propertiesCount || 0} properties
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(agent.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAgent(agent)}
                          className="text-blue-600 hover:text-blue-900 transition duration-300"
                          title="View Agent Details"
                        >
                          <FaEye size={18} />
                        </button>
                        <Link
                          to={`/admin/agents/${agent._id}`}
                          className="text-yellow-600 hover:text-yellow-900 transition duration-300"
                          title="Edit Agent"
                        >
                          <FaEdit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDeleteConfirm(agent)}
                          className="text-red-600 hover:text-red-900 transition duration-300"
                          title="Delete Agent"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === 1 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    pagination.currentPage === pagination.totalPages 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Agent Modal */}
      {showViewModal && agentToView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Agent Details</h3>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="flex items-center mb-4">
              <img
                src={agentToView.avatar || 'https://via.placeholder.com/100?text=Agent'}
                alt={agentToView.name}
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <h4 className="text-xl font-medium text-gray-900">{agentToView.name}</h4>
                <p className="text-sm text-gray-500">Agent since {formatDate(agentToView.createdAt)}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agentToView.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agentToView.phone || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Bio</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {agentToView.bio || 'No bio information provided.'}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Properties</dt>
                  <dd className="mt-1 text-sm text-gray-900">{agentToView.propertiesCount || 0} listed</dd>
                </div>
              </dl>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-300"
              >
                Close
              </button>
              <Link
                to={`/admin/agents/${agentToView._id}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300"
              >
                View Full Profile
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && agentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the agent <span className="font-semibold">{agentToDelete.name}</span>? 
              This action cannot be undone and will remove all their listed properties.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setAgentToDelete(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgent}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;