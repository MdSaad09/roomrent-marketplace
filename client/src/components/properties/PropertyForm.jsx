// client/src/components/properties/PropertyForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaTrash, FaSpinner, FaInfoCircle, FaTimes, FaSave } from 'react-icons/fa';
import axios from 'axios';

const PropertyForm = ({ property, onSubmit, loading, isAgent = false, submitButtonText = null }) => {
  const initialState = {
    title: '',
    description: '',
    price: '',
    status: 'for-sale',
    type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    size: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    features: [],
    images: [],
    rejectionReason: '' // Add this to track rejection status
  };

  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(initialState);
  const [featureInput, setFeatureInput] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // Add local state for preview images similar to admin component
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');
  
  // Add state to track if this is a resubmission of a rejected property
  const [isRejected, setIsRejected] = useState(false);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        price: property.price || '',
        status: property.status || 'for-sale',
        type: property.type || 'house',
        bedrooms: property.bedrooms || 3,
        bathrooms: property.bathrooms || 2,
        size: property.size || '',
        address: {
          street: property.address?.street || '',
          city: property.address?.city || '',
          state: property.address?.state || '',
          zipCode: property.address?.zipCode || '',
          country: property.address?.country || 'USA'
        },
        features: property.features || [],
        images: [], // We'll handle images separately
        rejectionReason: property.rejectionReason || '' // Store rejection reason
      });
      
      // Set rejected flag if there's a rejection reason
      setIsRejected(property.rejectionReason && property.rejectionReason.trim() !== '');
      
      // If property has images, set them up for display
      if (property.images && property.images.length > 0) {
        console.log("Existing property images:", property.images);
        
        const existingImages = property.images.map(img => {
          // Handle different image formats
          if (typeof img === 'string') {
            return {
              url: img,
              public_id: img.split('/').pop(),
              existing: true
            };
          } else if (img && img.url) {
            return {
              url: img.url,
              public_id: img.public_id || img.url.split('/').pop(),
              existing: true
            };
          } else {
            console.warn('Unknown image format:', img);
            return {
              url: '/images/property-placeholder.jpg',
              public_id: 'unknown',
              existing: true
            };
          }
        });
        
        setImages(existingImages);
      }
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === '' ? '' : parseFloat(value)
    });
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (feature) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature)
    });
  };

  // Similar to admin component's handleImageUpload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageError('');
    
    // Validate file count
    if (files.length + images.length > 5) {
      setImageError('Maximum 5 images allowed');
      return;
    }
    
    // Validate file size and type
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setImageError('Each image must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setImageError('Only image files are allowed');
        return false;
      }
      return true;
    });
    
    // Create preview URLs
    const newImages = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      isPreview: true // Flag to indicate this is a preview image
    }));
    
    console.log("Preview images created:", newImages);
    setImages([...images, ...newImages]);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index].url && newImages[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].url); // Clean up URL object
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Improved upload function with better error handling and debugging
  const uploadImages = async (imageFiles) => {
    setUploadingImages(true);
    console.log('Starting image upload for', imageFiles.length, 'files');
    
    try {
      const formData = new FormData();
      
      // Append each file to the form data
      imageFiles.forEach(image => {
        if (image.file) {
          console.log('Appending file:', image.name, 'size:', image.file.size);
          formData.append('images', image.file);
        }
      });
      
      // Log formData contents (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1].name, pair[1].size);
      }
      
      // First try the /api/upload/multiple endpoint that worked previously
      console.log('Sending request to /api/upload/multiple');
      const response = await axios.post('/api/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Upload response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload images');
      }
      
      // Add a log to see the exact structure of the returned data
      console.log('Upload returned image data format:', JSON.stringify(response.data.data));
      
      return response.data.data; // Array of image objects with url and public_id
    } catch (error) {
      console.error('Error details:', error);
      console.error('Response data:', error.response?.data);
      
      // Try fallback to /api/images/multiple if the first attempt failed
      try {
        console.log('Trying fallback to /api/images/multiple');
        const formData = new FormData();
        
        imageFiles.forEach(image => {
          if (image.file) {
            formData.append('images', image.file);
          }
        });
        
        const response = await axios.post('/api/images/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        console.log('Fallback upload response:', response.data);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to upload images');
        }
        
        return response.data.data;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error('All upload attempts failed: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setUploadingImages(false);
    }
  };

  // Format image data for submission to ensure consistent structure
  const prepareImagesForSubmission = (imageObjects) => {
    return imageObjects.map(image => {
      // If image already has the correct format, use it
      if (image.url && (image.public_id || image.existing)) {
        return { 
          url: image.url,
          public_id: image.public_id || image.url.split('/').pop()
        };
      }
      
      // For preview images (which should have been uploaded at this point)
      // This case shouldn't happen but is here as a fallback
      if (image.isPreview) {
        console.warn('Preview image found in prepareImagesForSubmission - this should not happen');
        return {
          url: image.url,
          public_id: image.name || 'unknown'
        };
      }
      
      // Default case for any other format
      console.warn('Unknown image format in prepareImagesForSubmission:', image);
      return {
        url: typeof image === 'string' ? image : (image.url || '/images/property-placeholder.jpg'),
        public_id: typeof image === 'string' ? image.split('/').pop() : (image.public_id || 'unknown')
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.size) newErrors.size = 'Size is required';
    if (!formData.address.street) newErrors.street = 'Street address is required';
    if (!formData.address.city) newErrors.city = 'City is required';
    if (!formData.address.state) newErrors.state = 'State is required';
    if (!formData.address.zipCode) newErrors.zipCode = 'Zip code is required';
    
    if (images.length === 0) {
      newErrors.images = 'At least one image is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }
    
    // Set submitting state to prevent multiple submissions
    setSubmitting(true);
    
    try {
      // Separate preview images that need to be uploaded from existing images
      const previewImages = images.filter(img => img.isPreview);
      const existingImages = images.filter(img => !img.isPreview); 
      
      let propertyImages = [];
      
      // Upload preview images if there are any
      if (previewImages.length > 0) {
        const uploadedImages = await uploadImages(previewImages);
        console.log('Uploaded images result:', uploadedImages);
        propertyImages = [...propertyImages, ...uploadedImages];
      }
      
      // Add existing images
      if (existingImages.length > 0) {
        const formattedExistingImages = prepareImagesForSubmission(existingImages);
        console.log('Formatted existing images:', formattedExistingImages);
        propertyImages = [...propertyImages, ...formattedExistingImages];
      }
      
      console.log('Final images for submission:', propertyImages);
      
      // Convert string values to numbers
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        size: parseFloat(formData.size),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseInt(formData.bathrooms, 10),
        images: propertyImages
      };
      
      // For rejected properties being resubmitted, clear the rejection reason
      if (isRejected) {
        propertyData.rejectionReason = '';
        propertyData.approved = null; // Reset approval status for review
      }
      
      console.log('Submitting property data:', {
        ...propertyData,
        isRejected,
        imageCount: propertyData.images.length
      });
      
      // Submit the property data
      onSubmit(propertyData);
      
      // Clean up any object URLs to prevent memory leaks
      images.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
    } catch (error) {
      console.error('Error preparing property data:', error);
      setErrors({
        ...errors,
        submit: error.message || 'Failed to prepare property data'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Determine the submit button text based on context
  const getSubmitButtonText = () => {
    if (submitButtonText) {
      return submitButtonText;
    }
    
    if (isRejected) {
      return 'Resubmit for Approval';
    }
    
    return property ? 'Update Property' : 'Create Property';
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Please correct the following errors:</p>
              <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notice - If editing a previously rejected property */}
      {isRejected && formData.rejectionReason && (
        <div className="mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">This property was rejected</h3>
                <div className="mt-2 text-red-700">
                  <p><strong>Reason:</strong> {formData.rejectionReason}</p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-700">
                    Please address the issues mentioned above before resubmitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the form remains unchanged */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Property Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., Beautiful 3-Bedroom Home with Garden"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="price">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleNumberChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 250000"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="status">
              Listing Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
              <option value="for-sale">For Sale</option>
              <option value="for-rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="type">
              Property Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            >
                            <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="land">Land</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2" htmlFor="description">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          className={`w-full px-4 py-2 border rounded-md ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Describe the property in detail..."
        ></textarea>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="bedrooms">
              Bedrooms
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleNumberChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="0"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="bathrooms">
              Bathrooms
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleNumberChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              min="0"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="size">
              Size (sq ft) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleNumberChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.size ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 1800"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="street">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="street"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.street ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 123 Main St"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="city">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="city"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., New York"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="state">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="state"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., NY"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="zipCode">
              Zip Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="zipCode"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md ${errors.zipCode ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g., 10001"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2" htmlFor="country">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., USA"
            />
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Features</h2>
        <div className="flex mb-4">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md"
            placeholder="e.g., Swimming Pool, Garage, Fireplace"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFeature(e);
              }
            }}
          />
          <button
            onClick={handleAddFeature}
            type="button"
            className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {formData.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-full py-1 px-3 flex items-center text-gray-700"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(feature)}
                  className="ml-2 text-gray-500 hover:text-red-600"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Updated Image Section with Better Handling */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Property Images</h2>
        
        <div 
          className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition duration-200 ${errors.images ? 'border-red-500' : ''}`}
          onClick={() => fileInputRef.current.click()}
        >
          <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
          <p className="text-gray-500">
            Drag and drop images here, or click to select files
          </p>
          <p className="text-gray-400 text-sm mt-1">
            (Maximum 5 images, each up to 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-200"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current.click();
            }}
          >
            Select Files
          </button>
        </div>
        
        {imageError && (
          <p className="text-red-500 text-sm mt-2">{imageError}</p>
        )}
        
        {/* Improved Image Preview Section */}
        {images.length > 0 && (
          <div className="mt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Selected Images: ({images.length}/5)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image.url} 
                    alt={`Preview ${index}`} 
                    className="w-full h-24 object-cover rounded-md"
                    onError={(e) => {
                      console.error('Failed to load image:', image.url);
                      e.target.src = '/images/property-placeholder.jpg';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash size={12} />
                  </button>
                  <p className="text-xs text-gray-500 truncate mt-1">
                    {image.isPreview ? '(Preview) ' : ''}
                    {image.name || `Image ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Conditional message for agents */}
      {isAgent && !isRejected && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Your property will be reviewed by our team before being listed on the site.
                This typically takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resubmission message for agents with rejected properties */}
      {isAgent && isRejected && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaInfoCircle className="h-5 w-5 text-amber-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                After making the necessary changes, please resubmit this property for approval. 
                Our team will review it again.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || uploadingImages || submitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium flex items-center"
        >
          {loading || uploadingImages || submitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {uploadingImages ? 'Uploading Images...' : 'Saving...'}
            </>
          ) : (
            <>
              <FaSave className="mr-2" /> 
              {getSubmitButtonText()}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default PropertyForm;