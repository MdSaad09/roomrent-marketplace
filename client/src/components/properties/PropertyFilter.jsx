import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, clearFilters, fetchProperties } from '../../redux/slices/propertySlice';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const PropertyFilter = () => {
  const dispatch = useDispatch();
  const { filters } = useSelector(state => state.properties);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters(localFilters));
    dispatch(fetchProperties());
    setIsFilterOpen(false);
  };
  
  const handleClear = () => {
    dispatch(clearFilters());
    dispatch(fetchProperties());
    setIsFilterOpen(false);
  };
  
  return (
    <div className="mb-6">
      {/* Mobile filter button */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md"
        >
          {isFilterOpen ? (
            <>
              <FaTimes className="mr-2" /> Close Filters
            </>
          ) : (
            <>
              <FaFilter className="mr-2" /> Show Filters
            </>
          )}
        </button>
      </div>
      
      {/* Search bar - always visible */}
      <div className="relative mb-4">
        <input
          type="text"
          name="search"
          value={localFilters.search}
          onChange={handleInputChange}
          placeholder="Search properties..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <button
          onClick={handleSubmit}
          className="absolute right-2 top-2 bg-primary text-white px-3 py-1 rounded-md text-sm"
        >
          Search
        </button>
      </div>
      
      {/* Filter form - visible on desktop or when toggled on mobile */}
      <div className={`bg-white p-4 rounded-md shadow-md ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                name="type"
                value={localFilters.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={localFilters.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="for-sale">For Sale</option>
                <option value="for-rent">For Rent</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={localFilters.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                value={localFilters.minPrice}
                onChange={handleInputChange}
                placeholder="Min Price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                value={localFilters.maxPrice}
                onChange={handleInputChange}
                placeholder="Max Price"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={localFilters.bedrooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
            >
              Clear Filters
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md bg-indigo-700 cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFilter;