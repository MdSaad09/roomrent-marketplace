// server/middleware/image.middleware.js

const ensurePropertyImageUrls = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (!data) return originalJson.call(this, data);
    
    // Get base URL for creating absolute URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Function to process image URLs in a more generic way
    const processImageUrl = (imageObj) => {
      if (!imageObj || !imageObj.url) return imageObj;
      
      // If already an absolute URL, return as is
      if (imageObj.url.startsWith('http://') || imageObj.url.startsWith('https://')) {
        return imageObj;
      }
      
      // Format the URL correctly based on different patterns
      if (imageObj.url.startsWith('/uploads/')) {
        imageObj.url = `${baseUrl}${imageObj.url}`;
      } else if (!imageObj.url.includes('/')) {
        // Handle case where URL is just a filename
        imageObj.url = `${baseUrl}/uploads/${imageObj.url}`;
      } else if (!imageObj.url.startsWith('/')) {
        // Handle relative paths that don't start with /
        imageObj.url = `${baseUrl}/uploads/${imageObj.url}`;
      } else {
        // For any other case, just prepend the base URL
        imageObj.url = `${baseUrl}${imageObj.url}`;
      }
      
      // Log the transformation for debugging
      console.log(`Image URL transformed: ${imageObj.url}`);
      
      return imageObj;
    };
    
    // Function to process property objects and their images
    const processPropertyImages = (property) => {
      if (!property) return property;
      
      if (property.images && Array.isArray(property.images)) {
        property.images = property.images.map(processImageUrl);
      }
      
      return property;
    };
    
    // Process single property or array of properties
    if (data.data) {
      if (Array.isArray(data.data)) {
        data.data = data.data.map(processPropertyImages);
      } else if (data.data.images) {
        data.data = processPropertyImages(data.data);
      }
    }
    
    // Also process direct image data in response (for upload endpoints)
    if (data.success && data.data && !Array.isArray(data.data) && data.data.url) {
      data.data = processImageUrl(data.data);
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = { ensurePropertyImageUrls };