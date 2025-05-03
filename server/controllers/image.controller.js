// server/controllers/image.controller.js
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../config/upload');

// @desc    Upload multiple images
// @route   POST /api/images/multiple
// @access  Private
exports.uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }
    
    const imageResults = [];
    
    // Process each uploaded file
    for (const file of req.files) {
      // Generate a unique ID
      const public_id = `img_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Determine file extension
      const fileExtension = path.extname(file.originalname).toLowerCase() || '.jpg';
      
      // Create filename
      const filename = `${public_id}${fileExtension}`;
      const filepath = path.join(uploadDir, filename);
      
      // Write the file
      fs.writeFileSync(filepath, file.buffer);
      
      // Add to results
      imageResults.push({
        url: `/api/images/${public_id}`,
        public_id: public_id,
        name: file.originalname
      });
    }
    
    res.status(200).json({
      success: true,
      data: imageResults
    });
    
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images: ' + error.message
    });
  }
};

// @desc    Get an image by ID
// @route   GET /api/images/:id
// @access  Public
exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find files with this ID (different extensions)
    const files = fs.readdirSync(uploadDir).filter(file => file.startsWith(id));
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Use the first matching file
    const filepath = path.join(uploadDir, files[0]);
    
    // Determine content type based on file extension
    const ext = path.extname(filepath).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    }
    
    // Set content type and send the file
    res.setHeader('Content-Type', contentType);
    res.sendFile(filepath);
    
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting image: ' + error.message
    });
  }
};

// @desc    Delete an image
// @route   DELETE /api/images/:id
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find files with this ID
    const files = fs.readdirSync(uploadDir).filter(file => file.startsWith(id));
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete all matching files
    files.forEach(file => {
      fs.unlinkSync(path.join(uploadDir, file));
    });
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image: ' + error.message
    });
  }
};