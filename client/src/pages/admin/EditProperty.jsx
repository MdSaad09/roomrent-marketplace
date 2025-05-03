// client/src/pages/admin/EditProperty.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { fetchPropertyById, updateProperty } from '../../redux/slices/propertySlice';
import { setAlert } from '../../redux/slices/uiSlice';
import axios from 'axios';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [featureInput, setFeatureInput] = useState('');
  const [imageError, setImageError] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'apartment',
    status: 'for-sale',
    price: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    features: [],
    images: [],
    published: true,
    featured: false
  });

  // Fetch property data
  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const result = await dispatch(fetchPropertyById(id)).unwrap();
        console.log('Fetched property:', result.data);
        
        if (!result.data) {
          throw new Error('Property not found');
        }
        
        // Normalize the data
        const property = result.data;
        setFormData({
          ...property,
          price: property.price.toString(),
          size: property.size.toString(),
          bedrooms: property.bedrooms.toString(),
          bathrooms: property.bathrooms.toString(),
          features: property.features || [],
          published: property.published !== false, // Default to true if not specified
          featured: property.featured || false
        });
      } catch (error) {
        console.error('Error fetching property:', error);
        dispatch(setAlert({
          type: 'error',
          message: error.message || 'Failed to load property'
        }));
        navigate('/admin/properties');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [id, dispatch, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFeatureInputChange = (e) => {
    setFeatureInput(e.target.value);
  };

  const addFeature = () => {
    if (featureInput.trim() !== '') {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    const removedImage = updatedImages[index];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });

    // Optional: delete image from server
    if (removedImage && removedImage.public_id) {
      deleteImageFromServer(removedImage.public_id)
        .catch(error => console.error('Failed to delete image from server:', error));
    }
  };
  
  const deleteImageFromServer = async (public_id) => {
    try {
      // Try the new images API endpoint first
      await axios.delete(`/api/images/${public_id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Image deleted successfully from server');
    } catch (error) {
      // Fallback to the upload endpoint if images endpoint fails
      try {
        await axios.delete(`/api/upload/${public_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('Image deleted successfully from Cloudinary');
      } catch (innerError) {
        console.error('Failed to delete image:', innerError);
        // Don't throw the error to prevent blocking the UI flow
      }
    }
  };
  
  const removeNewImage = (index) => {
    const updatedImages = [...newImages];
    if (updatedImages[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(updatedImages[index].url); // Clean up URL object
    }
    updatedImages.splice(index, 1);
    setNewImages(updatedImages);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageError('');
    
    // Validate file count
    if (files.length + newImages.length + formData.images.length > 5) {
      setImageError('Maximum 5 images allowed in total');
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
    const newUploadImages = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    setNewImages([...newImages, ...newUploadImages]);
  };

  // Function to upload images to local storage
  const uploadImages = async (imageFiles) => {
    setUploadingImages(true);
    
    try {
      const formData = new FormData();
      
      // Append each file to the form data
      imageFiles.forEach(image => {
        if (image && image.file) {
          formData.append('images', image.file);
        }
      });
      
      // Try to use the images API endpoint first
      try {
        const response = await axios.post('/api/images/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to upload images');
        }
        
        console.log('Images uploaded successfully to local storage:', response.data);
        return response.data.data || [];
      } catch (error) {
        // If images endpoint fails, try the upload endpoint as fallback
        console.warn('Local storage upload failed, trying upload endpoint:', error);
        
        const fallbackResponse = await axios.post('/api/upload/multiple', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!fallbackResponse.data.success) {
          throw new Error(fallbackResponse.data.message || 'Failed to upload images');
        }
        
        console.log('Images uploaded successfully via fallback:', fallbackResponse.data);
        return fallbackResponse.data.data || [];
      }
    } catch (error) {
      console.error('All image upload methods failed:', error);
      throw new Error('Failed to upload images: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingImages(false);
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    // Start with existing images
    let updatedImages = [...(formData.images || [])].filter(img => img && img.url);
    
    // Upload new images if there are any
    if (newImages.length > 0) {
      const uploadedImages = await uploadImages(newImages);
      if (uploadedImages && Array.isArray(uploadedImages)) {
        updatedImages = [...updatedImages, ...uploadedImages];
      }
    }
    
    // Ensure all images have the required fields
    updatedImages = updatedImages.map(img => {
      if (!img) return null;
      
      // Ensure each image has public_id
      if (!img.public_id) {
        const urlParts = img.url.split('/');
        const filename = urlParts[urlParts.length - 1];
        img.public_id = filename || `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      }
      
      return img;
    }).filter(img => img !== null);
    
    // Convert string values to numbers
    const propertyData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      size: parseFloat(formData.size) || 0,
      bedrooms: parseInt(formData.bedrooms, 10) || 0,
      bathrooms: parseInt(formData.bathrooms, 10) || 0,
      images: updatedImages
    };
    
    console.log('Updating property with data:', {
      ...propertyData,
      images: propertyData.images.length + ' images'
    });
    
    const result = await dispatch(updateProperty({
      id,
      propertyData
    })).unwrap();
    
    console.log('Update result:', result);
    
    dispatch(setAlert({
      type: 'success',
      message: 'Property updated successfully'
    }));
    
    // Clean up any object URLs to prevent memory leaks
    newImages.forEach(image => {
      if (image.url.startsWith('blob:')) {
        URL.revokeObjectURL(image.url);
      }
    });
    
    navigate('/admin/properties');
  } catch (error) {
    console.error('Error updating property:', error);
    dispatch(setAlert({
      type: 'error',
      message: error.message || 'Failed to update property'
    }));
  } finally {
    setSubmitting(false);
  }
};
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Property</h1>
        <p className="text-gray-600">Update your property listing</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                Property Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Modern Apartment in Downtown"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="type">
                Property Type*
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                Listing Status*
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                Price*
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 250000"
                required
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Property
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  name="published"
                  checked={formData.published || false}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  Published
                </label>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the property..."
                required
              ></textarea>
            </div>

            {/* Property Details */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bedrooms">
                Bedrooms*
              </label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 3"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bathrooms">
                Bathrooms*
              </label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 2"
                required
              />
                        </div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="size">
    Size (sq ft)*
  </label>
  <input
    type="number"
    id="size"
    name="size"
    value={formData.size}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. 1200"
    required
  />
</div>

{/* Address */}
<div className="md:col-span-2">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Address</h2>
</div>

<div className="md:col-span-2">
  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.street">
    Street Address*
  </label>
  <input
    type="text"
    id="address.street"
    name="address.street"
    value={formData.address.street}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. 123 Main St"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.city">
    City*
  </label>
  <input
    type="text"
    id="address.city"
    name="address.city"
    value={formData.address.city}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. New York"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.state">
    State*
  </label>
  <input
    type="text"
    id="address.state"
    name="address.state"
    value={formData.address.state}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. NY"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.zipCode">
    Zip Code*
  </label>
  <input
    type="text"
    id="address.zipCode"
    name="address.zipCode"
    value={formData.address.zipCode}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. 10001"
    required
  />
</div>

<div>
  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.country">
    Country*
  </label>
  <input
    type="text"
    id="address.country"
    name="address.country"
    value={formData.address.country}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="e.g. USA"
    required
  />
</div>

{/* Features */}
<div className="md:col-span-2">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Features</h2>
  <div className="flex mb-2">
    <input
      type="text"
      value={featureInput}
      onChange={handleFeatureInputChange}
      className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="e.g. Swimming Pool"
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addFeature();
        }
      }}
    />
    <button
      type="button"
      onClick={addFeature}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition duration-200"
    >
      Add
    </button>
  </div>
  <div className="flex flex-wrap gap-2 mt-2">
    {formData.features.map((feature, index) => (
      <div
        key={index}
        className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
      >
        <span className="text-gray-800">{feature}</span>
        <button
          type="button"
          onClick={() => removeFeature(index)}
          className="ml-2 text-gray-500 hover:text-red-500 transition duration-200"
        >
          <FaTimes size={12} />
        </button>
      </div>
    ))}
    {formData.features.length === 0 && (
      <p className="text-gray-500 text-sm italic">No features added yet</p>
    )}
  </div>
</div>

{/* Images */}
<div className="md:col-span-2">
  <h2 className="text-lg font-semibold text-gray-800 mb-4">Images</h2>
  
  {/* Current Images */}
  {formData.images.length > 0 && (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {formData.images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`Property ${index + 1}`}
              className="w-full h-32 object-cover rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                // Use a local placeholder image from your public folder
                e.target.src = '/placeholder-image.jpg';
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )}
  
  {/* New Images Preview */}
  {newImages.length > 0 && (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">New Images to Upload</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {newImages.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.url}
              alt={`New ${index + 1}`}
              className="w-full h-32 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={() => removeNewImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FaTrash size={12} />
            </button>
            <p className="text-xs text-gray-500 truncate mt-1">{image.name}</p>
          </div>
        ))}
      </div>
    </div>
  )}
  
  {/* Image Error Message */}
  {imageError && (
    <p className="text-red-500 text-sm mb-2">{imageError}</p>
  )}
  
  {/* Total Images Count */}
  <p className="text-sm text-gray-600 mb-2">
    Total Images: {formData.images.length + newImages.length}/5
  </p>
  
  {/* Upload New Images */}
  {(formData.images.length + newImages.length < 5) && (
    <div 
      className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition duration-200"
      onClick={() => fileInputRef.current.click()}
    >
      <FaUpload className="mx-auto text-gray-400 text-3xl mb-2" />
      <p className="text-gray-500">
        Drag and drop images here, or click to select files
      </p>
      <p className="text-gray-400 text-sm mt-1">
        (Maximum 5 images total, each up to 5MB)
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
  )}
</div>
</div>

<div className="flex justify-end space-x-4 mt-6">
<button
  type="button"
  onClick={() => navigate('/admin/properties')}
  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center transition duration-200"
>
  <FaTimes className="mr-2" /> Cancel
</button>
<button
  type="submit"
  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center transition duration-200"
  disabled={submitting || uploadingImages}
>
  {submitting || uploadingImages ? (
    <>
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
      {uploadingImages ? 'Uploading Images...' : 'Updating...'}
    </>
  ) : (
    <>
      <FaSave className="mr-2" /> Update Property
    </>
  )}
</button>
</div>
</form>
</div>
</div>
);
};

export default EditProperty;