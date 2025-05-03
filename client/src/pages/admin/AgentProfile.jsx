import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAgentById, fetchAgentProperties, clearAgentData } from '../../redux/slices/agentSlice';  // Update import path
import PropertyCard from '../../components/properties/PropertyCard';  // Update import path
import Spinner from '../../components/common/Spinner';
import { 
  FaEnvelope, 
  FaPhone, 
  FaUser, 
  FaCalendarAlt, 
  FaHome, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft 
} from 'react-icons/fa';
import { setAlert } from '../../redux/slices/uiSlice';  // Import setAlert for notifications

const AgentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { agent, loading, error } = useSelector(state => state.agents);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  useEffect(() => {
    dispatch(fetchAgentById(id));
    dispatch(fetchAgentProperties(id));
    
    return () => {
      dispatch(clearAgentData());
    };
  }, [dispatch, id]);
  
  // Function to handle agent deletion
  const handleDeleteAgent = () => {
    // This would be implemented with an actual delete action
    // For now, we'll just show an alert and navigate back
    dispatch(setAlert({
      type: 'success',
      message: `Agent ${agent.name} has been deleted successfully`
    }));
    
    setShowDeleteConfirm(false);
    navigate('/admin/agents');
  };
  
  if (loading && !agent) {
    return <Spinner />;
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error.message || 'Error loading agent profile'}
        </div>
        <div className="mt-4">
          <Link to="/admin/agents" className="text-blue-600 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to agents
          </Link>
        </div>
      </div>
    );
  }
  
  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Agent not found</p>
        </div>
        <div className="mt-4">
          <Link to="/admin/agents" className="text-blue-600 hover:underline flex items-center">
            <FaArrowLeft className="mr-2" /> Back to agents
          </Link>
        </div>
      </div>
    );
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-between items-center mb-6">
        <Link to="/admin/agents" className="text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Back to agents
        </Link>
        
        <div className="flex space-x-3">
          <button 
            className="flex items-center text-yellow-600 hover:text-yellow-800"
            title="Edit Agent"
          >
            <FaEdit size={18} className="mr-1" /> Edit
          </button>
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center text-red-600 hover:text-red-800"
            title="Delete Agent"
          >
            <FaTrash size={18} className="mr-1" /> Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Agent header section */}
        <div className="md:flex">
          <div className="md:w-1/3 p-6">
            <img 
              src={agent.avatar} 
              alt={agent.name} 
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{agent.name}</h1>
              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <p className="text-gray-600 mb-6">Real Estate Agent</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-700">
                <FaEnvelope className="mr-2 text-blue-600" />
                <span>{agent.email}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <FaPhone className="mr-2 text-blue-600" />
                <span>{agent.phone || 'Not provided'}</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <FaHome className="mr-2 text-blue-600" />
                <span>{agent.properties?.length || 0} Properties</span>
              </div>
              
              <div className="flex items-center text-gray-700">
                <FaCalendarAlt className="mr-2 text-blue-600" />
                <span>Member since {formatDate(agent.createdAt)}</span>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">About</h2>
              <p className="text-gray-600">
                {agent.bio || 'No bio provided.'}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href={`mailto:${agent.email}`} 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center"
              >
                <FaEnvelope className="mr-2" /> Email Agent
              </a>
              <a 
                href={`tel:${agent.phone}`} 
                className={`bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition flex items-center ${!agent.phone && 'opacity-50 cursor-not-allowed'}`}
                onClick={e => !agent.phone && e.preventDefault()}
              >
                <FaPhone className="mr-2" /> Call Agent
              </a>
            </div>
          </div>
        </div>
        
        {/* Admin Actions Panel */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Admin Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Status</h4>
              <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending Review</option>
              </select>
              <button className="mt-2 w-full bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700">
                Update Status
              </button>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-sm font-semibold text-yellow-800 mb-1">Featured Agent</h4>
              <label className="inline-flex items-center mt-2">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                <span className="ml-2 text-gray-700">Mark as featured agent</span>
              </label>
              <p className="text-xs text-gray-500 mt-2">Featured agents appear on the homepage and get priority in search results.</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-semibold text-purple-800 mb-1">Property Approval</h4>
              <p className="text-sm text-gray-600 mb-2">
                This agent has <span className="font-semibold">{agent.pendingProperties?.length || 0}</span> properties pending approval.
              </p>
              <Link
                to="/admin/properties/pending" 
                className="inline-block text-purple-700 hover:text-purple-900 font-medium text-sm"
              >
                Review pending properties →
              </Link>
            </div>
          </div>
        </div>
        
        {/* Agent properties section */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Agent Properties</h2>
            <Link 
              to="/admin/properties" 
              className="text-blue-600 hover:text-blue-800"
            >
              View all properties
            </Link>
          </div>
          
          {loading ? (
            <Spinner />
          ) : agent.properties && agent.properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agent.properties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">This agent has no listed properties.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the agent <span className="font-semibold">{agent.name}</span>? 
              This action cannot be undone and will remove all their listed properties.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

export default AgentProfile;