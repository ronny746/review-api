const mongoose = require('mongoose');

const paymentRecordSchema = new mongoose.Schema({
  packageName: { type: String, required: true },
  paymentDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], required: true }
}, { _id: false });

const paymentInfoSchema = new mongoose.Schema({
  current: { type: paymentRecordSchema, required: false },
  history: { type: [paymentRecordSchema], default: [] }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  businessName: { type: String, required: true },
  phone: { type: String, required: true },
  salesPersonName: { type: String, required: true },
  businessReviewLink: { type: String, required: true },
  serialId: { type: String, required: true },
  businessCategory: { type: String, enum: ['MBGP', 'MBGD'], required: true },
  businessPhoto: { type: String, required: false }, // base64 string
  paymentInfo: { type: paymentInfoSchema, required: false },

  referralCode: { type: String, unique: true }, // user’s own referral code
  referredBy: { type: String, default: null }, // referral code of who referred this user
  referralCount: { type: Number, default: 0 }, // how many people user referred
  referralRewards: { type: Number, default: 0 } // rewards earned (e.g. points or amount)
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
