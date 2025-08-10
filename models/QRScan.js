const mongoose = require("mongoose");

const qrScanSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    scannedAt: {
        type: Date,
        default: Date.now
    },
    deviceInfo: {
        type: String
    }
});

module.exports = mongoose.model("QRScan", qrScanSchema);
