// server/routes/upload.routes.js
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

// Apply middleware to all routes
router.use(protect);

// Handle single image upload
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    console.log('Received single image upload request');
    
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
    
    console.log('Uploaded file:', {
      filename: req.file.filename,
      url: fileUrl
    });
    
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

// Handle multiple image uploads
router.post('/multiple', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Received multiple image upload request');
    console.log('Files count:', req.files?.length);
    
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

// Delete an image
router.delete('/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    console.log(`File ${filename} deleted successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
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