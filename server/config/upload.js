// server/config/upload.js
const path = require('path');
const fs = require('fs');

// Define upload directory
const uploadDir = path.join(__dirname, '../uploads');

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

module.exports = {
  uploadDir
};