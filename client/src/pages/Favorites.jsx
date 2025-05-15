// client/src/pages/Favorites.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaTrash, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProperties } from '../redux/slices/propertySlice';
import { setAlert } from '../redux/slices/uiSlice';
import axios from 'axios';

const Favorites = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { properties } = useSelector(state => state.properties);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState(null);

  // Debug user favorites
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User favorites:', user?.favorites);
  }, [user]);

  // Debug properties
  useEffect(() => {
    console.log('Current properties:', properties);
  }, [properties]);

  // Fetch properties if needed
  useEffect(() => {
    const loadProperties = async () => {
      try {
        if (!properties || properties.length === 0) {
          console.log('Fetching properties...');
          const result = await dispatch(fetchProperties()).unwrap();
          console.log('Fetched properties result:', result);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      }
    };
    
    loadProperties();
  }, [dispatch, properties]);

  // Fetch favorite properties directly from the API
  useEffect(() => {
    const fetchUserFavorites = async () => {
      try {
        console.log('Fetching user favorites directly...');
        setLoading(true);
        
        // Get user favorites from API
        const favoritesResponse = await axios.get('/api/users/favorites', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('API favorites response:', favoritesResponse.data);
        
        if (favoritesResponse.data.success) {
          // Get favorite IDs
          const favoriteIds = favoritesResponse.data.data;
          
          if (!favoriteIds || favoriteIds.length === 0) {
            console.log('No favorites found');
            setFavorites([]);
            setLoading(false);
            return;
          }
          
          console.log('Favorite IDs:', favoriteIds);
          
          // If we have properties in Redux, use those
          if (properties && properties.length > 0) {
            console.log('Matching with Redux properties');
            const favoriteProperties = properties.filter(property => 
              favoriteIds.some(id => 
                id.toString() === property._id.toString()
              )
            );
            
            console.log('Matched favorite properties:', favoriteProperties);
            setFavorites(favoriteProperties);
          } else {
            // Otherwise fetch the full properties
            console.log('Fetching full property details for favorites');
            
            // Get all properties
            const propertiesResponse = await axios.get('/api/properties', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            const allProperties = propertiesResponse.data.data || [];
            console.log('All properties:', allProperties);
            
            // Filter to get only favorites
            const favoriteProperties = allProperties.filter(property => 
              favoriteIds.some(id => 
                id.toString() === property._id.toString()
              )
            );
            
            console.log('Filtered favorite properties:', favoriteProperties);
            setFavorites(favoriteProperties);
          }
        } else {
          throw new Error(favoritesResponse.data.message || 'Failed to fetch favorites');
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError(err.message || 'Failed to load favorites');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserFavorites();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRemoveFavorite = async (id) => {
    try {
      setLoading(true);
      
      // Call API to remove favorite
      const response = await axios.delete(`/api/users/favorites/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Remove favorite response:', response.data);
      
      if (response.data.success) {
        // Update local state
        setFavorites(favorites.filter(property => property._id !== id));
        
        // Update user favorites in localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.favorites) {
          userData.favorites = userData.favorites.filter(favId => favId !== id);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        dispatch(setAlert({
          type: 'success',
          message: 'Property removed from favorites'
        }));
      } else {
        throw new Error(response.data.message || 'Failed to remove from favorites');
      }
    } catch (err) {
      console.error('Error removing favorite:', err);
      dispatch(setAlert({
        type: 'error',
        message: err.message || 'Failed to remove from favorites'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Filter favorites based on search term
  const filteredFavorites = favorites.filter(property => 
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Favorite Properties</h1>
        <p className="text-gray-600">Properties you've saved for later</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      )}

      {/* Favorites List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <FaHeart className="mx-auto text-gray-300 text-5xl mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchTerm ? 'No matching favorites found' : 'No Favorites Yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : "You haven't saved any properties to your favorites yet."}
          </p>
          <Link
            to="/properties"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map(property => (
            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <Link to={`/properties/${property._id}`}>
                  <img 
                    src={property.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'} 
                    alt={property.title} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                
                <button 
                  onClick={() => handleRemoveFavorite(property._id)}
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
                  title="Remove from favorites"
                >
                  <FaTrash className="text-red-500" />
                </button>
                
                <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-3 py-1 rounded-tr-lg">
                  {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    <Link to={`/properties/${property._id}`} className="hover:text-blue-600 transition duration-300">
                      {property.title}
                    </Link>
                  </h3>
                  <p className="text-lg font-bold text-blue-600">
                    ₹{property.price?.toLocaleString() || 0}
                    {property.status === 'for-rent' && '/mo'}
                  </p>
                </div>
                
                <p className="text-gray-600 text-sm mt-1 truncate">
                  {property.address?.street && `${property.address.street}, `}
                  {property.address?.city && `${property.address.city}, `}
                  {property.address?.state && property.address.state}
                </p>
                
                <div className="flex justify-between mt-4 text-gray-500">
                  <div className="flex items-center">
                    <span>Beds: {property.bedrooms || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span>Baths: {property.bathrooms || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span>{property.size ? `${property.size} sqft` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;