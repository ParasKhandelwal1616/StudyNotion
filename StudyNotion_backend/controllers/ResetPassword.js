const User = require("../models/User");
const mailSender = require("../utils/mailsender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

exports.resetPasswordToken = async(req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomUUID();
        await User.findOneAndUpdate({ email: email }, { token: token, resetPasswordExpires: Date.now() + 3600000 }, // 1 hour
            { new: true }
        );

        const url = `http://localhost:3000/reset-password/${token}`;
        await mailSender(
            email,
            "Reset Your Password",
            `Click the link to reset your password: ${url}`
        );

        return res.status(200).json({ message: "Password reset link sent to your email", url });
    } catch (error) {
        console.error("Error in resetPasswordToken middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.resetPassword = async(req, res) => {
    try {
        const { password, confirmPassword, token } = req.body;
        const existingUser = await User.findOne({ token: token });
        if (!existingUser) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        if (Date.now() > existingUser.resetPasswordExpires) {
            return res.status(400).json({ message: "Token has expired" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //update password
        existingUser.password = hashedPassword;
        existingUser.token = undefined;
        existingUser.resetPasswordExpires = undefined;
        await existingUser.save();

        return res.status(200).json({ message: "Password reset successful" });

    } catch (error) {
        console.error("Error in resetPassword controller:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};