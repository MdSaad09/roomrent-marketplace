// server/routes/image.routes.js - corrected version
const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure local storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Initialize multer with storage
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

// FIXED: Apply protect middleware to specific routes individually, not with a pattern
router.post('/multiple', protect, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received multiple image upload request from admin');
    console.log('Files:', req.files?.length);
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Create a base URL for the uploaded files
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Map the uploaded files to URLs
    const uploadedImages = req.files.map(file => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      public_id: file.filename
    }));
    
    console.log('Uploaded images:', uploadedImages);
    
    res.status(200).json({
      success: true,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

// Apply protect middleware to specific routes individually
router.post('/single', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Received single image upload request from admin');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create a URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      data: {
        url: fileUrl,
        public_id: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Delete route with protect middleware
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Find files that match this ID
    const files = fs.readdirSync(uploadDir).filter(file => 
      file === id || file.startsWith(id + '.') || file.startsWith(id + '-')
    );
    
    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    // Delete all matching files
    let deletedCount = 0;
    for (const file of files) {
      fs.unlinkSync(path.join(uploadDir, file));
      deletedCount++;
    }
    
    console.log(`Deleted ${deletedCount} files matching ID: ${id}`);
    
    res.status(200).json({
      success: true,
      message: `Image(s) deleted successfully (${deletedCount} files)`
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
});

module.exports = router;