const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Add this field to store the original property owner
  originalOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: [true, 'Please add a message'],
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  phone: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'closed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  response: {
    type: String
  },
  respondedAt: {
    type: Date
  },
});

module.exports = mongoose.model('Inquiry', InquirySchema);