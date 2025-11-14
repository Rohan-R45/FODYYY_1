const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    length: [6, 'OTP must be exactly 6 digits']
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration time is required'],
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // TTL index: automatically delete documents after 5 minutes (300 seconds)
  }
}, {
  timestamps: true
});

// Create indexes for better performance
otpSchema.index({ email: 1 });
otpSchema.index({ otp: 1 });
otpSchema.index({ expiresAt: 1 }); // For TTL and expiration queries

// Remove expired OTPs before saving new ones for the same email
otpSchema.pre('save', async function(next) {
  try {
    // Remove any existing unverified OTPs for this email
    await mongoose.model('OTP').deleteMany({
      email: this.email,
      verified: false
    });
    next();
  } catch (error) {
    next(error);
  }
});

// Static method to find valid OTP
otpSchema.statics.findValidOTP = function(email, otp) {
  return this.findOne({
    email: email.toLowerCase(),
    otp: otp,
    verified: false,
    expiresAt: { $gt: new Date() }
  });
};

// Static method to clean expired OTPs (manual cleanup if needed)
otpSchema.statics.cleanExpiredOTPs = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

module.exports = mongoose.model('OTP', otpSchema);