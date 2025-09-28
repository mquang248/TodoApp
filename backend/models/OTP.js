const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['registration', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for automatic cleanup of expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to generate 6-digit OTP
otpSchema.statics.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to verify OTP
otpSchema.statics.verifyOTP = async function(email, code, type) {
  const otp = await this.findOne({
    email: email.toLowerCase(),
    code,
    type,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });

  if (otp) {
    otp.isUsed = true;
    await otp.save();
    return true;
  }
  return false;
};

module.exports = mongoose.model('OTP', otpSchema);
