import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPropertyById } from '../redux/slices/propertySlice';
import { setAlert } from '../redux/slices/uiSlice';
import { FaBed, FaBath, FaRuler, FaMapMarkerAlt, FaPhone, FaEnvelope, FaHeart, FaRegHeart, FaHome, FaKey } from 'react-icons/fa';
import { updateUserProfile } from '../redux/slices/authSlice';
import axios from 'axios';

const PropertyDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { property, loading, error } = useSelector(state => state.properties);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Add form state for contact form
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  useEffect(() => {
    dispatch(fetchPropertyById(id));
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Pre-fill form with user data if available
    if (user) {
      setContactForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [dispatch, id, user]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
  
  // Update the handleContactSubmit function
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      dispatch(setAlert({
        type: 'error',
        message: 'Please login to contact the owner'
      }));
      return;
    }
    
    if (!contactForm.message.trim()) {
      dispatch(setAlert({
        type: 'error',
        message: 'Please enter a message'
      }));
      return;
    }
    
    try {
      // Use axios instead of fetch for consistency with other API calls
      const response = await axios.post('/api/inquiries', {
        propertyId: id,
        message: contactForm.message,
        phone: contactForm.phone
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        dispatch(setAlert({
          type: 'success',
          message: 'Your inquiry has been sent to our admin team'
        }));
        
        // Reset form
        setContactForm(prev => ({
          ...prev,
          message: ''
        }));
        setShowContactModal(false); // Close the modal after successful submission
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Improved error handling to better diagnose the issue
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
        
        dispatch(setAlert({
          type: 'error',
          message: error.response.data?.message || `Server error: ${error.response.status}` || 'Failed to send message'
        }));
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        dispatch(setAlert({
          type: 'error',
          message: 'No response from server. Please check your connection.'
        }));
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        dispatch(setAlert({
          type: 'error',
          message: error.message || 'Failed to send message. Please try again.'
        }));
      }
    }
  };
  
  // Function to open the contact modal
  const openContactModal = () => {
    if (!isAuthenticated) {
      dispatch(setAlert({
        type: 'error',
        message: 'Please login to contact the owner'
      }));
      return;
    }
    setShowContactModal(true);
  };
  
  // Function to close the contact modal
  const closeContactModal = () => {
    setShowContactModal(false);
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
                ₹{property.price?.toLocaleString() || "Price not available"}
                {property.status === 'for-rent' && '/mo'}
              </div>
              <div className="mt-2 flex space-x-2">
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
                <button
                  onClick={openContactModal}
                  className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  <FaEnvelope className="mr-2" /> Contact Us
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
          
          {/* Right column - Admin info */}
          <div>
            {/* Admin contact info */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Information</h2>
              <p className="text-gray-600 mb-4">Interested in this property? Click the Contact Us button to send an inquiry to our team.</p>
              <button
                onClick={openContactModal}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
              >
                Contact Us About This Property
              </button>
            </div>
          </div>
        </div>
        
        {/* Contact Modal */}
        {showContactModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Contact About This Property</h2>
                  <button 
                    onClick={closeContactModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-600 mb-4">Fill out this form to inquire about this property. Your message will be sent to our admin team who will get back to you shortly.</p>
                
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                      value={contactForm.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(123) 456-7890"
                      value={contactForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="I'm interested in this property..."
                      value={contactForm.message}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={closeContactModal}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-300"
                    >
                      Submit Inquiry
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;