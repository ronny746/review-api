const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateReferralCode = require('../utils/referralCode');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const { sendSuccess, sendError } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const {
      email,
      password,
      businessName,
      phone,
      salesPersonName,
      businessReviewLink,
      serialId,
      businessCategory,
      businessPhoto,
      paymentInfo,
      referralCodeUsed
    } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password required', null, 400);
    }

    const existing = await User.findOne({ email });
    if (existing) return sendError(res, 'User already exists', null, 400);

    const passwordHash = await bcrypt.hash(password, 10);

    let newReferralCode;
    do {
      newReferralCode = generateReferralCode(8);
    } while (await User.findOne({ referralCode: newReferralCode }));

    let referredBy = null;
    if (referralCodeUsed) {
      const refUser = await User.findOne({ referralCode: referralCodeUsed });
      if (refUser) {
        referredBy = refUser.referralCode;
        refUser.referralCount = (refUser.referralCount || 0) + 1;
        refUser.referralRewards = (refUser.referralRewards || 0) + 10;
        await refUser.save();
      }
    }

    const user = new User({
      email,
      passwordHash,
      businessName,
      phone,
      salesPersonName,
      businessReviewLink,
      serialId,
      businessCategory,
      businessPhoto,
      paymentInfo,
      referralCode: newReferralCode,
      referredBy,
      referralCount: 0,
      referralRewards: 0,
    });

    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    sendSuccess(res, 'User registered successfully', { user, token }, 200);

  } catch (error) {
    sendError(res, 'Register error', error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return sendError(res, 'Email and password required', null, 400);

    const user = await User.findOne({ email });
    if (!user)
      return sendError(res, 'Invalid credentials', null, 400);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return sendError(res, 'Invalid credentials', null, 400);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    sendSuccess(res, 'User login successfully', { user, token }, 200);

  } catch (error) {
    sendError(res, 'Login error', error.message, 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return sendError(res, 'User not found', null, 404);

    sendSuccess(res, 'User profile fetched successfully', user, 200);
  } catch (error) {
    sendError(res, 'Get profile error', error.message, 500);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return sendError(res, 'Both old and new passwords required', null, 400);

    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 'User not found', null, 404);

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return sendError(res, 'Old password incorrect', null, 400);

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendSuccess(res, 'Password changed successfully', null, 200);
  } catch (error) {
    sendError(res, 'Change password error', error.message, 500);
  }
};

exports.updatePaymentInfo = async (req, res) => {
  try {
    const { current, history } = req.body;

    if (current) {
      const { packageName, paymentDate, expiryDate, status } = current;
      if (!packageName || !paymentDate || !expiryDate || !status) {
        return sendError(res, 'Incomplete current payment info', null, 400);
      }
    }

    const user = await User.findById(req.userId);
    if (!user) return sendError(res, 'User not found', null, 404);

    if (current && user.paymentInfo?.current) {
      user.paymentInfo.history = user.paymentInfo.history || [];
      user.paymentInfo.history.push(user.paymentInfo.current);
    }

    user.paymentInfo = user.paymentInfo || {};
    if (current) user.paymentInfo.current = current;
    if (history) user.paymentInfo.history = history;

    await user.save();
    sendSuccess(res, 'Payment info updated successfully', null, 200);
  } catch (error) {
    sendError(res, 'Update payment info error', error.message, 500);
  }
};
exports.editProfile = async (req, res) => {
  try {
    const userId = req.userId; // Middleware se milega

    // Sirf allowed fields hi update hon
    const allowedFields = [
      'businessName',
      'phone',
      'salesPersonName',
      'businessReviewLink',
      'serialId',
      'businessCategory',
      'businessPhoto'
    ];

    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return sendError(res, 'No valid fields provided for update', null, 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash'); // password hash hide rakho

    if (!updatedUser) {
      return sendError(res, 'User not found', null, 404);
    }

    sendSuccess(res, 'Profile updated successfully', updatedUser, 200);
  } catch (error) {
    sendError(res, 'Error updating profile', error.message, 500);
  }
};