const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateReferralCode = require('../utils/referralCode');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

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
      referralCodeUsed // referral code from new user (optional)
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique referral code
    let newReferralCode;
    do {
      newReferralCode = generateReferralCode(8);
    } while (await User.findOne({ referralCode: newReferralCode }));

    // If referralCodeUsed provided, find the user who owns it
    let referredBy = null;
    if (referralCodeUsed) {
      const refUser = await User.findOne({ referralCode: referralCodeUsed });
      if (refUser) {
        referredBy = refUser.referralCode;

        // Increment refUser's referral count & optionally rewards
        refUser.referralCount = (refUser.referralCount || 0) + 1;
        refUser.referralRewards = (refUser.referralRewards || 0) + 10; // example reward points
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

    res.json({ message: 'User registered', referralCode: newReferralCode });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid)
      return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      return res.status(400).json({ error: 'Both old and new passwords required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Old password incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Optional: API to update payment info (admin or user action)
exports.updatePaymentInfo = async (req, res) => {
  try {
    const { current, history } = req.body; // partial or full paymentInfo object

    // Validate current payment info if provided
    if (current) {
      const { packageName, paymentDate, expiryDate, status } = current;
      if (!packageName || !paymentDate || !expiryDate || !status) {
        return res.status(400).json({ error: 'Incomplete current payment info' });
      }
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // If updating current, push old current to history first
    if (current && user.paymentInfo?.current) {
      user.paymentInfo.history = user.paymentInfo.history || [];
      user.paymentInfo.history.push(user.paymentInfo.current);
    }

    user.paymentInfo = user.paymentInfo || {};
    if (current) user.paymentInfo.current = current;
    if (history) user.paymentInfo.history = history;

    await user.save();
    res.json({ message: 'Payment info updated' });
  } catch (error) {
    console.error('Update payment info error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
