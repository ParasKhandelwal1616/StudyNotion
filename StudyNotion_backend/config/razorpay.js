const Razorpay = require('razorpay');

exports.instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secrete: process.env.RAZORPAY_SECREATE,
});