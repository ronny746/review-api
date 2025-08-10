const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/response');

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('referralCode referralCount referralRewards');
    
    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }

    sendSuccess(res, 'Referral stats fetched successfully', {
      referralCode: user.referralCode,
      // referralCount: user.referralCount,
      // referralRewards: user.referralRewards
    }, 200);

  } catch (error) {
    sendError(res, 'Error fetching referral stats', error.message, 500);
  }
};
