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
  }
});

module.exports = mongoose.model('Inquiry', InquirySchema);