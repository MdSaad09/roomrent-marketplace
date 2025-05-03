import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById } from '../redux/slices/propertySlice';
import { setAlert } from '../redux/slices/uiSlice';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaRegHeart, FaHome, FaKey } from 'react-icons/fa';
import { updateUserProfile } from '../redux/slices/authSlice';

const PropertyDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { property, loading, error } = useSelector(state => state.properties);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    dispatch(fetchPropertyById(id));
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [dispatch, id]);
  
  const isFavorite = user?.favorites?.includes(id);
  
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      dispatch(setAlert({
        type: 'error',
        message: 'Please login to save properties to favorites'
      }));
      return;
    }
    
    let updatedFavorites = [...(user.favorites || [])];
    
    if (isFavorite) {
      updatedFavorites = updatedFavorites.filter(propId => propId !== id);
    } else {
      updatedFavorites.push(id);
    }
    
    dispatch(updateUserProfile({ favorites: updatedFavorites }));
  };
  
  const handleContactSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      dispatch(setAlert({
        type: 'error',
        message: 'Please login to contact the owner'
      }));
      return;
    }
    
    // Here you would typically dispatch an action to send the message
    // For now, we'll just show a success alert
    dispatch(setAlert({
      type: 'success',
      message: 'Your message has been sent to the property owner'
    }));
    
    setMessage('');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Property</h2>
        <p className="text-gray-600 mb-6">{error.message || "There was a problem loading this property."}</p>
        <Link to="/properties" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
          Browse Properties
        </Link>
      </div>
    );
  }
  
  if (!property) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/properties" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium">
          Browse Properties
        </Link>
      </div>
    );
  }
  
  // Ensure images array exists and has valid items
  const propertyImages = property.images && Array.isArray(property.images) 
    ? property.images 
    : [];
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Property header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{property.title}</h1>
              <p className="text-gray-600 mt-1">
                <FaMapMarkerAlt className="inline mr-1" />
                {property.address?.street && `${property.address.street}, `}
                {property.address?.city && `${property.address.city}, `}
                {property.address?.state && `${property.address.state}, `}
                {property.address?.zipCode && property.address.zipCode}
                {!property.address && "Address not available"}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="text-2xl font-bold text-blue-600">
                ${property.price?.toLocaleString() || "Price not available"}
                {property.status === 'for-rent' && '/mo'}
              </div>
              <div className="mt-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center px-4 py-2 rounded-md ${
                    isFavorite 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isFavorite ? (
                    <>
                      <FaHeart className="mr-2" /> Saved to Favorites
                    </>
                  ) : (
                    <>
                      <FaRegHeart className="mr-2" /> Save to Favorites
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Property content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Images and details */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="mb-4">
                <img 
                  src={
                    propertyImages.length > 0 && propertyImages[activeImage]?.url 
                      ? propertyImages[activeImage].url 
                      : 'https://via.placeholder.com/800x500?text=No+Image'
                  } 
                  alt={property.title} 
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>
              
              {propertyImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {propertyImages.map((image, index) => (
                    <div 
                      key={index}
                      className={`cursor-pointer rounded-lg overflow-hidden border-2 ${
                        activeImage === index ? 'border-blue-600' : 'border-transparent'
                      }`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img 
                        src={image.url} 
                        alt={`${property.title} - ${index + 1}`} 
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Property details */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaBed className="mx-auto text-blue-600 text-xl mb-2" />
                  <p className="text-gray-500 text-sm">Bedrooms</p>
                  <p className="font-semibold">{property.bedrooms || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaBath className="mx-auto text-blue-600 text-xl mb-2" />
                  <p className="text-gray-500 text-sm">Bathrooms</p>
                  <p className="font-semibold">{property.bathrooms || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <FaRuler className="mx-auto text-blue-600 text-xl mb-2" />
                  <p className="text-gray-500 text-sm">Area</p>
                  <p className="font-semibold">{property.size ? `${property.size} sqft` : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  {property.status === 'for-sale' ? (
                    <FaHome className="mx-auto text-blue-600 text-xl mb-2" />
                  ) : (
                    <FaKey className="mx-auto text-blue-600 text-xl mb-2" />
                  )}
                  <p className="text-gray-500 text-sm">Listing Type</p>
                  <p className="font-semibold capitalize">
                    {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{property.description || 'No description available'}</p>
              
              {property.features && property.features.length > 0 && (
                <>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Features</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                    {property.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <span className="mr-2 text-blue-600">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              
              {/* Additional property details if available */}
              {property.yearBuilt && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year Built:</span>
                      <span className="font-medium">{property.yearBuilt}</span>
                    </div>
                    {property.parkingSpaces !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parking Spaces:</span>
                        <span className="font-medium">{property.parkingSpaces}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Contact form and agent info */}
          <div>
            {/* Agent/Owner info */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Owner</h2>
              
              {property.owner ? (
                <>
                  <div className="flex items-center mb-4">
                    <img 
                      src={property.owner.avatar || 'https://via.placeholder.com/60?text=User'} 
                      alt={property.owner.name} 
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">{property.owner.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {property.owner.role === 'agent' ? 'Real Estate Agent' : 'Property Owner'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <FaPhone className="mr-2 text-blue-600" />
                      <span>{property.owner.phone || 'Phone not available'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FaEnvelope className="mr-2 text-blue-600" />
                      <span>{property.owner.email}</span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-600">Owner information not available</p>
              )}
            </div>
            
            {/* Contact form */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Owner</h2>
              
              <form onSubmit={handleContactSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="I'm interested in this property..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
                  disabled={!isAuthenticated}
                >
                  Send Message
                </button>
                
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to contact the owner
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;