// client/src/components/properties/PropertyCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToFavorites, removeFromFavorites } from '../../redux/slices/authSlice';
import { setAlert } from '../../redux/slices/uiSlice';

const PropertyCard = ({ property }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [imageError, setImageError] = useState(false);
  
  // Check if property is in favorites
  const isFavorited = user?.favorites?.some(id => 
    id.toString() === property._id.toString()
  );
  
  // Function to get the full image URL
  const getImageUrl = (url) => {
    // If there's no image, return a local placeholder
    if (!url) {
      return '/placeholder-image.jpg'; // Make sure this file exists in your public folder
    }
    
    // If url already starts with http or https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
  
    // If url starts with /uploads, keep it relative to work with the proxy
    if (url.startsWith('/uploads/')) {
      return url;
    }
  
    // If url doesn't have a path, assume it's a filename in the uploads folder
    if (!url.includes('/')) {
      return `/uploads/${url}`;
    }
  
    // Last resort, make sure it has the right path
    if (!url.startsWith('/')) {
      return `/uploads/${url}`;
    }
    
    return url;
  };

  // console.log('Property:', property);
  // console.log('Image URL:', property.images?.[0]?.url);
  // console.log('Processed URL:', getImageUrl(property.images?.[0]?.url));
  
  const handleToggleFavorite = (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
      dispatch(setAlert({
        type: 'info',
        message: 'Please log in to save properties to favorites'
      }));
      return;
    }
    
    if (isFavorited) {
      dispatch(removeFromFavorites(property._id))
        .unwrap()
        .then(() => {
          dispatch(setAlert({
            type: 'success',
            message: 'Property removed from favorites'
          }));
        })
        .catch(error => {
          dispatch(setAlert({
            type: 'error',
            message: 'Failed to remove from favorites: ' + (error.message || 'Unknown error')
          }));
        });
    } else {
      dispatch(addToFavorites(property._id))
        .unwrap()
        .then(() => {
          dispatch(setAlert({
            type: 'success',
            message: 'Property added to favorites'
          }));
        })
        .catch(error => {
          dispatch(setAlert({
            type: 'error',
            message: 'Failed to add to favorites: ' + (error.message || 'Unknown error')
          }));
        });
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
      <Link to={`/properties/${property._id}`}>
  {!imageError ? (
    <img 
      src={getImageUrl(property.images?.[0]?.url)} 
      alt={property.title} 
      className="w-full h-48 object-cover"
      onError={(e) => {
        console.error('Image failed to load:', getImageUrl(property.images?.[0]?.url));
        setImageError(true);
      }}
    />
  ) : (
    <img 
      src="/placeholder-image.jpg" 
      alt="No image available" 
      className="w-full h-48 object-cover"
    />
  )}
</Link>
        
        <button 
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 bg-white p-2 rounded-full shadow-md transition duration-300 ${
            isFavorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FaHeart />
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
            ${property.price?.toLocaleString() || 0}
            {property.status === 'for-rent' && '/mo'}
          </p>
        </div>
        
        <p className="text-gray-600 text-sm mt-1 truncate">
          {property.address?.street && `${property.address.street}, `}
          {property.address?.city && `${property.address.city}, `}
          {property.address?.state && property.address.state}
        </p>
        
        <div className="flex justify-between mt-4 text-gray-500 text-sm">
          <div>Beds: {property.bedrooms || 'N/A'}</div>
          <div>Baths: {property.bathrooms || 'N/A'}</div>
          <div>{property.size ? `${property.size} sqft` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;