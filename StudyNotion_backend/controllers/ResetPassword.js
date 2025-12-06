const user = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

exports.resetPassword = async(req, res) => {
    try {
        const { email } = req.body;

        const existingUser = await user.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomUUID();
        const updateuser = await user.findOne({ email: email }, { token: token, resetPasswordExpires: Date.now() + 3600000 } // 1 hour
        );

        await mailSender(
            email,
            "Reset Your Password",
            `Click the link to reset your password: ${url}`
        );



        const url = `http://localhost:3000/reset-password/${token}`;
        return res.status(200).json({ message: "Password reset link sent to your email", url });


    } catch (error) {
        console.error("Error in resetPassword middleware:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

//reset password 
exports.resetPassword = async(req, res) => {
    try {
        const { password, conformPassword, token } = req.body;
        const existingUser = await user.findOne({ token: token });
        if (!existingUser) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        if (Date.now() > existingUser.resetPasswordExpires) {
            return res.status(400).json({ message: "Token has expired" });
        }

        if (password !== conformPassword) {
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
}