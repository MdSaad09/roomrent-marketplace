// // server/controllers/upload.controller.js
// const cloudinary = require('cloudinary').v2;

// // @desc    Upload an image
// // @route   POST /api/upload/single
// // @access  Private
// exports.uploadImage = async (req, res) => {
//   try {
//     // The file is already uploaded to Cloudinary by multer-storage-cloudinary
//     // We just need to return the details
//     if (!req.file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No file uploaded'
//       });
//     }
    
//     res.status(200).json({
//       success: true,
//       data: {
//         url: req.file.path,
//         public_id: req.file.filename
//       }
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error uploading image',
//       error: error.message
//     });
//   }
// };

// // @desc    Delete an image
// // @route   DELETE /api/upload/:public_id
// // @access  Private
// exports.deleteImage = async (req, res) => {
//   try {
//     const { public_id } = req.params;
    
//     // Delete the image from Cloudinary
//     const result = await cloudinary.uploader.destroy(public_id);
    
//     if (result.result === 'ok') {
//       res.status(200).json({
//         success: true,
//         message: 'Image deleted successfully'
//       });
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Failed to delete image'
//       });
//     }
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting image',
//       error: error.message
//     });
//   }
// };

// server/controllers/upload.controller.js
const fs = require('fs');
const path = require('path');

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create a fully qualified URL for the uploaded file
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    
    console.log('File uploaded, URL:', fileUrl);
    
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
};

// @desc    Delete an image
// @route   DELETE /api/upload/:filename
// @access  Private
exports.deleteImage = async (req, res) => {
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
};