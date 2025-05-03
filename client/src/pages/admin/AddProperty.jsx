// client/src/pages/admin/AddProperty.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaUpload, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { createProperty } from '../../redux/slices/propertySlice';
import { setAlert } from '../../redux/slices/uiSlice';
import axios from 'axios';

const AddProperty = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
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
      country: 'India'
    },
    features: [],
    published: true,
    featured: false
  });

  const [featureInput, setFeatureInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

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
      name: file.name
    }));
    
    setImages([...images, ...newImages]);
  };
  
  const removeImage = (index) => {
    const newImages = [...images];
    if (newImages[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newImages[index].url); // Clean up URL object
    }
    newImages.splice(index, 1);
    setImages(newImages);
  };

// Function to upload images to server's local storage
const uploadImages = async (imageFiles) => {
  setUploadingImages(true);
  
  try {
    console.log('Starting image upload for', imageFiles.length, 'files');
    const formData = new FormData();
    
    // Append each file to the form data
    imageFiles.forEach(image => {
      console.log('Appending file:', image.name);
      formData.append('images', image.file);
    });
    
    // Send the request to your image upload endpoint
    console.log('Sending request to /api/images/multiple');
    const response = await axios.post('/api/images/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Upload response:', response.data);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to upload images');
    }
    
    return response.data.data; // Array of image objects with url and public_id
  } catch (error) {
    console.error('Error details:', error);
    console.error('Response data:', error.response?.data);
    throw new Error('Failed to upload images: ' + (error.response?.data?.message || error.message));
  } finally {
    setUploadingImages(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let propertyImages = [];
      
      // Upload images if there are any
      if (images.length > 0) {
        propertyImages = await uploadImages(images);
      }
      
      // Convert string values to numbers
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        size: parseFloat(formData.size),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseInt(formData.bathrooms, 10),
        images: propertyImages
      };
      
      console.log('Submitting property data:', propertyData);
      
      const result = await dispatch(createProperty(propertyData)).unwrap();
      
      console.log('Property created successfully:', result);
      
      dispatch(setAlert({
        type: 'success',
        message: 'Property created successfully'
      }));
      
      // Clean up any object URLs to prevent memory leaks
      images.forEach(image => {
        if (image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url);
        }
      });
      
      navigate('/admin/properties');
    } catch (error) {
      console.error('Error creating property:', error);
      dispatch(setAlert({
        type: 'error',
        message: error.message || 'Failed to create property'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Property</h1>
        <p className="text-gray-600">Fill in the details to list a new property</p>
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
              <div 
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition duration-200"
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
              
              {/* Image Preview Section */}
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
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash size={12} />
                        </button>
                        <p className="text-xs text-gray-500 truncate mt-1">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/properties')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200 flex items-center"
            >
              <FaTimes className="mr-2" /> Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 flex items-center"
              disabled={loading || uploadingImages}
            >
              {loading || uploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  {uploadingImages ? 'Uploading Images...' : 'Saving...'}
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Save Property
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;