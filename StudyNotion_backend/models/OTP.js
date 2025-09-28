const mongoose = require("mongoose");
const mailSender = require("../utils/mailsender");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
    },
    otp: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // OTP expires after 5 minutes
    },
});

async function sendVerificationEmail(email, otp) {
    // Implement email sending logic here using nodemailer or any email service
    try {
        console.log(`Sending OTP ${otp} to email ${email}`);
        const mailresponse = await mailSender(
            email,
            "OTP Verification",
            `Your OTP is ${otp}`
        );
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;