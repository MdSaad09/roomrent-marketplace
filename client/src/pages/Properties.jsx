import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { fetchProperties, setFilters } from '../redux/slices/propertySlice';
import PropertyCard from '../components/properties/PropertyCard';
import PropertyFilter from '../components/properties/PropertyFilter';
import Pagination from '../components/common/Pagination';

const Properties = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Get properties state with fallback
  const propertiesState = useSelector(state => state.properties || {});
  console.log('Properties State:', propertiesState);
  
  // Add default values to prevent undefined errors
  const { 
    properties = [], 
    loading = false,
    error = null,
    pagination = { currentPage: 1, totalPages: 1, total: 0 } 
  } = useSelector(state => state.properties || {});
  
  const [view, setView] = useState('grid'); // 'grid' or 'list'
  
  useEffect(() => {
    // Parse query params from URL
    const queryParams = new URLSearchParams(location.search);
    const filters = {};
    
    for (const [key, value] of queryParams.entries()) {
      filters[key] = value;
    }
    
    // Set filters from URL
    if (Object.keys(filters).length > 0) {
      dispatch(setFilters(filters));
    }
    
    // Fetch properties with explicit debugging
    const fetchData = async () => {
      try {
        const resultAction = await dispatch(fetchProperties());
        console.log('Fetch result action:', resultAction);
        
        if (fetchProperties.fulfilled.match(resultAction)) {
          console.log('Properties fetched successfully:', resultAction.payload);
        } else {
          console.error('Failed to fetch properties:', resultAction.error);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };

    fetchData();
  }, [dispatch, location.search]);
  
  const handlePageChange = (page) => {
    dispatch(fetchProperties({ page }));
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to get property image URL
  const getPropertyImageUrl = (property) => {
    // Check different possible image formats
    if (property.images && property.images.length > 0) {
      // If images is an array of objects with url property
      if (property.images[0].url) {
        return property.images[0].url;
      }
      // If images is an array of strings
      if (typeof property.images[0] === 'string') {
        return property.images[0];
      }
    }
    
    // Check if there's a mainImage property
    if (property.mainImage) {
      return property.mainImage;
    }
    
    // Check if there's a thumbnail property
    if (property.thumbnail) {
      return property.thumbnail;
    }
    
    // Default placeholder
    return '/images/property-placeholder.jpg';
  };

  // Memoize the property list to prevent unnecessary re-renders
  const propertyList = useMemo(() => {
    if (!properties || properties.length === 0) return null;
    
    if (view === 'grid') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map(property => (
            <PropertyCard key={property._id} property={property} />
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-6">
          {properties.map(property => {
            const imageUrl = getPropertyImageUrl(property);
            
            return (
              <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
                {/* Property image */}
                <div className="md:w-1/3 h-48 md:h-auto relative">
                  <img 
                    src={imageUrl} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/property-placeholder.jpg';
                      console.log('Image failed to load, using placeholder');
                    }}
                  />
                  {property.featured && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded">
                      Featured
                    </div>
                  )}

                  {/* Property status badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 text-xs rounded text-white ${
                    property.status === 'for-sale' ? 'bg-blue-600' : 
                    property.status === 'for-rent' ? 'bg-green-600' : 
                    property.status === 'sold' ? 'bg-purple-600' : 
                    'bg-gray-600'
                  }`}>
                    {property.status === 'for-sale' ? 'For Sale' : 
                     property.status === 'for-rent' ? 'For Rent' : 
                     property.status === 'sold' ? 'Sold' : 'Rented'}
                  </div>
                </div>
                
                {/* Property details */}
                <div className="md:w-2/3 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{property.title}</h3>
                      <p className="text-blue-600 font-bold">
                        ${property.price?.toLocaleString() || 'Price unavailable'}
                        {property.status === 'for-rent' && '/mo'}
                      </p>
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      {property.address?.city && property.address?.state 
                        ? `${property.address.city}, ${property.address.state}` 
                        : property.location || 'Location not specified'}
                    </p>
                    
                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {property.description || 'No description available'}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-gray-600">
                      {property.bedrooms !== undefined && (
                        <div className="flex items-center">
                          <span className="mr-1">🛏️</span> {property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}
                        </div>
                      )}
                      
                      {property.bathrooms !== undefined && (
                        <div className="flex items-center">
                          <span className="mr-1">🚿</span> {property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}
                        </div>
                      )}
                      
                      {property.size && (
                        <div className="flex items-center">
                          <span className="mr-1">📏</span> {property.size} sq ft
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <a 
                      href={`/properties/${property._id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
                    >
                      View Details
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  }, [properties, view]);
  
  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
          <p className="text-gray-600 mt-2">
            Browse our extensive collection of properties for sale and rent
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar with filters */}
          <div className="w-full lg:w-1/4">
            <PropertyFilter />
          </div>
          
          {/* Main content */}
          <div className="w-full lg:w-3/4">
            {/* Results header */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{properties?.length || 0}</span> of{' '}
                  <span className="font-semibold">{pagination?.total || 0}</span> properties
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-gray-600 mr-2">View:</label>
                <button
                  onClick={() => setView('grid')}
                  className={`p-2 rounded transition-colors ${
                    view === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  aria-label="Grid view"
                  aria-pressed={view === 'grid'}
                >
                  Grid
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-2 rounded transition-colors ${
                    view === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  aria-label="List view"
                  aria-pressed={view === 'list'}
                >
                  List
                </button>
              </div>
            </div>
            
            {/* Loading state */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {/* Error state */}
            {!loading && error && (
              <div className="bg-red-50 p-6 rounded-lg shadow-sm text-center border border-red-200">
                <h3 className="text-xl font-semibold text-red-700 mb-2">Error loading properties</h3>
                <p className="text-red-600">
                  {error.message || "There was a problem fetching properties. Please try again."}
                </p>
                <button 
                  onClick={() => dispatch(fetchProperties())}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-300"
                >
                  Try Again
                </button>
              </div>
            )}
            
                        {/* No results */}
                        {!loading && !error && (properties?.length === 0) && (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No properties found</h3>
                <p className="text-gray-600">
                  Try adjusting your search filters to find what you're looking for.
                </p>
              </div>
            )}
            
            {/* Property list (grid or list view) */}
            {!loading && !error && propertyList}
            
            {/* Pagination */}
            {!loading && !error && (pagination?.totalPages > 1) && (
              <div className="mt-8 flex justify-center">
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Properties;