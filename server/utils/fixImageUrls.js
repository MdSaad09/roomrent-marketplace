// scripts/fixImageUrls.js
require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/property.model');

const fixImageUrls = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all properties
    const properties = await Property.find({});
    console.log(`Found ${properties.length} properties to process`);
    
    let updateCount = 0;
    
    // Process each property
    for (const property of properties) {
      let updated = false;
      
      if (property.images && property.images.length > 0) {
        // Process each image
        property.images = property.images.map(image => {
          if (!image.url) return image;
          
          // If the URL doesn't start with http or /uploads
          if (!image.url.startsWith('http') && !image.url.startsWith('/uploads')) {
            updated = true;
            // Convert to proper format
            return {
              ...image,
              url: `/uploads/${image.url}`
            };
          }
          
          return image;
        });
        
        if (updated) {
          await property.save();
          updateCount++;
          console.log(`Updated property ${property._id}`);
        }
      }
    }
    
    console.log(`Migration complete. Updated ${updateCount} properties.`);
  } catch (error) {
    console.error('Error in migration:', error);
  } finally {
    // Close connection
    mongoose.connection.close();
  }
};

fixImageUrls();