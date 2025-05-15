import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedProperties, setFilters, clearFilters } from '../redux/slices/propertySlice';
import PropertyCard from '../components/properties/PropertyCard';
import { FaSearch, FaHome, FaBuilding, FaHandshake } from 'react-icons/fa';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { featuredProperties, loading } = useSelector(state => state.properties);
  
  // Search form state
  const [searchLocation, setSearchLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [propertyStatus, setPropertyStatus] = useState('any');
  const [priceRange, setPriceRange] = useState('');
  
  useEffect(() => {
    // Reset filters when landing on the home page
    dispatch(clearFilters());
    
    // Fetch featured properties
    dispatch(fetchFeaturedProperties());
  }, [dispatch]);
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Prepare search filters
    const filters = {};
    
    if (searchLocation) {
      filters.search = searchLocation;
    }
    
    if (propertyType && propertyType !== '') {
      filters.type = propertyType;
    }
    
    if (propertyStatus && propertyStatus !== 'any') {
      filters.status = propertyStatus;
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-');
      if (min) filters.minPrice = min;
      if (max) filters.maxPrice = max;
    }
    
    console.log('Applying search filters:', filters);
    
    // Set filters in Redux store
    dispatch(setFilters(filters));
    
    // Build query string for the URL
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    
    // Navigate to properties page with search params
    navigate(`/properties?${queryParams.toString()}`);
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-indigo-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Dream Property
            </h1>
            <p className="text-xl mb-8">
              Discover the perfect home for you and your family with our extensive listings of properties for sale and rent.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link 
                to="/properties?status=for-sale" 
                className="bg-white text-gray-400 hover:bg-gray-100 px-6 py-3 rounded-md font-medium"
                onClick={() => dispatch(setFilters({ status: 'for-sale' }))}
              >
                Browse Properties... 
              </Link>
              <Link 
                to="/properties?status=for-rent" 
                className="bg-transparent hover:bg-white hover:text-gray-800 text-white border border-white px-6 py-3 rounded-md font-medium"
                onClick={() => dispatch(setFilters({ status: 'for-rent' }))}
              >
                Find Rentals
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Search Section */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 -mt-20 relative z-20">
            <h2 className="text-2xl font-semibold mb-6 text-center">Quick Search</h2>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, neighborhood, or address"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type
                </label>
                <select 
                  value={propertyType} 
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
                  value={propertyStatus} 
                  onChange={(e) => setPropertyStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="any">Any Status</option>
                  <option value="for-sale">For Sale</option>
                  <option value="for-rent">For Rent</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white bg-indigo-700 px-4 py-2 rounded-md font-medium flex items-center justify-center hover:bg-indigo-800 transition duration-300"
                >
                  <FaSearch className="mr-2" /> Search
                </button>
              </div>
            </form>
            
            {/* Advanced search options */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <select 
                  value={priceRange} 
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any Price</option>
                  <option value="0-100000">$0 - $100,000</option>
                  <option value="100000-250000">$100,000 - $250,000</option>
                  <option value="250000-500000">$250,000 - $500,000</option>
                  <option value="500000-750000">$500,000 - $750,000</option>
                  <option value="750000-1000000">$750,000 - $1,000,000</option>
                  <option value="1000000-">$1,000,000+</option>
                </select>
              </div>
              
              <div className="md:col-span-3 flex items-end justify-end">
                <Link 
                  to="/properties" 
                  className="text-indigo-700 hover:text-indigo-900 text-sm font-medium flex items-center"
                >
                  Advanced Search Options
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our handpicked selection of featured properties. These represent the best in comfort, location, and value.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : featuredProperties && featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No featured properties available at this time.</p>
            </div>
          )}
          
          <div className="text-center mt-10">
            <Link 
              to="/properties" 
              className="bg-primary text-white bg-indigo-700 hover:bg-indigo-800 px-6 py-3 rounded-md font-medium transition duration-300"
            >
              View All Properties
            </Link>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide a comprehensive range of real estate services to help you buy, sell, or rent properties with ease.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <FaHome className="text-indigo-700 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Buy a Property</h3>
              <p className="text-gray-600">
                Find your dream home from our extensive listings of properties for sale across the country.
              </p>
              <Link 
                to="/properties?status=for-sale" 
                className="inline-block mt-4 text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Browse Properties →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <FaBuilding className="text-indigo-700 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Rent a Property</h3>
              <p className="text-gray-600">
                Explore rental options that fit your lifestyle and budget with our diverse rental listings.
              </p>
              <Link 
                to="/properties?status=for-rent" 
                className="inline-block mt-4 text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Find Rentals →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                <FaHandshake className="text-indigo-700 text-3xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sell a Property</h3>
              <p className="text-gray-600">
                List your property with us and reach thousands of potential buyers or renters.
              </p>
              <Link 
                to="/contact" 
                className="inline-block mt-4 text-indigo-700 hover:text-indigo-900 font-medium"
              >
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best real estate experience with personalized service and comprehensive support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-indigo-700 mb-3">01</div>
              <h3 className="text-lg font-semibold mb-2">Trusted Experts</h3>
              <p className="text-gray-600">
                Our team of experienced real estate professionals is dedicated to finding the perfect property for you.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-indigo-700 mb-3">02</div>
              <h3 className="text-lg font-semibold mb-2">Exclusive Listings</h3>
              <p className="text-gray-600">
                Access to premium properties not available on other platforms, giving you more options.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-indigo-700 mb-3">03</div>
              <h3 className="text-lg font-semibold mb-2">Personalized Service</h3>
              <p className="text-gray-600">
                We tailor our approach to meet your specific needs and preferences for a customized experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="text-4xl font-bold text-indigo-700 mb-3">04</div>
              <h3 className="text-lg font-semibold mb-2">End-to-End Support</h3>
              <p className="text-gray-600">
                From search to closing, we provide comprehensive support throughout your real estate journey.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our clients have to say about their experience with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">Homebuyer</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The team was incredibly helpful throughout the entire home buying process. They found us the perfect house and negotiated a great price."
              </p>
              <div className="mt-4 flex text-yellow-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Michael Rodriguez</h4>
                  <p className="text-gray-600 text-sm">Property Seller</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "They sold my property much faster than I expected and at a great price. The entire process was seamless and professional."
              </p>
              <div className="mt-4 flex text-yellow-400">
                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 mr-4"></div>
                <div>
                  <h4 className="font-semibold">Jennifer Williams</h4>
                  <p className="text-gray-600 text-sm">Renter</p>
                </div>
              </div>
              <p className="text-gray-700 italic">
                  "Finding a rental property was so easy with their help. They understood my requirements and showed me only apartments that matched my needs and budget."
                </p>
                <div className="mt-4 flex text-yellow-400">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Statistics Section */}
        <section className="py-12 bg-indigo-700 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">500+</div>
                <p className="text-indigo-200">Properties Sold</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <p className="text-indigo-200">Satisfied Clients</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">12+</div>
                <p className="text-indigo-200">Years Experience</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100+</div>
                <p className="text-indigo-200">Expert Agents</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Recent Blog Posts Section */}
        {/*<section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Latest Articles</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Stay up to date with real estate trends, home improvement tips, and market insights.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <p className="text-indigo-700 text-sm font-medium mb-1">Market Trends</p>
                  <h3 className="text-xl font-semibold mb-2">Real Estate Market Forecast for 2023</h3>
                  <p className="text-gray-600 mb-4">
                    Predictions and insights about what to expect in the real estate market this year.
                  </p>
                  <Link to="/blog/market-forecast" className="text-indigo-700 font-medium hover:text-indigo-900">
                    Read More →
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <p className="text-indigo-700 text-sm font-medium mb-1">Home Improvement</p>
                  <h3 className="text-xl font-semibold mb-2">10 Budget-Friendly Home Renovation Ideas</h3>
                  <p className="text-gray-600 mb-4">
                    Transform your living space without breaking the bank with these creative ideas.
                  </p>
                  <Link to="/blog/renovation-ideas" className="text-indigo-700 font-medium hover:text-indigo-900">
                    Read More →
                  </Link>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <p className="text-indigo-700 text-sm font-medium mb-1">Buying Tips</p>
                  <h3 className="text-xl font-semibold mb-2">First-Time Homebuyer's Complete Guide</h3>
                  <p className="text-gray-600 mb-4">
                    Everything you need to know before purchasing your first property.
                  </p>
                  <Link to="/blog/first-time-buyer" className="text-indigo-700 font-medium hover:text-indigo-900">
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-10">
              <Link to="/blog" className="text-indigo-700 font-medium hover:text-indigo-900">
                View All Articles →
              </Link>
            </div>
          </div>
        </section>*/}
        
        {/* CTA Section */}
        <section className="py-16 bg-white text-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Ready to Find Your Perfect Property?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
              Join thousands of satisfied customers who found their dream homes through our platform.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link 
                to="/properties" 
                className="bg-indigo-700 text-white hover:bg-indigo-800 px-6 py-3 rounded-md font-medium transition duration-300"
              >
                Browse Properties
              </Link>
              <Link 
                to="/register" 
                className="bg-transparent hover:bg-indigo-700 hover:text-white text-indigo-700 border border-indigo-700 px-6 py-3 rounded-md font-medium transition duration-300"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
        
        {/* Partners Section */}
        
      </div>
    );
  };

export default Home;
                