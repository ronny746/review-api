const User = require('../models/User');

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('referralCode referralCount referralRewards');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      referralCode: user.referralCode,
    //   referralCount: user.referralCount,
    //   referralRewards: user.referralRewards,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
